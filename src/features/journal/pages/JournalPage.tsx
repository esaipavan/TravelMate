import { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useParams, Navigate, Link } from 'react-router-dom';
import { rv, PAGE_VARIANTS } from '@/lib/motion';
import { Plus, Search, BookOpen, SlidersHorizontal, X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
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
import { useTrip } from '@/features/trips/hooks/useTrips';
import {
  useJournalEntries,
  useCreateJournalEntry,
  useUpdateJournalEntry,
  useDeleteJournalEntry,
  useToggleFavourite,
} from '../hooks/useJournal';
import { JournalStats } from '../components/JournalStats';
import { JournalEntryCard } from '../components/JournalEntryCard';
import { JournalEntryDialog } from '../components/JournalEntryDialog';
import { JournalDetailDialog } from '../components/JournalDetailDialog';
import type { JournalEntryRow, JournalFilters, JournalFormValues } from '../types';

// ── Skeleton ──────────────────────────────────────────────────────────────────

function JournalSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const DEFAULT_FILTERS: JournalFilters = {
  search: '',
  rating: null,
  favouriteOnly: false,
  sortOrder: 'newest',
};

export default function JournalPage() {
  const reduced = useReducedMotion();
  const { id: tripId } = useParams<{ id: string }>();
  const safeId = tripId ?? '';

  const { data: trip } = useTrip(safeId);
  const { data: entries = [], isLoading, isError, refetch } = useJournalEntries(safeId);

  const createMutation = useCreateJournalEntry(safeId);
  const updateMutation = useUpdateJournalEntry(safeId);
  const deleteMutation = useDeleteJournalEntry(safeId);
  const favouriteMutation = useToggleFavourite(safeId);

  // UI state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<JournalEntryRow | null>(null);
  const [viewEntry, setViewEntry] = useState<JournalEntryRow | null>(null);
  const [deleteEntry, setDeleteEntry] = useState<JournalEntryRow | null>(null);
  const [filters, setFilters] = useState<JournalFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  // ── Filtered list ───────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = [...entries];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (e) =>
          (e.title ?? '').toLowerCase().includes(q) ||
          (e.content ?? '').toLowerCase().includes(q) ||
          (e.location_name ?? '').toLowerCase().includes(q),
      );
    }
    if (filters.rating != null) {
      result = result.filter((e) => e.rating === filters.rating);
    }
    if (filters.favouriteOnly) {
      result = result.filter((e) => e.is_favourite);
    }

    result.sort((a, b) => {
      const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
      return filters.sortOrder === 'newest' ? diff : -diff;
    });

    return result;
  }, [entries, filters]);

  if (!tripId) return <Navigate to="/trips" replace />;

  const hasActiveFilter = !!filters.search || filters.rating != null || filters.favouriteOnly;

  // ── Handlers ────────────────────────────────────────────────────────────────
  function openCreate() {
    setEditEntry(null);
    setDialogOpen(true);
  }

  function openEdit(entry: JournalEntryRow) {
    setEditEntry(entry);
    setDialogOpen(true);
  }

  async function handleSave(
    values: JournalFormValues,
    existingUrls: string[],
    newFiles: File[],
    removedUrls: string[],
  ) {
    if (editEntry) {
      await updateMutation.mutateAsync({
        id: editEntry.id,
        values,
        existingUrls,
        newImages: newFiles,
        removedUrls,
      });
    } else {
      await createMutation.mutateAsync({ values, newImages: newFiles });
    }
    setDialogOpen(false);
    setEditEntry(null);
  }

  function confirmDelete(entry: JournalEntryRow) {
    setDeleteEntry(entry);
  }

  function executeDelete() {
    if (!deleteEntry) return;
    deleteMutation.mutate({
      id: deleteEntry.id,
      imageUrls: deleteEntry.image_urls ?? [],
    });
    setDeleteEntry(null);
  }

  function handleToggleFavourite(entry: JournalEntryRow) {
    favouriteMutation.mutate({ id: entry.id, isFavourite: !entry.is_favourite });
  }

  function clearFilters() {
    setFilters(DEFAULT_FILTERS);
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // ── Render ──────────────────────────────────────────────────────────────────
  if (isError)
    return (
      <ErrorState
        title="Couldn't load journal"
        message="We ran into a problem loading this trip's journal entries."
        onRetry={() => void refetch()}
      />
    );

  return (
    <motion.div
      className="space-y-6"
      variants={rv(PAGE_VARIANTS, reduced)}
      initial="hidden"
      animate="show"
    >
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
        <PageHeader title="Travel Journal" description={trip?.title ?? ''}>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            New Entry
          </Button>
        </PageHeader>
      </div>

      {/* Stats */}
      {isLoading ? (
        <JournalSkeleton />
      ) : (
        <>
          {entries.length > 0 && <JournalStats entries={entries} />}

          {/* Search + filter bar */}
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search by title, content, or destination…"
                  value={filters.search}
                  onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                />
              </div>
              <Button
                variant={showFilters ? 'secondary' : 'outline'}
                size="icon"
                onClick={() => setShowFilters((v) => !v)}
                aria-label="Toggle filters"
                aria-expanded={showFilters}
              >
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              </Button>
              {hasActiveFilter && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearFilters}
                  aria-label="Clear filters"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </Button>
              )}
            </div>

            {/* Expanded filter row */}
            {showFilters && (
              <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-card px-4 py-3">
                {/* Rating filter */}
                <div className="flex items-center gap-2">
                  <Label className="shrink-0 text-xs text-muted-foreground">Rating</Label>
                  <Select
                    value={filters.rating?.toString() ?? 'any'}
                    onValueChange={(v) =>
                      setFilters((f) => ({
                        ...f,
                        rating: v === 'any' ? null : Number(v),
                      }))
                    }
                  >
                    <SelectTrigger className="h-8 w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      {[5, 4, 3, 2, 1].map((r) => (
                        <SelectItem key={r} value={r.toString()}>
                          {'★'.repeat(r)}
                          {'☆'.repeat(5 - r)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2">
                  <Label className="shrink-0 text-xs text-muted-foreground">Sort</Label>
                  <Select
                    value={filters.sortOrder}
                    onValueChange={(v) =>
                      setFilters((f) => ({
                        ...f,
                        sortOrder: v as JournalFilters['sortOrder'],
                      }))
                    }
                  >
                    <SelectTrigger className="h-8 w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest first</SelectItem>
                      <SelectItem value="oldest">Oldest first</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Favourites */}
                <div className="flex items-center gap-2">
                  <Switch
                    id="fav-filter"
                    checked={filters.favouriteOnly}
                    onCheckedChange={(v) => setFilters((f) => ({ ...f, favouriteOnly: v }))}
                  />
                  <Label htmlFor="fav-filter" className="cursor-pointer text-xs">
                    Favourites only
                  </Label>
                </div>
              </div>
            )}
          </div>

          {/* Entry count */}
          {entries.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {filtered.length === entries.length
                ? `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`
                : `${filtered.length} of ${entries.length} entries`}
            </p>
          )}

          {/* Empty state — no entries at all */}
          {entries.length === 0 && (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border/60 py-20 text-center">
              <BookOpen className="h-10 w-10 text-muted-foreground opacity-40" />
              <div className="space-y-1">
                <p className="font-medium">No journal entries yet</p>
                <p className="text-sm text-muted-foreground">
                  Start documenting your travel memories.
                </p>
              </div>
              <Button onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Write first entry
              </Button>
            </div>
          )}

          {/* Empty state — filters too strict */}
          {entries.length > 0 && filtered.length === 0 && (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border/60 py-16 text-center">
              <Search className="h-8 w-8 text-muted-foreground opacity-40" />
              <p className="font-medium">No entries match your filters</p>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          )}

          {/* Grid */}
          {filtered.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((entry) => (
                <JournalEntryCard
                  key={entry.id}
                  entry={entry}
                  onView={setViewEntry}
                  onEdit={openEdit}
                  onDelete={confirmDelete}
                  onToggleFavourite={handleToggleFavourite}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Create / Edit dialog */}
      <JournalEntryDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditEntry(null);
        }}
        entry={editEntry}
        onSave={handleSave}
        isPending={isSaving}
      />

      {/* Detail view */}
      <JournalDetailDialog entry={viewEntry} onClose={() => setViewEntry(null)} />

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteEntry}
        onOpenChange={(open) => {
          if (!open) setDeleteEntry(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete journal entry?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteEntry?.title ?? 'Untitled'}" will be permanently deleted along with all its
              photos. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDelete}
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
