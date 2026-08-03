import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Plane,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  MapPin,
  Wallet,
  BookOpen,
  FileText,
  Users,
  Loader2,
  ChevronRight,
  X,
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { useAuthStore } from '@/store/auth.store';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { APP_NAME } from '@/utils/constants';
import { createTrip } from '@/features/trips/services/trips.service';
import { resolveDestinationImageUrl } from '@/utils/destinationTheme';
import { useOnboarding, isOnboardingComplete } from '../hooks/useOnboarding';
import type { TravelerType, OnboardingDates } from '../types';

// ─── Constants ────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 5;

const TRAVELER_TYPES: { id: TravelerType; emoji: string; label: string; desc: string }[] = [
  { id: 'adventure', emoji: '🏔️', label: 'Adventure', desc: 'Hiking, extreme sports & thrills' },
  { id: 'culture', emoji: '🏛️', label: 'Culture', desc: 'Art, history & local experiences' },
  { id: 'relaxation', emoji: '🌊', label: 'Relaxation', desc: 'Beaches, spas & slow travel' },
  { id: 'business', emoji: '💼', label: 'Business', desc: 'Work trips & conferences' },
];

interface Dest {
  name: string;
  emoji: string;
  country: string;
  accent: string;
  days: { title: string; activities: string[] }[];
}

