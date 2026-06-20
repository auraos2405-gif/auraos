import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from 'lucide-react';

type Props = {
  title: string;
  value: string;
  trend?: number;
  trendLabel?: string;
  icon: LucideIcon;
  accent?: 'violet' | 'blue' | 'green';
};

const accents = {
  violet: 'from-aura-violet/20 text-violet-300',
  blue: 'from-electric-blue/20 text-blue-300',
  green: 'from-emerald-400/20 text-emerald-300',
};

export function AuraMetricCard({ title, value, trend = 0, trendLabel, icon: Icon, accent = 'violet' }: Props) {
  const TrendIcon = trend > 0 ? ArrowUpRight : trend < 0 ? ArrowDownRight : Minus;
  return (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.055] to-transparent p-5"
    >
      <div className="flex items-start justify-between">
        <div className={`rounded-xl bg-gradient-to-br ${accents[accent]} to-transparent p-2.5`}><Icon size={19} /></div>
        <div className={`flex items-center text-xs ${trend > 0 ? 'text-emerald-400' : trend < 0 ? 'text-red-400' : 'text-slate-500'}`}>
          <TrendIcon size={14} /> {trendLabel ?? `${Math.abs(trend)}%`}
        </div>
      </div>
      <p className="mt-6 text-xs uppercase tracking-[0.12em] text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{value}</p>
    </motion.article>
  );
}

