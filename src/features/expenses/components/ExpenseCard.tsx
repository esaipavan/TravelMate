import { memo } from 'react';
import { Pencil, Trash2, Paperclip, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '@/utils/constants';
import { getReceiptSignedUrl } from '../services/expenses.service';
import { getDisplayNotes } from '../utils/settlement';
import type { ExpenseRow, ExpenseCategory } from '../types';

interface Props {
  expense: ExpenseRow;
  budgetAllocated: number;
  onEdit: (expense: ExpenseRow) => void;
  onDelete: (expense: ExpenseRow) => void;
}

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  hotel: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  food: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  transport: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  shopping: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
  activity: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  emergency: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  fuel: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  taxi: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
  misc: 'bg-muted text-muted-foreground',
};

export const ExpenseCard = memo(function ExpenseCard({
  expense,
  budgetAllocated,
  onEdit,
  onDelete,
}: Props) {
  const catMeta = EXPENSE_CATEGORIES.find((c) => c.value === expense.category);
  const pmLabel = PAYMENT_METHODS.find((p) => p.value === expense.payment_method)?.label;
  const displayNotes = getDisplayNotes(expense.notes);

  async function handleViewReceipt() {
    if (!expense.receipt_url) return;
    const url = await getReceiptSignedUrl(expense.receipt_url);
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="group flex items-start gap-4 rounded-lg border bg-card p-4 transition-shadow hover:shadow-sm">
      {/* Category emoji */}
      <span
        className="mt-0.5 shrink-0 text-2xl leading-none"
        role="img"
        aria-label={catMeta?.label}
      >
        {catMeta?.emoji ?? '💰'}
      </span>

      {/* Main content */}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium leading-none">{expense.title}</p>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              CATEGORY_COLORS[expense.category]
            }`}
          >
            {catMeta?.label ?? expense.category}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          <span>{formatDate(expense.date)}</span>
          {pmLabel && <span>{pmLabel}</span>}
          {budgetAllocated > 0 && (
            <span className="tabular-nums">
              Budget: {formatCurrency(budgetAllocated, expense.currency)}
            </span>
          )}
        </div>

        {displayNotes && (
          <p className="line-clamp-1 text-xs text-muted-foreground">{displayNotes}</p>
        )}
      </div>

      {/* Right side: amount + actions */}
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <p className="text-lg font-bold tabular-nums">
          {formatCurrency(expense.amount, expense.currency)}
        </p>

        <div className="flex items-center gap-1 lg:opacity-0 lg:transition-opacity lg:group-hover:opacity-100">
          {expense.receipt_url && (
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => {
                void handleViewReceipt();
              }}
              aria-label="View receipt"
              title="View receipt"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => onEdit(expense)}
            aria-label={`Edit expense: ${expense.title}`}
            title="Edit expense"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(expense)}
            aria-label={`Delete expense: ${expense.title}`}
            title="Delete expense"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        {expense.receipt_url && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Paperclip className="h-3 w-3" />
            <span>Receipt</span>
          </div>
        )}
      </div>
    </div>
  );
});
