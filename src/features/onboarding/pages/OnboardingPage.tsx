import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Globe, CalendarDays, Wallet, Sparkles, ArrowRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';
import { APP_NAME } from '@/utils/constants';

export const ONBOARDING_KEY = 'travelmate-onboarded';

const SLIDES = [
  {
    Icon: Globe,
    gradient: 'from-blue-500 to-cyan-400',
    glow: 'bg-blue-500/10',
    title: 'Explore the world',
    description:
      'Discover top destinations, get in-depth guides, and find inspiration for your next adventure.',
  },
  {
    Icon: CalendarDays,
    gradient: 'from-violet-500 to-purple-400',
    glow: 'bg-violet-500/10',
    title: 'Plan every detail',
    description:
      'Build day-by-day itineraries, manage activities, and keep everything beautifully organised.',
  },
  {
    Icon: Wallet,
    gradient: 'from-emerald-500 to-teal-400',
    glow: 'bg-emerald-500/10',
    title: 'Track every penny',
    description:
      'Set category budgets, log expenses on the go, and always know exactly where you stand.',
  },
  {
    Icon: Sparkles,
    gradient: 'from-amber-400 to-orange-400',
    glow: 'bg-amber-400/10',
    title: 'Your AI companion',
    description: `${APP_NAME}'s AI crafts personalised recommendations, packing lists, and travel tips — just for you.`,
  },
] as const;

const SPRING = { type: 'spring', damping: 28, stiffness: 120 } as const;

function finish(navigate: ReturnType<typeof useNavigate>) {
  localStorage.setItem(ONBOARDING_KEY, 'true');
  navigate('/auth', { replace: true });
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const { user } = useAuthStore();

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1); // 1 = forward, -1 = backward

  // Authenticated users go straight to the app
  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const isLast = step === SLIDES.length - 1;

  function goNext() {
    if (isLast) {
      finish(navigate);
      return;
    }
    setDir(1);
    setStep((s) => s + 1);
  }

  function goBack() {
    if (step === 0) return;
    setDir(-1);
    setStep((s) => s - 1);
  }

  function goTo(i: number) {
    setDir(i > step ? 1 : -1);
    setStep(i);
  }

  const { Icon, gradient, glow, title, description } = SLIDES[step];

  const slideVariants = {
    enter: (d: number) => ({ opacity: 0, x: reduced ? 0 : d * 48 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: reduced ? 0 : d * -48 }),
  };

  return (
    <div className="fixed inset-0 z-10 flex flex-col bg-background" role="main">
      {/* ── Atmosphere ─────────────────────────────────── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.08] blur-[130px]" />
        <div className="absolute right-1/4 top-2/3 h-[280px] w-[280px] -translate-y-1/2 rounded-full bg-accent/[0.07] blur-[90px]" />
      </div>

      {/* ── Top bar ────────────────────────────────────── */}
      <div className="pt-safe relative z-10 flex items-center justify-between px-6 pt-6">
        <button
          onClick={goBack}
          aria-label="Go back"
          className={`flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            step === 0 ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {!isLast ? (
          <button
            onClick={() => finish(navigate)}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Skip
          </button>
        ) : (
          <div className="w-16" aria-hidden="true" />
        )}
      </div>

      {/* ── Slide ──────────────────────────────────────── */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center overflow-hidden px-8 text-center">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={SPRING}
            className="flex flex-col items-center gap-8"
          >
            {/* Icon */}
            <div className="relative">
              <div className={`absolute inset-0 scale-[1.6] rounded-3xl ${glow} blur-2xl`} />
              <div
                className={`relative flex h-[120px] w-[120px] items-center justify-center rounded-3xl bg-gradient-to-br ${gradient} shadow-lifted`}
              >
                <Icon className="h-14 w-14 text-white" aria-hidden="true" />
              </div>
            </div>

            {/* Text */}
            <div className="max-w-[300px] space-y-3">
              <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight text-foreground">
                {title}
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Footer ─────────────────────────────────────── */}
      <div className="pb-safe relative z-10 flex flex-col items-center gap-5 px-8 pb-10">
        {/* Progress dots */}
        <div className="flex items-center gap-2" role="tablist" aria-label="Onboarding steps">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === step}
              aria-label={`Step ${i + 1} of ${SLIDES.length}`}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                i === step
                  ? 'w-6 bg-primary'
                  : 'w-2 bg-muted-foreground/25 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>

        {/* CTA button */}
        <Button
          onClick={goNext}
          className="h-12 w-full max-w-[320px] rounded-xl font-semibold shadow-glow"
          aria-label={isLast ? 'Get started with TravelMate' : 'Go to next step'}
        >
          {isLast ? 'Get Started' : 'Next'}
          {!isLast && <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />}
        </Button>
      </div>
    </div>
  );
}
