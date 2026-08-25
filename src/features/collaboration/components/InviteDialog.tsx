import { useState } from 'react';
import { Mail, UserPlus, Copy, Check, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/store/auth.store';
import { useCreateInvitation } from '../hooks/useInvitations';
import type { TripMemberRole } from '../types';

interface Props {
  tripId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteDialog({ tripId, open, onOpenChange }: Props) {
  const userId = useAuthStore((s) => s.user?.id ?? '');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<TripMemberRole>('viewer');
  // Set once an invitation is created — switches the dialog to the link-share
  // state. No email is ever sent; the owner copies this link and shares it.
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { mutate: createInvite, isPending } = useCreateInvitation(tripId);

  function reset() {
    setEmail('');
    setRole('viewer');
    setInviteUrl(null);
    setCopied(false);
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    createInvite(
      { email: email.trim(), role, invitedBy: userId },
      {
        onSuccess: (invitation) => {
          setInviteUrl(`${window.location.origin}/share/${invitation.token}`);
        },
      },
    );
  }

  async function copyLink() {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success('Invite link copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy — try selecting the link manually.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-primary" aria-hidden />
            Invite to Trip
          </DialogTitle>
        </DialogHeader>

        {inviteUrl ? (
          /* ── Success: shareable invite link ──────────────────────────── */
          <div className="space-y-4 pt-1">
            <p className="text-sm text-muted-foreground">
              Invite link created for{' '}
              <span className="font-medium text-foreground">{email || 'your collaborator'}</span>.
              Copy it and share it directly — they'll open it to accept. It expires in 7 days.
            </p>

            <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/30 px-3 py-2.5">
              <Link2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
              <span
                className="flex-1 truncate font-mono text-xs text-muted-foreground"
                aria-label="Invite link"
              >
                {inviteUrl}
              </span>
              <Button
                type="button"
                size="sm"
                className="h-7 shrink-0 gap-1.5 px-2.5 text-xs"
                onClick={() => void copyLink()}
                aria-label="Copy invite link"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5" aria-hidden />
                ) : (
                  <Copy className="h-3.5 w-3.5" aria-hidden />
                )}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>

            <div className="flex gap-2 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={reset}>
                Invite another
              </Button>
              <Button type="button" className="flex-1" onClick={() => handleOpenChange(false)}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          /* ── Form: create the invitation ─────────────────────────────── */
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="invite-email">Email address</Label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="friend@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="invite-role">Permission level</Label>
              <Select value={role} onValueChange={(v) => setRole(v as TripMemberRole)}>
                <SelectTrigger id="invite-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">
                    <span className="font-medium">Editor</span>
                    <span className="ml-2 text-xs text-muted-foreground">Can add and edit</span>
                  </SelectItem>
                  <SelectItem value="viewer">
                    <span className="font-medium">Viewer</span>
                    <span className="ml-2 text-xs text-muted-foreground">Read only</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <p className="text-xs text-muted-foreground">
              This creates a shareable invite link (no email is sent). It expires in 7 days.
            </p>

            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isPending || !email.trim()}>
                {isPending ? 'Creating…' : 'Create invite link'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
