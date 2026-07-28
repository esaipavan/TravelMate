import { motion, useReducedMotion } from 'framer-motion';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { rv, rg, HOVER, LIST_ITEM_VARIANTS, REDUCED_VARIANTS } from '@/lib/motion';
import { formatCurrency } from '@/utils/formatters';
import { useDeleteCategoryBudget } from '../../hooks/useBudget';
import type { CategoryBudgetItem } from '../../types';

interface Props {
  tripId: string;
  item: CategoryBudgetItem;
  onEdit: (item: CategoryBudgetItem) => void;
}

type ExpenseCategoryKey = CategoryBudgetItem['category'];

const CAT_COLORS: Record<ExpenseCategoryKey, { gradient: string; rgb: string }> = {
  hotel: { gradient: 'from-indigo-500 to-violet-500', rgb: '99,102,241' },
  food: { gradient: 'from-amber-500 to-orange-400', rgb: '245,158,11' },
  transport: { gradient: 'from-violet-500 to-purple-500', rgb: '139,92,246' },
  shopping: { gradient: 'from-pink-500 to-rose-400', rgb: '236,72,153' },
  activity: { gradient: 'from-emerald-500 to-teal-500', rgb: '16,185,129' },
  fuel: { gradient: 'from-orange-500 to-amber-400', rgb: '249,115,22' },
  taxi: { gradient: 'from-teal-500 to-cyan-500', rgb: '20,184,166' },
  emergency: { gradient: 'from-red-500 to-rose-500', rgb: '239,68,68' },
  misc: { gradient: 'from-slate-400 to-slate-500', rgb: '148,163,184' },
};

function pct(spent: number, allocated: number): number {
  if (allocated <= 0) return 0;
  return Math.min(Math.round((spent / allocated) * 100), 100);
}

function barClass(percent: number, isOver: boolean): string {
  if (isOver) return 'bg-rose-500';
  if (percent >= 90) return 'bg-orange-500';
  if (percent >= 75) return 'bg-amber-500';
  return 'bg-emerald-500';
}

export function BudgetAllocationCard({ tripId, item, onEdit }: Props) {
  const reduced = useReducedMotion();
  const { mutate: deleteCategory, isPending } = useDeleteCategoryBudget(tripId);
  const fmt = (n: number) => formatCurrency(n, item.currency);

  const hasAllocation = item.allocated > 0;
  const isOver = hasAllocation && item.spent > item.allocated;
  const remaining = item.allocated - item.spent;
  const percent = pct(item.spent, item.allocated);
  const colors = CAT_COLORS[item.category] ?? CAT_COLORS.misc;

  function handleDelete() {
    deleteCategory(item.category, {
      onSuccess: () => toast.success(`Budget cleared for ${item.label}`),
      onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to clear budget'),
    });
  }

  return (
    <motion.div
      variants={rv(LIST_ITEM_VARIANTS, reduced)}
      whileHover={rg(HOVER.lift, reduced)}
      className={cn(
        'group relative overflow-hidden rounded-2xl border p-4 backdrop-blur-sm transition-shadow',
        isOver
          ? 'border-rose-500/30 bg-rose-500/5'
          : hasAllocation
            ? 'border-border/40 bg-card/60'
            : 'border-border/30 bg-card/40',
      )}
    >
      {/* Corner glow for active categories */}
      {hasAllocation && (
        <div
          className="pointer-events-none absolute -right-4 -top-4 h-14 w-14 rounded-full blur-2xl"
          style={{ background: `rgba(${isOver ? '244,63,94' : colors.rgb},0.12)` }}
          aria-hidden="true"
        />
      )}

      {/* Header: emoji icon + name + actions */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg',
              hasAllocation ? `bg-gradient-to-br ${colors.gradient} shadow-sm` : 'bg-muted/60',
            )}
          >
            <span role="img" aria-label={item.label}>
              {item.emoji}
            </span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{item.label}</p>
            {item.spent > 0 && (
              <p className="text-[11px] tabular-nums text-muted-foreground">
                {fmt(item.spent)} spent
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          <button
            onClick={() => onEdit(item)}
            aria-label={`Edit ${item.label} budget`}
            className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          {hasAllocation && (
            <button
              onClick={handleDelete}
              disabled={isPending}
              aria-label={`Clear ${item.label} budget`}
              className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-500 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Amount + progress */}
      {hasAllocation ? (
        <div className="mt-3 space-y-2">
          <div className="flex items-baseline justify-between">
            <p className="text-base font-bold tabular-nums text-foreground">
              {fmt(item.allocated)}
            </p>
            <p
              className={cn(
                'text-xs tabular-nums',
                isOver ? 'font-semibold text-rose-500' : 'text-muted-foreground',
              )}
            >
              {isOver ? `−${fmt(Math.abs(remaining))} over` : `${fmt(remaining)} left`}
            </p>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
            <motion.div
              className={cn('h-full rounded-full', barClass(percent, isOver))}
              initial={{ width: '0%' }}
              animate={{ width: isOver ? '100%' : `${percent}%` }}
              transition={
                reduced ? { duration: 0 } : { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }
              }
            />
          </div>
          {item.spent > 0 && (
            <p className="text-right text-[10px] tabular-nums text-muted-foreground/70">
              {percent}%{isOver ? ' — over budget' : ' used'}
            </p>
          )}
        </div>
      ) : (
        <button
          onClick={() => onEdit(item)}
          className="mt-3 w-full rounded-xl border border-dashed border-border/60 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          + Set budget
        </button>
      )}
    </motion.div>
  );
}

export const REDUCED_ITEM_VARIANTS = REDUCED_VARIANTS;
