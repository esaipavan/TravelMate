import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

interface Category {
  emoji: string;
  name: string;
  desc: string;
  destinations: string[];
  accent: string;
}

const CATEGORIES: Category[] = [
  {
    emoji: '🛕',
    name: 'Temples & Pilgrimage',
    desc: 'Sacred circuits with required permits',
    destinations: ['Tirupati', 'Kedarnath', 'Varanasi', 'Amritsar'],
    accent: '#F59E0B',
  },
  {
    emoji: '⛰️',
    name: 'Hill Stations',
    desc: 'Mountain escapes and scenic routes',
    destinations: ['Manali', 'Darjeeling', 'Ooty', 'Coorg'],
    accent: '#10B981',
  },
  {
    emoji: '🏖️',
    name: 'Beaches',
    desc: 'Coastal stays and water activities',
    destinations: ['Goa', 'Andaman', 'Kovalam', 'Pondicherry'],
    accent: '#0EA5E9',
  },
  {
    emoji: '🐯',
    name: 'Wildlife & Nature',
    desc: 'Safaris and national parks',
    destinations: ['Ranthambore', 'Jim Corbett', 'Kaziranga', 'Bandhavgarh'],
    accent: '#16A34A',
  },
  {
    emoji: '🏰',
    name: 'Heritage & Culture',
    desc: 'Historical monuments and royal trails',
    destinations: ['Rajasthan', 'Agra', 'Hampi', 'Khajuraho'],
    accent: '#8B5CF6',
  },
  {
    emoji: '🏙️',
    name: 'City Breaks',
    desc: 'Urban experiences and food trails',
    destinations: ['Delhi', 'Mumbai', 'Bengaluru', 'Jaipur'],
    accent: '#6366F1',
  },
  {
    emoji: '🧗',
    name: 'Adventure',
    desc: 'Treks, rafting, and high-altitude trips',
    destinations: ['Ladakh', 'Rishikesh', 'Spiti Valley', 'Zanskar'],
    accent: '#EF4444',
  },
];

export function IndiaCoverageSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const reduced = useReducedMotion() ?? false;

  return (
    <section className="bg-[#FAFAF7] py-20 dark:bg-gray-950" aria-label="India Coverage" id="india">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mb-14 text-center">
          <span className="mb-3 inline-block rounded-full bg-orange-50 px-3.5 py-1 text-[12px] font-semibold uppercase tracking-wider text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
            All of India
          </span>
          <h2 className="mb-4 text-[28px] font-bold tracking-tight text-gray-900 dark:text-white sm:text-[36px]">
            Plan any trip across India
          </h2>
          <p className="mx-auto max-w-xl text-[16px] text-gray-500 dark:text-gray-400">
            AI-powered planning for every type of Indian destination — temples to treks, beaches to
            wildlife.
          </p>
        </div>

        <div
          ref={ref}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          role="list"
          aria-label="Destination categories"
        >
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.name}
              role="listitem"
              initial={reduced ? false : { opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="group rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              <div
                className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl text-2xl"
                style={{ background: cat.accent + '18' }}
                aria-hidden="true"
              >
                {cat.emoji}
              </div>
              <h3 className="mb-1 text-[14px] font-bold text-gray-900 dark:text-white">
                {cat.name}
              </h3>
              <p className="mb-3 text-[12px] text-gray-400 dark:text-gray-500">{cat.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {cat.destinations.map((dest) => (
                  <span
                    key={dest}
                    className="rounded-md px-2 py-0.5 text-[11px] font-medium"
                    style={{ background: cat.accent + '15', color: cat.accent }}
                  >
                    {dest}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <p className="mt-10 text-center text-[13px] text-gray-400 dark:text-gray-500">
          AI-powered planning for any destination in India — and beyond. Not all destinations are
          pre-loaded; the AI plans your trip based on your inputs.
        </p>
      </div>
    </section>
  );
}
