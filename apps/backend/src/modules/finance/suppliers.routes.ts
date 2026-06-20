import { Router } from 'express';
import { authenticate } from '../../http/middlewares/authenticate.js';
import { authorize } from '../../http/middlewares/authorize.js';
import { AppError } from '../../http/app-error.js';
import { ok } from '../../http/response.js';
import { prisma } from '../../lib/prisma.js';
import { audit } from '../audit/audit.service.js';
import { idParamsSchema, listQuerySchema, partyCreateSchema, partyUpdateSchema } from './finance.schemas.js';

export const suppliersRouter = Router();
suppliersRouter.use(authenticate);

suppliersRouter.get('/', authorize('fornecedores', 'visualizar'), async (req, res) => {
  const query = listQuerySchema.parse(req.query);
  const where = { empresaId: req.auth!.empresaId, deletedAt: null, ...(query.q ? { nome: { contains: query.q, mode: 'insensitive' as const } } : {}) };
  const [items, total] = await Promise.all([
    prisma.fornecedor.findMany({ where, orderBy: { nome: 'asc' }, skip: (query.page - 1) * query.limit, take: query.limit }),
    prisma.fornecedor.count({ where }),
  ]);
  ok(res, { items, total, page: query.page, limit: query.limit });
});

suppliersRouter.get('/:id', authorize('fornecedores', 'visualizar'), async (req, res) => {
  const { id } = idParamsSchema.parse(req.params);
  const item = await prisma.fornecedor.findFirst({ where: { id, empresaId: req.auth!.empresaId, deletedAt: null } });
  if (!item) throw new AppError(404, 'SUPPLIER_NOT_FOUND', 'Fornecedor não encontrado.');
  ok(res, item);
});

suppliersRouter.post('/', authorize('fornecedores', 'criar'), async (req, res) => {
  const input = partyCreateSchema.parse(req.body);
  const item = await prisma.fornecedor.create({ data: { ...input, empresaId: req.auth!.empresaId } });
  await audit({ empresaId: req.auth!.empresaId, usuarioId: req.auth!.usuarioId, acao: 'CRIACAO', tabela: 'fornecedores', registroId: item.id, dados: input, requestId: req.requestId });
  ok(res, item, 201);
});

suppliersRouter.put('/:id', authorize('fornecedores', 'editar'), async (req, res) => {
  const { id } = idParamsSchema.parse(req.params);
  const input = partyUpdateSchema.parse(req.body);
  const exists = await prisma.fornecedor.findFirst({ where: { id, empresaId: req.auth!.empresaId, deletedAt: null }, select: { id: true } });
  if (!exists) throw new AppError(404, 'SUPPLIER_NOT_FOUND', 'Fornecedor não encontrado.');
  const item = await prisma.fornecedor.update({ where: { id }, data: input });
  await audit({ empresaId: req.auth!.empresaId, usuarioId: req.auth!.usuarioId, acao: 'EDICAO', tabela: 'fornecedores', registroId: id, dados: input, requestId: req.requestId });
  ok(res, item);
});

suppliersRouter.delete('/:id', authorize('fornecedores', 'excluir'), async (req, res) => {
  const { id } = idParamsSchema.parse(req.params);
  const result = await prisma.fornecedor.updateMany({ where: { id, empresaId: req.auth!.empresaId, deletedAt: null }, data: { deletedAt: new Date() } });
  if (!result.count) throw new AppError(404, 'SUPPLIER_NOT_FOUND', 'Fornecedor não encontrado.');
  await audit({ empresaId: req.auth!.empresaId, usuarioId: req.auth!.usuarioId, acao: 'EXCLUSAO', tabela: 'fornecedores', registroId: id, requestId: req.requestId });
  ok(res, { message: 'Fornecedor excluído.' });
});

