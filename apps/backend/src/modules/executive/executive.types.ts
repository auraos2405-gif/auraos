export type FinancialSnapshot = {
  contasVencidas: number;
  contasAVencer: number;
  liquidez: number;
  recebimentos: number;
  pagamentos: number;
  periodoDias?: number;
};

export type AuraClassification = 'CRITICO' | 'RISCO' | 'ATENCAO' | 'SAUDAVEL' | 'EXCELENTE';

export type AuraIndexResult = {
  score: number;
  classificacao: AuraClassification;
  fluxoProjetado: number;
  componentes: {
    base: number;
    penalidadeVencidas: number;
    penalidadeAVencer: number;
    penalidadeLiquidez: number;
    penalidadeFluxo: number;
  };
};

export type RecommendationRuleResult = {
  titulo: string;
  observacao: string;
  impacto: string;
  recomendacao: string;
  motivo: string;
  dadosUtilizados: Record<string, number>;
  confidenceScore: number;
  origem: string;
  prioridade: number;
};

export type AlertRuleResult = {
  titulo: string;
  descricao: string;
  severidade: 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';
  origem: string;
  evidencia: Record<string, number>;
};

