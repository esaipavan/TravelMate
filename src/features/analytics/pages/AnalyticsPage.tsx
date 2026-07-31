import { useState, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { BarChart2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { rv, FADE_VARIANTS } from '@/lib/motion';
import { useAnalyticsData } from '../hooks/useAnalytics';
import { DEFAULT_ANALYTICS_FILTERS } from '../types';
import type { AnalyticsFilters } from '../types';
import { AnalyticsSkeleton } from '../components/AnalyticsSkeleton';
import { AnalyticsKPIGrid } from '../components/AnalyticsKPIGrid';
import { AnalyticsInsightsGrid } from '../components/AnalyticsInsightsGrid';
import { AnalyticsDateRangeSelector } from '../components/AnalyticsDateRangeSelector';
import { SpendingTrendChart } from '../components/charts/SpendingTrendChart';
import { CategoryDonutChart } from '../components/charts/CategoryDonutChart';
import { BudgetComparisonChart } from '../components/charts/BudgetComparisonChart';
import { TripVelocityChart } from '../components/charts/TripVelocityChart';
import { DestinationRatingsChart } from '../components/charts/DestinationRatingsChart';
import { ReminderStatusChart } from '../components/charts/ReminderStatusChart';

/* ── Empty state ──────────────────────────────────────────────── */
function AnalyticsEmptyState() {
  return (
    <motion.div
      variants={FADE_VARIANTS}
      initial="hidden"
      animate="show"
      className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 bg-card/40 px-6 py-20 text-center backdrop-blur-sm"
    >
      <div className="bg-gradient-premium mb-6 flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg">
        <BarChart2 className="h-7 w-7" aria-hidden="true" />
      </div>
      <h2 className="text-xl font-bold text-foreground">No trips yet</h2>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        Create your first trip to start seeing analytics, spending trends, and travel insights.
      </p>
      <Button asChild className="mt-6" size="sm">
        <Link to="/trips/new">
          <Plus className="mr-1.5 h-4 w-4" />
          Create a Trip
        </Link>
      </Button>
    </motion.div>
  );
}

/* ── Section wrapper ──────────────────────────────────────────── */
function Section({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      variants={rv(FADE_VARIANTS, reduced)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
    >
      {children}
    </motion.div>
  );
}

/* ── CSV builder ──────────────────────────────────────────────── */
function buildCSV(
  kpis: ReturnType<typeof useAnalyticsData>['kpis'],
  currency: string,
  monthlyExpenses: { month: string; amount: number }[],
): string {
  const rows: string[][] = [
    ['Metric', 'Value'],
    ['Total Trips', String(kpis.totalTrips)],
    ['Upcoming Trips', String(kpis.upcomingTrips)],
    ['Completed Trips', String(kpis.completedTrips)],
    ['Countries Visited', String(kpis.countriesVisited)],
    ['Total Budget', `${currency} ${kpis.totalBudget.toFixed(2)}`],
    ['Total Expenses', `${currency} ${kpis.totalExpenses.toFixed(2)}`],
    ['Budget Remaining', `${currency} ${kpis.budgetRemaining.toFixed(2)}`],
    ['Avg Trip Cost', `${currency} ${kpis.avgTripCost.toFixed(2)}`],
    [],
    ['Month', 'Expenses'],
    ...monthlyExpenses.map((d) => [d.month, String(d.amount)]),
  ];
  return rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
}

/* ── Page ─────────────────────────────────────────────────────── */
export default function AnalyticsPage() {
  const [filters, setFilters] = useState<AnalyticsFilters>(DEFAULT_ANALYTICS_FILTERS);

  const {
    isLoading,
    trips,
    filteredTrips,
    currency,
    kpis,
    monthlyExpenses,
    expenseByCategory,
    budgetVsActual,
    tripsPerMonth,
    journalRatings,
    reminderStatus,
    insights,
  } = useAnalyticsData(filters);

  const handleFilters = useCallback((partial: Partial<AnalyticsFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleExportPDF = useCallback(() => {
    window.print();
  }, []);

  const handleExportCSV = useCallback(() => {
    const csv = buildCSV(kpis, currency, monthlyExpenses);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'travel-analytics.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  }, [kpis, currency, monthlyExpenses]);

  if (isLoading) return <AnalyticsSkeleton />;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader title="Analytics" description="Executive travel intelligence dashboard" />
      </div>

      {/* Date range + export */}
      <AnalyticsDateRangeSelector
        filters={filters}
        onFilters={handleFilters}
        onExportCSV={handleExportCSV}
        onExportPDF={handleExportPDF}
        tripCount={filteredTrips.length}
      />

      {/* Empty state */}
      {trips.length === 0 ? (
        <AnalyticsEmptyState />
      ) : (
        <>
          {/* KPI grid */}
          <AnalyticsKPIGrid kpis={kpis} currency={currency} isLoaded={!isLoading} />

          {/* Hero — Spending trend */}
          <Section>
            <SpendingTrendChart data={monthlyExpenses} currency={currency} />
          </Section>

          {/* 2 × 2 chart grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Section>
              <CategoryDonutChart data={expenseByCategory} currency={currency} />
            </Section>
            <Section>
              <BudgetComparisonChart data={budgetVsActual} currency={currency} />
            </Section>
            <Section>
              <TripVelocityChart data={tripsPerMonth} />
            </Section>
            <Section>
              <ReminderStatusChart data={reminderStatus} />
            </Section>
          </div>

          {/* Full-width destination ratings */}
          <Section>
            <DestinationRatingsChart data={journalRatings} />
          </Section>

          {/* Insights grid */}
          <AnalyticsInsightsGrid insights={insights} currency={currency} />
        </>
      )}
    </div>
  );
}
