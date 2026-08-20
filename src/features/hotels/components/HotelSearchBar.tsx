import { Search, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Props {
  value: string;
  onChange: (v: string) => void;
  guests: number;
  onGuestsChange: (n: number) => void;
  onSearch: () => void;
  isLoading?: boolean;
}

export function HotelSearchBar({
  value,
  onChange,
  guests,
  onGuestsChange,
  onSearch,
  isLoading,
}: Props) {
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
            if (e.key === 'Enter') onSearch();
          }}
          placeholder="Where to? City, area, or a place you discovered"
          aria-label="Hotel destination"
          className="h-11 border-0 pl-9 shadow-none focus-visible:ring-0"
        />
      </div>

      <div className="flex items-center gap-2">
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
        <Button onClick={onSearch} disabled={!value.trim() || isLoading} className="h-11 gap-2">
          <Search className="h-4 w-4" aria-hidden />
          Search
        </Button>
      </div>
    </div>
  );
}
