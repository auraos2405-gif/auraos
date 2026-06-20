import { AuraButton } from '@aura/ui';
import { motion } from 'framer-motion';
import { ArrowRight, BriefcaseBusiness, DatabaseZap, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth-store';

export function WelcomePage() {
  const empresa = useAuthStore((state) => state.empresa);
  const usuario = useAuthStore((state) => state.usuario);

  return (
    <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-5xl">
      <div className="rounded-[2rem] border border-white/[0.08] bg-white/[0.03] p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.22em] text-violet-300">Boas-vindas</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Bem-vindo à AURA OS.</h1>
        <p className="mt-4 max-w-2xl leading-7 text-slate-400">Sua empresa foi criada com sucesso. {usuario?.nome ? `${usuario.nome}, ` : ''}você já está autenticado e pronto para seguir com a configuração inicial.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-white/[0.08] bg-[#090b17]/75 p-5">
            <BriefcaseBusiness className="text-violet-200" size={18} />
            <p className="mt-3 text-sm font-medium text-white">Empresa ativa</p>
            <p className="mt-2 text-sm text-slate-400">{empresa?.nomeFantasia ?? empresa?.nome ?? 'Ambiente criado'}</p>
          </div>
          <div className="rounded-3xl border border-white/[0.08] bg-[#090b17]/75 p-5">
            <DatabaseZap className="text-blue-200" size={18} />
            <p className="mt-3 text-sm font-medium text-white">Base pronta</p>
            <p className="mt-2 text-sm text-slate-400">Categorias, permissões e dashboard inicial foram preparados.</p>
          </div>
          <div className="rounded-3xl border border-white/[0.08] bg-[#090b17]/75 p-5">
            <Sparkles className="text-amber-200" size={18} />
            <p className="mt-3 text-sm font-medium text-white">Próximos passos</p>
            <p className="mt-2 text-sm text-slate-400">Configure financeiro, importe dados e conheça a AURA.</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <AuraButton asChild>
            <Link to="/onboarding/assistente" className="inline-flex items-center justify-center gap-2">
              Configurar Financeiro <ArrowRight size={16} />
            </Link>
          </AuraButton>
          <AuraButton asChild variant="secondary">
            <Link to="/onboarding/assistente" className="inline-flex items-center justify-center gap-2">Importar Dados</Link>
          </AuraButton>
          <AuraButton asChild variant="secondary">
            <Link to="/aura/copilot" className="inline-flex items-center justify-center gap-2">Conhecer a AURA</Link>
          </AuraButton>
        </div>
      </div>
    </motion.section>
  );
}
