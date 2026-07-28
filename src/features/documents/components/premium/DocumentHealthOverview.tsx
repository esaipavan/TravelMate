import { motion, useReducedMotion } from 'framer-motion';
import { FileText, Layers, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { rv, LIST_VARIANTS, LIST_ITEM_VARIANTS } from '@/lib/motion';
import { getExpiryStatus, type TravelDocumentRow } from '../../types';
import { useCountUp } from '../../hooks/useCountUp';

interface Props {
  documents: TravelDocumentRow[];
  isLoaded: boolean;
}

interface KpiCard {
  label: string;
  value: number;
  icon: React.ElementType;
  gradient: string;
  accent: string;
  alertWhen: boolean;
}

function KpiTile({
  label,
  value,
  icon: Icon,
  gradient,
  accent,
  alertWhen,
  isLoaded,
  reduced,
}: KpiCard & { isLoaded: boolean; reduced: boolean | null }) {
  const display = useCountUp(value, 900, isLoaded, reduced ?? false);

  return (
    <motion.div
      variants={rv(LIST_ITEM_VARIANTS, reduced)}
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-card/60 p-5 backdrop-blur-sm transition-shadow hover:shadow-md',
        alertWhen ? 'border-rose-500/30' : 'border-border/40',
      )}
    >
      {/* Corner glow */}
      <div
        className={cn(
          'pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full blur-3xl',
          accent,
        )}
        aria-hidden="true"
      />

      <div className="flex items-start justify-between">
        <div
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-white',
            gradient,
          )}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
        {alertWhen && value > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500/15">
            <AlertTriangle className="h-3 w-3 text-rose-500" aria-hidden="true" />
          </span>
        )}
      </div>

      <div className="mt-3">
        <p
          className="text-2xl font-bold tabular-nums text-foreground"
          aria-live="polite"
          aria-label={`${value} ${label}`}
        >
          {display}
        </p>
        <p className="mt-0.5 text-xs font-medium text-muted-foreground">{label}</p>
      </div>
    </motion.div>
  );
}

export function DocumentHealthOverview({ documents, isLoaded }: Props) {
  const reduced = useReducedMotion();

  const total = documents.length;
  const uniqueTypes = new Set(documents.map((d) => d.type)).size;
  const expiringSoon = documents.filter(
    (d) => getExpiryStatus(d.expiry_date) === 'expiring_soon',
  ).length;
  const expired = documents.filter((d) => getExpiryStatus(d.expiry_date) === 'expired').length;

  const cards: KpiCard[] = [
    {
      label: 'Total Documents',
      value: total,
      icon: FileText,
      gradient: 'from-indigo-500 to-violet-500',
      accent: 'bg-indigo-500/10',
      alertWhen: false,
    },
    {
      label: 'Document Types',
      value: uniqueTypes,
      icon: Layers,
      gradient: 'from-violet-500 to-purple-600',
      accent: 'bg-violet-500/10',
      alertWhen: false,
    },
    {
      label: 'Expiring Soon',
      value: expiringSoon,
      icon: AlertTriangle,
      gradient: expiringSoon > 0 ? 'from-amber-500 to-orange-500' : 'from-slate-400 to-slate-500',
      accent: expiringSoon > 0 ? 'bg-amber-500/10' : 'bg-slate-500/5',
      alertWhen: expiringSoon > 0,
    },
    {
      label: 'Expired',
      value: expired,
      icon: XCircle,
      gradient: expired > 0 ? 'from-rose-500 to-pink-600' : 'from-slate-400 to-slate-500',
      accent: expired > 0 ? 'bg-rose-500/10' : 'bg-slate-500/5',
      alertWhen: expired > 0,
    },
  ];

  return (
    <motion.div
      variants={rv(LIST_VARIANTS, reduced)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-20px' }}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {cards.map((card) => (
        <KpiTile key={card.label} {...card} isLoaded={isLoaded} reduced={reduced} />
      ))}
    </motion.div>
  );
}
