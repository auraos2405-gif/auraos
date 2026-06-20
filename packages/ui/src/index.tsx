import { cloneElement, isValidElement, type ButtonHTMLAttributes, type PropsWithChildren, type ReactElement } from 'react';

type AuraButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
  asChild?: boolean;
};

export function AuraButton({
  children,
  className = '',
  variant = 'primary',
  asChild = false,
  ...props
}: PropsWithChildren<AuraButtonProps>) {
  const styles =
    variant === 'primary'
      ? 'bg-aura-violet text-white hover:bg-violet-500'
      : 'border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10';

  const classes = `rounded-xl px-4 py-3 font-medium transition duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`;

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ className?: string }>;
    return cloneElement(child, {
      ...props,
      className: [child.props.className, classes].filter(Boolean).join(' '),
    } as Partial<typeof child.props>);
  }

  return (
    <button
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
}
