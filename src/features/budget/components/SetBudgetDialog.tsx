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
import { formatCurrency } from '@/utils/formatters';
import { useUpsertCategoryBudget } from '../hooks/useBudget';
import type { CategoryBudgetItem, BudgetSummary } from '../types';

const schema = z.object({
  allocatedAmount: z
    .string()
    .min(1, 'Amount is required')
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Must be a positive number'),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  tripId: string;
  item: CategoryBudgetItem | null;
  summary: BudgetSummary;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SetBudgetDialog({ tripId, item, summary, open, onOpenChange }: Props) {
  const { mutateAsync, isPending } = useUpsertCategoryBudget(tripId);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { allocatedAmount: '' },
  });

  useEffect(() => {
    if (open && item) {
      reset({ allocatedAmount: item.allocated > 0 ? String(item.allocated) : '' });
    }
  }, [open, item, reset]);

  if (!item) return null;

  const inputAmount = Number(watch('allocatedAmount') || 0);
  const otherAllocated = summary.totalAllocated - item.allocated;
  const newTotal = otherAllocated + inputAmount;
  const exceedsBudget = summary.tripBudget != null && newTotal > summary.tripBudget;

  async function onSubmit(values: FormValues) {
    try {
      await mutateAsync({
        category: item!.category,
        allocatedAmount: Number(values.allocatedAmount),
        currency: summary.tripCurrency,
      });
      toast.success(`Budget set for ${item!.label}`);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save budget');
    }
  }

  const fmt = (n: number) => formatCurrency(n, summary.tripCurrency);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {item.emoji} {item.label} Budget
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            void handleSubmit(onSubmit)(e);
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="allocatedAmount">Allocated amount ({summary.tripCurrency})</Label>
            <Input
              id="allocatedAmount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              {...register('allocatedAmount')}
              autoFocus
            />
            {errors.allocatedAmount && (
              <p className="text-xs text-destructive">{errors.allocatedAmount.message}</p>
            )}
          </div>

          {/* Context info */}
          <div className="space-y-1 rounded-lg bg-muted/50 p-3 text-sm">
            {item.spent > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Already spent</span>
                <span className="font-medium tabular-nums">{fmt(item.spent)}</span>
              </div>
            )}
            {summary.tripBudget != null && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trip budget</span>
                  <span className="font-medium tabular-nums">{fmt(summary.tripBudget)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Other categories</span>
                  <span className="tabular-nums">{fmt(otherAllocated)}</span>
                </div>
                <div
                  className={`flex justify-between border-t pt-1 font-medium ${exceedsBudget ? 'text-destructive' : ''}`}
                >
                  <span>New total allocated</span>
                  <span className="tabular-nums">{fmt(newTotal)}</span>
                </div>
              </>
            )}
          </div>

          {exceedsBudget && (
            <p className="text-xs text-destructive">
              This exceeds your trip budget by {fmt(newTotal - summary.tripBudget!)}.
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving…' : 'Save budget'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
