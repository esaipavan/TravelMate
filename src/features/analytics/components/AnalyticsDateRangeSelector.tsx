import { motion, useReducedMotion } from 'framer-motion';
import { format, subMonths, startOfYear } from 'date-fns';
import { Download, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { rg, HOVER, REDUCED_VARIANTS } from '@/lib/motion';
import type { AnalyticsFilters } from '../types';

type DatePreset = 'all' | 'year' | '6m' | '3m';

const PRESETS: { label: string; value: DatePreset }[] = [
  { label: 'All Time', value: 'all' },
  { label: 'This Year', value: 'year' },
  { label: 'Last 6M', value: '6m' },
  { label: 'Last 3M', value: '3m' },
];

function presetToDates(preset: DatePreset): Pick<AnalyticsFilters, 'dateFrom' | 'dateTo'> {
  const today = new Date();
  switch (preset) {
    case 'year':
      return { dateFrom: format(startOfYear(today), 'yyyy-MM-dd'), dateTo: '' };
    case '6m':
      return { dateFrom: format(subMonths(today, 6), 'yyyy-MM-dd'), dateTo: '' };
    case '3m':
      return { dateFrom: format(subMonths(today, 3), 'yyyy-MM-dd'), dateTo: '' };
    default:
      return { dateFrom: '', dateTo: '' };
  }
}

function detectActivePreset(filters: AnalyticsFilters): DatePreset {
  if (!filters.dateFrom && !filters.dateTo) return 'all';
  const today = new Date();
  const yrStart = format(startOfYear(today), 'yyyy-MM-dd');
  if (filters.dateFrom === yrStart && !filters.dateTo) return 'year';
  const m6 = format(subMonths(today, 6), 'yyyy-MM-dd');
  if (filters.dateFrom === m6 && !filters.dateTo) return '6m';
  const m3 = format(subMonths(today, 3), 'yyyy-MM-dd');
  if (filters.dateFrom === m3 && !filters.dateTo) return '3m';
  return 'all';
}

const CHIP_VARIANTS = {
  hidden: { opacity: 0, y: 8, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, damping: 22, stiffness: 200 },
  },
};

const ROW_VARIANTS = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

interface Props {
  filters: AnalyticsFilters;
  onFilters: (f: Partial<AnalyticsFilters>) => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
  tripCount: number;
}

export function AnalyticsDateRangeSelector({
  filters,
  onFilters,
  onExportCSV,
  onExportPDF,
  tripCount,
}: Props) {
  const reduced = useReducedMotion();
  const activePreset = detectActivePreset(filters);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Date preset chips */}
      <motion.div
        variants={reduced ? REDUCED_VARIANTS : ROW_VARIANTS}
        initial="hidden"
        animate="show"
        className="flex flex-wrap items-center gap-2"
        role="group"
        aria-label="Date range filter"
      >
        {PRESETS.map((preset) => {
          const active = activePreset === preset.value;
          return (
            <motion.button
              key={preset.value}
              variants={CHIP_VARIANTS}
              whileHover={rg(HOVER.scale, reduced)}
              whileTap={rg({ scale: 0.95 }, reduced)}
              onClick={() => onFilters(presetToDates(preset.value))}
              aria-pressed={active}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors duration-150',
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {preset.label}
            </motion.button>
          );
        })}

        {/* Trip count badge */}
        <span className="ml-1 rounded-full bg-muted/40 px-2.5 py-1 text-[11px] tabular-nums text-muted-foreground">
          {tripCount} trip{tripCount !== 1 ? 's' : ''}
        </span>
      </motion.div>

      {/* Export buttons */}
      <div className="flex shrink-0 items-center gap-2">
        <motion.button
          whileHover={rg(HOVER.lift, reduced)}
          whileTap={rg({ scale: 0.96 }, reduced)}
          onClick={onExportCSV}
          className="flex items-center gap-1.5 rounded-xl border border-border/60 bg-card/60 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm transition-colors hover:border-border hover:text-foreground"
          aria-label="Export as CSV"
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          CSV
        </motion.button>

        <motion.button
          whileHover={rg(HOVER.lift, reduced)}
          whileTap={rg({ scale: 0.96 }, reduced)}
          onClick={onExportPDF}
          className="flex items-center gap-1.5 rounded-xl border border-border/60 bg-card/60 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm transition-colors hover:border-border hover:text-foreground"
          aria-label="Export as PDF"
        >
          <FileText className="h-3.5 w-3.5" aria-hidden="true" />
          PDF
        </motion.button>
      </div>
    </div>
  );
}
