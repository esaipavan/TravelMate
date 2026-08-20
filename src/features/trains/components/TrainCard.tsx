import { TrainFront, ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { formatCurrency } from '@/utils/formatters';
import { TRAIN_CLASS_LABEL } from '../types';
import type { Train } from '../types';

interface Props {
  train: Train;
  selectedForCompare: boolean;
  onToggleCompare: () => void;
  onSelect: () => void;
}

function fmtDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function TrainCard({ train, selectedForCompare, onToggleCompare, onSelect }: Props) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-shadow hover:shadow-md">
      {/* Honest placeholder banner — no fabricated train photo. */}
      <div
        className="relative flex h-16 items-center gap-2 px-4"
        style={{
          background:
            'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(20,184,166,0.12) 100%)',
        }}
      >
        <TrainFront className="h-6 w-6 text-foreground/25" aria-hidden />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{train.name}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            #{train.number} · {train.operator}
          </p>
        </div>
        <label className="absolute right-2 top-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-background/85 px-2.5 py-1 text-[11px] font-medium backdrop-blur-sm">
          <Checkbox
            checked={selectedForCompare}
            onCheckedChange={onToggleCompare}
            aria-label={`Compare ${train.name}`}
          />
          Compare
        </label>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Route + times */}
        <div className="flex items-center justify-between gap-2">
          <div className="text-left">
            <p className="text-lg font-bold tabular-nums text-foreground">{train.departTime}</p>
            <p className="truncate text-xs text-muted-foreground">{train.from.split(',')[0]}</p>
          </div>
          <div className="flex flex-1 flex-col items-center">
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock className="h-3 w-3" aria-hidden />
              {fmtDuration(train.durationMin)}
            </span>
            <div className="flex w-full items-center gap-1 px-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="h-px flex-1 bg-border" />
              <ArrowRight className="h-3 w-3 text-muted-foreground" aria-hidden />
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold tabular-nums text-foreground">{train.arriveTime}</p>
            <p className="truncate text-xs text-muted-foreground">{train.to.split(',')[0]}</p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border/50 pt-3">
          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
            {TRAIN_CLASS_LABEL[train.travelClass]}
          </span>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-base font-bold tabular-nums text-foreground">
                {formatCurrency(train.price, train.currency)}
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
