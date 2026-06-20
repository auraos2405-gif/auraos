import { calculateAuraIndex, classifyAuraIndex } from '../src/modules/executive/aura-index.engine.js';
import { generateAlerts } from '../src/modules/executive/alert.engine.js';
import { generateRecommendations } from '../src/modules/executive/recommendation.engine.js';

describe('AURA Index Engine', () => {
  it.each([
    [0, 'CRITICO'], [20, 'CRITICO'], [21, 'RISCO'], [40, 'RISCO'], [41, 'ATENCAO'],
    [60, 'ATENCAO'], [61, 'SAUDAVEL'], [80, 'SAUDAVEL'], [81, 'EXCELENTE'], [100, 'EXCELENTE'],
  ])('classifies score %i as %s', (score, expected) => {
    expect(classifyAuraIndex(score)).toBe(expected);
  });

  it('returns an excellent score for a fully covered operation', () => {
    const result = calculateAuraIndex({ contasVencidas: 0, contasAVencer: 0, liquidez: 50000, recebimentos: 20000, pagamentos: 30000 });
    expect(result).toEqual(expect.objectContaining({ score: 100, classificacao: 'EXCELENTE', fluxoProjetado: 40000 }));
  });

  it('applies bounded penalties and never leaves the 0-100 range', () => {
    const result = calculateAuraIndex({ contasVencidas: 50, contasAVencer: 50, liquidez: -1, recebimentos: -10, pagamentos: 100000 });
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.componentes).toEqual({ base: 100, penalidadeVencidas: 30, penalidadeAVencer: 10, penalidadeLiquidez: 30, penalidadeFluxo: 20 });
  });

  it('handles operations without scheduled payments', () => {
    const result = calculateAuraIndex({ contasVencidas: 0, contasAVencer: 0, liquidez: 1000, recebimentos: 0, pagamentos: 0 });
    expect(result.score).toBe(100);
  });
});

describe('Executive deterministic rules', () => {
  it('prioritizes overdue accounts and keeps evidence', () => {
    const input = { contasVencidas: 2, contasAVencer: 5, liquidez: 10000, recebimentos: 5000, pagamentos: 12000, periodoDias: 30 };
    const recommendations = generateRecommendations(input);
    expect(recommendations[0]).toEqual(expect.objectContaining({ titulo: 'Regularize as contas vencidas', confidenceScore: 0.98 }));
    expect(recommendations).toHaveLength(3);
    expect(generateAlerts(input).map((alert) => alert.severidade)).toEqual(['ALTA', 'MEDIA']);
  });

  it('raises critical cash-flow alerts and recommendations', () => {
    const input = { contasVencidas: 6, contasAVencer: 1, liquidez: 100, recebimentos: 100, pagamentos: 5000 };
    const alerts = generateAlerts(input);
    expect(alerts).toEqual(expect.arrayContaining([
      expect.objectContaining({ severidade: 'CRITICA', origem: 'regra:contas-vencidas:v1' }),
      expect.objectContaining({ severidade: 'CRITICA', origem: 'regra:fluxo-negativo:v1' }),
    ]));
    expect(generateRecommendations(input)).toEqual(expect.arrayContaining([expect.objectContaining({ titulo: 'Proteja o fluxo de caixa' })]));
  });

  it('returns a healthy cash recommendation without manufacturing alerts', () => {
    const input = { contasVencidas: 0, contasAVencer: 0, liquidez: 10000, recebimentos: 5000, pagamentos: 2000 };
    expect(generateAlerts(input)).toEqual([]);
    expect(generateRecommendations(input)).toEqual([expect.objectContaining({ titulo: 'Mantenha a disciplina de caixa', prioridade: 40 })]);
  });

  it('uses singular copy for one due or overdue account', () => {
    const result = generateRecommendations({ contasVencidas: 1, contasAVencer: 1, liquidez: 100, recebimentos: 0, pagamentos: 50 });
    expect(result[0].observacao).toContain('1 conta vencida');
    expect(result.find((item) => item.titulo.includes('pagamentos'))?.observacao).toContain('1 conta vencendo');
  });
});
