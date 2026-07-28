import { useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { Pencil, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { TripDetailHero } from '../components/TripDetailHero';
import { TripDetailSkeleton } from '../components/TripDetailSkeleton';
import { TripStatsRow } from '../components/TripStatsRow';
import { TripBudgetCard } from '../components/TripBudgetCard';
import { TripNotesCard } from '../components/TripNotesCard';
import { TripSubNavGrid } from '../components/TripSubNavGrid';
import { TripAIPanel } from '../components/TripAIPanel';
import { EditTripDialog } from '../components/EditTripDialog';
import { DeleteTripDialog } from '../components/DeleteTripDialog';
import { useTrip, useToggleFavourite } from '../hooks/useTrips';
import { rv, PAGE_VARIANTS } from '@/lib/motion';

/* ── Section entrance wrapper ─────────────────────────────────── */
function Section({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? {} : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-48px' }}
      transition={reduced ? { duration: 0 } : { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ── TripDetailPage ───────────────────────────────────────────── */
export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: trip, isLoading, isError } = useTrip(id!);
  const { mutate: toggleFav, isPending: isFavPending } = useToggleFavourite();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const reduced = useReducedMotion();

  /* ── Loading ── */
  if (isLoading) return <TripDetailSkeleton />;

  /* ── Error / not found ── */
  if (isError || !trip) return <Navigate to="/trips" replace />;

  function handleFavToggle() {
    toggleFav(
      { id: trip!.id, isFavourite: !trip!.is_favourite },
      {
        onSuccess: () =>
          toast.success(trip!.is_favourite ? 'Removed from favourites' : 'Added to favourites'),
        onError: () => toast.error('Failed to update favourite'),
      },
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        className="pb-28"
        variants={rv(PAGE_VARIANTS, reduced)}
        initial="hidden"
        animate="show"
      >
        {/* ── Cinematic hero (full-bleed) ── */}
        <TripDetailHero
          trip={trip}
          onEdit={() => setEditOpen(true)}
          onDelete={() => setDeleteOpen(true)}
          onFavToggle={handleFavToggle}
          isFavPending={isFavPending}
        />

        {/* ── Content sections ── */}
        <div className="mt-5 space-y-5">
          {/* Stats chips row */}
          <Section delay={0.05}>
            <TripStatsRow trip={trip} />
          </Section>

          {/* Budget + Notes/Map row */}
          <Section delay={0.1}>
            <div className="grid gap-4 sm:grid-cols-2">
              <TripBudgetCard trip={trip} />
              <TripNotesCard trip={trip} />
            </div>
          </Section>

          {/* Sub-feature navigation grid */}
          <Section delay={0.14}>
            <TripSubNavGrid tripId={trip.id} />
          </Section>

          {/* AI Recommendations */}
          <Section delay={0.18}>
            <TripAIPanel trip={trip} />
          </Section>
        </div>

        {/* ── Floating edit FAB ── */}
        <motion.div
          className="fixed bottom-28 right-4 z-40 lg:bottom-6 lg:right-6"
          initial={reduced ? {} : { scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring', damping: 16, stiffness: 220 }}
        >
          <div className="flex flex-col items-end gap-2">
            {/* New expense shortcut */}
            <motion.div
              initial={reduced ? {} : { scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.62, type: 'spring', damping: 18, stiffness: 220 }}
            >
              <Link
                to={`/trips/${trip.id}/expenses`}
                aria-label="Add expense"
                className="flex h-10 items-center gap-2 rounded-full border border-border/60 bg-card px-3 text-sm font-medium text-foreground shadow-float transition-shadow hover:shadow-card"
              >
                <Plus className="h-4 w-4 shrink-0 text-primary" />
                <span className="hidden sm:inline">Add expense</span>
              </Link>
            </motion.div>

            {/* Primary edit FAB */}
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              aria-label="Edit trip"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-brand text-white shadow-glow transition-shadow hover:shadow-[0_12px_36px_-8px_rgba(99,102,241,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <Pencil className="h-5 w-5" />
            </button>
          </div>
        </motion.div>

        {/* ── Dialogs ── */}
        <EditTripDialog trip={trip} open={editOpen} onOpenChange={setEditOpen} />
        <DeleteTripDialog
          tripId={trip.id}
          tripTitle={trip.title}
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
        />
      </motion.div>
    </AnimatePresence>
  );
}
