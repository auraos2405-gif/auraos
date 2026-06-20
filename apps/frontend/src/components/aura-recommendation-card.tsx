import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

type Props = {
  title: string;
  observation: string;
  impact: string;
  recommendation: string;
  confidence: number;
};

export function AuraRecommendationCard({ title, observation, impact, recommendation, confidence }: Props) {
  return (
    <motion.article initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="relative overflow-hidden rounded-3xl border border-aura-violet/20 bg-gradient-to-br from-aura-violet/[0.13] via-[#101326] to-[#0d1020] p-6">
      <div className="absolute right-0 top-0 size-40 rounded-full bg-aura-violet/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-violet-300"><Sparkles size={15} /> Conselho da AURA™</div>
        <h2 className="mt-5 text-xl font-semibold text-white">{title}</h2>
        <div className="mt-5 space-y-4 text-sm leading-6">
          <div><p className="text-xs uppercase tracking-wider text-slate-500">Observação</p><p className="mt-1 text-slate-300">{observation}</p></div>
          <div><p className="text-xs uppercase tracking-wider text-slate-500">Impacto</p><p className="mt-1 text-slate-300">{impact}</p></div>
          <div className="flex gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.035] p-4"><ArrowRight className="mt-0.5 shrink-0 text-violet-300" size={18} /><p className="text-slate-100">{recommendation}</p></div>
        </div>
        <div className="mt-5 flex items-center justify-between text-xs text-slate-500">
          <span>Confiança da análise</span><span className="font-medium text-violet-200">{Math.round(confidence * 100)}%</span>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.07]"><div className="h-full rounded-full bg-gradient-to-r from-aura-violet to-electric-blue" style={{ width: `${confidence * 100}%` }} /></div>
      </div>
    </motion.article>
  );
}

