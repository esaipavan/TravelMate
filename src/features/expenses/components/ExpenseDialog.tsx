import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Paperclip, X } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS, SUPPORTED_CURRENCIES } from '@/utils/constants';
import { useAuthStore } from '@/store/auth.store';
import { uploadReceipt, deleteReceipt } from '../services/expenses.service';
import { useCreateExpense, useUpdateExpense } from '../hooks/useExpenses';
import { parseSplitMeta, encodeSplitMeta } from '../utils/settlement';
import type { ExpenseRow, ExpenseFormValues, ExpenseCategory, PaymentMethod } from '../types';
import type { TripMember } from '../utils/settlement';

const CATEGORY_VALUES = [
  'hotel',
  'food',
  'transport',
  'shopping',
  'activity',
  'emergency',
  'fuel',
  'taxi',
  'misc',
] as const;

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Must be a positive number'),
  currency: z.string().min(3).max(3),
  category: z.enum(CATEGORY_VALUES),
  date: z.string().min(1, 'Date is required'),
  payment_method: z.string(),
  notes: z.string(),
});

interface Props {
  tripId: string;
  tripCurrency: string;
  expense?: ExpenseRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members?: TripMember[];
}

export function ExpenseDialog({
  tripId,
  tripCurrency,
  expense,
  open,
  onOpenChange,
  members,
}: Props) {
  const user = useAuthStore((s) => s.user);
  const isEdit = !!expense;

  const ownerMemberId = members?.find((m) => m.isOwner)?.id ?? user?.id ?? '';
  const showPaidBy = (members?.length ?? 0) > 1;

  const { mutateAsync: createExpense, isPending: creating } = useCreateExpense(tripId);
  const { mutateAsync: updateExpense, isPending: updating } = useUpdateExpense(tripId);
  const isPending = creating || updating;

  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [removeReceipt, setRemoveReceipt] = useState(false);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [paidById, setPaidById] = useState(ownerMemberId);
  const fileRef = useRef<HTMLInputElement>(null);

  const today = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      amount: '',
      currency: tripCurrency,
      category: 'misc',
      date: today,
      payment_method: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (open) {
      setReceiptFile(null);
      setRemoveReceipt(false);
      if (expense) {
        const meta = parseSplitMeta(expense.notes);
        const displayNotes = meta ? (meta._notes ?? '') : (expense.notes ?? '');
        reset({
          title: expense.title,
          amount: String(expense.amount),
          currency: expense.currency,
          category: expense.category,
          date: expense.date,
          payment_method: expense.payment_method ?? '',
          notes: displayNotes,
        });
        setPaidById(meta?._paidBy ?? ownerMemberId);
      } else {
        reset({
          title: '',
          amount: '',
          currency: tripCurrency,
          category: 'misc',
          date: today,
          payment_method: '',
          notes: '',
        });
        setPaidById(ownerMemberId);
      }
    }
  }, [open, expense, tripCurrency, reset, today, ownerMemberId]);

  async function onSubmit(values: ExpenseFormValues) {
    if (!user) return;
    try {
      let receiptUrl = isEdit ? (expense.receipt_url ?? null) : null;

      // Handle receipt changes
      if (removeReceipt && isEdit && expense.receipt_url) {
        await deleteReceipt(expense.receipt_url).catch(() => null);
        receiptUrl = null;
      }
      if (receiptFile) {
        setUploadingReceipt(true);
        receiptUrl = await uploadReceipt(user.id, tripId, receiptFile);
        setUploadingReceipt(false);
      }

      const userNotes = values.notes;
      const notesFinal =
        showPaidBy && paidById && paidById !== ownerMemberId
          ? encodeSplitMeta(paidById, userNotes)
          : userNotes || null;

      const payload = {
        title: values.title,
        amount: Number(values.amount),
        currency: values.currency,
        category: values.category,
        date: values.date,
        payment_method: (values.payment_method as PaymentMethod) || null,
        notes: notesFinal,
        receipt_url: receiptUrl,
      };

      if (isEdit) {
        await updateExpense({ id: expense.id, data: payload });
        toast.success('Expense updated.');
      } else {
        await createExpense({ ...payload, trip_id: tripId, user_id: user.id });
        toast.success('Expense added.');
      }
      onOpenChange(false);
    } catch (err) {
      setUploadingReceipt(false);
      toast.error(err instanceof Error ? err.message : 'Failed to save expense.');
    }
  }

  const existingReceipt = isEdit && expense.receipt_url && !removeReceipt;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit expense' : 'Add expense'}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            void handleSubmit(onSubmit)(e);
          }}
          className="space-y-4"
        >
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="e.g. Hotel check-in" {...register('title')} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          {/* Amount + Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                {...register('amount')}
              />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Select value={watch('currency')} onValueChange={(v) => setValue('currency', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {SUPPORTED_CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={watch('category')}
                onValueChange={(v) => setValue('category', v as ExpenseCategory)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.emoji} {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-xs text-destructive">{errors.category.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" {...register('date')} />
              {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
            </div>
          </div>

          {/* Payment method */}
          <div className="space-y-1.5">
            <Label>
              Payment method <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Select
              value={watch('payment_method')}
              onValueChange={(v) => setValue('payment_method', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select method…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {PAYMENT_METHODS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Paid by — shown only when group has multiple members */}
          {showPaidBy && members && (
            <div className="space-y-1.5">
              <Label>Paid by</Label>
              <Select value={paidById} onValueChange={setPaidById}>
                <SelectTrigger>
                  <SelectValue placeholder="Who paid?" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                      {m.isOwner ? ' (you)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">
              Notes <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="notes"
              placeholder="Any additional details…"
              rows={2}
              {...register('notes')}
            />
          </div>

          {/* Receipt upload */}
          <div className="space-y-1.5">
            <Label>
              Receipt <span className="text-muted-foreground">(optional)</span>
            </Label>
            {existingReceipt ? (
              <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                <Paperclip className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 text-muted-foreground">Receipt attached</span>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => setRemoveReceipt(true)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <div className="space-y-1.5">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="hidden"
                  onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
                />
                {receiptFile ? (
                  <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 truncate text-muted-foreground">
                      {receiptFile.name}
                    </span>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => {
                        setReceiptFile(null);
                        if (fileRef.current) fileRef.current.value = '';
                      }}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => fileRef.current?.click()}
                  >
                    <Paperclip className="mr-2 h-4 w-4" />
                    Attach receipt
                  </Button>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || uploadingReceipt}>
              {uploadingReceipt
                ? 'Uploading…'
                : isPending
                  ? 'Saving…'
                  : isEdit
                    ? 'Save changes'
                    : 'Add expense'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
