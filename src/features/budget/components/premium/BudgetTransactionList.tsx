import { useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { Receipt, ExternalLink, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import { rv, FADE_VARIANTS, LIST_ITEM_VARIANTS, REDUCED_VARIANTS } from '@/lib/motion';
import { formatCurrency } from '@/utils/formatters';
import { EXPENSE_CATEGORIES } from '@/utils/constants';
import type { ExpenseRow } from '@/features/expenses/types';

interface Props {
  expenses: ExpenseRow[];
  currency: string;
  tripId: string;
}

interface DateGroup {
  label: string;
  dateKey: string;
  total: number;
  rows: ExpenseRow[];
}

const CAT_CHIP: Record<string, string> = {
  hotel: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  food: 'bg-amber-500/10  text-amber-600  dark:text-amber-400',
  transport: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  shopping: 'bg-pink-500/10   text-pink-600   dark:text-pink-400',
  activity: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  fuel: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  taxi: 'bg-teal-500/10   text-teal-600   dark:text-teal-400',
  emergency: 'bg-red-500/10    text-red-600    dark:text-red-400',
  misc: 'bg-slate-500/10  text-slate-600  dark:text-slate-400',
};

function dateLabel(dateStr: string): string {
  try {
    const d = parseISO(`${dateStr}T00:00:00`);
    if (isToday(d)) return 'Today';
    if (isYesterday(d)) return 'Yesterday';
    return format(d, 'EEEE, MMM d');
  } catch {
    return dateStr;
  }
}

function groupExpenses(expenses: ExpenseRow[]): DateGroup[] {
  const map = new Map<string, ExpenseRow[]>();
  for (const e of expenses) {
    const key = e.date;
    const group = map.get(key) ?? [];
    group.push(e);
    map.set(key, group);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([dateKey, rows]) => ({
      dateKey,
      label: dateLabel(dateKey),
      total: rows.reduce((s, r) => s + r.amount, 0),
      rows: rows.sort((a, b) => b.amount - a.amount),
    }));
}

const LIST_VARIANTS = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

export function BudgetTransactionList({ expenses, currency, tripId }: Props) {
  const reduced = useReducedMotion();
  const groups = useMemo(() => groupExpenses(expenses), [expenses]);

  if (expenses.length === 0) {
    return (
      <motion.div
        variants={rv(FADE_VARIANTS, reduced)}
        initial="hidden"
        animate="show"
        className="flex flex-col items-center gap-2.5 rounded-2xl border border-dashed border-border/60 bg-card/40 py-10 text-center backdrop-blur-sm"
      >
        <Receipt className="h-8 w-8 text-muted-foreground/30" aria-hidden="true" />
        <p className="text-sm font-medium text-muted-foreground">No expenses yet</p>
        <Link
          to={`/trips/${tripId}/expenses`}
          className="mt-1 text-xs font-medium text-primary hover:underline"
        >
          Add your first expense →
        </Link>
      </motion.div>
    );
  }

  return (
    <section aria-label="Recent transactions">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Transactions
        </h2>
        <Link
          to={`/trips/${tripId}/expenses`}
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          Manage all
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      <div className="space-y-6">
        <AnimatePresence initial={false}>
          {groups.map((group) => (
            <motion.div
              key={group.dateKey}
              variants={rv(FADE_VARIANTS, reduced)}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              {/* Date header */}
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground">{group.label}</p>
                <p className="text-xs tabular-nums text-muted-foreground">
                  {formatCurrency(group.total, currency)}
                </p>
              </div>

              {/* Rows */}
              <motion.div
                variants={reduced ? REDUCED_VARIANTS : LIST_VARIANTS}
                initial="hidden"
                animate="show"
                className="space-y-2"
              >
                {group.rows.map((expense) => {
                  const catMeta = EXPENSE_CATEGORIES.find((c) => c.value === expense.category);
                  const chipCls = CAT_CHIP[expense.category] ?? CAT_CHIP.misc;

                  return (
                    <motion.div
                      key={expense.id}
                      variants={rv(LIST_ITEM_VARIANTS, reduced)}
                      className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/60 px-4 py-3 backdrop-blur-sm"
                    >
                      {/* Emoji */}
                      <span className="shrink-0 text-xl" role="img" aria-label={catMeta?.label}>
                        {catMeta?.emoji ?? '💰'}
                      </span>

                      {/* Title + meta */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {expense.title}
                        </p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                          <span
                            className={cn(
                              'rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                              chipCls,
                            )}
                          >
                            {catMeta?.label ?? expense.category}
                          </span>
                          {expense.receipt_url && (
                            <Paperclip className="h-3 w-3 text-muted-foreground/60" />
                          )}
                          {expense.notes && (
                            <span className="max-w-[120px] truncate text-[10px] text-muted-foreground/70">
                              {expense.notes}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Amount */}
                      <p className="shrink-0 text-sm font-bold tabular-nums text-foreground">
                        {formatCurrency(expense.amount, expense.currency)}
                      </p>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
