import { Search, MapPin, ArrowRight, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BUS_CLASSES, BUS_CLASS_LABEL } from '../types';
import type { BusClass } from '../types';

interface Props {
  from: string;
  to: string;
  date: string;
  busClass: BusClass;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  onDateChange: (v: string) => void;
  onClassChange: (v: BusClass) => void;
  onSearch: () => void;
  isLoading?: boolean;
}

const today = () => new Date().toISOString().split('T')[0];

export function BusSearchBar({
  from,
  to,
  date,
  busClass,
  onFromChange,
  onToChange,
  onDateChange,
  onClassChange,
  onSearch,
  isLoading,
}: Props) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-card p-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <MapPin
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={from}
            onChange={(e) => onFromChange(e.target.value)}
            placeholder="From"
            aria-label="From city"
            className="h-11 border-0 pl-9 shadow-none focus-visible:ring-0"
          />
        </div>
        <ArrowRight
          className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block"
          aria-hidden
        />
        <div className="relative flex-1">
          <MapPin
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={to}
            onChange={(e) => onToChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSearch();
            }}
            placeholder="To"
            aria-label="To city"
            className="h-11 border-0 pl-9 shadow-none focus-visible:ring-0"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <CalendarDays
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="date"
            value={date}
            min={today()}
            onChange={(e) => onDateChange(e.target.value)}
            aria-label="Travel date"
            className="h-11 pl-9"
          />
        </div>
        <select
          value={busClass}
          onChange={(e) => onClassChange(e.target.value as BusClass)}
          aria-label="Bus type"
          className="h-11 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          {BUS_CLASSES.map((c) => (
            <option key={c} value={c}>
              {BUS_CLASS_LABEL[c]}
            </option>
          ))}
        </select>
        <Button
          onClick={onSearch}
          disabled={!from.trim() || !to.trim() || isLoading}
          className="h-11 gap-2"
        >
          <Search className="h-4 w-4" aria-hidden />
          Search
        </Button>
      </div>
    </div>
  );
}
