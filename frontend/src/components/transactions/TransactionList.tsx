'use client'

import { useState } from 'react'
import { Transaction } from '@/types/transaction'
import { TransactionItem } from './TransactionItem'
import { TransactionForm } from './TransactionForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Loader2, AlertCircle, FileX } from 'lucide-react'

interface TransactionListProps {
  transactions: Transaction[]
  isLoading: boolean
  error: Error | null
  onLoadMore: () => void
  hasNextPage: boolean
  isFetchingNextPage: boolean
}

export function TransactionList({
  transactions,
  isLoading,
  error,
  onLoadMore,
  hasNextPage,
  isFetchingNextPage
}: TransactionListProps) {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  if (isLoading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-600">Loading transactions...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error loading transactions
          </h3>
          <p className="text-sm text-gray-600 max-w-md">
            {error.message}
          </p>
        </div>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <FileX className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No transactions found
          </h3>
          <p className="text-sm text-gray-600 max-w-md">
            Try adjusting the filters or create a new transaction to get started
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            All Transactions ({transactions.length})
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              onEdit={() => setEditingTransaction(transaction)}
            />
          ))}
        </div>

        {hasNextPage && (
          <div className="px-6 py-4 border-t border-gray-200 text-center">
            <Button
              variant="secondary"
              onClick={onLoadMore}
              disabled={isFetchingNextPage}
              className="w-full"
            >
              {isFetchingNextPage ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                'Load more transactions'
              )}
            </Button>
          </div>
        )}
      </div>

      <Modal
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        title="Edit Transaction"
        size="lg"
      >
        {editingTransaction && (
          <TransactionForm
            transaction={editingTransaction}
            onSuccess={() => setEditingTransaction(null)}
            onCancel={() => setEditingTransaction(null)}
          />
        )}
      </Modal>
    </>
  )
}
