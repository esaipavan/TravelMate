import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { OnboardingDates } from '../types';

const SPRING = { type: 'spring', damping: 28, stiffness: 120 } as const;

interface Dest {
  name: string;
  emoji: string;
  country: string;
  accent: string;
  days: { title: string; activities: string[] }[];
}

const DESTINATIONS: Dest[] = [
  {
    name: 'Manali',
    emoji: '🏔',
    country: 'India',
    accent: '#38bdf8',
    days: [
      {
        title: 'Arrival & Rohtang Pass',
        activities: [
          'Check in to homestay',
          'Drive to Rohtang Pass viewpoint',
          'Old Manali evening stroll',
        ],
      },
      {
        title: 'Solang Valley & Adventure',
        activities: ['Paragliding at Solang Valley', 'Snow activities', 'Bonfire dinner'],
      },
      {
        title: 'Hadimba Temple & Mall Road',
        activities: ['Hadimba Devi Temple', 'Mall Road shopping', 'Trout fishing'],
      },
    ],
  },
  {
    name: 'Goa',
    emoji: '🌴',
    country: 'India',
    accent: '#0ea5e9',
    days: [
      {
        title: 'North Goa Beaches',
        activities: ['Baga beach morning swim', 'Calangute market', "Tito's Lane nightlife"],
      },
      {
        title: 'Old Goa Heritage',
        activities: ['Basilica of Bom Jesus', 'Se Cathedral', 'Fontainhas Latin Quarter'],
      },
      {
        title: 'South Goa & Palolem',
        activities: ['Palolem beach kayaking', 'Dudhsagar waterfall visit', 'Seafood dinner'],
      },
    ],
  },
  {
    name: 'Jaipur',
    emoji: '🏰',
    country: 'India',
    accent: '#f59e0b',
    days: [
      {
        title: 'Amer Fort & City Palace',
        activities: [
          'Elephant ride to Amer Fort',
          'City Palace museum',
          'Jantar Mantar observatory',
        ],
      },
      {
        title: 'Pink City Markets',
        activities: [
          'Johari Bazaar gems & jewellery',
          'Hawa Mahal photo stop',
          'Bapu Bazaar textiles',
        ],
      },
      {
        title: 'Nahargarh Fort & Cuisine',
        activities: [
          'Sunrise at Nahargarh Fort',
          'Dal bati churma lunch',
          'Evening at Chokhi Dhani',
        ],
      },
    ],
  },
  {
    name: 'Varanasi',
    emoji: '🪔',
    country: 'India',
    accent: '#f97316',
    days: [
      {
        title: 'Ganga Ghats & Aarti',
        activities: [
          'Pre-dawn boat ride on Ganga',
          'Dashashwamedh Ghat aarti',
          'Kashi Vishwanath Temple',
        ],
      },
      {
        title: 'Sarnath & Old City',
        activities: [
          'Sarnath Buddhist sites',
          'Narrow alleys of old city',
          'Malaiyo & street sweets',
        ],
      },
      {
        title: 'Sunset & Farewell',
        activities: ['Evening boat ride', 'Silk weaving workshop', 'Lassi at Blue Lassi'],
      },
    ],
  },
  {
    name: 'Bali',
    emoji: '🌴',
    country: 'Indonesia',
    accent: '#22c55e',
    days: [
      {
        title: 'Ubud & Jungle',
        activities: [
          'Tegalalang rice terraces',
          'Monkey Forest Sanctuary',
          'Traditional cooking class',
        ],
      },
      {
        title: 'Temple Trail',
        activities: [
          'Tanah Lot sea temple at sunset',
          'Uluwatu cliffside temple',
          'Kecak fire dance performance',
        ],
      },
      {
        title: 'Beach & Surf',
        activities: ['Seminyak beach morning yoga', 'Surf lesson at Kuta beach', 'Rooftop dinner'],
      },
    ],
  },
  {
    name: 'Dubai',
    emoji: '🏙',
    country: 'UAE',
    accent: '#f59e0b',
    days: [
      {
        title: 'Downtown Dubai',
        activities: ['Burj Khalifa observation deck', 'Dubai Mall & fountain show', 'Dubai Frame'],
      },
      {
        title: 'Old Dubai & Desert',
        activities: [
          'Gold & Spice Souks',
          'Abra ride across Dubai Creek',
          'Desert safari at sunset',
        ],
      },
      {
        title: 'Beaches & Modern Dubai',
        activities: [
          'Jumeirah Beach morning',
          'Palm Jumeirah monorail',
          'Dinner cruise on Dubai Creek',
        ],
      },
    ],
  },
];

