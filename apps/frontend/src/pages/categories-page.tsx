import type { Category } from '@aura/types';
import { FinanceCrudPage, type CrudItem } from '../components/finance-crud-page';

type Item = Category & CrudItem;

export function CategoriesPage() {
  return <FinanceCrudPage<Item>
    title="Categorias"
    eyebrow="Finance Core™"
    description="Organize receitas e despesas para manter suas análises consistentes."
    endpoint="/categorias"
    queryKey="categories"
    itemLabel="categoria"
    columns={[
      { label: 'Nome', render: (item) => <span className="font-medium text-white">{item.nome}</span> },
      { label: 'Tipo', render: (item) => <span className={`rounded-full px-2.5 py-1 text-xs ${item.tipo === 'RECEITA' ? 'bg-emerald-400/10 text-emerald-300' : 'bg-violet-400/10 text-violet-300'}`}>{item.tipo === 'RECEITA' ? 'Receita' : 'Despesa'}</span> },
      { label: 'Status', render: (item) => item.ativo ? 'Ativa' : 'Inativa' },
    ]}
    fields={[
      { name: 'nome', label: 'Nome', required: true },
      { name: 'tipo', label: 'Tipo', type: 'select', required: true, options: [{ value: 'RECEITA', label: 'Receita' }, { value: 'DESPESA', label: 'Despesa' }] },
      { name: 'ativo', label: 'Status', type: 'select', required: true, options: [{ value: 'true', label: 'Ativa' }, { value: 'false', label: 'Inativa' }] },
    ]}
    initialValues={{ nome: '', tipo: 'DESPESA', ativo: 'true' }}
    valuesFromItem={(item) => ({ nome: item.nome, tipo: item.tipo, ativo: String(item.ativo) })}
    payloadFromValues={(values) => ({ nome: values.nome, tipo: values.tipo, ativo: values.ativo === 'true' })}
  />;
}

