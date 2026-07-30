import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TripForm } from './TripForm';
import { useUpdateTrip } from '../hooks/useTrips';
import { resolveDestinationImageUrl } from '@/utils/destinationTheme';
import type { TripRow, TripFormValues } from '../types';

interface EditTripDialogProps {
  trip: TripRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTripDialog({ trip, open, onOpenChange }: EditTripDialogProps) {
  const { mutateAsync, isPending } = useUpdateTrip();

  async function handleSubmit(values: TripFormValues) {
    try {
      const destinationChanged = values.destination !== trip.destination;
      const needsCoverUpdate = destinationChanged || trip.cover_image_url === null;

      await mutateAsync({
        id: trip.id,
        data: {
          title: values.title,
          destination: values.destination,
          start_date: values.start_date,
          end_date: values.end_date,
          total_budget: values.total_budget ?? null,
          currency: values.currency,
          status: values.status,
          notes: values.notes || null,
          is_public: values.is_public,
          ...(needsCoverUpdate && {
            cover_image_url: resolveDestinationImageUrl(values.destination),
          }),
        },
      });
      toast.success('Trip updated.');
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update trip.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit trip</DialogTitle>
        </DialogHeader>
        <TripForm
          defaultValues={{
            title: trip.title,
            destination: trip.destination,
            start_date: trip.start_date,
            end_date: trip.end_date,
            total_budget: trip.total_budget ?? undefined,
            currency: trip.currency,
            status: trip.status,
            notes: trip.notes ?? '',
            is_public: trip.is_public,
          }}
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          submitLabel="Save changes"
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
