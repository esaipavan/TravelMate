import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { MapPin, Clock, CheckCircle2, XCircle, Loader2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { rv, FADE_VARIANTS } from '@/lib/motion';
import { useAuthStore } from '@/store/auth.store';
import {
  getInvitationByToken,
  acceptInvitation,
  declineInvitation,
} from '@/features/collaboration/services/invitation.service';
import type { InvitationDetails } from '@/features/collaboration/types';

type ActionStatus =
  | 'loading'
  | 'not_found'
  | 'ready'
  | 'already_used'
  | 'expired'
  | 'accepting'
  | 'declining'
  | 'accepted'
  | 'declined'
  | 'error';

const ROLE_LABEL: Record<string, string> = {
  editor: 'Editor — can add and edit trip content',
  viewer: 'Viewer — read-only access',
};

function StatusCard({
  icon,
  title,
  body,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      variants={rv(FADE_VARIANTS, reduced)}
      initial="hidden"
      animate="show"
      className="flex flex-col items-center gap-4 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">{icon}</div>
      <div className="space-y-1">
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">{body}</p>
      </div>
      {action}
    </motion.div>
  );
}

export default function SharePage() {
  const { id: token } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const user = useAuthStore((s) => s.user);
  const isAuthLoading = useAuthStore((s) => s.isLoading);

  const [status, setStatus] = useState<ActionStatus>('loading');
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [acceptedTripId, setAcceptedTripId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token || isAuthLoading) return;

    void (async () => {
      try {
        const inv = await getInvitationByToken(token);
        if (!inv) {
          setStatus('not_found');
          return;
        }
        setInvitation(inv);
        if (inv.status === 'accepted') {
          setStatus('already_used');
        } else if (inv.status === 'declined' || inv.status === 'expired') {
          setStatus('expired');
        } else if (new Date(inv.expiresAt) < new Date()) {
          setStatus('expired');
        } else {
          setStatus('ready');
        }
      } catch {
        setStatus('not_found');
      }
    })();
  }, [token, isAuthLoading]);

  async function handleAccept() {
    if (!token) return;
    setStatus('accepting');
    try {
      const tripId = await acceptInvitation(token);
      setAcceptedTripId(tripId);
      setStatus('accepted');
      setTimeout(() => {
        navigate(`/trips/${tripId}`);
      }, 2000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong');
      setStatus('error');
    }
  }

  async function handleDecline() {
    if (!token) return;
    setStatus('declining');
    try {
      await declineInvitation(token);
      setStatus('declined');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong');
      setStatus('error');
    }
  }

  if (status === 'loading' || isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-5">
          <Skeleton className="mx-auto h-16 w-16 rounded-2xl" />
          <Skeleton className="mx-auto h-5 w-48 rounded" />
          <Skeleton className="mx-auto h-4 w-64 rounded" />
          <Skeleton className="h-36 rounded-2xl" />
          <div className="flex gap-3">
            <Skeleton className="h-10 flex-1 rounded-lg" />
            <Skeleton className="h-10 flex-1 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (status === 'not_found') {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <StatusCard
          icon={<XCircle className="h-8 w-8 text-destructive" aria-hidden />}
          title="Invitation not found"
          body="This link may have been revoked or doesn't exist. Ask the trip organizer for a new invitation."
          action={
            <Button asChild variant="outline">
              <Link to={user ? '/trips' : '/login'}>{user ? 'My Trips' : 'Sign In'}</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (status === 'already_used' && invitation) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <StatusCard
          icon={<CheckCircle2 className="h-8 w-8 text-emerald-500" aria-hidden />}
          title="Already accepted"
          body={`You've already joined "${invitation.tripTitle}".`}
          action={
            <Button asChild>
              <Link to={`/trips/${invitation.tripId}`}>View Trip</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <StatusCard
          icon={<Clock className="h-8 w-8 text-muted-foreground" aria-hidden />}
          title="Invitation expired"
          body="This invitation is no longer valid. Ask the trip organizer to send a new one."
          action={
            <Button asChild variant="outline">
              <Link to={user ? '/trips' : '/login'}>{user ? 'My Trips' : 'Sign In'}</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (status === 'accepted' && acceptedTripId) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <StatusCard
          icon={<CheckCircle2 className="h-8 w-8 text-emerald-500" aria-hidden />}
          title="You're in!"
          body="You've joined the trip. Redirecting you now…"
          action={
            <Button asChild>
              <Link to={`/trips/${acceptedTripId}`}>Go to Trip</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (status === 'declined') {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <StatusCard
          icon={<XCircle className="h-8 w-8 text-muted-foreground" aria-hidden />}
          title="Invitation declined"
          body="You've declined the invitation. Changed your mind? Ask the organizer to send a new invite."
          action={
            <Button asChild variant="outline">
              <Link to={user ? '/trips' : '/login'}>{user ? 'My Trips' : 'Sign In'}</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <StatusCard
          icon={<XCircle className="h-8 w-8 text-destructive" aria-hidden />}
          title="Something went wrong"
          body={errorMessage}
          action={
            <Button variant="outline" onClick={() => setStatus('loading')}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  // Ready, accepting, or declining state — show invitation card
  if (!invitation) return null;

  const isProcessing = status === 'accepting' || status === 'declining';
  const expiresIn = Math.ceil((new Date(invitation.expiresAt).getTime() - Date.now()) / 86_400_000);
  const roleLabel = ROLE_LABEL[invitation.role] ?? invitation.role;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-6">
      <motion.div
        variants={rv(FADE_VARIANTS, reduced)}
        initial="hidden"
        animate="show"
        className="w-full max-w-sm space-y-6"
      >
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <MapPin className="h-8 w-8 text-primary" aria-hidden />
          </div>
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Trip Invitation
          </p>
          {invitation.invitedByName && (
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{invitation.invitedByName}</span>{' '}
              invited you to collaborate
            </p>
          )}
        </div>

        {/* Trip card */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-lifted">
          <p className="text-lg font-bold leading-tight">{invitation.tripTitle}</p>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {invitation.tripDestination}
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
              <span className="text-xs text-muted-foreground">Your role</span>
              <span className="text-xs font-semibold capitalize">{invitation.role}</span>
            </div>
            <p className="px-1 text-xs text-muted-foreground">{roleLabel}</p>
          </div>

          <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Expires in {expiresIn} day{expiresIn !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Auth gate — require sign-in before accepting */}
        {!user ? (
          <div className="space-y-3 text-center">
            <p className="text-sm text-muted-foreground">
              Sign in to accept this invitation and start collaborating.
            </p>
            <Button asChild className="w-full gap-2">
              <Link to={`/login?redirect=${encodeURIComponent(window.location.pathname)}`}>
                <LogIn className="h-4 w-4" aria-hidden />
                Sign in to accept
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="w-full">
              <Link to={`/register?redirect=${encodeURIComponent(window.location.pathname)}`}>
                Create an account
              </Link>
            </Button>
          </div>
        ) : (
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              disabled={isProcessing}
              onClick={() => void handleDecline()}
            >
              {status === 'declining' ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                'Decline'
              )}
            </Button>
            <Button className="flex-1" disabled={isProcessing} onClick={() => void handleAccept()}>
              {status === 'accepting' ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                'Accept Invitation'
              )}
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
