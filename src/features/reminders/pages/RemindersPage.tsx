import { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { rv, PAGE_VARIANTS } from '@/lib/motion';
import { addDays, isAfter } from 'date-fns';
import { parseLocalDate } from '@/utils/formatters';
import {
  Bell,
  Plus,
  Search,
  SlidersHorizontal,
  X,
  LayoutGrid,
  List,
  CalendarDays,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { ErrorState } from '@/components/shared/ErrorState';
import {
  useReminders,
  useReminderTrips,
  useCreateReminder,
  useUpdateReminder,
  useMarkComplete,
  useSnoozeReminder,
  useDeleteReminder,
} from '../hooks/useReminders';
import { useNotifications } from '../hooks/useNotifications';
import { ReminderStats } from '../components/ReminderStats';
import { ReminderCard, ReminderListItem } from '../components/ReminderCard';
import { ReminderDialog } from '../components/ReminderDialog';
import { ReminderCalendar, DayDetail } from '../components/ReminderCalendar';
import {
  REMINDER_TYPES,
  PRIORITY_ORDER,
  getEffectiveStatus,
  type ReminderRow,
  type ReminderFormValues,
  type ReminderFilters,
  type ReminderView,
} from '../types';

// ── Skeleton ──────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-52 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DEFAULT_FILTERS: ReminderFilters = {
  search: '',
  tripId: '',
  type: '',
  priority: '',
  status: '',
  upcoming: false,
  sortOrder: 'date',
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RemindersPage() {
  const reduced = useReducedMotion();
  const { data: reminders = [], isLoading, isError, refetch } = useReminders();
  const { data: trips = [] } = useReminderTrips();

  const createMutation = useCreateReminder();
  const updateMutation = useUpdateReminder();
  const completeMutation = useMarkComplete();
  const snoozeMutation = useSnoozeReminder();
  const deleteMutation = useDeleteReminder();

  useNotifications(reminders);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editReminder, setEditReminder] = useState<ReminderRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ReminderRow | null>(null);
  const [filters, setFilters] = useState<ReminderFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState<ReminderView>('card');
  const [selectedDay, setSelectedDay] = useState<{ date: Date; items: ReminderRow[] } | null>(null);

  const tripMap = useMemo(() => Object.fromEntries(trips.map((t) => [t.id, t.title])), [trips]);

  // ── Filtered / sorted list ──────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const now7 = addDays(new Date(), 7);
    let result = [...reminders];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (r) => r.title.toLowerCase().includes(q) || (r.description ?? '').toLowerCase().includes(q),
      );
    }

    if (filters.tripId) result = result.filter((r) => r.trip_id === filters.tripId);
    if (filters.type) result = result.filter((r) => r.type === filters.type);
    if (filters.priority) result = result.filter((r) => r.priority === filters.priority);

    if (filters.status) {
      result = result.filter((r) => getEffectiveStatus(r) === filters.status);
    }

    if (filters.upcoming) {
      result = result.filter((r) => {
        if (r.status === 'completed') return false;
        try {
          return isAfter(now7, parseLocalDate(r.reminder_date));
        } catch {
          return false;
        }
      });
    }

    result.sort((a, b) => {
      switch (filters.sortOrder) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'date':
          return a.reminder_date.localeCompare(b.reminder_date);
        case 'priority':
          return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        default:
          return 0;
      }
    });

    return result;
  }, [reminders, filters]);

  const hasActiveFilter =
    !!filters.search ||
    !!filters.tripId ||
    !!filters.type ||
    !!filters.priority ||
    !!filters.status ||
    filters.upcoming;

  const overdueCount = useMemo(
    () => reminders.filter((r) => getEffectiveStatus(r) === 'overdue').length,
    [reminders],
  );

  // ── Handlers ────────────────────────────────────────────────────────────────

  function openCreate() {
    setEditReminder(null);
    setDialogOpen(true);
  }

  function openEdit(r: ReminderRow) {
    setEditReminder(r);
    setDialogOpen(true);
  }

  async function handleSave(values: ReminderFormValues) {
    if (editReminder) {
      await updateMutation.mutateAsync({ id: editReminder.id, values });
    } else {
      await createMutation.mutateAsync(values);
    }
    setDialogOpen(false);
    setEditReminder(null);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id);
    setDeleteTarget(null);
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <motion.div
      className="space-y-6"
      variants={rv(PAGE_VARIANTS, reduced)}
      initial="hidden"
      animate="show"
    >
      <PageHeader title="Reminders" description="Stay on top of your travel tasks and deadlines">
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Reminder
        </Button>
      </PageHeader>

      {isLoading ? (
        <PageSkeleton />
      ) : isError ? (
        <ErrorState
          title="Couldn't load reminders"
          message="We ran into a problem loading your reminders. Please try again."
          onRetry={() => void refetch()}
        />
      ) : (
        <>
          {reminders.length > 0 && <ReminderStats reminders={reminders} />}

          {/* Overdue alert */}
          {overdueCount > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-2 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {overdueCount} overdue {overdueCount === 1 ? 'reminder' : 'reminders'} — take action.
              <button
                type="button"
                className="ml-auto text-xs underline-offset-2 hover:underline"
                onClick={() => setFilters((f) => ({ ...f, status: 'overdue' }))}
              >
                Show only overdue
              </button>
            </div>
          )}

          {/* Toolbar */}
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search reminders…"
                  value={filters.search}
                  onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                />
              </div>

              {/* View toggles */}
              <div className="flex rounded-md border">
                {(
                  [
                    { v: 'card' as ReminderView, icon: LayoutGrid },
                    { v: 'list' as ReminderView, icon: List },
                    { v: 'calendar' as ReminderView, icon: CalendarDays },
                  ] as const
                ).map(({ v, icon: Icon }) => {
                  const labels: Record<ReminderView, string> = {
                    card: 'Card view',
                    list: 'List view',
                    calendar: 'Calendar view',
                  };
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setView(v)}
                      aria-label={labels[v]}
                      aria-pressed={view === v}
                      className={`flex h-9 w-9 items-center justify-center transition-colors first:rounded-l-md last:rounded-r-md ${
                        view === v
                          ? 'bg-accent text-accent-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </button>
                  );
                })}
              </div>

              <Button
                variant={showFilters ? 'secondary' : 'outline'}
                size="icon"
                onClick={() => setShowFilters((v) => !v)}
                aria-label="More filters"
                aria-pressed={showFilters}
              >
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              </Button>

              {hasActiveFilter && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  aria-label="Clear filters"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </Button>
              )}
            </div>

            {/* Expanded filters */}
            {showFilters && (
              <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-card px-4 py-3">
                {/* Type */}
                <div className="flex items-center gap-2">
                  <Label className="shrink-0 text-xs text-muted-foreground">Type</Label>
                  <Select
                    value={filters.type || '_all'}
                    onValueChange={(v) =>
                      setFilters((f) => ({ ...f, type: v === '_all' ? '' : v }))
                    }
                  >
                    <SelectTrigger className="h-8 w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_all">All types</SelectItem>
                      {REMINDER_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.emoji} {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority */}
                <div className="flex items-center gap-2">
                  <Label className="shrink-0 text-xs text-muted-foreground">Priority</Label>
                  <Select
                    value={filters.priority || '_all'}
                    onValueChange={(v) =>
                      setFilters((f) => ({ ...f, priority: v === '_all' ? '' : v }))
                    }
                  >
                    <SelectTrigger className="h-8 w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_all">All</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2">
                  <Label className="shrink-0 text-xs text-muted-foreground">Status</Label>
                  <Select
                    value={filters.status || '_all'}
                    onValueChange={(v) =>
                      setFilters((f) => ({ ...f, status: v === '_all' ? '' : v }))
                    }
                  >
                    <SelectTrigger className="h-8 w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_all">All</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Trip */}
                {trips.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Label className="shrink-0 text-xs text-muted-foreground">Trip</Label>
                    <Select
                      value={filters.tripId || '_all'}
                      onValueChange={(v) =>
                        setFilters((f) => ({ ...f, tripId: v === '_all' ? '' : v }))
                      }
                    >
                      <SelectTrigger className="h-8 w-44">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_all">All trips</SelectItem>
                        {trips.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Sort */}
                <div className="flex items-center gap-2">
                  <Label className="shrink-0 text-xs text-muted-foreground">Sort</Label>
                  <Select
                    value={filters.sortOrder}
                    onValueChange={(v) =>
                      setFilters((f) => ({ ...f, sortOrder: v as ReminderFilters['sortOrder'] }))
                    }
                  >
                    <SelectTrigger className="h-8 w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Reminder Date</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="newest">Newest first</SelectItem>
                      <SelectItem value="oldest">Oldest first</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Upcoming toggle */}
                <button
                  type="button"
                  onClick={() => setFilters((f) => ({ ...f, upcoming: !f.upcoming }))}
                  aria-pressed={filters.upcoming}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    filters.upcoming
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Next 7 days
                </button>
              </div>
            )}
          </div>

          {/* Count */}
          {reminders.length > 0 && view !== 'calendar' && (
            <p className="text-sm text-muted-foreground">
              {filtered.length === reminders.length
                ? `${reminders.length} ${reminders.length === 1 ? 'reminder' : 'reminders'}`
                : `${filtered.length} of ${reminders.length} reminders`}
            </p>
          )}

          {/* Empty — no reminders */}
          {reminders.length === 0 && (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border/60 py-20 text-center">
              <Bell className="h-10 w-10 text-muted-foreground opacity-40" />
              <div className="space-y-1">
                <p className="font-medium">No reminders yet</p>
                <p className="text-sm text-muted-foreground">
                  Create reminders to stay on top of your travel tasks.
                </p>
              </div>
              <Button onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Create first reminder
              </Button>
            </div>
          )}

          {/* Filter empty */}
          {reminders.length > 0 && filtered.length === 0 && view !== 'calendar' && (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border/60 py-16 text-center">
              <Search className="h-8 w-8 text-muted-foreground opacity-40" />
              <p className="font-medium">No reminders match your filters</p>
              <Button variant="outline" size="sm" onClick={() => setFilters(DEFAULT_FILTERS)}>
                Clear filters
              </Button>
            </div>
          )}

          {/* Calendar view */}
          {view === 'calendar' && reminders.length > 0 && (
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <ReminderCalendar
                  reminders={reminders}
                  onDayClick={(date, items) => setSelectedDay({ date, items })}
                />
              </div>
              {selectedDay ? (
                <DayDetail
                  date={selectedDay.date}
                  reminders={selectedDay.items}
                  onEdit={openEdit}
                  onToggle={(id, complete) => completeMutation.mutate({ id, complete })}
                />
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                  <CalendarDays className="mb-2 h-8 w-8 opacity-40" />
                  Click a day with reminders to see details
                </div>
              )}
            </div>
          )}

          {/* Card view */}
          {view === 'card' && filtered.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((r) => (
                <ReminderCard
                  key={r.id}
                  reminder={r}
                  tripTitle={r.trip_id ? tripMap[r.trip_id] : undefined}
                  onEdit={openEdit}
                  onDelete={setDeleteTarget}
                  onToggle={(id, complete) => completeMutation.mutate({ id, complete })}
                  onSnooze={(id, minutes) => snoozeMutation.mutate({ id, minutes })}
                />
              ))}
            </div>
          )}

          {/* List view */}
          {view === 'list' && filtered.length > 0 && (
            <div className="space-y-2">
              {filtered.map((r) => (
                <ReminderListItem
                  key={r.id}
                  reminder={r}
                  tripTitle={r.trip_id ? tripMap[r.trip_id] : undefined}
                  onEdit={openEdit}
                  onDelete={setDeleteTarget}
                  onToggle={(id, complete) => completeMutation.mutate({ id, complete })}
                  onSnooze={(id, minutes) => snoozeMutation.mutate({ id, minutes })}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Create / Edit dialog */}
      <ReminderDialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setEditReminder(null);
        }}
        reminder={editReminder}
        trips={trips}
        onSave={handleSave}
        isPending={isSaving}
      />

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete reminder?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.title}" will be permanently deleted. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
