import { useState } from 'react';
import { Sparkles, Loader2, Check, PackageOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { chatWithAI } from '@/services/ai/ai.service';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PACKING_CATEGORIES } from '../types';

interface SuggestedItem {
  name: string;
  category: string;
  is_essential: boolean;
}

interface Props {
  tripId: string;
  destination: string;
  startDate?: string | null;
  endDate?: string | null;
  existingItems: string[];
}

export function AIPackingSuggest({
  tripId,
  destination,
  startDate,
  endDate,
  existingItems,
}: Props) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  const validCategories = PACKING_CATEGORIES.map((c) => c.value);

  async function fetchSuggestions() {
    setLoading(true);
    setSuggestions([]);
    setSelected(new Set());
    setFetchError(false);

    const dest = destination || 'the destination';
    const days =
      startDate && endDate
        ? Math.max(
            1,
            Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000),
          )
        : null;

    const prompt = `You are a travel packing expert. Suggest 20 essential packing items for a ${days ? `${days}-day ` : ''}trip to ${dest}.

Exclude these already-packed items: ${existingItems.length > 0 ? existingItems.join(', ') : 'none'}.

Return a JSON array (no markdown, no explanation) where each object has:
- "name": item name (short, 2-4 words)
- "category": one of exactly: Documents, Clothing, Electronics, Toiletries, Medicines, Accessories, Food, Other
- "is_essential": true or false

Return only the JSON array.`;

    try {
      const result = await chatWithAI([{ role: 'user', content: prompt }]);
      const text = result.content.trim().replace(/^```json?\n?|```$/g, '');
      const items = JSON.parse(text) as SuggestedItem[];
      const clean = items
        .filter((i) => i.name && (validCategories as string[]).includes(i.category))
        .slice(0, 20);
      setSuggestions(clean);
      // Pre-select essentials
      setSelected(new Set(clean.filter((i) => i.is_essential).map((i) => i.name)));
    } catch {
      setFetchError(true);
      toast.error('Could not generate suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function toggle(name: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  async function addSelected() {
    if (selected.size === 0) return;
    setAdding(true);
    // Re-check against the latest existingItems right before writing — the
    // AI prompt only asks the model to avoid these names as a soft
    // instruction, so a repeated suggestion (or a stale suggestions list)
    // must still be filtered out here to avoid a duplicate packing_items row.
    const existingLower = new Set(existingItems.map((n) => n.toLowerCase()));
    const items = suggestions
      .filter((s) => selected.has(s.name) && !existingLower.has(s.name.toLowerCase()))
      .map((s) => ({
        trip_id: tripId,
        name: s.name,
        category: s.category,
        quantity: 1,
        is_essential: s.is_essential,
        is_packed: false,
      }));

    if (items.length === 0) {
      setOpen(false);
      setAdding(false);
      return;
    }

    const { error } = await supabase.from('packing_items').insert(items);
    if (error) {
      toast.error('Failed to add items');
    } else {
      toast.success(`Added ${items.length} item${items.length !== 1 ? 's' : ''} to your checklist`);
      void qc.invalidateQueries({ queryKey: ['checklist', tripId] });
      setOpen(false);
    }
    setAdding(false);
  }

  function handleOpen() {
    setOpen(true);
    void fetchSuggestions();
  }

  // Group by category
  const grouped = suggestions.reduce<Record<string, SuggestedItem[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleOpen}>
        <Sparkles className="mr-2 h-4 w-4 text-primary" />
        AI Suggest
      </Button>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) setOpen(false);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Packing Suggestions
            </DialogTitle>
            <DialogDescription>
              Suggested items for {destination || 'your trip'}. Select what to add.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {loading && (
              <div className="flex flex-col items-center gap-3 py-8">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Generating suggestions…</p>
              </div>
            )}

            {!loading && suggestions.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <PackageOpen className="h-8 w-8 text-muted-foreground opacity-40" />
                <p className="text-sm text-muted-foreground">
                  {fetchError
                    ? 'Something went wrong generating suggestions.'
                    : 'No suggestions generated'}
                </p>
                <Button variant="outline" size="sm" onClick={() => void fetchSuggestions()}>
                  Try again
                </Button>
              </div>
            )}

            {!loading && suggestions.length > 0 && (
              <>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {selected.size} of {suggestions.length} selected
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelected(new Set(suggestions.map((s) => s.name)))}
                      className="hover:text-foreground"
                    >
                      All
                    </button>
                    <span>·</span>
                    <button
                      onClick={() => setSelected(new Set())}
                      className="hover:text-foreground"
                    >
                      None
                    </button>
                  </div>
                </div>

                <div className="max-h-72 space-y-4 overflow-y-auto pr-1">
                  {Object.entries(grouped).map(([cat, items]) => {
                    const meta = PACKING_CATEGORIES.find((c) => c.value === cat);
                    return (
                      <div key={cat}>
                        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {meta?.emoji ?? '📦'} {cat}
                        </p>
                        <div className="space-y-1.5">
                          {items.map((item) => (
                            <div key={item.name} className="flex items-center gap-2.5">
                              <Checkbox
                                id={item.name}
                                checked={selected.has(item.name)}
                                onCheckedChange={() => toggle(item.name)}
                              />
                              <Label
                                htmlFor={item.name}
                                className="cursor-pointer text-sm leading-tight"
                              >
                                {item.name}
                                {item.is_essential && (
                                  <span className="ml-1.5 inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                                    Essential
                                  </span>
                                )}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-2 border-t pt-3">
                  <Button
                    className="flex-1"
                    onClick={() => void addSelected()}
                    disabled={selected.size === 0 || adding}
                  >
                    {adding ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    Add {selected.size > 0 ? selected.size : ''} item
                    {selected.size !== 1 ? 's' : ''}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => void fetchSuggestions()}
                    disabled={loading}
                  >
                    Refresh
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
