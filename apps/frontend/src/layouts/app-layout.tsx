import { AuraButton } from '@aura/ui';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  Bell,
  Bot,
  Boxes,
  Building2,
  ChevronDown,
  ClipboardCheck,
  ClipboardList,
  DatabaseBackup,
  FileText,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Menu,
  Mic,
  PanelLeftClose,
  PanelLeftOpen,
  Receipt,
  ScanText,
  ScrollText,
  Search,
  Settings,
  Sparkles,
  Tags,
  Truck,
  Users,
  WalletCards,
  X,
  Zap,
} from 'lucide-react';
import { useEffect, useState, type ComponentType } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AuraBubble } from '../components/aura-bubble';
import { AuraBrand } from '../components/aura-brand';
import { apiRequest } from '../lib/api';
import { useAuthStore } from '../store/auth-store';

type Me = {
  id: string;
  nome: string;
  email: string;
  empresa: { nome: string; nomeFantasia: string | null };
};

type NavItem = {
  to: string;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  end?: boolean;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const sidebarPreferenceKey = 'aura:sidebar-collapsed';

const navigation: NavSection[] = [
  {
    title: 'AURA OS',
    items: [
      { to: '/', label: 'Executive Experience', icon: Sparkles, end: true },
      { to: '/aura/copilot', label: 'Aura Copilot', icon: Bot },
      { to: '/aura/analytics', label: 'Analytics', icon: BarChart3 },
      { to: '/aura/direct-actions', label: 'Direct Actions', icon: Zap },
      { to: '/aura/ocr-vision', label: 'OCR Vision', icon: ScanText },
      { to: '/aura/insights', label: 'Insights da Aura', icon: Lightbulb },
      { to: '/aura/meu-ponto', label: 'Meu Ponto', icon: ClipboardCheck },
    ],
  },
  {
    title: 'Financeiro',
    items: [
      { to: '/financeiro/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/financeiro/contas', label: 'Contas', icon: WalletCards },
      { to: '/financeiro/boletos', label: 'Boletos', icon: Receipt },
      { to: '/financeiro/fluxo-de-caixa', label: 'Fluxo de Caixa', icon: BarChart3 },
    ],
  },
  {
    title: 'Cadastros',
    items: [
      { to: '/cadastros/empresas', label: 'Empresas', icon: Building2 },
      { to: '/fornecedores', label: 'Fornecedores', icon: Truck },
      { to: '/cadastros/produtos', label: 'Produtos', icon: Boxes },
      { to: '/categorias', label: 'Categorias', icon: Tags },
    ],
  },
  {
    title: 'Relatórios',
    items: [
      { to: '/relatorios', label: 'Relatórios', icon: FileText },
      { to: '/orcamentos', label: 'Orçamentos', icon: ClipboardList },
    ],
  },
  {
    title: 'Configurações',
    items: [
      { to: '/configuracoes/usuarios', label: 'Usuários', icon: Users },
      { to: '/configuracoes/logs', label: 'Logs', icon: ScrollText },
      { to: '/configuracoes/backup', label: 'Backup', icon: DatabaseBackup },
      { to: '/configuracoes', label: 'Configurações', icon: Settings },
    ],
  },
  {
    title: 'Em breve',
    items: [
      { to: '/aura-2/time-machine', label: 'Time Machine™', icon: Sparkles },
      { to: '/aura-2/war-room', label: 'War Room™', icon: Zap },
      { to: '/aura-2/visao-360', label: 'Visão 360°', icon: BarChart3 },
      { to: '/aura-2/simulacoes', label: 'Simulações', icon: Lightbulb },
      { to: '/aura-2/cenarios', label: 'Cenários', icon: ClipboardList },
    ],
  },
];

function SidebarNav({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  return (
    <nav className="space-y-6">
      {navigation.map((section) => (
        <div key={section.title}>
          {!collapsed && <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">{section.title}</p>}
          <div className="space-y-1">
            {section.items.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={onNavigate}
                title={collapsed ? `${section.title} · ${label}` : undefined}
                className={({ isActive }) => `flex items-center rounded-xl text-sm transition ${collapsed ? 'justify-center px-3 py-3' : 'gap-3 px-3 py-2.5'} ${isActive ? 'bg-aura-violet/15 text-violet-100' : 'text-slate-500 hover:bg-white/[0.04] hover:text-slate-200'}`}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

export function AppLayout() {
  const navigate = useNavigate();
  const { refreshToken, clearSession } = useAuthStore();
  const me = useQuery({ queryKey: ['me'], queryFn: () => apiRequest<Me>('/usuarios/me') });
  const [collapsed, setCollapsed] = useState(() => window.localStorage.getItem(sidebarPreferenceKey) === 'true');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(sidebarPreferenceKey, String(collapsed));
  }, [collapsed]);

  async function signOut() {
    try {
      if (refreshToken) await apiRequest('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) }, false);
    } finally {
      clearSession();
      navigate('/login');
    }
  }

  return (
    <div className={`min-h-screen bg-deep-space text-slate-100 lg:grid ${collapsed ? 'lg:grid-cols-[92px_1fr]' : 'lg:grid-cols-[284px_1fr]'}`}>
      <aside className="hidden border-r border-white/[0.07] bg-[#0b0d19] p-4 lg:flex lg:flex-col">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && <AuraBrand />}
          <button
            aria-label={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
            className="rounded-xl p-3 text-slate-500 hover:bg-white/[0.04] hover:text-white"
            onClick={() => setCollapsed((value) => !value)}
            type="button"
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>
        <div className="mt-8 min-h-0 flex-1 overflow-y-auto pr-1">
          <SidebarNav collapsed={collapsed} />
        </div>
        {!collapsed && <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 text-xs leading-5 text-slate-500">AURA OS v1.0.1<br />Interface oficial</div>}
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden">
          <aside className="h-full w-[min(88vw,340px)] overflow-y-auto border-r border-white/[0.07] bg-[#0b0d19] p-5">
            <div className="flex items-center justify-between">
              <AuraBrand />
              <button aria-label="Fechar menu" className="rounded-xl p-3 text-slate-400 hover:bg-white/5 hover:text-white" onClick={() => setMobileMenuOpen(false)} type="button"><X size={20} /></button>
            </div>
            <div className="mt-8">
              <SidebarNav onNavigate={() => setMobileMenuOpen(false)} />
            </div>
          </aside>
        </div>
      )}

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/[0.07] bg-deep-space/90 px-4 backdrop-blur sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button aria-label="Abrir menu" className="rounded-xl p-3 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden" onClick={() => setMobileMenuOpen(true)} type="button"><Menu size={20} /></button>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">AURA OS</p>
              <p className="mt-1 truncate text-sm font-medium">{me.data?.empresa.nomeFantasia ?? me.data?.empresa.nome ?? 'Carregando…'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <button aria-label="Voice UX" className="rounded-xl p-3 text-violet-200 hover:bg-white/5 hover:text-white"><Mic size={19} /></button>
            <button aria-label="Pesquisar" className="rounded-xl p-3 text-slate-400 hover:bg-white/5 hover:text-white"><Search size={19} /></button>
            <button aria-label="Notificações" className="rounded-xl p-3 text-slate-400 hover:bg-white/5 hover:text-white"><Bell size={19} /></button>
            <AuraButton aria-label="Sair" className="!p-3" onClick={signOut} variant="secondary"><LogOut size={18} /></AuraButton>
          </div>
        </header>

        <section className="border-b border-white/[0.07] px-4 py-3 sm:px-8 lg:hidden">
          <button className="flex w-full items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 text-left text-sm text-slate-300" onClick={() => setMobileMenuOpen(true)} type="button">
            <span>Menu recolhível · voz em primeiro plano</span>
            <ChevronDown size={18} />
          </button>
        </section>

        <main className="p-4 pb-28 sm:p-8"><Outlet /></main>
      </div>

      <AuraBubble onOpenCopilot={() => navigate('/aura/copilot')} />
    </div>
  );
}
