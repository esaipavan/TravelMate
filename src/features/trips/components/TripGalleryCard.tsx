import { memo, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Heart, MapPin, Calendar, ArrowRight, Wallet } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { rv, rg, LIST_ITEM_VARIANTS, PRESS, SPRING } from '@/lib/motion';
import { getTripStatus } from '@/utils/tripStatus';
import { resolveDestinationTheme } from '@/utils/destinationTheme';
import { formatCurrency, formatDateRange, tripDuration } from '@/utils/formatters';
import { useAuthStore } from '@/store/auth.store';
import { useWeather } from '@/features/weather/hooks/useWeather';
import { useToggleFavourite } from '../hooks/useTrips';
import { TripShareSheet } from './TripShareSheet';
import { TripQuickActionsMenu } from './TripQuickActionsMenu';
import { EditTripDialog } from './EditTripDialog';
import { DeleteTripDialog } from './DeleteTripDialog';
import type { TripRow } from '../types';
import type { ComputedTripStatus } from '@/utils/tripStatus';

/* ── Status badge config ──────────────────────────────────────── */
const STATUS_CFG: Record<ComputedTripStatus, { label: string; cls: string; dot: boolean }> = {
  active: { label: 'Live Now', cls: 'bg-emerald-500 text-white', dot: true },
  upcoming: { label: 'Upcoming', cls: 'bg-sky-500/90 text-white', dot: false },
  completed: { label: 'Completed', cls: 'bg-white/20 text-white/90', dot: false },
  cancelled: { label: 'Cancelled', cls: 'bg-rose-600/80 text-white', dot: false },
};

/* ── WMO → emoji ──────────────────────────────────────────────── */
function wmoEmoji(code: number): string {
  if (code === 0) return '☀️';
  if (code <= 2) return '🌤️';
  if (code <= 3) return '⛅';
  if (code <= 48) return '🌫️';
  if (code <= 57) return '🌦️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '❄️';
  return '⛈️';
}

/* ── Smart hover preview ──────────────────────────────────────── */
const TRAVEL_TIPS = [
  'Pack light — you can always buy what you forgot.',
  'Download offline maps before you leave.',
  'Keep a photo of your passport in the cloud.',
  'Set a daily budget to avoid overspending.',
  "Try one local restaurant that isn't on TripAdvisor.",
  'Join local Facebook groups for hidden gems.',
  'Always carry a small amount of local cash.',
];

interface PreviewProps {
  trip: TripRow;
  status: ComputedTripStatus;
  daysAway: number;
  daysLeft: number;
  temp?: number;
  wmoCode?: number;
  reduced: boolean | null;
}

