import { apiClient as api } from '@/lib/api'
import {
  Transaction,
  TransactionFormData,
  TransactionFilters,
  TransactionsResponse,
  TransactionResponse,
  Category,
  Account,
} from '@/types/transaction'

export const transactionsService = {
  // Get all transactions with filters and pagination
  async getAll(filters: TransactionFilters = {}): Promise<TransactionsResponse> {
    const params = new URLSearchParams()

    if (filters.search) params.append('search', filters.search)
    if (filters.category_id) params.append('category_id', filters.category_id)
    if (filters.transaction_type) params.append('transaction_type', filters.transaction_type)
    if (filters.account_id) params.append('account_id', filters.account_id)
    if (filters.date_from) params.append('date_from', filters.date_from)
    if (filters.date_to) params.append('date_to', filters.date_to)
    if (filters.amount_min) params.append('amount_min', filters.amount_min)
    if (filters.amount_max) params.append('amount_max', filters.amount_max)
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.per_page) params.append('per_page', filters.per_page.toString())

    const queryString = params.toString()
    const url = `/transactions${queryString ? `?${queryString}` : ''}`

    return api.get<TransactionsResponse>(url)
  },

  // Get single transaction
  async getById(id: number): Promise<TransactionResponse> {
    return api.get<TransactionResponse>(`/transactions/${id}`)
  },

  // Create transaction
  async create(data: TransactionFormData): Promise<TransactionResponse> {
    return api.post<TransactionResponse>('/transactions', {
      transaction: data
    })
  },

  // Update transaction
  async update(id: number, data: Partial<TransactionFormData>): Promise<TransactionResponse> {
    return api.put<TransactionResponse>(`/transactions/${id}`, {
      transaction: data
    })
  },

  // Delete transaction
  async delete(id: number): Promise<{ success: boolean; message: string }> {
    return api.delete<{ success: boolean; message: string }>(`/transactions/${id}`)
  },

  // Get summary
  async getSummary(start_date?: string, end_date?: string): Promise<any> {
    const params = new URLSearchParams()
    if (start_date) params.append('start_date', start_date)
    if (end_date) params.append('end_date', end_date)

    const queryString = params.toString()
    const url = `/transactions/summary${queryString ? `?${queryString}` : ''}`

    return api.get(url)
  },
}

// Categories service
export const categoriesService = {
  async getAll(): Promise<{ success: boolean; data: Category[] }> {
    return api.get<{ success: boolean; data: Category[] }>('/categories')
  },
}

// Accounts service
export const accountsService = {
  async getAll(): Promise<{ success: boolean; data: Account[] }> {
    return api.get<{ success: boolean; data: Account[] }>('/accounts')
  },
}
