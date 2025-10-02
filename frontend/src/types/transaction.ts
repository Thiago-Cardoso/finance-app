export interface Transaction {
  id: number
  description: string
  amount: string
  raw_amount: number
  transaction_type: 'income' | 'expense' | 'transfer'
  date: string
  notes?: string
  category?: {
    id: number
    name: string
    color: string
    icon?: string
    category_type: string
  }
  account?: {
    id: number
    name: string
    account_type: string
    current_balance: number
  }
  transfer_account?: {
    id: number
    name: string
    account_type: string
    current_balance: number
  }
  created_at: string
  updated_at: string
}

export interface TransactionFormData {
  description: string
  amount: string | number
  transaction_type: 'income' | 'expense' | 'transfer'
  date: string
  notes?: string
  category_id?: number
  account_id?: number
  transfer_account_id?: number
}

export interface TransactionFilters {
  search?: string
  category_id?: string
  transaction_type?: string
  account_id?: string
  date_from?: string
  date_to?: string
  amount_min?: string
  amount_max?: string
  page?: number
  per_page?: number
}

export interface TransactionsResponse {
  success: boolean
  data: Transaction[]
  meta?: {
    pagination: {
      current_page: number
      total_pages: number
      total_count: number
      per_page: number
    }
  }
}

export interface TransactionResponse {
  success: boolean
  data: Transaction
  message?: string
}

export interface Category {
  id: number
  name: string
  color: string
  icon?: string
  category_type: 'income' | 'expense' | 'both'
  is_active: boolean
  is_default: boolean
}

export interface Account {
  id: number
  name: string
  account_type: string
  initial_balance: number
  current_balance: number
  is_active: boolean
}
