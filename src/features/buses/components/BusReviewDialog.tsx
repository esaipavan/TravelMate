import { useState } from 'react';
import { Bus, CalendarDays, Users, ArrowRight } from 'lucide-react';
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
import { BUS_CLASS_LABEL } from '../types';
import type { Bus as BusType } from '../types';

interface Props {
  bus: BusType | null;
  date: string;
  passengers: number;
  defaultTripId?: string | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

const todayStr = () => new Date().toISOString().split('T')[0];

export function BusReviewDialog({
  bus,
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

  const total = bus ? bus.price * passengers : 0;

  function handleSave() {
    if (!bus) return;
    void addDraft({
      id: `booking-${bus.id}-${Date.now()}`,
      mode: 'bus',
      title: bus.operator,
      subtitle: `${bus.from.split(',')[0]} → ${bus.to.split(',')[0]} · ${BUS_CLASS_LABEL[bus.busClass]}`,
      destination: bus.to,
      checkIn: date,
      checkOut: undefined,
      startTime: bus.departTime,
      endTime: bus.arriveTime,
      guests: passengers,
      nights: 1,
      unitPrice: bus.price,
      total,
      currency: bus.currency,
      tripId: tripId || null,
      createdAt: Date.now(),
      status: 'draft',
    });
    onSaved();
    onOpenChange(false);
  }

  return (
    <Dialog open={!!bus} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bus className="h-4 w-4 text-primary" aria-hidden />
            Review booking
          </DialogTitle>
          <DialogDescription>
            A draft is saved inside TravelMate — no payment is taken.
          </DialogDescription>
        </DialogHeader>

        {bus && (
          <div className="space-y-4">
            {/* Bus summary */}
            <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
              <p className="font-semibold text-foreground">{bus.operator}</p>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium tabular-nums text-foreground">{bus.departTime}</span>
                {bus.from.split(',')[0]}
                <ArrowRight className="h-3 w-3" aria-hidden />
                <span className="font-medium tabular-nums text-foreground">{bus.arriveTime}</span>
                {bus.to.split(',')[0]}
                <span className="text-muted-foreground/50">·</span>
                {BUS_CLASS_LABEL[bus.busClass]}
              </p>
            </div>

            {/* Date + passengers */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="bus-date" className="flex items-center gap-1.5 text-xs">
                  <CalendarDays className="h-3 w-3" aria-hidden /> Travel date
                </Label>
                <Input
                  id="bus-date"
                  type="date"
                  value={date}
                  min={todayStr()}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bus-pax" className="flex items-center gap-1.5 text-xs">
                  <Users className="h-3 w-3" aria-hidden /> Passengers
                </Label>
                <Input
                  id="bus-pax"
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

            <TripAttachSelect value={tripId} onChange={setTripId} trips={trips} id="bus-trip" />

            {/* Total */}
            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card p-3">
              <div className="text-xs text-muted-foreground">
                {formatCurrency(bus.price, bus.currency)} × {passengers} passenger
                {passengers !== 1 ? 's' : ''}
              </div>
              <div className="text-lg font-bold tabular-nums text-foreground">
                {formatCurrency(total, bus.currency)}
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
