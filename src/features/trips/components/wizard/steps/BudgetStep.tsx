import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { rv, FADE_VARIANTS, LIST_VARIANTS, LIST_ITEM_VARIANTS } from '@/lib/motion';
import { formatCurrency } from '@/utils/formatters';
import { Input } from '@/components/ui/input';
import { getCurrencyMeta, CURRENCIES } from '../destinationData';
import {
  useWizard,
  BUDGET_CATEGORIES,
  parseBudgetValue,
  isBudgetValueValid,
  allocatedTotal,
} from '../WizardContext';
import type { BudgetCategoryKey } from '../WizardContext';

/* ── Step ────────────────────────────────────────────────────────── */

export function BudgetStep() {
  const reduced = useReducedMotion();
  const { state, dispatch } = useWizard();

  const meta = getCurrencyMeta(state.currency);
  const { total, breakdown } = state.budget;

  const totalValid = isBudgetValueValid(total);
  const totalValue = parseBudgetValue(total);
  const allocated = allocatedTotal(breakdown);
  const remaining = totalValue !== null ? totalValue - allocated : null;

  function handleTotalChange(v: string) {
    dispatch({ type: 'SET_BUDGET_TOTAL', value: v });
  }

  function handleCategoryChange(k: BudgetCategoryKey, v: string) {
    dispatch({ type: 'SET_BUDGET_CATEGORY', category: k, value: v });
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <motion.p
          className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary"
          variants={rv(FADE_VARIANTS, reduced)}
          initial="hidden"
          animate="show"
        >
          Step 4 of 5
        </motion.p>
        <motion.h1
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          variants={rv(FADE_VARIANTS, reduced)}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.05 }}
        >
          What's your budget?
        </motion.h1>
        <motion.p
          className="mt-2 text-base text-muted-foreground"
          variants={rv(FADE_VARIANTS, reduced)}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.1 }}
        >
          Enter a total — you can always adjust it later. This step is optional.
        </motion.p>
      </div>

      {/* Currency selector */}
      <div className="flex items-center gap-2">
        <label htmlFor="wizard-currency" className="text-sm font-medium text-foreground">
          Currency
        </label>
        <select
          id="wizard-currency"
          value={state.currency}
          onChange={(e) => dispatch({ type: 'SET_CURRENCY', currency: e.target.value })}
          className={[
            'rounded-xl border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground',
            'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
          ].join(' ')}
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.symbol} {c.code} — {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Total budget */}
      <motion.div
        className="space-y-2 rounded-3xl border border-border/60 bg-card p-5 shadow-sm"
        variants={rv(FADE_VARIANTS, reduced)}
        initial="hidden"
        animate="show"
      >
        <label htmlFor="wizard-budget-total" className="text-sm font-semibold text-foreground">
          Total trip budget
        </label>
        <Input
          id="wizard-budget-total"
          type="number"
          inputMode="decimal"
          min={0}
          step="1"
          placeholder="e.g. 50000"
          startIcon={<span aria-hidden="true">{meta.symbol}</span>}
          value={total}
          onChange={(e) => handleTotalChange(e.target.value)}
          error={!totalValid}
          aria-invalid={!totalValid}
          aria-describedby={!totalValid ? 'wizard-budget-total-error' : undefined}
        />
        {!totalValid ? (
          <p id="wizard-budget-total-error" className="text-xs text-destructive" role="alert">
            Enter a valid amount, 0 or more.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Optional — you can create your trip without a budget.
          </p>
        )}
      </motion.div>

      {/* Optional breakdown */}
      <motion.div
        className="space-y-4 rounded-3xl border border-border/60 bg-card p-5 shadow-sm"
        variants={rv(LIST_VARIANTS, reduced)}
        initial="hidden"
        animate="show"
      >
        <div>
          <p className="text-sm font-semibold text-foreground">Optional budget breakdown</p>
          <p className="text-xs text-muted-foreground">
            Split your total across categories, if you'd like. Skip this if you're not sure yet.
          </p>
        </div>

        <div className="space-y-3">
          {BUDGET_CATEGORIES.map((cat) => {
            const raw = breakdown[cat.key];
            const valid = isBudgetValueValid(raw);
            return (
              <motion.div
                key={cat.key}
                className="space-y-1"
                variants={rv(LIST_ITEM_VARIANTS, reduced)}
              >
                <label
                  htmlFor={`wizard-budget-${cat.key}`}
                  className="flex items-center gap-2 text-sm font-medium text-foreground"
                >
                  <span aria-hidden="true">{cat.icon}</span>
                  {cat.label}
                </label>
                <Input
                  id={`wizard-budget-${cat.key}`}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="1"
                  placeholder="0"
                  startIcon={<span aria-hidden="true">{meta.symbol}</span>}
                  value={raw}
                  onChange={(e) => handleCategoryChange(cat.key, e.target.value)}
                  error={!valid}
                  aria-invalid={!valid}
                  aria-describedby={!valid ? `wizard-budget-${cat.key}-error` : undefined}
                />
                {!valid && (
                  <p
                    id={`wizard-budget-${cat.key}-error`}
                    className="text-xs text-destructive"
                    role="alert"
                  >
                    Enter a valid amount, 0 or more.
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Allocated / remaining — only shown once it's meaningful */}
        {allocated > 0 && (
          <div className="space-y-1.5 border-t border-border/60 pt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Allocated</span>
              <span className="font-semibold tabular-nums text-foreground">
                {formatCurrency(allocated, state.currency)}
              </span>
            </div>
            {remaining !== null && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Remaining</span>
                <span
                  className={cn(
                    'font-semibold tabular-nums',
                    remaining < 0 ? 'text-destructive' : 'text-foreground',
                  )}
                >
                  {formatCurrency(remaining, state.currency)}
                </span>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
