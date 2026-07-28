import { useMemo, useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowLeft, PlusCircle, ReceiptText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/PageHeader';
import { formatCurrency } from '@/utils/formatters';
import { EXPENSE_CATEGORIES } from '@/utils/constants';
import { useExpenseData } from '../hooks/useExpenses';
import { useGroupMembers } from '../hooks/useGroupMembers';
import { RunningTotalCard } from '../components/RunningTotalCard';
import { ExpenseFilters } from '../components/ExpenseFilters';
import { ExpenseCard } from '../components/ExpenseCard';
import { ExpenseDialog } from '../components/ExpenseDialog';
import { DeleteExpenseDialog } from '../components/DeleteExpenseDialog';
import { GroupOverview } from '../components/GroupOverview';
import { MembersPanel } from '../components/MembersPanel';
import { ExpenseAnalytics } from '../components/ExpenseAnalytics';
import type { ExpenseRow, FilterCategory, SortKey } from '../types';

function ExpenseSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-lg" />
        ))}
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function sortExpenses(list: ExpenseRow[], sort: SortKey): ExpenseRow[] {
  return [...list].sort((a, b) => {
    switch (sort) {
      case 'date-desc':
        return b.date.localeCompare(a.date) || b.created_at.localeCompare(a.created_at);
      case 'date-asc':
        return a.date.localeCompare(b.date) || a.created_at.localeCompare(b.created_at);
      case 'amount-desc':
        return b.amount - a.amount;
      case 'amount-asc':
        return a.amount - b.amount;
    }
  });
}

