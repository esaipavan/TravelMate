import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  MapPin,
  Plus,
  Clock,
  Utensils,
  Bed,
  Ticket,
  Car,
  Package,
  CheckCircle2,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { rv, CARD_VARIANTS } from '@/lib/motion';
import { useCurrentTrip } from '../hooks/useDashboard';
import { useItineraryDataReadOnly } from '@/features/itinerary/hooks/useItinerary';
import { Skeleton } from '@/components/ui/skeleton';
import type { LucideIcon } from 'lucide-react';
import type { ItineraryCategory } from '@/features/itinerary/types';

// Maps itinerary category → icon (enum: 'transport' | 'accommodation' | 'activity' | 'food' | 'other')
const CATEGORY_ICON: Record<ItineraryCategory, LucideIcon> = {
  accommodation: Bed,
  activity: Ticket,
  food: Utensils,
  transport: Car,
  other: Package,
};

type SlotState = 'past' | 'current' | 'upcoming';

function getSlotState(
  startTime: string | null,
  endTime: string | null,
  currentHour: number,
): SlotState {
  if (!startTime) return 'upcoming';
  const startH = parseInt(startTime.slice(0, 2), 10);
  const endH = endTime ? parseInt(endTime.slice(0, 2), 10) : startH + 2;
  if (currentHour >= endH) return 'past';
  if (currentHour >= startH) return 'current';
  return 'upcoming';
}

function formatTime(t: string | null): string {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = parseInt(h, 10);
  const suffix = hour < 12 ? 'AM' : 'PM';
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${suffix}`;
}

function TimelineSkeleton() {
  return (
    <div className="space-y-3 py-1">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3">
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
          <div className="flex-1 space-y-1.5 pt-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TodayTimeline() {
  const reduced = useReducedMotion();
  const { data: trip, isLoading: tripLoading } = useCurrentTrip();
  const { data: itinerary, isLoading: itineraryLoading } = useItineraryDataReadOnly(trip?.id ?? '');

  const now = new Date();
  const currentHour = now.getHours();
  const today = format(now, 'EEEE, MMMM d');

  // Find today's date string (YYYY-MM-DD) in local time
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const todayStr = `${y}-${m}-${d}`;

  const todayDay = itinerary?.days.find((day) => day.date === todayStr);
  const todayItems =
    todayDay?.items
      .filter((item) => item.status !== 'cancelled')
      .sort((a, b) => {
        if (!a.start_time && !b.start_time) return 0;
        if (!a.start_time) return 1;
        if (!b.start_time) return -1;
        return a.start_time.localeCompare(b.start_time);
      }) ?? [];

  const isLoading = tripLoading || (!!trip && itineraryLoading);

  return (
    <motion.section
      aria-label="Today's itinerary"
      className="rounded-2xl border border-border/50 bg-card p-5"
      variants={rv(CARD_VARIANTS, reduced)}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Today's Plan</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{today}</p>
        </div>
        {trip && (
          <Link
            to={`/trips/${trip.id}/itinerary`}
            aria-label="Add to itinerary"
            className="flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
          >
            <Plus className="h-3 w-3" aria-hidden="true" />
            Add
          </Link>
        )}
      </div>

      {/* No active trip */}
      {!trip && !isLoading && (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">No active trip</p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Create a trip to see your day-by-day plan here.
            </p>
          </div>
          <Link to="/trips/new" className="text-xs font-medium text-primary hover:underline">
            Plan a trip →
          </Link>
        </div>
      )}

      {/* Loading */}
      {isLoading && <TimelineSkeleton />}

      {/* Trip exists — show real items or empty state */}
      {trip && !isLoading && (
        <>
          {todayItems.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-5 text-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {itinerary ? 'Nothing planned today' : 'No itinerary yet'}
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {itinerary
                    ? 'Add activities to your itinerary to see them here.'
                    : 'Start building your day-by-day plan.'}
                </p>
              </div>
              <Link
                to={`/trips/${trip.id}/itinerary`}
                className="text-xs font-medium text-primary hover:underline"
              >
                Open itinerary →
              </Link>
            </div>
          ) : (
            <div className="relative">
              {/* Vertical connector */}
              <div
                className="absolute bottom-4 left-[18px] top-4 w-px bg-border/60"
                aria-hidden="true"
              />

              {todayItems.map((item) => {
                const state = getSlotState(item.start_time, item.end_time, currentHour);
                const Icon = CATEGORY_ICON[item.category] ?? Ticket;
                const isDone = item.status === 'completed';
                const displayState: SlotState = isDone ? 'past' : state;

                return (
                  <div key={item.id} className="relative flex items-start gap-3 py-2">
                    {/* Icon dot */}
                    <div
                      aria-hidden="true"
                      className={cn(
                        'relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors',
                        displayState === 'current' &&
                          'bg-primary text-primary-foreground shadow-sm',
                        displayState === 'past' && 'bg-muted text-muted-foreground/40',
                        displayState === 'upcoming' && 'bg-muted/60 text-muted-foreground',
                      )}
                    >
                      {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>

                    {/* Text */}
                    <div className="min-w-0 flex-1 pt-1.5">
                      <div className="flex items-center gap-2">
                        {item.start_time && (
                          <span
                            className={cn(
                              'text-xs font-medium tabular-nums',
                              displayState === 'current' ? 'text-primary' : 'text-muted-foreground',
                            )}
                          >
                            {formatTime(item.start_time)}
                          </span>
                        )}
                        {displayState === 'current' && (
                          <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                            Now
                          </span>
                        )}
                      </div>
                      <p
                        className={cn(
                          'mt-0.5 truncate text-sm',
                          displayState === 'past' && 'text-muted-foreground/50 line-through',
                          displayState === 'current' && 'font-medium text-foreground',
                          displayState === 'upcoming' && 'text-foreground',
                        )}
                      >
                        {item.title}
                      </p>
                      {item.location_name && displayState !== 'past' && (
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                          {item.location_name}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div className="mt-3 border-t border-border/50 pt-3">
            <Link
              to={`/trips/${trip.id}/itinerary`}
              className="text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              Open full itinerary →
            </Link>
          </div>
        </>
      )}
    </motion.section>
  );
}
