import { z } from 'zod';

const optionalText = (max: number) => z.string().trim().max(max).optional().nullable();
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).transform((value) => new Date(`${value}T00:00:00.000Z`));

export const idParamsSchema = z.object({ id: z.string().uuid() });
export const listQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  status: z.string().optional(),
  tipo: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const categoriaCreateSchema = z.object({
  nome: z.string().trim().min(2).max(100),
  tipo: z.enum(['RECEITA', 'DESPESA']),
  ativo: z.boolean().default(true),
}).strict();
export const categoriaUpdateSchema = categoriaCreateSchema.partial().refine((value) => Object.keys(value).length > 0);

export const partyCreateSchema = z.object({
  nome: z.string().trim().min(2).max(160),
  documento: optionalText(30),
  email: z.string().trim().email().optional().nullable(),
  telefone: optionalText(30),
  observacoes: optionalText(2000),
}).strict();
export const partyUpdateSchema = partyCreateSchema.partial().refine((value) => Object.keys(value).length > 0);

const accountBase = {
  categoriaId: z.string().uuid(),
  descricao: z.string().trim().min(2).max(240),
  valor: z.coerce.number().positive().max(9999999999999.99),
  emissao: dateSchema,
  vencimento: dateSchema,
  observacoes: optionalText(2000),
};

export const payableCreateSchema = z.object({
  ...accountBase,
  fornecedorId: z.string().uuid(),
  status: z.enum(['PENDENTE', 'PAGO', 'VENCIDO', 'CANCELADO']).default('PENDENTE'),
  linhaDigitavel: optionalText(200),
  pixCopiaCola: optionalText(1000),
}).strict();
export const payableUpdateSchema = payableCreateSchema.partial().refine((value) => Object.keys(value).length > 0);

export const receivableCreateSchema = z.object({
  ...accountBase,
  clienteId: z.string().uuid(),
  status: z.enum(['PENDENTE', 'RECEBIDO', 'VENCIDO', 'CANCELADO']).default('PENDENTE'),
}).strict();
export const receivableUpdateSchema = receivableCreateSchema.partial().refine((value) => Object.keys(value).length > 0);

