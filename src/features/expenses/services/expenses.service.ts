import { supabase } from '@/lib/supabase';
import type {
  ExpenseRow,
  ExpenseInsert,
  ExpenseUpdate,
  ExpenseCategory,
  ExpenseData,
} from '../types';

export async function getExpenseData(tripId: string): Promise<ExpenseData> {
  const [
    { data: tripData, error: tripError },
    { data: expenses, error: expensesError },
    { data: budgetRows, error: budgetError },
  ] = await Promise.all([
    supabase
      .from('trips')
      .select('title, currency, start_date, end_date')
      .eq('id', tripId)
      .single(),
    supabase
      .from('expenses')
      .select('*')
      .eq('trip_id', tripId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false }),
    supabase.from('trip_budgets').select('category, allocated_amount').eq('trip_id', tripId),
  ]);

  if (tripError) throw new Error(tripError.message);
  if (expensesError) throw new Error(expensesError.message);
  if (budgetError) throw new Error(budgetError.message);

  const budgetMap: Partial<Record<ExpenseCategory, number>> = {};
  for (const row of budgetRows ?? []) {
    budgetMap[row.category] = row.allocated_amount;
  }

  return {
    expenses: expenses ?? [],
    tripTitle: tripData?.title ?? '',
    tripCurrency: tripData?.currency ?? 'INR',
    tripStartDate: tripData?.start_date ?? '',
    tripEndDate: tripData?.end_date ?? '',
    budgetMap,
  };
}

export async function createExpense(data: ExpenseInsert): Promise<ExpenseRow> {
  const { data: row, error } = await supabase.from('expenses').insert(data).select().single();
  if (error) throw new Error(error.message);
  return row;
}

export async function updateExpense(id: string, data: ExpenseUpdate): Promise<ExpenseRow> {
  const { data: row, error } = await supabase
    .from('expenses')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return row;
}

export async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function uploadReceipt(userId: string, tripId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${userId}/${tripId}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('receipts').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw new Error(error.message);
  return path;
}

export async function getReceiptSignedUrl(path: string): Promise<string | null> {
  const { data } = await supabase.storage.from('receipts').createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

export async function deleteReceipt(path: string): Promise<void> {
  await supabase.storage.from('receipts').remove([path]);
}
