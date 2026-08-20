import { CalendarPlus, Copy, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import type { BookingDraft } from '@/features/hotels/types';
import type { TripRow } from '../types';
import { buildItineraryICS, buildItineraryText, itineraryFilename } from '../utils/tripExport';

interface Props {
  trip: TripRow;
  /** Bookings attached to this trip (cancelled are excluded by the serializers). */
  bookings: BookingDraft[];
}

const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

export function TripItineraryExport({ trip, bookings }: Props) {
  function downloadICS() {
    const ics = buildItineraryICS(trip, bookings, Date.now());
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = itineraryFilename(trip, 'ics');
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success('Calendar file downloaded');
  }

  async function copyPlan() {
    const text = buildItineraryText(trip, bookings);
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Itinerary copied to clipboard');
    } catch {
      toast.error('Couldn’t copy — try the calendar export instead');
    }
  }

  async function share() {
    const text = buildItineraryText(trip, bookings);
    try {
      await navigator.share({ title: `${trip.title} itinerary`, text });
    } catch {
      // User dismissed the share sheet, or it failed — no toast needed.
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" className="gap-1.5" onClick={downloadICS}>
        <CalendarPlus className="h-3.5 w-3.5" aria-hidden />
        Calendar
      </Button>
      <Button size="sm" variant="outline" className="gap-1.5" onClick={() => void copyPlan()}>
        <Copy className="h-3.5 w-3.5" aria-hidden />
        Copy plan
      </Button>
      {canShare && (
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => void share()}>
          <Share2 className="h-3.5 w-3.5" aria-hidden />
          Share
        </Button>
      )}
    </div>
  );
}
