import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ErrorState } from '@/components/shared/ErrorState';
import { motion, useReducedMotion } from 'framer-motion';
import { Camera, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useTrip } from '@/features/trips/hooks/useTrips';
import { useJournalEntries } from '@/features/journal/hooks/useJournal';
import { useItineraryData } from '@/features/itinerary/hooks/useItinerary';
import { useExpenseData } from '@/features/expenses/hooks/useExpenses';
import { rv, SECTION_VARIANTS, LIST_VARIANTS } from '@/lib/motion';
import { TripSummaryCard } from '../components/TripSummaryCard';
import { TravelGallery } from '../components/TravelGallery';
import { TravelJournalPreview } from '../components/TravelJournalPreview';
import { TripTimeline } from '../components/TripTimeline';
import type { TimelineEvent, TripStats } from '../types';
import type { ExpenseRow } from '@/features/expenses/types';
import type { ItineraryData } from '@/features/itinerary/types';
import type { JournalEntryRow } from '@/features/journal/types';
import type { Database } from '@/types/database.types';

type TripRow = Database['public']['Tables']['trips']['Row'];

// ─── Pure helpers ──────────────────────────────────────────────────────────────

function diffDays(start: string, end: string): number {
  const a = new Date(start + 'T00:00:00').getTime();
  const b = new Date(end + 'T00:00:00').getTime();
  return Math.max(1, Math.round((b - a) / 86_400_000) + 1);
}

function buildStats(
  trip: TripRow,
  entries: JournalEntryRow[],
  itinerary: ItineraryData | undefined,
  expenses: ExpenseRow[],
): TripStats {
  const photosCount = entries.reduce((n, e) => n + (e.image_urls?.length ?? 0), 0);
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  const locations = [
    ...entries.map((e) => e.location_name).filter((l): l is string => l !== null),
    ...(itinerary?.days.flatMap((d) =>
      d.items.map((i) => i.location_name).filter((l): l is string => l !== null),
    ) ?? []),
  ];
  const citiesVisited = [...new Set(locations)];
  const activitiesCount = itinerary?.days.reduce((n, d) => n + d.items.length, 0) ?? 0;

  return {
    daysTotal: diffDays(trip.start_date, trip.end_date),
    totalSpent: Math.round(totalSpent),
    currency: trip.currency,
    journalEntries: entries.length,
    photosCount,
    activitiesCount,
    citiesVisited,
  };
}

function buildTimeline(
  trip: TripRow,
  entries: JournalEntryRow[],
  itinerary: ItineraryData | undefined,
  expenses: ExpenseRow[],
): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  events.push({
    id: 'departure',
    type: 'departure',
    date: trip.start_date,
    title: `Depart for ${trip.destination}`,
    subtitle: 'Trip begins',
  });

  if (itinerary) {
    for (const day of itinerary.days) {
      for (const item of day.items) {
        events.push({
          id: `activity-${item.id}`,
          type: 'activity',
          date: day.date,
          time: item.start_time ?? undefined,
          title: item.title,
          subtitle: item.location_name ?? undefined,
        });
      }
    }
  }

  const topExpenses = [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 8);
  for (const exp of topExpenses) {
    events.push({
      id: `expense-${exp.id}`,
      type: 'expense',
      date: exp.date,
      title: exp.title,
      amount: exp.amount,
      currency: exp.currency,
    });
  }

  const sortedEntries = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  for (const entry of sortedEntries) {
    events.push({
      id: `journal-${entry.id}`,
      type: 'journal',
      date: entry.date,
      title: entry.title ?? 'Journal Entry',
      subtitle: entry.location_name ?? undefined,
      mood: entry.mood ?? undefined,
      imageUrl: entry.image_urls?.[0] ?? undefined,
    });
  }

  events.push({
    id: 'return',
    type: 'return',
    date: trip.end_date,
    title: 'Return home',
    subtitle: 'Trip ends',
  });

  return events.sort((a, b) => {
    const d = a.date.localeCompare(b.date);
    if (d !== 0) return d;
    if (a.type === 'departure') return -1;
    if (b.type === 'departure') return 1;
    if (a.type === 'return') return 1;
    if (b.type === 'return') return -1;
    return 0;
  });
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-10" aria-busy="true" aria-label="Loading trip memories">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <div className="space-y-1">
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-4 w-48 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-56 w-full rounded-2xl" />
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <Skeleton className="h-96 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MemoriesPage() {
  const { id: tripId } = useParams<{ id: string }>();
  const reduced = useReducedMotion();

  const { data: trip, isLoading: tripLoading, isError: tripError, refetch } = useTrip(tripId!);
  const { data: entries = [], isLoading: journalLoading } = useJournalEntries(tripId!);
  const { data: itinerary, isLoading: itineraryLoading } = useItineraryData(tripId!);
  const { data: expenseData, isLoading: expenseLoading } = useExpenseData(tripId!);

  const isLoading = tripLoading || journalLoading || itineraryLoading || expenseLoading;
  const expenses = useMemo(() => expenseData?.expenses ?? [], [expenseData]);

  const stats = useMemo(
    () => (trip ? buildStats(trip, entries, itinerary, expenses) : null),
    [trip, entries, itinerary, expenses],
  );

  const timeline = useMemo(
    () => (trip ? buildTimeline(trip, entries, itinerary, expenses) : []),
    [trip, entries, itinerary, expenses],
  );

  if (tripError)
    return (
      <ErrorState
        title="Couldn't load memories"
        message="We ran into a problem loading this trip's memories."
        onRetry={() => void refetch()}
      />
    );

  if (isLoading || !trip) return <PageSkeleton />;

  return (
    <motion.div
      className="space-y-10"
      variants={rv(SECTION_VARIANTS, reduced)}
      initial="hidden"
      animate="show"
    >
      {/* Back + breadcrumb */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="shrink-0" aria-label="Back to trip" asChild>
          <Link to={`/trips/${tripId}`}>
            <ArrowLeft className="h-4 w-4" aria-hidden />
          </Link>
        </Button>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <Camera className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Travel Memories
            </span>
          </div>
          <p className="truncate text-sm font-medium">{trip.title}</p>
        </div>
      </div>

      {/* Stats */}
      {stats && <TripSummaryCard stats={stats} />}

      {/* Gallery */}
      <motion.section
        aria-labelledby="gallery-heading"
        variants={rv(LIST_VARIANTS, reduced)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
      >
        <h2
          id="gallery-heading"
          className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60"
        >
          Photo Gallery
        </h2>
        <TravelGallery entries={entries} />
      </motion.section>

      {/* Timeline + Journal */}
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <motion.section
          aria-labelledby="timeline-heading"
          variants={rv(LIST_VARIANTS, reduced)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
        >
          <h2
            id="timeline-heading"
            className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60"
          >
            Trip Timeline
          </h2>
          <TripTimeline events={timeline} />
        </motion.section>

        <motion.section
          aria-labelledby="journal-heading"
          variants={rv(LIST_VARIANTS, reduced)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
        >
          <h2
            id="journal-heading"
            className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60"
          >
            Journal Highlights
          </h2>
          <TravelJournalPreview entries={entries} tripId={tripId!} />
        </motion.section>
      </div>
    </motion.div>
  );
}
