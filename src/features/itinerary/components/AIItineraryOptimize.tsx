import { useState } from 'react';
import { Sparkles, Loader2, LightbulbIcon, AlertTriangle, ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { chatWithAI } from '@/services/ai/ai.service';

interface Day {
  id: string;
  date: string;
  label?: string | null;
  activities?: Array<{ title?: string | null; start_time?: string | null }>;
}

interface OptimizationResult {
  suggestions: string[];
  warnings: string[];
  reorderHint: string;
}

interface Props {
  tripId: string;
  destination: string;
  days: Day[];
}

export function AIItineraryOptimize({ tripId: _tripId, destination, days }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [hasError, setHasError] = useState(false);

  async function optimize() {
    setOpen(true);
    setLoading(true);
    setResult(null);
    setHasError(false);

    const daysSummary = days
      .map((d) => {
        const acts = (d.activities ?? [])
          .map((a) => `${a.start_time ?? '?'} ${a.title ?? 'activity'}`)
          .join(', ');
        return `${d.label ?? d.date}: ${acts || 'no activities planned'}`;
      })
      .join('\n');

    const prompt = `You are an expert travel planner. Here is a ${days.length}-day itinerary for ${destination}:

${daysSummary}

Analyze this itinerary and return ONLY a JSON object (no markdown, no explanation) with:
- "suggestions": array of 3-5 actionable improvement tips (strings)
- "warnings": array of 0-3 potential issues or conflicts (strings, empty if none)
- "reorderHint": one sentence on whether the day order makes sense geographically/logistically

Return only the JSON object.`;

    try {
      const response = await chatWithAI([{ role: 'user', content: prompt }]);
      const text = response.content.trim().replace(/^```json?\n?|```$/g, '');
      const parsed = JSON.parse(text) as OptimizationResult;
      setResult(parsed);
    } catch {
      setHasError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => void optimize()}>
        <Sparkles className="mr-2 h-4 w-4 text-primary" />
        AI Optimize
      </Button>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) setOpen(false);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Itinerary Optimizer
            </DialogTitle>
            <DialogDescription>
              AI analysis of your {days.length}-day {destination} itinerary.
            </DialogDescription>
          </DialogHeader>

          {loading && (
            <div className="flex flex-col items-center gap-3 py-10">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Analyzing your itinerary…</p>
            </div>
          )}

          {!loading && hasError && (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <AlertTriangle className="h-7 w-7 text-destructive" aria-hidden />
              <p className="text-sm text-muted-foreground">
                Couldn&apos;t analyze your itinerary. Please try again.
              </p>
              <Button variant="outline" size="sm" onClick={() => void optimize()}>
                Retry
              </Button>
            </div>
          )}

          {!loading && result && (
            <div className="space-y-5">
              {result.suggestions.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <LightbulbIcon className="h-3.5 w-3.5 text-amber-500" />
                    Suggestions
                  </div>
                  <ul className="space-y-2">
                    {result.suggestions.map((s, i) => (
                      <li key={i} className="flex gap-2 text-sm text-foreground">
                        <span className="mt-0.5 h-4 w-4 shrink-0 text-primary">→</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.warnings.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                    Potential Issues
                  </div>
                  <ul className="space-y-2">
                    {result.warnings.map((w, i) => (
                      <li key={i} className="flex gap-2 text-sm text-foreground">
                        <span className="mt-0.5 h-4 w-4 shrink-0 text-amber-500">!</span>
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.reorderHint && (
                <div>
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <ArrowRightLeft className="h-3.5 w-3.5 text-primary" />
                    Day Order
                  </div>
                  <p className="text-sm text-foreground">{result.reorderHint}</p>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => void optimize()}
                className="w-full"
              >
                Re-analyze
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
