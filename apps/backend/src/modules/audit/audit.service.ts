import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';

type AuditInput = {
  empresaId: string;
  usuarioId?: string;
  acao: string;
  tabela: string;
  registroId?: string;
  dados?: Prisma.InputJsonValue;
  ip?: string;
  userAgent?: string;
  requestId?: string;
};

export async function audit(input: AuditInput) {
  await prisma.auditoria.create({ data: input });
}

