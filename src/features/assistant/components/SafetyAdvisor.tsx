import { motion, useReducedMotion } from 'framer-motion';
import { Shield, Phone, AlertTriangle, FileText, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { rv, LIST_VARIANTS, LIST_ITEM_VARIANTS } from '@/lib/motion';
import { useSafetyAdvisor } from '../hooks/useSafetyAdvisor';
import type { TripRow } from '@/features/trips/types';
import type { SafetyAlert } from '../hooks/useSafetyAdvisor';

const SEVERITY_STYLES: Record<SafetyAlert['severity'], string> = {
  info: 'border-blue-500/20 bg-blue-500/5',
  warning: 'border-amber-500/20 bg-amber-500/5',
  critical: 'border-rose-500/25 bg-rose-500/8',
};

const SEVERITY_ICON_COLOR: Record<SafetyAlert['severity'], string> = {
  info: 'text-blue-600 dark:text-blue-400',
  warning: 'text-amber-600 dark:text-amber-400',
  critical: 'text-rose-600 dark:text-rose-400',
};

const REMINDER_TYPE_EMOJI: Record<string, string> = {
  passport: '🛂',
  visa: '📋',
  insurance: '🛡️',
  vaccination: '💉',
};

interface Props {
  trip: TripRow;
}

export function SafetyAdvisor({ trip }: Props) {
  const reduced = useReducedMotion();
  const { alerts, safetyInfo, documentReminders, isLoading } = useSafetyAdvisor(trip);

  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading safety advisor">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
    );
  }

  const hasAlerts = alerts.length > 0;
  const hasDocuments = documentReminders.length > 0;
  const hasSafetyInfo = !!safetyInfo;

  return (
    <motion.div
      className="space-y-5"
      variants={rv(LIST_VARIANTS, reduced)}
      initial="hidden"
      animate="show"
    >
      {/* Current Alerts */}
      <motion.section
        variants={rv(LIST_ITEM_VARIANTS, reduced)}
        aria-labelledby="safety-alerts-heading"
      >
        <p
          id="safety-alerts-heading"
          className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
        >
          Active Alerts
        </p>
        {!hasAlerts ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 py-10 text-center">
            <CheckCircle className="h-8 w-8 text-emerald-500" aria-hidden />
            <div>
              <p className="font-semibold text-foreground">All clear</p>
              <p className="text-sm text-muted-foreground">
                No active safety alerts for {trip.destination}.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={cn('rounded-xl border px-4 py-3', SEVERITY_STYLES[alert.severity])}
                role="alert"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    className={cn('mt-0.5 h-4 w-4 shrink-0', SEVERITY_ICON_COLOR[alert.severity])}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">{alert.title}</p>
                      <span className="mt-0.5 shrink-0 text-lg leading-none" aria-hidden>
                        {alert.emoji}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{alert.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.section>

      {/* Document Reminders */}
      {hasDocuments && (
        <motion.section variants={rv(LIST_ITEM_VARIANTS, reduced)} aria-labelledby="docs-heading">
          <p
            id="docs-heading"
            className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Document Reminders
          </p>
          <div className="space-y-2">
            {documentReminders.map((rem) => (
              <div
                key={rem.id}
                className="flex items-center gap-3 rounded-xl border border-border/50 bg-card px-3 py-2.5"
              >
                <span className="text-lg" aria-hidden>
                  {REMINDER_TYPE_EMOJI[rem.type] ?? '📌'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{rem.title}</p>
                  {rem.description && (
                    <p className="truncate text-xs text-muted-foreground">{rem.description}</p>
                  )}
                </div>
                <span className="shrink-0 text-xs capitalize text-muted-foreground">
                  {rem.type}
                </span>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {!hasDocuments && (
        <motion.section variants={rv(LIST_ITEM_VARIANTS, reduced)}>
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5">
            <FileText className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden />
            <p className="text-xs text-muted-foreground">No pending document reminders.</p>
          </div>
        </motion.section>
      )}

      {/* Emergency Contacts */}
      {hasSafetyInfo && (
        <motion.section
          variants={rv(LIST_ITEM_VARIANTS, reduced)}
          aria-labelledby="emergency-heading"
        >
          <p
            id="emergency-heading"
            className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Emergency Contacts
          </p>
          <div className="divide-y divide-border/40 rounded-2xl border border-border/50 bg-card">
            {[
              { label: 'Police', number: safetyInfo.emergency.police, emoji: '👮' },
              { label: 'Ambulance', number: safetyInfo.emergency.ambulance, emoji: '🚑' },
              { label: 'Fire', number: safetyInfo.emergency.fire, emoji: '🚒' },
              { label: 'General', number: safetyInfo.emergency.general, emoji: '📞' },
              safetyInfo.emergency.touristHelpline
                ? {
                    label: 'Tourist Helpline',
                    number: safetyInfo.emergency.touristHelpline,
                    emoji: '🌍',
                  }
                : null,
            ]
              .filter((e): e is NonNullable<typeof e> => e !== null && !!e.number)
              .map(({ label, number, emoji }) => (
                <div key={label} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base" aria-hidden>
                      {emoji}
                    </span>
                    <span className="text-sm font-medium text-foreground">{label}</span>
                  </div>
                  <a
                    href={`tel:${number}`}
                    className="flex items-center gap-1.5 font-mono text-sm font-bold text-primary hover:underline"
                    aria-label={`Call ${label}: ${number}`}
                  >
                    <Phone className="h-3 w-3" aria-hidden />
                    {number}
                  </a>
                </div>
              ))}
          </div>
        </motion.section>
      )}

      {/* Safety Tips */}
      {safetyInfo?.tips && safetyInfo.tips.length > 0 && (
        <motion.section variants={rv(LIST_ITEM_VARIANTS, reduced)} aria-labelledby="tips-heading">
          <p
            id="tips-heading"
            className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Safety Tips
          </p>
          <div className="space-y-2">
            {safetyInfo.tips.slice(0, 5).map((tip, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm">
                <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
                <p className="text-muted-foreground">{tip}</p>
              </div>
            ))}
          </div>
        </motion.section>
      )}
    </motion.div>
  );
}
