import { Plane, ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { formatCurrency } from '@/utils/formatters';
import { FLIGHT_CABIN_LABEL } from '../types';
import type { Flight } from '../types';

interface Props {
  flight: Flight;
  selectedForCompare: boolean;
  onToggleCompare: () => void;
  onSelect: () => void;
}

function fmtDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function stopsLabel(stops: number): string {
  if (stops === 0) return 'Non-stop';
  return stops === 1 ? '1 stop' : `${stops} stops`;
}

export function FlightCard({ flight, selectedForCompare, onToggleCompare, onSelect }: Props) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-shadow hover:shadow-md">
      {/* Honest placeholder banner — no fabricated aircraft photo. */}
      <div
        className="relative flex h-16 items-center gap-2 px-4"
        style={{
          background:
            'linear-gradient(135deg, rgba(59,130,246,0.16) 0%, rgba(99,102,241,0.12) 100%)',
        }}
      >
        <Plane className="h-6 w-6 text-foreground/25" aria-hidden />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{flight.airline}</p>
          <p className="text-[11px] text-muted-foreground">
            {flight.flightNumber} · {flight.seatsLeft} seats left
          </p>
        </div>
        <label className="absolute right-2 top-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-background/85 px-2.5 py-1 text-[11px] font-medium backdrop-blur-sm">
          <Checkbox
            checked={selectedForCompare}
            onCheckedChange={onToggleCompare}
            aria-label={`Compare ${flight.airline} ${flight.flightNumber}`}
          />
          Compare
        </label>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Route + times */}
        <div className="flex items-center justify-between gap-2">
          <div className="text-left">
            <p className="text-lg font-bold tabular-nums text-foreground">{flight.departTime}</p>
            <p className="truncate text-xs text-muted-foreground">{flight.from.split(',')[0]}</p>
          </div>
          <div className="flex flex-1 flex-col items-center">
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock className="h-3 w-3" aria-hidden />
              {fmtDuration(flight.durationMin)}
            </span>
            <div className="flex w-full items-center gap-1 px-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="h-px flex-1 bg-border" />
              <ArrowRight className="h-3 w-3 text-muted-foreground" aria-hidden />
            </div>
            <span className="text-[10px] text-muted-foreground">{stopsLabel(flight.stops)}</span>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold tabular-nums text-foreground">{flight.arriveTime}</p>
            <p className="truncate text-xs text-muted-foreground">{flight.to.split(',')[0]}</p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border/50 pt-3">
          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
            {FLIGHT_CABIN_LABEL[flight.cabin]}
          </span>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-base font-bold tabular-nums text-foreground">
                {formatCurrency(flight.price, flight.currency)}
              </p>
              <p className="text-[10px] text-muted-foreground">per traveller</p>
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
