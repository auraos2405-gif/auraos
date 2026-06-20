import { motion } from 'framer-motion';

export function AuraBrand() {
  return (
    <div className="flex items-center gap-3">
      <motion.div
        animate={{ boxShadow: ['0 0 20px #8B5CFF55', '0 0 36px #3B82F688', '0 0 20px #8B5CFF55'] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="grid size-10 place-items-center rounded-full border border-aura-violet/50 bg-aura-violet/10"
      >
        <div className="size-3 rounded-full bg-white" />
      </motion.div>
      <div>
        <div className="font-semibold tracking-[0.24em]">AURA OS</div>
        <div className="text-[10px] tracking-[0.2em] text-slate-500">OPERATING SYSTEM</div>
      </div>
    </div>
  );
}
