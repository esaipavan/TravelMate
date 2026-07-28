import * as React from 'react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  compact?: boolean;
}

function EmptyState({
  icon,
  title,
  description,
  action,
  compact = false,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'gap-3 py-8' : 'gap-4 py-16',
        className,
      )}
      {...props}
    >
      {icon && (
        <div
          className={cn(
            'flex items-center justify-center rounded-2xl bg-muted/60',
            compact ? 'h-12 w-12 [&_svg]:h-5 [&_svg]:w-5' : 'h-16 w-16 [&_svg]:h-7 [&_svg]:w-7',
            'text-muted-foreground',
          )}
        >
          {icon}
        </div>
      )}
      <div className={cn('space-y-1', compact ? 'max-w-xs' : 'max-w-sm')}>
        <p className={cn('font-semibold text-foreground', compact ? 'text-sm' : 'text-base')}>
          {title}
        </p>
        {description && (
          <p className={cn('text-muted-foreground', compact ? 'text-xs' : 'text-sm')}>
            {description}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export { EmptyState };
