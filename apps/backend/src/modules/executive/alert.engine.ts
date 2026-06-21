import type { AlertRuleResult, FinancialSnapshot } from './executive.types.js';

export function generateAlerts(snapshot: FinancialSnapshot): AlertRuleResult[] {
  const alerts: AlertRuleResult[] = [];
  const fluxo = snapshot.liquidez + snapshot.recebimentos - snapshot.pagamentos;

  if (snapshot.contasVencidas > 0) {
    alerts.push({
      titulo: 'Contas vencidas exigem atenção',
      descricao: `${snapshot.contasVencidas} pendência(s) estão fora do prazo.`,
      severidade: snapshot.contasVencidas >= 5 ? 'CRITICA' : 'ALTA',
      origem: 'regra:contas-vencidas:v1',
      evidencia: { contasVencidas: snapshot.contasVencidas },
    });
  }
  if (fluxo < 0) {
    alerts.push({
      titulo: 'Fluxo projetado negativo',
      descricao: 'Os recursos previstos não cobrem os pagamentos do período.',
      severidade: 'CRITICA',
      origem: 'regra:fluxo-negativo:v1',
      evidencia: { fluxoProjetado: fluxo },
    });
  }
  if (snapshot.contasAVencer >= 5) {
    alerts.push({
      titulo: 'Concentração de vencimentos',
      descricao: `${snapshot.contasAVencer} contas vencem no horizonte analisado.`,
      severidade: 'MEDIA',
      origem: 'regra:concentracao-vencimentos:v1',
      evidencia: { contasAVencer: snapshot.contasAVencer },
    });
  }
  return alerts;
}

