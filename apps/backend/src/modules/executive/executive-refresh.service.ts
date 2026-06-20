import { RecomendacaoStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { aggregateFinancialSnapshot } from '../finance/financial-aggregator.service.js';
import { generateAlerts } from './alert.engine.js';
import { calculateAuraIndex } from './aura-index.engine.js';
import { generateRecommendations } from './recommendation.engine.js';

export async function refreshExecutiveAnalysis(empresaId: string) {
  const snapshot = await aggregateFinancialSnapshot(empresaId);
  const index = calculateAuraIndex(snapshot);
  const alerts = generateAlerts(snapshot);
  const recommendations = generateRecommendations(snapshot);
  const now = new Date();

  await prisma.$transaction([
    prisma.auraAlerta.updateMany({
      where: { empresaId, deletedAt: null, origem: { startsWith: 'regra:' } },
      data: { deletedAt: now },
    }),
    prisma.auraRecomendacao.updateMany({
      where: { empresaId, deletedAt: null, status: RecomendacaoStatus.ATIVA, origem: { startsWith: 'regra:' } },
      data: { status: RecomendacaoStatus.CONCLUIDA },
    }),
    prisma.auraIndice.create({
      data: {
        empresaId,
        score: index.score,
        classificacao: index.classificacao,
        contasVencidas: snapshot.contasVencidas,
        contasAVencer: snapshot.contasAVencer,
        liquidez: snapshot.liquidez,
        recebimentos: snapshot.recebimentos,
        pagamentos: snapshot.pagamentos,
        fluxoProjetado: index.fluxoProjetado,
        componentes: index.componentes,
        periodoDias: snapshot.periodoDias,
      },
    }),
    ...alerts.map((alert) => prisma.auraAlerta.create({ data: { empresaId, ...alert } })),
    ...recommendations.map((item) => prisma.auraRecomendacao.create({ data: { empresaId, ...item } })),
  ]);
  return { snapshot, index, alerts, recommendations };
}

