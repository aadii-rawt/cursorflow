import React from 'react';
import clsx from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-purple/50 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none';

    const variants = {
      primary: 'bg-accent-purple hover:bg-accent-purple/90 text-white shadow-lg shadow-accent-purple/20 border border-accent-purple/30',
      secondary: 'bg-card hover:bg-card-hover text-text-primary border border-card-border hover:border-card-border/80 shadow-sm',
      outline: 'bg-transparent border border-card-border hover:bg-secondary text-text-primary hover:border-text-muted/40',
      ghost: 'bg-transparent hover:bg-secondary/70 text-text-muted hover:text-text-primary',
      danger: 'bg-accent-rose/15 hover:bg-accent-rose/25 text-accent-rose border border-accent-rose/30 shadow-sm',
      gradient: 'bg-gradient-to-r from-accent-purple to-accent-sky hover:opacity-95 text-white shadow-lg shadow-accent-purple/25 border border-white/10'
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 h-8 gap-1.5',
      md: 'text-sm px-4 py-2 h-10 gap-2',
      lg: 'text-base px-5 py-2.5 h-12 gap-2.5',
      icon: 'h-9 w-9 p-0 flex items-center justify-center'
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
