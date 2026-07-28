import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { rv, CARD_VARIANTS, LIST_VARIANTS } from '@/lib/motion';
import type { Recommendation, RecommendationAction } from '../types';

interface Props {
  alerts: Recommendation[];
  onDismiss: (id: string) => void;
  onAction: (action: RecommendationAction) => void;
}

export function AlertBanner({ alerts, onDismiss, onAction }: Props) {
  const reduced = useReducedMotion();

  if (alerts.length === 0) return null;

  return (
    <motion.div
      className="space-y-2"
      variants={rv(LIST_VARIANTS, reduced)}
      initial="hidden"
      animate="show"
      role="alert"
      aria-label="Critical travel alerts"
    >
      <AnimatePresence mode="popLayout">
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            className="bg-rose-500/8 flex items-start gap-3 rounded-2xl border border-rose-500/30 p-4"
            variants={rv(CARD_VARIANTS, reduced)}
            exit={reduced ? {} : { opacity: 0, height: 0, marginBottom: 0 }}
            layout={!reduced}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-500/15">
              <AlertTriangle className="h-4 w-4 text-rose-500" aria-hidden />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="text-sm font-bold text-foreground">{alert.title}</p>
                <div className="flex items-center gap-1.5">
                  {alert.action && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 px-2 text-[11px] text-rose-600 hover:bg-rose-500/10 hover:text-rose-600 dark:text-rose-400"
                      onClick={() => onAction(alert.action!)}
                    >
                      {alert.action.label}
                      <ExternalLink className="h-3 w-3" aria-hidden />
                    </Button>
                  )}
                  {alert.dismissible && (
                    <button
                      type="button"
                      onClick={() => onDismiss(alert.id)}
                      className="rounded p-0.5 text-muted-foreground/50 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                      aria-label={`Dismiss ${alert.title}`}
                    >
                      <X className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{alert.body}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
