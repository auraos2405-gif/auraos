import type { AlertSeverity, ExecutiveDashboard } from '@aura/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Check, Droplets, RefreshCw, WalletCards } from 'lucide-react';
import { AuraHalo } from '../components/aura-halo';
import { AuraMetricCard } from '../components/aura-metric-card';
import { AuraRecommendationCard } from '../components/aura-recommendation-card';
import { apiRequest } from '../lib/api';
import { useAuthStore } from '../store/auth-store';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const severityStyle: Record<AlertSeverity, string> = {
  CRITICA: 'bg-red-400 text-red-400',
  ALTA: 'bg-orange-400 text-orange-400',
  MEDIA: 'bg-amber-300 text-amber-300',
  BAIXA: 'bg-blue-400 text-blue-400',
};

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function DashboardSkeleton() {
  return <div aria-label="Carregando dashboard" className="grid animate-pulse gap-5 lg:grid-cols-3"><div className="h-72 rounded-3xl bg-white/5 lg:col-span-2" /><div className="h-72 rounded-3xl bg-white/5" /><div className="h-36 rounded-2xl bg-white/5" /><div className="h-36 rounded-2xl bg-white/5" /><div className="h-36 rounded-2xl bg-white/5" /></div>;
}

export function ExecutiveDashboardPage() {
  const user = useAuthStore((state) => state.usuario);
  const queryClient = useQueryClient();
  const dashboard = useQuery({ queryKey: ['executive-dashboard'], queryFn: () => apiRequest<ExecutiveDashboard>('/dashboard/executive') });
  const readAlert = useMutation({
    mutationFn: (id: string) => apiRequest(`/dashboard/alerts/${id}/read`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['executive-dashboard'] }),
  });

  if (dashboard.isPending) return <DashboardSkeleton />;
  if (dashboard.isError) return (
    <div className="rounded-3xl border border-red-400/15 bg-red-400/[0.05] p-8"><h1 className="text-xl font-semibold">Preciso de mais informações para abrir seu panorama.</h1><p className="mt-2 text-slate-400">{dashboard.error.message}</p><button className="mt-5 flex items-center gap-2 text-sm text-white" onClick={() => dashboard.refetch()}><RefreshCw size={16} /> Tentar novamente</button></div>
  );
  if (!dashboard.data.available) return (
    <div className="rounded-3xl border border-white/[0.07] bg-white/[0.03] p-10 text-center"><h1 className="text-2xl font-semibold">Seu panorama executivo está sendo preparado.</h1><p className="mx-auto mt-3 max-w-xl text-slate-400">Assim que houver um snapshot financeiro validado, o Índice AURA™ e as recomendações aparecerão aqui.</p></div>
  );

  const data = dashboard.data;
  const mainAdvice = data.recomendacoes[0];
  const totalFlow = Math.max(1, data.resumo.liquidez + data.resumo.contasReceber.valor);
  const paymentWidth = Math.min(100, Math.max(4, (data.resumo.contasPagar.valor / totalFlow) * 100));

  return (
    <section className="mx-auto max-w-[1500px]">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm text-slate-500">Executive Experience™</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{greeting()}, {user?.nome.split(' ')[0]}.</h1><p className="mt-2 text-slate-400">Aqui está o que merece sua atenção hoje.</p></div>
        <div className="text-right text-xs text-slate-500">Atualizado em<br /><span className="mt-1 block text-slate-300">{new Date(data.indiceAura.calculadoEm).toLocaleString('pt-BR')}</span></div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <AuraHalo score={data.indiceAura.score} classification={data.indiceAura.classificacao} />
        {mainAdvice ? <AuraRecommendationCard title={mainAdvice.titulo} observation={mainAdvice.observacao} impact={mainAdvice.impacto} recommendation={mainAdvice.recomendacao} confidence={mainAdvice.confidenceScore} /> : <div className="grid place-items-center rounded-3xl border border-white/[0.07] bg-white/[0.03] p-8 text-center text-slate-400">Nenhuma ação prioritária neste momento.</div>}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AuraMetricCard title="Fluxo de caixa" value={brl.format(data.resumo.fluxoCaixa)} trend={data.resumo.fluxoCaixa >= 0 ? 1 : -1} trendLabel={`${data.resumo.periodoDias} dias`} icon={WalletCards} accent="violet" />
        <AuraMetricCard title="Liquidez disponível" value={brl.format(data.resumo.liquidez)} trend={0} trendLabel="agora" icon={Droplets} accent="blue" />
        <AuraMetricCard title="Contas a pagar" value={brl.format(data.resumo.contasPagar.valor)} trend={data.resumo.contasVencidas ? -1 : 0} trendLabel={`${data.resumo.contasPagar.quantidade} contas`} icon={ArrowUpFromLine} />
        <AuraMetricCard title="Contas a receber" value={brl.format(data.resumo.contasReceber.valor)} trend={1} trendLabel="previsto" icon={ArrowDownToLine} accent="green" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <article className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6">
          <div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Fluxo de caixa™</p><h2 className="mt-2 text-lg font-semibold">Próximos {data.resumo.periodoDias} dias</h2></div><span className={`rounded-full px-3 py-1 text-xs ${data.resumo.fluxoCaixa >= 0 ? 'bg-emerald-400/10 text-emerald-300' : 'bg-red-400/10 text-red-300'}`}>{data.resumo.fluxoCaixa >= 0 ? 'Cobertura saudável' : 'Cobertura comprometida'}</span></div>
          <div className="mt-8 space-y-5">
            <div><div className="flex justify-between text-sm"><span className="text-slate-400">Recursos disponíveis + recebimentos</span><span>{brl.format(totalFlow)}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full w-full rounded-full bg-gradient-to-r from-aura-violet to-electric-blue" /></div></div>
            <div><div className="flex justify-between text-sm"><span className="text-slate-400">Pagamentos previstos</span><span>{brl.format(data.resumo.contasPagar.valor)}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-slate-500" style={{ width: `${paymentWidth}%` }} /></div></div>
          </div>
        </article>

        <article className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6">
          <div className="flex items-center gap-2"><AlertTriangle size={17} className="text-amber-300" /><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Alertas</p><span className="ml-auto rounded-full bg-white/[0.06] px-2 py-0.5 text-xs text-slate-400">{data.alertas.length}</span></div>
          <div className="mt-5 space-y-2">
            {data.alertas.length === 0 ? <div className="flex items-center gap-3 py-8 text-sm text-slate-400"><Check className="text-emerald-400" /> Nenhum alerta prioritário.</div> : data.alertas.slice(0, 4).map((alert) => (
              <button key={alert.id} onClick={() => readAlert.mutate(alert.id)} className="group flex w-full items-start gap-3 rounded-2xl p-3 text-left transition hover:bg-white/[0.04]">
                <span className={`mt-1.5 size-2 shrink-0 rounded-full ${severityStyle[alert.severidade].split(' ')[0]}`} />
                <span className="min-w-0"><span className="block text-sm font-medium text-slate-200">{alert.titulo}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{alert.descricao}</span></span>
                <Check size={15} className="ml-auto mt-1 shrink-0 opacity-0 transition group-hover:opacity-60" />
              </button>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

