import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Map, CheckSquare, FolderOpen, Wallet, Compass } from 'lucide-react';
import { rv, LIST_VARIANTS, LIST_ITEM_VARIANTS } from '@/lib/motion';
import { useCurrentTrip, useUpcomingTrips } from '../hooks/useDashboard';
import type { LucideIcon } from 'lucide-react';

interface QuickAction {
  label: string;
  href: string;
  icon: LucideIcon;
}

/**
 * Small, trip-scoped action row for the upcoming trip — only routes that
 * genuinely exist and work today (verified against TripSubNavGrid and the
 * Explore/nearby route). Kept intentionally short so it's understandable
 * without tooltips.
 */
export function TripQuickActions() {
  const reduced = useReducedMotion();
  const { data: currentTrip } = useCurrentTrip();
  const { data: upcomingTrips = [] } = useUpcomingTrips();
  const displayTrip = currentTrip ?? upcomingTrips[0] ?? null;

  if (!displayTrip) return null;

  const actions: QuickAction[] = [
    { label: 'Itinerary', href: `/trips/${displayTrip.id}/itinerary`, icon: Map },
    { label: 'Checklist', href: `/trips/${displayTrip.id}/checklist`, icon: CheckSquare },
    { label: 'Documents', href: `/trips/${displayTrip.id}/documents`, icon: FolderOpen },
    { label: 'Budget', href: `/trips/${displayTrip.id}/budget`, icon: Wallet },
    { label: 'Explore', href: '/nearby', icon: Compass },
  ];

  return (
    <motion.div
      className="grid grid-cols-3 gap-2.5 sm:grid-cols-5"
      variants={rv(LIST_VARIANTS, reduced)}
      initial="hidden"
      animate="show"
      aria-label="Trip quick actions"
    >
      {actions.map((a) => {
        const Icon = a.icon;
        return (
          <motion.div key={a.label} variants={rv(LIST_ITEM_VARIANTS, reduced)}>
            <Link
              to={a.href}
              className="flex flex-col items-center gap-1.5 rounded-2xl border border-border/50 bg-card px-2 py-3 text-center outline-none transition-colors hover:border-primary/30 hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
              </div>
              <span className="text-xs font-medium text-foreground">{a.label}</span>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
