import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Wallet,
  BookOpen,
  FileText,
  Users,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { APP_NAME } from '@/utils/constants';

const SPRING = { type: 'spring', damping: 28, stiffness: 120 } as const;

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
    href: '/trips',
    color: '#34d399',
    bg: 'rgba(16,185,129,0.1)',
  },
  {
    icon: BookOpen,
    label: 'Travel Journal',
    desc: 'Capture memories with mood-based entries and AI-generated narratives.',
    href: '/trips',
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

interface FeatureTourStepProps {
  tripId: string | null;
  onFinish: () => void;
  reduced: boolean;
}

export function FeatureTourStep({ tripId, onFinish, reduced }: FeatureTourStepProps) {
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
          type="button"
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
