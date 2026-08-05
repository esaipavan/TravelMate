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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateItem, useUpdateItem } from '../hooks/useItinerary';
import type { ItineraryItemRow, ItineraryCategory, ItemStatus } from '../types';

const ITINERARY_CATEGORIES = [
  { value: 'transport', label: 'âœˆï¸ Transport' },
  { value: 'accommodation', label: 'ðŸ¨ Accommodation' },
  { value: 'activity', label: 'ðŸŽ¯ Activity' },
  { value: 'food', label: 'ðŸ½ï¸ Food' },
  { value: 'other', label: 'ðŸ“Œ Other' },
] as const;

const ITEM_STATUSES = ['planned', 'confirmed', 'completed', 'cancelled'] as const;

const STATUS_LABELS: Record<string, string> = {
  planned: 'Planned',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const CATEGORY_VALUES = ITINERARY_CATEGORIES.map((c) => c.value) as [
  ItineraryCategory,
  ...ItineraryCategory[],
];

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(150),
  category: z.enum(CATEGORY_VALUES),
  status: z.enum(ITEM_STATUSES),
  start_time: z.string(),
  end_time: z.string(),
  location_name: z.string(),
  description: z.string(),
  estimated_cost: z
    .string()
    .refine((v) => v === '' || (!isNaN(Number(v)) && Number(v) >= 0), 'Must be a positive number'),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  tripId: string;
  dayId: string;
  nextOrderIndex: number;
  item?: ItineraryItemRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ItemDialog({ tripId, dayId, nextOrderIndex, item, open, onOpenChange }: Props) {
  const isEdit = !!item;
  const { mutateAsync: createItem, isPending: creating } = useCreateItem(tripId);
  const { mutateAsync: updateItem, isPending: updating } = useUpdateItem(tripId);
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
      title: '',
      category: 'activity',
      status: 'planned',
      start_time: '',
      end_time: '',
      location_name: '',
      description: '',
      estimated_cost: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (item) {
        reset({
          title: item.title,
          category: item.category,
          status: item.status,
          start_time: item.start_time ? item.start_time.slice(0, 5) : '',
          end_time: item.end_time ? item.end_time.slice(0, 5) : '',
          location_name: item.location_name ?? '',
          description: item.description ?? '',
          estimated_cost: item.estimated_cost != null ? String(item.estimated_cost) : '',
        });
      } else {
        reset({
          title: '',
          category: 'activity',
          status: 'planned',
          start_time: '',
          end_time: '',
          location_name: '',
          description: '',
          estimated_cost: '',
        });
      }
    }
  }, [open, item, reset]);

  async function onSubmit(values: FormValues) {
    try {
      const payload = {
        title: values.title,
        category: values.category,
        status: values.status,
        start_time: values.start_time || null,
        end_time: values.end_time || null,
        location_name: values.location_name || null,
        description: values.description || null,
        estimated_cost: values.estimated_cost !== '' ? Number(values.estimated_cost) : null,
      };

      if (isEdit) {
        await updateItem({ id: item.id, data: payload });
        toast.success('Item updated.');
      } else {
        await createItem({ ...payload, day_id: dayId, order_index: nextOrderIndex });
        toast.success('Item added.');
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save item.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-lg flex-col gap-0 p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>{isEdit ? 'Edit item' : 'Add item'}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="min-h-0 flex-1">
          <form
            id="item-form"
            onSubmit={(e) => {
              void handleSubmit(onSubmit)(e);
            }}
            className="space-y-4 px-6 py-4"
          >
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="item-title">Title</Label>
              <Input id="item-title" placeholder="e.g. Flight to Tokyo" {...register('title')} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            {/* Category + Status */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select
                  value={watch('category')}
                  onValueChange={(v) => setValue('category', v as ItineraryCategory)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ITINERARY_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={watch('status')}
                  onValueChange={(v) => setValue('status', v as ItemStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ITEM_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Start + End time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="start-time">
                  Start time <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input id="start-time" type="time" {...register('start_time')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="end-time">
                  End time <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input id="end-time" type="time" {...register('end_time')} />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <Label htmlFor="location">
                Location <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="location"
                placeholder="e.g. Narita International Airport"
                {...register('location_name')}
              />
            </div>

            {/* Estimated cost */}
            <div className="space-y-1.5">
              <Label htmlFor="estimated-cost">
                Estimated cost <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="estimated-cost"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                {...register('estimated_cost')}
              />
              {errors.estimated_cost && (
                <p className="text-xs text-destructive">{errors.estimated_cost.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description">
                Notes <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Any details, confirmation numbers, etc."
                rows={2}
                {...register('description')}
              />
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="border-t px-6 py-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="item-form" disabled={isPending}>
            {isPending ? 'Savingâ€¦' : isEdit ? 'Save changes' : 'Add item'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
