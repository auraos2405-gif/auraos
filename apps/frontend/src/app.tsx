import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layouts/app-layout';
import { ForgotPasswordPage } from './pages/forgot-password-page';
import { ExecutiveDashboardPage } from './pages/executive-dashboard-page';
import { LoginPage } from './pages/login-page';
import { ModulePlaceholderPage } from './pages/module-placeholder-page';
import { SetPasswordPage } from './pages/set-password-page';
import { CategoriesPage } from './pages/categories-page';
import { PartiesPage } from './pages/parties-page';
import { AccountsPage } from './pages/accounts-page';
import { useAuthStore } from './store/auth-store';

function ProtectedRoute() {
  const refreshToken = useAuthStore((state) => state.refreshToken);
  return refreshToken ? <Outlet /> : <Navigate to="/login" replace />;
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/recuperar-senha" element={<ForgotPasswordPage />} />
      <Route path="/redefinir-senha" element={<SetPasswordPage mode="reset" />} />
      <Route path="/aceitar-convite" element={<SetPasswordPage mode="invite" />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<ExecutiveDashboardPage />} />
          <Route path="categorias" element={<CategoriesPage />} />
          <Route path="fornecedores" element={<PartiesPage kind="suppliers" />} />
          <Route path="clientes" element={<PartiesPage kind="clients" />} />
          <Route path="finance/contas-pagar" element={<AccountsPage kind="payables" />} />
          <Route path="finance/contas-receber" element={<AccountsPage kind="receivables" />} />
          <Route path="aura/copilot" element={<ModulePlaceholderPage section="AURA OS" title="Aura Copilot" description="Launcher principal conectado à Aura Bubble™. A navegação está pronta para receber a experiência conversacional completa." voiceFirst />} />
          <Route path="aura/analytics" element={<ModulePlaceholderPage section="AURA OS" title="Analytics" description="Área reservada para análises operacionais, financeiras e executivas dentro da identidade AURA OS." />} />
          <Route path="aura/direct-actions" element={<ModulePlaceholderPage section="AURA OS" title="Direct Actions" description="Preparação da camada de ações rápidas da Aura, mantendo a execução real fora do escopo desta entrega." voiceFirst />} />
          <Route path="aura/ocr-vision" element={<ModulePlaceholderPage section="AURA OS" title="OCR Vision" description="Entrada pronta para visão computacional e leitura de documentos. Funcionalidades de OCR não foram implementadas nesta correção." />} />
          <Route path="aura/insights" element={<ModulePlaceholderPage section="AURA OS" title="Insights da Aura" description="Espaço dedicado a recomendações e leituras inteligentes da operação." />} />
          <Route path="aura/meu-ponto" element={<ModulePlaceholderPage section="AURA OS" title="Meu Ponto" description="Área preparada para jornada pessoal, rotinas e presença operacional." voiceFirst />} />
          <Route path="financeiro/dashboard" element={<ModulePlaceholderPage section="Financeiro" title="Dashboard" description="Visão financeira simplificada preparada para consolidar indicadores do Finance Core." />} />
          <Route path="financeiro/contas" element={<AccountsPage kind="payables" />} />
          <Route path="financeiro/boletos" element={<ModulePlaceholderPage section="Financeiro" title="Boletos" description="Navegação preparada para gestão de boletos e documentos de cobrança." />} />
          <Route path="financeiro/fluxo-de-caixa" element={<ModulePlaceholderPage section="Financeiro" title="Fluxo de Caixa" description="Área reservada para leitura vertical do fluxo de caixa, com cards simplificados no mobile." />} />
          <Route path="cadastros/empresas" element={<ModulePlaceholderPage section="Cadastros" title="Empresas" description="Cadastro de empresas preparado para evolução multiempresa." />} />
          <Route path="cadastros/produtos" element={<ModulePlaceholderPage section="Cadastros" title="Produtos" description="Navegação preparada para catálogo de produtos e serviços." />} />
          <Route path="relatorios" element={<ModulePlaceholderPage section="Relatórios" title="Relatórios" description="Central de relatórios preparada para consultas gerenciais." />} />
          <Route path="orcamentos" element={<ModulePlaceholderPage section="Relatórios" title="Orçamentos" description="Área preparada para orçamentos, propostas e simulações comerciais." />} />
          <Route path="configuracoes/usuarios" element={<ModulePlaceholderPage section="Configurações" title="Usuários" description="Navegação preparada para gestão de usuários e permissões." />} />
          <Route path="configuracoes/logs" element={<ModulePlaceholderPage section="Configurações" title="Logs" description="Área preparada para consulta de auditoria e eventos do sistema." />} />
          <Route path="configuracoes/backup" element={<ModulePlaceholderPage section="Configurações" title="Backup" description="Entrada preparada para rotinas de backup e restauração." />} />
          <Route path="configuracoes" element={<ModulePlaceholderPage section="Configurações" title="Configurações" description="Preferências gerais da experiência AURA OS." />} />
          <Route path="aura-2/time-machine" element={<ModulePlaceholderPage section="Em breve" title="Time Machine™" description="Preparação de navegação para a experiência AURA 2.0. Funcionalidade ainda não implementada." comingSoon />} />
          <Route path="aura-2/war-room" element={<ModulePlaceholderPage section="Em breve" title="War Room™" description="Preparação de navegação para a experiência AURA 2.0. Funcionalidade ainda não implementada." comingSoon />} />
          <Route path="aura-2/visao-360" element={<ModulePlaceholderPage section="Em breve" title="Visão 360°" description="Preparação de navegação para a experiência AURA 2.0. Funcionalidade ainda não implementada." comingSoon />} />
          <Route path="aura-2/simulacoes" element={<ModulePlaceholderPage section="Em breve" title="Simulações" description="Preparação de navegação para a experiência AURA 2.0. Funcionalidade ainda não implementada." comingSoon />} />
          <Route path="aura-2/cenarios" element={<ModulePlaceholderPage section="Em breve" title="Cenários" description="Preparação de navegação para a experiência AURA 2.0. Funcionalidade ainda não implementada." comingSoon />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
