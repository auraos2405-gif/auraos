import type { Category, Client, Payable, PagedResult, Receivable, Supplier } from '@aura/types';
import { useQuery } from '@tanstack/react-query';
import { FinanceCrudPage, type CrudItem, type FieldSpec } from '../components/finance-crud-page';
import { apiRequest } from '../lib/api';

type AccountItem = (Payable | Receivable) & CrudItem;
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const statusColors: Record<string, string> = { PAGO: 'bg-emerald-400/10 text-emerald-300', RECEBIDO: 'bg-emerald-400/10 text-emerald-300', PENDENTE: 'bg-blue-400/10 text-blue-300', VENCIDO: 'bg-red-400/10 text-red-300', CANCELADO: 'bg-slate-400/10 text-slate-400' };

export function AccountsPage({ kind }: { kind: 'payables' | 'receivables' }) {
  const payable = kind === 'payables';
  const categories = useQuery({ queryKey: ['categories', payable ? 'DESPESA' : 'RECEITA'], queryFn: () => apiRequest<PagedResult<Category>>(`/categorias?tipo=${payable ? 'DESPESA' : 'RECEITA'}&limit=100`) });
  const parties = useQuery({ queryKey: [payable ? 'suppliers' : 'clients', 'options'], queryFn: () => apiRequest<PagedResult<Supplier | Client>>(`${payable ? '/fornecedores' : '/clientes'}?limit=100`) });
  const partyField: FieldSpec = {
    name: payable ? 'fornecedorId' : 'clienteId', label: payable ? 'Fornecedor' : 'Cliente', type: 'select', required: true,
    options: parties.data?.items.map((item) => ({ value: item.id, label: item.nome })) ?? [],
  };
  const fields: FieldSpec[] = [
    { name: 'descricao', label: 'Descrição', required: true },
    { name: 'valor', label: 'Valor', type: 'number', required: true },
    partyField,
    { name: 'categoriaId', label: 'Categoria', type: 'select', required: true, options: categories.data?.items.map((item) => ({ value: item.id, label: item.nome })) ?? [] },
    { name: 'emissao', label: 'Emissão', type: 'date', required: true },
    { name: 'vencimento', label: 'Vencimento', type: 'date', required: true },
    { name: 'status', label: 'Status', type: 'select', required: true, options: (payable ? ['PENDENTE', 'PAGO', 'VENCIDO', 'CANCELADO'] : ['PENDENTE', 'RECEBIDO', 'VENCIDO', 'CANCELADO']).map((value) => ({ value, label: value.charAt(0) + value.slice(1).toLowerCase() })) },
    ...(payable ? [{ name: 'linhaDigitavel', label: 'Linha digitável' }, { name: 'pixCopiaCola', label: 'PIX copia e cola', type: 'textarea' as const }] : []),
    { name: 'observacoes', label: 'Observações', type: 'textarea' },
  ];
  const today = new Date().toISOString().slice(0, 10);

  return <FinanceCrudPage<AccountItem>
    title={payable ? 'Contas a Pagar' : 'Contas a Receber'}
    eyebrow="Finance Core™"
    description={payable ? 'Acompanhe compromissos, vencimentos e pagamentos da operação.' : 'Controle receitas previstas e recebimentos realizados.'}
    endpoint={payable ? '/finance/contas-pagar' : '/finance/contas-receber'}
    queryKey={kind}
    itemLabel={payable ? 'conta a pagar' : 'conta a receber'}
    columns={[
      { label: 'Descrição', render: (item) => <span className="font-medium text-white">{String(item.descricao)}</span> },
      { label: payable ? 'Fornecedor' : 'Cliente', render: (item) => payable ? (item as Payable).fornecedor.nome : (item as Receivable).cliente.nome },
      { label: 'Valor', render: (item) => <span className="font-medium text-white">{brl.format(Number(item.valor))}</span> },
      { label: 'Vencimento', render: (item) => new Date(String(item.vencimento)).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) },
      { label: 'Status', render: (item) => <span className={`rounded-full px-2.5 py-1 text-xs ${statusColors[String(item.status)]}`}>{String(item.status)}</span> },
    ]}
    fields={fields}
    initialValues={{ descricao: '', valor: '', [payable ? 'fornecedorId' : 'clienteId']: '', categoriaId: '', emissao: today, vencimento: today, status: 'PENDENTE', observacoes: '', ...(payable ? { linhaDigitavel: '', pixCopiaCola: '' } : {}) }}
    valuesFromItem={(item) => ({
      descricao: String(item.descricao), valor: String(item.valor), categoriaId: String(item.categoriaId),
      [payable ? 'fornecedorId' : 'clienteId']: String(payable ? (item as Payable).fornecedorId : (item as Receivable).clienteId),
      emissao: String(item.emissao).slice(0, 10), vencimento: String(item.vencimento).slice(0, 10), status: String(item.status),
      observacoes: String(item.observacoes ?? ''), ...(payable ? { linhaDigitavel: String((item as Payable).linhaDigitavel ?? ''), pixCopiaCola: String((item as Payable).pixCopiaCola ?? '') } : {}),
    })}
    payloadFromValues={(values) => Object.fromEntries(Object.entries(values).map(([key, value]) => [key, key === 'valor' ? Number(value) : value || null]))}
  />;
}

