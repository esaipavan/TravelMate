import { Bus, ArrowRight, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { formatCurrency } from '@/utils/formatters';
import { BUS_CLASS_LABEL } from '../types';
import type { Bus as BusType } from '../types';

interface Props {
  bus: BusType;
  selectedForCompare: boolean;
  onToggleCompare: () => void;
  onSelect: () => void;
}

function fmtDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function BusCard({ bus, selectedForCompare, onToggleCompare, onSelect }: Props) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-shadow hover:shadow-md">
      {/* Honest placeholder banner — no fabricated bus photo. */}
      <div
        className="relative flex h-16 items-center gap-2 px-4"
        style={{
          background:
            'linear-gradient(135deg, rgba(249,115,22,0.16) 0%, rgba(234,179,8,0.12) 100%)',
        }}
      >
        <Bus className="h-6 w-6 text-foreground/25" aria-hidden />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{bus.operator}</p>
          <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Star className="h-3 w-3 fill-amber-500 text-amber-500" aria-hidden />
            {bus.rating.toFixed(1)} · {bus.seatsLeft} seats left
          </p>
        </div>
        <label className="absolute right-2 top-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-background/85 px-2.5 py-1 text-[11px] font-medium backdrop-blur-sm">
          <Checkbox
            checked={selectedForCompare}
            onCheckedChange={onToggleCompare}
            aria-label={`Compare ${bus.operator}`}
          />
          Compare
        </label>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Route + times */}
        <div className="flex items-center justify-between gap-2">
          <div className="text-left">
            <p className="text-lg font-bold tabular-nums text-foreground">{bus.departTime}</p>
            <p className="truncate text-xs text-muted-foreground">{bus.from.split(',')[0]}</p>
          </div>
          <div className="flex flex-1 flex-col items-center">
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock className="h-3 w-3" aria-hidden />
              {fmtDuration(bus.durationMin)}
            </span>
            <div className="flex w-full items-center gap-1 px-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="h-px flex-1 bg-border" />
              <ArrowRight className="h-3 w-3 text-muted-foreground" aria-hidden />
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold tabular-nums text-foreground">{bus.arriveTime}</p>
            <p className="truncate text-xs text-muted-foreground">{bus.to.split(',')[0]}</p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border/50 pt-3">
          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
            {BUS_CLASS_LABEL[bus.busClass]}
          </span>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-base font-bold tabular-nums text-foreground">
                {formatCurrency(bus.price, bus.currency)}
              </p>
              <p className="text-[10px] text-muted-foreground">per seat</p>
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
