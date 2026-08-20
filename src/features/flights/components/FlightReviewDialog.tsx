import { useState } from 'react';
import { Plane, CalendarDays, Users, ArrowRight } from 'lucide-react';
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
import { FLIGHT_CABIN_LABEL } from '../types';
import type { Flight } from '../types';

interface Props {
  flight: Flight | null;
  date: string;
  passengers: number;
  defaultTripId?: string | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

const todayStr = () => new Date().toISOString().split('T')[0];

export function FlightReviewDialog({
  flight,
  date: initDate,
  passengers: initPassengers,
  defaultTripId,
  onOpenChange,
  onSaved,
}: Props) {
  const { addDraft } = useBookings();
  const { data: trips = [] } = useTrips();
  const [date, setDate] = useState(initDate || todayStr());
  const [passengers, setPassengers] = useState(initPassengers);
  const [tripId, setTripId] = useState<string>(defaultTripId ?? '');

  const total = flight ? flight.price * passengers : 0;

  function handleSave() {
    if (!flight) return;
    void addDraft({
      id: `booking-${flight.id}-${Date.now()}`,
      mode: 'flight',
      title: `${flight.airline} ${flight.flightNumber}`,
      subtitle: `${flight.from.split(',')[0]} → ${flight.to.split(',')[0]} · ${FLIGHT_CABIN_LABEL[flight.cabin]}`,
      destination: flight.to,
      checkIn: date,
      checkOut: undefined,
      startTime: flight.departTime,
      endTime: flight.arriveTime,
      guests: passengers,
      nights: 1,
      unitPrice: flight.price,
      total,
      currency: flight.currency,
      tripId: tripId || null,
      createdAt: Date.now(),
      status: 'draft',
    });
    onSaved();
    onOpenChange(false);
  }

  return (
    <Dialog open={!!flight} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plane className="h-4 w-4 text-primary" aria-hidden />
            Review booking
          </DialogTitle>
          <DialogDescription>
            A draft is saved inside TravelMate — no payment is taken.
          </DialogDescription>
        </DialogHeader>

        {flight && (
          <div className="space-y-4">
            {/* Flight summary */}
            <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
              <p className="font-semibold text-foreground">
                {flight.airline}{' '}
                <span className="text-muted-foreground">{flight.flightNumber}</span>
              </p>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium tabular-nums text-foreground">
                  {flight.departTime}
                </span>
                {flight.from.split(',')[0]}
                <ArrowRight className="h-3 w-3" aria-hidden />
                <span className="font-medium tabular-nums text-foreground">
                  {flight.arriveTime}
                </span>
                {flight.to.split(',')[0]}
                <span className="text-muted-foreground/50">·</span>
                {FLIGHT_CABIN_LABEL[flight.cabin]}
              </p>
            </div>

            {/* Date + passengers */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="flight-date" className="flex items-center gap-1.5 text-xs">
                  <CalendarDays className="h-3 w-3" aria-hidden /> Departure date
                </Label>
                <Input
                  id="flight-date"
                  type="date"
                  value={date}
                  min={todayStr()}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="flight-pax" className="flex items-center gap-1.5 text-xs">
                  <Users className="h-3 w-3" aria-hidden /> Travellers
                </Label>
                <Input
                  id="flight-pax"
                  type="number"
                  min={1}
                  max={20}
                  value={passengers}
                  onChange={(e) =>
                    setPassengers(Math.max(1, Math.min(20, Number(e.target.value) || 1)))
                  }
                />
              </div>
            </div>

            <TripAttachSelect value={tripId} onChange={setTripId} trips={trips} id="flight-trip" />

            {/* Total */}
            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card p-3">
              <div className="text-xs text-muted-foreground">
                {formatCurrency(flight.price, flight.currency)} × {passengers} traveller
                {passengers !== 1 ? 's' : ''}
              </div>
              <div className="text-lg font-bold tabular-nums text-foreground">
                {formatCurrency(total, flight.currency)}
              </div>
            </div>

            <Button onClick={handleSave} className="w-full">
              Save booking draft
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
