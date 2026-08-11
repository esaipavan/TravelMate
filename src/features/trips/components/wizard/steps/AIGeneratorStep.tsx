import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Sparkles, RefreshCw, AlertCircle, X, Check } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { rv, FADE_VARIANTS, LIST_VARIANTS, LIST_ITEM_VARIANTS, CARD_VARIANTS } from '@/lib/motion';
import { chatWithAI } from '@/services/ai/ai.service';
import { useWizard, SECTION_META, TRIP_TYPE_META } from '../WizardContext';
import type { GeneratedSection } from '../WizardContext';

/* ── Static fallback content ─────────────────────────────────────── */

function buildFallback(
  destination: string,
  _tripType: string,
  duration: number,
): Record<string, string> {
  return {
    itinerary: `Day 1: Arrive in ${destination} and settle into your accommodation. Day 2–${Math.max(2, duration - 1)}: Explore key attractions, local neighbourhoods, and hidden gems. Final day: Last-minute shopping, a farewell meal, and departure.`,
    packing:
      'Passport & visas, travel adapters, comfortable walking shoes, weather-appropriate clothing, portable charger, reusable water bottle, first-aid kit, snacks, camera, and any prescription medications.',
    weather: `Check local forecasts closer to departure. ${destination} can experience varied conditions — pack versatile layers and a light rain jacket to be prepared.`,
    currency: `Research the local currency before departure. Carry a mix of cash and a travel-friendly card with low foreign transaction fees. Notify your bank of your travel dates.`,
    language: `Learn a few basic phrases: Hello, Thank you, Please, Excuse me, How much?, and Do you speak English? Locals always appreciate the effort.`,
    emergency: `Save the local emergency number (police, ambulance, fire) and the nearest embassy or consulate contact in your phone before you fly. Get travel insurance that covers medical evacuation.`,
    attractions: `${destination} is home to world-class attractions. Research the top-rated sites, book timed entry tickets for popular venues in advance, and leave room for spontaneous discoveries.`,
    food: `Explore local street food at busy stalls where high turnover signals freshness. Ask your accommodation for neighbourhood restaurant recommendations to avoid tourist traps. Try at least one regional specialty per day.`,
    transport: `Use official taxis, ride-hailing apps, or public transit. Pre-book airport transfers to avoid overcharging on arrival. Download an offline map before you land.`,
    tips: `Travel light. Respect local customs and dress codes. Keep digital and physical copies of key documents. Stay flexible — the best experiences are often unplanned.`,
    dailyBudget: `Budget for accommodation, meals, local transport, and one activity per day. Set aside 10–15% as a contingency fund for unexpected expenses or spontaneous opportunities.`,
  };
}

/* ── AI prompt builder ───────────────────────────────────────────── */

function buildPrompt(
  destination: string,
  tripType: string,
  startDate: string,
  endDate: string,
  duration: number,
  budget: number,
  currency: string,
): string {
  const start = format(parseISO(startDate + 'T00:00:00'), 'MMM d, yyyy');
  const end = format(parseISO(endDate + 'T00:00:00'), 'MMM d, yyyy');
  return [
    `Generate a concise travel guide for a ${tripType} trip to ${destination}.`,
    `Travel dates: ${start} to ${end} (${duration} days). Total budget: ${budget} ${currency}.`,
    ``,
    `Respond ONLY with valid JSON — no markdown, no code fences, no extra text. Use exactly these keys:`,
    `{"itinerary":"...","packing":"...","weather":"...","currency":"...","language":"...","emergency":"...","attractions":"...","food":"...","transport":"...","tips":"...","dailyBudget":"..."}`,
    ``,
    `Each value: 2–3 sentences, specific to ${destination} and the ${tripType} travel style.`,
  ].join('\n');
}

/* ── Section card ────────────────────────────────────────────────── */

