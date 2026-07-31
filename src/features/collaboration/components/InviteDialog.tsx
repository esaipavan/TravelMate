import { useState } from 'react';
import { Mail, UserPlus } from 'lucide-react';
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

  const { mutate: createInvite, isPending } = useCreateInvitation(tripId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    createInvite(
      { email: email.trim(), role, invitedBy: userId },
      {
        onSuccess: () => {
          setEmail('');
          setRole('viewer');
          onOpenChange(false);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-primary" aria-hidden />
            Invite to Trip
          </DialogTitle>
        </DialogHeader>

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
            They'll receive a link to accept the invitation. It expires in 7 days.
          </p>

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isPending || !email.trim()}>
              {isPending ? 'Sending…' : 'Send Invite'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
