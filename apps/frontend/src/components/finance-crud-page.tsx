import { AuraButton } from '@aura/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';
import { apiRequest } from '../lib/api';

export type CrudItem = { id: string; [key: string]: unknown };
export type FieldSpec = {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'number' | 'date' | 'textarea' | 'select';
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
};
export type ColumnSpec<T> = { label: string; render: (item: T) => ReactNode; className?: string };

type Props<T extends CrudItem> = {
  title: string;
  eyebrow: string;
  description: string;
  endpoint: string;
  queryKey: string;
  itemLabel: string;
  columns: Array<ColumnSpec<T>>;
  fields: FieldSpec[];
  initialValues: Record<string, string>;
  valuesFromItem: (item: T) => Record<string, string>;
  payloadFromValues?: (values: Record<string, string>) => Record<string, unknown>;
};

export function FinanceCrudPage<T extends CrudItem>(props: Props<T>) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<T | null>(null);
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(props.initialValues);
  const list = useQuery({
    queryKey: [props.queryKey, search],
    queryFn: () => apiRequest<{ items: T[]; total: number }>(`${props.endpoint}?q=${encodeURIComponent(search)}`),
  });
  const save = useMutation({
    mutationFn: (payload: Record<string, unknown>) => apiRequest<T>(editing ? `${props.endpoint}/${editing.id}` : props.endpoint, { method: editing ? 'PUT' : 'POST', body: JSON.stringify(payload) }),
    onSuccess: async () => {
      setOpen(false);
      setEditing(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [props.queryKey] }),
        queryClient.invalidateQueries({ queryKey: ['executive-dashboard'] }),
      ]);
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) => apiRequest(`${props.endpoint}/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [props.queryKey] }),
  });

  function startCreate() {
    setEditing(null);
    setValues(props.initialValues);
    setOpen(true);
  }
  function startEdit(item: T) {
    setEditing(item);
    setValues(props.valuesFromItem(item));
    setOpen(true);
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    const payload = props.payloadFromValues ? props.payloadFromValues(values) : values;
    save.mutate(payload);
  }

  return (
    <section className="mx-auto max-w-[1500px]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm text-slate-500">{props.eyebrow}</p><h1 className="mt-2 text-3xl font-semibold">{props.title}</h1><p className="mt-2 text-slate-400">{props.description}</p></div>
        <AuraButton onClick={startCreate}><span className="flex items-center gap-2"><Plus size={17} /> Novo {props.itemLabel}</span></AuraButton>
      </div>
      <div className="mt-8 overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025]">
        <div className="flex items-center border-b border-white/[0.07] p-4">
          <Search size={17} className="ml-1 text-slate-500" /><input aria-label="Pesquisar" className="w-full bg-transparent px-3 py-2 text-sm outline-none placeholder:text-slate-600" placeholder={`Pesquisar ${props.title.toLowerCase()}…`} value={search} onChange={(event) => setSearch(event.target.value)} />
          <span className="text-xs text-slate-500">{list.data?.total ?? 0} registros</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-slate-500"><tr>{props.columns.map((column) => <th key={column.label} className={`px-5 py-4 font-medium ${column.className ?? ''}`}>{column.label}</th>)}<th className="px-5 py-4 text-right font-medium">Ações</th></tr></thead>
            <tbody className="divide-y divide-white/[0.05]">
              {list.isPending ? <tr><td className="px-5 py-10 text-center text-slate-500" colSpan={props.columns.length + 1}>Carregando dados financeiros…</td></tr> : null}
              {list.isError ? <tr><td className="px-5 py-10 text-center text-red-300" colSpan={props.columns.length + 1}>{list.error.message}</td></tr> : null}
              {list.data?.items.map((item) => <tr key={item.id} className="transition hover:bg-white/[0.025]">{props.columns.map((column) => <td key={column.label} className={`px-5 py-4 text-slate-300 ${column.className ?? ''}`}>{column.render(item)}</td>)}<td className="px-5 py-4"><div className="flex justify-end gap-1"><button aria-label={`Editar ${props.itemLabel}`} onClick={() => startEdit(item)} className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-white"><Pencil size={16} /></button><button aria-label={`Excluir ${props.itemLabel}`} onClick={() => { if (window.confirm('Confirma a exclusão deste registro?')) remove.mutate(item.id); }} className="rounded-lg p-2 text-slate-500 hover:bg-red-400/10 hover:text-red-300"><Trash2 size={16} /></button></div></td></tr>)}
              {list.data && list.data.items.length === 0 ? <tr><td className="px-5 py-12 text-center text-slate-500" colSpan={props.columns.length + 1}>Nenhum registro encontrado.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </div>

      {open ? <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
        <form onSubmit={submit} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0d1020] p-6 shadow-2xl sm:p-8">
          <div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-wider text-violet-300">{editing ? 'Editar registro' : 'Novo registro'}</p><h2 className="mt-2 text-xl font-semibold">{props.itemLabel}</h2></div><button type="button" aria-label="Fechar" onClick={() => setOpen(false)} className="rounded-xl p-2 text-slate-500 hover:bg-white/5 hover:text-white"><X /></button></div>
          <div className="mt-7 grid gap-5 sm:grid-cols-2">{props.fields.map((field) => <label key={field.name} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}><span className="mb-2 block text-sm text-slate-400">{field.label}</span>{field.type === 'textarea' ? <textarea className="min-h-24 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 outline-none focus:border-aura-violet" value={values[field.name] ?? ''} onChange={(event) => setValues({ ...values, [field.name]: event.target.value })} /> : field.type === 'select' ? <select required={field.required} className="w-full rounded-xl border border-white/10 bg-[#111426] px-4 py-3 outline-none focus:border-aura-violet" value={values[field.name] ?? ''} onChange={(event) => setValues({ ...values, [field.name]: event.target.value })}><option value="">Selecione</option>{field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : <input required={field.required} type={field.type ?? 'text'} step={field.type === 'number' ? '0.01' : undefined} className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 outline-none focus:border-aura-violet" value={values[field.name] ?? ''} onChange={(event) => setValues({ ...values, [field.name]: event.target.value })} />}</label>)}</div>
          {save.error ? <p role="alert" className="mt-5 text-sm text-red-400">{save.error.message}</p> : null}
          <div className="mt-8 flex justify-end gap-3"><AuraButton type="button" variant="secondary" onClick={() => setOpen(false)}>Cancelar</AuraButton><AuraButton disabled={save.isPending} type="submit">{save.isPending ? 'Salvando…' : 'Salvar'}</AuraButton></div>
        </form>
      </div> : null}
    </section>
  );
}

