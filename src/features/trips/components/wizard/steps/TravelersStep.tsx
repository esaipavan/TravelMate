import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Mail, X, UserPlus, MessageCircle, Link2, Crown, Eye, Pencil, Users } from 'lucide-react';
import { toast } from 'sonner';
import { rv, FADE_VARIANTS, LIST_VARIANTS, LIST_ITEM_VARIANTS, CARD_VARIANTS } from '@/lib/motion';
import { initials } from '@/utils/formatters';
import { useAuthStore } from '@/store/auth.store';
import { useWizard } from '../WizardContext';

/* ── Role badge ──────────────────────────────────────────────────── */

function RoleBadge({ role }: { role: 'Owner' | 'Editor' | 'Viewer' }) {
  const map: Record<string, { icon: typeof Crown; cls: string }> = {
    Owner: { icon: Crown, cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
    Editor: { icon: Pencil, cls: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
    Viewer: { icon: Eye, cls: 'bg-muted text-muted-foreground' },
  };
  const { icon: Icon, cls } = map[role];
  return (
    <span
      className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${cls}`}
    >
      <Icon className="h-2.5 w-2.5" aria-hidden="true" />
      {role}
    </span>
  );
}

/* ── Traveler row ────────────────────────────────────────────────── */

function TravelerRow({
  email,
  role,
  onRemove,
  reduced,
}: {
  email: string;
  role: 'Owner' | 'Editor' | 'Viewer';
  onRemove: ((e: string) => void) | null;
  reduced: boolean | null;
}) {
  const name = email.split('@')[0]?.replace(/[._-]/g, ' ') ?? email;

  return (
    <motion.div
      variants={rv(LIST_ITEM_VARIANTS, reduced)}
      className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3"
    >
      {/* Avatar */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
        {initials(name)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold capitalize text-foreground">{name}</p>
        <p className="truncate text-xs text-muted-foreground">{email}</p>
      </div>
      <RoleBadge role={role} />
      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(email)}
          aria-label={`Remove ${email}`}
          className="ml-1 rounded-full p-1 text-muted-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </motion.div>
  );
}

/* ── Step ────────────────────────────────────────────────────────── */

export function TravelersStep() {
  const reduced = useReducedMotion();
  const { state, dispatch } = useWizard();
  const user = useAuthStore((s) => s.user);

  const [emailInput, setEmailInput] = useState('');
  const [emailError, setEmailError] = useState('');

  const ownerEmail = user?.email ?? 'you@example.com';

  function validateAndAdd() {
    const email = emailInput.trim().toLowerCase();
    if (!email) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Enter a valid email address');
      return;
    }
    if (email === ownerEmail.toLowerCase()) {
      setEmailError("That's you — you're already the owner");
      return;
    }
    if (state.inviteEmails.includes(email)) {
      setEmailError('Already added');
      return;
    }
    dispatch({ type: 'ADD_EMAIL', email });
    setEmailInput('');
    setEmailError('');
    toast.success(`${email} added to trip`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      validateAndAdd();
    }
  }

  function handleRemove(email: string) {
    dispatch({ type: 'REMOVE_EMAIL', email });
  }

  function handleWhatsApp() {
    toast.info('Share link will be available after the trip is created.');
  }

  function handleCopyLink() {
    toast.info('Share link will be generated after the trip is created.');
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <motion.p
          className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary"
          variants={rv(FADE_VARIANTS, reduced)}
          initial="hidden"
          animate="show"
        >
          Step 5 of 7
        </motion.p>
        <motion.h1
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          variants={rv(FADE_VARIANTS, reduced)}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.05 }}
        >
          Who's joining?
        </motion.h1>
        <motion.p
          className="mt-2 text-base text-muted-foreground"
          variants={rv(FADE_VARIANTS, reduced)}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.1 }}
        >
          Invite travel companions. You can always add more after the trip is created.
        </motion.p>
      </div>

      {/* Current travelers */}
      <motion.div
        className="space-y-2"
        variants={rv(LIST_VARIANTS, reduced)}
        initial="hidden"
        animate="show"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Travelers ({state.inviteEmails.length + 1})
        </p>

        {/* Owner */}
        <TravelerRow email={ownerEmail} role="Owner" onRemove={null} reduced={reduced} />

        {/* Invited */}
        <AnimatePresence>
          {state.inviteEmails.map((email) => (
            <TravelerRow
              key={email}
              email={email}
              role="Editor"
              onRemove={handleRemove}
              reduced={reduced}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Add by email */}
      <motion.div
        variants={rv(CARD_VARIANTS, reduced)}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.15 }}
        className="space-y-3 rounded-3xl border border-border/60 bg-card p-5 shadow-sm"
      >
        <p className="text-sm font-semibold text-foreground">Invite by email</p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Mail
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="email"
              value={emailInput}
              onChange={(e) => {
                setEmailInput(e.target.value);
                setEmailError('');
              }}
              onKeyDown={handleKeyDown}
              placeholder="friend@example.com"
              aria-label="Invite email address"
              className={[
                'w-full rounded-xl border bg-background py-2.5 pl-9 pr-3 text-sm',
                'placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2',
                emailError
                  ? 'border-destructive focus:ring-destructive/20'
                  : 'border-border focus:border-primary focus:ring-primary/20',
              ].join(' ')}
            />
          </div>
          <button
            type="button"
            onClick={validateAndAdd}
            aria-label="Add traveler"
            className={[
              'flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white',
              'transition-colors hover:bg-primary/90',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            ].join(' ')}
          >
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Add
          </button>
        </div>
        {emailError && (
          <p className="text-xs text-destructive" role="alert">
            {emailError}
          </p>
        )}

        {/* Share buttons */}
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={handleWhatsApp}
            className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <MessageCircle className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
            WhatsApp
          </button>
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Link2 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            Copy Link
          </button>
        </div>
      </motion.div>

      {/* Collaboration roles legend */}
      <motion.div
        variants={rv(CARD_VARIANTS, reduced)}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.2 }}
        className="space-y-3 rounded-3xl border border-border/60 bg-card p-5 shadow-sm"
      >
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" aria-hidden="true" />
          <p className="text-sm font-semibold text-foreground">Collaboration Roles</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {(
            [
              ['Owner', 'Full control, can delete', Crown],
              ['Editor', 'Add & edit content', Pencil],
              ['Viewer', 'View-only access', Eye],
            ] as const
          ).map(([role, desc, Icon]) => (
            <div key={role} className="rounded-xl bg-muted/50 p-3">
              <Icon className="mx-auto mb-1.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <p className="text-xs font-bold text-foreground">{role}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Each traveller's role determines what they can see and edit on the shared trip.
        </p>
      </motion.div>
    </div>
  );
}
