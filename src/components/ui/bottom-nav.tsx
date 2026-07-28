import * as React from 'react';
import { NavLink, type NavLinkProps } from 'react-router-dom';
import { cn } from '@/lib/utils';

/* ── Root ── */
export interface BottomNavProps extends React.HTMLAttributes<HTMLElement> {}

function BottomNav({ className, children, ...props }: BottomNavProps) {
  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'glass safe-bottom',
        'border-t border-border/50',
        className,
      )}
      {...props}
    >
      <div className="flex h-16 items-center justify-around px-2">{children}</div>
    </nav>
  );
}

/* ── Item ── */
export interface BottomNavItemProps extends Omit<NavLinkProps, 'children'> {
  icon: React.ReactNode;
  label: string;
}

function BottomNavItem({ icon, label, className, ...props }: BottomNavItemProps) {
  return (
    <NavLink
      className={({ isActive }) =>
        cn(
          'flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-1.5',
          'min-w-[56px] transition-all duration-200 active:scale-90',
          isActive
            ? 'text-primary [&_svg]:text-primary'
            : 'text-muted-foreground hover:text-foreground [&_svg]:text-muted-foreground',
          className,
        )
      }
      {...props}
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200 [&_svg]:h-5 [&_svg]:w-5',
              isActive && 'bg-primary/10',
            )}
          >
            {icon}
          </span>
          <span
            className={cn(
              'text-2xs font-semibold',
              isActive ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
}

export { BottomNav, BottomNavItem };
