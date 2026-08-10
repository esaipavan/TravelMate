import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const TOTAL_STEPS = 5;

interface ProgressHeaderProps {
  step: number;
  onBack: () => void;
  onSkip: () => void;
  reduced: boolean;
}

export function ProgressHeader({ step, onBack, onSkip, reduced }: ProgressHeaderProps) {
  const pct = Math.round((step / (TOTAL_STEPS - 1)) * 100);

  return (
    <header className="relative z-10 flex items-center gap-4 px-5 pb-2 pt-5">
      <button
        onClick={onBack}
        aria-label="Go back"
        tabIndex={step === 0 ? -1 : 0}
        aria-hidden={step === 0}
        className={[
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white/50',
          'transition-all hover:bg-white/10 hover:text-white focus-visible:outline-none',
          'focus-visible:ring-2 focus-visible:ring-indigo-500',
          step === 0 ? 'pointer-events-none opacity-0' : 'opacity-100',
        ].join(' ')}
      >
        <ArrowLeft className="h-5 w-5" aria-hidden="true" />
      </button>

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

      <span className="shrink-0 text-[12px] font-medium tabular-nums text-white/70">
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
