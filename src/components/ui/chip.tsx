/* eslint-disable react-refresh/only-export-components */
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const chipVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-150 select-none',
  {
    variants: {
      variant: {
        default: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        filled: 'bg-primary text-primary-foreground hover:bg-primary/90',
        outline: 'border border-border text-foreground bg-transparent hover:bg-secondary',
        soft: 'bg-primary/10 text-primary hover:bg-primary/15',
        success: 'bg-success/12 text-success hover:bg-success/18 dark:bg-success/15',
        warning: 'bg-warning/12 text-warning hover:bg-warning/18 dark:bg-warning/15',
        destructive: 'bg-destructive/10 text-destructive hover:bg-destructive/15',
      },
      size: {
        sm: 'h-6 px-2.5 text-xs',
        default: 'h-7 px-3 text-xs',
        lg: 'h-8 px-3.5 text-sm',
      },
      clickable: {
        true: 'cursor-pointer active:scale-95',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      clickable: false,
    },
  },
);

export interface ChipProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof chipVariants> {
  onRemove?: () => void;
  icon?: React.ReactNode;
}

function Chip({
  className,
  variant,
  size,
  clickable,
  onRemove,
  icon,
  children,
  onClick,
  ...props
}: ChipProps) {
  const isClickable = clickable ?? !!onClick;
  return (
    <span
      className={cn(chipVariants({ variant, size, clickable: isClickable }), className)}
      onClick={onClick}
      {...props}
    >
      {icon && <span className="shrink-0 [&_svg]:h-3 [&_svg]:w-3">{icon}</span>}
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="-mr-0.5 ml-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-black/10 dark:hover:bg-white/10"
          aria-label="Remove"
        >
          <svg
            viewBox="0 0 12 12"
            className="h-2.5 w-2.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M9 3L3 9M3 3l6 6" />
          </svg>
        </button>
      )}
    </span>
  );
}

export { Chip, chipVariants };
