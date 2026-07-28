import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ActionDef {
  label: string;
  onClick?: () => void;
  href?: string;
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ActionDef;
  secondaryAction?: ActionDef;
  className?: string;
}

function ActionButton({
  action,
  variant = 'default',
  size = 'sm',
}: {
  action: ActionDef;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default';
}) {
  if (action.href) {
    return (
      <Button variant={variant} size={size} asChild>
        <Link to={action.href}>{action.label}</Link>
      </Button>
    );
  }
  return (
    <Button variant={variant} size={size} onClick={action.onClick}>
      {action.label}
    </Button>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-muted/20 p-12 text-center',
        className,
      )}
    >
      {icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 text-2xl shadow-sm ring-1 ring-border/60">
          {icon}
        </div>
      )}
      <div className="space-y-1.5">
        <h3 className="font-semibold text-foreground">{title}</h3>
        {description && <p className="max-w-xs text-sm text-muted-foreground">{description}</p>}
      </div>
      {(action || secondaryAction) && (
        <div className="flex gap-2">
          {action && <ActionButton action={action} />}
          {secondaryAction && <ActionButton action={secondaryAction} variant="outline" />}
        </div>
      )}
    </motion.div>
  );
}
