import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { format, differenceInCalendarDays, parseISO } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { startOfDay } from 'date-fns';
import type { DestinationCategory } from '../types';
import { CategoryTabs } from './CategoryTabs';
import { DestinationGrid } from './DestinationGrid';
import { QuickDateChips } from './QuickDateChips';
import type { ChipResult } from './QuickDateChips';
import { DateRangePicker } from './DateRangePicker';

const SPRING = { type: 'spring', damping: 28, stiffness: 120 } as const;

interface DestinationStepProps {
  initialDestination: string | null;
  initialCategory: DestinationCategory | null;
  initialStartDate: string | null;
  initialEndDate: string | null;
  onNext: (
    destination: string,
    destinationCategory: DestinationCategory,
    startDate: string,
    endDate: string,
  ) => void;
  reduced: boolean;
}

function dateToRange(start: string | null, end: string | null): DateRange | undefined {
  if (!start || !end) return undefined;
  return { from: parseISO(start + 'T00:00:00'), to: parseISO(end + 'T00:00:00') };
}

export function DestinationStep({
  initialDestination,
  initialCategory,
  initialStartDate,
  initialEndDate,
  onNext,
  reduced,
}: DestinationStepProps) {
  const today = useMemo(() => startOfDay(new Date()), []);

  const [category, setCategory] = useState<DestinationCategory>(initialCategory ?? 'hill_station');
  const [destination, setDestination] = useState<string | null>(initialDestination);
  const [customValue, setCustomValue] = useState(
    initialCategory === 'custom' ? (initialDestination ?? '') : '',
  );
  const [range, setRange] = useState<DateRange | undefined>(
    dateToRange(initialStartDate, initialEndDate),
  );
  const [activeChipId, setActiveChipId] = useState<string | null>(null);
  const [validationMsg, setValidationMsg] = useState<string | null>(null);

  function handleCategoryChange(cat: DestinationCategory) {
    setCategory(cat);
    // Clear destination when switching category (except when returning to same)
    setDestination(null);
    setCustomValue('');
    setValidationMsg(null);
  }

  function handleDestinationSelect(name: string) {
    setDestination(name);
    setValidationMsg(null);
  }

  function handleCustomChange(value: string) {
    setCustomValue(value);
    setDestination(value.trim() || null);
    setValidationMsg(null);
  }

  function handleChipSelect({ chipId, range: chipRange }: ChipResult) {
    setActiveChipId(chipId);
    if (chipRange) {
      setRange({ from: chipRange.from, to: chipRange.to });
    }
    setValidationMsg(null);
  }

  function handleRangeChange(newRange: DateRange | undefined) {
    setRange(newRange);
    setActiveChipId('custom'); // Manual calendar pick = custom chip active
    setValidationMsg(null);
  }

  const nightsCount = useMemo(() => {
    if (!range?.from || !range?.to) return 0;
    return differenceInCalendarDays(range.to, range.from);
  }, [range]);

  const isValid =
    !!destination && !!range?.from && !!range?.to && nightsCount >= 1 && nightsCount <= 90;

  function handleContinue() {
    if (!destination) {
      setValidationMsg('Please select a destination.');
      return;
    }
    if (!range?.from || !range?.to) {
      setValidationMsg('Please select your travel dates.');
      return;
    }
    if (nightsCount < 1) {
      setValidationMsg('End date must be at least 1 night after start.');
      return;
    }
    if (nightsCount > 90) {
      setValidationMsg('Maximum trip length is 90 nights.');
      return;
    }
    const startDate = format(range.from, 'yyyy-MM-dd');
    const endDate = format(range.to, 'yyyy-MM-dd');
    onNext(destination, category, startDate, endDate);
  }

  return (
    <div className="flex flex-1 flex-col px-5">
      {/* Header */}
      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.05 }}
        className="mb-4"
      >
        <h2 className="text-[26px] font-black tracking-tight text-white">Where & when? 🗺</h2>
        <p className="mt-1 text-[14px]" style={{ color: 'rgba(248,250,252,0.45)' }}>
          Pick your destination and travel dates.
        </p>
      </motion.div>

      {/* Category tabs */}
      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.1 }}
        className="mb-3"
      >
        <CategoryTabs activeCategory={category} onCategoryChange={handleCategoryChange} />
      </motion.div>

      {/* Destination grid / custom input */}
      <motion.div
        key={category}
        initial={reduced ? {} : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.06 }}
        className="mb-5"
      >
        <DestinationGrid
          category={category}
          selected={destination}
          onSelect={handleDestinationSelect}
          customValue={customValue}
          onCustomChange={handleCustomChange}
        />
      </motion.div>

      {/* Dates section */}
      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.18 }}
        className="mb-3"
      >
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-white/40">
          When are you going?
        </p>
        <QuickDateChips activeChipId={activeChipId} today={today} onChipSelect={handleChipSelect} />
      </motion.div>

      {/* Calendar */}
      <motion.div
        initial={reduced ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.24 }}
        className="mb-3"
      >
        <DateRangePicker range={range} today={today} onRangeChange={handleRangeChange} />
      </motion.div>

      {/* Date summary */}
      {range?.from && range?.to && nightsCount >= 1 && (
        <motion.div
          initial={reduced ? {} : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 flex items-center gap-2 rounded-xl px-3 py-2.5"
          style={{
            background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.25)',
          }}
          aria-live="polite"
          aria-atomic="true"
        >
          <CalendarDays className="h-4 w-4 shrink-0 text-indigo-400" aria-hidden="true" />
          <span className="text-[13px] font-medium text-white/80">
            {nightsCount} night{nightsCount !== 1 ? 's' : ''} · {format(range.from, 'dd MMM')} –{' '}
            {format(range.to, 'dd MMM yyyy')}
          </span>
        </motion.div>
      )}

      {/* Validation message */}
      {validationMsg && (
        <p role="alert" aria-live="assertive" className="mb-2 text-[13px] text-red-400">
          {validationMsg}
        </p>
      )}

      {/* Continue button */}
      <div className="mt-auto pt-4">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!isValid}
          aria-disabled={!isValid}
          className={[
            'flex h-14 w-full items-center justify-center gap-2 rounded-2xl',
            'text-[15px] font-bold text-white transition-all',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
            isValid
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/30 hover:-translate-y-0.5 hover:shadow-indigo-500/50'
              : 'cursor-not-allowed opacity-40',
          ].join(' ')}
          style={isValid ? {} : { background: 'rgba(99,102,241,0.3)' }}
        >
          Continue
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
