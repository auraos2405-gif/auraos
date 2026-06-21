import { RecomendacaoStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../http/app-error.js';

const severityOrder = { CRITICA: 4, ALTA: 3, MEDIA: 2, BAIXA: 1 } as const;

export async function getExecutiveDashboard(empresaId: string) {
  const [indices, alerts, recommendations] = await Promise.all([
    prisma.auraIndice.findMany({
      where: { empresaId, deletedAt: null },
      orderBy: { calculadoEm: 'desc' },
      take: 2,
    }),
    prisma.auraAlerta.findMany({
      where: { empresaId, deletedAt: null, lido: false },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
    prisma.auraRecomendacao.findMany({
      where: { empresaId, deletedAt: null, status: RecomendacaoStatus.ATIVA },
      orderBy: [{ prioridade: 'desc' }, { createdAt: 'desc' }],
      take: 3,
    }),
  ]);

  const current = indices[0];
  if (!current) return { available: false as const };
  const previous = indices[1];
  const sortedAlerts = alerts.sort((a, b) => severityOrder[b.severidade] - severityOrder[a.severidade]);

  return {
    available: true as const,
    indiceAura: {
      score: current.score,
      classificacao: current.classificacao,
      tendencia: previous ? current.score - previous.score : 0,
      calculadoEm: current.calculadoEm,
    },
    resumo: {
      fluxoCaixa: Number(current.fluxoProjetado),
      liquidez: Number(current.liquidez),
      contasPagar: { quantidade: current.contasAVencer + current.contasVencidas, valor: Number(current.pagamentos) },
      contasReceber: { valor: Number(current.recebimentos) },
      contasVencidas: current.contasVencidas,
      periodoDias: current.periodoDias,
    },
    alertas: sortedAlerts.map((alert) => ({
      id: alert.id,
      titulo: alert.titulo,
      descricao: alert.descricao,
      severidade: alert.severidade,
      createdAt: alert.createdAt,
    })),
    recomendacoes: recommendations.map((item) => ({
      id: item.id,
      titulo: item.titulo,
      observacao: item.observacao,
      impacto: item.impacto,
      recomendacao: item.recomendacao,
      confidenceScore: Number(item.confidenceScore),
      origem: item.origem,
    })),
  };
}

export async function markAlertAsRead(empresaId: string, alertId: string) {
  const result = await prisma.auraAlerta.updateMany({
    where: { id: alertId, empresaId, deletedAt: null },
    data: { lido: true },
  });
  if (result.count === 0) throw new AppError(404, 'ALERT_NOT_FOUND', 'Alerta não encontrado.');
}

