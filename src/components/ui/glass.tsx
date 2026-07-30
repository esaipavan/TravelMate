/* eslint-disable react-refresh/only-export-components */
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const glassVariants = cva('rounded-2xl transition-all duration-200', {
  variants: {
    variant: {
      default: [
        'bg-white/70 backdrop-blur-xl backdrop-saturate-[180%]',
        'border border-white/50 shadow-card',
        'dark:bg-white/[0.06] dark:border-white/10',
      ].join(' '),
      subtle: [
        'bg-white/50 backdrop-blur-lg',
        'border border-white/30',
        'dark:bg-white/[0.04] dark:border-white/[0.07]',
      ].join(' '),
      strong: [
        'bg-white/85 backdrop-blur-2xl backdrop-saturate-[200%]',
        'border border-white/60 shadow-float',
        'dark:bg-white/[0.09] dark:border-white/[0.12]',
      ].join(' '),
      dark: [
        'bg-black/30 backdrop-blur-xl backdrop-saturate-[180%]',
        'border border-white/10 shadow-card',
      ].join(' '),
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface GlassProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof glassVariants> {}

const Glass = React.forwardRef<HTMLDivElement, GlassProps>(
  ({ className, variant, ...props }, ref) => (
    <div ref={ref} className={cn(glassVariants({ variant }), className)} {...props} />
  ),
);
Glass.displayName = 'Glass';

export { Glass, glassVariants };
