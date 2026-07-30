import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { rv, LIST_VARIANTS, LIST_ITEM_VARIANTS } from '@/lib/motion';
import type { TripRow } from '@/features/trips/types';
import type { DestinationData } from '@/features/destination-intel/types';
import type { CompanionData } from '../services/companion.service';
import type { RecommendationAction } from '../types';
import { CompanionHero } from './CompanionHero';
import { AlertBanner } from './AlertBanner';
import { RecommendationCard } from './RecommendationCard';
import { BudgetCoach } from './BudgetCoach';
import { PackingCoach } from './PackingCoach';
import { CompanionChat } from './CompanionChat';

interface Props {
  companion: CompanionData;
  trip: TripRow;
  intel: DestinationData | null;
}

export function CompanionDashboard({ companion, trip, intel }: Props) {
  const reduced = useReducedMotion();
  const navigate = useNavigate();

  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const handleDismiss = (id: string) => {
    setDismissed((prev) => new Set([...prev, id]));
  };

  const handleAction = (action: RecommendationAction) => {
    const routes: Record<RecommendationAction['type'], string> = {
      'view-budget': `/trips/${action.tripId}/budget`,
      'view-packing': `/trips/${action.tripId}/destination-intel`,
      'view-intel': `/trips/${action.tripId}/destination-intel`,
      'view-safety': `/trips/${action.tripId}/destination-intel`,
    };
    navigate(routes[action.type]);
  };

  const handleNavigate = (path: string) => {
    navigate(`/trips/${trip.id}/${path}`);
  };

  const visibleRecs = companion.recommendations.filter((r) => !dismissed.has(r.id));
  const criticalRecs = visibleRecs.filter((r) => r.priority === 'critical');
  const otherRecs = visibleRecs.filter((r) => r.priority !== 'critical');

  const hasCoaches = !!(companion.budgetAnalysis || companion.packingAnalysis);

  return (
    <div className="space-y-5">
      {/* Hero */}
      <CompanionHero trip={trip} insight={companion.tripInsight} intel={intel} />

      {/* Critical alerts */}
      <AlertBanner alerts={criticalRecs} onDismiss={handleDismiss} onAction={handleAction} />

      {/* Main layout */}
      <div className={`flex gap-5 ${hasCoaches ? 'flex-col lg:flex-row' : ''}`}>
        {/* Recommendations column */}
        <div className={hasCoaches ? 'min-w-0 flex-1' : 'w-full'}>
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
              Insights & Recommendations
            </h3>
            {visibleRecs.length > 0 && (
              <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                {visibleRecs.length}
              </span>
            )}
          </div>

          <AnimatePresence mode="popLayout">
            {otherRecs.length > 0 ? (
              <motion.div
                className="grid gap-3 sm:grid-cols-2"
                variants={rv(LIST_VARIANTS, reduced)}
                initial="hidden"
                animate="show"
              >
                {otherRecs.map((rec) => (
                  <motion.div
                    key={rec.id}
                    variants={rv(LIST_ITEM_VARIANTS, reduced)}
                    exit={reduced ? {} : { opacity: 0, scale: 0.96 }}
                    layout={!reduced}
                  >
                    <RecommendationCard
                      rec={rec}
                      onDismiss={handleDismiss}
                      onAction={handleAction}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border/50 py-10 text-center"
                initial={reduced ? {} : { opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span className="text-3xl" aria-hidden>
                  🎉
                </span>
                <p className="text-sm font-medium text-foreground">All clear!</p>
                <p className="text-xs text-muted-foreground">
                  No additional recommendations for this trip right now.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Coaches column */}
        {hasCoaches && (
          <div className="flex w-full flex-col gap-4 lg:w-72 lg:shrink-0">
            {companion.budgetAnalysis && (
              <BudgetCoach
                budget={companion.budgetAnalysis}
                tripId={trip.id}
                onNavigate={handleNavigate}
              />
            )}
            {companion.packingAnalysis && (
              <PackingCoach packing={companion.packingAnalysis} onNavigate={handleNavigate} />
            )}
          </div>
        )}
      </div>

      {/* Persistent chat */}
      <CompanionChat trip={trip} />
    </div>
  );
}
