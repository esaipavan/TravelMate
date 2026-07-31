import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Plane } from 'lucide-react';
import { GoogleIcon } from '../components/GoogleIcon';
import { toast } from 'sonner';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { emailSchema } from '@/utils/validators';
import { APP_NAME } from '@/utils/constants';
import { signIn, signInWithGoogle } from '../services/auth.service';

// ─── Schema (unchanged) ──────────────────────────────────────────────────────

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});
type LoginFormValues = z.infer<typeof loginSchema>;

// ─── Static assets ───────────────────────────────────────────────────────────

const STARS = [
  { x: '7%', y: '12%', w: 2, o: 0.55 },
  { x: '74%', y: '6%', w: 3, o: 0.8 },
  { x: '90%', y: '28%', w: 2, o: 0.5 },
  { x: '18%', y: '54%', w: 2.5, o: 0.65 },
  { x: '85%', y: '72%', w: 2, o: 0.6 },
  { x: '44%', y: '4%', w: 2.5, o: 0.9 },
  { x: '61%', y: '88%', w: 3, o: 0.5 },
  { x: '28%', y: '80%', w: 2, o: 0.7 },
  { x: '76%', y: '18%', w: 2.5, o: 0.8 },
  { x: '4%', y: '38%', w: 2, o: 0.5 },
  { x: '95%', y: '50%', w: 2.5, o: 0.7 },
  { x: '33%', y: '20%', w: 1.5, o: 0.55 },
];

// ─── Animation variants ───────────────────────────────────────────────────────

const SPRING = { type: 'spring', damping: 26, stiffness: 90 } as const;

const card = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1 },
};
const item = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };
const list = { visible: { transition: { staggerChildren: 0.07, delayChildren: 0.12 } } };

// ─── Page ────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const reduced = useReducedMotion();

  const [showPw, setShowPw] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const { isSubmitting } = form.formState;
  const isLoading = isSubmitting || googleLoading;

  // ── Handlers (unchanged) ──────────────────────────────────────────────────

  async function onSubmit(values: LoginFormValues) {
    try {
      await signIn(values.email, values.password);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
    }
  }

  async function handleGoogleSignIn() {
    try {
      setGoogleLoading(true);
      await signInWithGoogle(from);
    } catch (err) {
      setGoogleLoading(false);
      toast.error(err instanceof Error ? err.message : 'Google sign-in failed. Please try again.');
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

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
        className="relative z-10 w-full max-w-[400px] rounded-3xl border border-black/[0.06] bg-white/80 p-8 shadow-lifted backdrop-blur-2xl dark:border-white/[0.08] dark:bg-white/[0.04]"
      >
        <motion.div
          variants={reduced ? {} : list}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Logo */}
          <motion.div variants={item} transition={SPRING} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground shadow-glow">
              <Plane className="h-[18px] w-[18px]" aria-hidden="true" />
            </div>
            <span className="text-base font-bold tracking-tight text-foreground">{APP_NAME}</span>
          </motion.div>

          {/* Heading */}
          <motion.div variants={item} transition={SPRING} className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Sign in to continue planning with {APP_NAME}
            </p>
          </motion.div>

          {/* Google */}
          <motion.div variants={item} transition={SPRING}>
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full gap-2.5 rounded-xl font-medium backdrop-blur-sm"
              onClick={() => {
                void handleGoogleSignIn();
              }}
              disabled={isLoading}
            >
              {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
              {googleLoading ? 'Redirecting…' : 'Continue with Google'}
            </Button>
          </motion.div>

          {/* Divider */}
          <motion.div variants={item} transition={SPRING} className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              or
            </span>
            <div className="h-px flex-1 bg-border" />
          </motion.div>

          {/* Form */}
          <motion.div variants={item} transition={SPRING}>
            <Form {...form}>
              <form
                onSubmit={(e) => {
                  void form.handleSubmit(onSubmit)(e);
                }}
                className="space-y-4"
                noValidate
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Email address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          autoComplete="email"
                          disabled={isLoading}
                          className="h-11 rounded-xl"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-sm font-semibold">Password</FormLabel>
                        <Link
                          to="/forgot-password"
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPw ? 'text' : 'password'}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            disabled={isLoading}
                            className="h-11 rounded-xl pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPw((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            aria-label={showPw ? 'Hide password' : 'Show password'}
                          >
                            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="h-11 w-full rounded-xl font-semibold shadow-glow"
                  disabled={isLoading}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? 'Signing in…' : 'Sign in'}
                </Button>
              </form>
            </Form>
          </motion.div>

          {/* Footer */}
          <motion.p
            variants={item}
            transition={SPRING}
            className="text-center text-sm text-muted-foreground"
          >
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Create one free
            </Link>
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}
