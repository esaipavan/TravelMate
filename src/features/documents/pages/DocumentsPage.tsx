import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Upload, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { rv, FADE_VARIANTS, LIST_VARIANTS, REDUCED_VARIANTS } from '@/lib/motion';
import { ErrorState } from '@/components/shared/ErrorState';
import {
  useDocuments,
  useUserTrips,
  useUploadDocument,
  useUpdateDocument,
  useDeleteDocument,
} from '../hooks/useDocuments';
import { DocumentDialog } from '../components/DocumentDialog';
import { VaultSkeleton } from '../components/premium/VaultSkeleton';
import { VaultEmptyState } from '../components/premium/VaultEmptyState';
import { DocumentHealthOverview } from '../components/premium/DocumentHealthOverview';
import { ExpiryTimeline } from '../components/premium/ExpiryTimeline';
import { AIDocumentInsights } from '../components/premium/AIDocumentInsights';
import { VaultUploadZone } from '../components/premium/VaultUploadZone';
import { DocumentFilterBar } from '../components/premium/DocumentFilterBar';
import { DocumentVaultCard } from '../components/premium/DocumentVaultCard';
import { DocumentGroupSection, DOC_GROUPS } from '../components/premium/DocumentGroupSection';
import {
  getExpiryStatus,
  type TravelDocumentRow,
  type DocumentFilters,
  type DocumentFormValues,
} from '../types';

const DEFAULT_FILTERS: DocumentFilters = {
  search: '',
  type: '',
  tripId: '',
  expiringSoon: false,
  sortOrder: 'newest',
};