const GENERIC_DAYS = [
  {
    title: 'Arrival & Orientation',
    activities: ['Check in & freshen up', 'Explore the neighbourhood', 'Local welcome dinner'],
  },
  {
    title: 'Sightseeing',
    activities: ['Major landmarks', 'Local food market', 'Evening city walk'],
  },
  {
    title: 'Hidden Gems',
    activities: ['Off-the-beaten-path spots', 'Cultural experience', 'Farewell dinner'],
  },
];

function getDestData(name: string): Dest {
  return (
    DESTINATIONS.find((d) => d.name.toLowerCase() === name.toLowerCase()) ?? {
      name,
      emoji: '✈️',
      country: '',
      accent: '#6366f1',
      days: GENERIC_DAYS,
    }
  );
}

interface ItineraryStepProps {
  destination: string;
  dates: OnboardingDates | null;
  onNext: () => void;
  reduced: boolean;
}

export function ItineraryStep({ destination, dates, onNext, reduced }: ItineraryStepProps) {
  const dest = getDestData(destination);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 600);
    return () => clearTimeout(t);
  }, []);

  const duration = dates
    ? Math.max(
        1,
        Math.round((new Date(dates.to).getTime() - new Date(dates.from).getTime()) / 86_400_000),
      )
    : 7;
  const daysToShow = dest.days.slice(0, Math.min(dest.days.length, duration));

  return (
    <div className="flex flex-1 flex-col px-5">
      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.05 }}
        className="mb-5"
      >
        <div className="mb-1 flex items-center gap-2">
          <span className="text-2xl" aria-hidden="true">
            {dest.emoji}
          </span>
          <span
            className="text-[11px] font-bold uppercase tracking-widest"
            style={{ color: dest.accent }}
          >
            Starter Plan · {dest.name}
          </span>
        </div>
        <h2 className="text-[24px] font-black tracking-tight text-white">
          Your {duration}-day itinerary
        </h2>
        <p className="mt-1 text-[13px]" style={{ color: 'rgba(248,250,252,0.4)' }}>
          A starting point — customise every activity later.
        </p>
      </motion.div>

      <div className="flex flex-1 flex-col gap-3 overflow-auto pb-2">
        {daysToShow.map((day, i) => (
          <motion.div
            key={i}
            initial={reduced ? {} : { opacity: 0, x: 24 }}
            animate={revealed ? { opacity: 1, x: 0 } : {}}
            transition={{ ...SPRING, delay: i * 0.12 }}
            className="rounded-2xl p-4"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <div className="mb-3 flex items-center gap-2.5">
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-black text-white"
                style={{ background: dest.accent }}
                aria-label={`Day ${i + 1}`}
              >
                {i + 1}
              </div>
              <span className="text-[14px] font-bold text-white">{day.title}</span>
            </div>
            <ul className="flex flex-col gap-1.5" role="list">
              {day.activities.map((act) => (
                <li key={act} className="flex items-start gap-2">
                  <div
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: dest.accent }}
                    aria-hidden="true"
                  />
                  <span className="text-[13px]" style={{ color: 'rgba(248,250,252,0.6)' }}>
                    {act}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
        {duration > 3 && (
          <p className="py-2 text-center text-[12px]" style={{ color: 'rgba(248,250,252,0.3)' }}>
            + {duration - daysToShow.length} more days to plan freely
          </p>
        )}
      </div>

      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 12 }}
        animate={revealed ? { opacity: 1, y: 0 } : {}}
        transition={{ ...SPRING, delay: 0.5 }}
        className="pt-5"
      >
        <button
          type="button"
          onClick={onNext}
          className={[
            'flex h-14 w-full items-center justify-center gap-2 rounded-2xl',
            'bg-gradient-to-r from-indigo-600 to-violet-600 text-[15px] font-bold text-white',
            'shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
          ].join(' ')}
        >
          Create this trip
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </motion.div>
    </div>
  );
}
