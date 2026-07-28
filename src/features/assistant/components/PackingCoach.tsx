import { motion, useReducedMotion } from 'framer-motion';
import { Package2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { rv, SECTION_VARIANTS, LIST_VARIANTS, LIST_ITEM_VARIANTS } from '@/lib/motion';
import type { PackingAnalysis } from '../types';

interface Props {
  packing: PackingAnalysis;
  onNavigate: (path: string) => void;
}

export function PackingCoach({ packing, onNavigate }: Props) {
  const reduced = useReducedMotion();

  return (
    <motion.section
      className="flex flex-col gap-4 rounded-2xl border border-border/50 bg-card p-5"
      variants={rv(SECTION_VARIANTS, reduced)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      aria-label="Packing coach"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Package2 className="h-4 w-4 text-muted-foreground" aria-hidden />
          <h3 className="text-sm font-bold text-foreground">Packing Coach</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-black tabular-nums text-foreground">
            {packing.totalItems}
          </span>
          <span className="text-[10px] text-muted-foreground">items</span>
          {packing.totalRequired > 0 && (
            <>
              <span className="text-muted-foreground/30">·</span>
              <span className="text-[10px] font-semibold text-primary">
                {packing.totalRequired} required
              </span>
            </>
          )}
        </div>
      </div>

      <motion.ul
        className="space-y-1.5"
        variants={rv(LIST_VARIANTS, reduced)}
        initial="hidden"
        animate="show"
        role="list"
        aria-label="Packing categories"
      >
        {packing.categories.map((cat) => (
          <motion.li
            key={cat.category}
            className="flex items-center justify-between rounded-xl px-3 py-2 transition-colors hover:bg-muted/40"
            variants={rv(LIST_ITEM_VARIANTS, reduced)}
          >
            <div className="flex items-center gap-2">
              <span className="text-base leading-none" aria-hidden>
                {cat.emoji}
              </span>
              <span className="text-xs font-medium text-foreground">{cat.label}</span>
              {cat.required > 0 && (
                <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                  {cat.required} req
                </span>
              )}
            </div>
            <span className="text-[11px] font-semibold tabular-nums text-muted-foreground">
              {cat.total}
            </span>
          </motion.li>
        ))}
      </motion.ul>

      <p className="text-[11px] leading-relaxed text-muted-foreground/60">
        Track your packing progress in Destination Intel.
      </p>

      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-full gap-1.5 rounded-xl border border-border/50 text-xs text-muted-foreground hover:text-foreground"
        onClick={() => onNavigate('destination-intel')}
      >
        Open packing checklist
        <ArrowRight className="h-3 w-3" aria-hidden />
      </Button>
    </motion.section>
  );
}
