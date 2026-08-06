import { cn } from '@/lib/utils';
import type { BudgetTier } from '../types';

interface TierOption {
  value: BudgetTier;
  symbol: string;
  label: string;
  range: string;
}

const TIERS: readonly TierOption[] = [
  { value: 'budget', symbol: '₹', label: 'Budget', range: 'Under ₹2k/day' },
  { value: 'comfort', symbol: '₹₹', label: 'Comfort', range: '₹2–5k/day' },
  { value: 'premium', symbol: '₹₹₹', label: 'Premium', range: '₹5–10k/day' },
  { value: 'luxury', symbol: '₹₹₹₹', label: 'Luxury', range: '₹10k+/day' },
] as const;

interface BudgetTierChipsProps {
  value: BudgetTier | null;
  onChange: (v: BudgetTier | null) => void;
}

export function BudgetTierChips({ value, onChange }: BudgetTierChipsProps) {
  return (
    <div role="radiogroup" aria-label="Budget tier (optional)" className="flex flex-wrap gap-2">
      {TIERS.map((tier) => {
        const selected = value === tier.value;
        return (
          <button
            key={tier.value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`${tier.label}, ${tier.range}`}
            onClick={() => onChange(selected ? null : tier.value)}
            className={cn(
              'flex min-h-[44px] flex-1 flex-col items-center justify-center rounded-xl border px-3 py-2',
              'transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
              selected
                ? 'border-indigo-400/50 bg-indigo-500/20'
                : 'border-white/7 bg-white/4 hover:bg-white/7 hover:border-white/15',
            )}
          >
            <span
              className={cn(
                'text-[13px] font-bold tracking-tight',
                selected ? 'text-indigo-300' : 'text-white/60',
              )}
            >
              {tier.symbol}
            </span>
            <span
              className={cn(
                'text-[11px] font-semibold',
                selected ? 'text-indigo-200' : 'text-white/75',
              )}
            >
              {tier.label}
            </span>
            <span
              className={cn(
                'mt-0.5 text-[9px] leading-none',
                selected ? 'text-indigo-400/70' : 'text-white/30',
              )}
            >
              {tier.range}
            </span>
          </button>
        );
      })}
    </div>
  );
}
