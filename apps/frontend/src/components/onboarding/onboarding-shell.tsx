import type { PropsWithChildren, ReactNode } from 'react';
import { motion } from 'framer-motion';

export function OnboardingShell({ eyebrow, title, description, children, aside }: PropsWithChildren<{ eyebrow: string; title: string; description: string; aside?: ReactNode }>) {
  return (
    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-[2rem] border border-white/[0.08] bg-white/[0.03] p-6 shadow-2xl shadow-black/30 sm:p-8">
        <p className="text-xs uppercase tracking-[0.22em] text-violet-300">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">{title}</h1>
        <p className="mt-4 max-w-2xl leading-7 text-slate-400">{description}</p>
        <div className="mt-8">{children}</div>
      </div>
      <aside className="rounded-[2rem] border border-white/[0.08] bg-[#0b0d19]/85 p-6 sm:p-8">
        {aside}
      </aside>
    </motion.section>
  );
}
