import type { Client, Supplier } from '@aura/types';
import { FinanceCrudPage, type CrudItem } from '../components/finance-crud-page';

type Party = (Supplier | Client) & CrudItem;

export function PartiesPage({ kind }: { kind: 'suppliers' | 'clients' }) {
  const supplier = kind === 'suppliers';
  const label = supplier ? 'fornecedor' : 'cliente';
  return <FinanceCrudPage<Party>
    title={supplier ? 'Fornecedores' : 'Clientes'}
    eyebrow={supplier ? 'Suppliers™' : 'Finance Core™'}
    description={supplier ? 'Mantenha uma visão confiável dos parceiros que sustentam sua operação.' : 'Centralize os clientes associados aos seus recebimentos.'}
    endpoint={supplier ? '/fornecedores' : '/clientes'}
    queryKey={kind}
    itemLabel={label}
    columns={[
      { label: 'Nome', render: (item) => <span className="font-medium text-white">{item.nome}</span> },
      { label: 'Documento', render: (item) => item.documento || '—' },
      { label: 'E-mail', render: (item) => item.email || '—' },
      { label: 'Telefone', render: (item) => item.telefone || '—' },
    ]}
    fields={[
      { name: 'nome', label: 'Nome', required: true },
      { name: 'documento', label: 'CPF / CNPJ' },
      { name: 'email', label: 'E-mail', type: 'email' },
      { name: 'telefone', label: 'Telefone' },
      { name: 'observacoes', label: 'Observações', type: 'textarea' },
    ]}
    initialValues={{ nome: '', documento: '', email: '', telefone: '', observacoes: '' }}
    valuesFromItem={(item) => ({ nome: item.nome, documento: item.documento ?? '', email: item.email ?? '', telefone: item.telefone ?? '', observacoes: item.observacoes ?? '' })}
    payloadFromValues={(values) => Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value || null]))}
  />;
}

