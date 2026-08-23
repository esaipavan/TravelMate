import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { selectTripCoverImage } from '@/services/place-image/placeImage.service';
import { useAuthStore } from '@/store/auth.store';
import { useBatchUpsertBudgetsMutation } from '@/features/budget/hooks/useBudget';
import { useCreateTrip } from '../hooks/useTrips';
import {
  WizardProvider,
  useWizard,
  generateTripTitle,
  resolveTotalBudget,
  resolveBudgetBreakdown,
} from '../components/wizard/WizardContext';
import { WizardShell } from '../components/wizard/WizardShell';

/* ── Inner component (has access to WizardContext) ───────────────── */

function WizardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { mutateAsync, isPending } = useCreateTrip();
  const { mutateAsync: upsertBudgets, isPending: isBudgetPending } =
    useBatchUpsertBudgetsMutation();
  const { state } = useWizard();

  async function handleSubmit() {
    if (!user) return;

    const { destination, destinationMeta, tripType, startDate, endDate, budget, currency } = state;

    const total = resolveTotalBudget(budget);
    const breakdown = resolveBudgetBreakdown(budget);

    /* Select cover: curated → real Wikipedia image → null (never a guess) */
    const coverUrl = await selectTripCoverImage(destination);

    /* Build title from destination + trip type */
    const title = generateTripTitle(destination, tripType);

    /* Format dates — already YYYY-MM-DD strings from the calendar */
    const startFormatted = startDate || format(new Date(), 'yyyy-MM-dd');
    const endFormatted = endDate || format(new Date(), 'yyyy-MM-dd');

    try {
      const trip = await mutateAsync({
        user_id: user.id,
        title,
        destination,
        country_code: destinationMeta?.countryCode ?? null,
        cover_image_url: coverUrl,
        start_date: startFormatted,
        end_date: endFormatted,
        total_budget: total,
        currency,
        status: 'planning',
        notes: null,
        is_public: false,
      });

      /* Trip exists now — persist the optional category breakdown, if any.
       * A failure here must not undo or block the trip that already exists;
       * surface it as a non-blocking warning instead. */
      if (Object.keys(breakdown).length > 0) {
        try {
          await upsertBudgets({ tripId: trip.id, allocations: breakdown, currency });
        } catch {
          toast.warning(
            'Trip created, but the budget breakdown could not be saved. You can add it from the Budget page.',
          );
        }
      }

      toast.success('🎉 Trip created! Your adventure begins here.');
      navigate(`/trips/${trip.id}`, { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create trip. Please try again.');
    }
  }

  return (
    <WizardShell onSubmit={() => void handleSubmit()} isSubmitting={isPending || isBudgetPending} />
  );
}

/* ── Page export ─────────────────────────────────────────────────── */

export default function TripNewPage() {
  const [searchParams] = useSearchParams();
  const initialDestination = searchParams.get('destination') ?? undefined;

  return (
    <WizardProvider initialDestination={initialDestination}>
      <WizardPage />
    </WizardProvider>
  );
}
