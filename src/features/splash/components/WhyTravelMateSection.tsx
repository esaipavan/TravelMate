import { useRef } from 'react';
import { X, Check } from 'lucide-react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

const BEFORE = [
  { app: 'WhatsApp', pain: 'Trip planning buried in 200+ messages' },
  { app: 'Google Sheets', pain: 'Budget formula breaks, nobody updates it' },
  { app: 'Splitwise', pain: 'Separate app, nobody installs it' },
  { app: 'Google Maps', pain: 'Itinerary lives in a different tab' },
  { app: 'Email', pain: 'Booking confirmations scattered across folders' },
];

const AFTER = [
  { feature: 'AI Itinerary Builder', win: 'Destination-aware itinerary in minutes' },
  { feature: 'Group Budget', win: 'Everyone sees the same live numbers' },
  { feature: 'Auto Split', win: 'Instant settlement — no awkward chases' },
  { feature: 'Day-by-Day Plan', win: 'Drag-and-drop itinerary, synced live' },
  { feature: 'Document Vault', win: 'All confirmations organized automatically' },
];

export function WhyTravelMateSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const reduced = useReducedMotion() ?? false;

  return (
    <section className="bg-white py-20 dark:bg-gray-900" aria-label="Why TravelMate" id="features">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mb-14 text-center">
          <span className="mb-3 inline-block rounded-full bg-blue-50 px-3.5 py-1 text-[12px] font-semibold uppercase tracking-wider text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            Why TravelMate
          </span>
          <h2 className="mb-4 text-[28px] font-bold tracking-tight text-gray-900 dark:text-white sm:text-[36px]">
            Everything in one place. Finally.
          </h2>
          <p className="mx-auto max-w-xl text-[16px] text-gray-500 dark:text-gray-400">
            Stop coordinating trips across five different apps. TravelMate replaces them all.
          </p>
        </div>

        <div ref={ref} className="grid gap-5 lg:grid-cols-[1fr_auto_1fr]">
          {/* Before */}
          <motion.div
            initial={reduced ? false : { opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-red-100 bg-red-50/50 p-6 dark:border-red-900/30 dark:bg-red-950/20"
          >
            <p className="mb-5 text-[11px] font-bold uppercase tracking-widest text-red-400 dark:text-red-400">
              Without TravelMate
            </p>
            <ul className="space-y-4">
              {BEFORE.map(({ app, pain }) => (
                <li key={app} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
                    <X className="h-3 w-3 text-red-500" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-gray-700 dark:text-gray-300">
                      {app}
                    </p>
                    <p className="text-[12px] text-gray-400 dark:text-gray-500">{pain}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Arrow divider */}
          <div className="flex items-center justify-center">
            <motion.div
              initial={reduced ? false : { opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-700 text-white shadow-md lg:h-12 lg:w-12"
              aria-hidden="true"
            >
              <svg
                className="h-5 w-5 lg:hidden"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
              <svg
                className="hidden h-5 w-5 lg:block"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </motion.div>
          </div>

          {/* After */}
          <motion.div
            initial={reduced ? false : { opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-green-100 bg-green-50/50 p-6 dark:border-green-900/30 dark:bg-green-950/20"
          >
            <p className="mb-5 text-[11px] font-bold uppercase tracking-widest text-green-600 dark:text-green-400">
              With TravelMate
            </p>
            <ul className="space-y-4">
              {AFTER.map(({ feature, win }) => (
                <li key={feature} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                    <Check
                      className="h-3 w-3 text-green-600 dark:text-green-400"
                      aria-hidden="true"
                    />
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-gray-700 dark:text-gray-300">
                      {feature}
                    </p>
                    <p className="text-[12px] text-gray-400 dark:text-gray-500">{win}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
