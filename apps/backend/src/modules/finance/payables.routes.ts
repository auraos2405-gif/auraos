import { Router } from 'express';
import { authenticate } from '../../http/middlewares/authenticate.js';
import { authorize } from '../../http/middlewares/authorize.js';
import { AppError } from '../../http/app-error.js';
import { ok } from '../../http/response.js';
import { prisma } from '../../lib/prisma.js';
import { audit } from '../audit/audit.service.js';
import { refreshExecutiveAnalysis } from '../executive/executive-refresh.service.js';
import { idParamsSchema, listQuerySchema, payableCreateSchema, payableUpdateSchema } from './finance.schemas.js';

export const payablesRouter = Router();
payablesRouter.use(authenticate);

function normalizedStatus(status: 'PENDENTE' | 'PAGO' | 'VENCIDO' | 'CANCELADO', due: Date) {
  if (status === 'PAGO' || status === 'CANCELADO') return status;
  return due < new Date(new Date().toISOString().slice(0, 10)) ? 'VENCIDO' : 'PENDENTE';
}

function serialize<T extends { valor: unknown }>(item: T) {
  return { ...item, valor: Number(item.valor) };
}

async function validateReferences(empresaId: string, fornecedorId: string, categoriaId: string) {
  const [supplier, category] = await Promise.all([
    prisma.fornecedor.findFirst({ where: { id: fornecedorId, empresaId, deletedAt: null }, select: { id: true } }),
    prisma.categoria.findFirst({ where: { id: categoriaId, empresaId, tipo: 'DESPESA', ativo: true, deletedAt: null }, select: { id: true } }),
  ]);
  if (!supplier) throw new AppError(422, 'INVALID_SUPPLIER', 'Fornecedor inválido para esta empresa.');
  if (!category) throw new AppError(422, 'INVALID_CATEGORY', 'Categoria de despesa inválida para esta empresa.');
}

payablesRouter.get('/', authorize('contas_pagar', 'visualizar'), async (req, res) => {
  const query = listQuerySchema.parse(req.query);
  const allowed = ['PENDENTE', 'PAGO', 'VENCIDO', 'CANCELADO'];
  const where = {
    empresaId: req.auth!.empresaId,
    deletedAt: null,
    ...(query.q ? { descricao: { contains: query.q, mode: 'insensitive' as const } } : {}),
    ...(query.status && allowed.includes(query.status) ? { status: query.status as 'PENDENTE' | 'PAGO' | 'VENCIDO' | 'CANCELADO' } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.contaPagar.findMany({ where, include: { fornecedor: { select: { id: true, nome: true } }, categoria: { select: { id: true, nome: true } } }, orderBy: { vencimento: 'asc' }, skip: (query.page - 1) * query.limit, take: query.limit }),
    prisma.contaPagar.count({ where }),
  ]);
  ok(res, { items: items.map(serialize), total, page: query.page, limit: query.limit });
});

payablesRouter.get('/:id', authorize('contas_pagar', 'visualizar'), async (req, res) => {
  const { id } = idParamsSchema.parse(req.params);
  const item = await prisma.contaPagar.findFirst({ where: { id, empresaId: req.auth!.empresaId, deletedAt: null }, include: { fornecedor: true, categoria: true } });
  if (!item) throw new AppError(404, 'PAYABLE_NOT_FOUND', 'Conta a pagar não encontrada.');
  ok(res, serialize(item));
});

payablesRouter.post('/', authorize('contas_pagar', 'criar'), async (req, res) => {
  const input = payableCreateSchema.parse(req.body);
  await validateReferences(req.auth!.empresaId, input.fornecedorId, input.categoriaId);
  const item = await prisma.contaPagar.create({ data: { ...input, status: normalizedStatus(input.status, input.vencimento), empresaId: req.auth!.empresaId } });
  await refreshExecutiveAnalysis(req.auth!.empresaId);
  await audit({ empresaId: req.auth!.empresaId, usuarioId: req.auth!.usuarioId, acao: 'CRIACAO', tabela: 'contas_pagar', registroId: item.id, dados: JSON.parse(JSON.stringify(input)), requestId: req.requestId });
  ok(res, serialize(item), 201);
});

payablesRouter.put('/:id', authorize('contas_pagar', 'editar'), async (req, res) => {
  const { id } = idParamsSchema.parse(req.params);
  const input = payableUpdateSchema.parse(req.body);
  const current = await prisma.contaPagar.findFirst({ where: { id, empresaId: req.auth!.empresaId, deletedAt: null } });
  if (!current) throw new AppError(404, 'PAYABLE_NOT_FOUND', 'Conta a pagar não encontrada.');
  await validateReferences(req.auth!.empresaId, input.fornecedorId ?? current.fornecedorId, input.categoriaId ?? current.categoriaId);
  const due = input.vencimento ?? current.vencimento;
  const status = normalizedStatus(input.status ?? current.status, due);
  const item = await prisma.contaPagar.update({ where: { id }, data: { ...input, status } });
  await refreshExecutiveAnalysis(req.auth!.empresaId);
  await audit({ empresaId: req.auth!.empresaId, usuarioId: req.auth!.usuarioId, acao: status === 'PAGO' && current.status !== 'PAGO' ? 'PAGAMENTO' : 'EDICAO', tabela: 'contas_pagar', registroId: id, dados: JSON.parse(JSON.stringify(input)), requestId: req.requestId });
  ok(res, serialize(item));
});

payablesRouter.delete('/:id', authorize('contas_pagar', 'excluir'), async (req, res) => {
  const { id } = idParamsSchema.parse(req.params);
  const result = await prisma.contaPagar.updateMany({ where: { id, empresaId: req.auth!.empresaId, deletedAt: null }, data: { deletedAt: new Date() } });
  if (!result.count) throw new AppError(404, 'PAYABLE_NOT_FOUND', 'Conta a pagar não encontrada.');
  await refreshExecutiveAnalysis(req.auth!.empresaId);
  await audit({ empresaId: req.auth!.empresaId, usuarioId: req.auth!.usuarioId, acao: 'EXCLUSAO', tabela: 'contas_pagar', registroId: id, requestId: req.requestId });
  ok(res, { message: 'Conta a pagar excluída.' });
});

