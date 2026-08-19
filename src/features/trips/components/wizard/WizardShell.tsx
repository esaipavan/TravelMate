import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { rv, EASE } from '@/lib/motion';
import { REDUCED_VARIANTS } from '@/lib/motion';
import { useWizard, canProceed, TOTAL_STEPS } from './WizardContext';
import { DestinationStep } from './steps/DestinationStep';
import { TripTypeStep } from './steps/TripTypeStep';
import { DatesStep } from './steps/DatesStep';
import { BudgetStep } from './steps/BudgetStep';
import { ReviewStep } from './steps/ReviewStep';

/* ── Step metadata ───────────────────────────────────────────────── */

const STEPS = [
  { label: 'Destination', shortLabel: '1' },
  { label: 'Trip Type', shortLabel: '2' },
  { label: 'Dates', shortLabel: '3' },
  { label: 'Budget', shortLabel: '4' },
  { label: 'Review', shortLabel: '5' },
];

/* ── Progress bar ────────────────────────────────────────────────── */

function ProgressBar({ current }: { current: number }) {
  const pct = ((current + 1) / TOTAL_STEPS) * 100;
  return (
    <div className="relative h-0.5 w-full bg-border">
      <motion.div
        className="absolute inset-y-0 left-0 bg-primary"
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.4, ease: EASE.out }}
      />
    </div>
  );
}

/* ── Step dots ───────────────────────────────────────────────────── */

function StepDots({ current }: { current: number }) {
  return (
    <div
      className="flex items-center justify-center gap-1.5"
      aria-label="Wizard progress"
      role="navigation"
    >
      {STEPS.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div
            key={s.label}
            aria-label={`Step ${i + 1}: ${s.label}${done ? ' (complete)' : active ? ' (current)' : ''}`}
            className={[
              'flex items-center justify-center rounded-full transition-all duration-300',
              active ? 'h-6 w-6 bg-primary text-[10px] font-bold text-primary-foreground' : '',
              done ? 'h-5 w-5 bg-primary/20 text-primary' : '',
              !active && !done ? 'h-2 w-2 bg-muted-foreground/30' : '',
            ].join(' ')}
          >
            {done && <Check className="h-2.5 w-2.5" />}
            {active && <span>{i + 1}</span>}
          </div>
        );
      })}
    </div>
  );
}

/* ── Step components map ─────────────────────────────────────────── */

function StepContent({ step }: { step: number }) {
  switch (step) {
    case 0:
      return <DestinationStep />;
    case 1:
      return <TripTypeStep />;
    case 2:
      return <DatesStep />;
    case 3:
      return <BudgetStep />;
    case 4:
      return <ReviewStep />;
    default:
      return null;
  }
}

/* ── Next button label ───────────────────────────────────────────── */

function NextLabel({ step, loading }: { step: number; loading: boolean }) {
  if (loading)
    return (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Creating…
      </>
    );
  if (step === TOTAL_STEPS - 1)
    return (
      <>
        Create Trip <Check className="ml-2 h-4 w-4" />
      </>
    );
  return (
    <>
      Continue <ArrowRight className="ml-2 h-4 w-4" />
    </>
  );
}

/* ── Shell ───────────────────────────────────────────────────────── */

export function WizardShell({
  onSubmit,
  isSubmitting,
}: {
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  const { state, goNext, goBack } = useWizard();
  const reduced = useReducedMotion();

  const { currentStep: step, direction } = state;
  const ok = canProceed(step, state);
  const isLast = step === TOTAL_STEPS - 1;
  const loading = isLast && isSubmitting;

  /* Slide variants — direction-aware */
  const slideVariants = {
    enter: { x: direction > 0 ? 60 : -60, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: direction > 0 ? -60 : 60, opacity: 0 },
  };

  /* Track step key for AnimatePresence */
  const stepKey = step;

  /* Ref to scroll top on step change */
  const scrollRef = useRef<HTMLDivElement>(null);

  function handleNext() {
    if (isLast) {
      onSubmit();
      return;
    }
    scrollRef.current?.scrollTo({ top: 0 });
    goNext();
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <div className="flex items-center gap-4">
            <Link
              to="/trips"
              aria-label="Exit wizard"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex-1">
              <StepDots current={step} />
            </div>
            <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
              {step + 1} / {TOTAL_STEPS}
            </span>
          </div>
        </div>
        <ProgressBar current={step} />
      </div>

      {/* ── Step content ────────────────────────────────────────── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-8 pb-32">
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={stepKey}
              variants={
                rv(slideVariants as never, reduced) === REDUCED_VARIANTS
                  ? REDUCED_VARIANTS
                  : slideVariants
              }
              initial={reduced ? false : 'enter'}
              animate="center"
              exit={reduced ? undefined : 'exit'}
              transition={{ duration: 0.28, ease: EASE.out }}
            >
              <StepContent step={step} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Footer navigation ───────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0 || loading}
            className={[
              'flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all',
              'text-muted-foreground hover:bg-muted hover:text-foreground',
              'disabled:pointer-events-none disabled:opacity-40',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            ].join(' ')}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {/* Step label */}
          <span className="hidden text-xs font-medium text-muted-foreground sm:block">
            {STEPS[step]?.label}
          </span>

          <button
            type="button"
            onClick={handleNext}
            disabled={!ok || loading}
            className={[
              'flex items-center rounded-full px-5 py-2 text-sm font-semibold text-white transition-all',
              'bg-primary shadow-md hover:bg-primary/90 hover:shadow-lg',
              'disabled:pointer-events-none disabled:opacity-40',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            ].join(' ')}
          >
            <NextLabel step={step} loading={loading} />
          </button>
        </div>
      </div>
    </div>
  );
}
