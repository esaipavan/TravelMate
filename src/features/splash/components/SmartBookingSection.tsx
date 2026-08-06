import { useRef } from 'react';
import { Upload, Sparkles, FolderOpen, ArrowRight } from 'lucide-react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

const STEPS = [
  {
    icon: Upload,
    title: 'Paste or upload your booking',
    desc: 'Forward a booking confirmation email, or paste the text. Works with flights, hotels, trains, buses.',
    accent: '#1D4ED8',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    icon: Sparkles,
    title: 'AI reads and extracts details',
    desc: 'Dates, booking reference, check-in times, PNR numbers, passenger names — all extracted automatically.',
    accent: '#F59E0B',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
  },
  {
    icon: FolderOpen,
    title: 'Organized in your trip',
    desc: 'Everything filed under the right trip, searchable, shareable with your travel group in one tap.',
    accent: '#16A34A',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
  },
] as const;

const COMING_SOON = [
  'Search flights and compare prices',
  'Browse and book hotels',
  'IRCTC train search and booking',
  'Cab and airport transfer booking',
];

export function SmartBookingSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const reduced = useReducedMotion() ?? false;

  return (
    <section className="bg-white py-20 dark:bg-gray-900" aria-label="Smart Booking" id="booking">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mb-14 text-center">
          <span className="mb-3 inline-block rounded-full bg-blue-50 px-3.5 py-1 text-[12px] font-semibold uppercase tracking-wider text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            Smart Booking
          </span>
          <h2 className="mb-4 text-[28px] font-bold tracking-tight text-gray-900 dark:text-white sm:text-[36px]">
            Your bookings, organized instantly.
          </h2>
          <p className="mx-auto max-w-xl text-[16px] text-gray-500 dark:text-gray-400">
            Already booked? Paste your confirmation and TravelMate extracts every detail
            automatically. Direct booking integrations are coming next.
          </p>
        </div>

        <div ref={ref} className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          {/* Steps */}
          <div className="space-y-4">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={reduced ? false : { opacity: 0, y: 16 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.45, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className={`flex gap-4 rounded-xl border border-gray-100 p-5 dark:border-gray-700 ${step.bg}`}
                >
                  <div
                    className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                    style={{ background: step.accent + '20' }}
                    aria-hidden="true"
                  >
                    <Icon className="h-5 w-5" style={{ color: step.accent }} />
                  </div>
                  <div>
                    <div className="mb-0.5 flex items-center gap-2">
                      <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <h3 className="text-[15px] font-semibold text-gray-900 dark:text-white">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-[13px] text-gray-500 dark:text-gray-400">{step.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Coming soon panel */}
          <motion.div
            initial={reduced ? false : { opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/50 p-6 dark:border-blue-800/50 dark:bg-blue-950/20"
          >
            <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-blue-500 dark:text-blue-400">
              On the Roadmap
            </p>
            <h3 className="mb-4 text-[18px] font-bold text-gray-900 dark:text-white">
              Direct search & booking
            </h3>
            <p className="mb-5 text-[13px] text-gray-500 dark:text-gray-400">
              We're building native booking directly into TravelMate. No switching apps.
            </p>

            <ul className="space-y-3">
              {COMING_SOON.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2.5 text-[13px] text-gray-600 dark:text-gray-300"
                >
                  <ArrowRight
                    className="h-3.5 w-3.5 flex-shrink-0 text-blue-500"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>

            <p className="mt-6 text-[12px] italic text-gray-400 dark:text-gray-500">
              No affiliate deals or hidden markups — ever. Booking at the best available price is
              the whole point.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
