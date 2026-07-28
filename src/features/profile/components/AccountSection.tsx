import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/store/auth.store';
import {
  useChangePassword,
  useUpdateEmail,
  useSignOutAll,
  useDeleteAccount,
} from '../hooks/useProfile';

// ── Schemas ───────────────────────────────────────────────────────────────────

const passwordSchema = z
  .object({
    new_password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm_password: z.string(),
  })
  .refine((v) => v.new_password === v.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

const emailSchema = z.object({
  new_email: z.string().email('Enter a valid email address'),
});

type PasswordValues = z.infer<typeof passwordSchema>;
type EmailValues = z.infer<typeof emailSchema>;

// ── Sub-forms ─────────────────────────────────────────────────────────────────

function ChangePasswordForm() {
  const { mutate, isPending } = useChangePassword();

  const form = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { new_password: '', confirm_password: '' },
  });

  function onSubmit(values: PasswordValues) {
    mutate(values.new_password, {
      onSuccess: () => form.reset(),
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          void form.handleSubmit(onSubmit)(e);
        }}
        className="space-y-3"
      >
        <h3 className="text-sm font-semibold">Change Password</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="new_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Min. 8 characters" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirm_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Repeat new password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? 'Updating…' : 'Update Password'}
        </Button>
      </form>
    </Form>
  );
}

function UpdateEmailForm() {
  const { user } = useAuthStore();
  const { mutate, isPending } = useUpdateEmail();

  const form = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { new_email: '' },
  });

  function onSubmit(values: EmailValues) {
    mutate(values.new_email, {
      onSuccess: () => form.reset(),
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          void form.handleSubmit(onSubmit)(e);
        }}
        className="space-y-3"
      >
        <h3 className="text-sm font-semibold">Update Email</h3>
        <p className="text-xs text-muted-foreground">
          Current: <span className="font-medium text-foreground">{user?.email ?? '—'}</span>
        </p>
        <div className="flex items-end gap-2">
          <FormField
            control={form.control}
            name="new_email"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>New Email Address</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="new@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" size="sm" disabled={isPending} className="shrink-0">
            {isPending ? 'Sending…' : 'Send Verification'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function AccountSection() {
  const [deleteInput, setDeleteInput] = useState('');
  const signOutAll = useSignOutAll();
  const deleteAcct = useDeleteAccount();

  return (
    <div className="space-y-6">
      {/* Change password */}
      <div className="rounded-xl border bg-card p-5">
        <ChangePasswordForm />
      </div>

      <Separator />

      {/* Update email */}
      <div className="rounded-xl border bg-card p-5">
        <UpdateEmailForm />
      </div>

      <Separator />

      {/* Sign out all devices */}
      <div className="space-y-3 rounded-xl border bg-card p-5">
        <h3 className="text-sm font-semibold">Sign Out from All Devices</h3>
        <p className="text-xs text-muted-foreground">
          Ends all active sessions, including this one. You will be redirected to the login page.
        </p>
        <Button
          variant="outline"
          size="sm"
          disabled={signOutAll.isPending}
          onClick={() => signOutAll.mutate()}
        >
          {signOutAll.isPending ? 'Signing out…' : 'Sign Out Everywhere'}
        </Button>
      </div>

      <Separator />

      {/* Delete account */}
      <div className="space-y-3 rounded-xl border border-destructive/30 bg-destructive/5 p-5">
        <h3 className="text-sm font-semibold text-destructive">Delete Account</h3>
        <p className="text-xs text-muted-foreground">
          Permanently deletes your account and all associated data. This action cannot be undone.
        </p>
        <AlertDialog onOpenChange={() => setDeleteInput('')}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              Delete My Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete account permanently?</AlertDialogTitle>
              <AlertDialogDescription>
                All your trips, expenses, journal entries, documents, and reminders will be deleted.
                This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2 py-2">
              <p className="text-sm font-medium">
                Type <span className="font-mono font-bold">DELETE</span> to confirm
              </p>
              <Input
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="DELETE"
                className="font-mono"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={deleteInput !== 'DELETE' || deleteAcct.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => deleteAcct.mutate()}
              >
                {deleteAcct.isPending ? 'Deleting…' : 'Delete Account'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
