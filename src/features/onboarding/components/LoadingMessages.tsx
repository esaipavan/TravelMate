import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { DestinationCategory } from '../types';

const CATEGORY_MESSAGES: Record<DestinationCategory, string[]> = {
  pilgrimage: [
    'Checking darshan registration windows…',
    'Looking up temple timings and puja schedules…',
    'Finding stays near the temple complex…',
    'Checking VIP darshan availability…',
    'Looking up dress code and entry rules…',
    'Preparing Day 1…',
  ],
  wildlife: [
    'Checking safari availability…',
    'Looking up zone permit requirements…',
    'Finding the best wildlife zones…',
    'Checking safari gate timings…',
    'Finding stays near the reserve…',
    'Preparing Day 1…',
  ],
  beach: [
    'Checking beach safety conditions…',
    'Looking up watersport availability…',
    'Finding beachside accommodation…',
    'Checking seasonal wave forecasts…',
    'Finding hotels in your budget…',
    'Preparing Day 1…',
  ],
  hill_station: [
    'Checking road conditions and closures…',
    'Looking up weather and snowfall forecast…',
    'Checking permit requirements…',
    'Finding mountain stays…',
    'Looking up altitude acclimatisation tips…',
    'Preparing Day 1…',
  ],
  heritage: [
    'Looking up monument timings…',
    'Checking guided tour availability…',
    'Finding stays near heritage sites…',
    'Looking up entry fees and advance booking…',
    'Researching local history…',
    'Preparing Day 1…',
  ],
  international: [
    'Checking visa requirements…',
    'Looking up entry regulations…',
    'Checking travel advisories…',
    'Finding hotels in your budget…',
    'Looking up currency and SIM card options…',
    'Preparing Day 1…',
  ],
  custom: [
    'Looking up weather…',
    'Finding hotels in your budget…',
    'Calculating travel distances…',
    'Generating packing list…',
    'Preparing Day 1…',
  ],
};

const FALLBACK_MESSAGES = [
  'Looking up weather…',
  'Finding hotels in your budget…',
  'Calculating travel distances…',
  'Generating packing list…',
  'Preparing Day 1…',
];

const INTERVAL_MS = 2_800;

interface LoadingMessagesProps {
  category: DestinationCategory | null;
}

export function LoadingMessages({ category }: LoadingMessagesProps) {
  const reduced = useReducedMotion() ?? false;
  const messages = category
    ? (CATEGORY_MESSAGES[category] ?? FALLBACK_MESSAGES)
    : FALLBACK_MESSAGES;
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => {
      setIdx((prev) => (prev + 1) % messages.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [messages.length, reduced]);

  const current = messages[idx];

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="flex min-h-[28px] items-center justify-center"
    >
      <AnimatePresence mode="wait">
        <motion.p
          key={reduced ? 'static' : idx}
          initial={reduced ? {} : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? {} : { opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="text-center text-[13px]"
          style={{ color: 'rgba(248,250,252,0.7)' }}
        >
          {current}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
