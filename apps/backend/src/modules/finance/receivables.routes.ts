import { Router } from 'express';
import { authenticate } from '../../http/middlewares/authenticate.js';
import { authorize } from '../../http/middlewares/authorize.js';
import { AppError } from '../../http/app-error.js';
import { ok } from '../../http/response.js';
import { prisma } from '../../lib/prisma.js';
import { audit } from '../audit/audit.service.js';
import { refreshExecutiveAnalysis } from '../executive/executive-refresh.service.js';
import { idParamsSchema, listQuerySchema, receivableCreateSchema, receivableUpdateSchema } from './finance.schemas.js';

export const receivablesRouter = Router();
receivablesRouter.use(authenticate);

function normalizedStatus(status: 'PENDENTE' | 'RECEBIDO' | 'VENCIDO' | 'CANCELADO', due: Date) {
  if (status === 'RECEBIDO' || status === 'CANCELADO') return status;
  return due < new Date(new Date().toISOString().slice(0, 10)) ? 'VENCIDO' : 'PENDENTE';
}

function serialize<T extends { valor: unknown }>(item: T) {
  return { ...item, valor: Number(item.valor) };
}

async function validateReferences(empresaId: string, clienteId: string, categoriaId: string) {
  const [client, category] = await Promise.all([
    prisma.cliente.findFirst({ where: { id: clienteId, empresaId, deletedAt: null }, select: { id: true } }),
    prisma.categoria.findFirst({ where: { id: categoriaId, empresaId, tipo: 'RECEITA', ativo: true, deletedAt: null }, select: { id: true } }),
  ]);
  if (!client) throw new AppError(422, 'INVALID_CLIENT', 'Cliente inválido para esta empresa.');
  if (!category) throw new AppError(422, 'INVALID_CATEGORY', 'Categoria de receita inválida para esta empresa.');
}

receivablesRouter.get('/', authorize('contas_receber', 'visualizar'), async (req, res) => {
  const query = listQuerySchema.parse(req.query);
  const allowed = ['PENDENTE', 'RECEBIDO', 'VENCIDO', 'CANCELADO'];
  const where = {
    empresaId: req.auth!.empresaId,
    deletedAt: null,
    ...(query.q ? { descricao: { contains: query.q, mode: 'insensitive' as const } } : {}),
    ...(query.status && allowed.includes(query.status) ? { status: query.status as 'PENDENTE' | 'RECEBIDO' | 'VENCIDO' | 'CANCELADO' } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.contaReceber.findMany({ where, include: { cliente: { select: { id: true, nome: true } }, categoria: { select: { id: true, nome: true } } }, orderBy: { vencimento: 'asc' }, skip: (query.page - 1) * query.limit, take: query.limit }),
    prisma.contaReceber.count({ where }),
  ]);
  ok(res, { items: items.map(serialize), total, page: query.page, limit: query.limit });
});

receivablesRouter.get('/:id', authorize('contas_receber', 'visualizar'), async (req, res) => {
  const { id } = idParamsSchema.parse(req.params);
  const item = await prisma.contaReceber.findFirst({ where: { id, empresaId: req.auth!.empresaId, deletedAt: null }, include: { cliente: true, categoria: true } });
  if (!item) throw new AppError(404, 'RECEIVABLE_NOT_FOUND', 'Conta a receber não encontrada.');
  ok(res, serialize(item));
});

receivablesRouter.post('/', authorize('contas_receber', 'criar'), async (req, res) => {
  const input = receivableCreateSchema.parse(req.body);
  await validateReferences(req.auth!.empresaId, input.clienteId, input.categoriaId);
  const item = await prisma.contaReceber.create({ data: { ...input, status: normalizedStatus(input.status, input.vencimento), empresaId: req.auth!.empresaId } });
  await refreshExecutiveAnalysis(req.auth!.empresaId);
  await audit({ empresaId: req.auth!.empresaId, usuarioId: req.auth!.usuarioId, acao: 'CRIACAO', tabela: 'contas_receber', registroId: item.id, dados: JSON.parse(JSON.stringify(input)), requestId: req.requestId });
  ok(res, serialize(item), 201);
});

receivablesRouter.put('/:id', authorize('contas_receber', 'editar'), async (req, res) => {
  const { id } = idParamsSchema.parse(req.params);
  const input = receivableUpdateSchema.parse(req.body);
  const current = await prisma.contaReceber.findFirst({ where: { id, empresaId: req.auth!.empresaId, deletedAt: null } });
  if (!current) throw new AppError(404, 'RECEIVABLE_NOT_FOUND', 'Conta a receber não encontrada.');
  await validateReferences(req.auth!.empresaId, input.clienteId ?? current.clienteId, input.categoriaId ?? current.categoriaId);
  const due = input.vencimento ?? current.vencimento;
  const status = normalizedStatus(input.status ?? current.status, due);
  const item = await prisma.contaReceber.update({ where: { id }, data: { ...input, status } });
  await refreshExecutiveAnalysis(req.auth!.empresaId);
  await audit({ empresaId: req.auth!.empresaId, usuarioId: req.auth!.usuarioId, acao: status === 'RECEBIDO' && current.status !== 'RECEBIDO' ? 'RECEBIMENTO' : 'EDICAO', tabela: 'contas_receber', registroId: id, dados: JSON.parse(JSON.stringify(input)), requestId: req.requestId });
  ok(res, serialize(item));
});

receivablesRouter.delete('/:id', authorize('contas_receber', 'excluir'), async (req, res) => {
  const { id } = idParamsSchema.parse(req.params);
  const result = await prisma.contaReceber.updateMany({ where: { id, empresaId: req.auth!.empresaId, deletedAt: null }, data: { deletedAt: new Date() } });
  if (!result.count) throw new AppError(404, 'RECEIVABLE_NOT_FOUND', 'Conta a receber não encontrada.');
  await refreshExecutiveAnalysis(req.auth!.empresaId);
  await audit({ empresaId: req.auth!.empresaId, usuarioId: req.auth!.usuarioId, acao: 'EXCLUSAO', tabela: 'contas_receber', registroId: id, requestId: req.requestId });
  ok(res, { message: 'Conta a receber excluída.' });
});

