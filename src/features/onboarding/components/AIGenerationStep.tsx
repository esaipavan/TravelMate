import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTripGeneration } from '../hooks/useTripGeneration';
import { LoadingMessages } from './LoadingMessages';
import { TripBriefPreview } from './TripBriefPreview';
import type { DestinationCategory, GroupType, BudgetTier } from '../types';

const SPRING = { type: 'spring', damping: 28, stiffness: 120 } as const;

interface AIGenerationStepProps {
  destination: string;
  destinationCategory: DestinationCategory | null;
  startDate: string | null;
  endDate: string | null;
  groupType: GroupType | null;
  budgetTier: BudgetTier | null;
  userId: string;
  reduced: boolean;
  onMarkComplete: () => void;
  onNext: (tripId: string | null, briefId: string | null) => void;
  onSkip: () => void;
}

export function AIGenerationStep({
  destination,
  destinationCategory,
  startDate,
  endDate,
  groupType,
  budgetTier,
  userId,
  reduced,
  onMarkComplete,
  onNext,
  onSkip,
}: AIGenerationStepProps) {
  const reducedMotion = useReducedMotion() ?? reduced;
  const { phase, result, errorCode, run, retry } = useTripGeneration();
  const markedRef = useRef(false);
  const ranRef = useRef(false);

  // Mark onboarding complete immediately before any network call so that a page
  // refresh during generation always navigates to Dashboard, not back to step 0.
  useEffect(() => {
    if (!markedRef.current) {
      markedRef.current = true;
      onMarkComplete();
    }
  }, [onMarkComplete]);

  // Start generation exactly once on mount.
  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    const today = new Date().toISOString().slice(0, 10);
    const weekLater = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10);
    void run({
      userId,
      destination: destination || 'India',
      destinationCategory: destinationCategory ?? null,
      startDate: startDate ?? today,
      endDate: endDate ?? weekLater,
      groupType: groupType ?? null,
      budgetTier: budgetTier ?? null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const params = {
    userId,
    destination: destination || 'India',
    destinationCategory: destinationCategory ?? null,
    startDate: startDate ?? new Date().toISOString().slice(0, 10),
    endDate: endDate ?? new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10),
    groupType: groupType ?? null,
    budgetTier: budgetTier ?? null,
  };

  // Success: AI brief ready
  if (phase === 'complete' && result?.status === 'complete' && result.payload) {
    return (
      <TripBriefPreview
        destination={destination}
        payload={result.payload}
        onContinue={() => onNext(result.tripId, result.briefId)}
      />
    );
  }

  // Partial success: trip created but AI failed
  if (phase === 'complete' && result?.status === 'failed') {
    const isTimeout = errorCode === 'AI_TIMEOUT';
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-5 text-center">
        {/* sr-only live region announces state; interactive controls are outside it */}
        <p className="sr-only" role="status" aria-live="polite">
          {isTimeout
            ? 'AI took too long. Your trip was created successfully.'
            : 'AI brief could not be generated. Your trip was created successfully.'}
        </p>

        <motion.div
          initial={reducedMotion ? {} : { scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={SPRING}
          className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}
        >
          <AlertTriangle className="h-8 w-8 text-amber-400" aria-hidden="true" />
        </motion.div>

        <motion.div
          initial={reducedMotion ? {} : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.1 }}
          className="mb-6"
        >
          <h2 className="mb-2 text-[20px] font-black text-white">
            {isTimeout ? 'AI took too long' : "AI brief couldn't be generated"}
          </h2>
          <p className="text-[14px]" style={{ color: 'rgba(248,250,252,0.5)' }}>
            Your trip was created successfully. The AI brief will be ready in your dashboard.
          </p>
        </motion.div>

        <motion.div
          initial={reducedMotion ? {} : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.18 }}
          className="w-full"
        >
          <button
            type="button"
            onClick={() => onNext(result.tripId, result.briefId)}
            className={[
              'flex h-14 w-full items-center justify-center gap-2 rounded-2xl',
              'bg-gradient-to-r from-indigo-600 to-violet-600',
              'text-[15px] font-bold text-white',
              'shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
            ].join(' ')}
          >
            Continue to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  // Trip creation failed (DB error)
  if (phase === 'failed') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-5 text-center">
        {/* sr-only live region announces error; interactive controls are outside it */}
        <p className="sr-only" role="status" aria-live="polite">
          Trip creation failed. Please check your connection and try again.
        </p>

        <motion.div
          initial={reducedMotion ? {} : { scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={SPRING}
          className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <AlertTriangle className="h-8 w-8 text-red-400" aria-hidden="true" />
        </motion.div>

        <motion.div
          initial={reducedMotion ? {} : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.1 }}
          className="mb-6"
        >
          <h2 className="mb-2 text-[20px] font-black text-white">{"Couldn't create your trip"}</h2>
          <p className="text-[14px]" style={{ color: 'rgba(248,250,252,0.5)' }}>
            Check your connection and try again. Your onboarding data is saved.
          </p>
        </motion.div>

        <motion.div
          initial={reducedMotion ? {} : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.18 }}
          className="flex w-full flex-col gap-3"
        >
          <button
            type="button"
            onClick={() => retry(params)}
            className={[
              'flex h-14 w-full items-center justify-center gap-2 rounded-2xl',
              'bg-gradient-to-r from-indigo-600 to-violet-600',
              'text-[15px] font-bold text-white',
              'shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
            ].join(' ')}
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Try again
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="flex min-h-[44px] w-full items-center justify-center text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            style={{ color: 'rgba(248,250,252,0.35)' }}
          >
            Skip for now — go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  // Loading / generating
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-5 text-center">
      {/* sr-only live region announces that generation has started */}
      <p className="sr-only" role="status" aria-live="polite">
        Building your trip brief for {destination}. Please wait, this takes about 15 to 30 seconds.
      </p>

      {/* Pulsing orb */}
      <motion.div
        className="relative mb-8 flex h-24 w-24 items-center justify-center"
        aria-hidden="true"
      >
        <div
          className={cn('absolute inset-0 rounded-full', reducedMotion ? '' : 'animate-ping')}
          style={{ background: 'rgba(99,102,241,0.12)' }}
        />
        <div
          className="relative flex h-24 w-24 items-center justify-center rounded-full"
          style={{
            background:
              'radial-gradient(circle at 35% 35%, rgba(139,92,246,0.35), rgba(99,102,241,0.22))',
            border: '1px solid rgba(139,92,246,0.3)',
            boxShadow: '0 0 48px rgba(99,102,241,0.18)',
          }}
        >
          <Loader2
            className={cn('h-10 w-10 text-indigo-300', reducedMotion ? '' : 'animate-spin')}
          />
        </div>
      </motion.div>

      <motion.div
        initial={reducedMotion ? {} : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.08 }}
        className="mb-3"
      >
        <h2 className="text-[22px] font-black tracking-tight text-white">
          Building your trip brief
        </h2>
        <p className="mt-1 text-[14px]" style={{ color: 'rgba(248,250,252,0.65)' }}>
          AI is personalising every detail for {destination}
        </p>
      </motion.div>

      <motion.div
        initial={reducedMotion ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-xs"
      >
        <LoadingMessages category={destinationCategory} />
      </motion.div>

      <motion.p
        initial={reducedMotion ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-8 text-[11px]"
        style={{ color: 'rgba(248,250,252,0.65)' }}
      >
        This takes about 15-30 seconds
      </motion.p>
    </div>
  );
}
