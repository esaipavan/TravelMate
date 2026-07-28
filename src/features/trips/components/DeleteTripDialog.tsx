import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
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
import { useDeleteTrip } from '../hooks/useTrips';

interface DeleteTripDialogProps {
  tripId: string;
  tripTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteTripDialog({ tripId, tripTitle, open, onOpenChange }: DeleteTripDialogProps) {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useDeleteTrip();

  async function handleDelete() {
    try {
      await mutateAsync(tripId);
      toast.success('Trip deleted.');
      navigate('/trips', { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete trip.');
      onOpenChange(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete "{tripTitle}"?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the trip and all its expenses, itinerary, checklist items,
            and journal entries. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              void handleDelete();
            }}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? 'Deleting…' : 'Delete trip'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
