import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Bot, Sparkles, RefreshCw, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { chatWithAI } from '@/services/ai/ai.service';
import type { TripRow } from '../types';

/* ── Recommendation shape ─────────────────────────────────────── */
interface Rec {
  emoji: string;
  title: string;
  tip: string;
}

/* ── Recommendation card ──────────────────────────────────────── */
function RecCard({ rec, index }: { rec: Rec; index: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className="flex gap-3 rounded-2xl border border-border/40 bg-card p-4 shadow-card"
      initial={reduced ? {} : { opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={
        reduced
          ? { duration: 0 }
          : { type: 'spring', damping: 24, stiffness: 120, delay: 0.08 * index }
      }
      whileHover={reduced ? {} : { y: -3, boxShadow: '0 10px 28px -6px rgba(0,0,0,0.10)' }}
    >
      <span className="mt-0.5 shrink-0 text-2xl leading-none" aria-hidden>
        {rec.emoji}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{rec.title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{rec.tip}</p>
      </div>
    </motion.div>
  );
}

/* ── Loading skeleton ─────────────────────────────────────────── */
function PanelSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-3 rounded-2xl border border-border/40 bg-card p-4">
          <Skeleton className="h-8 w-8 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── TripAIPanel ──────────────────────────────────────────────── */
interface Props {
  trip: TripRow;
}

async function fetchTripRecommendations(trip: TripRow): Promise<Rec[]> {
  const prompt = `You are a travel expert. For a trip to ${trip.destination} (${trip.start_date} to ${trip.end_date}), provide exactly 3 specific, practical travel recommendations.

Respond with ONLY a valid JSON array — no explanation, no markdown, no code fences:
[{"emoji":"🏛️","title":"Short title","tip":"One to two sentence practical tip."},{"emoji":"🍜","title":"Short title","tip":"One to two sentence practical tip."},{"emoji":"📸","title":"Short title","tip":"One to two sentence practical tip."}]`;

  const res = await chatWithAI([{ role: 'user', content: prompt }], {
    tripContext: {
      tripId: trip.id,
      destination: trip.destination,
      startDate: trip.start_date,
      endDate: trip.end_date,
      budget: trip.total_budget ?? undefined,
      currency: trip.currency,
    },
  });

  const raw = res.content.trim();
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('No JSON array in response');
  const parsed = JSON.parse(match[0]) as Rec[];
  if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Empty array');
  return parsed.slice(0, 3);
}

export function TripAIPanel({ trip }: Props) {
  const reduced = useReducedMotion();

  const {
    data: recs,
    isFetching,
    isError,
    refetch,
  } = useQuery<Rec[], Error>({
    // Includes total_budget/currency because they're spliced into the AI
    // system prompt server-side (supabase/functions/ai-chat/index.ts) —
    // without them, editing a trip's budget or currency would keep serving
    // recommendations generated under the old values until the cache expires.
    queryKey: [
      'trip-ai-recommendations',
      trip.id,
      trip.destination,
      trip.start_date,
      trip.end_date,
      trip.total_budget,
      trip.currency,
    ],
    queryFn: () => fetchTripRecommendations(trip),
    // Revisiting the same trip's detail page repeatedly (or navigating away
    // and back) previously re-fired this on every mount. A multi-hour
    // staleTime keeps recommendations cached across normal browsing while
    // the manual Refresh button below (refetch()) still forces a fresh call
    // on demand regardless of cache freshness.
    staleTime: 6 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 0,
  });

  function handleRefresh() {
    void refetch();
  }

  return (
    <motion.section
      aria-label="AI travel recommendations"
      className="space-y-4"
      initial={reduced ? {} : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/10">
            <Sparkles className="h-4 w-4 text-violet-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">AI Recommendations</p>
            <p className="text-[11px] text-muted-foreground">For {trip.destination}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isFetching && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              aria-label="Refresh recommendations"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </Button>
          )}
          <Link
            to={`/assistant?tripId=${trip.id}`}
            className="hover:bg-primary/8 flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary transition-colors"
          >
            <Bot className="h-3 w-3" />
            Open AI
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Content */}
      {isFetching ? (
        <PanelSkeleton />
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/60 bg-muted/10 py-10 text-center">
          <AlertCircle className="h-6 w-6 text-muted-foreground/50" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Couldn't load recommendations</p>
            <p className="text-xs text-muted-foreground">AI service may be unavailable.</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            Try again
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {(recs ?? []).map((rec, i) => (
            <RecCard key={i} rec={rec} index={i} />
          ))}
        </div>
      )}
    </motion.section>
  );
}
