import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Plane, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { APP_NAME } from '@/utils/constants';
import { signInWithGoogle } from '../services/auth.service';

// ─── Google icon ─────────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

// ─── Atmosphere ───────────────────────────────────────────────────────────────

const STARS = [
  { x: '8%', y: '11%', w: 2, o: 0.55 },
  { x: '75%', y: '6%', w: 3, o: 0.8 },
  { x: '91%', y: '27%', w: 2, o: 0.5 },
  { x: '17%', y: '52%', w: 2.5, o: 0.65 },
  { x: '86%', y: '74%', w: 2, o: 0.6 },
  { x: '44%', y: '4%', w: 2.5, o: 0.9 },
  { x: '61%', y: '89%', w: 3, o: 0.5 },
  { x: '29%', y: '81%', w: 2, o: 0.7 },
  { x: '76%', y: '18%', w: 2.5, o: 0.8 },
  { x: '5%', y: '38%', w: 2, o: 0.5 },
  { x: '95%', y: '51%', w: 2.5, o: 0.7 },
  { x: '33%', y: '21%', w: 1.5, o: 0.55 },
];

// ─── Animation variants ───────────────────────────────────────────────────────

const SPRING = { type: 'spring', damping: 26, stiffness: 90 } as const;
const card = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1 },
};
const item = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } };

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AuthHubPage() {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogle() {
    try {
      setGoogleLoading(true);
      await signInWithGoogle('/dashboard');
    } catch (err) {
      setGoogleLoading(false);
      toast.error(err instanceof Error ? err.message : 'Google sign-in failed. Please try again.');
    }
  }

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center overflow-y-auto bg-background px-4 py-10">
      {/* Atmosphere */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[35%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.09] blur-[130px]" />
        <div className="absolute left-[65%] top-[65%] h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.07] blur-[90px]" />
        <div className="absolute inset-x-0 bottom-0 h-[180px] bg-gradient-to-t from-primary/[0.04] to-transparent" />
        {STARS.map(({ x, y, w, o }, i) => (
          <span
            key={i}
            className="absolute hidden rounded-full bg-white dark:block"
            style={{ left: x, top: y, width: w, height: w, opacity: o }}
          />
        ))}
      </div>

      {/* Card */}
      <motion.div
        variants={reduced ? {} : card}
        initial="hidden"
        animate="visible"
        transition={{ ...SPRING, delay: 0.05 }}
        className="relative z-10 w-full max-w-[380px] rounded-3xl border border-black/[0.06] bg-white/80 p-8 shadow-lifted backdrop-blur-2xl dark:border-white/[0.08] dark:bg-white/[0.04]"
      >
        <motion.div
          variants={reduced ? {} : stagger}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Identity */}
          <motion.div
            variants={item}
            transition={SPRING}
            className="flex flex-col items-center gap-3 text-center"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-glow">
              <Plane className="h-7 w-7" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{APP_NAME}</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">Your AI travel companion</p>
            </div>
          </motion.div>

          {/* Divider */}
          <motion.div variants={item} transition={SPRING} className="h-px bg-border" />

          {/* Actions */}
          <motion.div variants={item} transition={SPRING} className="space-y-3">
            {/* Google */}
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full gap-2.5 rounded-xl font-medium backdrop-blur-sm"
              onClick={() => {
                void handleGoogle();
              }}
              disabled={googleLoading}
              aria-label="Continue with Google"
            >
              {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
              {googleLoading ? 'Redirecting…' : 'Continue with Google'}
            </Button>

            {/* Sign In */}
            <Button
              className="h-11 w-full rounded-xl font-semibold shadow-glow"
              onClick={() => navigate('/login')}
              disabled={googleLoading}
              aria-label="Sign in with email"
            >
              Sign In
            </Button>

            {/* Create Account */}
            <Button
              variant="ghost"
              className="h-11 w-full rounded-xl font-medium text-muted-foreground hover:text-foreground"
              onClick={() => navigate('/register')}
              disabled={googleLoading}
              aria-label="Create a new account"
            >
              Create Account
            </Button>
          </motion.div>

          {/* Footer */}
          <motion.p
            variants={item}
            transition={SPRING}
            className="text-center text-[11px] leading-relaxed text-muted-foreground/60"
          >
            By continuing, you agree to our{' '}
            <span className="underline underline-offset-2">Terms of Service</span> and{' '}
            <span className="underline underline-offset-2">Privacy Policy</span>.
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}
