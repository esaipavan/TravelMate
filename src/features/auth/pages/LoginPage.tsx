import { useId, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, KeyRound, Loader2, Lock, Plane, ShieldCheck } from 'lucide-react';
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
import { signIn, signInWithGoogle, resendConfirmationEmail } from '../services/auth.service';
import { EmailSentState } from '../components/EmailSentState';

// ─── Schema ───────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});
type LoginFormValues = z.infer<typeof loginSchema>;

// ─── Constants ────────────────────────────────────────────────────────────────

const STAGGER: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};
const ITEM: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 24, stiffness: 90 } },
};

const TRUST_ITEMS = [
  { Icon: Lock, text: 'Your data stays encrypted' },
  { Icon: ShieldCheck, text: 'Secure authentication' },
  { Icon: KeyRound, text: 'Privacy-first — we never share your data' },
] as const;

// ─── Page ────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const reduced = useReducedMotion();
  const rememberMeId = useId();

  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);

  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
  });

  const { isSubmitting } = form.formState;
  const isLoading = isSubmitting || googleLoading;

  async function onSubmit(values: LoginFormValues) {
    try {
      await signIn(values.email, values.password);
      if (!rememberMe) {
        // Supabase JS v2 does not support per-session persistSession; the client
        // setting is global. Remove the storage key immediately and set a flag so
        // AuthInitializer can re-remove it after every subsequent TOKEN_REFRESHED
        // event, preventing autoRefreshToken from re-persisting the session.
        sessionStorage.setItem('no-persist-session', '1');
        localStorage.removeItem('travel-planner-auth');
      }
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign in failed. Please try again.';
      if (msg === 'Please verify your email address before signing in.') {
        setUnconfirmedEmail(values.email);
      } else {
        toast.error(msg);
      }
    }
  }

  async function handleResend() {
    if (!unconfirmedEmail) return;
    try {
      await resendConfirmationEmail(unconfirmedEmail);
      toast.success('Confirmation email sent. Check your inbox.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to resend. Please try again.');
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

  if (unconfirmedEmail) {
    return (
      <div className="space-y-6">
        <EmailSentState
          email={unconfirmedEmail}
          message="Your email isn't verified yet. Click the link we sent you, or request a new one below."
          backTo={{ label: 'Back to sign in', to: '/login' }}
        />
        <div className="space-y-2 text-center">
          <button
            type="button"
            onClick={() => {
              void handleResend();
            }}
            className="text-sm font-semibold hover:underline"
            style={{ color: '#60A5FA' }}
          >
            Resend confirmation email
          </button>
          <p className="block" />
          <button
            type="button"
            onClick={() => setUnconfirmedEmail(null)}
            className="text-sm text-white/60 hover:underline"
          >
            Try a different account
          </button>
        </div>
      </div>
    );
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
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-700 shadow-sm">
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

      {/* Google (primary) */}
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
          or sign in with email
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
            {/* Email */}
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

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-white/80">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPw ? 'text' : 'password'}
                        autoComplete={rememberMe ? 'current-password' : 'off'}
                        disabled={isLoading}
                        className="h-11 rounded-xl pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded transition-colors after:absolute after:left-1/2 after:top-1/2 after:h-11 after:w-11 after:-translate-x-1/2 after:-translate-y-1/2 after:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        style={{ color: 'rgba(255,255,255,0.4)' }}
                        aria-label={showPw ? 'Hide password' : 'Show password'}
                      >
                        {showPw ? (
                          <EyeOff className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between">
              <label htmlFor={rememberMeId} className="flex cursor-pointer items-center gap-2">
                <input
                  id={rememberMeId}
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                  className="h-4 w-4 cursor-pointer rounded accent-blue-600"
                />
                <span className="select-none text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  Remember me
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium hover:underline"
                style={{ color: '#60A5FA' }}
                tabIndex={isLoading ? -1 : 0}
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="mt-1 h-11 w-full rounded-xl border-0 font-semibold"
              style={{
                background: '#F59E0B',
                color: '#111827',
                boxShadow: '0 0 20px rgba(245,158,11,0.25)',
              }}
              disabled={isLoading}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </Form>
      </motion.div>

      {/* Trust section */}
      <motion.div
        variants={reduced ? {} : ITEM}
        className="rounded-xl p-4"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <p
          className="mb-2.5 text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        >
          Your account is protected
        </p>
        <ul className="space-y-2">
          {TRUST_ITEMS.map(({ Icon, text }) => (
            <li
              key={text}
              className="flex items-center gap-2.5 text-[12px]"
              style={{ color: 'rgba(255,255,255,0.55)' }}
            >
              <Icon
                className="h-3.5 w-3.5 flex-shrink-0"
                style={{ color: '#60A5FA' }}
                aria-hidden="true"
              />
              {text}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Footer */}
      <motion.p
        variants={reduced ? {} : ITEM}
        className="text-center text-sm"
        style={{ color: 'rgba(255,255,255,0.45)' }}
      >
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold hover:underline" style={{ color: '#60A5FA' }}>
          Create one free
        </Link>
      </motion.p>
    </motion.div>
  );
}
