export type ApiSuccess<T> = {
  success: true;
  data: T;
  requestId: string;
};

export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  requestId: string;
};

export type AuthUser = {
  id: string;
  empresaId: string;
  nome: string;
  email: string;
  cargo: string | null;
  avatar: string | null;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  usuario: AuthUser;
};

export type AuraClassification = 'CRITICO' | 'RISCO' | 'ATENCAO' | 'SAUDAVEL' | 'EXCELENTE';
export type AlertSeverity = 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';

export type ExecutiveDashboard =
  | { available: false }
  | {
      available: true;
      indiceAura: {
        score: number;
        classificacao: AuraClassification;
        tendencia: number;
        calculadoEm: string;
      };
      resumo: {
        fluxoCaixa: number;
        liquidez: number;
        contasPagar: { quantidade: number; valor: number };
        contasReceber: { valor: number };
        contasVencidas: number;
        periodoDias: number;
      };
      alertas: Array<{
        id: string;
        titulo: string;
        descricao: string;
        severidade: AlertSeverity;
        createdAt: string;
      }>;
      recomendacoes: Array<{
        id: string;
        titulo: string;
        observacao: string;
        impacto: string;
        recomendacao: string;
        confidenceScore: number;
        origem: string;
      }>;
    };

export type PagedResult<T> = { items: T[]; total: number; page: number; limit: number };
export type Category = { id: string; nome: string; tipo: 'RECEITA' | 'DESPESA'; ativo: boolean; createdAt: string; updatedAt: string };
export type Supplier = { id: string; nome: string; documento: string | null; email: string | null; telefone: string | null; observacoes: string | null };
export type Client = Supplier;
export type PayableStatus = 'PENDENTE' | 'PAGO' | 'VENCIDO' | 'CANCELADO';
export type ReceivableStatus = 'PENDENTE' | 'RECEBIDO' | 'VENCIDO' | 'CANCELADO';
export type Payable = {
  id: string; fornecedorId: string; categoriaId: string; descricao: string; valor: number;
  emissao: string; vencimento: string; status: PayableStatus; linhaDigitavel: string | null;
  pixCopiaCola: string | null; observacoes: string | null;
  fornecedor: { id: string; nome: string }; categoria: { id: string; nome: string };
};
export type Receivable = {
  id: string; clienteId: string; categoriaId: string; descricao: string; valor: number;
  emissao: string; vencimento: string; status: ReceivableStatus; observacoes: string | null;
  cliente: { id: string; nome: string }; categoria: { id: string; nome: string };
};
