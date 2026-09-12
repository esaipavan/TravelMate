import { AlertTriangle, RotateCcw, RefreshCw } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { rv, CARD_VARIANTS } from '@/lib/motion';

interface Props {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onReload?: boolean;
  className?: string;
  /** Sized for a widget slot (WidgetCard) instead of a full page — smaller
   *  icon/padding, no title line, just the message. */
  compact?: boolean;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  onReload,
  className,
  compact,
}: Props) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-2xl border border-destructive/20 bg-destructive/5 text-center',
        compact ? 'gap-2.5 p-6' : 'p-12',
        className,
      )}
      variants={rv(CARD_VARIANTS, reduced)}
      initial="hidden"
      animate="show"
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-xl bg-destructive/10',
          compact ? 'h-9 w-9' : 'h-12 w-12',
        )}
      >
        <AlertTriangle
          className={compact ? 'h-4 w-4 text-destructive' : 'h-6 w-6 text-destructive'}
          aria-hidden
        />
      </div>

      <div className="space-y-1.5">
        {!compact && <h3 className="font-semibold text-foreground">{title}</h3>}
        <p className={cn('max-w-sm text-muted-foreground', compact ? 'text-xs' : 'text-sm')}>
          {message}
        </p>
      </div>

      <div className="flex gap-2">
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            Try again
          </Button>
        )}
        {onReload && (
          <Button size="sm" onClick={() => window.location.reload()} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
            Reload page
          </Button>
        )}
      </div>
    </motion.div>
  );
}
