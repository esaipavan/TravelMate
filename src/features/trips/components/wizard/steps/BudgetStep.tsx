import { useEffect, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles, TrendingUp } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';
import { rv, FADE_VARIANTS, LIST_VARIANTS, LIST_ITEM_VARIANTS } from '@/lib/motion';
import { formatCurrency } from '@/utils/formatters';
import { getCurrencyMeta, suggestBudget, CURRENCIES } from '../destinationData';
import { useWizard, BUDGET_CATEGORIES, totalBudget } from '../WizardContext';
import type { BudgetAllocation } from '../WizardContext';

/* ── Slider row ──────────────────────────────────────────────────── */

function SliderRow({
  catKey,
  label,
  icon,
  color,
  value,
  max,
  step,
  symbol,
  onChange,
}: {
  catKey: keyof BudgetAllocation;
  label: string;
  icon: string;
  color: string;
  value: number;
  max: number;
  step: number;
  symbol: string;
  onChange: (k: keyof BudgetAllocation, v: number) => void;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor={`budget-${catKey}`}
          className="flex items-center gap-2 text-sm font-medium text-foreground"
        >
          <span className="text-base leading-none" aria-hidden="true">
            {icon}
          </span>
          {label}
        </label>
        <span className="text-sm font-semibold tabular-nums text-foreground">
          {symbol}
          {value.toLocaleString()}
        </span>
      </div>
      <div className="relative">
        <input
          id={`budget-${catKey}`}
          type="range"
          min={0}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(catKey, Number(e.target.value))}
          aria-label={`${label} budget`}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-current"
          style={{ accentColor: color }}
        />
        {/* Visual fill */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${pct}%`,
            background: color,
            top: '50%',
            transform: 'translateY(-50%)',
            height: '8px',
          }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

/* ── Budget donut summary ────────────────────────────────────────── */

function BudgetSummary({
  budget,
  currency,
  totalUSD,
  duration,
}: {
  budget: BudgetAllocation;
  currency: string;
  totalUSD: number;
  duration: number;
}) {
  const total = totalBudget(budget);
  const meta = getCurrencyMeta(currency);
  const perDay = duration > 0 ? Math.round(total / duration) : 0;
  const suggested = totalUSD > 0 ? Math.round(totalUSD * meta.usdRate) : 0;
  const diff = suggested > 0 ? total - suggested : 0;

  return (
    <div className="space-y-3 rounded-3xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Total Budget
          </p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-foreground">
            {formatCurrency(total, currency)}
          </p>
        </div>
        {perDay > 0 && (
          <div className="rounded-2xl bg-primary/10 px-3 py-2 text-right">
            <p className="text-xs text-muted-foreground">Per day</p>
            <p className="text-sm font-bold tabular-nums text-primary">
              {meta.symbol}
              {perDay.toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {suggested > 0 && (
        <div
          className={[
            'flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium',
            diff > 0
              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
              : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
          ].join(' ')}
        >
          <TrendingUp className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {diff === 0
            ? 'Matches AI estimate'
            : diff > 0
              ? `${meta.symbol}${Math.abs(diff).toLocaleString()} above AI estimate`
              : `${meta.symbol}${Math.abs(diff).toLocaleString()} below AI estimate`}
        </div>
      )}
    </div>
  );
}

/* ── Step ────────────────────────────────────────────────────────── */

export function BudgetStep() {
  const reduced = useReducedMotion();
  const { state, dispatch } = useWizard();

  const meta = getCurrencyMeta(state.currency);
  const duration = useMemo(() => {
    if (!state.startDate || !state.endDate) return 0;
    return (
      differenceInDays(
        parseISO(state.endDate + 'T00:00:00'),
        parseISO(state.startDate + 'T00:00:00'),
      ) + 1
    );
  }, [state.startDate, state.endDate]);

  const avgDailyUSD = state.destinationMeta?.avgDailyBudget ?? 80;
  const totalUSD = avgDailyUSD * duration;

  /* Auto-fill suggestions on mount if budget is all-zero */
  useEffect(() => {
    if (totalBudget(state.budget) === 0 && duration > 0) {
      const suggested = suggestBudget(avgDailyUSD, duration, state.currency);
      const newBudget: BudgetAllocation = {
        accommodation: suggested['accommodation'] ?? 0,
        food: suggested['food'] ?? 0,
        transport: suggested['transport'] ?? 0,
        activities: suggested['activities'] ?? 0,
        shopping: suggested['shopping'] ?? 0,
        emergency: suggested['emergency'] ?? 0,
        visa: suggested['visa'] ?? 0,
        insurance: suggested['insurance'] ?? 0,
      };
      dispatch({ type: 'SET_BUDGET_ALL', budget: newBudget });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleCategoryChange(k: keyof BudgetAllocation, v: number) {
    dispatch({ type: 'SET_BUDGET', category: k, value: v });
  }

  function handleFillSuggestion() {
    const suggested = suggestBudget(avgDailyUSD, duration, state.currency);
    const newBudget: BudgetAllocation = {
      accommodation: suggested['accommodation'] ?? 0,
      food: suggested['food'] ?? 0,
      transport: suggested['transport'] ?? 0,
      activities: suggested['activities'] ?? 0,
      shopping: suggested['shopping'] ?? 0,
      emergency: suggested['emergency'] ?? 0,
      visa: suggested['visa'] ?? 0,
      insurance: suggested['insurance'] ?? 0,
    };
    dispatch({ type: 'SET_BUDGET_ALL', budget: newBudget });
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
          Step 4 of 7
        </motion.p>
        <motion.h1
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          variants={rv(FADE_VARIANTS, reduced)}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.05 }}
        >
          Plan your budget
        </motion.h1>
        <motion.p
          className="mt-2 text-base text-muted-foreground"
          variants={rv(FADE_VARIANTS, reduced)}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.1 }}
        >
          Drag the sliders to allocate your budget across categories. We've pre-filled AI estimates.
        </motion.p>
      </div>

      {/* Currency selector + AI fill */}
      <div className="flex flex-wrap items-center gap-3">
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

        {duration > 0 && (
          <button
            type="button"
            onClick={handleFillSuggestion}
            className={[
              'flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5',
              'text-xs font-semibold text-primary transition-colors hover:bg-primary/10',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            ].join(' ')}
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Fill AI estimate
          </button>
        )}
      </div>

      {/* Live summary */}
      <BudgetSummary
        budget={state.budget}
        currency={state.currency}
        totalUSD={totalUSD}
        duration={duration}
      />

      {/* Sliders */}
      <motion.div
        className="space-y-6 rounded-3xl border border-border/60 bg-card p-5 shadow-sm"
        variants={rv(LIST_VARIANTS, reduced)}
        initial="hidden"
        animate="show"
      >
        {BUDGET_CATEGORIES.map((cat) => (
          <motion.div key={cat.key} variants={rv(LIST_ITEM_VARIANTS, reduced)}>
            <SliderRow
              catKey={cat.key}
              label={cat.label}
              icon={cat.icon}
              color={cat.color}
              value={state.budget[cat.key]}
              max={meta.sliderMax}
              step={meta.sliderStep}
              symbol={meta.symbol}
              onChange={handleCategoryChange}
            />
          </motion.div>
        ))}
      </motion.div>

      {duration === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          Set your travel dates first to see AI budget estimates.
        </p>
      )}
    </div>
  );
}
