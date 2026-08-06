import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, KeyRound, Loader2, Lock, Plane, ShieldCheck } from 'lucide-react';
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
import { emailSchema, passwordSchema } from '@/utils/validators';
import { APP_NAME } from '@/utils/constants';
import { signInWithGoogle, signUp } from '../services/auth.service';
import { EmailSentState } from '../components/EmailSentState';
import { GoogleIcon } from '../components/GoogleIcon';
import { track } from '@/lib/analytics';

// ─── Schema ───────────────────────────────────────────────────────────────────

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

// ─── Constants ────────────────────────────────────────────────────────────────

const GRAD = 'linear-gradient(135deg, hsl(237 72% 59%), hsl(271 77% 58%))';

const STAGGER: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.12 } },
};
const ITEM: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 24, stiffness: 90 } },
};

// ─── Password strength ────────────────────────────────────────────────────────

function getPasswordStrength(pw: string): 0 | 1 | 2 | 3 | 4 {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4) as 0 | 1 | 2 | 3 | 4;
}

const STRENGTH_SEGMENT_COLOR = [
  '',
  'bg-red-500',
  'bg-amber-500',
  'bg-yellow-400',
  'bg-emerald-500',
] as const;

const STRENGTH_LABEL = ['', 'Weak', 'Fair', 'Good', 'Strong'] as const;

const STRENGTH_TEXT_COLOR = [
  '',
  'text-red-400',
  'text-amber-400',
  'text-yellow-300',
  'text-emerald-400',
] as const;

// ─── Trust items ─────────────────────────────────────────────────────────────

const TRUST_ITEMS = [
  { Icon: Lock, text: 'Your travel data is encrypted' },
  { Icon: ShieldCheck, text: 'We never sell your personal data' },
  { Icon: KeyRound, text: 'You own your travel information' },
] as const;

// ─── Page ────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const reduced = useReducedMotion();
  const pwDescId = useId();

  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [regEmail, setRegEmail] = useState('');

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
    mode: 'onTouched',
  });

  const { isSubmitting } = form.formState;
  const isLoading = isSubmitting || googleLoading;
  const passwordValue = form.watch('password');
  const strength = getPasswordStrength(passwordValue);

  async function onSubmit(values: RegisterFormValues) {
    try {
      await signUp(values.email, values.password, values.fullName);
      track('signed_up', { method: 'email' });
      setRegEmail(values.email);
      setSubmitted(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    }
  }

  async function handleGoogleSignIn() {
    try {
      setGoogleLoading(true);
      await signInWithGoogle();
    } catch (err) {
      setGoogleLoading(false);
      toast.error(err instanceof Error ? err.message : 'Google sign-in failed. Please try again.');
    }
  }

  if (submitted) {
    return (
      <EmailSentState
        email={regEmail}
        message="Click the link we sent you to verify your account — it only takes a moment."
        backTo={{ label: 'Back to sign up', to: '/register' }}
      />
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
        <h1 className="text-2xl font-bold tracking-tight text-white">Create your account</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Free forever — no credit card, no catch.
        </p>
      </motion.div>

      {/* Google Sign-In (primary) */}
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
          or sign up with email
        </span>
        <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.1)' }} />
      </motion.div>

      {/* Email form */}
      <motion.div variants={reduced ? {} : ITEM}>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              void form.handleSubmit(onSubmit)(e);
            }}
            className="space-y-4"
            noValidate
          >
            {/* Full name */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-white/80">Full name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      autoComplete="name"
                      disabled={isLoading}
                      className="h-11 rounded-xl"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                        autoComplete="new-password"
                        disabled={isLoading}
                        className="h-11 rounded-xl pr-10"
                        aria-describedby={pwDescId}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

                  {/* Strength meter — only shown once user starts typing */}
                  {passwordValue && (
                    <div className="mt-1.5 space-y-1">
                      <div className="flex gap-1" aria-hidden="true">
                        {([1, 2, 3, 4] as const).map((seg) => (
                          <div
                            key={seg}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              strength >= seg ? STRENGTH_SEGMENT_COLOR[strength] : 'bg-white/10'
                            }`}
                          />
                        ))}
                      </div>
                      <p
                        className={`text-[11px] font-medium ${STRENGTH_TEXT_COLOR[strength]}`}
                        aria-live="polite"
                      >
                        {STRENGTH_LABEL[strength]}
                      </p>
                    </div>
                  )}

                  {/* Persistent requirements hint */}
                  <p
                    id={pwDescId}
                    className="mt-1 text-[11px]"
                    style={{ color: 'rgba(255,255,255,0.35)' }}
                  >
                    Min. 8 characters, 1 uppercase letter, 1 number
                  </p>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm password */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-white/80">
                    Confirm password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirm ? 'text' : 'password'}
                        autoComplete="new-password"
                        disabled={isLoading}
                        className="h-11 rounded-xl pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        style={{ color: 'rgba(255,255,255,0.4)' }}
                        aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                      >
                        {showConfirm ? (
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

            {/* What happens after submit */}
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
              We'll send a verification link to your email address.
            </p>

            <Button
              type="submit"
              className="h-11 w-full rounded-xl border-0 font-semibold text-white"
              style={{ background: GRAD, boxShadow: '0 0 24px rgba(124,108,221,0.35)' }}
              disabled={isLoading}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Creating account…' : 'Create account'}
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
          Your data is safe with us
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
                style={{ color: 'hsl(257 60% 72%)' }}
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
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-semibold hover:underline"
          style={{ color: 'hsl(257 60% 72%)' }}
        >
          Sign in
        </Link>
      </motion.p>
    </motion.div>
  );
}
