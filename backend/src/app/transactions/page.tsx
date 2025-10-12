'use client'

import { useState } from 'react'
import { useTransactions } from '@/hooks/useTransactions'
import { TransactionList } from '@/components/transactions/TransactionList'
import { TransactionFilters } from '@/components/transactions/TransactionFilters'
import { Button } from '@/components/ui/Button'
import { Plus, Download } from 'lucide-react'
import Link from 'next/link'

export default function TransactionsPage() {
  const [filters, setFilters] = useState({
    search: '',
    category_id: undefined as number | undefined,
    transaction_type: undefined as 'income' | 'expense' | 'transfer' | undefined,
    start_date: undefined as string | undefined,
    end_date: undefined as string | undefined,
  })

  const [page, setPage] = useState(1)
  const { data, isLoading, isError } = useTransactions({ ...filters, page, per_page: 20 })

  const transactions = data?.data || []
  const pagination = data?.pagination

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
    setPage(1) // Reset to first page on filter change
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Transações
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Gerencie todas as suas transações financeiras
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Button
              variant="secondary"
              leftIcon={<Download className="w-4 h-4" />}
            >
              Exportar
            </Button>
            <Link href="/transactions/new">
              <Button leftIcon={<Plus className="w-4 h-4" />}>
                Nova Transação
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <TransactionFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Transaction List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          {isError && (
            <div className="p-6 text-center">
              <p className="text-red-600 dark:text-red-400">
                Erro ao carregar transações. Tente novamente.
              </p>
            </div>
          )}

          {!isError && (
            <TransactionList
              transactions={transactions}
              isLoading={isLoading}
              pagination={pagination}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>
    </div>
  )
}
