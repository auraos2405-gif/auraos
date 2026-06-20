import { AuraButton } from '@aura/ui';
import type { CreateCompanySession } from '@aura/types';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuraBubble } from '../components/aura-bubble';
import { FormField } from '../components/form-field';
import { OnboardingBubbleGuide } from '../components/onboarding/onboarding-bubble-guide';
import { OnboardingShell } from '../components/onboarding/onboarding-shell';
import { apiRequest } from '../lib/api';
import { useAuthStore } from '../store/auth-store';

type CompanyStep = 1 | 2 | 3 | 4;

const planOptions = [
  { value: 'foundation', title: 'Foundation', description: 'Ideal para começar com a base essencial da AURA OS.' },
  { value: 'professional', title: 'Professional', description: 'Para operações já estruturadas e maior volume de dados.' },
  { value: 'enterprise', title: 'Enterprise', description: 'Governança ampliada e operações complexas.' },
] as const;

type PlanValue = (typeof planOptions)[number]['value'];

export function CreateCompanyPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [step, setStep] = useState<CompanyStep>(1);
  const [helpOpen, setHelpOpen] = useState(false);
  const [form, setForm] = useState({
    empresaNome: '',
    nomeFantasia: '',
    cnpj: '',
    telefone: '',
    emailEmpresa: '',
    adminNome: '',
    adminEmail: '',
    senha: '',
    confirmarSenha: '',
    plano: 'foundation' as PlanValue,
  });

  const mutation = useMutation({
    mutationFn: () =>
      apiRequest<CreateCompanySession>('/onboarding/create-company', {
        method: 'POST',
        body: JSON.stringify({
          empresa: {
            nome: form.empresaNome,
            nomeFantasia: form.nomeFantasia || null,
            cnpj: form.cnpj || null,
            telefone: form.telefone,
            email: form.emailEmpresa,
            plano: form.plano,
          },
          administrador: {
            nome: form.adminNome,
            email: form.adminEmail,
            senha: form.senha,
            confirmarSenha: form.confirmarSenha,
          },
        }),
      }),
    onSuccess: (session) => {
      setSession(session);
      navigate('/boas-vindas', { replace: true });
    },
  });

  const canContinueStep1 = form.empresaNome && form.telefone && form.emailEmpresa;
  const canContinueStep2 = form.adminNome && form.adminEmail && form.senha.length >= 8 && form.senha === form.confirmarSenha;

  const planCards = useMemo(() => planOptions.map((plan) => ({
    ...plan,
    active: form.plano === plan.value,
  })), [form.plano]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (step < 4) return;
    mutation.mutate();
  }

  return (
    <main className="aura-grid relative min-h-screen overflow-hidden px-5 py-8 sm:py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.16),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(139,92,255,0.18),transparent_28%)]" />
      <OnboardingShell
        eyebrow="Criar Empresa"
        title="Monte seu ambiente AURA em poucos passos."
        description="Você cria a empresa, define o administrador, escolhe o plano inicial e entra automaticamente no sistema."
        aside={<OnboardingBubbleGuide />}
      >
        <form className="space-y-6" onSubmit={submit}>
          <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
            {['Empresa', 'Administrador', 'Plano', 'Finalizar'].map((label, index) => (
              <span key={label} className={`rounded-full border px-3 py-2 ${step === index + 1 ? 'border-violet-300/30 bg-violet-300/10 text-violet-100' : 'border-white/10 bg-white/[0.03] text-slate-500'}`}>{index + 1}. {label}</span>
            ))}
          </div>

          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4">
              <FormField id="empresaNome" label="Nome da empresa" value={form.empresaNome} onChange={(e) => setForm((current) => ({ ...current, empresaNome: e.target.value }))} required />
              <FormField id="nomeFantasia" label="Nome fantasia" value={form.nomeFantasia} onChange={(e) => setForm((current) => ({ ...current, nomeFantasia: e.target.value }))} />
              <FormField id="cnpj" label="CNPJ (opcional)" value={form.cnpj} onChange={(e) => setForm((current) => ({ ...current, cnpj: e.target.value }))} />
              <FormField id="telefone" label="Telefone" value={form.telefone} onChange={(e) => setForm((current) => ({ ...current, telefone: e.target.value }))} required />
              <FormField id="emailEmpresa" label="E-mail principal" type="email" value={form.emailEmpresa} onChange={(e) => setForm((current) => ({ ...current, emailEmpresa: e.target.value }))} required />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4">
              <FormField id="adminNome" label="Nome" value={form.adminNome} onChange={(e) => setForm((current) => ({ ...current, adminNome: e.target.value }))} required />
              <FormField id="adminEmail" label="E-mail" type="email" value={form.adminEmail} onChange={(e) => setForm((current) => ({ ...current, adminEmail: e.target.value }))} required />
              <FormField id="senha" label="Senha" type="password" value={form.senha} onChange={(e) => setForm((current) => ({ ...current, senha: e.target.value }))} required />
              <FormField id="confirmarSenha" label="Confirmar senha" type="password" value={form.confirmarSenha} onChange={(e) => setForm((current) => ({ ...current, confirmarSenha: e.target.value }))} required />
              <div className="rounded-3xl border border-emerald-300/10 bg-emerald-300/[0.05] p-4 text-sm text-emerald-100">
                <div className="flex items-center gap-2 font-medium"><ShieldCheck size={16} /> Permissão ADMIN MASTER</div>
                <p className="mt-2 text-emerald-100/80">Esse usuário nasce com acesso total ao ambiente inicial.</p>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4">
              <p className="text-sm text-slate-400">Selecione o plano inicial. Foundation vem pré-selecionado.</p>
              <div className="grid gap-3">
                {planCards.map((plan) => (
                  <button
                    key={plan.value}
                    className={`rounded-3xl border p-5 text-left transition ${plan.active ? 'border-violet-300/30 bg-violet-300/[0.08]' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.05]'}`}
                    onClick={() => setForm((current) => ({ ...current, plano: plan.value }))}
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-white">{plan.title}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-400">{plan.description}</p>
                      </div>
                      {plan.active ? <Check className="text-violet-200" size={18} /> : null}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Resumo</p>
                <div className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                  <div><span className="text-slate-500">Empresa:</span> {form.empresaNome}</div>
                  <div><span className="text-slate-500">Fantasia:</span> {form.nomeFantasia || 'Não informado'}</div>
                  <div><span className="text-slate-500">Admin:</span> {form.adminNome}</div>
                  <div><span className="text-slate-500">Plano:</span> {form.plano}</div>
                </div>
              </div>
              <p className="text-sm leading-6 text-slate-400">Ao confirmar, o sistema cria a empresa, o administrador, permissões, configurações padrão e o dashboard inicial.</p>
            </motion.div>
          )}

          {mutation.error ? <p role="alert" className="text-sm text-red-400">{mutation.error.message}</p> : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <AuraButton variant="secondary" className="sm:w-auto" type="button" onClick={() => setStep((current) => (current > 1 ? ((current - 1) as CompanyStep) : current))} disabled={step === 1 || mutation.isPending}>
              <span className="inline-flex items-center gap-2"><ChevronLeft size={16} /> Voltar</span>
            </AuraButton>

            {step < 4 ? (
              <AuraButton className="sm:w-auto" type="button" onClick={() => setStep((current) => ((current + 1) as CompanyStep))} disabled={step === 1 ? !canContinueStep1 : !canContinueStep2}>
                <span className="inline-flex items-center gap-2">Continuar <ChevronRight size={16} /></span>
              </AuraButton>
            ) : (
              <AuraButton className="sm:w-auto" disabled={mutation.isPending} type="submit">
                <span className="inline-flex items-center gap-2"><Sparkles size={16} /> {mutation.isPending ? 'Criando...' : 'Criar Empresa'}</span>
              </AuraButton>
            )}
          </div>
        </form>
      </OnboardingShell>
      <AuraBubble onOpenCopilot={() => setHelpOpen((value) => !value)} />
      {helpOpen ? (
        <div className="fixed inset-x-0 bottom-6 z-40 mx-auto w-[min(92vw,720px)] rounded-[2rem] border border-white/10 bg-[#0b0d19]/96 p-5 shadow-2xl shadow-black/50 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.2em] text-violet-300">AURA Bubble</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">A AURA é o núcleo da experiência. Primeiro você cria a empresa, depois cadastra categorias, fornecedores e clientes, importa boletos e ativa a Copilot.</p>
          <div className="mt-4 flex justify-end">
            <AuraButton variant="secondary" type="button" onClick={() => setHelpOpen(false)}>Fechar</AuraButton>
          </div>
        </div>
      ) : null}
    </main>
  );
}
