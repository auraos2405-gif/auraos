import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { FormField } from '../components/form-field';
import { useAuthStore } from '../store/auth-store';

describe('Foundation frontend', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.getState().clearSession();
  });

  it('renders accessible fields and input errors', () => {
    let value = '';
    const view = render(<FormField id="email" label="E-mail" value={value} error="E-mail inválido" onChange={(event) => { value = event.target.value; }} />);
    const input = screen.getByLabelText('E-mail');
    fireEvent.change(input, { target: { value: 'admin@aura.local' } });
    expect(value).toBe('admin@aura.local');
    expect(screen.getByText('E-mail inválido')).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    view.rerender(<FormField id="email" label="E-mail" value="" onChange={() => undefined} />);
    expect(screen.queryByText('E-mail inválido')).not.toBeInTheDocument();
    expect(screen.getByLabelText('E-mail')).toHaveAttribute('aria-invalid', 'false');
  });

  it('stores a session and clears every in-memory credential', () => {
    useAuthStore.getState().setSession({
      accessToken: 'access',
      refreshToken: 'refresh',
      usuario: { id: 'u1', empresaId: 'e1', nome: 'AURA Admin', email: 'admin@aura.local', cargo: null, avatar: null },
    });
    expect(useAuthStore.getState().accessToken).toBe('access');
    expect(useAuthStore.getState().usuario?.empresaId).toBe('e1');
    useAuthStore.getState().clearSession();
    expect(useAuthStore.getState()).toEqual(expect.objectContaining({ accessToken: null, refreshToken: null, usuario: null }));
  });
});
