import type { FinancialSnapshot, RecommendationRuleResult } from './executive.types.js';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function generateRecommendations(snapshot: FinancialSnapshot): RecommendationRuleResult[] {
  const results: RecommendationRuleResult[] = [];
  const fluxo = snapshot.liquidez + snapshot.recebimentos - snapshot.pagamentos;

  if (snapshot.contasVencidas > 0) {
    results.push({
      titulo: 'Regularize as contas vencidas',
      observacao: `Você possui ${snapshot.contasVencidas} ${snapshot.contasVencidas === 1 ? 'conta vencida' : 'contas vencidas'}.`,
      impacto: 'Atrasos podem gerar encargos e comprometer relações com fornecedores.',
      recomendacao: 'Revise as pendências e priorize hoje as obrigações de maior impacto.',
      motivo: 'Existem obrigações financeiras com vencimento ultrapassado.',
      dadosUtilizados: { contasVencidas: snapshot.contasVencidas },
      confidenceScore: 0.98,
      origem: 'regra:contas-vencidas:v1',
      prioridade: 100,
    });
  }

  if (snapshot.contasAVencer > 0) {
    results.push({
      titulo: 'Prepare os próximos pagamentos',
      observacao: `Você possui ${snapshot.contasAVencer} ${snapshot.contasAVencer === 1 ? 'conta vencendo' : 'contas vencendo'} nos próximos dias.`,
      impacto: `${money.format(snapshot.pagamentos)} em pagamentos estão previstos no período.`,
      recomendacao: 'Confira o calendário e reserve liquidez para os compromissos prioritários.',
      motivo: 'Há contas próximas do vencimento no horizonte executivo.',
      dadosUtilizados: { contasAVencer: snapshot.contasAVencer, pagamentos: snapshot.pagamentos },
      confidenceScore: 0.96,
      origem: 'regra:contas-a-vencer:v1',
      prioridade: 80,
    });
  }

  if (fluxo < 0) {
    results.push({
      titulo: 'Proteja o fluxo de caixa',
      observacao: `A projeção de caixa para o período indica déficit de ${money.format(Math.abs(fluxo))}.`,
      impacto: 'A liquidez disponível pode não cobrir todos os pagamentos previstos.',
      recomendacao: 'Antecipe cobranças e renegocie os pagamentos menos críticos.',
      motivo: 'Liquidez e recebimentos projetados são inferiores aos pagamentos.',
      dadosUtilizados: { liquidez: snapshot.liquidez, recebimentos: snapshot.recebimentos, pagamentos: snapshot.pagamentos },
      confidenceScore: 0.94,
      origem: 'regra:fluxo-comprometido:v1',
      prioridade: 95,
    });
  } else {
    results.push({
      titulo: 'Mantenha a disciplina de caixa',
      observacao: `Seu fluxo de caixa está saudável para os próximos ${snapshot.periodoDias ?? 30} dias.`,
      impacto: `A projeção encerra o período com ${money.format(fluxo)} disponíveis.`,
      recomendacao: 'Preserve a reserva e acompanhe diariamente os recebimentos previstos.',
      motivo: 'Liquidez e recebimentos cobrem os pagamentos projetados.',
      dadosUtilizados: { liquidez: snapshot.liquidez, recebimentos: snapshot.recebimentos, pagamentos: snapshot.pagamentos },
      confidenceScore: 0.92,
      origem: 'regra:fluxo-saudavel:v1',
      prioridade: 40,
    });
  }

  return results.sort((a, b) => b.prioridade - a.prioridade);
}