function SmartPreview({ trip, status, daysAway, daysLeft, temp, wmoCode, reduced }: PreviewProps) {
  const tip = TRAVEL_TIPS[new Date().getDay() % TRAVEL_TIPS.length];

  return (
    <motion.div
      className="bg-black/88 absolute inset-x-0 bottom-0 z-30 rounded-b-3xl p-4 backdrop-blur-sm"
      initial={reduced ? {} : { y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={reduced ? {} : { y: '100%', opacity: 0 }}
      transition={reduced ? {} : { type: 'spring', damping: 28, stiffness: 360 }}
    >
      <div className="mb-3 grid grid-cols-2 gap-3">
        {/* Weather */}
        {temp !== undefined && wmoCode !== undefined ? (
          <div className="flex items-center gap-2">
            <span className="text-xl leading-none" aria-hidden="true">
              {wmoEmoji(wmoCode)}
            </span>
            <div>
              <div className="text-sm font-bold text-white">{Math.round(temp)}°C</div>
              <div className="truncate text-[10px] text-white/50">
                {trip.destination.split(',')[0]}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xl leading-none" aria-hidden="true">
              🗺️
            </span>
            <div>
              <div className="text-sm font-semibold text-white/80">
                {trip.destination.split(',')[0]}
              </div>
              <div className="text-[10px] text-white/50">Destination</div>
            </div>
          </div>
        )}

        {/* Status timing */}
        <div>
          <div className="text-sm font-bold text-white">
            {status === 'active'
              ? `${daysLeft}d left`
              : status === 'upcoming'
                ? `${daysAway}d until go`
                : status === 'completed'
                  ? 'Completed ✓'
                  : 'Cancelled'}
          </div>
          <div className="text-[10px] text-white/50">
            {tripDuration(trip.start_date, trip.end_date)} day trip
          </div>
        </div>
      </div>

      {/* Budget */}
      {trip.total_budget && (
        <div className="bg-white/8 mb-3 flex items-center gap-2 rounded-xl px-3 py-2">
          <Wallet className="h-3.5 w-3.5 shrink-0 text-white/60" aria-hidden="true" />
          <span className="text-xs text-white/80">
            Budget:{' '}
            <span className="font-semibold text-white">
              {formatCurrency(trip.total_budget, trip.currency)}
            </span>
          </span>
        </div>
      )}

      {/* Tip */}
      <p className="text-[11px] leading-relaxed text-white/55">💡 {tip}</p>
    </motion.div>
  );
}

/* ── Main card ────────────────────────────────────────────────── */
interface Props {
  trip: TripRow;
  index: number;
}

export const TripGalleryCard = memo(function TripGalleryCard({ trip, index: _index }: Props) {
  const reduced = useReducedMotion();
  const user = useAuthStore((s) => s.user);

  /* Modals */
  const [shareOpen, setShareOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  /* Image loading */
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  /* Hover — lazy-load weather */
  const [hovered, setHovered] = useState(false);
  const { data: weather } = useWeather(hovered ? trip.destination : '');

  /* Favourite */
  const { mutate: toggleFav, isPending: favPending } = useToggleFavourite();

  /* Computed values */
  const theme = useMemo(() => resolveDestinationTheme(trip.destination), [trip.destination]);
  const status = useMemo(() => getTripStatus(trip), [trip]);
  const imageUrl = trip.cover_image_url ?? theme.imageUrl;

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const startDate = useMemo(() => parseISO(trip.start_date + 'T00:00:00'), [trip.start_date]);
  const endDate = useMemo(() => parseISO(trip.end_date + 'T00:00:00'), [trip.end_date]);
  const daysAway = Math.max(0, differenceInDays(startDate, today));
  const daysLeft = Math.max(0, differenceInDays(endDate, today));
  const totalDays = Math.max(1, differenceInDays(endDate, startDate) + 1);
  const elapsed = Math.max(0, differenceInDays(today, startDate));
  const progress = status === 'active' ? Math.min(1, elapsed / totalDays) : 0;

  const cfg = STATUS_CFG[status];

  /* User initials fallback */
  const ownerInitial = user?.email?.charAt(0).toUpperCase() ?? '?';

  function handleFavClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!favPending) {
      toggleFav({ id: trip.id, isFavourite: !trip.is_favourite });
    }
  }

  return (
    <>
      <motion.article
        variants={rv(LIST_ITEM_VARIANTS, reduced)}
        className="group relative"
        aria-label={trip.title}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
      >
        <motion.div
          layoutId={!reduced ? `tm-trip-${trip.id}` : undefined}
          className="relative h-[360px] overflow-hidden rounded-3xl bg-muted"
          whileHover={rg({ y: -5, scale: 1.005 }, reduced)}
          whileTap={rg(PRESS.subtle, reduced)}
          transition={SPRING.normal}
        >
          {/* ── Background image ─────────────────────────────────── */}
          {!imgError ? (
            <motion.img
              src={imageUrl}
              alt={trip.destination}
              className={cn(
                'absolute inset-0 h-full w-full object-cover transition-all duration-700',
                imgLoaded ? 'opacity-100' : 'opacity-0',
              )}
              whileHover={rg({ scale: 1.06 }, reduced)}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${theme.accent}55 0%, ${theme.secondary}33 100%)`,
              }}
              aria-hidden="true"
            />
          )}
          {!imgLoaded && !imgError && (
            <div className="absolute inset-0 animate-pulse bg-muted/80" aria-hidden="true" />
          )}

          {/* ── Gradient overlays ─────────────────────────────────── */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-36"
            style={{
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, transparent 100%)',
            }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-56"
            style={{
              background:
                'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 55%, transparent 100%)',
            }}
            aria-hidden="true"
          />

          {/* ── Full-card transparent nav link (image area) ────────── */}
          <Link
            to={`/trips/${trip.id}`}
            className="absolute inset-0 z-[1]"
            aria-hidden="true"
            tabIndex={-1}
          />

          {/* ── Top strip: status + actions ───────────────────────── */}
          <div className="absolute left-3 right-3 top-3 z-10 flex items-start justify-between">
            {/* Status badge */}
            <div
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold',
                cfg.cls,
              )}
            >
              {cfg.dot && (
                <span
                  className="h-1.5 w-1.5 animate-pulse rounded-full bg-white"
                  aria-hidden="true"
                />
              )}
              {cfg.label}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5">
              {/* Favourite */}
              <button
                type="button"
                onClick={handleFavClick}
                disabled={favPending}
                aria-label={trip.is_favourite ? 'Remove from saved' : 'Save trip'}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full',
                  'bg-black/40 backdrop-blur-sm',
                  'transition-colors hover:bg-black/60',
                  'outline-none focus-visible:ring-2 focus-visible:ring-white/60',
                )}
              >
                <Heart
                  className={cn(
                    'h-4 w-4 transition-colors',
                    trip.is_favourite ? 'fill-rose-500 text-rose-500' : 'text-white',
                  )}
                  aria-hidden="true"
                />
              </button>

              {/* Quick actions */}
              <TripQuickActionsMenu
                trip={trip}
                onEdit={() => setEditOpen(true)}
                onShare={() => setShareOpen(true)}
                onDelete={() => setDeleteOpen(true)}
              />
            </div>
          </div>

          {/* ── Bottom content ─────────────────────────────────────── */}
          <div className="absolute bottom-0 left-0 right-0 z-10 p-4 pb-5">
            {/* Destination */}
            <div className="mb-1 flex items-center gap-1 text-[11px] font-medium text-white/60">
              <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="truncate uppercase tracking-wide">
                {trip.destination.split(',')[0]}
              </span>
            </div>

            {/* Title */}
            <h3 className="mb-2 truncate text-xl font-bold leading-tight text-white">
              {trip.title}
            </h3>

            {/* Dates + countdown */}
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs text-white/60">
                <Calendar className="h-3 w-3 shrink-0" aria-hidden="true" />
                <span>{formatDateRange(trip.start_date, trip.end_date)}</span>
              </div>
              <span
                className={cn(
                  'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums',
                  status === 'active' && 'bg-emerald-500/25 text-emerald-300',
                  status === 'upcoming' && 'bg-sky-500/25 text-sky-300',
                  status === 'completed' && 'bg-white/10 text-white/50',
                  status === 'cancelled' && 'bg-rose-500/25 text-rose-300',
                )}
              >
                {status === 'active'
                  ? `${daysLeft}d left`
                  : status === 'upcoming'
                    ? `${daysAway}d away`
                    : status === 'completed'
                      ? `${totalDays}d trip`
                      : 'Cancelled'}
              </span>
            </div>

            {/* Progress bar (active trips only) */}
            {status === 'active' && (
              <div
                className="mb-3"
                role="progressbar"
                aria-valuenow={Math.round(progress * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Trip progress"
              >
                <div className="h-1 w-full overflow-hidden rounded-full bg-white/15">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: theme.accent }}
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                  />
                </div>
                <p className="mt-1 text-right text-[10px] tabular-nums text-white/40">
                  {Math.round(progress * 100)}% complete
                </p>
              </div>
            )}

            {/* Budget */}
            {trip.total_budget && (
              <div className="mb-3 flex items-center gap-1.5 text-xs text-white/55">
                <Wallet className="h-3 w-3 shrink-0" aria-hidden="true" />
                <span>{formatCurrency(trip.total_budget, trip.currency)}</span>
              </div>
            )}

            {/* Bottom row: owner + open CTA */}
            <div className="flex items-center justify-between">
              {/* Owner avatar */}
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-[11px] font-bold text-white ring-2 ring-white/20 backdrop-blur-sm"
                aria-label={`Owner: ${user?.email ?? 'You'}`}
                title={user?.email ?? 'You'}
              >
                {ownerInitial}
              </div>

              {/* Open CTA */}
              <Link
                to={`/trips/${trip.id}`}
                className={cn(
                  'flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold',
                  'border border-white/20 bg-white/15 text-white backdrop-blur-sm',
                  'transition-colors hover:bg-white/25',
                  'outline-none focus-visible:ring-2 focus-visible:ring-white/60',
                )}
                aria-label={`Open trip: ${trip.title}`}
              >
                View trip
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* ── Smart hover preview ───────────────────────────────── */}
          <AnimatePresence>
            {hovered && (
              <SmartPreview
                trip={trip}
                status={status}
                daysAway={daysAway}
                daysLeft={daysLeft}
                temp={weather?.current.temperature}
                wmoCode={weather?.current.weathercode}
                reduced={reduced}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </motion.article>

      {/* ── Modals ────────────────────────────────────────────────── */}
      <TripShareSheet trip={trip} open={shareOpen} onOpenChange={setShareOpen} />
      <EditTripDialog trip={trip} open={editOpen} onOpenChange={setEditOpen} />
      <DeleteTripDialog
        tripId={trip.id}
        tripTitle={trip.title}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
});
