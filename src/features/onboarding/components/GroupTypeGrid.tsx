import { useRef } from 'react';
import { cn } from '@/lib/utils';
import type { GroupType } from '../types';

interface GroupOption {
  value: GroupType;
  emoji: string;
  label: string;
  hint: string;
}

const OPTIONS: readonly GroupOption[] = [
  { value: 'solo', emoji: '🧳', label: 'Solo', hint: 'Just me' },
  { value: 'couple', emoji: '💑', label: 'Couple', hint: '2 people' },
  { value: 'friends', emoji: '👫', label: 'Friends', hint: 'Group trip' },
  { value: 'family', emoji: '👨‍👩‍👧‍👦', label: 'Family', hint: 'With kids' },
  { value: 'family_elders', emoji: '🙏', label: 'With Elders', hint: 'Family + seniors' },
  { value: 'business', emoji: '💼', label: 'Business', hint: 'Work trip' },
] as const;

interface GroupTypeGridProps {
  value: GroupType | null;
  onChange: (v: GroupType) => void;
}

export function GroupTypeGrid({ value, onChange }: GroupTypeGridProps) {
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>, idx: number) {
    const total = OPTIONS.length;
    let next = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (idx + 1) % total;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (idx - 1 + total) % total;
    else return;
    e.preventDefault();
    itemRefs.current[next]?.focus();
    onChange(OPTIONS[next].value);
  }

  return (
    <div role="radiogroup" aria-label="Who is travelling?" className="grid grid-cols-3 gap-2.5">
      {OPTIONS.map((opt, i) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`${opt.label} — ${opt.hint}`}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            tabIndex={selected || (value === null && i === 0) ? 0 : -1}
            className={cn(
              'flex min-h-[72px] flex-col items-center justify-center gap-1.5 rounded-2xl border px-2 py-3',
              'transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
              selected
                ? 'border-indigo-400/50 bg-indigo-500/20 shadow-[0_0_16px_rgba(99,102,241,0.15)]'
                : 'border-white/7 bg-white/4 hover:bg-white/7 hover:border-white/15',
            )}
          >
            <span className="text-2xl leading-none" aria-hidden="true">
              {opt.emoji}
            </span>
            <span
              className={cn(
                'text-[12px] font-semibold leading-tight',
                selected ? 'text-indigo-300' : 'text-white/75',
              )}
            >
              {opt.label}
            </span>
            <span
              className={cn(
                'text-[10px] leading-none',
                selected ? 'text-indigo-400/80' : 'text-white/35',
              )}
            >
              {opt.hint}
            </span>
          </button>
        );
      })}
    </div>
  );
}
