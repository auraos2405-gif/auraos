import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type AuraButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

export function AuraButton({
  children,
  className = '',
  variant = 'primary',
  ...props
}: PropsWithChildren<AuraButtonProps>) {
  const styles =
    variant === 'primary'
      ? 'bg-aura-violet text-white hover:bg-violet-500'
      : 'border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10';

  return (
    <button
      className={`rounded-xl px-4 py-3 font-medium transition duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
