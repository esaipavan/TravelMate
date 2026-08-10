import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreatePackingItem, useUpdatePackingItem } from '../hooks/useChecklist';
import { PACKING_CATEGORIES } from '../types';
import type { PackingItemRow, ItemFormValues } from '../types';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  category: z.string().min(1, 'Category is required'),
  quantity: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 1, 'Must be at least 1'),
  is_essential: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  tripId: string;
  totalItems: number;
  item?: PackingItemRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ItemDialog({ tripId, totalItems, item, open, onOpenChange }: Props) {
  const isEdit = !!item;
  const { mutateAsync: createItem, isPending: creating } = useCreatePackingItem(tripId);
  const { mutateAsync: updateItem, isPending: updating } = useUpdatePackingItem(tripId);
  const isPending = creating || updating;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      category: 'Other',
      quantity: '1',
      is_essential: false,
    },
  });

  useEffect(() => {
    if (open) {
      if (item) {
        reset({
          name: item.name,
          category: item.category ?? 'Other',
          quantity: String(item.quantity),
          is_essential: item.is_essential,
        });
      } else {
        reset({ name: '', category: 'Other', quantity: '1', is_essential: false });
      }
    }
  }, [open, item, reset]);

  async function onSubmit(values: FormValues) {
    try {
      const payload: Omit<ItemFormValues, 'quantity'> & { quantity: number } = {
        name: values.name,
        category: values.category,
        quantity: Number(values.quantity),
        is_essential: values.is_essential,
      };

      if (isEdit) {
        await updateItem({ id: item.id, data: payload });
        toast.success('Item updated.');
      } else {
        await createItem({
          ...payload,
          trip_id: tripId,
          order_index: totalItems,
        });
        toast.success('Item added.');
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save item.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit item' : 'Add item'}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            void handleSubmit(onSubmit)(e);
          }}
          className="space-y-4"
        >
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="item-name">Name</Label>
            <Input id="item-name" placeholder="e.g. Passport" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          {/* Category + Quantity */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="item-category">Category</Label>
              <Select value={watch('category')} onValueChange={(v) => setValue('category', v)}>
                <SelectTrigger
                  id="item-category"
                  aria-invalid={!!errors.category}
                  aria-describedby={errors.category ? 'item-category-error' : undefined}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PACKING_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.emoji} {c.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p id="item-category-error" role="alert" className="text-xs text-destructive">
                  {errors.category.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" min="1" step="1" {...register('quantity')} />
              {errors.quantity && (
                <p className="text-xs text-destructive">{errors.quantity.message}</p>
              )}
            </div>
          </div>

          {/* Essential toggle */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="is-essential"
              checked={watch('is_essential')}
              onCheckedChange={(v) => setValue('is_essential', !!v)}
            />
            <Label htmlFor="is-essential" className="cursor-pointer font-normal">
              Mark as essential
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Add item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
