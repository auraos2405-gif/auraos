import type { AuraClassification } from '@aura/types';
import { motion } from 'framer-motion';

const states: Record<AuraClassification, { color: string; glow: string; label: string }> = {
  EXCELENTE: { color: '#00D084', glow: 'rgba(0,208,132,.32)', label: 'Excelente' },
  SAUDAVEL: { color: '#3B82F6', glow: 'rgba(59,130,246,.32)', label: 'Saudável' },
  ATENCAO: { color: '#FACC15', glow: 'rgba(250,204,21,.28)', label: 'Atenção' },
  RISCO: { color: '#F97316', glow: 'rgba(249,115,22,.3)', label: 'Risco' },
  CRITICO: { color: '#FF4D4F', glow: 'rgba(255,77,79,.32)', label: 'Crítico' },
};

export function AuraHalo({ score, classification }: { score: number; classification: AuraClassification }) {
  const state = states[classification];
  return (
    <div className="relative grid min-h-72 place-items-center overflow-hidden rounded-3xl border border-white/[0.07] bg-[#0d1020]">
      <div className="absolute inset-0 opacity-40 aura-radial" />
      <motion.div
        className="absolute size-56 rounded-full blur-3xl"
        style={{ background: state.glow }}
        animate={{ scale: [0.9, 1.08, 0.9], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative grid size-52 place-items-center rounded-full p-[2px]"
        style={{
          background: `conic-gradient(${state.color} ${score * 3.6}deg, rgba(255,255,255,.08) 0deg)`,
          boxShadow: `0 0 70px ${state.glow}`,
        }}
      >
        <div className="grid size-full place-items-center rounded-full bg-[#0b0e1b]">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Índice AURA™</p>
            <p className="mt-1 text-6xl font-semibold tracking-tight text-white">{score}</p>
            <p className="mt-2 text-sm font-medium" style={{ color: state.color }}>{state.label}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