export default function ExpensesPage() {
  const { id: tripId } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useExpenseData(tripId!);

  const { members, ownerMemberId, addMember, removeMember, updateRole } = useGroupMembers(tripId!);

  const [activeTab, setActiveTab] = useState('overview');

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<FilterCategory>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sort, setSort] = useState<SortKey>('date-desc');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editExpense, setEditExpense] = useState<ExpenseRow | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<ExpenseRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const expenses = useMemo(() => data?.expenses ?? [], [data]);
  const tripTitle = data?.tripTitle ?? '';
  const tripCurrency = data?.tripCurrency ?? 'INR';
  const budgetMap = data?.budgetMap ?? {};

  const filtered = useMemo(() => {
    let result = expenses;
    if (category !== 'all') result = result.filter((e) => e.category === category);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (e) => e.title.toLowerCase().includes(q) || (e.notes ?? '').toLowerCase().includes(q),
      );
    }
    if (dateFrom) result = result.filter((e) => e.date >= dateFrom);
    if (dateTo) result = result.filter((e) => e.date <= dateTo);
    return sortExpenses(result, sort);
  }, [expenses, category, search, dateFrom, dateTo, sort]);

  if (isLoading) return <ExpenseSkeleton />;
  if (isError || !data) return <Navigate to="/trips" replace />;

  const hasActiveFilters = search !== '' || category !== 'all' || dateFrom !== '' || dateTo !== '';

  function clearFilters() {
    setSearch('');
    setCategory('all');
    setDateFrom('');
    setDateTo('');
  }

  function openAdd() {
    setEditExpense(undefined);
    setDialogOpen(true);
  }
  function openEdit(expense: ExpenseRow) {
    setEditExpense(expense);
    setDialogOpen(true);
  }
  function openDelete(expense: ExpenseRow) {
    setDeleteTarget(expense);
    setDeleteOpen(true);
  }

  const activeCatMeta =
    category !== 'all' ? EXPENSE_CATEGORIES.find((c) => c.value === category) : null;
  const activeBudget = category !== 'all' ? (budgetMap[category] ?? 0) : 0;
  const activeSpent = category !== 'all' ? filtered.reduce((s, e) => s + e.amount, 0) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="mt-0.5 shrink-0"
          aria-label="Back to trip"
          asChild
        >
          <Link to={`/trips/${tripId}`}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
        <PageHeader title="Expenses" description={tripTitle}>
          <Button size="sm" onClick={openAdd}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add expense
          </Button>
        </PageHeader>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="expenses">
            Expenses
            {expenses.length > 0 && (
              <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold tabular-nums leading-none text-muted-foreground">
                {expenses.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="members">
            Members
            <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold tabular-nums leading-none text-muted-foreground">
              {members.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* ── Overview tab ─────────────────────────────────────────── */}
        <TabsContent value="overview" className="mt-6">
          <GroupOverview
            data={data}
            members={members}
            ownerMemberId={ownerMemberId}
            onAddMembers={() => setActiveTab('members')}
          />
        </TabsContent>

        {/* ── Expenses tab ─────────────────────────────────────────── */}
        <TabsContent value="expenses" className="mt-6 space-y-6">
          {/* Running totals */}
          <RunningTotalCard expenses={expenses} currency={tripCurrency} />

          {/* Filters */}
          <ExpenseFilters
            search={search}
            onSearch={setSearch}
            category={category}
            onCategory={setCategory}
            dateFrom={dateFrom}
            onDateFrom={setDateFrom}
            dateTo={dateTo}
            onDateTo={setDateTo}
            sort={sort}
            onSort={setSort}
            onClear={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />

          {/* Budget vs Actual banner */}
          {activeCatMeta && activeBudget > 0 && (
            <div className="rounded-lg border bg-muted/40 px-4 py-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {activeCatMeta.emoji} {activeCatMeta.label} budget
                </span>
                <span
                  className={`font-semibold tabular-nums ${activeSpent > activeBudget ? 'text-destructive' : ''}`}
                >
                  {formatCurrency(activeSpent, tripCurrency)} /{' '}
                  {formatCurrency(activeBudget, tripCurrency)}
                </span>
              </div>
              <div
                className="mt-2 h-2 w-full overflow-hidden rounded-full bg-background"
                role="progressbar"
                aria-label={`${activeCatMeta.label} budget utilisation`}
                aria-valuenow={Math.min(Math.round((activeSpent / activeBudget) * 100), 100)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    activeSpent >= activeBudget ? 'bg-destructive' : 'bg-emerald-500'
                  }`}
                  style={{
                    width: `${Math.min(Math.round((activeSpent / activeBudget) * 100), 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Expense list */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed py-16 text-center">
              <ReceiptText className="h-10 w-10 text-muted-foreground opacity-40" />
              <div className="space-y-1">
                <p className="font-medium">
                  {expenses.length === 0 ? 'No expenses yet' : 'No expenses match your filters'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {expenses.length === 0
                    ? 'Track your first expense to get started'
                    : 'Try adjusting your search or filters'}
                </p>
              </div>
              {expenses.length === 0 && (
                <Button size="sm" onClick={openAdd}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add your first expense
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {filtered.length} expense{filtered.length !== 1 ? 's' : ''}
                {hasActiveFilters && ` matching filters`}
                {' · '}
                <span className="font-medium tabular-nums">
                  {formatCurrency(
                    filtered.reduce((s, e) => s + e.amount, 0),
                    tripCurrency,
                  )}
                </span>
              </p>
              {filtered.map((expense) => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  budgetAllocated={budgetMap[expense.category] ?? 0}
                  onEdit={openEdit}
                  onDelete={openDelete}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Members tab ──────────────────────────────────────────── */}
        <TabsContent value="members" className="mt-6">
          <MembersPanel
            members={members}
            onAdd={addMember}
            onRemove={removeMember}
            onUpdateRole={updateRole}
          />
        </TabsContent>

        {/* ── Analytics tab ────────────────────────────────────────── */}
        <TabsContent value="analytics" className="mt-6">
          <ExpenseAnalytics
            expenses={expenses}
            currency={tripCurrency}
            members={members}
            ownerMemberId={ownerMemberId}
            tripStartDate={data.tripStartDate}
            tripEndDate={data.tripEndDate}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <ExpenseDialog
        tripId={tripId!}
        tripCurrency={tripCurrency}
        expense={editExpense}
        open={dialogOpen}
        members={members}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditExpense(undefined);
        }}
      />
      <DeleteExpenseDialog
        tripId={tripId!}
        expense={deleteTarget}
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeleteTarget(null);
        }}
      />
    </div>
  );
}
