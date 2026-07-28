import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const spinnerVariants = cva('animate-tm-spin rounded-full border-2', {
  variants: {
    variant: {
      default: 'border-muted border-t-primary',
      white: 'border-white/30 border-t-white',
      accent: 'border-muted border-t-accent',
    },
    size: {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      default: 'h-5 w-5',
      lg: 'h-8 w-8 border-[3px]',
      xl: 'h-12 w-12 border-4',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof spinnerVariants> {
  label?: string;
}

function Spinner({ className, variant, size, label = 'Loading…', ...props }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn(spinnerVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Spinner, spinnerVariants };
