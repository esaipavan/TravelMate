import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Plane, MapPin, Wallet, Sparkles } from 'lucide-react';
import { APP_NAME } from '@/utils/constants';
import { PAGE_VARIANTS, REDUCED_VARIANTS } from '@/lib/motion';

const features = [
  { icon: MapPin, text: 'Day-by-day itineraries & destination guides' },
  { icon: Wallet, text: 'Real-time budget tracking across all trips' },
  { icon: Sparkles, text: 'AI-powered recommendations & smart packing' },
];

export function PublicLayout() {
  const location = useLocation();
  const reduced = useReducedMotion();

  return (
    <div className="flex min-h-screen">
      {/* ── Left branding panel (desktop only) ─────────────────────────────── */}
      <div className="relative hidden shrink-0 flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex lg:w-[420px] xl:w-[480px]">
        {/* Decorative circles */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/5"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-white/5"
        />

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
            <Plane className="h-4.5 w-4.5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">{APP_NAME}</span>
        </div>

        {/* Headline + features */}
        <div className="space-y-8">
          <div className="space-y-3">
            <p className="text-3xl font-bold leading-snug tracking-tight">
              Plan trips you'll
              <br />
              remember forever
            </p>
            <p className="text-sm leading-relaxed text-primary-foreground/70">
              All your itineraries, budgets, journals, and memories in one beautifully organised
              place.
            </p>
          </div>

          <ul className="space-y-3">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-primary-foreground/80">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="text-xs text-primary-foreground/40">
          © {new Date().getFullYear()} {APP_NAME}
        </p>
      </div>

      {/* ── Right form panel ────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12">
        {/* Mobile-only logo */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Plane className="h-4 w-4" />
          </div>
          <span className="font-semibold tracking-tight">{APP_NAME}</span>
        </div>

        {/*
         * AnimatePresence + pathname key = per-route entrance animation for
         * login, register, forgot-password, etc. Replaces the CSS animate-fade-in.
         */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            className="w-full max-w-[360px]"
            variants={reduced ? REDUCED_VARIANTS : PAGE_VARIANTS}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
