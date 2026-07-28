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
import { useDeletePackingItem } from '../hooks/useChecklist';
import type { PackingItemRow } from '../types';

interface Props {
  tripId: string;
  item: PackingItemRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteItemDialog({ tripId, item, open, onOpenChange }: Props) {
  const { mutateAsync, isPending } = useDeletePackingItem(tripId);

  async function handleDelete() {
    if (!item) return;
    try {
      await mutateAsync(item.id);
      toast.success('Item removed.');
      onOpenChange(false);
    } catch {
      toast.error('Failed to remove item.');
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove packing item?</AlertDialogTitle>
          <AlertDialogDescription>
            <strong>{item?.name}</strong> will be permanently removed from your checklist.
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
            {isPending ? 'Removing…' : 'Remove'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
