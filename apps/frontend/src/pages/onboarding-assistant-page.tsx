import { motion } from 'framer-motion';
import { useState } from 'react';
import { CheckCircle2, ClipboardList, FileUp, Sparkles, Users, WalletCards } from 'lucide-react';
import { AuraBubble } from '../components/aura-bubble';

const steps = [
  { icon: ClipboardList, title: 'Cadastrar empresa', description: 'Confirme dados fiscais e operacionais.' },
  { icon: Sparkles, title: 'Cadastrar categorias', description: 'Organize receitas e despesas.' },
  { icon: Users, title: 'Cadastrar fornecedores', description: 'Prepare a base de compras.' },
  { icon: Users, title: 'Cadastrar clientes', description: 'Estruture recebíveis e relacionamento.' },
  { icon: FileUp, title: 'Importar boletos', description: 'Traga documentos e pendências para análise.' },
  { icon: WalletCards, title: 'Ativar Aura Copilot', description: 'Abra a experiência conversacional e operacional.' },
];

export function OnboardingAssistantPage() {
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-6xl">
      <div className="rounded-[2rem] border border-white/[0.08] bg-white/[0.03] p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.22em] text-violet-300">Assistente de configuração</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Primeiros passos para a operação.</h1>
        <p className="mt-4 max-w-2xl leading-7 text-slate-400">Essa tela não executa importações automáticas. Ela guia a sequência recomendada para deixar a AURA OS pronta para uso.</p>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="rounded-3xl border border-white/[0.08] bg-[#090b17]/75 p-5">
                <div className="flex items-start gap-4">
                  <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-violet-300/[0.08] text-violet-200">
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Passo {index + 1}</p>
                    <h2 className="mt-1 text-base font-semibold text-white">{step.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{step.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex items-center gap-3 rounded-3xl border border-emerald-300/10 bg-emerald-300/[0.05] p-5 text-sm text-emerald-100">
          <CheckCircle2 size={18} />
          <span>A sequencia já está preparada para o próximo clique do usuário.</span>
        </div>
      </div>
      <AuraBubble onOpenCopilot={() => setHelpOpen((value) => !value)} />
      {helpOpen ? (
        <div className="fixed inset-x-0 bottom-6 z-40 mx-auto w-[min(92vw,720px)] rounded-[2rem] border border-white/10 bg-[#0b0d19]/96 p-5 shadow-2xl shadow-black/50 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.2em] text-violet-300">Assistente de configuração</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">Este fluxo é uma trilha guiada. Primeiro cadastre a empresa, depois a base operacional e por último ative a Aura Copilot para acelerar as tarefas do dia a dia.</p>
          <div className="mt-4 flex justify-end">
            <button className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-200" onClick={() => setHelpOpen(false)} type="button">Fechar</button>
          </div>
        </div>
      ) : null}
    </motion.section>
  );
}
