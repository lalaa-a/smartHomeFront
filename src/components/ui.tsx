import type { ReactNode } from 'react';

export function PageHeader({
  title,
  kicker,
  children,
}: {
  title: string;
  kicker?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-6">
      {kicker ? (
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-text-muted">{kicker}</p>
      ) : null}
      <div className="mt-1 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-text-primary">{title}</h1>
        {children}
      </div>
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-xs uppercase tracking-[0.16em] text-text-muted">{children}</p>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-border bg-surface p-4 ${className}`}>{children}</div>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'danger-solid' | 'warning' | 'ghost';

const BUTTON_STYLES: Record<ButtonVariant, string> = {
  primary: 'border-accent-amber bg-accent-amber text-background',
  secondary: 'border-border bg-transparent text-text-primary',
  danger: 'border-danger bg-transparent text-danger',
  'danger-solid': 'border-danger bg-danger text-background',
  warning: 'border-warning bg-transparent text-warning',
  ghost: 'border-transparent bg-transparent text-accent-cyan',
};

export function Button({
  label,
  variant = 'primary',
  onClick,
  disabled = false,
  className = '',
}: {
  label: string;
  variant?: ButtonVariant;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-lg border px-4 py-2.5 font-sans-medium text-sm transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40 ${BUTTON_STYLES[variant]} ${className}`}
    >
      {label}
    </button>
  );
}

export function InfoRow({
  label,
  value,
  mono = true,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="font-sans text-sm text-text-muted">{label}</span>
      <span className={`text-sm text-text-primary ${mono ? 'font-mono' : 'font-sans'}`}>{value}</span>
    </div>
  );
}
