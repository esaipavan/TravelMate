import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { GroupType, BudgetTier } from '../types';
import { GroupTypeGrid } from './GroupTypeGrid';
import { BudgetTierChips } from './BudgetTierChips';

const SPRING = { type: 'spring', damping: 28, stiffness: 120 } as const;

interface TripProfileStepProps {
  initialGroupType: GroupType | null;
  initialBudgetTier: BudgetTier | null;
  onNext: (groupType: GroupType, budgetTier: BudgetTier | null) => void;
}

export function TripProfileStep({
  initialGroupType,
  initialBudgetTier,
  onNext,
}: TripProfileStepProps) {
  const reduced = useReducedMotion() ?? false;
  const [groupType, setGroupType] = useState<GroupType | null>(initialGroupType);
  const [budgetTier, setBudgetTier] = useState<BudgetTier | null>(initialBudgetTier);

  const canContinue = groupType !== null;

  function handleSubmit() {
    if (!groupType) return;
    onNext(groupType, budgetTier);
  }

  return (
    <div className="flex flex-1 flex-col px-5">
      {/* Heading */}
      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.06 }}
        className="mb-6"
      >
        <h1 className="text-[26px] font-black tracking-tight text-white">Who&apos;s travelling?</h1>
        <p className="mt-1 text-[14px]" style={{ color: 'rgba(248,250,252,0.5)' }}>
          We&apos;ll tailor your itinerary and tips to your group.
        </p>
      </motion.div>

      {/* Group type */}
      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.12 }}
        className="mb-6"
      >
        <GroupTypeGrid value={groupType} onChange={setGroupType} />
      </motion.div>

      {/* Budget tier */}
      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.2 }}
        className="mb-auto"
      >
        <div className="mb-2.5 flex items-center gap-2">
          <p className="text-[13px] font-semibold text-white/70">Budget style</p>
          <span
            className="rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(248,250,252,0.35)' }}
          >
            Optional
          </span>
        </div>
        <BudgetTierChips value={budgetTier} onChange={setBudgetTier} />
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.3 }}
        className="mt-8 pt-2"
      >
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canContinue}
          aria-disabled={!canContinue}
          className={[
            'flex h-14 w-full items-center justify-center gap-2 rounded-2xl',
            'bg-gradient-to-r from-indigo-600 to-violet-600',
            'text-[15px] font-bold text-white',
            'shadow-lg shadow-indigo-500/30 transition-all',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
            canContinue
              ? 'hover:-translate-y-0.5 hover:shadow-indigo-500/50'
              : 'cursor-not-allowed opacity-40',
          ].join(' ')}
          aria-label={canContinue ? 'Continue to next step' : 'Select a group type to continue'}
        >
          Continue
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>

        {!canContinue && (
          <p
            className="mt-2.5 text-center text-[12px]"
            style={{ color: 'rgba(248,250,252,0.35)' }}
            role="status"
            aria-live="polite"
          >
            Select who&apos;s travelling to continue
          </p>
        )}
      </motion.div>
    </div>
  );
}
