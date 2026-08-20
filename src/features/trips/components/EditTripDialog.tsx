import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TripForm } from './TripForm';
import { useUpdateTrip } from '../hooks/useTrips';
import { selectTripCoverImage } from '@/services/place-image/placeImage.service';
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
      // Re-select on destination change: curated → real Wikipedia image → null.
      const nextCover = needsCoverUpdate
        ? await selectTripCoverImage(values.destination)
        : undefined;

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
          ...(needsCoverUpdate && { cover_image_url: nextCover }),
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
      <DialogContent className="flex max-h-[90vh] max-w-lg flex-col gap-0 p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Edit trip</DialogTitle>
        </DialogHeader>

        <ScrollArea className="min-h-0 flex-1">
          <div className="px-6 py-4">
            <TripForm
              formId="edit-trip-form"
              hideActions
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
            />
          </div>
        </ScrollArea>

        <DialogFooter className="border-t px-6 py-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="edit-trip-form" disabled={isPending}>
            {isPending ? 'Saving…' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
