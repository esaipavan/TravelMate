import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Plane } from 'lucide-react';
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
import { signUp } from '../services/auth.service';
import { EmailSentState } from '../components/EmailSentState';
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

// ─── Page ────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [regEmail, setRegEmail] = useState('');
  const reduced = useReducedMotion();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
  });

  const { isSubmitting } = form.formState;

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

  if (submitted) return <EmailSentState email={regEmail} />;

  return (
    <motion.div
      variants={reduced ? {} : STAGGER}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      {/* Logo + heading */}
      <motion.div variants={reduced ? {} : ITEM} className="space-y-1">
        <div className="mb-4 flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: GRAD }}
          >
            <Plane className="h-[18px] w-[18px] text-white" aria-hidden="true" />
          </div>
          <span className="text-base font-bold tracking-tight text-white">{APP_NAME}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Create your account</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Start planning with {APP_NAME} — free forever
        </p>
      </motion.div>

      {/* Form */}
      <Form {...form}>
        <form
          onSubmit={(e) => {
            void form.handleSubmit(onSubmit)(e);
          }}
          className="space-y-4"
          noValidate
        >
          <motion.div variants={reduced ? {} : ITEM}>
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-white/80">Full name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Jane Smith"
                      autoComplete="name"
                      disabled={isSubmitting}
                      className="h-11 rounded-xl"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div variants={reduced ? {} : ITEM}>
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
                      disabled={isSubmitting}
                      className="h-11 rounded-xl"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div variants={reduced ? {} : ITEM}>
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
                        placeholder="Min. 8 characters"
                        autoComplete="new-password"
                        disabled={isSubmitting}
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
          </motion.div>

          <motion.div variants={reduced ? {} : ITEM}>
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
                        placeholder="Re-enter your password"
                        autoComplete="new-password"
                        disabled={isSubmitting}
                        className="h-11 rounded-xl pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        style={{ color: 'rgba(255,255,255,0.4)' }}
                        aria-label={showConfirm ? 'Hide password' : 'Show password'}
                      >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div variants={reduced ? {} : ITEM} className="space-y-3 pt-1">
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Must be at least 8 characters with one uppercase letter and one number.
            </p>
            <Button
              type="submit"
              className="h-11 w-full rounded-xl border-0 font-semibold text-white"
              style={{ background: GRAD, boxShadow: '0 0 24px rgba(124,108,221,0.35)' }}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </Button>
          </motion.div>
        </form>
      </Form>

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
