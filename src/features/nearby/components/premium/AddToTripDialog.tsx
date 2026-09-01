import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Check, ChevronLeft, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTrips } from '@/features/trips/hooks/useTrips';
import {
  useAddPlaceToTrip,
  useItineraryData,
  usePlaceTripPlacements,
} from '@/features/itinerary/hooks/useItinerary';
import type { ItineraryCategory } from '@/features/itinerary/types';
import { formatDistance, type NearbyPlace, type PlaceCategory } from '../../types';

interface Props {
  place: NearbyPlace | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-selects this trip and skips straight to the day/time step — used
   *  when the user arrived at Explore from inside a specific trip. */
  defaultTripId?: string;
}

// Maps Explore's place categories onto the itinerary's fixed category enum —
// there is no 1:1 match (the itinerary enum is coarser), so this picks the
// closest reasonable bucket rather than inventing new categories.
const CATEGORY_MAP: Record<PlaceCategory, ItineraryCategory> = {
  attractions: 'activity',
  parks: 'activity',
  restaurants: 'food',
  hotels: 'accommodation',
  shopping: 'other',
  hospitals: 'other',
  pharmacies: 'other',
  atms: 'other',
  fuel: 'other',
};

function dayLabel(date: string, dayNumber: number): string {
  const parsed = new Date(date + 'T00:00:00');
  const formatted = Number.isNaN(parsed.getTime())
    ? date
    : parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `Day ${dayNumber} — ${formatted}`;
}

export function AddToTripDialog({ place, open, onOpenChange, defaultTripId }: Props) {
  const { data: trips, isLoading: tripsLoading } = useTrips();
  const { mutate: addToTrip, isPending } = useAddPlaceToTrip();

  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [dayId, setDayId] = useState<string>('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [confirmDuplicate, setConfirmDuplicate] = useState(false);
  const [addedTripId, setAddedTripId] = useState<string | null>(null);

  // Cross-trip placements for this place — powers both the trip-list
  // checkmarks and the in-trip duplicate warning. Only fetched while the
  // dialog is actually open.
  const { data: placements } = usePlaceTripPlacements(place, { enabled: open });

  const selectedTrip = trips?.find((t) => t.id === selectedTripId) ?? null;
  const { data: itineraryData, isLoading: daysLoading } = useItineraryData(selectedTripId ?? '');

  const placementsByTrip = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of placements ?? []) {
      if (!map.has(p.tripId)) map.set(p.tripId, p.dayNumber);
    }
    return map;
  }, [placements]);

  const duplicateInSelectedDay = useMemo(() => {
    if (!dayId) return false;
    return (placements ?? []).some((p) => p.dayId === dayId);
  }, [placements, dayId]);

  // Jump straight to the day/time step when opened from a trip context.
  useEffect(() => {
    if (open && defaultTripId) setSelectedTripId(defaultTripId);
  }, [open, defaultTripId]);

  // Default to the first day once that trip's days have loaded.
  useEffect(() => {
    if (selectedTripId && itineraryData && itineraryData.days.length > 0 && !dayId) {
      setDayId(itineraryData.days[0].id);
    }
  }, [selectedTripId, itineraryData, dayId]);

  useEffect(() => {
    setConfirmDuplicate(false);
  }, [dayId]);

  function reset() {
    setSelectedTripId(null);
    setDayId('');
    setTime('');
    setNotes('');
    setConfirmDuplicate(false);
    setAddedTripId(null);
  }

  function handleClose(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  function handleAdd() {
    if (!place || !selectedTripId || !dayId) return;
    if (duplicateInSelectedDay && !confirmDuplicate) {
      setConfirmDuplicate(true);
      return;
    }
    addToTrip(
      {
        tripId: selectedTripId,
        dayId,
        item: {
          title: place.name,
          location_name: place.address || null,
          latitude: place.lat,
          longitude: place.lon,
          category: CATEGORY_MAP[place.category],
          start_time: time || null,
          description:
            notes.trim() ||
            `Added from Explore${place.distance ? ` · ${formatDistance(place.distance)} away` : ''}`,
        },
      },
      {
        onSuccess: () => setAddedTripId(selectedTripId),
        onError: (err) => toast.error(err instanceof Error ? err.message : 'Could not add place'),
      },
    );
  }

  const added = addedTripId === selectedTripId && !!addedTripId;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {selectedTripId && !defaultTripId && (
              <button
                type="button"
                onClick={() => {
                  setSelectedTripId(null);
                  setDayId('');
                }}
                aria-label="Back to trip list"
                className="-ml-1 rounded p-2 text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span className="truncate">Add {place?.name ?? 'place'} to a trip</span>
          </DialogTitle>
        </DialogHeader>

        {!selectedTripId ? (
          tripsLoading ? (
            <div className="space-y-2 pt-1">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ) : !trips || trips.length === 0 ? (
            <div className="space-y-3 py-2 text-center">
              <p className="text-sm text-muted-foreground">You don't have any trips yet.</p>
              <Button asChild size="sm">
                <Link to="/trips/new">Create a trip</Link>
              </Button>
            </div>
          ) : (
            <div className="max-h-80 space-y-1.5 overflow-y-auto pt-1">
              {trips.map((trip) => {
                const existingDay = placementsByTrip.get(trip.id);
                return (
                  <button
                    key={trip.id}
                    type="button"
                    onClick={() => setSelectedTripId(trip.id)}
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-border/50 bg-muted/20 px-3.5 py-3 text-left transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{trip.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{trip.destination}</p>
                    </div>
                    {existingDay !== undefined && (
                      <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                        <Check className="h-3 w-3" aria-hidden />
                        Day {existingDay}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )
        ) : (
          <div className="space-y-3.5 pt-1">
            {added ? (
              <div className="flex flex-col items-center gap-2 py-4 text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                  <Check className="h-5 w-5 text-emerald-500" aria-hidden />
                </span>
                <p className="text-sm font-medium text-foreground">
                  Added to {selectedTrip?.title ?? 'trip'}
                </p>
                <Button size="sm" variant="outline" onClick={() => handleClose(false)}>
                  Done
                </Button>
              </div>
            ) : daysLoading ? (
              <Skeleton className="h-32 w-full rounded-xl" />
            ) : !itineraryData || itineraryData.days.length === 0 ? (
              <p className="rounded-lg bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
                This trip has no itinerary days yet — add start and end dates on the trip first.
              </p>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="add-to-trip-day" className="text-xs">
                    Day
                  </Label>
                  <Select value={dayId} onValueChange={setDayId}>
                    <SelectTrigger id="add-to-trip-day">
                      <SelectValue placeholder="Choose a day" />
                    </SelectTrigger>
                    <SelectContent>
                      {itineraryData.days.map((day) => (
                        <SelectItem key={day.id} value={day.id}>
                          {dayLabel(day.date, day.day_number)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="add-to-trip-time" className="text-xs">
                    Time <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="add-to-trip-time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="add-to-trip-notes" className="text-xs">
                    Notes <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Textarea
                    id="add-to-trip-notes"
                    rows={2}
                    placeholder="Optional"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {duplicateInSelectedDay && (
                  <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                    <span>
                      This place is already in this day.{' '}
                      {confirmDuplicate
                        ? 'Add it again anyway?'
                        : 'Adding again will create a duplicate.'}
                    </span>
                  </div>
                )}

                <Button className="w-full" disabled={isPending || !dayId} onClick={handleAdd}>
                  {duplicateInSelectedDay && confirmDuplicate ? 'Add anyway' : 'Add to Trip'}
                </Button>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
