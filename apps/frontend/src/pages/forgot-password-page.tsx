import { AuraButton } from '@aura/ui';
import { useMutation } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { FormField } from '../components/form-field';
import { AuthLayout } from '../layouts/auth-layout';
import { apiRequest } from '../lib/api';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const mutation = useMutation({
    mutationFn: () => apiRequest<{ message: string }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate();
  }

  return (
    <AuthLayout>
      <h1 className="mt-10 text-2xl font-semibold">Recuperar acesso</h1>
      <p className="mt-2 text-sm leading-6 text-slate-400">Informe seu e-mail. Se ele estiver cadastrado, enviaremos as próximas instruções.</p>
      {mutation.isSuccess ? (
        <div className="mt-8 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-300">{mutation.data.message}</div>
      ) : (
        <form className="mt-8 space-y-5" onSubmit={submit}>
          <FormField id="email" label="E-mail" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <AuraButton className="w-full" disabled={mutation.isPending} type="submit">Enviar instruções</AuraButton>
        </form>
      )}
      <Link className="mt-6 block text-center text-sm text-slate-400 hover:text-white" to="/login">Voltar para o login</Link>
    </AuthLayout>
  );
}

