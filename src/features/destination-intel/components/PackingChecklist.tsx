import { useState, useId } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Heart,
  Wallet,
  Smartphone,
  Shirt,
  Package,
  CheckCircle2,
  Circle,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  rv,
  CARD_VARIANTS,
  LIST_VARIANTS,
  LIST_ITEM_VARIANTS,
  SECTION_VARIANTS,
} from '@/lib/motion';
import type { ChecklistItem, ChecklistCategory } from '../types';

interface Props {
  checklist: ChecklistItem[];
  destination: string;
}

const CATEGORY_META: Record<
  ChecklistCategory,
  { label: string; icon: typeof FileText; cls: string }
> = {
  documents: { label: 'Documents', icon: FileText, cls: 'text-blue-500' },
  health: { label: 'Health', icon: Heart, cls: 'text-red-500' },
  money: { label: 'Money', icon: Wallet, cls: 'text-amber-500' },
  tech: { label: 'Tech', icon: Smartphone, cls: 'text-violet-500' },
  clothing: { label: 'Clothing', icon: Shirt, cls: 'text-cyan-500' },
  essentials: { label: 'Essentials', icon: Package, cls: 'text-emerald-500' },
};

const CATEGORY_ORDER: ChecklistCategory[] = [
  'documents',
  'health',
  'money',
  'tech',
  'clothing',
  'essentials',
];

interface ItemRowProps {
  item: ChecklistItem;
  checked: boolean;
  onToggle: () => void;
  labelId: string;
}

function ItemRow({ item, checked, onToggle, labelId }: ItemRowProps) {
  const reduced = useReducedMotion();

  return (
    <motion.li
      className="group flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-muted/50"
      variants={rv(LIST_ITEM_VARIANTS, reduced)}
      layout={!reduced}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-labelledby={labelId}
        onClick={onToggle}
        className="mt-0.5 shrink-0 rounded text-muted-foreground/50 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
      >
        <AnimatePresence mode="wait" initial={false}>
          {checked ? (
            <motion.span
              key="checked"
              initial={reduced ? {} : { scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={reduced ? {} : { scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden />
            </motion.span>
          ) : (
            <motion.span
              key="unchecked"
              initial={reduced ? {} : { scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={reduced ? {} : { scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              <Circle className="h-5 w-5" aria-hidden />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            id={labelId}
            className={`text-sm font-medium leading-snug transition-colors ${
              checked
                ? 'text-muted-foreground line-through decoration-muted-foreground/50'
                : 'text-foreground'
            }`}
          >
            {item.label}
          </span>
          {item.required && (
            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
              Required
            </span>
          )}
        </div>
        {item.note && (
          <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground/70">{item.note}</p>
        )}
      </div>
    </motion.li>
  );
}

export function PackingChecklist({ checklist, destination }: Props) {
  const reduced = useReducedMotion();
  const prefixId = useId();

  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const grouped = CATEGORY_ORDER.reduce<Record<ChecklistCategory, ChecklistItem[]>>(
    (acc, cat) => {
      acc[cat] = checklist.filter((i) => i.category === cat);
      return acc;
    },
    { documents: [], health: [], money: [], tech: [], clothing: [], essentials: [] },
  );

  const total = checklist.length;
  const done = checked.size;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  if (total === 0) return null;

  return (
    <section
      id="checklist"
      aria-label={`Packing checklist for ${destination}`}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Packing Checklist</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Destination-specific essentials for {destination}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 rounded-lg px-2.5 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => setChecked(new Set())}
          disabled={done === 0}
          aria-label="Reset all checklist items"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          Reset
        </Button>
      </div>

      {/* Progress bar */}
      <motion.div
        className="h-2 overflow-hidden rounded-full bg-muted/60"
        variants={rv(SECTION_VARIANTS, reduced)}
        initial="hidden"
        animate="show"
        aria-label={`${done} of ${total} items packed`}
      >
        <motion.div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${pct}%` }}
          aria-hidden
        />
      </motion.div>
      <div className="-mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>
          {done} of {total} packed
        </span>
        <span className="font-semibold text-primary">{pct}%</span>
      </div>

      {/* Category groups */}
      <div className="grid gap-3 sm:grid-cols-2">
        {CATEGORY_ORDER.map((cat) => {
          const items = grouped[cat];
          if (items.length === 0) return null;
          const meta = CATEGORY_META[cat];
          const Icon = meta.icon;
          const catDone = items.filter((i) => checked.has(i.id)).length;
          const catTotal = items.length;
          const allDone = catDone === catTotal;

          return (
            <motion.div
              key={cat}
              className={`rounded-2xl border border-border/50 bg-card transition-colors ${
                allDone ? 'border-primary/20 bg-primary/5' : ''
              }`}
              variants={rv(CARD_VARIANTS, reduced)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-20px' }}
            >
              {/* Category header */}
              <div className="flex items-center justify-between gap-2 px-4 pb-2 pt-4">
                <div className="flex items-center gap-2">
                  <Icon
                    className={`h-4 w-4 shrink-0 ${allDone ? 'text-primary' : meta.cls}`}
                    aria-hidden
                  />
                  <span
                    className={`text-xs font-bold ${allDone ? 'text-primary' : 'text-foreground'}`}
                  >
                    {meta.label}
                  </span>
                </div>
                <span className="text-[10px] tabular-nums text-muted-foreground">
                  {catDone}/{catTotal}
                </span>
              </div>

              {/* Items */}
              <motion.ul
                className="px-2 pb-2"
                variants={rv(LIST_VARIANTS, reduced)}
                initial="hidden"
                animate="show"
              >
                {items.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    checked={checked.has(item.id)}
                    onToggle={() => toggle(item.id)}
                    labelId={`${prefixId}-${item.id}`}
                  />
                ))}
              </motion.ul>
            </motion.div>
          );
        })}
      </div>

      {/* All packed message */}
      <AnimatePresence>
        {pct === 100 && (
          <motion.div
            key="all-packed"
            className="flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 py-4 text-sm font-medium text-primary"
            initial={reduced ? {} : { opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? {} : { opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3 }}
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            All packed and ready for {destination}!
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
