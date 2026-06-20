import type { InputHTMLAttributes } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string };

export function FormField({ label, error, id, ...props }: Props) {
  return (
    <div className="block">
      <label className="mb-2 block text-sm text-slate-300" htmlFor={id}>{label}</label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-aura-violet focus:ring-2 focus:ring-aura-violet/20"
        {...props}
      />
      {error ? <span id={`${id}-error`} className="mt-1 block text-sm text-red-400">{error}</span> : null}
    </div>
  );
}
