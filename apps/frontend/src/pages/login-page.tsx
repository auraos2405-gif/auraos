import { AuraButton } from '@aura/ui';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { AuthSession } from '@aura/types';
import { FormField } from '../components/form-field';
import { AuthLayout } from '../layouts/auth-layout';
import { apiRequest } from '../lib/api';
import { useAuthStore } from '../store/auth-store';

export function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const mutation = useMutation({
    mutationFn: () => apiRequest<AuthSession>('/auth/login', { method: 'POST', body: JSON.stringify({ email, senha }) }),
    onSuccess: (session) => {
      setSession(session);
      navigate('/dashboard');
    },
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate();
  }

  return (
    <AuthLayout>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="mt-10 font-[Poppins] text-3xl font-medium">Olá.</h1>
        <p className="mt-2 text-slate-400">Estou pronta para analisar sua empresa.</p>
        <form className="mt-8 space-y-5" onSubmit={submit}>
          <FormField id="email" label="E-mail" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <FormField id="senha" label="Senha" type="password" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
          {mutation.error ? <p role="alert" className="text-sm text-red-400">{mutation.error.message}</p> : null}
          <AuraButton className="w-full" disabled={mutation.isPending} type="submit">
            {mutation.isPending ? 'Analisando acesso…' : 'Entrar'}
          </AuraButton>
        </form>
        <Link className="mt-6 block text-center text-sm text-slate-400 transition hover:text-white" to="/recuperar-senha">Esqueci minha senha</Link>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <AuraButton asChild variant="secondary">
            <Link to="/criar-empresa">Criar Empresa</Link>
          </AuraButton>
          <AuraButton asChild variant="secondary">
            <Link to="/primeiro-acesso">Primeiro Acesso</Link>
          </AuraButton>
        </div>
      </motion.div>
    </AuthLayout>
  );
}
