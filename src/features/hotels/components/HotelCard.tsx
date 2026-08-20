import { BedDouble, MapPin, Star, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/formatters';
import { resolveDestinationTheme } from '@/utils/destinationTheme';
import type { Hotel } from '../types';

interface Props {
  hotel: Hotel;
  selectedForCompare: boolean;
  onToggleCompare: () => void;
  onSelect: () => void;
}

export function HotelCard({ hotel, selectedForCompare, onToggleCompare, onSelect }: Props) {
  // Honest imagery: the mock provider has no real per-hotel photo, so we never
  // fabricate one. We render a destination-themed gradient banner with a hotel
  // glyph — the same "no real image → gradient" rule the rest of the app uses.
  const theme = resolveDestinationTheme(hotel.destination);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-shadow hover:shadow-md">
      {/* Banner (gradient placeholder — not a fabricated photo) */}
      <div
        className="relative h-28"
        style={{
          background: `linear-gradient(135deg, ${theme.accent}40 0%, ${theme.secondary}22 100%)`,
        }}
        role="img"
        aria-label={`${hotel.name} in ${hotel.area}`}
      >
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <BedDouble className="h-10 w-10 text-foreground/15" aria-hidden />
        </div>
        {/* Compare toggle */}
        <label className="absolute right-2 top-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-background/85 px-2.5 py-1 text-[11px] font-medium backdrop-blur-sm">
          <Checkbox
            checked={selectedForCompare}
            onCheckedChange={onToggleCompare}
            aria-label={`Compare ${hotel.name}`}
          />
          Compare
        </label>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight text-foreground">{hotel.name}</h3>
          <span className="flex shrink-0 items-center gap-1 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">
            <Star className="h-3 w-3 fill-current" aria-hidden />
            {hotel.rating.toFixed(1)}
          </span>
        </div>

        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" aria-hidden />
          {hotel.area}, {hotel.destination.split(',')[0]}
          <span className="text-muted-foreground/50">·</span>
          {hotel.reviewCount.toLocaleString()} reviews
        </p>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1.5">
          {hotel.amenities.slice(0, 4).map((a) => (
            <span
              key={a}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
            >
              <Check className="h-2.5 w-2.5" aria-hidden />
              {a}
            </span>
          ))}
        </div>

        {/* Price + select */}
        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            <p className="text-lg font-bold tabular-nums text-foreground">
              {formatCurrency(hotel.pricePerNight, hotel.currency)}
            </p>
            <p className="text-[11px] text-muted-foreground">per night</p>
          </div>
          <Button size="sm" onClick={onSelect} className={cn('gap-1.5')}>
            Select
          </Button>
        </div>
      </div>
    </div>
  );
}
