import { Car, ArrowRight, Clock, Route, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { formatCurrency } from '@/utils/formatters';
import { LOCAL_VEHICLE_LABEL } from '../types';
import type { LocalRide } from '../types';

interface Props {
  ride: LocalRide;
  selectedForCompare: boolean;
  onToggleCompare: () => void;
  onSelect: () => void;
}

function fmtDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (!h) return `${m} min`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function LocalCard({ ride, selectedForCompare, onToggleCompare, onSelect }: Props) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-shadow hover:shadow-md">
      {/* Honest placeholder banner — no fabricated vehicle photo. */}
      <div
        className="relative flex h-16 items-center gap-2 px-4"
        style={{
          background:
            'linear-gradient(135deg, rgba(16,185,129,0.16) 0%, rgba(20,184,166,0.12) 100%)',
        }}
      >
        <Car className="h-6 w-6 text-foreground/25" aria-hidden />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {ride.provider} · {LOCAL_VEHICLE_LABEL[ride.vehicle]}
          </p>
          <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3" aria-hidden />
            {ride.etaMin} min to pickup
          </p>
        </div>
        <label className="absolute right-2 top-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-background/85 px-2.5 py-1 text-[11px] font-medium backdrop-blur-sm">
          <Checkbox
            checked={selectedForCompare}
            onCheckedChange={onToggleCompare}
            aria-label={`Compare ${ride.provider} ${LOCAL_VEHICLE_LABEL[ride.vehicle]}`}
          />
          Compare
        </label>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Route */}
        <div className="flex items-center gap-2 text-sm">
          <span className="min-w-0 flex-1 truncate font-medium text-foreground">
            {ride.pickup.split(',')[0]}
          </span>
          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
          <span className="min-w-0 flex-1 truncate text-right font-medium text-foreground">
            {ride.dropoff.split(',')[0]}
          </span>
        </div>

        {/* Distance · duration · capacity */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Route className="h-3 w-3" aria-hidden />
            {ride.distanceKm} km
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden />~{fmtDuration(ride.durationMin)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3 w-3" aria-hidden />
            {ride.seats}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-border/50 pt-3">
          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
            {LOCAL_VEHICLE_LABEL[ride.vehicle]}
          </span>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-base font-bold tabular-nums text-foreground">
                {formatCurrency(ride.price, ride.currency)}
              </p>
              <p className="text-[10px] text-muted-foreground">est. fare</p>
            </div>
            <Button size="sm" onClick={onSelect}>
              Select
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
