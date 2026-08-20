import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { OfflineBanner } from '@/components/pwa/OfflineBanner';
import { FeedbackWidget } from '@/features/feedback/components/FeedbackWidget';
import { FloatingAI } from '@/features/ai/components/FloatingAI';
import { PAGE_VARIANTS, REDUCED_VARIANTS } from '@/lib/motion';
import { useRouteFocus } from '@/hooks/useRouteFocus';
import { useCoverBackfill } from '@/features/trips/hooks/useCoverBackfill';
import { track } from '@/lib/analytics';

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/trips': 'My Trips',
  '/trips/new': 'New Trip',
  '/budget': 'Budget',
  '/expenses': 'Expenses',
  '/itinerary': 'Itinerary',
  '/checklist': 'Packing Checklist',
  '/journal': 'Travel Journal',
  '/weather': 'Weather',
  '/currency': 'Currency',
  '/nearby': 'Nearby Places',
  '/hotels': 'Hotels',
  '/trains': 'Trains',
  '/buses': 'Buses',
  '/flights': 'Flights',
  '/local': 'Local transport',
  '/destinations': 'Destinations',
  '/documents': 'Documents',
  '/reminders': 'Reminders',
  '/assistant': 'AI Assistant',
  '/analytics': 'Analytics',
  '/export': 'Export',
  '/memories': 'Memories',
  '/profile': 'Profile',
  '/settings': 'Settings',
  '/admin': 'Admin',
  '/admin/users': 'User Management',
  '/admin/analytics': 'Analytics',
  '/admin/feedback': 'Feedback',
  '/admin/bugs': 'Bug Reports',
  '/admin/flags': 'Feature Flags',
  '/admin/founder': 'Founder Dashboard',
  '/admin/health': 'API Health',
  '/admin/ai': 'AI Usage',
};

function getRouteTitle(pathname: string): string {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];
  // /trips/:id/budget → Budget (Trip)
  if (/^\/trips\/[^/]+\/budget/.test(pathname)) return 'Budget';
  if (/^\/trips\/[^/]+\/expenses/.test(pathname)) return 'Expenses';
  if (/^\/trips\/[^/]+\/itinerary/.test(pathname)) return 'Itinerary';
  if (/^\/trips\/[^/]+\/checklist/.test(pathname)) return 'Packing Checklist';
  if (/^\/trips\/[^/]+\/weather/.test(pathname)) return 'Weather';
  if (/^\/trips\/[^/]+\/currency/.test(pathname)) return 'Currency';
  if (/^\/trips\/[^/]+\/nearby/.test(pathname)) return 'Nearby Places';
  if (/^\/trips\/[^/]+\/destination-intel/.test(pathname)) return 'Destination Intel';
  if (/^\/trips\/[^/]+\/documents/.test(pathname)) return 'Documents';
  if (/^\/trips\/[^/]+\/reminders/.test(pathname)) return 'Reminders';
  if (/^\/trips\/[^/]+\/journal/.test(pathname)) return 'Travel Journal';
  if (/^\/trips\/[^/]+\/assistant/.test(pathname)) return 'AI Assistant';
  if (/^\/trips\/[^/]+\/analytics/.test(pathname)) return 'Analytics';
  if (/^\/trips\/[^/]+\/export/.test(pathname)) return 'Export';
  if (/^\/trips\/[^/]+\/memories/.test(pathname)) return 'Memories';
  if (/^\/trips\/[^/]+/.test(pathname)) return 'Trip Details';
  return 'TravelMate';
}

export function AppLayout() {
  const location = useLocation();
  const reduced = useReducedMotion();

  useEffect(() => {
    const title = getRouteTitle(location.pathname);
    document.title = `${title} | TravelMate`;
    track('page_viewed', { page: location.pathname });
  }, [location.pathname]);

  // Move keyboard focus to #main-content on every route change so screen
  // readers announce the new page without manual navigation.
  useRouteFocus();

  // One-time, idempotent, background upgrade of legacy trip cover images.
  useCoverBackfill();

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

      {/* Feedback widget — floating above mobile nav */}
      <FeedbackWidget />

      {/* Floating AI assistant — available on every authenticated page */}
      <FloatingAI />
    </div>
  );
}
