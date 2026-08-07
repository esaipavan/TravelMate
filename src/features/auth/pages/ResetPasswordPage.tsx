import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, ArrowLeft } from 'lucide-react';
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
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { passwordSchema } from '@/utils/validators';
import { supabase } from '@/lib/supabase';
import { updatePassword } from '../services/auth.service';

const resetSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetFormValues = z.infer<typeof resetSchema>;
type PageState = 'loading' | 'ready' | 'error';

const SPRING = { type: 'spring', damping: 26, stiffness: 90 } as const;
const card = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1 },
};
const item = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };
const list = { visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } };

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pageState, setPageState] = useState<PageState>('loading');

  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const { isSubmitting } = form.formState;

  useEffect(() => {
    // Mark that a live PASSWORD_RECOVERY event was received in this browser session.
    // The flag survives a page refresh (sessionStorage is tab-persistent) but is absent
    // for ordinary signed-in users who navigate here directly — keeping the form secure.
    const RECOVERY_FLAG = 'pw-recovery-in-progress';

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        sessionStorage.setItem(RECOVERY_FLAG, '1');
        setPageState('ready');
      }
    });

    // Handle the page-refresh case: Supabase clears the URL hash after the first load,
    // so PASSWORD_RECOVERY never re-fires on refresh. If the flag is present and a valid
    // recovery session exists in localStorage, allow the user to continue.
    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && sessionStorage.getItem(RECOVERY_FLAG) === '1') {
        setPageState('ready');
      }
    });

    const timeout = setTimeout(() => {
      setPageState((current) => (current === 'loading' ? 'error' : current));
    }, 4000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function onSubmit(values: ResetFormValues) {
    try {
      await updatePassword(values.password);
      sessionStorage.removeItem('pw-recovery-in-progress');
      await supabase.auth.signOut();
      toast.success('Password updated. Please sign in with your new password.');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to update password. Please try again.',
      );
    }
  }

  if (pageState === 'loading') {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-center">
        <LoadingSpinner size="md" label="Verifying your reset link…" />
        <p className="text-sm text-muted-foreground">Verifying your reset link…</p>
      </div>
    );
  }

  if (pageState === 'error') {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
          <Lock className="h-6 w-6 text-destructive" aria-hidden />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Link expired</h1>
          <p className="text-sm text-muted-foreground">
            This password reset link is invalid or has expired. Reset links are valid for 1 hour.
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/forgot-password')}>
          Request a new link
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      variants={reduced ? {} : card}
      initial="hidden"
      animate="visible"
      transition={{ ...SPRING, delay: 0.05 }}
    >
      <motion.div
        variants={reduced ? {} : list}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={item} transition={SPRING} className="space-y-1.5 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-brand shadow-glow">
            <Lock className="h-5 w-5 text-primary-foreground" aria-hidden />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Set new password</h1>
          <p className="text-sm text-muted-foreground">
            Choose a strong password for your account.
          </p>
        </motion.div>

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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">New password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          disabled={isSubmitting}
                          className="h-11 rounded-xl pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Confirm new password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirm ? 'text' : 'password'}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          disabled={isSubmitting}
                          className="h-11 rounded-xl pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label={showConfirm ? 'Hide password' : 'Show password'}
                        >
                          {showConfirm ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <p className="text-xs text-muted-foreground">
                At least 8 characters with one uppercase letter and one number.
              </p>

              <Button
                type="submit"
                className="h-11 w-full rounded-xl font-semibold shadow-glow"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating…' : 'Update password'}
              </Button>
            </form>
          </Form>
        </motion.div>

        <motion.div variants={item} transition={SPRING} className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Back to sign in
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
