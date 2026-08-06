import { useMemo } from 'react';
import { addDays, nextSaturday, isSaturday } from 'date-fns';

interface ChipDef {
  id: string;
  label: string;
}

const CHIP_DEFS: ChipDef[] = [
  { id: 'this-weekend', label: 'This Weekend' },
  { id: 'next-weekend', label: 'Next Weekend' },
  { id: '3-days', label: '3 Days' },
  { id: '7-days', label: '7 Days' },
  { id: '14-days', label: '14 Days' },
  { id: 'custom', label: 'Custom' },
];

function getChipRange(chipId: string, today: Date): { from: Date; to: Date } | null {
  switch (chipId) {
    case 'this-weekend': {
      const sat = isSaturday(today) ? today : nextSaturday(today);
      return { from: sat, to: addDays(sat, 1) };
    }
    case 'next-weekend': {
      const thisSat = isSaturday(today) ? today : nextSaturday(today);
      const nextSat = addDays(thisSat, 7);
      return { from: nextSat, to: addDays(nextSat, 1) };
    }
    case '3-days':
      return { from: today, to: addDays(today, 3) };
    case '7-days':
      return { from: today, to: addDays(today, 7) };
    case '14-days':
      return { from: today, to: addDays(today, 14) };
    default:
      return null;
  }
}

export interface ChipResult {
  chipId: string;
  range: { from: Date; to: Date } | null;
}

interface QuickDateChipsProps {
  activeChipId: string | null;
  today: Date;
  onChipSelect: (result: ChipResult) => void;
}

export function QuickDateChips({ activeChipId, today, onChipSelect }: QuickDateChipsProps) {
  const chipRanges = useMemo(
    () => Object.fromEntries(CHIP_DEFS.map((c) => [c.id, getChipRange(c.id, today)])),
    [today],
  );

  return (
    <div role="group" aria-label="Quick date selection" className="flex flex-wrap gap-2">
      {CHIP_DEFS.map((chip) => {
        const isActive = activeChipId === chip.id;
        return (
          <button
            key={chip.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChipSelect({ chipId: chip.id, range: chipRanges[chip.id] ?? null })}
            className={[
              'rounded-xl px-3 py-2 text-[13px] font-semibold',
              'transition-all duration-150',
              'min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
              isActive ? 'text-white' : 'text-white/55 hover:text-white/80',
            ].join(' ')}
            style={
              isActive
                ? { background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.45)' }
                : {
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }
            }
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
