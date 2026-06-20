import type { ContaPagarStatus, ContaReceberStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import type { FinancialSnapshot } from '../executive/executive.types.js';

type PayableRecord = { valor: number; vencimento: Date; status: ContaPagarStatus };
type ReceivableRecord = { valor: number; vencimento: Date; status: ContaReceberStatus };

function startOfDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function buildFinancialSnapshot(
  payables: PayableRecord[],
  receivables: ReceivableRecord[],
  now = new Date(),
): FinancialSnapshot {
  const today = startOfDay(now);
  const horizon = new Date(today);
  horizon.setUTCDate(horizon.getUTCDate() + 30);
  const activePayables = payables.filter((item) => !['PAGO', 'CANCELADO'].includes(item.status));
  const activeReceivables = receivables.filter((item) => !['RECEBIDO', 'CANCELADO'].includes(item.status));
  const contasVencidas = activePayables.filter((item) => item.vencimento < today).length;
  const contasAVencer = activePayables.filter((item) => item.vencimento >= today && item.vencimento <= horizon).length;
  const pagamentos = activePayables
    .filter((item) => item.vencimento <= horizon)
    .reduce((total, item) => total + item.valor, 0);
  const recebimentos = activeReceivables
    .filter((item) => item.vencimento <= horizon)
    .reduce((total, item) => total + item.valor, 0);
  const totalRecebido = receivables.filter((item) => item.status === 'RECEBIDO').reduce((total, item) => total + item.valor, 0);
  const totalPago = payables.filter((item) => item.status === 'PAGO').reduce((total, item) => total + item.valor, 0);

  return {
    contasVencidas,
    contasAVencer,
    liquidez: totalRecebido - totalPago,
    recebimentos,
    pagamentos,
    periodoDias: 30,
  };
}

export async function aggregateFinancialSnapshot(empresaId: string, now = new Date()) {
  const [payables, receivables] = await Promise.all([
    prisma.contaPagar.findMany({
      where: { empresaId, deletedAt: null },
      select: { valor: true, vencimento: true, status: true },
    }),
    prisma.contaReceber.findMany({
      where: { empresaId, deletedAt: null },
      select: { valor: true, vencimento: true, status: true },
    }),
  ]);
  return buildFinancialSnapshot(
    payables.map((item) => ({ ...item, valor: Number(item.valor) })),
    receivables.map((item) => ({ ...item, valor: Number(item.valor) })),
    now,
  );
}

