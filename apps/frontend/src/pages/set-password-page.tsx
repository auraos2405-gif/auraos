import { AuraButton } from '@aura/ui';
import { useMutation } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FormField } from '../components/form-field';
import { AuthLayout } from '../layouts/auth-layout';
import { apiRequest } from '../lib/api';

export function SetPasswordPage({ mode }: { mode: 'reset' | 'invite' }) {
  const [params] = useSearchParams();
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const token = params.get('token') ?? '';
  const mutation = useMutation({
    mutationFn: () => apiRequest<{ message: string }>(
      mode === 'reset' ? '/auth/reset-password' : '/auth/accept-invite',
      { method: 'POST', body: JSON.stringify(mode === 'reset' ? { token, novaSenha: senha } : { token, senha }) },
    ),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    if (senha === confirmacao) mutation.mutate();
  }

  return (
    <AuthLayout>
      <h1 className="mt-10 text-2xl font-semibold">{mode === 'reset' ? 'Definir nova senha' : 'Aceitar convite'}</h1>
      {mutation.isSuccess ? (
        <div className="mt-8">
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-300">{mutation.data.message}</div>
          <Link className="mt-6 block text-center text-sm text-white" to="/login">Entrar na AURA</Link>
        </div>
      ) : (
        <form className="mt-8 space-y-5" onSubmit={submit}>
          {!token ? <p role="alert" className="text-sm text-red-400">O link está incompleto.</p> : null}
          <FormField id="senha" label="Nova senha" type="password" autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
          <FormField id="confirmacao" label="Confirmar senha" type="password" autoComplete="new-password" value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} error={confirmacao && senha !== confirmacao ? 'As senhas não coincidem.' : undefined} required />
          {mutation.error ? <p role="alert" className="text-sm text-red-400">{mutation.error.message}</p> : null}
          <AuraButton className="w-full" disabled={!token || senha !== confirmacao || mutation.isPending} type="submit">Confirmar senha</AuraButton>
        </form>
      )}
    </AuthLayout>
  );
}

