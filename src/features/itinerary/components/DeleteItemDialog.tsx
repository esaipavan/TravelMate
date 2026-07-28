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
import { useDeleteItem } from '../hooks/useItinerary';
import type { ItineraryItemRow } from '../types';

interface Props {
  tripId: string;
  item: ItineraryItemRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteItemDialog({ tripId, item, open, onOpenChange }: Props) {
  const { mutateAsync, isPending } = useDeleteItem(tripId);

  async function handleDelete() {
    if (!item) return;
    try {
      await mutateAsync(item.id);
      toast.success('Item deleted.');
      onOpenChange(false);
    } catch {
      toast.error('Failed to delete item.');
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete itinerary item?</AlertDialogTitle>
          <AlertDialogDescription>
            <strong>{item?.title}</strong> will be permanently removed. This cannot be undone.
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
            {isPending ? 'Deleting…' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
