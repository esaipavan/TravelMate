import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { resolveDestinationImageUrl } from '@/utils/destinationTheme';
import { useAuthStore } from '@/store/auth.store';
import { useCreateTrip } from '../hooks/useTrips';
import {
  WizardProvider,
  useWizard,
  generateTripTitle,
  totalBudget,
} from '../components/wizard/WizardContext';
import { WizardShell } from '../components/wizard/WizardShell';

/* ── Inner component (has access to WizardContext) ───────────────── */

function WizardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { mutateAsync, isPending } = useCreateTrip();
  const { state } = useWizard();

  async function handleSubmit() {
    if (!user) return;

    const {
      destination,
      destinationMeta,
      tripType,
      startDate,
      endDate,
      budget,
      currency,
      generatedSections,
    } = state;

    /* Format enabled AI sections as markdown notes */
    const enabledSections = generatedSections.filter((s) => s.enabled);
    const notes =
      enabledSections.length > 0
        ? [
            '## ✈️ AI Travel Guide',
            '',
            ...enabledSections.map((s) => `### ${s.icon} ${s.title}\n${s.content}`),
          ].join('\n\n')
        : null;

    const total = totalBudget(budget);

    /* Derive cover image */
    const coverUrl = resolveDestinationImageUrl(destination);

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
        total_budget: total > 0 ? total : null,
        currency,
        status: 'planning',
        notes,
        is_public: false,
      });
      toast.success('🎉 Trip created! Your adventure begins here.');
      navigate(`/trips/${trip.id}`, { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create trip. Please try again.');
    }
  }

  return <WizardShell onSubmit={() => void handleSubmit()} isSubmitting={isPending} />;
}

/* ── Page export ─────────────────────────────────────────────────── */

export default function TripNewPage() {
  return (
    <WizardProvider>
      <WizardPage />
    </WizardProvider>
  );
}
