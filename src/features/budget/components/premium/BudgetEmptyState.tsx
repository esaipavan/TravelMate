import { motion, useReducedMotion } from 'framer-motion';
import { Wallet, Sparkles, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { rv, FADE_VARIANTS } from '@/lib/motion';

interface Props {
  tripId: string;
  onOpenAI: () => void;
  hasTrip: boolean;
}

export function BudgetEmptyState({ tripId, onOpenAI, hasTrip }: Props) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      variants={rv(FADE_VARIANTS, reduced)}
      initial="hidden"
      animate="show"
      className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 bg-card/40 px-6 py-20 text-center backdrop-blur-sm"
    >
      {/* Icon */}
      <motion.div
        initial={reduced ? {} : { scale: 0.8, opacity: 0 }}
        animate={reduced ? {} : { scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200, delay: 0.1 }}
        className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg"
      >
        <Wallet className="h-7 w-7" aria-hidden="true" />
      </motion.div>

      <h2 className="text-xl font-bold text-foreground">Plan your budget</h2>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        Set category budgets and track your spending. Use AI to get a smart estimate in seconds.
      </p>

      {/* CTAs */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {hasTrip && (
          <button
            onClick={onOpenAI}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            AI Budget Estimate
          </button>
        )}
        <Link
          to={`/trips/${tripId}/expenses`}
          className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/60 px-4 py-2.5 text-sm font-semibold text-foreground backdrop-blur-sm transition-colors hover:border-border hover:bg-card"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add First Expense
        </Link>
      </div>

      {/* Subtle feature list */}
      <div className="mt-10 grid grid-cols-3 gap-6 text-center">
        {[
          { emoji: '📊', label: 'Category tracking' },
          { emoji: '🤖', label: 'AI estimates' },
          { emoji: '📈', label: 'Spending insights' },
        ].map(({ emoji, label }) => (
          <div key={label} className="space-y-1">
            <p className="text-2xl">{emoji}</p>
            <p className="text-[11px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
