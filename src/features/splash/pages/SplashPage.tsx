import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Plane } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { APP_NAME } from '@/utils/constants';

const DURATION_MS = 2800;
const SPRING = { type: 'spring', damping: 24, stiffness: 90 } as const;

const STARS = [
  { x: '8%', y: '14%', w: 2, opacity: 0.55 },
  { x: '73%', y: '7%', w: 3, opacity: 0.8 },
  { x: '91%', y: '29%', w: 2, opacity: 0.5 },
  { x: '19%', y: '55%', w: 2.5, opacity: 0.65 },
  { x: '86%', y: '73%', w: 2, opacity: 0.6 },
  { x: '43%', y: '5%', w: 2.5, opacity: 0.9 },
  { x: '62%', y: '89%', w: 3, opacity: 0.5 },
  { x: '30%', y: '82%', w: 2, opacity: 0.7 },
  { x: '77%', y: '19%', w: 2.5, opacity: 0.8 },
  { x: '56%', y: '76%', w: 1.5, opacity: 0.55 },
  { x: '5%', y: '39%', w: 2, opacity: 0.5 },
  { x: '96%', y: '51%', w: 2.5, opacity: 0.7 },
  { x: '34%', y: '21%', w: 1.5, opacity: 0.6 },
  { x: '64%', y: '43%', w: 1.5, opacity: 0.45 },
];

export default function SplashPage() {
  const navigate = useNavigate();
  const reduced = useReducedMotion();

  useEffect(() => {
    const id = setTimeout(() => {
      // Read fresh auth state at navigation time — avoids stale closure
      const { user } = useAuthStore.getState();
      const onboarded = !!localStorage.getItem('travelmate-onboarded');
      navigate(user ? '/dashboard' : onboarded ? '/auth' : '/onboarding', { replace: true });
    }, DURATION_MS);
    return () => clearTimeout(id);
  }, [navigate]);

  function enter(delay = 0) {
    if (reduced) return {};
    return {
      initial: { opacity: 0, y: 18 },
      animate: { opacity: 1, y: 0 },
      transition: { ...SPRING, delay },
    };
  }

  return (
    <div
      role="status"
      aria-label={`${APP_NAME} is loading`}
      className="relative flex min-h-screen select-none flex-col items-center justify-center overflow-hidden bg-background"
    >
      {/* ── Atmosphere ─────────────────────────────────── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {/* Primary blue radial glow */}
        <div className="absolute left-1/2 top-[38%] h-[540px] w-[540px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.09] blur-[140px]" />
        {/* Accent violet secondary glow */}
        <div className="absolute left-[66%] top-[62%] h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.07] blur-[90px]" />
        {/* Warm bottom rim gradient */}
        <div className="absolute inset-x-0 bottom-0 h-[200px] bg-gradient-to-t from-primary/[0.04] to-transparent" />

        {/* Star field — dark mode only */}
        {STARS.map(({ x, y, w, opacity }, i) => (
          <span
            key={i}
            className="absolute hidden rounded-full bg-white dark:block"
            style={{ left: x, top: y, width: w, height: w, opacity }}
          />
        ))}
      </div>

      {/* ── Logo lockup ────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Icon card */}
        <motion.div {...enter(0)}>
          <div className="relative">
            <div className="absolute inset-0 scale-[1.5] rounded-3xl bg-primary/10 blur-2xl" />
            <div className="relative flex h-[88px] w-[88px] items-center justify-center rounded-3xl bg-card shadow-lifted ring-1 ring-border">
              <div className="flex h-[54px] w-[54px] items-center justify-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-glow">
                <Plane
                  className={`h-[28px] w-[28px] ${reduced ? '' : 'animate-tm-float'}`}
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Wordmark */}
        <motion.div {...enter(0.15)} className="text-center">
          <h1 className="text-[2.4rem] font-bold leading-none tracking-tight text-foreground">
            {APP_NAME}
          </h1>
          <p className="mt-2 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Your AI Travel Companion
          </p>
        </motion.div>

        {/* Loading dots */}
        <motion.div {...enter(0.3)} className="flex items-center gap-[7px]">
          <span className="sr-only">Loading…</span>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              aria-hidden="true"
              className="block h-[6px] w-[6px] rounded-full bg-primary"
              animate={reduced ? {} : { opacity: [0.25, 1, 0.25], scale: [0.75, 1.3, 0.75] }}
              transition={{
                duration: 1.25,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </motion.div>
      </div>

      {/* ── Footer ─────────────────────────────────────── */}
      <motion.p
        {...enter(0.45)}
        aria-hidden="true"
        className="absolute bottom-10 text-xs text-muted-foreground/50"
      >
        © {new Date().getFullYear()} {APP_NAME}
      </motion.p>
    </div>
  );
}
