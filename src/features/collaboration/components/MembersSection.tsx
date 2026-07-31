import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Users, UserPlus, MoreVertical, Trash2, Crown, Shield, Eye, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { rv, LIST_VARIANTS, LIST_ITEM_VARIANTS } from '@/lib/motion';
import { useAuthStore } from '@/store/auth.store';
import { useTripMembers, useUpdateMemberRole, useRemoveMember } from '../hooks/useTripMembers';
import { useInvitations, useCancelInvitation } from '../hooks/useInvitations';
import { InviteDialog } from './InviteDialog';
import type { CollabMember, TripMemberRole } from '../types';
import type { EffectiveRole } from '../types';

const ROLE_META: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; badge: string }
> = {
  owner: { label: 'Owner', icon: Crown, badge: 'bg-primary/10 text-primary' },
  editor: { label: 'Editor', icon: Shield, badge: 'bg-accent/10 text-accent-foreground' },
  viewer: { label: 'Viewer', icon: Eye, badge: 'bg-muted text-muted-foreground' },
};

function MemberRow({
  member,
  currentUserId,
  myRole,
  tripId,
}: {
  member: CollabMember;
  currentUserId: string;
  myRole: EffectiveRole;
  tripId: string;
}) {
  const reduced = useReducedMotion();
  const { mutate: updateRole, isPending: updatingRole } = useUpdateMemberRole(tripId);
  const { mutate: removeM, isPending: removing } = useRemoveMember(tripId);

  const meta = ROLE_META[member.role] ?? ROLE_META['viewer'];
  const RoleIcon = meta.icon;
  const isMe = member.userId === currentUserId;
  const canManage = myRole === 'owner' && !member.isOwner;

  return (
    <motion.div
      variants={rv(LIST_ITEM_VARIANTS, reduced)}
      className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3"
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ring-2 ring-background',
          member.avatarUrl ? '' : meta.badge,
        )}
      >
        {member.avatarUrl ? (
          <img
            src={member.avatarUrl}
            alt={member.name}
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          member.initials
        )}
      </div>

      {/* Name + email */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">
          {member.name}
          {isMe && <span className="ml-1.5 text-xs font-normal text-muted-foreground">(you)</span>}
        </p>
        <p className="truncate text-xs text-muted-foreground">{member.email}</p>
      </div>

      {/* Role badge */}
      <span
        className={cn(
          'flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
          meta.badge,
        )}
      >
        <RoleIcon className="h-3 w-3" aria-hidden />
        {meta.label}
      </span>

      {/* Actions menu (owner only, for non-owner members) */}
      {canManage && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              aria-label={`Manage ${member.name}`}
            >
              <MoreVertical className="h-3.5 w-3.5" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel>Change role</DropdownMenuLabel>
            {(['editor', 'viewer'] as TripMemberRole[]).map((r) => (
              <DropdownMenuItem
                key={r}
                disabled={member.role === r || updatingRole}
                onClick={() => updateRole({ userId: member.userId, role: r })}
              >
                {ROLE_META[r]?.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              disabled={removing}
              onClick={() => removeM(member.userId)}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" aria-hidden />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Allow member to leave the trip */}
      {isMe && !member.isOwner && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
          aria-label="Leave trip"
          disabled={removing}
          onClick={() => removeM(member.userId)}
        >
          <X className="h-3.5 w-3.5" aria-hidden />
        </Button>
      )}
    </motion.div>
  );
}

interface Props {
  tripId: string;
  myRole: EffectiveRole;
}

export function MembersSection({ tripId, myRole }: Props) {
  const reduced = useReducedMotion();
  const userId = useAuthStore((s) => s.user?.id ?? '');
  const [inviteOpen, setInviteOpen] = useState(false);

  const { data: members = [], isLoading: membersLoading } = useTripMembers(tripId);
  const { data: invitations = [], isLoading: invitationsLoading } = useInvitations(tripId);
  const { mutate: cancelInvite, isPending: cancelling } = useCancelInvitation(tripId);

  const pendingInvites = invitations.filter((i) => i.status === 'pending');
  const canInvite = myRole === 'owner' || myRole === 'editor';

  if (membersLoading || invitationsLoading) {
    return (
      <section aria-label="Trip members" className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32 rounded" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </section>
    );
  }

  return (
    <section aria-labelledby="members-heading" className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" aria-hidden />
          <h2
            id="members-heading"
            className="text-sm font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Members
            <span className="ml-1.5 text-xs font-normal normal-case">({members.length})</span>
          </h2>
        </div>
        {canInvite && (
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 text-xs"
            onClick={() => setInviteOpen(true)}
          >
            <UserPlus className="h-3.5 w-3.5" aria-hidden />
            Invite
          </Button>
        )}
      </div>

      {/* Member list */}
      <motion.div
        className="space-y-2"
        variants={rv(LIST_VARIANTS, reduced)}
        initial="hidden"
        animate="show"
      >
        {members.map((m) => (
          <MemberRow
            key={m.userId}
            member={m}
            currentUserId={userId}
            myRole={myRole}
            tripId={tripId}
          />
        ))}
      </motion.div>

      {/* Pending invitations */}
      {pendingInvites.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/60">
            Pending invitations
          </p>
          {pendingInvites.map((inv) => (
            <div
              key={inv.id}
              className="flex items-center gap-3 rounded-xl border border-dashed border-border/60 bg-muted/20 px-3 py-2.5"
            >
              <Clock className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{inv.invited_email}</p>
                <p className="text-xs capitalize text-muted-foreground">
                  {inv.role} · expires {new Date(inv.expires_at).toLocaleDateString()}
                </p>
              </div>
              <Badge variant="secondary" className="text-[10px]">
                Pending
              </Badge>
              {(myRole === 'owner' || inv.invited_by === userId) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                  aria-label={`Cancel invitation for ${inv.invited_email}`}
                  disabled={cancelling}
                  onClick={() => cancelInvite(inv.id)}
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {members.length === 1 && pendingInvites.length === 0 && canInvite && (
        <button
          type="button"
          onClick={() => setInviteOpen(true)}
          className="w-full rounded-xl border border-dashed border-border/60 py-5 text-center text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
        >
          <UserPlus className="mx-auto mb-1.5 h-5 w-5 opacity-40" aria-hidden />
          Invite collaborators to plan together
        </button>
      )}

      <InviteDialog tripId={tripId} open={inviteOpen} onOpenChange={setInviteOpen} />
    </section>
  );
}
