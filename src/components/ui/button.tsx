/* eslint-disable react-refresh/only-export-components */
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold',
    'ring-offset-background transition-all duration-200 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-40',
    'active:scale-[0.97]',
  ].join(' '),
  {
    variants: {
      variant: {
        default: [
          'bg-primary text-primary-foreground shadow-card',
          'hover:bg-primary/90 hover:shadow-glow hover:-translate-y-px',
        ].join(' '),
        destructive: [
          'bg-destructive text-destructive-foreground shadow-card',
          'hover:bg-destructive/90 hover:-translate-y-px',
        ].join(' '),
        outline: [
          'border border-input bg-background text-foreground shadow-xs',
          'hover:bg-secondary hover:border-border/80 hover:-translate-y-px',
        ].join(' '),
        secondary: [
          'bg-secondary text-secondary-foreground shadow-xs',
          'hover:bg-secondary/80 hover:-translate-y-px',
        ].join(' '),
        ghost: 'hover:bg-secondary hover:text-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        gradient: [
          'bg-gradient-brand text-white shadow-card',
          'hover:shadow-glow hover:-translate-y-px hover:opacity-95',
        ].join(' '),
        glass: [
          'glass text-foreground border-white/50',
          'hover:bg-white/80 hover:-translate-y-px dark:hover:bg-white/10',
        ].join(' '),
        soft: [
          'bg-primary/10 text-primary border-0',
          'hover:bg-primary/15 hover:-translate-y-px',
        ].join(' '),
        success: [
          'bg-success text-success-foreground shadow-card',
          'hover:bg-success/90 hover:-translate-y-px',
        ].join(' '),
        warning: [
          'bg-warning text-warning-foreground shadow-card',
          'hover:bg-warning/90 hover:-translate-y-px',
        ].join(' '),
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 rounded-lg px-3.5 text-xs',
        lg: 'h-12 rounded-xl px-8 text-base',
        xl: 'h-14 rounded-2xl px-10 text-base font-bold',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8 rounded-lg',
        'icon-lg': 'h-12 w-12 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading = false, children, disabled, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="mr-2 h-4 w-4 animate-tm-spin"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
