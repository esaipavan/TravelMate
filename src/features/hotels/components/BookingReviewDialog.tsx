import { useMemo, useState } from 'react';
import { BedDouble, CalendarDays, Users, Star } from 'lucide-react';
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
import { useBookings } from '../hooks/useBookings';
import type { Hotel } from '../types';

interface Props {
  hotel: Hotel | null;
  checkIn: string;
  checkOut: string;
  guests: number;
  /** Pre-selected trip to attach to (e.g. arriving from a trip's page). */
  defaultTripId?: string | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

function nightsBetween(a: string, b: string): number {
  if (!a || !b) return 1;
  const ms = new Date(b + 'T00:00:00').getTime() - new Date(a + 'T00:00:00').getTime();
  return Math.max(1, Math.round(ms / 86_400_000));
}

const todayStr = () => new Date().toISOString().split('T')[0];

export function BookingReviewDialog({
  hotel,
  checkIn: initCheckIn,
  checkOut: initCheckOut,
  guests: initGuests,
  defaultTripId,
  onOpenChange,
  onSaved,
}: Props) {
  const { addDraft } = useBookings();
  const { data: trips = [] } = useTrips();
  const [checkIn, setCheckIn] = useState(initCheckIn || todayStr());
  const [checkOut, setCheckOut] = useState(initCheckOut || '');
  const [guests, setGuests] = useState(initGuests);
  const [tripId, setTripId] = useState<string>(defaultTripId ?? '');

  const nights = useMemo(() => nightsBetween(checkIn, checkOut), [checkIn, checkOut]);
  const total = hotel ? hotel.pricePerNight * nights : 0;

  function handleSave() {
    if (!hotel) return;
    void addDraft({
      id: `booking-${hotel.id}-${Date.now()}`,
      mode: 'hotel',
      title: hotel.name,
      subtitle: `${hotel.area} · ${nights} night${nights !== 1 ? 's' : ''}`,
      destination: hotel.destination,
      checkIn,
      checkOut: checkOut || undefined,
      guests,
      nights,
      unitPrice: hotel.pricePerNight,
      total,
      currency: hotel.currency,
      tripId: tripId || null,
      createdAt: Date.now(),
      status: 'draft',
    });
    onSaved();
    onOpenChange(false);
  }

  return (
    <Dialog open={!!hotel} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BedDouble className="h-4 w-4 text-primary" aria-hidden />
            Review booking
          </DialogTitle>
          <DialogDescription>
            A draft is saved inside TravelMate — no payment is taken.
          </DialogDescription>
        </DialogHeader>

        {hotel && (
          <div className="space-y-4">
            {/* Hotel summary */}
            <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-foreground">{hotel.name}</p>
                <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <Star className="h-3 w-3 fill-current" aria-hidden />
                  {hotel.rating.toFixed(1)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {hotel.area}, {hotel.destination.split(',')[0]}
              </p>
            </div>

            {/* Dates + guests */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="checkin" className="flex items-center gap-1.5 text-xs">
                  <CalendarDays className="h-3 w-3" aria-hidden /> Check-in
                </Label>
                <Input
                  id="checkin"
                  type="date"
                  value={checkIn}
                  min={todayStr()}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="checkout" className="flex items-center gap-1.5 text-xs">
                  <CalendarDays className="h-3 w-3" aria-hidden /> Check-out
                </Label>
                <Input
                  id="checkout"
                  type="date"
                  value={checkOut}
                  min={checkIn || todayStr()}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="guests" className="flex items-center gap-1.5 text-xs">
                  <Users className="h-3 w-3" aria-hidden /> Guests
                </Label>
                <Input
                  id="guests"
                  type="number"
                  min={1}
                  max={20}
                  value={guests}
                  onChange={(e) =>
                    setGuests(Math.max(1, Math.min(20, Number(e.target.value) || 1)))
                  }
                />
              </div>

              <TripAttachSelect value={tripId} onChange={setTripId} trips={trips} id="hotel-trip" />
            </div>

            {/* Total */}
            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card p-3">
              <div className="text-xs text-muted-foreground">
                {formatCurrency(hotel.pricePerNight, hotel.currency)} × {nights} night
                {nights !== 1 ? 's' : ''}
              </div>
              <div className="text-lg font-bold tabular-nums text-foreground">
                {formatCurrency(total, hotel.currency)}
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
