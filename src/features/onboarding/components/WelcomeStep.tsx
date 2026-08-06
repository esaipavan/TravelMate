import { motion, useReducedMotion } from 'framer-motion';
import { Plane, ArrowRight, MapPin, Sparkles, Shield } from 'lucide-react';
import { APP_NAME } from '@/utils/constants';

const SPRING = { type: 'spring', damping: 28, stiffness: 120 } as const;

const FEATURES = [
  { icon: MapPin, label: 'India-first trip planning' },
  { icon: Sparkles, label: 'AI morning briefs & insights' },
  { icon: Shield, label: 'Budget tracking in ₹' },
] as const;

interface WelcomeStepProps {
  firstName: string;
  onNext: () => void;
}

export function WelcomeStep({ firstName, onNext }: WelcomeStepProps) {
  const reduced = useReducedMotion() ?? false;

  return (
    <div className="flex flex-1 flex-col px-5">
      {/* Logo + greeting */}
      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.08 }}
        className="mb-8 text-center"
      >
        <div
          className="mb-5 inline-flex h-20 w-20 items-center justify-center rounded-3xl"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            boxShadow: '0 0 40px rgba(99,102,241,0.35)',
          }}
        >
          <Plane className="h-10 w-10 text-white" aria-hidden="true" />
        </div>

        <p
          className="mb-1 text-[13px] font-semibold uppercase tracking-widest"
          style={{ color: 'rgba(99,102,241,0.9)' }}
        >
          {APP_NAME}
        </p>

        <h1 className="text-[30px] font-black tracking-tight text-white">Welcome, {firstName}!</h1>

        <p className="mt-2 text-[15px] leading-relaxed" style={{ color: 'rgba(248,250,252,0.5)' }}>
          Your smart travel partner for India and beyond.
        </p>
      </motion.div>

      {/* Feature highlights */}
      <motion.ul
        initial={reduced ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.22 }}
        className="mb-auto flex flex-col gap-3"
        role="list"
        aria-label="What you get with TravelMate"
      >
        {FEATURES.map(({ icon: Icon, label }, i) => (
          <motion.li
            key={label}
            initial={reduced ? {} : { opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...SPRING, delay: 0.28 + i * 0.08 }}
            className="flex items-center gap-3 rounded-2xl px-4 py-3.5"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
              style={{ background: 'rgba(99,102,241,0.15)' }}
            >
              <Icon className="h-4 w-4" style={{ color: '#818cf8' }} aria-hidden="true" />
            </div>
            <span className="text-[14px] font-medium text-white/80">{label}</span>
          </motion.li>
        ))}
      </motion.ul>

      {/* CTA */}
      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.55 }}
        className="mt-8 pt-2"
      >
        <button
          type="button"
          onClick={onNext}
          className={[
            'flex h-14 w-full items-center justify-center gap-2 rounded-2xl',
            'bg-gradient-to-r from-indigo-600 to-violet-600',
            'text-[15px] font-bold text-white',
            'shadow-lg shadow-indigo-500/30 transition-all',
            'hover:-translate-y-0.5 hover:shadow-indigo-500/50',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
          ].join(' ')}
          aria-label="Start planning your first trip"
        >
          Start Planning
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>

        <p className="mt-3 text-center text-[12px]" style={{ color: 'rgba(248,250,252,0.3)' }}>
          Free forever · No credit card needed
        </p>
      </motion.div>
    </div>
  );
}
