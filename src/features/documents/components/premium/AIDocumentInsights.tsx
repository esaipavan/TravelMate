import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { rv, CARD_VARIANTS } from '@/lib/motion';
import { getExpiryStatus, type TravelDocumentRow } from '../../types';

interface Props {
  documents: TravelDocumentRow[];
}

interface Insight {
  type: 'success' | 'warning' | 'info';
  title: string;
  body: string;
}

const ICON_MAP = {
  success: { Icon: CheckCircle2, color: '#10b981', bg: 'bg-emerald-500/10' },
  warning: { Icon: AlertTriangle, color: '#f59e0b', bg: 'bg-amber-500/10' },
  info: { Icon: Info, color: '#6366f1', bg: 'bg-indigo-500/10' },
};

function buildInsights(documents: TravelDocumentRow[]): Insight[] {
  const insights: Insight[] = [];

  if (documents.length === 0) return insights;

  const expired = documents.filter((d) => getExpiryStatus(d.expiry_date) === 'expired');
  const expiringSoon = documents.filter((d) => getExpiryStatus(d.expiry_date) === 'expiring_soon');
  const types = new Set(documents.map((d) => d.type));

  // Vault health
  if (expired.length === 0 && expiringSoon.length === 0) {
    insights.push({
      type: 'success',
      title: 'Vault is healthy',
      body: `All ${documents.length} document${documents.length > 1 ? 's' : ''} are valid. You're well-prepared for travel.`,
    });
  }

  // Expired docs alert
  if (expired.length > 0) {
    const names = expired
      .slice(0, 2)
      .map((d) => d.name)
      .join(', ');
    insights.push({
      type: 'warning',
      title: `${expired.length} expired document${expired.length > 1 ? 's' : ''}`,
      body: `${names}${expired.length > 2 ? ` and ${expired.length - 2} more` : ''} need renewal.`,
    });
  }

  // Expiring soon alert
  if (expiringSoon.length > 0) {
    insights.push({
      type: 'warning',
      title: `${expiringSoon.length} expiring soon`,
      body: `Plan renewals now to avoid disruptions to your travel plans.`,
    });
  }

  // Missing travel insurance suggestion
  const hasFlights =
    types.has('flight_ticket') || types.has('train_ticket') || types.has('bus_ticket');
  const hasInsurance = types.has('insurance');
  if (hasFlights && !hasInsurance) {
    insights.push({
      type: 'info',
      title: 'Consider travel insurance',
      body: 'You have transport tickets but no travel insurance. Adding coverage protects against cancellations and medical costs.',
    });
  }

  // Missing passport when visa exists
  if (types.has('visa') && !types.has('passport')) {
    insights.push({
      type: 'info',
      title: 'Add your passport',
      body: 'You have a visa but no passport on file. Upload your passport for a complete identity document set.',
    });
  }

  // Documents without expiry dates (passports, visas should have them)
  const shouldHaveExpiry: TravelDocumentRow['type'][] = [
    'passport',
    'visa',
    'driving_license',
    'insurance',
  ];
  const missingExpiry = documents.filter(
    (d) => shouldHaveExpiry.includes(d.type) && !d.expiry_date,
  );
  if (missingExpiry.length > 0) {
    insights.push({
      type: 'info',
      title: 'Add expiry dates',
      body: `${missingExpiry.length} document${missingExpiry.length > 1 ? 's' : ''} like passports and insurance are missing expiry dates. Set them to get timely renewal reminders.`,
    });
  }

  return insights.slice(0, 3);
}

export function AIDocumentInsights({ documents }: Props) {
  const reduced = useReducedMotion();
  const insights = buildInsights(documents);

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
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-3xl"
        style={{ background: 'rgba(139,92,246,0.12)' }}
        aria-hidden="true"
      />

      {/* Header */}
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 text-white">
          <Sparkles className="h-[15px] w-[15px]" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Vault Insights</p>
          <p className="text-[11px] text-muted-foreground">Smart analysis of your documents</p>
        </div>
      </div>

      {insights.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/60 py-6 text-center">
          <Sparkles className="h-6 w-6 text-muted-foreground/40" />
          <p className="text-xs text-muted-foreground">
            Upload documents to get personalised insights
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight, i) => {
            const { Icon, color, bg } = ICON_MAP[insight.type];
            return (
              <div key={i} className="flex gap-3">
                <div
                  className={cn(
                    'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg',
                    bg,
                  )}
                >
                  <Icon className="h-3.5 w-3.5" style={{ color }} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground">{insight.title}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                    {insight.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
