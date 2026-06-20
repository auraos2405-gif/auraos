import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';

const prismaMock = {
  permissao: { findFirst: jest.fn() },
  categoria: { findMany: jest.fn(), count: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
  fornecedor: { findFirst: jest.fn() },
  contaPagar: { create: jest.fn() },
};
const auditMock = jest.fn();
const refreshMock = jest.fn();

jest.unstable_mockModule('../src/lib/prisma.js', () => ({ prisma: prismaMock }));
jest.unstable_mockModule('../src/modules/audit/audit.service.js', () => ({ audit: auditMock }));
jest.unstable_mockModule('../src/modules/executive/executive-refresh.service.js', () => ({ refreshExecutiveAnalysis: refreshMock }));

const { categoriesRouter } = await import('../src/modules/finance/categories.routes.js');
const { payablesRouter } = await import('../src/modules/finance/payables.routes.js');
const { requestContext } = await import('../src/http/middlewares/request-context.js');
const { errorHandler } = await import('../src/http/middlewares/error-handler.js');
const { signAccessToken } = await import('../src/lib/jwt.js');

const tenantId = '11111111-1111-4111-8111-111111111111';
const userId = '22222222-2222-4222-8222-222222222222';
const token = signAccessToken({ sub: userId, empresaId: tenantId, email: 'admin@aura.local' });

function app() {
  const instance = express();
  instance.use(express.json());
  instance.use(requestContext);
  instance.use('/categorias', categoriesRouter);
  instance.use('/contas-pagar', payablesRouter);
  instance.use(errorHandler);
  return instance;
}

describe('Finance CRUD and tenant isolation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prismaMock.permissao.findFirst.mockResolvedValue({ id: 'permission' } as never);
  });

  it('scopes category lists to the authenticated tenant', async () => {
    prismaMock.categoria.findMany.mockResolvedValue([] as never);
    prismaMock.categoria.count.mockResolvedValue(0 as never);
    const response = await request(app()).get('/categorias').set('authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(prismaMock.categoria.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ empresaId: tenantId }) }));
  });

  it('creates, updates and soft-deletes a category inside the tenant', async () => {
    const category = { id: '33333333-3333-4333-8333-333333333333', empresaId: tenantId, nome: 'Operacional', tipo: 'DESPESA', ativo: true };
    prismaMock.categoria.create.mockResolvedValue(category as never);
    let response = await request(app()).post('/categorias').set('authorization', `Bearer ${token}`).send({ nome: 'Operacional', tipo: 'DESPESA', ativo: true });
    expect(response.status).toBe(201);
    expect(prismaMock.categoria.create).toHaveBeenCalledWith({ data: expect.objectContaining({ empresaId: tenantId }) });

    prismaMock.categoria.findFirst.mockResolvedValue({ id: category.id } as never);
    prismaMock.categoria.update.mockResolvedValue({ ...category, nome: 'Custos Fixos' } as never);
    response = await request(app()).put(`/categorias/${category.id}`).set('authorization', `Bearer ${token}`).send({ nome: 'Custos Fixos' });
    expect(response.status).toBe(200);

    prismaMock.categoria.updateMany.mockResolvedValue({ count: 1 } as never);
    response = await request(app()).delete(`/categorias/${category.id}`).set('authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(prismaMock.categoria.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ empresaId: tenantId }) }));
  });

  it('rejects attempts to inject empresa_id in payloads', async () => {
    const response = await request(app()).post('/categorias').set('authorization', `Bearer ${token}`).send({ nome: 'Fraude', tipo: 'DESPESA', ativo: true, empresaId: '99999999-9999-4999-8999-999999999999' });
    expect(response.status).toBe(422);
    expect(prismaMock.categoria.create).not.toHaveBeenCalled();
  });

  it('rejects a supplier or category that does not belong to the tenant', async () => {
    prismaMock.fornecedor.findFirst.mockResolvedValue(null as never);
    prismaMock.categoria.findFirst.mockResolvedValue(null as never);
    const response = await request(app()).post('/contas-pagar').set('authorization', `Bearer ${token}`).send({
      fornecedorId: '33333333-3333-4333-8333-333333333333', categoriaId: '44444444-4444-4444-8444-444444444444',
      descricao: 'Conta externa', valor: 100, emissao: '2026-06-18', vencimento: '2026-06-30', status: 'PENDENTE',
    });
    expect(response.status).toBe(422);
    expect(prismaMock.contaPagar.create).not.toHaveBeenCalled();
  });

  it('refreshes the executive analysis after a real financial mutation', async () => {
    prismaMock.fornecedor.findFirst.mockResolvedValue({ id: '33333333-3333-4333-8333-333333333333' } as never);
    prismaMock.categoria.findFirst.mockResolvedValue({ id: '44444444-4444-4444-8444-444444444444' } as never);
    prismaMock.contaPagar.create.mockResolvedValue({
      id: '55555555-5555-4555-8555-555555555555', empresaId: tenantId, descricao: 'Energia', valor: 450,
      vencimento: new Date('2026-06-30T00:00:00.000Z'), status: 'PENDENTE',
    } as never);
    const response = await request(app()).post('/contas-pagar').set('authorization', `Bearer ${token}`).send({
      fornecedorId: '33333333-3333-4333-8333-333333333333', categoriaId: '44444444-4444-4444-8444-444444444444',
      descricao: 'Energia', valor: 450, emissao: '2026-06-18', vencimento: '2026-06-30', status: 'PENDENTE',
    });
    expect(response.status).toBe(201);
    expect(refreshMock).toHaveBeenCalledWith(tenantId);
    expect(auditMock).toHaveBeenCalledWith(expect.objectContaining({ empresaId: tenantId, acao: 'CRIACAO' }));
  });
});
