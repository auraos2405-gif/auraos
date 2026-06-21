import type { ExecutiveDashboard } from '@aura/types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExecutiveDashboardPage } from '../pages/executive-dashboard-page';
import { apiRequest } from '../lib/api';
import { useAuthStore } from '../store/auth-store';

vi.mock('../lib/api', () => ({ apiRequest: vi.fn() }));
const apiMock = vi.mocked(apiRequest);

const populated: ExecutiveDashboard = {
  available: true,
  indiceAura: { score: 82, classificacao: 'EXCELENTE', tendencia: 3, calculadoEm: '2026-06-18T12:00:00.000Z' },
  resumo: {
    fluxoCaixa: 39850,
    liquidez: 42500,
    contasPagar: { quantidade: 6, valor: 31400 },
    contasReceber: { valor: 28750 },
    contasVencidas: 1,
    periodoDias: 30,
  },
  alertas: [
    { id: 'a1', titulo: 'Conta vencida', descricao: 'Uma pendência exige atenção.', severidade: 'ALTA', createdAt: '2026-06-18T12:00:00.000Z' },
    { id: 'a2', titulo: 'Vencimentos próximos', descricao: 'Cinco contas no período.', severidade: 'MEDIA', createdAt: '2026-06-18T12:00:00.000Z' },
  ],
  recomendacoes: [{
    id: 'r1', titulo: 'Regularize as contas vencidas', observacao: 'Você possui 1 conta vencida.',
    impacto: 'Pode gerar encargos.', recomendacao: 'Priorize a pendência hoje.', confidenceScore: 0.98,
    origem: 'regra:contas-vencidas:v1',
  }],
};

function renderDashboard() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(<QueryClientProvider client={client}><ExecutiveDashboardPage /></QueryClientProvider>);
}

describe('Executive Dashboard', () => {
  beforeEach(() => {
    apiMock.mockReset();
    useAuthStore.getState().setSession({
      accessToken: 'access', refreshToken: 'refresh',
      usuario: { id: 'u1', empresaId: 'e1', nome: 'João Silva', email: 'joao@aura.local', cargo: null, avatar: null },
    });
  });

  it('shows company health, metrics, alerts and the primary action', async () => {
    apiMock.mockImplementation(async (path) => path.includes('/read') ? ({ message: 'ok' } as never) : populated as never);
    renderDashboard();
    expect(screen.getByLabelText('Carregando dashboard')).toBeInTheDocument();
    expect(await screen.findByText('82')).toBeInTheDocument();
    expect(screen.getByText('Excelente')).toBeInTheDocument();
    expect(screen.getByText('Regularize as contas vencidas')).toBeInTheDocument();
    expect(screen.getByText('Fluxo de caixa')).toBeInTheDocument();
    expect(screen.getByText('Conta vencida')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Conta vencida'));
    await waitFor(() => expect(apiMock).toHaveBeenCalledWith('/dashboard/alerts/a1/read', { method: 'POST' }));
  });

  it('explains when an executive snapshot is not available', async () => {
    apiMock.mockResolvedValue({ available: false } as never);
    renderDashboard();
    expect(await screen.findByText('Seu panorama executivo está sendo preparado.')).toBeInTheDocument();
  });

  it('offers a retry when the dashboard request fails', async () => {
    apiMock.mockRejectedValueOnce(new Error('Conexão indisponível')).mockResolvedValueOnce(populated as never);
    renderDashboard();
    expect(await screen.findByText('Preciso de mais informações para abrir seu panorama.')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Tentar novamente'));
    expect(await screen.findByText('82')).toBeInTheDocument();
  });
});
