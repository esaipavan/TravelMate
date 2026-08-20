import { useState } from 'react';
import { Car, Clock, Users, Route, ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/utils/formatters';
import { TripAttachSelect } from '@/components/shared/TripAttachSelect';
import { useTrips } from '@/features/trips/hooks/useTrips';
import { useBookings } from '@/features/hotels/hooks/useBookings';
import { LOCAL_VEHICLE_LABEL } from '../types';
import type { LocalRide } from '../types';

interface Props {
  ride: LocalRide | null;
  dateTime: string;
  defaultTripId?: string | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

// Local datetime string 'YYYY-MM-DDTHH:mm'.
const nowLocal = () => {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
};

/** Add minutes to an 'HH:mm' time, wrapping past midnight → 'HH:mm'. */
function addMinutes(hhmm: string, mins: number): string {
  const [h, m] = hhmm.split(':').map(Number);
  const total = (((h * 60 + m + mins) % 1440) + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export function LocalReviewDialog({
  ride,
  dateTime: initDateTime,
  defaultTripId,
  onOpenChange,
  onSaved,
}: Props) {
  const { addDraft } = useBookings();
  const { data: trips = [] } = useTrips();
  const [dateTime, setDateTime] = useState(initDateTime || nowLocal());
  const [passengers, setPassengers] = useState(1);
  const [tripId, setTripId] = useState<string>(defaultTripId ?? '');

  const capacity = ride?.seats ?? 1;
  // Local fares are for the whole ride, not per passenger.
  const total = ride ? ride.price : 0;

  function handleSave() {
    if (!ride) return;
    // Split the chosen pickup datetime once so the date and time stay consistent.
    const [pickupDate, pickupTime] = (dateTime || nowLocal()).split('T');
    void addDraft({
      id: `booking-${ride.id}-${Date.now()}`,
      mode: 'local',
      title: `${ride.provider} · ${LOCAL_VEHICLE_LABEL[ride.vehicle]}`,
      subtitle: `${ride.pickup.split(',')[0]} → ${ride.dropoff.split(',')[0]} · ${ride.distanceKm} km · ~${ride.durationMin} min`,
      destination: ride.dropoff,
      checkIn: pickupDate,
      checkOut: undefined,
      startTime: pickupTime || undefined,
      // Estimated ride end = pickup + the ride's estimated duration.
      endTime: pickupTime ? addMinutes(pickupTime, ride.durationMin) : undefined,
      guests: passengers,
      nights: 1,
      unitPrice: ride.price,
      total,
      currency: ride.currency,
      tripId: tripId || null,
      createdAt: Date.now(),
      status: 'draft',
    });
    onSaved();
    onOpenChange(false);
  }

  return (
    <Dialog open={!!ride} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-4 w-4 text-primary" aria-hidden />
            Review ride
          </DialogTitle>
          <DialogDescription>
            A draft is saved inside TravelMate — no payment is taken.
          </DialogDescription>
        </DialogHeader>

        {ride && (
          <div className="space-y-4">
            {/* Ride summary */}
            <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
              <p className="font-semibold text-foreground">
                {ride.provider}{' '}
                <span className="text-muted-foreground">· {LOCAL_VEHICLE_LABEL[ride.vehicle]}</span>
              </p>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{ride.pickup.split(',')[0]}</span>
                <ArrowRight className="h-3 w-3" aria-hidden />
                <span className="font-medium text-foreground">{ride.dropoff.split(',')[0]}</span>
              </p>
              <p className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Route className="h-3 w-3" aria-hidden /> {ride.distanceKm} km
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" aria-hidden /> ~{ride.durationMin} min ride
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" aria-hidden /> {ride.etaMin} min to pickup
                </span>
              </p>
            </div>

            {/* Date-time + passengers */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="local-datetime" className="flex items-center gap-1.5 text-xs">
                  <Clock className="h-3 w-3" aria-hidden /> Pickup time
                </Label>
                <Input
                  id="local-datetime"
                  type="datetime-local"
                  value={dateTime}
                  min={nowLocal()}
                  onChange={(e) => setDateTime(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="local-pax" className="flex items-center gap-1.5 text-xs">
                  <Users className="h-3 w-3" aria-hidden /> Passengers (max {capacity})
                </Label>
                <Input
                  id="local-pax"
                  type="number"
                  min={1}
                  max={capacity}
                  value={passengers}
                  onChange={(e) =>
                    setPassengers(Math.max(1, Math.min(capacity, Number(e.target.value) || 1)))
                  }
                />
              </div>
            </div>

            <TripAttachSelect value={tripId} onChange={setTripId} trips={trips} id="local-trip" />

            {/* Fare — for the whole ride */}
            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card p-3">
              <div className="text-xs text-muted-foreground">
                Estimated fare · {ride.distanceKm} km · ~{ride.durationMin} min
              </div>
              <div className="text-lg font-bold tabular-nums text-foreground">
                {formatCurrency(total, ride.currency)}
              </div>
            </div>

            <Button onClick={handleSave} className="w-full">
              Save ride draft
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
