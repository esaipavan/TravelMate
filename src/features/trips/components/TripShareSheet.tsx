import { useCallback, useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { toast } from 'sonner';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Link2,
  Globe,
  Lock,
  Users,
  Copy,
  Check,
  MessageCircle,
  Mail,
  QrCode,
  X,
  Download,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useUpdateTrip } from '../hooks/useTrips';
import { InviteDialog } from '@/features/collaboration/components/InviteDialog';
import type { TripRow } from '../types';

interface Props {
  trip: TripRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Visibility = 'private' | 'public';

const VISIBILITY_OPTIONS: Array<{
  value: Visibility;
  label: string;
  desc: string;
  icon: typeof Lock;
}> = [
  { value: 'private', label: 'Private', desc: 'Only you can see this trip', icon: Lock },
  { value: 'public', label: 'Public', desc: 'Anyone with the link can view', icon: Globe },
];

export function TripShareSheet({ trip, open, onOpenChange }: Props) {
  const shareUrl = `${window.location.origin}/share/${trip.id}`;

  const { mutate: updateTrip, isPending } = useUpdateTrip();
  const [visibility, setVisibility] = useState<Visibility>(trip.is_public ? 'public' : 'private');
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  const renderQr = useCallback(() => {
    const canvas = qrCanvasRef.current;
    if (!canvas) return;
    void QRCode.toCanvas(canvas, shareUrl, {
      width: 256,
      margin: 2,
      color: { dark: '#0f172a', light: '#f8fafc' },
    });
  }, [shareUrl]);

  useEffect(() => {
    if (showQr) {
      const id = requestAnimationFrame(renderQr);
      return () => cancelAnimationFrame(id);
    }
  }, [showQr, renderQr]);

  function handleVisibility(v: Visibility) {
    setVisibility(v);
    updateTrip({ id: trip.id, data: { is_public: v === 'public' } });
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy — try manually selecting the URL.');
    }
  }

  function shareWhatsApp() {
    const text = encodeURIComponent(
      `✈️ Check out my trip: *${trip.title}* to ${trip.destination}!\n${shareUrl}`,
    );
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  }

  function shareEmail() {
    const subject = encodeURIComponent(`${trip.title} — Travel Plans`);
    const body = encodeURIComponent(
      `Hi!\n\nI wanted to share my travel plans with you.\n\n${trip.title}\n${trip.destination}\n\nView here: ${shareUrl}`,
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  function downloadQr() {
    const canvas = qrCanvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${trip.title.replace(/\s+/g, '-')}-qr.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast.success('QR code downloaded!');
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 overflow-hidden rounded-3xl p-0">
        {/* Header */}
        <DialogHeader className="px-6 pb-0 pt-6">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">Share Trip</DialogTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1 border-b border-border/50 pb-5 text-sm text-muted-foreground">
            {trip.title}
          </p>
        </DialogHeader>

        <div className="space-y-6 px-6 py-5">
          {/* Visibility selector */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Who can view
            </p>
            <div className="grid grid-cols-2 gap-2">
              {VISIBILITY_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const active = visibility === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleVisibility(opt.value)}
                    disabled={isPending}
                    className={cn(
                      'flex flex-col items-start gap-1 rounded-2xl border p-3.5 text-left outline-none transition-all duration-150',
                      'focus-visible:ring-2 focus-visible:ring-primary',
                      active
                        ? 'border-primary bg-primary/5'
                        : 'border-border/50 bg-muted/30 hover:bg-muted/60',
                    )}
                    aria-pressed={active}
                    aria-label={opt.label}
                  >
                    <Icon
                      className={cn('h-4 w-4', active ? 'text-primary' : 'text-muted-foreground')}
                      aria-hidden="true"
                    />
                    <span
                      className={cn(
                        'text-xs font-semibold',
                        active ? 'text-primary' : 'text-foreground',
                      )}
                    >
                      {opt.label}
                    </span>
                    <span className="text-[10px] leading-snug text-muted-foreground">
                      {opt.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Share link */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Share link
            </p>
            <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/30 px-3 py-2.5">
              <Link2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span
                className="flex-1 truncate font-mono text-xs text-muted-foreground"
                aria-label="Share URL"
              >
                {shareUrl}
              </span>
              <button
                type="button"
                onClick={() => void copyLink()}
                className="shrink-0 rounded-lg bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                aria-label="Copy link"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* Share buttons */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Share via
            </p>
            <div className="grid grid-cols-3 gap-2">
              <ShareButton
                icon={MessageCircle}
                label="WhatsApp"
                onClick={shareWhatsApp}
                color="text-emerald-500"
                bg="bg-emerald-500/10"
              />
              <ShareButton
                icon={Mail}
                label="Email"
                onClick={shareEmail}
                color="text-blue-500"
                bg="bg-blue-500/10"
              />
              <ShareButton
                icon={QrCode}
                label="QR Code"
                onClick={() => setShowQr((v) => !v)}
                color="text-violet-500"
                bg="bg-violet-500/10"
              />
            </div>
          </div>

          {/* QR code panel */}
          {showQr && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center gap-3 rounded-2xl border border-violet-500/30 bg-violet-500/5 p-5"
            >
              <p className="text-xs font-semibold text-muted-foreground">Scan to open this trip</p>
              <canvas ref={qrCanvasRef} className="rounded-xl" />
              <button
                type="button"
                onClick={downloadQr}
                className="flex items-center gap-1.5 rounded-lg bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-600 transition-colors hover:bg-violet-500/20 dark:text-violet-400"
              >
                <Download className="h-3 w-3" aria-hidden="true" />
                Download QR
              </button>
            </motion.div>
          )}

          {/* Invite members */}
          <button
            type="button"
            onClick={() => setShowInvite(true)}
            className="w-full rounded-2xl border border-dashed border-border/60 bg-muted/20 p-4 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div className="mb-1 flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm font-medium text-foreground">Invite Members</span>
              <span className="ml-auto text-xs font-medium text-primary">Invite →</span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Invite collaborators to co-plan, share expenses, and edit the itinerary together.
            </p>
          </button>
        </div>
      </DialogContent>

      <InviteDialog tripId={trip.id} open={showInvite} onOpenChange={setShowInvite} />
    </Dialog>
  );
}

interface ShareButtonProps {
  icon: typeof MessageCircle;
  label: string;
  onClick: () => void;
  color: string;
  bg: string;
}

function ShareButton({ icon: Icon, label, onClick, color, bg }: ShareButtonProps) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={prefersReducedMotion ? {} : { scale: 0.94 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className="flex flex-col items-center gap-1.5 rounded-2xl border border-border/50 bg-muted/30 py-3 outline-none transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={label}
    >
      <div className={cn('flex h-8 w-8 items-center justify-center rounded-xl', bg)}>
        <Icon className={cn('h-4 w-4', color)} aria-hidden="true" />
      </div>
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
    </motion.button>
  );
}
