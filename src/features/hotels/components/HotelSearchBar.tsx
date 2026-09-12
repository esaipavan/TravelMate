import { useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { Search, MapPin, Users, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DateRangePicker } from '@/features/onboarding/components/DateRangePicker';

interface Props {
  value: string;
  onChange: (v: string) => void;
  guests: number;
  onGuestsChange: (n: number) => void;
  /** YYYY-MM-DD, or '' when not yet picked. Required for a real, dated price
   *  quote — a nightly rate has no honest meaning without dates. */
  checkIn: string;
  checkOut: string;
  onDatesChange: (checkIn: string, checkOut: string) => void;
  onSearch: () => void;
  isLoading?: boolean;
}

const toISO = (d: Date) => d.toISOString().split('T')[0];
const fromISO = (s: string) => (s ? new Date(s + 'T00:00:00') : undefined);

export function HotelSearchBar({
  value,
  onChange,
  guests,
  onGuestsChange,
  checkIn,
  checkOut,
  onDatesChange,
  onSearch,
  isLoading,
}: Props) {
  const [open, setOpen] = useState(false);
  const today = useMemo(() => new Date(new Date().setHours(0, 0, 0, 0)), []);

  const range: DateRange | undefined = useMemo(
    () => ({ from: fromISO(checkIn), to: fromISO(checkOut) }),
    [checkIn, checkOut],
  );

  function handleRangeChange(next: DateRange | undefined) {
    onDatesChange(next?.from ? toISO(next.from) : '', next?.to ? toISO(next.to) : '');
    if (next?.from && next?.to) setOpen(false);
  }

  const datesLabel =
    range.from && range.to
      ? `${format(range.from, 'd MMM')} – ${format(range.to, 'd MMM')}`
      : 'Add dates';

  const canSearch = !!value.trim() && !!checkIn && !!checkOut && !isLoading;

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-card p-2 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <MapPin
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && canSearch) onSearch();
          }}
          placeholder="Where to? City, area, or a place you discovered"
          aria-label="Hotel destination"
          className="h-11 border-0 pl-9 shadow-none focus-visible:ring-0"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-11 gap-2 text-sm font-normal text-foreground"
              type="button"
            >
              <CalendarDays className="h-4 w-4 text-muted-foreground" aria-hidden />
              {datesLabel}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="start">
            <DateRangePicker range={range} today={today} onRangeChange={handleRangeChange} />
          </PopoverContent>
        </Popover>

        <div className="relative">
          <Users
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="number"
            min={1}
            max={20}
            value={guests}
            onChange={(e) => onGuestsChange(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
            aria-label="Guests"
            className="h-11 w-24 pl-9"
          />
        </div>
        <Button onClick={onSearch} disabled={!canSearch} className="h-11 gap-2">
          <Search className="h-4 w-4" aria-hidden />
          Search
        </Button>
      </div>
    </div>
  );
}
