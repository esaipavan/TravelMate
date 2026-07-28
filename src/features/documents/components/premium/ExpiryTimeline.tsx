import { motion, useReducedMotion } from 'framer-motion';
import { differenceInDays } from 'date-fns';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { rv, CARD_VARIANTS } from '@/lib/motion';
import { DOC_TYPE_MAP, type TravelDocumentRow } from '../../types';

interface Props {
  documents: TravelDocumentRow[];
}

function urgencyConfig(daysLeft: number) {
  if (daysLeft < 0)
    return {
      label: `Expired ${Math.abs(daysLeft)}d ago`,
      color: '#f43f5e',
      bg: 'bg-rose-500/10',
      text: 'text-rose-500',
      bar: 'bg-rose-500',
    };
  if (daysLeft <= 7)
    return {
      label: `${daysLeft}d left`,
      color: '#f43f5e',
      bg: 'bg-rose-500/10',
      text: 'text-rose-500',
      bar: 'bg-rose-500',
    };
  if (daysLeft <= 30)
    return {
      label: `${daysLeft}d left`,
      color: '#f59e0b',
      bg: 'bg-amber-500/10',
      text: 'text-amber-500',
      bar: 'bg-amber-500',
    };
  return {
    label: `${daysLeft}d left`,
    color: '#10b981',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-500',
    bar: 'bg-emerald-500',
  };
}

export function ExpiryTimeline({ documents }: Props) {
  const reduced = useReducedMotion();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in90 = new Date(today.getTime() + 90 * 86_400_000);

  const items = documents
    .filter((d) => {
      if (!d.expiry_date) return false;
      const exp = new Date(d.expiry_date);
      exp.setHours(0, 0, 0, 0);
      return exp <= in90;
    })
    .sort((a, b) => new Date(a.expiry_date!).getTime() - new Date(b.expiry_date!).getTime())
    .slice(0, 8);

  if (items.length === 0) return null;

  return (
    <motion.div
      variants={rv(CARD_VARIANTS, reduced)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-20px' }}
      className="relative overflow-hidden rounded-2xl border border-border/40 bg-card/60 p-5 backdrop-blur-sm"
    >
      {/* Glow */}
      <div
        className="bg-amber-500/8 pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl"
        aria-hidden="true"
      />

      {/* Header */}
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white">
          <Clock className="h-[15px] w-[15px]" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Expiry Timeline</p>
          <p className="text-[11px] text-muted-foreground">
            Documents requiring attention in the next 90 days
          </p>
        </div>
      </div>

      {/* Timeline items (horizontal scroll on mobile, vertical list on desktop) */}
      <div className="flex gap-3 overflow-x-auto pb-1 sm:flex-col sm:overflow-visible sm:pb-0">
        {items.map((doc) => {
          const meta = DOC_TYPE_MAP[doc.type] ?? DOC_TYPE_MAP['other'];
          const daysLeft = differenceInDays(new Date(doc.expiry_date!), today);
          const cfg = urgencyConfig(daysLeft);
          const urgencyPct =
            daysLeft < 0 ? 100 : Math.max(0, Math.round(((90 - daysLeft) / 90) * 100));

          return (
            <div
              key={doc.id}
              className="flex min-w-52 shrink-0 items-center gap-3 rounded-xl border border-border/40 bg-muted/30 p-3 sm:min-w-0 sm:shrink"
            >
              {/* Type emoji */}
              <div
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg',
                  cfg.bg,
                )}
              >
                {meta.emoji}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-foreground">{doc.name}</p>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className={cn('h-full rounded-full', cfg.bar)}
                    initial={{ width: 0 }}
                    animate={{ width: `${urgencyPct}%` }}
                    transition={
                      reduced
                        ? { duration: 0 }
                        : { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }
                    }
                  />
                </div>
              </div>

              <span className={cn('shrink-0 text-[11px] font-semibold tabular-nums', cfg.text)}>
                {cfg.label}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
