import { MapPin } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface Props {
  /** Selected trip id, or '' for unattached. */
  value: string;
  onChange: (tripId: string) => void;
  /** Trips to choose from — only `id` and `title` are needed. */
  trips: { id: string; title: string }[];
  id?: string;
}

/**
 * Shared "attach this booking to a trip" picker, used by every transport
 * booking review flow (hotels, trains, …) so trip attachment stays identical
 * across modes. Presentational only — the caller supplies the trip list.
 */
export function TripAttachSelect({ value, onChange, trips, id = 'attach-trip' }: Props) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="flex items-center gap-1.5 text-xs">
        <MapPin className="h-3 w-3" aria-hidden /> Attach to trip
      </Label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
      >
        <option value="">No trip (keep unattached)</option>
        {trips.map((t) => (
          <option key={t.id} value={t.id}>
            {t.title}
          </option>
        ))}
      </select>
    </div>
  );
}
