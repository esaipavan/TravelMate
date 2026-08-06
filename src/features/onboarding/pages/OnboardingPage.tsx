import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useAuthStore } from '@/store/auth.store';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { useOnboarding, isOnboardingComplete } from '../hooks/useOnboarding';
import { track } from '@/lib/analytics';
import type { DestinationCategory } from '../types';
import { WelcomeStep } from '../components/WelcomeStep';
import { DestinationStep } from '../components/DestinationStep';
import { TripProfileStep } from '../components/TripProfileStep';
import { ItineraryStep } from '../components/ItineraryStep';
import { CreateTripStep } from '../components/CreateTripStep';
import { FeatureTourStep } from '../components/FeatureTourStep';
import { ProgressHeader } from '../components/ProgressHeader';
import { SkipDialog } from '../components/SkipDialog';

const SLIDE = {
  enter: (d: number) => ({ opacity: 0, x: d * 40 }),
  center: { opacity: 1, x: 0 },
  exit: (d: number) => ({ opacity: 0, x: d * -40 }),
};
const SPRING = { type: 'spring', damping: 28, stiffness: 120 } as const;

const STEP_NAMES = [
  'welcome',
  'destination_dates',
  'trip_profile',
  'itinerary_preview',
  'trip_creation',
  'feature_tour',
] as const;
const TOTAL_STEPS = STEP_NAMES.length;

export default function OnboardingPage() {
  const navigate = useNavigate();
  const reduced = useReducedMotion() ?? false;
  const { user, isLoading: authLoading } = useAuthStore();
  const { state, advance, goBack, complete } = useOnboarding();
  const [showSkip, setShowSkip] = useState(false);
  const [dir, setDir] = useState(1);

  // Handle PKCE code exchange (email confirmation via code flow)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      void import('@/lib/supabase').then(({ supabase }) => {
        void supabase.auth.exchangeCodeForSession(code).catch((err: unknown) => {
          if (import.meta.env.DEV) {
            console.warn('[Onboarding] PKCE code exchange failed:', err);
          }
        });
      });
    }
  }, []);

  // Redirect if onboarding already complete
  useEffect(() => {
    if (!authLoading && user && isOnboardingComplete()) {
      navigate('/dashboard', { replace: true });
    }
  }, [authLoading, user, navigate]);

  if (authLoading) return <PageLoader />;

  function metaStr(key: string): string | undefined {
    const v: unknown = user?.user_metadata?.[key];
    return typeof v === 'string' ? v : undefined;
  }
  const firstName = (
    metaStr('full_name') ??
    metaStr('name') ??
    user?.email?.split('@')[0] ??
    'there'
  ).split(' ')[0];

  function skipAll() {
    track('onboarding_skipped', { at_step: state.step });
    complete();
    navigate('/dashboard', { replace: true });
  }

  function handleSkipRequest() {
    if (state.step <= 1) {
      skipAll();
    } else {
      setShowSkip(true);
    }
  }

  function handleBack() {
    if (state.step === 0) return;
    setDir(-1);
    goBack();
  }

  function handleAdvance(step: number, dataUpdate?: Parameters<typeof advance>[0]) {
    setDir(1);
    track('onboarding_step_completed', { step, step_name: STEP_NAMES[step] });
    if (step === TOTAL_STEPS - 1) {
      track('onboarding_completed', {});
      complete(dataUpdate);
    } else {
      advance(dataUpdate);
    }
  }

  function renderStep() {
    switch (state.step) {
      case 0:
        return <WelcomeStep key="welcome" firstName={firstName} onNext={() => handleAdvance(0)} />;

      case 1:
        return (
          <DestinationStep
            key="destination"
            initialDestination={state.data.destination}
            initialCategory={state.data.destinationCategory}
            initialStartDate={state.data.startDate}
            initialEndDate={state.data.endDate}
            reduced={reduced}
            onNext={(dest, cat: DestinationCategory, startDate, endDate) => {
              handleAdvance(1, {
                destination: dest,
                destinationCategory: cat,
                startDate,
                endDate,
                // v2 compat — keeps ItineraryStep & CreateTripStep working
                dates: { from: startDate, to: endDate },
              });
            }}
          />
        );

      case 2:
        return (
          <TripProfileStep
            key="trip-profile"
            initialGroupType={state.data.groupType}
            initialBudgetTier={state.data.budgetTier}
            onNext={(groupType, budgetTier) => handleAdvance(2, { groupType, budgetTier })}
          />
        );

      case 3:
        return (
          <ItineraryStep
            key="itinerary"
            destination={state.data.destination ?? 'Your destination'}
            dates={state.data.dates}
            reduced={reduced}
            onNext={() => handleAdvance(3)}
          />
        );

      case 4:
        return (
          <CreateTripStep
            key="create"
            destination={state.data.destination ?? ''}
            dates={state.data.dates}
            userId={user?.id ?? ''}
            reduced={reduced}
            onDone={(tripId) =>
              handleAdvance(4, {
                tripId,
                checklist: { ...state.data.checklist, tripCreated: true },
              })
            }
            onSkipTrip={() => handleAdvance(4)}
          />
        );

      case 5:
        return (
          <FeatureTourStep
            key="tour"
            tripId={state.data.tripId}
            reduced={reduced}
            onFinish={() => {
              complete();
              navigate('/dashboard', { replace: true });
            }}
          />
        );

      default:
        return null;
    }
  }

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: '#06060F', color: '#F8FAFC' }}
    >
      {/* Skip to content */}
      <a
        href="#onboarding-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-indigo-600 focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      {/* Ambient background blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-1/4 right-0 h-[300px] w-[300px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
          }}
        />
      </div>

      <ProgressHeader
        step={state.step}
        onBack={handleBack}
        onSkip={handleSkipRequest}
        reduced={reduced}
      />

      <main
        id="onboarding-main"
        className="relative z-10 flex flex-1 flex-col overflow-hidden pb-6 pt-4"
        style={{ maxWidth: '480px', margin: '0 auto', width: '100%' }}
      >
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={state.step}
            custom={dir}
            variants={reduced ? {} : SLIDE}
            initial="enter"
            animate="center"
            exit="exit"
            transition={SPRING}
            className="flex flex-1 flex-col overflow-auto"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showSkip && (
          <SkipDialog
            onConfirm={() => {
              setShowSkip(false);
              skipAll();
            }}
            onCancel={() => setShowSkip(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
