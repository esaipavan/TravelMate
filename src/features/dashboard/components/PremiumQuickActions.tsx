import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { PlaneTakeoff, Sparkles, Receipt, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { rv, rg, LIST_VARIANTS, LIST_ITEM_VARIANTS, HOVER, PRESS } from '@/lib/motion';
import { useCurrentTrip, useUpcomingTrips } from '../hooks/useDashboard';
import type { LucideIcon } from 'lucide-react';

interface Action {
  label: string;
  desc: string;
  href: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}

function useQuickActions(): Action[] {
  const { data: currentTrip } = useCurrentTrip();
  const { data: upcomingTrips = [] } = useUpcomingTrips();
  const displayTrip = currentTrip ?? upcomingTrips[0] ?? null;

  const expenseHref = displayTrip ? `/trips/${displayTrip.id}/expenses` : '/trips';
  const expenseDesc = displayTrip
    ? `Log for ${displayTrip.destination.split(',')[0]}`
    : 'Select a trip to log spending';

  return [
    {
      label: 'New Trip',
      desc: 'Plan your next adventure',
      href: '/trips/new',
      icon: PlaneTakeoff,
      color: '#3B82F6',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'AI Planner',
      desc: 'Get personalised advice',
      href: '/assistant',
      icon: Sparkles,
      color: '#8B5CF6',
      bg: 'bg-violet-500/10',
    },
    {
      label: 'Log Expense',
      desc: expenseDesc,
      href: expenseHref,
      icon: Receipt,
      color: '#10B981',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Analytics',
      desc: 'Discover travel insights',
      href: '/analytics',
      icon: BarChart3,
      color: '#F59E0B',
      bg: 'bg-amber-500/10',
    },
  ];
}

export function PremiumQuickActions() {
  const reduced = useReducedMotion();
  const actions = useQuickActions();

  return (
    <section aria-label="Quick actions">
      <motion.div
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        variants={rv(LIST_VARIANTS, reduced)}
        initial="hidden"
        animate="show"
      >
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <motion.div key={a.label} variants={rv(LIST_ITEM_VARIANTS, reduced)}>
              <motion.div
                whileHover={rg(HOVER.lift, reduced)}
                whileTap={rg(PRESS.subtle, reduced)}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              >
                <Link
                  to={a.href}
                  aria-label={a.label}
                  className={cn(
                    'block rounded-2xl border border-border/50 bg-card p-5 outline-none',
                    'focus-visible:ring-2 focus-visible:ring-primary',
                    'transition-shadow hover:border-border hover:shadow-card',
                  )}
                >
                  <div
                    className={cn(
                      'mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl',
                      a.bg,
                    )}
                  >
                    <Icon className="h-5 w-5" style={{ color: a.color }} aria-hidden="true" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">{a.label}</p>
                  <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{a.desc}</p>
                </Link>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
