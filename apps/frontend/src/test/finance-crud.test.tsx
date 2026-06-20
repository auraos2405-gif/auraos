import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CategoriesPage } from '../pages/categories-page';
import { apiRequest } from '../lib/api';

vi.mock('../lib/api', () => ({ apiRequest: vi.fn() }));
const apiMock = vi.mocked(apiRequest);

describe('Finance CRUD UI', () => {
  it('lists and creates a category through the REST contract', async () => {
    apiMock.mockImplementation(async (_path, init) => init?.method === 'POST'
      ? ({ id: 'c2', nome: 'Operacional', tipo: 'DESPESA', ativo: true } as never)
      : ({ items: [{ id: 'c1', nome: 'Vendas', tipo: 'RECEITA', ativo: true }], total: 1 } as never));
    const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    render(<QueryClientProvider client={client}><CategoriesPage /></QueryClientProvider>);
    expect(await screen.findByText('Vendas')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Novo categoria'));
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Operacional' } });
    fireEvent.change(screen.getByLabelText('Tipo'), { target: { value: 'DESPESA' } });
    fireEvent.click(screen.getByText('Salvar'));
    await waitFor(() => expect(apiMock).toHaveBeenCalledWith('/categorias', expect.objectContaining({ method: 'POST' })));
  });
});
