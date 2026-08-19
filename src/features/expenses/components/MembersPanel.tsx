import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Crown, Pencil, Eye, Copy, Mail, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { rv, LIST_VARIANTS, LIST_ITEM_VARIANTS, FADE_VARIANTS } from '@/lib/motion';
import type { TripMember, MemberRole } from '../utils/settlement';

type RoleIcon = typeof Crown;

const ROLE_META: Record<MemberRole, { label: string; icon: RoleIcon; color: string }> = {
  owner: { label: 'Owner', icon: Crown, color: 'text-amber-500' },
  editor: { label: 'Editor', icon: Pencil, color: 'text-blue-500' },
  viewer: { label: 'Viewer', icon: Eye, color: 'text-muted-foreground' },
};

interface Props {
  tripId: string;
  members: TripMember[];
}

export function MembersPanel({ tripId, members }: Props) {
  const reduced = useReducedMotion();

  function handleCopyLink() {
    void navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        toast.success('Link copied!', { description: 'Share it so others can view this trip.' });
      })
      .catch(() => {
        toast.error('Could not copy link', {
          description: 'Try copying the URL from the address bar.',
        });
      });
  }

  return (
    <div className="space-y-6">
      {/* Member list */}
      <motion.div
        className="space-y-2"
        variants={rv(LIST_VARIANTS, reduced)}
        initial="hidden"
        animate="show"
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">
            {members.length} member{members.length !== 1 ? 's' : ''}
          </p>
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs" asChild>
            <Link to={`/trips/${tripId}`}>
              <Settings className="h-3.5 w-3.5" aria-hidden="true" />
              Manage members
            </Link>
          </Button>
        </div>

        {members.map((member) => {
          const roleMeta = ROLE_META[member.role];
          const RoleIcon = roleMeta.icon;
          return (
            <motion.div
              key={member.id}
              variants={rv(LIST_ITEM_VARIANTS, reduced)}
              className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4"
            >
              {/* Avatar */}
              {member.avatarUrl ? (
                <img
                  src={member.avatarUrl}
                  alt={member.name}
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {member.initials}
                </div>
              )}

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-foreground">{member.name}</p>
                  {member.isOwner && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                      <Crown className="h-2.5 w-2.5" aria-hidden="true" />
                      You
                    </span>
                  )}
                </div>
                {member.email && (
                  <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                )}
              </div>

              {/* Role — read-only here; changed from the trip's Members section */}
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border/60 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                <RoleIcon className={`h-3 w-3 ${roleMeta.color}`} aria-hidden="true" />
                {roleMeta.label}
              </span>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Invite options */}
      <motion.div
        variants={rv(FADE_VARIANTS, reduced)}
        initial="hidden"
        animate="show"
        className="space-y-3 rounded-2xl border border-dashed border-border/60 p-5"
      >
        <div>
          <h3 className="text-sm font-semibold text-foreground">Invite options</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Share a link to this trip or send an email invite so travel companions can join.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={handleCopyLink}>
            <Copy className="h-4 w-4" aria-hidden="true" />
            Copy link
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
            onClick={() => {
              const subject = encodeURIComponent('Join my trip!');
              const body = encodeURIComponent(
                `Hi!\n\nI'd like to share this trip with you.\n\nView it here: ${window.location.href}`,
              );
              window.location.href = `mailto:?subject=${subject}&body=${body}`;
            }}
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            Email invite
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
