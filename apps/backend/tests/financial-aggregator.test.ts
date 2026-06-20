import { buildFinancialSnapshot } from '../src/modules/finance/financial-aggregator.service.js';
import { calculateAuraIndex } from '../src/modules/executive/aura-index.engine.js';

const date = (value: string) => new Date(`${value}T00:00:00.000Z`);

describe('Financial Aggregator', () => {
  it('builds the executive snapshot from real payable and receivable records', () => {
    const snapshot = buildFinancialSnapshot(
      [
        { valor: 2000, vencimento: date('2026-06-10'), status: 'VENCIDO' },
        { valor: 3000, vencimento: date('2026-06-25'), status: 'PENDENTE' },
        { valor: 5000, vencimento: date('2026-06-15'), status: 'PAGO' },
        { valor: 900, vencimento: date('2026-06-20'), status: 'CANCELADO' },
        { valor: 1000, vencimento: date('2026-09-01'), status: 'PENDENTE' },
      ],
      [
        { valor: 8000, vencimento: date('2026-06-28'), status: 'PENDENTE' },
        { valor: 12000, vencimento: date('2026-06-12'), status: 'RECEBIDO' },
        { valor: 500, vencimento: date('2026-06-11'), status: 'CANCELADO' },
      ],
      date('2026-06-18'),
    );
    expect(snapshot).toEqual({ contasVencidas: 1, contasAVencer: 1, liquidez: 7000, recebimentos: 8000, pagamentos: 5000, periodoDias: 30 });
  });

  it('feeds real aggregate data into the AURA Index', () => {
    const snapshot = buildFinancialSnapshot(
      [{ valor: 10000, vencimento: date('2026-06-10'), status: 'VENCIDO' }],
      [{ valor: 1000, vencimento: date('2026-06-20'), status: 'PENDENTE' }],
      date('2026-06-18'),
    );
    const index = calculateAuraIndex(snapshot);
    expect(index.score).toBeLessThan(61);
    expect(index.fluxoProjetado).toBe(-9000);
  });

  it('excludes future records outside the 30-day horizon', () => {
    const snapshot = buildFinancialSnapshot(
      [{ valor: 1000, vencimento: date('2027-01-01'), status: 'PENDENTE' }],
      [{ valor: 2000, vencimento: date('2027-01-01'), status: 'PENDENTE' }],
      date('2026-06-18'),
    );
    expect(snapshot).toEqual(expect.objectContaining({ contasAVencer: 0, pagamentos: 0, recebimentos: 0 }));
  });
});

