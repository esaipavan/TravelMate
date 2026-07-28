import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'border-border text-foreground bg-transparent',
        success:
          'border-transparent bg-success/12 text-success dark:bg-success/15 dark:text-success',
        warning:
          'border-transparent bg-warning/12 text-warning dark:bg-warning/15 dark:text-warning',
        info: 'border-transparent bg-info/12 text-info dark:bg-info/15 dark:text-info',
        gradient: 'border-transparent bg-gradient-brand text-white',
        soft: 'border-transparent bg-primary/10 text-primary',
      },
      dot: {
        true: '',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      dot: false,
    },
  },
);

const DOT_COLORS: Record<string, string> = {
  default: 'bg-primary-foreground',
  secondary: 'bg-secondary-foreground',
  destructive: 'bg-destructive-foreground',
  outline: 'bg-foreground',
  success: 'bg-success',
  warning: 'bg-warning',
  info: 'bg-info',
  gradient: 'bg-white',
  soft: 'bg-primary',
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, dot = false, children, ...props }: BadgeProps) {
  const dotColor = DOT_COLORS[variant ?? 'default'] ?? 'bg-current';
  return (
    <div className={cn(badgeVariants({ variant, dot }), className)} {...props}>
      {dot && (
        <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dotColor)} aria-hidden="true" />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
