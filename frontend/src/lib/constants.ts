// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Query Keys for React Query
export const QUERY_KEYS = {
  auth: ['auth'],
  user: (id: string) => ['user', id],
  transactions: ['transactions'],
  transaction: (id: string) => ['transaction', id],
  accounts: ['accounts'],
  account: (id: string) => ['account', id],
  categories: ['categories'],
  category: (id: string) => ['category', id],
} as const

// Transaction Types
export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
  TRANSFER: 'transfer',
} as const

// Application Constants
export const APP_NAME = 'FinanceApp'
export const APP_VERSION = '1.0.0'

// Pagination
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100
