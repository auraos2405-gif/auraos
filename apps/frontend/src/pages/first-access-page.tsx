import { AuraButton } from '@aura/ui';
import { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuraBubble } from '../components/aura-bubble';
import { OnboardingBubbleGuide } from '../components/onboarding/onboarding-bubble-guide';
import { OnboardingShell } from '../components/onboarding/onboarding-shell';

export function FirstAccessPage() {
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <main className="aura-grid relative min-h-screen overflow-hidden px-5 py-8 sm:py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,255,0.18),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.14),transparent_26%)]" />
      <OnboardingShell
        eyebrow="AURA FIRST ACCESS 1.0"
        title="Primeiro acesso sem bloqueio."
        description="Crie sua empresa, defina o administrador e entre automaticamente no ambiente completo da AURA OS."
        aside={<OnboardingBubbleGuide />}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-white/[0.08] bg-[#090b17]/75 p-5">
            <p className="text-sm font-medium text-white">Sem usuário prévio</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">O sistema foi preparado para criar a primeira empresa diretamente pela interface.</p>
          </div>
          <div className="rounded-3xl border border-white/[0.08] bg-[#090b17]/75 p-5">
            <p className="text-sm font-medium text-white">Sessão automática</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">Ao concluir, você já entra autenticado como ADMIN MASTER.</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <AuraButton asChild className="w-full sm:w-auto">
            <Link to="/criar-empresa" className="inline-flex items-center justify-center gap-2">
              <Sparkles size={16} /> Criar Empresa
            </Link>
          </AuraButton>
          <AuraButton asChild className="w-full sm:w-auto" variant="secondary">
            <Link to="/login" className="inline-flex items-center justify-center gap-2">
              <ArrowRight size={16} /> Voltar ao login
            </Link>
          </AuraButton>
        </div>
      </OnboardingShell>
      <div className="pointer-events-none absolute right-6 top-6 hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-400 lg:block">AURA Bubble ativa em todas as telas</div>
      <AuraBubble onOpenCopilot={() => setHelpOpen((value) => !value)} />
      {helpOpen ? (
        <div className="fixed inset-x-0 bottom-6 z-40 mx-auto w-[min(92vw,720px)] rounded-[2rem] border border-white/10 bg-[#0b0d19]/96 p-5 shadow-2xl shadow-black/50 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.2em] text-violet-300">Primeiro acesso</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">Crie a empresa primeiro, depois o administrador. A seguir você entra automaticamente e pode continuar com o assistente de configuração.</p>
          <div className="mt-4 flex justify-end">
            <AuraButton variant="secondary" type="button" onClick={() => setHelpOpen(false)}>Fechar</AuraButton>
          </div>
        </div>
      ) : null}
    </main>
  );
}
