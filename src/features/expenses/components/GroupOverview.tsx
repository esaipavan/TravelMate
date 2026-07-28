import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Wallet, Users, TrendingUp, Zap, ArrowRight, CalendarDays, Tag } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';
import { rv, FADE_VARIANTS, LIST_VARIANTS, LIST_ITEM_VARIANTS } from '@/lib/motion';
import { formatCurrency } from '@/utils/formatters';
import { EXPENSE_CATEGORIES } from '@/utils/constants';
import { calcBalances, calcSettlement } from '../utils/settlement';
import type { ExpenseData } from '../types';
import type { TripMember } from '../utils/settlement';

interface Props {
  data: ExpenseData;
  members: TripMember[];
  ownerMemberId: string;
  onAddMembers: () => void;
}

export function GroupOverview({ data, members, ownerMemberId, onAddMembers }: Props) {
  const reduced = useReducedMotion();
  const { expenses, tripCurrency, budgetMap, tripStartDate, tripEndDate } = data;

  const totalBudget = Object.values(budgetMap).reduce((s, v) => s + v, 0);
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const remaining = totalBudget - totalSpent;
  const perPerson = members.length > 0 ? totalSpent / members.length : totalSpent;

  const today = new Date();
  const startDate = parseISO(tripStartDate + 'T00:00:00');
  const endDate = parseISO(tripEndDate + 'T00:00:00');
  const totalDays = Math.max(differenceInDays(endDate, startDate) + 1, 1);
  const elapsedDays = Math.max(Math.min(differenceInDays(today, startDate) + 1, totalDays), 1);
  const dailyAvg = elapsedDays > 0 ? totalSpent / elapsedDays : 0;

  const catSpend = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] ?? 0) + e.amount;
    });
    return map;
  }, [expenses]);

  const topCatKey = Object.entries(catSpend).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const topCatMeta = topCatKey ? EXPENSE_CATEGORIES.find((c) => c.value === topCatKey) : null;

  const balances = useMemo(
    () => calcBalances(expenses, members, ownerMemberId),
    [expenses, members, ownerMemberId],
  );
  const settlements = useMemo(() => calcSettlement(balances), [balances]);

  const budgetUsedPct = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

  const stats = [
    {
      label: 'Total Budget',
      value: formatCurrency(totalBudget, tripCurrency),
      icon: Wallet,
      color: 'text-primary bg-primary/10',
    },
    {
      label: 'Total Spent',
      value: formatCurrency(totalSpent, tripCurrency),
      icon: TrendingUp,
      color: 'text-blue-500 bg-blue-500/10',
    },
    {
      label: remaining >= 0 ? 'Remaining' : 'Over Budget',
      value: formatCurrency(Math.abs(remaining), tripCurrency),
      icon: Zap,
      color:
        remaining >= 0
          ? 'text-emerald-600 bg-emerald-500/10'
          : 'text-destructive bg-destructive/10',
    },
    {
      label: 'Per Person',
      value: formatCurrency(perPerson, tripCurrency),
      icon: Users,
      color: 'text-orange-500 bg-orange-500/10',
    },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <motion.div
        className="grid grid-cols-2 gap-3"
        variants={rv(LIST_VARIANTS, reduced)}
        initial="hidden"
        animate="show"
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={rv(LIST_ITEM_VARIANTS, reduced)}
            className="rounded-2xl border border-border/60 bg-card p-4"
          >
            <div
              className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-xl ${stat.color.split(' ')[1]}`}
            >
              <stat.icon className={`h-4 w-4 ${stat.color.split(' ')[0]}`} aria-hidden="true" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
            <p className="mt-0.5 text-base font-bold tabular-nums leading-tight text-foreground">
              {stat.value}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Budget utilisation bar */}
      {totalBudget > 0 && (
        <motion.div
          variants={rv(FADE_VARIANTS, reduced)}
          initial="hidden"
          animate="show"
          className="rounded-2xl border border-border/60 bg-card p-4"
        >
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="font-semibold text-foreground">Budget utilisation</span>
            <span
              className={`font-semibold tabular-nums ${budgetUsedPct >= 100 ? 'text-destructive' : 'text-muted-foreground'}`}
            >
              {Math.round(budgetUsedPct)}%
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
            <motion.div
              className={`h-full rounded-full ${budgetUsedPct >= 100 ? 'bg-destructive' : 'bg-primary'}`}
              initial={{ width: 0 }}
              animate={{ width: `${budgetUsedPct}%` }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs tabular-nums text-muted-foreground">
            <span>{formatCurrency(totalSpent, tripCurrency)} spent</span>
            <span>{formatCurrency(totalBudget, tripCurrency)} total</span>
          </div>
        </motion.div>
      )}

      {/* Extra stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border/60 bg-card p-4">
          <div className="mb-1.5 flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4 text-teal-500" aria-hidden="true" />
            <p className="text-xs font-medium text-muted-foreground">Daily avg</p>
          </div>
          <p className="text-base font-bold tabular-nums text-foreground">
            {formatCurrency(dailyAvg, tripCurrency)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {elapsedDays} of {totalDays} days
          </p>
        </div>

        {topCatMeta ? (
          <div className="rounded-2xl border border-border/60 bg-card p-4">
            <div className="mb-1.5 flex items-center gap-1.5">
              <Tag className="h-4 w-4 text-violet-500" aria-hidden="true" />
              <p className="text-xs font-medium text-muted-foreground">Top category</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl leading-none" aria-hidden="true">
                {topCatMeta.emoji}
              </span>
              <div>
                <p className="text-sm font-bold text-foreground">{topCatMeta.label}</p>
                <p className="text-xs tabular-nums text-muted-foreground">
                  {formatCurrency(catSpend[topCatKey] ?? 0, tripCurrency)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 p-4">
            <p className="text-center text-xs text-muted-foreground">
              Add expenses to see top category
            </p>
          </div>
        )}
      </div>

      {/* Settlement section */}
      {members.length > 1 ? (
        <motion.div
          variants={rv(FADE_VARIANTS, reduced)}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          <h3 className="text-base font-bold text-foreground">Smart Settlement</h3>

          {settlements.length === 0 ? (
            <div className="rounded-2xl border border-border/60 bg-card p-6 text-center">
              <p className="mb-1.5 text-3xl" aria-hidden="true">
                🎉
              </p>
              <p className="text-sm font-semibold text-foreground">All settled up!</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Everyone has paid their fair share.
              </p>
            </div>
          ) : (
            <motion.div
              className="space-y-2"
              variants={rv(LIST_VARIANTS, reduced)}
              initial="hidden"
              animate="show"
            >
              {settlements.map((s, i) => (
                <motion.div
                  key={i}
                  variants={rv(LIST_ITEM_VARIANTS, reduced)}
                  className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-xs font-bold text-destructive">
                    {s.from.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-sm">
                      <span className="max-w-[80px] truncate font-semibold text-foreground">
                        {s.from.name}
                      </span>
                      <ArrowRight
                        className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <span className="max-w-[80px] truncate font-semibold text-foreground">
                        {s.to.name}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">needs to transfer</p>
                  </div>
                  <p className="shrink-0 text-base font-bold tabular-nums text-foreground">
                    {formatCurrency(s.amount, tripCurrency)}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Balance table */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground">Individual balances</h4>
            {balances.map((b) => (
              <div
                key={b.member.id}
                className="flex items-center gap-3 rounded-xl border border-border/40 bg-muted/30 px-4 py-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground">
                  {b.member.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{b.member.name}</p>
                  <p className="text-xs tabular-nums text-muted-foreground">
                    paid {formatCurrency(b.paid, tripCurrency)} · owes{' '}
                    {formatCurrency(b.owes, tripCurrency)}
                  </p>
                </div>
                <p
                  className={`shrink-0 text-sm font-bold tabular-nums ${b.net >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}
                >
                  {b.net >= 0 ? '+' : ''}
                  {formatCurrency(b.net, tripCurrency)}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      ) : (
        /* Prompt to add members */
        <motion.div
          variants={rv(FADE_VARIANTS, reduced)}
          initial="hidden"
          animate="show"
          className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-6 text-center"
        >
          <p className="mb-2 text-3xl" aria-hidden="true">
            👥
          </p>
          <p className="text-sm font-semibold text-foreground">Add members to split expenses</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Track who paid what and get automatic settlement calculations.
          </p>
          <button
            type="button"
            onClick={onAddMembers}
            className="mt-4 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Add group members
          </button>
        </motion.div>
      )}
    </div>
  );
}
