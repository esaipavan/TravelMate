import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
  subtext?: React.ReactNode;
  icon?: React.ReactNode;
  trend?: { value: number; label?: string };
  /** Color for the icon container and accent */
  color?: 'primary' | 'success' | 'warning' | 'destructive' | 'accent' | 'info';
}

const COLOR_MAP = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  destructive: 'bg-destructive/10 text-destructive',
  accent: 'bg-accent/10 text-accent',
  info: 'bg-info/10 text-info',
};

function StatCard({
  label,
  value,
  subtext,
  icon,
  trend,
  color = 'primary',
  className,
  ...props
}: StatCardProps) {
  const isPositive = trend && trend.value >= 0;
  return (
    <Card className={cn('p-5', className)} {...props}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="text-2xl font-bold tabular-nums tracking-tight">{value}</p>
          {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
          {trend !== undefined && (
            <p
              className={cn(
                'flex items-center gap-1 text-xs font-medium',
                isPositive ? 'text-success' : 'text-destructive',
              )}
            >
              <span aria-hidden="true">{isPositive ? '↑' : '↓'}</span>
              {Math.abs(trend.value)}%
              {trend.label && (
                <span className="font-normal text-muted-foreground">{trend.label}</span>
              )}
            </p>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl [&_svg]:h-5 [&_svg]:w-5',
              COLOR_MAP[color],
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

export { StatCard };
