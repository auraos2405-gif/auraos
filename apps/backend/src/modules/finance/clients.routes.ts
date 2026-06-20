import { Router } from 'express';
import { authenticate } from '../../http/middlewares/authenticate.js';
import { authorize } from '../../http/middlewares/authorize.js';
import { AppError } from '../../http/app-error.js';
import { ok } from '../../http/response.js';
import { prisma } from '../../lib/prisma.js';
import { audit } from '../audit/audit.service.js';
import { idParamsSchema, listQuerySchema, partyCreateSchema, partyUpdateSchema } from './finance.schemas.js';

export const clientsRouter = Router();
clientsRouter.use(authenticate);

clientsRouter.get('/', authorize('clientes', 'visualizar'), async (req, res) => {
  const query = listQuerySchema.parse(req.query);
  const where = { empresaId: req.auth!.empresaId, deletedAt: null, ...(query.q ? { nome: { contains: query.q, mode: 'insensitive' as const } } : {}) };
  const [items, total] = await Promise.all([
    prisma.cliente.findMany({ where, orderBy: { nome: 'asc' }, skip: (query.page - 1) * query.limit, take: query.limit }),
    prisma.cliente.count({ where }),
  ]);
  ok(res, { items, total, page: query.page, limit: query.limit });
});

clientsRouter.get('/:id', authorize('clientes', 'visualizar'), async (req, res) => {
  const { id } = idParamsSchema.parse(req.params);
  const item = await prisma.cliente.findFirst({ where: { id, empresaId: req.auth!.empresaId, deletedAt: null } });
  if (!item) throw new AppError(404, 'CLIENT_NOT_FOUND', 'Cliente não encontrado.');
  ok(res, item);
});

clientsRouter.post('/', authorize('clientes', 'criar'), async (req, res) => {
  const input = partyCreateSchema.parse(req.body);
  const item = await prisma.cliente.create({ data: { ...input, empresaId: req.auth!.empresaId } });
  await audit({ empresaId: req.auth!.empresaId, usuarioId: req.auth!.usuarioId, acao: 'CRIACAO', tabela: 'clientes', registroId: item.id, dados: input, requestId: req.requestId });
  ok(res, item, 201);
});

clientsRouter.put('/:id', authorize('clientes', 'editar'), async (req, res) => {
  const { id } = idParamsSchema.parse(req.params);
  const input = partyUpdateSchema.parse(req.body);
  const exists = await prisma.cliente.findFirst({ where: { id, empresaId: req.auth!.empresaId, deletedAt: null }, select: { id: true } });
  if (!exists) throw new AppError(404, 'CLIENT_NOT_FOUND', 'Cliente não encontrado.');
  const item = await prisma.cliente.update({ where: { id }, data: input });
  await audit({ empresaId: req.auth!.empresaId, usuarioId: req.auth!.usuarioId, acao: 'EDICAO', tabela: 'clientes', registroId: id, dados: input, requestId: req.requestId });
  ok(res, item);
});

clientsRouter.delete('/:id', authorize('clientes', 'excluir'), async (req, res) => {
  const { id } = idParamsSchema.parse(req.params);
  const result = await prisma.cliente.updateMany({ where: { id, empresaId: req.auth!.empresaId, deletedAt: null }, data: { deletedAt: new Date() } });
  if (!result.count) throw new AppError(404, 'CLIENT_NOT_FOUND', 'Cliente não encontrado.');
  await audit({ empresaId: req.auth!.empresaId, usuarioId: req.auth!.usuarioId, acao: 'EXCLUSAO', tabela: 'clientes', registroId: id, requestId: req.requestId });
  ok(res, { message: 'Cliente excluído.' });
});

