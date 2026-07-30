import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// User must type this phrase exactly to enable the confirm button.
// A typed phrase requires genuine intent — it cannot be accidentally clicked.
const CONFIRM_PHRASE = 'DELETE';

export function DeleteAccountDialog({ open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [isPending, setIsPending] = useState(false);

  const isConfirmed = input === CONFIRM_PHRASE;

  async function handleDelete() {
    if (!isConfirmed || isPending) return;
    setIsPending(true);

    try {
      const { error: rpcError } = await supabase.rpc('delete_own_account');
      if (rpcError) throw rpcError;

      await supabase.auth.signOut();
      toast.success('Your account has been permanently deleted.');
      navigate('/', { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong.';
      toast.error(`Failed to delete account: ${message}`);
      setIsPending(false);
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) setInput('');
    onOpenChange(next);
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="mb-3 flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10"
              aria-hidden="true"
            >
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle className="text-left">Delete account permanently</AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="space-y-4 text-left">
              <p>
                This action <strong className="text-foreground">cannot be undone</strong>. All your
                trips, expenses, journal entries, documents, reminders, and personal data will be
                permanently and irreversibly deleted.
              </p>
              <div className="space-y-2">
                <p className="text-sm">
                  Type{' '}
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold text-foreground">
                    {CONFIRM_PHRASE}
                  </code>{' '}
                  to confirm:
                </p>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={CONFIRM_PHRASE}
                  aria-label={`Type ${CONFIRM_PHRASE} to confirm account deletion`}
                  autoComplete="off"
                  spellCheck={false}
                  disabled={isPending}
                  className={[
                    'w-full rounded-lg border bg-background px-3 py-2 font-mono text-sm',
                    'placeholder:text-muted-foreground/40',
                    'focus:outline-none focus:ring-2',
                    isConfirmed
                      ? 'border-destructive focus:ring-destructive/30'
                      : 'border-border focus:ring-primary/20',
                    'disabled:opacity-50',
                  ].join(' ')}
                />
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => void handleDelete()}
            disabled={!isConfirmed || isPending}
            aria-disabled={!isConfirmed || isPending}
          >
            {isPending ? 'Deleting…' : 'Delete my account'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
