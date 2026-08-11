import { useEffect, useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const [confirmText, setConfirmText] = useState('');

  // Reset the confirmation field every time the dialog opens, so a value
  // typed for one trip can never carry over and pre-confirm another.
  useEffect(() => {
    if (open) setConfirmText('');
  }, [open]);

  // Case-sensitive exact match — the same "type the name to confirm"
  // convention used by GitHub/GitLab for destructive deletes. Stricter than
  // a case-insensitive check, which reduces the chance of an accidental
  // near-match confirming an irreversible, cascading delete.
  const isConfirmed = confirmText === tripTitle;

  async function handleDelete() {
    if (!isConfirmed) return;
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

        <div className="space-y-1.5">
          <Label htmlFor="delete-trip-confirm">
            Type <span className="font-semibold text-foreground">{tripTitle}</span> to confirm
          </Label>
          <Input
            id="delete-trip-confirm"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={tripTitle}
            disabled={isPending}
            autoComplete="off"
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              void handleDelete();
            }}
            disabled={isPending || !isConfirmed}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? 'Deleting…' : 'Delete trip'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
