import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default' | 'orange';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

export function Badge({ variant = 'default', children, className = '', ...props }: BadgeProps) {
  const base = 'inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider';

  const variants: Record<BadgeVariant, string> = {
    success: 'bg-emerald-900/40 text-emerald-400 ring-1 ring-emerald-500/30',
    warning: 'bg-amber-900/40 text-amber-400 ring-1 ring-amber-500/30',
    danger:  'bg-red-900/40 text-red-400 ring-1 ring-red-500/30',
    info:    'bg-blue-900/40 text-blue-400 ring-1 ring-blue-500/30',
    orange:  'bg-primary/20 text-primary ring-1 ring-primary/40',
    default: 'bg-surface-elevated text-ink-muted ring-1 ring-surface-border',
  };

  return (
    <span className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
}
