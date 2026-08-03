import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Plane } from 'lucide-react';
import { GoogleIcon } from '../components/GoogleIcon';
import { toast } from 'sonner';
import { motion, useReducedMotion } from 'framer-motion';
import type { Variants } from 'framer-motion';
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

// ─── Schema ───────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});
type LoginFormValues = z.infer<typeof loginSchema>;

// ─── Constants ────────────────────────────────────────────────────────────────

const GRAD = 'linear-gradient(135deg, hsl(237 72% 59%), hsl(271 77% 58%))';

const STAGGER: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};
const ITEM: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 24, stiffness: 90 } },
};

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

  return (
    <motion.div
      variants={reduced ? {} : STAGGER}
      initial="hidden"
      animate="show"
      className="space-y-5"
    >
      {/* Logo */}
      <motion.div variants={reduced ? {} : ITEM} className="flex items-center gap-2.5">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ background: GRAD }}
        >
          <Plane className="h-[18px] w-[18px] text-white" aria-hidden="true" />
        </div>
        <span className="text-base font-bold tracking-tight text-white">{APP_NAME}</span>
      </motion.div>

      {/* Heading */}
      <motion.div variants={reduced ? {} : ITEM} className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-white">Welcome back</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Sign in to continue planning with {APP_NAME}
        </p>
      </motion.div>

      {/* Google */}
      <motion.div variants={reduced ? {} : ITEM}>
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full gap-2.5 rounded-xl font-medium text-white hover:text-white"
          style={{ borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)' }}
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
      <motion.div variants={reduced ? {} : ITEM} className="flex items-center gap-3">
        <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.1)' }} />
        <span
          className="text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        >
          or
        </span>
        <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.1)' }} />
      </motion.div>

      {/* Form */}
      <motion.div variants={reduced ? {} : ITEM}>
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
                  <FormLabel className="text-sm font-semibold text-white/80">
                    Email address
                  </FormLabel>
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
                    <FormLabel className="text-sm font-semibold text-white/80">Password</FormLabel>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-medium hover:underline"
                      style={{ color: 'hsl(257 60% 72%)' }}
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        style={{ color: 'rgba(255,255,255,0.4)' }}
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
              className="mt-1 h-11 w-full rounded-xl border-0 font-semibold text-white"
              style={{ background: GRAD, boxShadow: '0 0 24px rgba(124,108,221,0.35)' }}
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
        variants={reduced ? {} : ITEM}
        className="text-center text-sm"
        style={{ color: 'rgba(255,255,255,0.45)' }}
      >
        Don't have an account?{' '}
        <Link
          to="/register"
          className="font-semibold hover:underline"
          style={{ color: 'hsl(257 60% 72%)' }}
        >
          Create one free
        </Link>
      </motion.p>
    </motion.div>
  );
}
