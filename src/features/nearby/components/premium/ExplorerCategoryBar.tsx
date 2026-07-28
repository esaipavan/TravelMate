import { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { rv, LIST_VARIANTS, LIST_ITEM_VARIANTS } from '@/lib/motion';
import { CATEGORY_META, type PlaceCategory } from '../../types';

interface Props {
  active: PlaceCategory | 'all';
  onChange: (cat: PlaceCategory | 'all') => void;
  counts: Partial<Record<PlaceCategory, number>>;
  total: number;
}

const ALL_META = { emoji: '🗺️', label: 'All', color: '#6366f1' };

export function ExplorerCategoryBar({ active, onChange, counts, total }: Props) {
  const reduced = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);

  const categories = Object.entries(CATEGORY_META) as [
    PlaceCategory,
    (typeof CATEGORY_META)[PlaceCategory],
  ][];

  return (
    <motion.div
      variants={rv(LIST_VARIANTS, reduced)}
      initial="hidden"
      animate="show"
      ref={scrollRef}
      className="scrollbar-none flex gap-2 overflow-x-auto pb-1"
      role="group"
      aria-label="Filter by category"
    >
      {/* All chip */}
      <motion.button
        variants={rv(LIST_ITEM_VARIANTS, reduced)}
        onClick={() => onChange('all')}
        aria-pressed={active === 'all'}
        className={cn(
          'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-200',
          active === 'all'
            ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-600 shadow-sm dark:text-indigo-400'
            : 'border-border/60 text-muted-foreground hover:border-indigo-400/40 hover:text-foreground',
        )}
      >
        <span aria-hidden="true">{ALL_META.emoji}</span>
        {ALL_META.label}
        <span
          className={cn(
            'rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums',
            active === 'all' ? 'bg-indigo-500/15' : 'bg-muted/80',
          )}
        >
          {total}
        </span>
      </motion.button>

      {/* Category chips */}
      {categories.map(([key, meta]) => {
        const count = counts[key] ?? 0;
        if (count === 0) return null;
        const isActive = active === key;

        return (
          <motion.button
            key={key}
            variants={rv(LIST_ITEM_VARIANTS, reduced)}
            onClick={() => onChange(isActive ? 'all' : key)}
            aria-pressed={isActive}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-200',
              isActive
                ? 'border-transparent bg-gradient-to-r text-white shadow-sm'
                : 'border-border/60 text-muted-foreground hover:border-border hover:text-foreground',
            )}
            style={
              isActive
                ? {
                    background: `linear-gradient(135deg, ${meta.color}cc, ${meta.color})`,
                    borderColor: 'transparent',
                  }
                : {}
            }
          >
            <span aria-hidden="true">{meta.emoji}</span>
            <span className="hidden sm:inline">{meta.label}</span>
            <span
              className={cn(
                'rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums',
                isActive ? 'bg-white/20' : 'bg-muted/80',
              )}
            >
              {count}
            </span>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
