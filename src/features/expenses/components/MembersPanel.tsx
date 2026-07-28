import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { UserPlus, Crown, Pencil, Eye, Trash2, Copy, Mail } from 'lucide-react';
import { toast } from 'sonner';
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
import { rv, LIST_VARIANTS, LIST_ITEM_VARIANTS, FADE_VARIANTS } from '@/lib/motion';
import type { TripMember, MemberRole } from '../utils/settlement';

type RoleIcon = typeof Crown;

const ROLE_META: Record<MemberRole, { label: string; icon: RoleIcon; color: string }> = {
  owner: { label: 'Owner', icon: Crown, color: 'text-amber-500' },
  editor: { label: 'Editor', icon: Pencil, color: 'text-blue-500' },
  viewer: { label: 'Viewer', icon: Eye, color: 'text-muted-foreground' },
};

interface Props {
  members: TripMember[];
  onAdd: (name: string, email?: string) => void;
  onRemove: (id: string) => void;
  onUpdateRole: (id: string, role: MemberRole) => void;
}

export function MembersPanel({ members, onAdd, onRemove, onUpdateRole }: Props) {
  const reduced = useReducedMotion();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Name is required');
      return;
    }
    if (members.some((m) => m.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('A member with this name already exists');
      return;
    }
    onAdd(trimmed, email.trim());
    setName('');
    setEmail('');
    setError('');
    toast.success(`${trimmed} added to the group`);
  }

  function handleCopyLink() {
    void navigator.clipboard.writeText(window.location.href);
    toast.info('Link copied — invite links available in Phase 18');
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

              {/* Role + actions */}
              {member.isOwner ? (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border/60 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  <RoleIcon className={`h-3 w-3 ${roleMeta.color}`} aria-hidden="true" />
                  {roleMeta.label}
                </span>
              ) : (
                <div className="flex shrink-0 items-center gap-2">
                  <Select
                    value={member.role}
                    onValueChange={(v) => onUpdateRole(member.id, v as MemberRole)}
                  >
                    <SelectTrigger className="h-8 w-24 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => onRemove(member.id)}
                    aria-label={`Remove ${member.name}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Add member form */}
      <motion.div
        variants={rv(FADE_VARIANTS, reduced)}
        initial="hidden"
        animate="show"
        className="space-y-4 rounded-2xl border border-border/60 bg-card p-5"
      >
        <h3 className="text-sm font-semibold text-foreground">Add a travel companion</h3>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="member-name">Name</Label>
            <Input
              id="member-name"
              placeholder="e.g. Rahul"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAdd();
                }
              }}
              aria-describedby={error ? 'member-name-error' : undefined}
            />
            {error && (
              <p id="member-name-error" className="text-xs text-destructive">
                {error}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="member-email">
              Email <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="member-email"
              type="email"
              placeholder="e.g. rahul@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Button className="w-full" onClick={handleAdd} disabled={!name.trim()}>
            <UserPlus className="mr-2 h-4 w-4" aria-hidden="true" />
            Add to group
          </Button>
        </div>
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
            Real-time collaboration arrives in Phase 18 — members will be able to view and add
            expenses together.
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
            onClick={() => toast.info('Email invites available in Phase 18')}
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            Email invite
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
