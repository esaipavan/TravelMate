import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Coffee, MapPin, Utensils, Camera, Moon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { rv, CARD_VARIANTS } from '@/lib/motion';
import { useCurrentTrip } from '../hooks/useDashboard';
import type { LucideIcon } from 'lucide-react';

interface Slot {
  time: string;
  label: string;
  tripLabel?: string;
  icon: LucideIcon;
  hour: number;
  endHour: number;
}

const SLOTS: Slot[] = [
  { time: '07:00', label: 'Morning breakfast & coffee', icon: Coffee, hour: 5, endHour: 10 },
  { time: '10:00', label: 'Explore the city', icon: MapPin, hour: 10, endHour: 13 },
  { time: '13:00', label: 'Lunch break', icon: Utensils, hour: 13, endHour: 16 },
  { time: '16:00', label: 'Afternoon sightseeing', icon: Camera, hour: 16, endHour: 20 },
  { time: '20:00', label: 'Dinner & evening out', icon: Moon, hour: 20, endHour: 24 },
];

type SlotState = 'past' | 'current' | 'upcoming';

function slotState(slot: Slot, h: number): SlotState {
  if (h >= slot.endHour) return 'past';
  if (h >= slot.hour) return 'current';
  return 'upcoming';
}

export function TodayTimeline() {
  const reduced = useReducedMotion();
  const { data: trip } = useCurrentTrip();
  const now = new Date();
  const h = now.getHours();
  const today = format(now, 'EEEE, MMMM d');

  return (
    <motion.section
      aria-label="Today's suggested plan"
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
            aria-label="Open itinerary"
            className="flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
          >
            <Plus className="h-3 w-3" aria-hidden="true" />
            Add
          </Link>
        )}
      </div>

      {!trip ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">No active trip</p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Create a trip to get a personalised day-by-day plan with times and activities.
            </p>
          </div>
          <Link to="/trips/new" className="text-xs font-medium text-primary hover:underline">
            Plan a trip →
          </Link>
        </div>
      ) : (
        <>
          {/* Timeline */}
          <div className="relative">
            {/* Vertical connector */}
            <div
              className="absolute bottom-4 left-[18px] top-4 w-px bg-border/60"
              aria-hidden="true"
            />

            {SLOTS.map((slot, i) => {
              const state = slotState(slot, h);
              const Icon = slot.icon;
              const dest = trip.destination.split(',')[0];
              const label = i === 1 ? `Explore ${dest}` : slot.label;

              return (
                <div key={slot.time} className="relative flex items-start gap-3 py-2">
                  {/* Icon dot */}
                  <div
                    aria-hidden="true"
                    className={cn(
                      'relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors',
                      state === 'current' && 'bg-primary text-primary-foreground shadow-sm',
                      state === 'past' && 'bg-muted text-muted-foreground/40',
                      state === 'upcoming' && 'bg-muted/60 text-muted-foreground',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* Text */}
                  <div className="min-w-0 flex-1 pt-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'text-xs font-medium tabular-nums',
                          state === 'current' ? 'text-primary' : 'text-muted-foreground',
                        )}
                      >
                        {slot.time}
                      </span>
                      {state === 'current' && (
                        <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                          Now
                        </span>
                      )}
                    </div>
                    <p
                      className={cn(
                        'mt-0.5 text-sm',
                        state === 'past' && 'text-muted-foreground/50 line-through',
                        state === 'current' && 'font-medium text-foreground',
                        state === 'upcoming' && 'text-foreground',
                      )}
                    >
                      {label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

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
