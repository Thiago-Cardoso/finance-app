import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'

// Mock providers for now - will be updated when AuthContext and QueryClient are implemented
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Mock user data for tests
export const mockUser = {
  id: 1,
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  confirmed_at: '2024-01-01T00:00:00.000Z',
}

// Mock transaction data
export const mockTransaction = {
  id: 1,
  description: 'Test Transaction',
  amount: '100.00',
  transaction_type: 'expense' as const,
  date: '2024-01-15',
  category: {
    id: 1,
    name: 'Alimentação',
    color: '#ef4444',
  },
  account: {
    id: 1,
    name: 'Conta Corrente',
    account_type: 'checking' as const,
  },
}

// Mock category data
export const mockCategory = {
  id: 1,
  name: 'Alimentação',
  color: '#ef4444',
  category_type: 'expense' as const,
  is_default: true,
  is_active: true,
}

// Mock account data
export const mockAccount = {
  id: 1,
  name: 'Conta Corrente',
  account_type: 'checking' as const,
  initial_balance: '1000.00',
  current_balance: '1500.00',
  is_active: true,
}

// Utility function to create mock API responses
export const createMockApiResponse = <T,>(data: T, success = true) => ({
  success,
  data,
  message: success ? 'Success' : 'Error',
})

// Utility function to wait for async operations
export const waitForLoadingToFinish = () =>
  new Promise((resolve) => setTimeout(resolve, 0))
