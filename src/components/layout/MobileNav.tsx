import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Map,
  MessageSquare,
  User,
  MoreHorizontal,
  Cloud,
  DollarSign,
  MapPin,
  Compass,
  FolderOpen,
  Bell,
  BarChart2,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { FADE_VARIANTS, REDUCED_VARIANTS, DUR, EASE } from '@/lib/motion';

interface MobileNavProps {
  className?: string;
}

const mobileItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/trips', icon: Map, label: 'Trips' },
  { to: '/assistant', icon: MessageSquare, label: 'AI' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const moreItems = [
  { to: '/weather', icon: Cloud, label: 'Weather' },
  { to: '/currency', icon: DollarSign, label: 'Currency' },
  { to: '/nearby', icon: MapPin, label: 'Nearby' },
  { to: '/destination', icon: Compass, label: 'Destination' },
  { to: '/documents', icon: FolderOpen, label: 'Documents' },
  { to: '/reminders', icon: Bell, label: 'Reminders' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
];

const panelVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: DUR.normal, ease: EASE.inOut } },
  exit: { opacity: 0, y: 16, transition: { duration: DUR.fast, ease: EASE.in } },
};

export function MobileNav({ className }: MobileNavProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const reduced = useReducedMotion();

  return (
    <nav
      aria-label="Mobile navigation"
      className={cn(
        'pb-safe fixed bottom-0 left-0 right-0 z-10 border-t bg-card/95 backdrop-blur-sm',
        className,
      )}
    >
      {/* Backdrop */}
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            key="backdrop"
            variants={reduced ? REDUCED_VARIANTS : FADE_VARIANTS}
            initial="hidden"
            animate="show"
            exit="exit"
            aria-hidden="true"
            style={{ zIndex: 9 }}
            className="fixed inset-0 bg-black/40"
            onClick={() => setMoreOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* More panel */}
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            key="panel"
            variants={reduced ? REDUCED_VARIANTS : panelVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-label="More navigation options"
            className="absolute bottom-full left-0 right-0 rounded-t-xl border-t bg-card p-4 shadow-xl"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
              More
            </p>
            <div className="grid grid-cols-4 gap-1">
              {moreItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMoreOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex min-h-[60px] flex-col items-center justify-center gap-1 rounded-lg p-2 text-[11px] font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={cn('h-5 w-5', isActive && 'text-primary')}
                        aria-hidden="true"
                      />
                      {label}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom tab bar */}
      <div className="grid grid-cols-5">
        {mobileItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'relative flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute left-1/2 top-0 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary"
                  />
                )}
                <Icon className="h-5 w-5" aria-hidden="true" />
                {label}
              </>
            )}
          </NavLink>
        ))}

        {/* More button */}
        <button
          type="button"
          onClick={() => setMoreOpen((o) => !o)}
          aria-label="More navigation options"
          aria-expanded={moreOpen}
          aria-haspopup="dialog"
          className={cn(
            'relative flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors',
            moreOpen ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {moreOpen && (
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-0 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary"
            />
          )}
          <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
          More
        </button>
      </div>
    </nav>
  );
}
