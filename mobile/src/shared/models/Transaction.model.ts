/**
 * Model: Transaction
 *
 * Define a estrutura de dados das transações financeiras.
 * Corresponde ao TransactionSerializer do Rails backend.
 */

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface TransactionCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  category_type: string;
}

export interface TransactionAccount {
  id: string;
  name: string;
  account_type: string;
  current_balance: number;
}

export interface Transaction {
  id: string;
  description: string;
  amount: string; // Formatted amount with +/- prefix
  raw_amount: number;
  transaction_type: TransactionType;
  date: string; // Format: YYYY-MM-DD
  notes: string | null;
  category: TransactionCategory | null;
  account: TransactionAccount | null;
  transfer_account: TransactionAccount | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTransactionData {
  description: string;
  amount: number;
  transaction_type: TransactionType;
  date: string;
  notes?: string;
  category_id?: string;
  account_id?: string;
  transfer_account_id?: string;
}

export interface UpdateTransactionData {
  description?: string;
  amount?: number;
  transaction_type?: TransactionType;
  date?: string;
  notes?: string;
  category_id?: string;
  account_id?: string;
  transfer_account_id?: string;
}

export interface TransactionFilters {
  category_id?: string;
  category_ids?: string[];
  transaction_type?: TransactionType;
  account_id?: string;
  date_from?: string;
  date_to?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  min_amount?: number;
  max_amount?: number;
  period?: 'this_month' | 'last_month' | 'this_year' | 'last_year';
  sort_by?: 'date' | 'amount' | 'description';
  sort_direction?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface TransactionSummary {
  total_income: number;
  total_expenses: number;
  net_amount: number;
  transactions_count: number;
}

export interface PaginationMeta {
  current_page: number;
  next_page: number | null;
  prev_page: number | null;
  total_pages: number;
  total_count: number;
  per_page?: number;
}

export interface TransactionsResponse {
  success: boolean;
  data: Transaction[];
  meta?: {
    pagination: PaginationMeta;
    filters?: Record<string, unknown>;
  };
}

export interface TransactionResponse {
  success: boolean;
  data: Transaction;
  message?: string;
}

export interface TransactionSummaryResponse {
  success: boolean;
  data: TransactionSummary;
}

export interface FilterOptions {
  categories: { id: string; name: string }[];
  accounts: { id: string; name: string }[];
  transaction_types: TransactionType[];
  date_ranges: { value: string; label: string }[];
}

export interface FilterOptionsResponse {
  success: boolean;
  data: FilterOptions;
}
