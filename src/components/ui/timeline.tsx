import * as React from 'react';
import { cn } from '@/lib/utils';

/* ── Timeline root ── */
export interface TimelineProps extends React.HTMLAttributes<HTMLOListElement> {}

function Timeline({ className, ...props }: TimelineProps) {
  return <ol className={cn('space-y-0', className)} {...props} />;
}

/* ── Timeline item ── */
export interface TimelineItemProps extends React.HTMLAttributes<HTMLLIElement> {
  /** Last item — hides the connector line */
  last?: boolean;
}

function TimelineItem({ className, last = false, children, ...props }: TimelineItemProps) {
  return (
    <li className={cn('relative flex gap-4', !last && 'pb-6', className)} {...props}>
      {children}
    </li>
  );
}

/* ── Timeline connector (dot + line) ── */
export interface TimelineConnectorProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: 'default' | 'primary' | 'success' | 'warning' | 'destructive';
  /** Show pulse animation on the dot */
  active?: boolean;
  last?: boolean;
  icon?: React.ReactNode;
}

const CONNECTOR_COLORS = {
  default: 'bg-muted-foreground/40',
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
};

function TimelineConnector({
  color = 'default',
  active = false,
  last = false,
  icon,
  className,
  ...props
}: TimelineConnectorProps) {
  const dotColor = CONNECTOR_COLORS[color];
  return (
    <div className={cn('relative flex flex-col items-center', className)} {...props}>
      <div
        className={cn(
          'relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          icon ? 'bg-muted text-muted-foreground [&_svg]:h-4 [&_svg]:w-4' : dotColor,
        )}
      >
        {icon ?? null}
        {!icon && active && (
          <span
            aria-hidden="true"
            className={cn(
              'absolute inline-flex h-full w-full animate-tm-pulse-ring rounded-full opacity-75',
              dotColor,
            )}
          />
        )}
        {!icon && <span className="h-2.5 w-2.5 rounded-full bg-white/80" />}
      </div>
      {!last && <div className="mt-1 w-px flex-1 bg-border" />}
    </div>
  );
}

/* ── Timeline content ── */
function TimelineContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex-1 pt-1', className)} {...props} />;
}

/* ── Timeline header ── */
function TimelineHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mb-1 flex items-center justify-between gap-2', className)} {...props} />
  );
}

/* ── Timeline title ── */
function TimelineTitle({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm font-semibold text-foreground', className)} {...props} />;
}

/* ── Timeline time ── */
function TimelineTime({ className, ...props }: React.HTMLAttributes<HTMLTimeElement>) {
  return <time className={cn('shrink-0 text-xs text-muted-foreground', className)} {...props} />;
}

/* ── Timeline body ── */
function TimelineBody({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

export {
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineContent,
  TimelineHeader,
  TimelineTitle,
  TimelineTime,
  TimelineBody,
};
