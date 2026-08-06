import 'react-day-picker/dist/style.css';
import './DateRangePicker.css';
import { useMemo } from 'react';
import { DayPicker } from 'react-day-picker';
import type { DateRange } from 'react-day-picker';
import { addDays, differenceInCalendarDays } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MAX_NIGHTS = 90;

interface DateRangePickerProps {
  range: DateRange | undefined;
  today: Date;
  onRangeChange: (range: DateRange | undefined) => void;
}

export function DateRangePicker({ range, today, onRangeChange }: DateRangePickerProps) {
  const disabledDays = useMemo(() => {
    const matchers = [{ before: today }];
    if (range?.from) {
      // Disable dates beyond 90 nights from the start
      matchers.push({ after: addDays(range.from, MAX_NIGHTS) } as never);
    }
    return matchers;
  }, [today, range?.from]);

  const validationMessage = useMemo(() => {
    if (!range?.from || !range?.to) return null;
    const nights = differenceInCalendarDays(range.to, range.from);
    if (nights < 1) return 'End date must be at least 1 night after start.';
    if (nights > MAX_NIGHTS) return `Maximum trip length is ${MAX_NIGHTS} nights.`;
    return null;
  }, [range]);

  return (
    <div>
      <DayPicker
        mode="range"
        selected={range}
        onSelect={onRangeChange}
        disabled={disabledDays}
        fromDate={today}
        numberOfMonths={1}
        showOutsideDays={false}
        className="tm-rdp"
        components={{
          IconLeft: () => <ChevronLeft className="h-4 w-4" aria-hidden="true" />,
          IconRight: () => <ChevronRight className="h-4 w-4" aria-hidden="true" />,
        }}
        aria-label="Select travel dates"
      />

      {validationMessage && (
        <p role="alert" className="mt-1 text-[12px] text-red-400" aria-live="polite">
          {validationMessage}
        </p>
      )}
    </div>
  );
}
