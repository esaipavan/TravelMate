import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Search, MapPin, X, Star, Calendar, DollarSign } from 'lucide-react';
import { rv, CARD_VARIANTS, FADE_VARIANTS, LIST_VARIANTS, LIST_ITEM_VARIANTS } from '@/lib/motion';
import { resolveDestinationImageUrl } from '@/utils/destinationTheme';
import { searchDestinations } from '../destinationData';
import type { DestinationInfo } from '../destinationData';
import { useWizard } from '../WizardContext';

/* ── Destination preview card ────────────────────────────────────── */

function DestinationPreview({ info }: { info: DestinationInfo }) {
  const reduced = useReducedMotion();
  const imageUrl = resolveDestinationImageUrl(info.name);

  return (
    <motion.div
      variants={rv(CARD_VARIANTS, reduced)}
      initial="hidden"
      animate="show"
      className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-md"
    >
      {/* Hero image */}
      <div className="relative h-52 overflow-hidden sm:h-64">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={info.name}
            className="h-full w-full object-cover"
            loading="eager"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background:
                'linear-gradient(135deg, rgba(99,102,241,0.75) 0%, rgba(139,92,246,0.55) 100%)',
            }}
            role="img"
            aria-label={info.name}
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.10) 55%)',
          }}
          aria-hidden="true"
        />
        {/* Flag + name overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl leading-none" aria-hidden="true">
              {info.flagEmoji}
            </span>
            <div>
              <h3 className="text-xl font-bold text-white">{info.name}</h3>
              <p className="text-sm text-white/75">{info.country}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info body */}
      <div className="space-y-4 p-5">
        <p className="text-sm leading-relaxed text-muted-foreground">{info.description}</p>

        {/* Meta chips */}
        <div className="flex flex-wrap gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <Calendar className="h-3 w-3" aria-hidden="true" />
            Best: {info.bestSeason}
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <DollarSign className="h-3 w-3" aria-hidden="true" />
            ~${info.avgDailyBudget}/day per person
          </span>
        </div>

        {/* Attractions */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Popular Attractions
          </p>
          <motion.ul
            className="grid grid-cols-2 gap-1.5"
            variants={rv(LIST_VARIANTS, reduced)}
            initial="hidden"
            animate="show"
          >
            {info.attractions.map((a) => (
              <motion.li
                key={a}
                variants={rv(LIST_ITEM_VARIANTS, reduced)}
                className="flex items-center gap-1.5 text-xs text-foreground"
              >
                <Star className="h-3 w-3 shrink-0 text-amber-400" aria-hidden="true" />
                {a}
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Search result item ──────────────────────────────────────────── */

function ResultItem({
  info,
  onSelect,
}: {
  info: DestinationInfo;
  onSelect: (d: DestinationInfo) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(info)}
      className={[
        'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
        'hover:bg-muted focus-visible:bg-muted',
        'focus-visible:outline-none',
      ].join(' ')}
    >
      <span className="text-lg leading-none" aria-hidden="true">
        {info.flagEmoji}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{info.name}</p>
        <p className="truncate text-xs text-muted-foreground">{info.country}</p>
      </div>
      <span className="ml-auto shrink-0 text-[10px] font-medium text-muted-foreground/60">
        Best: {info.bestSeason}
      </span>
    </button>
  );
}

/* ── Step ────────────────────────────────────────────────────────── */

export function DestinationStep() {
  const reduced = useReducedMotion();
  const { state, dispatch } = useWizard();

  const [query, setQuery] = useState(state.destination);
  const [results, setResults] = useState<DestinationInfo[]>([]);
  const [open, setOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* Sync search results */
  useEffect(() => {
    const r = searchDestinations(query);
    setResults(r);
  }, [query]);

  /* Close dropdown on outside click */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        !inputRef.current?.contains(e.target as Node) &&
        !dropdownRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = useCallback(
    (info: DestinationInfo) => {
      setQuery(info.name);
      setOpen(false);
      dispatch({ type: 'SET_DESTINATION', destination: info.name, meta: info });
    },
    [dispatch],
  );

  function handleInputChange(v: string) {
    setQuery(v);
    setOpen(true);
    if (!v.trim()) {
      dispatch({ type: 'SET_DESTINATION', destination: '', meta: null });
    } else if (state.destinationMeta?.name !== v) {
      // Custom destination (not from catalogue)
      dispatch({ type: 'SET_DESTINATION', destination: v, meta: null });
    }
  }

  function handleClear() {
    setQuery('');
    setOpen(false);
    dispatch({ type: 'SET_DESTINATION', destination: '', meta: null });
    inputRef.current?.focus();
  }

  return (
    <div className="space-y-8">
      {/* ── Step header ─────────────────────────────────────────── */}
      <div>
        <motion.p
          className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary"
          variants={rv(FADE_VARIANTS, reduced)}
          initial="hidden"
          animate="show"
        >
          Step 1 of 5
        </motion.p>
        <motion.h1
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          variants={rv(FADE_VARIANTS, reduced)}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.05 }}
        >
          Where are you going?
        </motion.h1>
        <motion.p
          className="mt-2 text-base text-muted-foreground"
          variants={rv(FADE_VARIANTS, reduced)}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.1 }}
        >
          Search a city, country, or landmark. We'll personalise your planning around it.
        </motion.p>
      </div>

      {/* ── Search input ────────────────────────────────────────── */}
      <div className="relative">
        <div className="relative flex items-center">
          <MapPin
            className="pointer-events-none absolute left-4 h-5 w-5 text-primary"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder="Search destinations…"
            aria-label="Destination"
            autoComplete="off"
            className={[
              'w-full rounded-2xl border border-border bg-card py-4 pl-12 pr-12',
              'text-base font-medium text-foreground placeholder:text-muted-foreground/60',
              'shadow-sm transition-shadow duration-200',
              'focus:border-primary focus:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20',
            ].join(' ')}
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear destination"
              className="absolute right-4 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {!query && (
            <Search
              className="pointer-events-none absolute right-4 h-4 w-4 text-muted-foreground/50"
              aria-hidden="true"
            />
          )}
        </div>

        {/* Autocomplete dropdown */}
        <AnimatePresence>
          {open && results.length > 0 && (
            <motion.div
              ref={dropdownRef}
              role="listbox"
              aria-label="Destination suggestions"
              className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
              variants={rv(FADE_VARIANTS, reduced)}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              {results.map((info) => (
                <ResultItem key={info.name} info={info} onSelect={handleSelect} />
              ))}
              {/* Custom destination hint */}
              {query && !results.find((r) => r.name.toLowerCase() === query.toLowerCase()) && (
                <div className="flex items-center gap-2 border-t border-border/60 px-4 py-2.5">
                  <Search className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                  <span className="text-xs text-muted-foreground">
                    Continue with "<span className="font-medium text-foreground">{query}</span>"
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Destination preview ──────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {state.destinationMeta ? (
          <DestinationPreview key={state.destinationMeta.name} info={state.destinationMeta} />
        ) : state.destination && !state.destinationMeta ? (
          <motion.div
            key="custom"
            variants={rv(CARD_VARIANTS, reduced)}
            initial="hidden"
            animate="show"
            className="flex items-center gap-4 rounded-3xl border border-border/60 bg-card p-5 shadow-sm"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
              <MapPin className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{state.destination}</p>
              <p className="text-sm text-muted-foreground">
                Custom destination — we'll personalise once you continue.
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* ── Popular destinations chips ───────────────────────────── */}
      {!state.destination && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Popular destinations
          </p>
          <motion.div
            className="flex flex-wrap gap-2"
            variants={rv(LIST_VARIANTS, reduced)}
            initial="hidden"
            animate="show"
          >
            {searchDestinations('').map((d) => (
              <motion.button
                key={d.name}
                type="button"
                variants={rv(LIST_ITEM_VARIANTS, reduced)}
                onClick={() => handleSelect(d)}
                className={[
                  'flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5',
                  'text-sm font-medium text-foreground transition-colors',
                  'hover:border-primary/40 hover:bg-primary/5',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                ].join(' ')}
              >
                <span className="leading-none" aria-hidden="true">
                  {d.flagEmoji}
                </span>
                {d.name}
              </motion.button>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
}
