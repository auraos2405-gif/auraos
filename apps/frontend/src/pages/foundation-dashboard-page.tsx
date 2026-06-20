import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/auth-store';

export function FoundationDashboardPage() {
  const user = useAuthStore((state) => state.usuario);
  return (
    <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <p className="text-sm text-slate-500">Foundation™</p>
      <h1 className="mt-2 text-3xl font-semibold">Bem-vindo, {user?.nome?.split(' ')[0]}.</h1>
      <p className="mt-3 max-w-2xl leading-7 text-slate-400">A base segura da sua operação está ativa. A experiência executiva será habilitada na próxima sprint.</p>
      <div className="mt-10 max-w-xl rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.06] p-6">
        <div className="flex items-center gap-3 text-emerald-300"><ShieldCheck size={22} /><span className="font-medium">Ambiente protegido</span></div>
        <p className="mt-3 text-sm leading-6 text-slate-400">Autenticação, isolamento empresarial e auditoria estão preparados para receber os módulos da AURA.</p>
      </div>
    </motion.section>
  );
}

