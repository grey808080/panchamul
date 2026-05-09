import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    const base = 'inline-flex items-center justify-center gap-2 font-semibold uppercase tracking-wider transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-offset-surface-bg';

    const variants: Record<ButtonVariant, string> = {
      primary:   'bg-primary text-white hover:bg-primary-light shadow-orange focus:ring-primary rounded-lg',
      secondary: 'bg-surface-elevated text-ink-primary border border-surface-border hover:border-primary hover:text-primary focus:ring-primary rounded-lg',
      outline:   'border border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary rounded-lg',
      danger:    'bg-red-600 text-white hover:bg-red-500 focus:ring-red-500 rounded-lg',
      ghost:     'text-ink-secondary hover:bg-surface-elevated hover:text-ink-primary focus:ring-surface-border rounded',
    };

    const sizes: Record<ButtonSize, string> = {
      sm: 'px-3 py-1.5 text-[11px]',
      md: 'px-5 py-2.5 text-xs',
      lg: 'px-7 py-3 text-sm',
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin h-3.5 w-3.5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {!isLoading && leftIcon}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
