'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useTransactions } from '@/hooks/useTransactions'
import { useCategories } from '@/hooks/useCategories'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { TransactionList } from '@/components/transactions/TransactionList'
import { TransactionFilters } from '@/components/transactions/TransactionFilters'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { Button } from '@/components/ui/Button'
import { SimpleModal } from '@/components/ui/Modal/SimpleModal'
import { FilterChip } from '@/components/ui/FilterChip/FilterChip'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Plus, AlertCircle, Filter, SlidersHorizontal } from 'lucide-react'

export default function TransactionsPage() {
  const router = useRouter()
  const { token, loading: authLoading } = useAuth()
  const isMobile = useIsMobile()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    category_id: '',
    transaction_type: '',
    date_from: '',
    date_to: '',
    amount_min: '',
    amount_max: ''
  })

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useTransactions(filters)

  const { data: categoryResponse } = useCategories()
  const categories = Array.isArray(categoryResponse?.data) ? categoryResponse.data : []

  const transactions = data?.transactions || []

  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  const handleClearFilters = () => {
    setFilters({
      search: '',
      category_id: '',
      transaction_type: '',
      date_from: '',
      date_to: '',
      amount_min: '',
      amount_max: ''
    })
  }

  const handleRemoveFilter = (key: string) => {
    setFilters({ ...filters, [key]: '' })
  }

  const getFilterLabel = (key: string, value: string) => {
    switch (key) {
      case 'transaction_type':
        return `Type: ${value === 'income' ? 'Income' : value === 'expense' ? 'Expense' : 'Transfer'}`
      case 'category_id':
        const category = categories.find(c => c.id.toString() === value)
        return `Category: ${category?.name || value}`
      case 'date_from':
        return `From: ${value}`
      case 'date_to':
        return `To: ${value}`
      case 'amount_min':
        return `Min: $${value}`
      case 'amount_max':
        return `Max: $${value}`
      case 'search':
        return `Search: ${value}`
      default:
        return `${key}: ${value}`
    }
  }

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
              <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Authentication Required
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You need to be logged in to access transactions. Please sign in to continue.
            </p>
            <Button onClick={() => router.push('/auth/login')}>
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header with Inline Filters */}
        <div className="mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 md:p-8">
            {/* Title Row */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Transactions
                  </h1>
                  {!isLoading && data?.pages?.[0]?.meta?.pagination && (
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-sm font-semibold text-blue-800 dark:text-blue-200 shadow-sm">
                      {data.pages[0].meta.pagination.total_count} total
                    </span>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                  Manage your income, expenses and transfers with ease
                </p>
              </div>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center justify-center gap-2 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>New Transaction</span>
              </Button>
            </div>

            {/* Inline Filters Row */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
              <div className="flex-1 w-full sm:max-w-[250px]">
                <Select
                  label="Type"
                  value={filters.transaction_type}
                  onChange={(e) => setFilters({ ...filters, transaction_type: e.target.value })}
                  options={[
                    { value: '', label: 'All Types' },
                    { value: 'income', label: 'Income' },
                    { value: 'expense', label: 'Expense' },
                    { value: 'transfer', label: 'Transfer' },
                  ]}
                />
              </div>

              <div className="flex-1 w-full sm:max-w-[250px]">
                <Select
                  label="Category"
                  value={filters.category_id}
                  onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
                  options={[
                    { value: '', label: 'All Categories' },
                    ...(categories.map(cat => ({
                      value: cat.id.toString(),
                      label: cat.name
                    })))
                  ]}
                />
              </div>

              <Button
                variant="secondary"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Advanced Filters</span>
                <span className="sm:hidden">More</span>
              </Button>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  onClick={handleClearFilters}
                  className="hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
                >
                  Clear All
                </Button>
              )}
            </div>

            {/* Active Filter Chips */}
            {hasActiveFilters && (
              <div className="flex gap-2 flex-wrap mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                {Object.entries(filters).map(([key, value]) =>
                  value && (
                    <FilterChip
                      key={key}
                      label={getFilterLabel(key, value).split(':')[0]}
                      value={getFilterLabel(key, value).split(':')[1].trim()}
                      onRemove={() => handleRemoveFilter(key)}
                    />
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* Advanced Filters Section */}
        {showAdvancedFilters && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4">
            <TransactionFilters
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>
        )}

        {/* Transaction List */}
        <TransactionList
          transactions={transactions}
          isLoading={isLoading}
          error={error as Error | null}
          onLoadMore={fetchNextPage}
          hasNextPage={hasNextPage || false}
          isFetchingNextPage={isFetchingNextPage}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearFilters}
          onCreateTransaction={() => setIsCreateModalOpen(true)}
        />

        {/* Create Transaction Modal */}
        <SimpleModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="New Transaction"
          size="lg"
        >
          <TransactionForm
            onSuccess={() => setIsCreateModalOpen(false)}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </SimpleModal>
      </div>
    </div>
  )
}
