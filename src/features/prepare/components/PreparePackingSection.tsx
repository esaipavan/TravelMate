import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CheckSquare, ArrowRight, Loader2, Check } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useChecklistData } from '@/features/checklist/hooks/useChecklist';
import { AIPackingSuggest } from '@/features/checklist/components/AIPackingSuggest';
import type { TripBriefRow } from '@/features/dashboard/hooks/useTripBrief';

interface GuideChecklistGroup {
  category?: string;
  items?: string[];
}

interface Props {
  tripId: string;
  destination: string;
  startDate: string | null;
  endDate: string | null;
  brief: TripBriefRow | null;
}

function extractGuideItems(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const names: string[] = [];
  for (const group of raw as GuideChecklistGroup[]) {
    if (!group || !Array.isArray(group.items)) continue;
    for (const item of group.items) {
      if (typeof item === 'string' && item.trim()) names.push(item.trim());
    }
  }
  return names;
}

export function PreparePackingSection({ tripId, destination, startDate, endDate, brief }: Props) {
  const qc = useQueryClient();
  const { data, isLoading } = useChecklistData(tripId);
  const items = useMemo(() => data?.items ?? [], [data]);
  const existingNames = useMemo(() => new Set(items.map((i) => i.name.toLowerCase())), [items]);

  const guideItems = useMemo(() => {
    if (brief?.status !== 'complete') return [];
    const names = extractGuideItems(brief.packing_checklist);
    const seen = new Set<string>();
    return names.filter((n) => {
      const norm = n.toLowerCase();
      if (existingNames.has(norm) || seen.has(norm)) return false;
      seen.add(norm);
      return true;
    });
  }, [brief, existingNames]);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);

  function toggle(name: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  async function addSelectedGuideItems() {
    if (selected.size === 0) return;
    setAdding(true);
    // Re-check against the latest cache right before writing — avoids a
    // duplicate row if the user already added the same item another way
    // (e.g. via AI Suggest) since this section last rendered.
    const rows = Array.from(selected)
      .filter((name) => !existingNames.has(name.toLowerCase()))
      .map((name) => ({
        trip_id: tripId,
        name,
        category: 'Other',
        quantity: 1,
        is_essential: false,
        is_packed: false,
      }));

    if (rows.length === 0) {
      setAdding(false);
      setSelected(new Set());
      return;
    }

    const { error } = await supabase.from('packing_items').insert(rows);
    if (error) {
      toast.error('Failed to add items');
    } else {
      toast.success(`Added ${rows.length} item${rows.length !== 1 ? 's' : ''} to your checklist`);
      void qc.invalidateQueries({ queryKey: ['checklist', tripId] });
      setSelected(new Set());
    }
    setAdding(false);
  }

  const packedCount = items.filter((i) => i.is_packed).length;

  return (
    <section id="packing" className="scroll-mt-20 rounded-2xl border border-border/60 bg-card p-5">
      <div className="mb-1 flex items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <CheckSquare className="h-4 w-4 text-primary" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground">Packing</h2>
          <p className="text-xs text-muted-foreground">
            Prepare the things you'll need for your trip.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-4 h-11 animate-pulse rounded-xl bg-muted/50" />
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">
          {items.length === 0
            ? "You haven't started your packing list yet."
            : `${items.length} item${items.length !== 1 ? 's' : ''} · ${packedCount} packed`}
        </p>
      )}

      {/* Suggestions carried over from the trip guide, if one exists */}
      {guideItems.length > 0 && (
        <div className="mt-4 space-y-2 rounded-xl border border-dashed border-border/60 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            From your trip guide
          </p>
          <div className="space-y-1.5">
            {guideItems.slice(0, 10).map((name) => (
              <div key={name} className="flex items-center gap-2.5">
                <Checkbox
                  id={`guide-pack-${name}`}
                  checked={selected.has(name)}
                  onCheckedChange={() => toggle(name)}
                />
                <Label htmlFor={`guide-pack-${name}`} className="cursor-pointer text-sm">
                  {name}
                </Label>
              </div>
            ))}
          </div>
          <Button
            size="sm"
            variant="outline"
            className="mt-1 w-full"
            disabled={selected.size === 0 || adding}
            onClick={() => void addSelectedGuideItems()}
          >
            {adding ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="mr-2 h-3.5 w-3.5" />
            )}
            Add {selected.size > 0 ? selected.size : ''} item{selected.size !== 1 ? 's' : ''}
          </Button>
        </div>
      )}

      <div className="mt-4">
        <AIPackingSuggest
          tripId={tripId}
          destination={destination}
          startDate={startDate}
          endDate={endDate}
          existingItems={items.map((i) => i.name)}
        />
      </div>

      <Link
        to={`/trips/${tripId}/checklist`}
        className="mt-4 flex items-center gap-1 text-xs font-medium text-primary hover:underline"
      >
        Open full checklist
        <ArrowRight className="h-3 w-3" aria-hidden="true" />
      </Link>
    </section>
  );
}
