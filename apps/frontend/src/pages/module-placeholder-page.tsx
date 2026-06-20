import { motion } from 'framer-motion';
import { Mic, Sparkles } from 'lucide-react';

type ModulePlaceholderPageProps = {
  title: string;
  section: string;
  description: string;
  comingSoon?: boolean;
  voiceFirst?: boolean;
};

export function ModulePlaceholderPage({ title, section, description, comingSoon = false, voiceFirst = false }: ModulePlaceholderPageProps) {
  return (
    <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-5xl">
      <div className="rounded-[2rem] border border-white/[0.07] bg-white/[0.03] p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-violet-300">{section}</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">{title}</h1>
            <p className="mt-4 max-w-2xl leading-7 text-slate-400">{description}</p>
          </div>
          <span className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-xs uppercase tracking-[0.16em] ${comingSoon ? 'bg-amber-300/10 text-amber-200' : 'bg-violet-300/10 text-violet-200'}`}>
            <Sparkles size={14} />
            {comingSoon ? 'Em breve' : 'Preparado'}
          </span>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-white/[0.07] bg-[#090b17]/70 p-5">
            <p className="text-sm font-medium text-white">Navegação</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">Entrada preparada na hierarquia oficial do AURA OS.</p>
          </div>
          <div className="rounded-3xl border border-white/[0.07] bg-[#090b17]/70 p-5">
            <p className="text-sm font-medium text-white">Mobile</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">Cards compactos e layout vertical para iOS e telas pequenas.</p>
          </div>
          <div className="rounded-3xl border border-white/[0.07] bg-[#090b17]/70 p-5">
            <p className="flex items-center gap-2 text-sm font-medium text-white"><Mic size={16} /> Voz</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">{voiceFirst ? 'Fluxo prioriza a Aura Bubble e comandos por voz.' : 'Compatível com abertura via Aura Bubble.'}</p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