export default function DocumentsPage() {
  const { id: tripId } = useParams<{ id?: string }>();
  const reduced = useReducedMotion();

  const { data: documents = [], isLoading, isError, refetch } = useDocuments(tripId);
  const { data: trips = [], isLoading: tripsLoading } = useUserTrips();

  const currentTrip = tripId ? trips.find((t) => t.id === tripId) : undefined;

  const uploadMutation = useUploadDocument();
  const updateMutation = useUpdateDocument();
  const deleteMutation = useDeleteDocument();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDoc, setEditDoc] = useState<TravelDocumentRow | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<TravelDocumentRow | null>(null);
  const [filters, setFilters] = useState<DocumentFilters>(DEFAULT_FILTERS);

  // ── Derived data ──────────────────────────────────────────────────────────────

  const tripMap = useMemo(() => Object.fromEntries(trips.map((t) => [t.id, t.title])), [trips]);

  const filtered = useMemo(() => {
    let result = [...documents];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          (d.country ?? '').toLowerCase().includes(q) ||
          (d.notes ?? '').toLowerCase().includes(q),
      );
    }
    if (filters.type) result = result.filter((d) => d.type === filters.type);
    if (filters.tripId) result = result.filter((d) => d.trip_id === filters.tripId);
    if (filters.expiringSoon) {
      result = result.filter((d) => {
        const s = getExpiryStatus(d.expiry_date);
        return s === 'expiring_soon' || s === 'expired';
      });
    }

    result.sort((a, b) => {
      const diff = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return filters.sortOrder === 'newest' ? diff : -diff;
    });

    return result;
  }, [documents, filters]);

  const hasActiveFilter =
    !!filters.search || !!filters.type || !!filters.tripId || filters.expiringSoon;

  const expiringSoonCount = useMemo(
    () => documents.filter((d) => getExpiryStatus(d.expiry_date) === 'expiring_soon').length,
    [documents],
  );

  const expiringDocsSorted = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const in90 = new Date(today.getTime() + 90 * 86_400_000);
    return documents
      .filter((d) => {
        if (!d.expiry_date) return false;
        const exp = new Date(d.expiry_date);
        return exp <= in90;
      })
      .sort((a, b) => new Date(a.expiry_date!).getTime() - new Date(b.expiry_date!).getTime());
  }, [documents]);

  // ── Handlers ──────────────────────────────────────────────────────────────────

  function openUpload() {
    setEditDoc(null);
    setDialogOpen(true);
  }

  function openEdit(doc: TravelDocumentRow) {
    setEditDoc(doc);
    setDialogOpen(true);
  }

  async function handleSave(values: DocumentFormValues, file?: File) {
    if (editDoc) {
      await updateMutation.mutateAsync({ id: editDoc.id, values });
    } else {
      if (!file) return;
      await uploadMutation.mutateAsync({ values, file });
    }
    setDialogOpen(false);
    setEditDoc(null);
  }

  function confirmDelete(doc: TravelDocumentRow) {
    setDeleteDoc(doc);
  }

  function executeDelete() {
    if (!deleteDoc) return;
    deleteMutation.mutate({ id: deleteDoc.id, fileUrl: deleteDoc.file_url });
    setDeleteDoc(null);
  }

  function clearFilters() {
    setFilters(DEFAULT_FILTERS);
  }

  const isSaving = uploadMutation.isPending || updateMutation.isPending;

  // ── Loading / Error ───────────────────────────────────────────────────────────

  if (isLoading) return <VaultSkeleton />;

  if (isError)
    return (
      <ErrorState
        title="Couldn't load your documents"
        message="We ran into a problem fetching your Travel Vault."
        onRetry={() => void refetch()}
      />
    );

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 pb-12">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start gap-3">
        {tripId && (tripsLoading || currentTrip) && (
          <Button variant="ghost" size="icon" className="mt-0.5 shrink-0" asChild>
            <Link to={`/trips/${tripId}`} aria-label="Back to trip">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        )}

        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Travel Vault</h1>
          <p className="truncate text-sm text-muted-foreground">
            {currentTrip
              ? currentTrip.title
              : 'Your secure document collection — passports, visas, tickets and more'}
          </p>
        </div>

        <Button
          onClick={openUpload}
          disabled={!!tripId && tripsLoading}
          className="bg-gradient-premium shrink-0 gap-1.5 text-white hover:opacity-90"
        >
          <Upload className="h-3.5 w-3.5" aria-hidden="true" />
          Upload Document
        </Button>
      </div>

      {/* ── Health overview (when docs exist) ── */}
      {documents.length > 0 && (
        <>
          <DocumentHealthOverview documents={documents} isLoaded={!isLoading} />

          {/* ── Expiry timeline ── */}
          {expiringDocsSorted.length > 0 && <ExpiryTimeline documents={expiringDocsSorted} />}

          {/* ── AI insights + upload zone ── */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <AIDocumentInsights documents={documents} />
            <VaultUploadZone onUploadClick={openUpload} />
          </div>
        </>
      )}

      {/* ── Filter bar ── */}
      <DocumentFilterBar
        filters={filters}
        onFiltersChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
        onClear={clearFilters}
        totalCount={documents.length}
        filteredCount={filtered.length}
        expiringSoonCount={expiringSoonCount}
        trips={trips}
        showTripFilter={!tripId}
      />

      {/* ── Document content area ── */}
      <AnimatePresence mode="wait">
        {documents.length === 0 ? (
          /* No documents at all */
          <motion.div
            key="empty"
            variants={rv(FADE_VARIANTS, reduced)}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            <VaultEmptyState onUploadClick={openUpload} />
          </motion.div>
        ) : hasActiveFilter ? (
          /* Filtered flat grid */
          <motion.div
            key="filtered"
            variants={rv(FADE_VARIANTS, reduced)}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border/60 py-16 text-center">
                <Search className="h-8 w-8 text-muted-foreground/40" aria-hidden="true" />
                <div>
                  <p className="font-medium text-foreground">No documents match your filters</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try adjusting or clearing them.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              </div>
            ) : (
              <motion.div
                variants={reduced ? REDUCED_VARIANTS : LIST_VARIANTS}
                initial="hidden"
                animate="show"
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {filtered.map((doc) => (
                  <DocumentVaultCard
                    key={doc.id}
                    document={doc}
                    tripTitle={doc.trip_id ? tripMap[doc.trip_id] : undefined}
                    onEdit={openEdit}
                    onDelete={confirmDelete}
                    staggered
                  />
                ))}
              </motion.div>
            )}
          </motion.div>
        ) : (
          /* Grouped view (no active filter) */
          <motion.div
            key="grouped"
            variants={rv(FADE_VARIANTS, reduced)}
            initial="hidden"
            animate="show"
            exit="exit"
            className="space-y-10"
          >
            {DOC_GROUPS.map((group) => {
              const groupDocs = documents.filter((d) => group.types.includes(d.type));
              return (
                <DocumentGroupSection
                  key={group.key}
                  label={group.label}
                  emoji={group.emoji}
                  documents={groupDocs}
                  tripMap={tripMap}
                  onEdit={openEdit}
                  onDelete={confirmDelete}
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Dialogs ── */}
      <DocumentDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditDoc(null);
        }}
        document={editDoc}
        trips={trips}
        onSave={handleSave}
        isPending={isSaving}
        defaultTripId={tripId}
      />

      <AlertDialog
        open={!!deleteDoc}
        onOpenChange={(open) => {
          if (!open) setDeleteDoc(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteDoc?.name}" will be permanently deleted from storage. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
