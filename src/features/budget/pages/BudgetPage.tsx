import { useState, useCallback, useMemo } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Sparkles, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { rv, FADE_VARIANTS, LIST_VARIANTS, REDUCED_VARIANTS } from '@/lib/motion';
import { tripDuration } from '@/utils/formatters';
import { useTrip } from '@/features/trips/hooks/useTrips';
import { useExpenseData } from '@/features/expenses/hooks/useExpenses';
import { useBudget } from '../hooks/useBudget';
import { SetBudgetDialog } from '../components/SetBudgetDialog';
import { AIBudgetEstimator } from '../components/AIBudgetEstimator';
import { BudgetWorkspaceSkeleton } from '../components/premium/BudgetWorkspaceSkeleton';
import { BudgetFinancialSummary } from '../components/premium/BudgetFinancialSummary';
import { BudgetHealthMeter } from '../components/premium/BudgetHealthMeter';
import { BudgetCategoryDonut } from '../components/premium/BudgetCategoryDonut';
import { BudgetSpendingTimeline } from '../components/premium/BudgetSpendingTimeline';
import { BudgetAllocationCard } from '../components/premium/BudgetAllocationCard';
import { BudgetAIPanel } from '../components/premium/BudgetAIPanel';
import { BudgetTransactionList } from '../components/premium/BudgetTransactionList';
import { BudgetEmptyState } from '../components/premium/BudgetEmptyState';
import type { CategoryBudgetItem } from '../types';

export default function BudgetPage() {
  const { id: tripId } = useParams<{ id: string }>();
  const reduced = useReducedMotion();

  const { data: budgetData, isLoading: budgetLoading, isError } = useBudget(tripId!);
  const { data: expenseData, isLoading: expenseLoading } = useExpenseData(tripId!);
  const { data: trip } = useTrip(tripId!);

  const [editItem, setEditItem] = useState<CategoryBudgetItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  const isLoading = budgetLoading || expenseLoading;

  const openEdit = useCallback((item: CategoryBudgetItem) => {
    setEditItem(item);
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback((open: boolean) => {
    setDialogOpen(open);
    if (!open) setEditItem(null);
  }, []);

  // Must be before early returns — hooks cannot be called conditionally
  const days = trip ? tripDuration(trip.start_date, trip.end_date) : 0;
  const dailyBudget = useMemo(() => {
    if (!budgetData) return 0;
    const budget = budgetData.summary.tripBudget ?? budgetData.summary.totalAllocated;
    return days > 0 && budget > 0 ? budget / days : 0;
  }, [budgetData, days]);

  if (isLoading) return <BudgetWorkspaceSkeleton />;
  if (isError || !budgetData) return <Navigate to="/trips" replace />;

  const { items, summary, tripStartDate, tripEndDate } = budgetData;
  const expenses = expenseData?.expenses ?? [];
  const currency = summary.tripCurrency;

  const activeItems = items.filter((i) => i.allocated > 0 || i.spent > 0);
  const inactiveItems = items.filter((i) => i.allocated === 0 && i.spent === 0);

  const isEmpty = activeItems.length === 0 && expenses.length === 0;

  return (
    <div className="space-y-8 pb-12">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start gap-3">
        <Button variant="ghost" size="icon" className="mt-0.5 shrink-0" asChild>
          <Link to={`/trips/${tripId}`} aria-label="Back to trip">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold text-foreground">Budget Workspace</h1>
          <p className="truncate text-sm text-muted-foreground">{summary.tripTitle}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => setAiOpen(true)}
            disabled={!trip}
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI Estimate
          </Button>

          {inactiveItems.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  Add Category
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {inactiveItems.map((item) => (
                  <DropdownMenuItem key={item.category} onClick={() => openEdit(item)}>
                    <span className="mr-2">{item.emoji}</span>
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* ── Empty state ── */}
      {isEmpty ? (
        <BudgetEmptyState tripId={tripId!} onOpenAI={() => setAiOpen(true)} hasTrip={!!trip} />
      ) : (
        <>
          {/* ── KPI summary ── */}
          <BudgetFinancialSummary summary={summary} isLoaded={!isLoading} />

          {/* ── Health meter ── */}
          <BudgetHealthMeter
            summary={summary}
            tripStartDate={tripStartDate}
            tripEndDate={tripEndDate}
          />

          {/* ── 2-col: donut + AI panel ── */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <BudgetCategoryDonut items={items} currency={currency} />
            <BudgetAIPanel
              summary={summary}
              items={items}
              onOpenAI={() => setAiOpen(true)}
              hasTrip={!!trip}
            />
          </div>

          {/* ── Active category allocations ── */}
          {activeItems.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Category Allocations
              </h2>
              <motion.div
                variants={reduced ? REDUCED_VARIANTS : LIST_VARIANTS}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-20px' }}
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {activeItems.map((item) => (
                  <BudgetAllocationCard
                    key={item.category}
                    tripId={tripId!}
                    item={item}
                    onEdit={openEdit}
                  />
                ))}
              </motion.div>
            </section>
          )}

          {/* ── Unbudgeted categories (collapsible) ── */}
          {inactiveItems.length > 0 && (
            <section>
              <button
                onClick={() => setShowInactive((p) => !p)}
                className="mb-3 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-widest text-muted-foreground/70 transition-colors hover:text-muted-foreground"
              >
                {showInactive ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
                Unbudgeted Categories ({inactiveItems.length})
              </button>

              <AnimatePresence initial={false}>
                {showInactive && (
                  <motion.div
                    variants={rv(FADE_VARIANTS, reduced)}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                  >
                    <motion.div
                      variants={reduced ? REDUCED_VARIANTS : LIST_VARIANTS}
                      initial="hidden"
                      animate="show"
                      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                    >
                      {inactiveItems.map((item) => (
                        <BudgetAllocationCard
                          key={item.category}
                          tripId={tripId!}
                          item={item}
                          onEdit={openEdit}
                        />
                      ))}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          )}

          {/* ── Spending timeline ── */}
          <BudgetSpendingTimeline
            expenses={expenses}
            tripStartDate={tripStartDate}
            tripEndDate={tripEndDate}
            currency={currency}
            dailyBudget={dailyBudget}
          />

          {/* ── Transaction list ── */}
          <BudgetTransactionList expenses={expenses} currency={currency} tripId={tripId!} />
        </>
      )}

      {/* ── Dialogs (preserved, untouched) ── */}
      <SetBudgetDialog
        tripId={tripId!}
        item={editItem}
        summary={summary}
        open={dialogOpen}
        onOpenChange={closeDialog}
      />

      {trip && (
        <AIBudgetEstimator
          tripId={tripId!}
          destination={trip.destination}
          days={days}
          currency={currency}
          open={aiOpen}
          onOpenChange={setAiOpen}
        />
      )}
    </div>
  );
}
