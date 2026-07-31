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
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  onReload,
  className,
}: Props) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-12 text-center',
        className,
      )}
      variants={rv(CARD_VARIANTS, reduced)}
      initial="hidden"
      animate="show"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
        <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden />
      </div>

      <div className="space-y-1.5">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
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
