import * as React from 'react';
import { NavLink, type NavLinkProps } from 'react-router-dom';
import { cn } from '@/lib/utils';

/* ── Root ── */
export interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {}

function SidebarNav({ className, children, ...props }: SidebarNavProps) {
  return (
    <nav className={cn('flex flex-col gap-1 px-2 py-2', className)} {...props}>
      {children}
    </nav>
  );
}

/* ── Section label ── */
function SidebarNavSection({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'mb-1 mt-4 px-3 text-2xs font-semibold uppercase tracking-widest text-muted-foreground/70 first:mt-0',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* ── Item ── */
export interface SidebarNavItemProps extends Omit<NavLinkProps, 'children'> {
  icon?: React.ReactNode;
  label: string;
  badge?: React.ReactNode;
}

function SidebarNavItem({ icon, label, badge, className, ...props }: SidebarNavItemProps) {
  return (
    <NavLink
      className={({ isActive }) =>
        cn(
          'group flex h-9 items-center gap-2.5 rounded-xl px-3 text-sm font-medium transition-all duration-150',
          'active:scale-[0.98]',
          isActive
            ? 'bg-primary/10 text-primary shadow-xs'
            : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
          className,
        )
      }
      {...props}
    >
      {icon && (
        <span className="flex h-5 w-5 shrink-0 items-center justify-center transition-colors [&_svg]:h-4 [&_svg]:w-4">
          {icon}
        </span>
      )}
      <span className="flex-1 truncate">{label}</span>
      {badge && <span className="ml-auto">{badge}</span>}
    </NavLink>
  );
}

/* ── Separator ── */
function SidebarNavSeparator({ className }: { className?: string }) {
  return <div className={cn('my-2 h-px bg-border/60', className)} />;
}

export { SidebarNav, SidebarNavSection, SidebarNavItem, SidebarNavSeparator };
