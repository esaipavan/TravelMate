import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getTripBrief } from '../services/brief.service';
import type { TripBriefRow } from '../services/brief.service';

interface UseTripBriefResult {
  brief: TripBriefRow | null;
  isLoading: boolean;
  isError: boolean;
}

export function useTripBrief(tripId: string | null): UseTripBriefResult {
  const [brief, setBrief] = useState<TripBriefRow | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!tripId) return;

    const id = tripId;
    let cancelled = false;

    async function fetchBrief() {
      setIsLoading(true);
      setIsError(false);
      try {
        const data = await getTripBrief(id);
        if (!cancelled) setBrief(data);
      } catch {
        if (!cancelled) setIsError(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void fetchBrief();

    const channel = supabase
      .channel(`trip-brief-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'trip_briefs',
          filter: `trip_id=eq.${id}`,
        },
        (payload) => {
          if (!cancelled) setBrief(payload.new as TripBriefRow);
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [tripId]);

  return { brief, isLoading, isError };
}