const DESTINATIONS: Dest[] = [
  {
    name: 'Tokyo',
    emoji: '🗼',
    country: 'Japan',
    accent: '#e11d48',
    days: [
      {
        title: 'Shibuya & Shinjuku',
        activities: [
          'Shibuya Crossing at sunset',
          'Golden Gai bar alley',
          'Omoide Yokocho (Memory Lane)',
        ],
      },
      {
        title: 'Old Tokyo',
        activities: [
          'Senso-ji Temple, Asakusa',
          'Akihabara electronics district',
          'Ueno Park & National Museum',
        ],
      },
      {
        title: 'Modern Tokyo',
        activities: [
          'Tokyo Skytree observation deck',
          'TeamLab digital art museum',
          'Odaiba waterfront & Gundam statue',
        ],
      },
    ],
  },
  {
    name: 'Paris',
    emoji: '🥐',
    country: 'France',
    accent: '#2563eb',
    days: [
      {
        title: 'Iconic Paris',
        activities: [
          'Eiffel Tower at golden hour',
          'Musée du Louvre (Mona Lisa!)',
          'Café culture on the Seine',
        ],
      },
      {
        title: 'Montmartre & Art',
        activities: [
          'Sacré-Cœur Basilica',
          "Artists' square, Place du Tertre",
          'Moulin Rouge cabaret',
        ],
      },
      {
        title: 'Versailles Day Trip',
        activities: [
          'Palace of Versailles gardens',
          'Hall of Mirrors',
          'Marché Bastille on return',
        ],
      },
    ],
  },
  {
    name: 'Bali',
    emoji: '🌴',
    country: 'Indonesia',
    accent: '#059669',
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
        activities: [
          'Seminyak beach morning yoga',
          'Surf lesson at Kuta beach',
          'Rooftop dinner overlooking rice fields',
        ],
      },
    ],
  },
  {
    name: 'New York',
    emoji: '🗽',
    country: 'USA',
    accent: '#7c3aed',
    days: [
      {
        title: 'Manhattan Icons',
        activities: [
          'Central Park morning run',
          'MoMA modern art museum',
          'High Line elevated park',
        ],
      },
      {
        title: 'Brooklyn Vibes',
        activities: [
          'Brooklyn Bridge walk',
          'DUMBO neighbourhood brunch',
          'Smorgasburg food market',
        ],
      },
      {
        title: 'Downtown & Culture',
        activities: [
          '9/11 Memorial & Museum',
          'SoHo boutique shopping',
          'Jazz in Greenwich Village',
        ],
      },
    ],
  },
  {
    name: 'Rome',
    emoji: '🏛️',
    country: 'Italy',
    accent: '#d97706',
    days: [
      {
        title: 'Ancient Rome',
        activities: [
          'Colosseum & Roman Forum',
          'Palatine Hill viewpoint',
          'Evening at Circus Maximus',
        ],
      },
      {
        title: 'Vatican City',
        activities: [
          "St. Peter's Basilica",
          'Vatican Museums & Sistine Chapel',
          "Castel Sant'Angelo walk",
        ],
      },
      {
        title: 'La Dolce Vita',
        activities: [
          'Trevi Fountain (toss a coin!)',
          'Piazza Navona espresso',
          'Trastevere dinner al fresco',
        ],
      },
    ],
  },
  {
    name: 'Santorini',
    emoji: '🌅',
    country: 'Greece',
    accent: '#0ea5e9',
    days: [
      {
        title: 'Oia & Sunsets',
        activities: ['Oia village blue domes', 'World-famous caldera sunset', 'Local wine tasting'],
      },
      {
        title: 'Fira & History',
        activities: [
          'Fira cliffside town walk',
          'Archaeological Museum',
          'Boat trip to volcanic hot springs',
        ],
      },
      {
        title: 'Hidden Beaches',
        activities: ['Red Beach hike', 'Akrotiri ancient ruins', 'Fresh seafood mezze lunch'],
      },
    ],
  },
  {
    name: 'Maldives',
    emoji: '🏝️',
    country: 'Maldives',
    accent: '#06b6d4',
    days: [
      {
        title: 'Arrival & Snorkel',
        activities: [
          'Seaplane transfer to resort',
          'House reef snorkelling session',
          'Overwater bungalow sunset cocktail',
        ],
      },
      {
        title: 'Ocean Adventures',
        activities: [
          'Manta ray snorkelling trip',
          'Dolphin cruise at dusk',
          'Night dive with bioluminescent plankton',
        ],
      },
      {
        title: 'Blissful Rest',
        activities: ['Sunrise kayaking', 'Spa & spa pool', 'Private sandbank dinner under stars'],
      },
    ],
  },
  {
    name: 'Bangkok',
    emoji: '🛕',
    country: 'Thailand',
    accent: '#ea580c',
    days: [
      {
        title: 'Temples & Palaces',
        activities: [
          'Grand Palace & Emerald Buddha',
          'Wat Pho reclining Buddha',
          'Chao Phraya river boat',
        ],
      },
      {
        title: 'Markets & Food',
        activities: [
          'Chatuchak Weekend Market',
          'Floating market at Amphawa',
          'Street food tour, Yaowarat Chinatown',
        ],
      },
      {
        title: 'Modern Bangkok',
        activities: [
          'Lumpini Park morning tai chi',
          'Sky Bar at Lebua (rooftop!)',
          'Asiatique The Riverfront night market',
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
    activities: ['Major landmarks & museums', 'Local food market', 'Evening city walk'],
  },
  {
    title: 'Hidden Gems',
    activities: ['Off-the-beaten-path spots', 'Cultural experience', 'Farewell dinner'],
  },
];

function getDestinationData(name: string): Dest {
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

const today = format(new Date(), 'yyyy-MM-dd');
const defaultEnd = format(addDays(new Date(), 7), 'yyyy-MM-dd');

// ─── Shared UI ────────────────────────────────────────────────────────────────

const SLIDE = {
  enter: (d: number) => ({ opacity: 0, x: d * 40 }),
  center: { opacity: 1, x: 0 },
  exit: (d: number) => ({ opacity: 0, x: d * -40 }),
};
const SPRING = { type: 'spring', damping: 28, stiffness: 120 } as const;

interface ProgressHeaderProps {
  step: number;
  onBack: () => void;
  onSkip: () => void;
  reduced: boolean;
}

function ProgressHeader({ step, onBack, onSkip, reduced }: ProgressHeaderProps) {
  const pct = Math.round((step / (TOTAL_STEPS - 1)) * 100);
  return (
    <header className="relative z-10 flex items-center gap-4 px-5 pb-2 pt-5">
      <button
        onClick={onBack}
        aria-label="Go back"
        className={[
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white/50',
          'transition-all hover:bg-white/10 hover:text-white focus-visible:outline-none',
          'focus-visible:ring-2 focus-visible:ring-indigo-500',
          step === 0 ? 'pointer-events-none opacity-0' : 'opacity-100',
        ].join(' ')}
      >
        <ArrowLeft className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Progress bar */}
      <div
        className="h-1.5 flex-1 overflow-hidden rounded-full"
        style={{ background: 'rgba(255,255,255,0.1)' }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Onboarding step ${step + 1} of ${TOTAL_STEPS}`}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}
          initial={reduced ? {} : { width: '0%' }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      {/* Step label */}
      <span className="shrink-0 text-[12px] font-medium tabular-nums text-white/30">
        {step + 1}/{TOTAL_STEPS}
      </span>

      <button
        onClick={onSkip}
        className={[
          'shrink-0 rounded-lg px-3 py-1.5 text-[13px] font-medium text-white/40',
          'transition-colors hover:text-white focus-visible:outline-none',
          'focus-visible:ring-2 focus-visible:ring-indigo-500',
          step === TOTAL_STEPS - 1 ? 'invisible' : '',
        ].join(' ')}
        aria-label="Skip onboarding"
      >
        Skip
      </button>
    </header>
  );
}

// ─── Step 0: Welcome ──────────────────────────────────────────────────────────

interface StepWelcomeProps {
  userName: string;
  selected: TravelerType | null;
  onNext: (t: TravelerType) => void;
  reduced: boolean;
}

function StepWelcome({ userName, selected, onNext, reduced }: StepWelcomeProps) {
  const [choice, setChoice] = useState<TravelerType | null>(selected);

  const first = userName.split(' ')[0] ?? userName;

  return (
    <div className="flex flex-1 flex-col px-5">
      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.1 }}
        className="mb-8 text-center"
      >
        <div
          className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            boxShadow: '0 0 32px rgba(99,102,241,0.4)',
          }}
        >
          <Plane className="h-8 w-8 text-white" aria-hidden="true" />
        </div>
        <h1 className="text-[28px] font-black tracking-tight text-white">Welcome, {first}! 👋</h1>
        <p className="mt-2 text-[15px]" style={{ color: 'rgba(248,250,252,0.5)' }}>
          Let&apos;s personalise your experience. What kind of traveller are you?
        </p>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        {TRAVELER_TYPES.map(({ id, emoji, label, desc }, i) => {
          const active = choice === id;
          return (
            <motion.button
              key={id}
              initial={reduced ? {} : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: 0.15 + i * 0.07 }}
              onClick={() => setChoice(id)}
              aria-pressed={active}
              className={[
                'flex flex-col items-start gap-2 rounded-2xl p-4 text-left',
                'transition-all duration-200 focus-visible:outline-none',
                'focus-visible:ring-2 focus-visible:ring-indigo-500',
                active
                  ? 'border border-indigo-500/50 bg-indigo-500/15'
                  : 'border-white/8 border bg-white/[0.03] hover:bg-white/[0.06]',
              ].join(' ')}
            >
              <span className="text-2xl" aria-hidden="true">
                {emoji}
              </span>
              <div>
                <div className="text-[14px] font-bold text-white">{label}</div>
                <div className="mt-0.5 text-[11px]" style={{ color: 'rgba(248,250,252,0.4)' }}>
                  {desc}
                </div>
              </div>
              {active && (
                <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500">
                  <Check className="h-3 w-3 text-white" aria-hidden="true" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.55 }}
        className="mt-auto pt-8"
      >
        <button
          onClick={() => choice && onNext(choice)}
          disabled={!choice}
          className={[
            'flex h-14 w-full items-center justify-center gap-2 rounded-2xl',
            'text-[15px] font-bold text-white transition-all',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
            choice
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50'
              : 'cursor-not-allowed opacity-40',
            !choice ? '' : 'hover:-translate-y-0.5',
          ].join(' ')}
          aria-label="Continue to next step"
        >
          Continue
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </motion.div>
    </div>
  );
}

// ─── Step 1: Destination ──────────────────────────────────────────────────────

interface StepDestinationProps {
  initialDestination: string | null;
  initialDates: OnboardingDates | null;
  onNext: (dest: string, dates: OnboardingDates) => void;
  reduced: boolean;
}

function StepDestination({
  initialDestination,
  initialDates,
  onNext,
  reduced,
}: StepDestinationProps) {
  const [dest, setDest] = useState(initialDestination ?? '');
  const [custom, setCustom] = useState(!DESTINATIONS.some((d) => d.name === initialDestination));
  const [from, setFrom] = useState(initialDates?.from ?? today);
  const [to, setTo] = useState(initialDates?.to ?? defaultEnd);
  const [error, setError] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!dest.trim()) {
      setError('Please choose or enter a destination.');
      return;
    }
    if (from > to) {
      setError('End date must be after start date.');
      return;
    }
    onNext(dest.trim(), { from, to });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col px-5" noValidate>
      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.08 }}
        className="mb-6"
      >
        <h2 className="text-[26px] font-black tracking-tight text-white">Where to first? 🌍</h2>
        <p className="mt-1.5 text-[14px]" style={{ color: 'rgba(248,250,252,0.45)' }}>
          Pick a destination and we&apos;ll build a sample itinerary.
        </p>
      </motion.div>

      {/* Popular destinations grid */}
      <motion.div
        initial={reduced ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="mb-4 grid grid-cols-4 gap-2"
        role="group"
        aria-label="Popular destinations"
      >
        {DESTINATIONS.map(({ name, emoji }) => {
          const active = dest === name && !custom;
          return (
            <button
              key={name}
              type="button"
              onClick={() => {
                setDest(name);
                setCustom(false);
                setError('');
              }}
              aria-pressed={active}
              className={[
                'flex flex-col items-center gap-1 rounded-xl py-3 text-center',
                'transition-all duration-150 focus-visible:outline-none',
                'focus-visible:ring-2 focus-visible:ring-indigo-500',
                active
                  ? 'border border-indigo-500/50 bg-indigo-500/15'
                  : 'border-white/8 border bg-white/[0.03] hover:bg-white/[0.07]',
              ].join(' ')}
            >
              <span className="text-xl" aria-hidden="true">
                {emoji}
              </span>
              <span className="text-[10px] font-semibold text-white/70">{name}</span>
            </button>
          );
        })}
      </motion.div>

      {/* Custom destination input */}
      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.22 }}
        className="mb-5"
      >
        <label
          htmlFor="custom-dest"
          className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-white/40"
        >
          Or type your own
        </label>
        <div className="relative">
          <MapPin
            className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30"
            aria-hidden="true"
          />
          <input
            id="custom-dest"
            type="text"
            value={custom ? dest : ''}
            placeholder="e.g. Kyoto, Iceland, Cape Town…"
            onChange={(e) => {
              setDest(e.target.value);
              setCustom(true);
              setError('');
            }}
            onFocus={() => setCustom(true)}
            className={[
              'w-full rounded-xl py-3 pl-10 pr-4 text-[14px] text-white',
              'placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500',
              'transition-all',
            ].join(' ')}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            aria-label="Custom destination"
          />
        </div>
      </motion.div>

      {/* Date range */}
      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.28 }}
        className="mb-4"
      >
        <p className="mb-1.5 text-[12px] font-semibold uppercase tracking-wider text-white/40">
          When are you going?
        </p>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { id: 'from', label: 'Start date', value: from, min: today, setter: setFrom },
              { id: 'to', label: 'End date', value: to, min: from, setter: setTo },
            ] as const
          ).map(({ id, label, value, min, setter }) => (
            <div key={id}>
              <label htmlFor={id} className="mb-1 block text-[11px] text-white/35">
                {label}
              </label>
              <input
                id={id}
                type="date"
                value={value}
                min={min}
                onChange={(e) => {
                  setter(e.target.value);
                  setError('');
                }}
                className={[
                  'w-full rounded-xl px-3 py-2.5 text-[13px] text-white',
                  '[color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-indigo-500',
                ].join(' ')}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
                required
                aria-label={label}
              />
            </div>
          ))}
        </div>
      </motion.div>

      {error && (
        <p role="alert" className="mb-3 text-[13px] text-red-400">
          {error}
        </p>
      )}

      <div className="mt-auto pt-4">
        <button
          type="submit"
          className={[
            'flex h-14 w-full items-center justify-center gap-2 rounded-2xl',
            'bg-gradient-to-r from-indigo-600 to-violet-600 text-[15px] font-bold text-white',
            'shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5',
            'hover:shadow-indigo-500/50 focus-visible:outline-none focus-visible:ring-2',
            'focus-visible:ring-indigo-500',
          ].join(' ')}
        >
          See your itinerary
          <Sparkles className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}

// ─── Step 2: Itinerary Preview ────────────────────────────────────────────────

interface StepItineraryProps {
  destination: string;
  dates: OnboardingDates | null;
  onNext: () => void;
  reduced: boolean;
}

function StepItinerary({ destination, dates, onNext, reduced }: StepItineraryProps) {
  const dest = getDestinationData(destination);
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
            AI Draft · {dest.name}
          </span>
        </div>
        <h2 className="text-[24px] font-black tracking-tight text-white">
          Your {duration}-day itinerary
        </h2>
        <p className="mt-1 text-[13px]" style={{ color: 'rgba(248,250,252,0.4)' }}>
          A starting point — you can customise every activity later.
        </p>
      </motion.div>

      {/* Day cards */}
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

// ─── Step 3: Create Trip ──────────────────────────────────────────────────────

interface StepCreateTripProps {
  destination: string;
  dates: OnboardingDates | null;
  userId: string;
  onDone: (tripId: string) => void;
  onSkipTrip: () => void;
  reduced: boolean;
}

function StepCreateTrip({
  destination,
  dates,
  userId,
  onDone,
  onSkipTrip,
  reduced,
}: StepCreateTripProps) {
  const [title, setTitle] = useState(`${destination} Adventure`);
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const dest = getDestinationData(destination);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setStatus('loading');
    setErrorMsg('');
    try {
      const from = dates?.from ?? today;
      const to = dates?.to ?? defaultEnd;
      const trip = await createTrip({
        user_id: userId,
        title: title.trim(),
        destination,
        start_date: from,
        end_date: to,
        currency,
        total_budget: budget ? parseFloat(budget) : null,
        status: 'planning',
        is_public: false,
        notes: `Created during ${APP_NAME} onboarding`,
        cover_image_url: resolveDestinationImageUrl(destination),
      });
      setStatus('done');
      setTimeout(() => onDone(trip.id), 900);
    } catch {
      setStatus('error');
      setErrorMsg('Something went wrong. Your trip will still be saved after onboarding.');
    }
  }

  if (status === 'done') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-5">
        <motion.div
          initial={reduced ? {} : { scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 14, stiffness: 180 }}
          className="flex h-24 w-24 items-center justify-center rounded-full"
          style={{ background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.4)' }}
        >
          <Check className="h-12 w-12 text-emerald-400" aria-hidden="true" />
        </motion.div>
        <p className="mt-6 text-[18px] font-bold text-white">Trip created!</p>
        <p className="mt-1 text-[13px]" style={{ color: 'rgba(248,250,252,0.45)' }}>
          Preparing your dashboard…
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        void handleCreate(e);
      }}
      className="flex flex-1 flex-col px-5"
      noValidate
    >
      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.05 }}
        className="mb-6"
      >
        <span className="text-3xl" aria-hidden="true">
          {dest.emoji}
        </span>
        <h2 className="mt-2 text-[26px] font-black tracking-tight text-white">Create your trip</h2>
        <p className="mt-1 text-[14px]" style={{ color: 'rgba(248,250,252,0.45)' }}>
          Review the details — you can edit everything later.
        </p>
      </motion.div>

      <div className="flex flex-1 flex-col gap-4">
        {/* Trip name */}
        <div>
          <label
            htmlFor="trip-title"
            className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-white/40"
          >
            Trip name
          </label>
          <input
            id="trip-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-[14px] text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            required
            aria-label="Trip name"
          />
        </div>

        {/* Destination (read-only) */}
        <div>
          <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-white/40">
            Destination
          </label>
          <div
            className="flex items-center gap-2 rounded-xl px-4 py-3 text-[14px] text-white/60"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <MapPin className="h-4 w-4 text-white/30" aria-hidden="true" />
            {destination}
          </div>
        </div>

        {/* Dates (read-only) */}
        {dates && (
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-white/40">
              Dates
            </label>
            <div
              className="rounded-xl px-4 py-3 text-[14px] text-white/60"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              {dates.from} → {dates.to}
            </div>
          </div>
        )}

        {/* Budget (optional) */}
        <div>
          <label
            htmlFor="budget"
            className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-white/40"
          >
            Budget <span className="font-normal normal-case text-white/25">(optional)</span>
          </label>
          <div className="flex gap-2">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="rounded-xl px-3 py-3 text-[13px] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              aria-label="Budget currency"
            >
              {['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'INR', 'THB'].map((c) => (
                <option key={c} value={c} style={{ background: '#1a1a2e' }}>
                  {c}
                </option>
              ))}
            </select>
            <input
              id="budget"
              type="number"
              min="0"
              step="100"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="e.g. 3000"
              className="flex-1 rounded-xl px-4 py-3 text-[14px] text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              aria-label="Budget amount"
            />
          </div>
        </div>
      </div>

      {errorMsg && (
        <p role="alert" className="mt-2 text-[13px] text-amber-400">
          {errorMsg}
        </p>
      )}

      <div className="mt-auto flex flex-col gap-3 pt-6">
        <button
          type="submit"
          disabled={status === 'loading' || !title.trim()}
          className={[
            'flex h-14 w-full items-center justify-center gap-2 rounded-2xl',
            'text-[15px] font-bold text-white transition-all',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
            status === 'loading' || !title.trim()
              ? 'cursor-not-allowed opacity-50'
              : 'bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/30 hover:-translate-y-0.5',
          ].join(' ')}
          style={status !== 'loading' && title.trim() ? {} : { background: 'rgba(99,102,241,0.3)' }}
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              Creating your trip…
            </>
          ) : (
            <>
              Create Trip
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onSkipTrip}
          className="py-2 text-[13px] text-white/35 transition-colors hover:text-white/60"
        >
          I&apos;ll set up my trip later
        </button>
      </div>
    </form>
  );
}

// ─── Step 4: Feature Tour ─────────────────────────────────────────────────────

const TOUR_FEATURES = [
  {
    icon: Sparkles,
    label: 'AI Concierge',
    desc: '8 smart modules: itinerary optimizer, packing assistant, food guide, and more.',
    href: '/assistant',
    color: '#818cf8',
    bg: 'rgba(99,102,241,0.1)',
  },
  {
    icon: Wallet,
    label: 'Expense Tracker',
    desc: 'Log expenses in 30+ currencies. Budget alerts keep you on track.',
    href: '/expenses',
    color: '#34d399',
    bg: 'rgba(16,185,129,0.1)',
  },
  {
    icon: BookOpen,
    label: 'Travel Journal',
    desc: 'Capture memories with mood-based entries and AI-generated narratives.',
    href: '/journal',
    color: '#f472b6',
    bg: 'rgba(244,114,182,0.1)',
  },
  {
    icon: FileText,
    label: 'Document Vault',
    desc: 'Store passports, visas, and travel docs with expiry tracking.',
    href: '/documents',
    color: '#fb923c',
    bg: 'rgba(251,146,60,0.1)',
  },
] as const;

interface StepTourProps {
  tripId: string | null;
  onFinish: () => void;
  reduced: boolean;
}

function StepTour({ tripId, onFinish, reduced }: StepTourProps) {
  return (
    <div className="flex flex-1 flex-col px-5">
      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.05 }}
        className="mb-6"
      >
        <div className="mb-3 text-4xl" aria-hidden="true">
          🎉
        </div>
        <h2 className="text-[26px] font-black tracking-tight text-white">You&apos;re all set!</h2>
        <p className="mt-1.5 text-[14px]" style={{ color: 'rgba(248,250,252,0.45)' }}>
          Here&apos;s a quick look at what {APP_NAME} can do for you.
        </p>
      </motion.div>

      <div className="flex flex-1 flex-col gap-3">
        {TOUR_FEATURES.map(({ icon: Icon, label, desc, href, color, bg }, i) => (
          <motion.div
            key={label}
            initial={reduced ? {} : { opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...SPRING, delay: 0.12 + i * 0.08 }}
          >
            <Link
              to={tripId ? `${href}?trip=${tripId}` : href}
              className={[
                'flex items-center gap-4 rounded-2xl p-4',
                'transition-all hover:opacity-80 focus-visible:outline-none',
                'focus-visible:ring-2 focus-visible:ring-indigo-500',
              ].join(' ')}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                style={{ background: bg }}
              >
                <Icon className="h-5 w-5" style={{ color }} aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-bold text-white">{label}</p>
                <p className="mt-0.5 text-[12px]" style={{ color: 'rgba(248,250,252,0.4)' }}>
                  {desc}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-white/25" aria-hidden="true" />
            </Link>
          </motion.div>
        ))}

        {/* Collaboration teaser */}
        <motion.div
          initial={reduced ? {} : { opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...SPRING, delay: 0.12 + TOUR_FEATURES.length * 0.08 }}
          className="flex items-center gap-4 rounded-2xl p-4"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px dashed rgba(255,255,255,0.1)',
          }}
        >
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{ background: 'rgba(20,184,166,0.1)' }}
          >
            <Users className="h-5 w-5 text-teal-400" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-bold text-white">Collaboration</p>
            <p className="mt-0.5 text-[12px]" style={{ color: 'rgba(248,250,252,0.4)' }}>
              Invite travel companions and plan together in real-time.
            </p>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.65 }}
        className="mt-auto pt-6"
      >
        <button
          onClick={onFinish}
          className={[
            'flex h-14 w-full items-center justify-center gap-2 rounded-2xl',
            'bg-gradient-to-r from-indigo-600 to-violet-600 text-[15px] font-bold text-white',
            'shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
          ].join(' ')}
        >
          Go to my dashboard
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </motion.div>
    </div>
  );
}

// ─── Skip confirmation ────────────────────────────────────────────────────────

interface SkipDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
}

function SkipDialog({ onConfirm, onCancel }: SkipDialogProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="skip-title"
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />
      <motion.div
        ref={ref}
        tabIndex={-1}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="relative z-10 w-full max-w-sm rounded-t-3xl p-6 sm:rounded-3xl"
        style={{ background: 'rgba(18,18,30,0.98)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 rounded-lg p-1 text-white/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <h3 id="skip-title" className="mb-1.5 text-[18px] font-bold text-white">
          Skip setup?
        </h3>
        <p className="mb-6 text-[13px]" style={{ color: 'rgba(248,250,252,0.5)' }}>
          You can always come back and set up your first trip from the dashboard.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl py-3 text-[14px] font-semibold text-white/60 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            style={{ border: '1px solid rgba(255,255,255,0.12)' }}
          >
            Continue setup
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl py-3 text-[14px] font-semibold text-white transition-all hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            style={{ background: 'rgba(99,102,241,0.5)' }}
          >
            Skip for now
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const navigate = useNavigate();
  const reduced = useReducedMotion() ?? false;
  const { user, isLoading: authLoading } = useAuthStore();
  const { state, advance, goBack, complete } = useOnboarding();
  const [showSkip, setShowSkip] = useState(false);
  const [dir, setDir] = useState(1);

  // Handle PKCE code exchange (email confirmation via code flow)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      void import('@/lib/supabase').then(({ supabase }) => {
        void supabase.auth.exchangeCodeForSession(code).catch(() => {});
      });
    }
  }, []);

  // If already completed onboarding, go to dashboard
  useEffect(() => {
    if (!authLoading && user && isOnboardingComplete()) {
      navigate('/dashboard', { replace: true });
    }
  }, [authLoading, user, navigate]);

  if (authLoading) return <PageLoader />;

  function metaStr(key: string): string | undefined {
    const v: unknown = user?.user_metadata?.[key];
    return typeof v === 'string' ? v : undefined;
  }
  const userName = metaStr('full_name') ?? metaStr('name') ?? user?.email?.split('@')[0] ?? 'there';

  function skipAll() {
    complete();
    navigate('/dashboard', { replace: true });
  }

  function handleSkipRequest() {
    if (state.step <= 1) {
      skipAll();
    } else {
      setShowSkip(true);
    }
  }

  function handleBack() {
    if (state.step === 0) return;
    setDir(-1);
    goBack();
  }

  function handleAdvance(step: number, dataUpdate?: Parameters<typeof advance>[0]) {
    setDir(1);
    if (step === TOTAL_STEPS - 1) {
      complete(dataUpdate);
    } else {
      advance(dataUpdate);
    }
  }

  const stepContent = () => {
    switch (state.step) {
      case 0:
        return (
          <StepWelcome
            key="welcome"
            userName={userName}
            selected={state.data.travelerType}
            reduced={reduced}
            onNext={(travelerType) => {
              handleAdvance(0, { travelerType });
            }}
          />
        );
      case 1:
        return (
          <StepDestination
            key="destination"
            initialDestination={state.data.destination}
            initialDates={state.data.dates}
            reduced={reduced}
            onNext={(destination, dates) => {
              handleAdvance(1, { destination, dates });
            }}
          />
        );
      case 2:
        return (
          <StepItinerary
            key="itinerary"
            destination={state.data.destination ?? 'Your destination'}
            dates={state.data.dates}
            reduced={reduced}
            onNext={() => handleAdvance(2)}
          />
        );
      case 3:
        return (
          <StepCreateTrip
            key="create"
            destination={state.data.destination ?? ''}
            dates={state.data.dates}
            userId={user?.id ?? ''}
            reduced={reduced}
            onDone={(tripId) =>
              handleAdvance(3, {
                tripId,
                checklist: { ...state.data.checklist, tripCreated: true },
              })
            }
            onSkipTrip={() => handleAdvance(3)}
          />
        );
      case 4:
        return (
          <StepTour
            key="tour"
            tripId={state.data.tripId}
            reduced={reduced}
            onFinish={() => {
              complete();
              navigate('/dashboard', { replace: true });
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: '#06060F', color: '#F8FAFC' }}
    >
      {/* Skip to content */}
      <a
        href="#onboarding-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-indigo-600 focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      {/* Ambient background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-1/4 right-0 h-[300px] w-[300px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Progress header */}
      <ProgressHeader
        step={state.step}
        onBack={handleBack}
        onSkip={handleSkipRequest}
        reduced={reduced}
      />

      {/* Step content */}
      <main
        id="onboarding-main"
        className="relative z-10 flex flex-1 flex-col overflow-hidden pb-6 pt-4"
        style={{ maxWidth: '480px', margin: '0 auto', width: '100%' }}
      >
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={state.step}
            custom={dir}
            variants={reduced ? {} : SLIDE}
            initial="enter"
            animate="center"
            exit="exit"
            transition={SPRING}
            className="flex flex-1 flex-col overflow-auto"
          >
            {stepContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Skip confirmation dialog */}
      <AnimatePresence>
        {showSkip && (
          <SkipDialog
            onConfirm={() => {
              setShowSkip(false);
              skipAll();
            }}
            onCancel={() => setShowSkip(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
