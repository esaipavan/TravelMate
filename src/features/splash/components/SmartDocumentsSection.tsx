import { useState, useRef } from 'react';
import { FileCheck, ChevronRight } from 'lucide-react';
import { motion, useInView, useReducedMotion, AnimatePresence } from 'framer-motion';

interface DocItem {
  name: string;
  type: 'required' | 'optional';
}

interface Destination {
  id: string;
  name: string;
  state: string;
  category: string;
  emoji: string;
  note: string;
  docs: DocItem[];
}

const DESTINATIONS: Destination[] = [
  {
    id: 'tirupati',
    name: 'Tirupati',
    state: 'Andhra Pradesh',
    category: 'Pilgrimage',
    emoji: '🛕',
    note: 'TTD darshan requires advance booking and Aadhaar-linked registration.',
    docs: [
      { name: 'TTD Darshan e-Ticket (online booking)', type: 'required' },
      { name: 'Government Photo ID (Aadhaar/PAN)', type: 'required' },
      { name: 'TTD Visitor Registration Form', type: 'required' },
      { name: 'Special Entry Darshan confirmation', type: 'optional' },
      { name: 'Accommodation booking (TTD guest house)', type: 'optional' },
    ],
  },
  {
    id: 'kedarnath',
    name: 'Kedarnath',
    state: 'Uttarakhand',
    category: 'Pilgrimage',
    emoji: '⛰️',
    note: 'Yatra registration is mandatory. Helicopter bookings often sell out weeks in advance.',
    docs: [
      { name: 'Yatra Registration Certificate (mandatory)', type: 'required' },
      { name: 'Government Photo ID (Aadhaar/Passport)', type: 'required' },
      { name: 'Medical fitness certificate', type: 'required' },
      { name: 'Helicopter booking confirmation', type: 'optional' },
      { name: 'GMVN accommodation booking', type: 'optional' },
      { name: 'Chopta Permit (if via Chopta route)', type: 'optional' },
    ],
  },
  {
    id: 'goa',
    name: 'Goa',
    state: 'Goa',
    category: 'Beach',
    emoji: '🏖️',
    note: 'No permits required for Indian nationals. Keep vehicle rental paperwork handy.',
    docs: [
      { name: 'Hotel / Airbnb booking confirmation', type: 'required' },
      { name: 'Flight / Train / Bus tickets', type: 'required' },
      { name: 'Government Photo ID', type: 'required' },
      { name: 'Travel insurance', type: 'optional' },
      { name: 'Vehicle rental booking', type: 'optional' },
      { name: 'Water sports activity bookings', type: 'optional' },
    ],
  },
];

export function SmartDocumentsSection() {
  const [active, setActive] = useState<string>('tirupati');
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const reduced = useReducedMotion() ?? false;

  const dest = DESTINATIONS.find((d) => d.id === active)!;

  return (
    <section
      className="bg-[#FAFAF7] py-20 dark:bg-gray-950"
      aria-label="Smart Documents"
      id="documents"
    >
      <div className="mx-auto max-w-6xl px-5">
        <div className="mb-14 text-center">
          <span className="mb-3 inline-block rounded-full bg-emerald-50 px-3.5 py-1 text-[12px] font-semibold uppercase tracking-wider text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
            Smart Documents
          </span>
          <h2 className="mb-4 text-[28px] font-bold tracking-tight text-gray-900 dark:text-white sm:text-[36px]">
            Know exactly what to carry.
          </h2>
          <p className="mx-auto max-w-xl text-[16px] text-gray-500 dark:text-gray-400">
            AI suggests destination-specific documents. No more scrambling at the last minute for a
            permit you didn't know you needed.
          </p>
        </div>

        <div ref={ref} className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          {/* Destination tabs */}
          <motion.div
            initial={reduced ? false : { opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-row gap-2 lg:flex-col"
            role="tablist"
            aria-label="Destination examples"
          >
            {DESTINATIONS.map((d) => (
              <button
                key={d.id}
                role="tab"
                aria-selected={active === d.id}
                aria-controls={`panel-${d.id}`}
                onClick={() => setActive(d.id)}
                className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  active === d.id
                    ? 'border-blue-200 bg-white shadow-sm dark:border-blue-700 dark:bg-gray-800'
                    : 'border-transparent bg-white/60 hover:bg-white dark:bg-gray-900/60 dark:hover:bg-gray-800'
                }`}
              >
                <span className="text-2xl" aria-hidden="true">
                  {d.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-gray-900 dark:text-white">
                    {d.name}
                  </p>
                  <p className="text-[12px] text-gray-400 dark:text-gray-500">
                    {d.category} · {d.state}
                  </p>
                </div>
                <ChevronRight
                  className={`h-4 w-4 flex-shrink-0 transition-opacity ${active === d.id ? 'text-blue-600 opacity-100' : 'opacity-0'}`}
                  aria-hidden="true"
                />
              </button>
            ))}
          </motion.div>

          {/* Document panel */}
          <motion.div
            initial={reduced ? false : { opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                id={`panel-${active}`}
                role="tabpanel"
                aria-label={`Documents for ${dest.name}`}
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="mb-5 flex items-center gap-3">
                  <span className="text-3xl" aria-hidden="true">
                    {dest.emoji}
                  </span>
                  <div>
                    <h3 className="text-[18px] font-bold text-gray-900 dark:text-white">
                      {dest.name}
                    </h3>
                    <p className="text-[12px] text-gray-400 dark:text-gray-500">
                      {dest.category} · {dest.state}
                    </p>
                  </div>
                </div>

                <p className="mb-5 rounded-lg bg-amber-50 p-3 text-[12px] text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                  {dest.note}
                </p>

                <ul className="space-y-2.5" aria-label="Recommended documents">
                  {dest.docs.map((doc) => (
                    <li key={doc.name} className="flex items-center gap-3">
                      <FileCheck
                        className={`h-4 w-4 flex-shrink-0 ${
                          doc.type === 'required'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-gray-400 dark:text-gray-500'
                        }`}
                        aria-hidden="true"
                      />
                      <span className="text-[13px] text-gray-700 dark:text-gray-300">
                        {doc.name}
                      </span>
                      {doc.type === 'required' && (
                        <span className="ml-auto flex-shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                          Required
                        </span>
                      )}
                    </li>
                  ))}
                </ul>

                <p className="mt-5 text-center text-[12px] text-gray-400 dark:text-gray-500">
                  AI-generated checklist · Always verify with official sources before travel
                </p>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
