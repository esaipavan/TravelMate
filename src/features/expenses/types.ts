import type { Database } from '@/types/database.types';

export type ExpenseRow = Database['public']['Tables']['expenses']['Row'];
export type ExpenseInsert = Database['public']['Tables']['expenses']['Insert'];
export type ExpenseUpdate = Database['public']['Tables']['expenses']['Update'];
export type ExpenseCategory = Database['public']['Enums']['expense_category'];
export type PaymentMethod = Database['public']['Enums']['payment_method'];

export interface ExpenseFormValues {
  title: string;
  amount: string;
  currency: string;
  category: ExpenseCategory;
  date: string;
  payment_method: string;
  notes: string;
}

export interface ExpenseData {
  expenses: ExpenseRow[];
  tripTitle: string;
  tripCurrency: string;
  tripStartDate: string;
  tripEndDate: string;
  totalBudget: number;
  budgetMap: Partial<Record<ExpenseCategory, number>>;
}

export type SortKey = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
export type FilterCategory = ExpenseCategory | 'all';
