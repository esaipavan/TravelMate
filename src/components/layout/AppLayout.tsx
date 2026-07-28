import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { OfflineBanner } from '@/components/pwa/OfflineBanner';
import { PAGE_VARIANTS, REDUCED_VARIANTS } from '@/lib/motion';
import { useRouteFocus } from '@/hooks/useRouteFocus';

export function AppLayout() {
  const location = useLocation();
  const reduced = useReducedMotion();

  // Move keyboard focus to #main-content on every route change so screen
  // readers announce the new page without manual navigation.
  useRouteFocus();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Skip to main content
      </a>

      {/* Desktop sidebar */}
      <Sidebar className="hidden lg:flex" />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <OfflineBanner />

        <main id="main-content" className="flex-1 overflow-y-auto p-4 pb-20 lg:p-6 lg:pb-6">
          {/*
           * mode="popLayout" removes the exiting route from layout flow instantly
           * while still animating it. This lets the entering route render
           * immediately and — crucially — allows `layoutId` shared-element
           * transitions (PremiumTripCard → TripDetailHero) to work across routes.
           */}
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={location.pathname}
              variants={reduced ? REDUCED_VARIANTS : PAGE_VARIANTS}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav className="lg:hidden" />
    </div>
  );
}
