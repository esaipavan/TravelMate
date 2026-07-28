import * as React from 'react';
import { cn } from '@/lib/utils';

/* ── Root ── */
export interface TopNavProps extends React.HTMLAttributes<HTMLElement> {
  /** Whether to apply glass morphism background */
  glass?: boolean;
  border?: boolean;
}

function TopNav({ className, glass = true, border = true, children, ...props }: TopNavProps) {
  return (
    <header
      className={cn(
        'safe-top sticky top-0 z-40 w-full',
        glass ? 'bg-background/80 backdrop-blur-xl backdrop-saturate-[180%]' : 'bg-background',
        border && 'border-b border-border/60',
        className,
      )}
      {...props}
    >
      <div className="flex h-14 items-center gap-2 px-4">{children}</div>
    </header>
  );
}

/* ── Left slot ── */
function TopNavLeft({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center gap-2', className)} {...props} />;
}

/* ── Center slot ── */
function TopNavCenter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-1 items-center justify-center', className)} {...props} />;
}

/* ── Right slot ── */
function TopNavRight({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('ml-auto flex items-center gap-1', className)} {...props} />;
}

/* ── Title ── */
function TopNavTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn('text-base font-bold tracking-tight text-foreground', className)}
      {...props}
    />
  );
}

export { TopNav, TopNavLeft, TopNavCenter, TopNavRight, TopNavTitle };