function SectionCard({
  section,
  onToggle,
  reduced,
}: {
  section: GeneratedSection;
  onToggle: (id: string) => void;
  reduced: boolean | null;
}) {
  return (
    <motion.div
      variants={rv(LIST_ITEM_VARIANTS, reduced)}
      className={[
        'group relative rounded-2xl border p-4 transition-all duration-200',
        section.enabled ? 'border-primary/30 bg-primary/5' : 'border-border/60 bg-card opacity-60',
      ].join(' ')}
    >
      {/* Toggle */}
      <button
        type="button"
        onClick={() => onToggle(section.id)}
        aria-pressed={section.enabled}
        aria-label={`${section.enabled ? 'Remove' : 'Include'} ${section.title}`}
        className={[
          'absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full transition-all',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          section.enabled
            ? 'bg-primary text-primary-foreground'
            : 'border border-border text-muted-foreground hover:border-primary hover:text-primary',
        ].join(' ')}
      >
        {section.enabled ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      </button>

      {/* Content */}
      <div className="pr-7">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-lg leading-none" aria-hidden="true">
            {section.icon}
          </span>
          <h3 className="text-sm font-bold text-foreground">{section.title}</h3>
        </div>
        <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
          {section.content}
        </p>
      </div>
    </motion.div>
  );
}

/* ── Loading skeleton ────────────────────────────────────────────── */

function LoadingSkeleton({ reduced }: { reduced: boolean | null }) {
  return (
    <div className="space-y-6 text-center">
      <motion.div
        animate={reduced ? {} : { opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.8, repeat: Infinity }}
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10"
      >
        <Sparkles className="h-8 w-8 text-primary" aria-hidden="true" />
      </motion.div>
      <div>
        <h3 className="text-lg font-bold text-foreground">Generating your travel guide…</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Our AI is crafting a personalised plan for your adventure.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className="h-28 rounded-2xl border border-border/60 bg-muted"
            animate={reduced ? {} : { opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Step ────────────────────────────────────────────────────────── */

export function AIGeneratorStep() {
  const reduced = useReducedMotion();
  const { state, dispatch } = useWizard();

  const {
    destination,
    tripType,
    startDate,
    endDate,
    budget,
    currency,
    generationStatus,
    generatedSections,
  } = state;

  const duration =
    startDate && endDate
      ? differenceInDays(parseISO(endDate + 'T00:00:00'), parseISO(startDate + 'T00:00:00')) + 1
      : 0;

  const totalBudgetAmount = (Object.values(budget) as number[]).reduce((s, v) => s + v, 0);
  const tripTypeLabel = tripType ? TRIP_TYPE_META[tripType].label : 'Solo';

  const generate = useCallback(async () => {
    dispatch({ type: 'SET_GENERATION_STATUS', status: 'loading' });
    try {
      let parsed: Record<string, string> = {};
      try {
        const response = await chatWithAI([
          {
            role: 'user',
            content: buildPrompt(
              destination,
              tripTypeLabel,
              startDate,
              endDate,
              duration,
              totalBudgetAmount,
              currency,
            ),
          },
        ]);
        const text = response.content.trim();
        // Strip markdown code fences if present
        const jsonText = text
          .replace(/^```(?:json)?\s*/i, '')
          .replace(/\s*```$/i, '')
          .trim();
        parsed = JSON.parse(jsonText) as Record<string, string>;
      } catch {
        // Fall back to static content
        parsed = buildFallback(destination, tripTypeLabel, duration);
      }

      const sections: GeneratedSection[] = SECTION_META.map((m) => ({
        id: m.id,
        title: m.title,
        icon: m.icon,
        content:
          (typeof parsed[m.id] === 'string' ? parsed[m.id] : '') ||
          buildFallback(destination, tripTypeLabel, duration)[m.id] ||
          '',
        enabled: true,
      }));

      dispatch({ type: 'SET_GENERATED_SECTIONS', sections });
      dispatch({ type: 'SET_GENERATION_STATUS', status: 'done' });
    } catch {
      // Use fallback on total failure
      const fallback = buildFallback(destination, tripTypeLabel, duration);
      const sections: GeneratedSection[] = SECTION_META.map((m) => ({
        id: m.id,
        title: m.title,
        icon: m.icon,
        content: fallback[m.id] ?? '',
        enabled: true,
      }));
      dispatch({ type: 'SET_GENERATED_SECTIONS', sections });
      dispatch({ type: 'SET_GENERATION_STATUS', status: 'error' });
    }
  }, [
    destination,
    tripTypeLabel,
    startDate,
    endDate,
    duration,
    totalBudgetAmount,
    currency,
    dispatch,
  ]);

  /* Auto-generate on mount if idle. `generationStatus` is included below —
   * `generate()` moves status away from 'idle' as its first synchronous
   * action, so this effect only ever calls `generate()` once per mount no
   * matter how many times it re-runs as status advances loading → done/error.
   * `generate` itself is intentionally left out: none of its inputs
   * (destination, tripType, dates, budget, currency) are editable from this
   * step's UI, so its identity is stable for the lifetime of this mount —
   * adding it would only add risk if that invariant ever changes, since a
   * `generate` identity change would retrigger this effect. */
  useEffect(() => {
    if (generationStatus === 'idle') {
      void generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `generate` intentionally excluded, see comment above
  }, [generationStatus]);

  function handleRegenerate() {
    void generate();
  }

  function handleToggle(id: string) {
    dispatch({ type: 'TOGGLE_SECTION', id });
  }

  const enabledCount = generatedSections.filter((s) => s.enabled).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <motion.p
          className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary"
          variants={rv(FADE_VARIANTS, reduced)}
          initial="hidden"
          animate="show"
        >
          Step 6 of 7
        </motion.p>
        <motion.h1
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          variants={rv(FADE_VARIANTS, reduced)}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.05 }}
        >
          AI Travel Guide
        </motion.h1>
        <motion.p
          className="mt-2 text-base text-muted-foreground"
          variants={rv(FADE_VARIANTS, reduced)}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.1 }}
        >
          We've generated a personalised travel guide for {destination}. Toggle sections to include
          in your trip.
        </motion.p>
      </div>

      {/* Loading */}
      <AnimatePresence mode="wait">
        {generationStatus === 'loading' ? (
          <motion.div
            key="loading"
            variants={rv(CARD_VARIANTS, reduced)}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            <LoadingSkeleton reduced={reduced} />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            variants={rv(FADE_VARIANTS, reduced)}
            initial="hidden"
            animate="show"
          >
            {/* Error notice */}
            {generationStatus === 'error' && (
              <div className="mb-4 flex items-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                AI generation unavailable — showing curated travel guide instead.
              </div>
            )}

            {/* Section count + regenerate */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{enabledCount}</span> of{' '}
                {generatedSections.length} sections included
              </p>
              <button
                type="button"
                onClick={handleRegenerate}
                className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                Regenerate
              </button>
            </div>

            {/* Sections grid */}
            <motion.div
              className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
              variants={rv(LIST_VARIANTS, reduced)}
              initial="hidden"
              animate="show"
            >
              {generatedSections.map((section) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  onToggle={handleToggle}
                  reduced={reduced}
                />
              ))}
            </motion.div>

            {enabledCount === 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-center text-sm text-muted-foreground"
              >
                Enable at least one section, or continue to the review step.
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
