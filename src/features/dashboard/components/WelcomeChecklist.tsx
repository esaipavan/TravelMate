import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ChevronRight, Sparkles, Wallet, BookOpen, FileText, Users } from 'lucide-react';
import { useOnboarding } from '@/features/onboarding/hooks/useOnboarding';
import type { ChecklistItems } from '@/features/onboarding/types';

interface ChecklistItem {
  key: keyof ChecklistItems;
  label: string;
  desc: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const ITEMS: ChecklistItem[] = [
  {
    key: 'tripCreated',
    label: 'Create your first trip',
    desc: 'Build your itinerary and start planning.',
    href: '/trips/new',
    icon: ChevronRight,
    color: '#6366f1',
  },
  {
    key: 'expenseLogged',
    label: 'Log your first expense',
    desc: 'Track spending and stay on budget.',
    href: '/expenses',
    icon: Wallet,
    color: '#10b981',
  },
  {
    key: 'aiUsed',
    label: 'Try the AI Concierge',
    desc: 'Get personalised travel recommendations.',
    href: '/assistant',
    icon: Sparkles,
    color: '#8b5cf6',
  },
  {
    key: 'documentAdded',
    label: 'Add a travel document',
    desc: 'Store passport, visa, and insurance.',
    href: '/documents',
    icon: FileText,
    color: '#f59e0b',
  },
  {
    key: 'companionInvited',
    label: 'Invite a travel companion',
    desc: 'Plan together with friends or family.',
    href: '/trips',
    icon: Users,
    color: '#14b8a6',
  },
];

export function WelcomeChecklist() {
  const { state, tickChecklist, dismissChecklist } = useOnboarding();

  // Show only after wizard is complete and not yet dismissed
  if (!state.completed || state.checklistDismissed) return null;

  const checklist = state.data.checklist;
  const doneCount = Object.values(checklist).filter(Boolean).length;
  const total = ITEMS.length;
  const allDone = doneCount === total;

  return (
    <AnimatePresence>
      <motion.section
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12, height: 0 }}
        transition={{ type: 'spring', damping: 24, stiffness: 100 }}
        className="relative overflow-hidden rounded-2xl"
        style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.18)' }}
        aria-label="Getting started checklist"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{ background: 'rgba(99,102,241,0.15)' }}
            >
              {allDone ? (
                <Check className="h-4 w-4 text-indigo-400" aria-hidden="true" />
              ) : (
                <BookOpen className="h-4 w-4 text-indigo-400" aria-hidden="true" />
              )}
            </div>
            <div>
              <h2 className="text-[14px] font-bold leading-tight text-foreground">
                {allDone ? "You're all set! 🎉" : 'Getting started'}
              </h2>
              <p className="text-[12px] text-muted-foreground">
                {allDone
                  ? "You've completed all activation steps."
                  : `${doneCount} of ${total} completed`}
              </p>
            </div>
          </div>
          <button
            onClick={dismissChecklist}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Dismiss checklist"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mx-5 mb-3 h-1.5 overflow-hidden rounded-full bg-primary/10">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(doneCount / total) * 100}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>

        {/* Items */}
        <ul className="divide-y divide-border/30 px-2 pb-2" role="list">
          {ITEMS.map(({ key, label, desc, href, icon: Icon, color }) => {
            const done = checklist[key];
            return (
              <li key={key}>
                <Link
                  to={href}
                  onClick={() => !done && tickChecklist(key)}
                  className={[
                    'flex items-center gap-3 rounded-xl px-3 py-2.5',
                    'transition-colors hover:bg-accent/50',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    done ? 'opacity-50' : '',
                  ].join(' ')}
                  aria-label={`${label}${done ? ' (completed)' : ''}`}
                >
                  {/* Check circle */}
                  <div
                    className={[
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all',
                      done
                        ? 'bg-primary text-primary-foreground'
                        : 'border-2 border-border bg-background',
                    ].join(' ')}
                    aria-hidden="true"
                  >
                    {done ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <span style={{ color }} aria-hidden="true">
                        <Icon className="h-3 w-3" />
                      </span>
                    )}
                  </div>

                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <p
                      className={[
                        'text-[13px] font-semibold leading-tight',
                        done ? 'text-muted-foreground line-through' : 'text-foreground',
                      ].join(' ')}
                    >
                      {label}
                    </p>
                    {!done && (
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{desc}</p>
                    )}
                  </div>

                  {!done && (
                    <ChevronRight
                      className="h-4 w-4 shrink-0 text-muted-foreground/50"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </motion.section>
    </AnimatePresence>
  );
}
