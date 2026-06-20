import type { AuraClassification, AuraIndexResult, FinancialSnapshot } from './executive.types.js';

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function classifyAuraIndex(score: number): AuraClassification {
  if (score <= 20) return 'CRITICO';
  if (score <= 40) return 'RISCO';
  if (score <= 60) return 'ATENCAO';
  if (score <= 80) return 'SAUDAVEL';
  return 'EXCELENTE';
}

export function calculateAuraIndex(snapshot: FinancialSnapshot): AuraIndexResult {
  const safe = {
    contasVencidas: Math.max(0, snapshot.contasVencidas),
    contasAVencer: Math.max(0, snapshot.contasAVencer),
    liquidez: Math.max(0, snapshot.liquidez),
    recebimentos: Math.max(0, snapshot.recebimentos),
    pagamentos: Math.max(0, snapshot.pagamentos),
  };
  const fluxoProjetado = safe.liquidez + safe.recebimentos - safe.pagamentos;
  const cobertura = safe.pagamentos === 0 ? 1 : (safe.liquidez + safe.recebimentos) / safe.pagamentos;
  const penalidadeVencidas = Math.min(30, safe.contasVencidas * 6);
  const penalidadeAVencer = Math.min(10, safe.contasAVencer * 1.5);
  const penalidadeLiquidez = cobertura >= 1 ? 0 : Math.round((1 - cobertura) * 30);
  const deficitRatio = fluxoProjetado >= 0 || safe.pagamentos === 0 ? 0 : Math.abs(fluxoProjetado) / safe.pagamentos;
  const penalidadeFluxo = Math.round(clamp(deficitRatio * 20, 0, 20));
  const score = Math.round(clamp(100 - penalidadeVencidas - penalidadeAVencer - penalidadeLiquidez - penalidadeFluxo, 0, 100));

  return {
    score,
    classificacao: classifyAuraIndex(score),
    fluxoProjetado,
    componentes: { base: 100, penalidadeVencidas, penalidadeAVencer, penalidadeLiquidez, penalidadeFluxo },
  };
}

