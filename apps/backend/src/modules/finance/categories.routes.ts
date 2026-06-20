import { Router } from 'express';
import { authenticate } from '../../http/middlewares/authenticate.js';
import { authorize } from '../../http/middlewares/authorize.js';
import { AppError } from '../../http/app-error.js';
import { ok } from '../../http/response.js';
import { prisma } from '../../lib/prisma.js';
import { audit } from '../audit/audit.service.js';
import { categoriaCreateSchema, categoriaUpdateSchema, idParamsSchema, listQuerySchema } from './finance.schemas.js';

export const categoriesRouter = Router();
categoriesRouter.use(authenticate);

categoriesRouter.get('/', authorize('categorias', 'visualizar'), async (req, res) => {
  const query = listQuerySchema.parse(req.query);
  const where = {
    empresaId: req.auth!.empresaId,
    deletedAt: null,
    ...(query.q ? { nome: { contains: query.q, mode: 'insensitive' as const } } : {}),
    ...(query.tipo === 'RECEITA' || query.tipo === 'DESPESA' ? { tipo: query.tipo as 'RECEITA' | 'DESPESA' } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.categoria.findMany({ where, orderBy: { nome: 'asc' }, skip: (query.page - 1) * query.limit, take: query.limit }),
    prisma.categoria.count({ where }),
  ]);
  ok(res, { items, total, page: query.page, limit: query.limit });
});

categoriesRouter.get('/:id', authorize('categorias', 'visualizar'), async (req, res) => {
  const { id } = idParamsSchema.parse(req.params);
  const item = await prisma.categoria.findFirst({ where: { id, empresaId: req.auth!.empresaId, deletedAt: null } });
  if (!item) throw new AppError(404, 'CATEGORY_NOT_FOUND', 'Categoria não encontrada.');
  ok(res, item);
});

categoriesRouter.post('/', authorize('categorias', 'criar'), async (req, res) => {
  const input = categoriaCreateSchema.parse(req.body);
  const item = await prisma.categoria.create({ data: { ...input, empresaId: req.auth!.empresaId } });
  await audit({ empresaId: req.auth!.empresaId, usuarioId: req.auth!.usuarioId, acao: 'CRIACAO', tabela: 'categorias', registroId: item.id, dados: input, requestId: req.requestId });
  ok(res, item, 201);
});

categoriesRouter.put('/:id', authorize('categorias', 'editar'), async (req, res) => {
  const { id } = idParamsSchema.parse(req.params);
  const input = categoriaUpdateSchema.parse(req.body);
  const exists = await prisma.categoria.findFirst({ where: { id, empresaId: req.auth!.empresaId, deletedAt: null }, select: { id: true } });
  if (!exists) throw new AppError(404, 'CATEGORY_NOT_FOUND', 'Categoria não encontrada.');
  const item = await prisma.categoria.update({ where: { id }, data: input });
  await audit({ empresaId: req.auth!.empresaId, usuarioId: req.auth!.usuarioId, acao: 'EDICAO', tabela: 'categorias', registroId: id, dados: input, requestId: req.requestId });
  ok(res, item);
});

categoriesRouter.delete('/:id', authorize('categorias', 'excluir'), async (req, res) => {
  const { id } = idParamsSchema.parse(req.params);
  const result = await prisma.categoria.updateMany({ where: { id, empresaId: req.auth!.empresaId, deletedAt: null }, data: { deletedAt: new Date(), ativo: false } });
  if (!result.count) throw new AppError(404, 'CATEGORY_NOT_FOUND', 'Categoria não encontrada.');
  await audit({ empresaId: req.auth!.empresaId, usuarioId: req.auth!.usuarioId, acao: 'EXCLUSAO', tabela: 'categorias', registroId: id, requestId: req.requestId });
  ok(res, { message: 'Categoria excluída.' });
});
