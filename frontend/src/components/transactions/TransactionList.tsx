'use client'

import { useState } from 'react'
import { Transaction } from '@/types/transaction'
import { TransactionItem } from './TransactionItem'
import { TransactionItemSkeleton } from './TransactionItemSkeleton'
import { TransactionForm } from './TransactionForm'
import { SimpleModal } from '@/components/ui/Modal/SimpleModal'
import { Button } from '@/components/ui/Button'
import { Loader2, AlertCircle, Receipt, Plus } from 'lucide-react'

interface TransactionListProps {
  transactions: Transaction[]
  isLoading: boolean
  error: Error | null
  onLoadMore: () => void
  hasNextPage: boolean
  isFetchingNextPage: boolean
  hasActiveFilters?: boolean
  onClearFilters?: () => void
  onCreateTransaction?: () => void
}

export function TransactionList({
  transactions,
  isLoading,
  error,
  onLoadMore,
  hasNextPage,
  isFetchingNextPage,
  hasActiveFilters = false,
  onClearFilters,
  onCreateTransaction
}: TransactionListProps) {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  if (isLoading && transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="divide-y divide-gray-200 dark:border-gray-700">
          {[...Array(8)].map((_, i) => (
            <TransactionItemSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Erro ao carregar transações
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            {error.message}
          </p>
        </div>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 mb-6">
            <Receipt className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            {hasActiveFilters ? 'Nenhuma transação encontrada' : 'Nenhuma transação ainda'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
            {hasActiveFilters
              ? 'Tente ajustar seus filtros para encontrar o que está procurando'
              : 'Comece criando sua primeira transação para acompanhar suas finanças'}
          </p>
          <div className="flex gap-3 justify-center">
            {hasActiveFilters && onClearFilters && (
              <Button
                variant="secondary"
                onClick={onClearFilters}
                className="shadow-md hover:shadow-lg transition-all duration-200"
              >
                Limpar Filtros
              </Button>
            )}
            {onCreateTransaction && (
              <Button
                onClick={onCreateTransaction}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                {hasActiveFilters ? 'Criar Transação' : 'Criar Sua Primeira Transação'}
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Todas as Transações <span className="text-blue-600 dark:text-blue-400">({transactions.length})</span>
          </h2>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {transactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              onEdit={() => setEditingTransaction(transaction)}
            />
          ))}
        </div>

        {hasNextPage && (
          <div className="px-6 py-6 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50">
            <Button
              variant="secondary"
              onClick={onLoadMore}
              disabled={isFetchingNextPage}
              className="w-full shadow-md hover:shadow-lg transition-all duration-200 min-h-[44px]"
            >
              {isFetchingNextPage ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Carregando mais...
                </>
              ) : (
                'Carregar Mais Transações'
              )}
            </Button>
          </div>
        )}

        {isFetchingNextPage && (
          <div className="border-t border-gray-200 dark:border-gray-700">
            {[...Array(3)].map((_, i) => (
              <TransactionItemSkeleton key={i} />
            ))}
          </div>
        )}
      </div>

      <SimpleModal
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        title="Editar Transação"
        size="lg"
      >
        {editingTransaction && (
          <TransactionForm
            transaction={editingTransaction}
            onSuccess={() => setEditingTransaction(null)}
            onCancel={() => setEditingTransaction(null)}
          />
        )}
      </SimpleModal>
    </>
  )
}
