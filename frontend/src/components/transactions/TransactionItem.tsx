'use client'

import { useState } from 'react'
import { Transaction } from '@/types/transaction'
import { useDeleteTransaction } from '@/hooks/useTransactions'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { Edit2, Trash2 } from 'lucide-react'

interface TransactionItemProps {
  transaction: Transaction
  onEdit: () => void
}

export function TransactionItem({ transaction, onEdit }: TransactionItemProps) {
  const [showActions, setShowActions] = useState(false)
  const deleteTransaction = useDeleteTransaction()

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      try {
        await deleteTransaction.mutateAsync(transaction.id)
      } catch (error) {
        console.error('Erro ao excluir transação:', error)
      }
    }
  }

  const isIncome = transaction.transaction_type === 'income'
  const isExpense = transaction.transaction_type === 'expense'

  // Get amount value with fallback
  const getAmountValue = () => {
    // Try raw_amount first (number)
    if (transaction.raw_amount !== undefined && transaction.raw_amount !== null) {
      return Math.abs(Number(transaction.raw_amount))
    }
    // Fallback to amount (string) - parse and remove any non-numeric characters except decimal point
    if (transaction.amount) {
      const cleanAmount = transaction.amount.toString().replace(/[^\d.-]/g, '')
      return Math.abs(Number(cleanAmount))
    }
    return 0
  }

  const amountValue = getAmountValue()

  return (
    <div
      className="px-6 py-4 hover:bg-gray-50 transition-colors"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          {/* Category Color Indicator */}
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: transaction.category?.color || '#6b7280' }}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {transaction.description}
              </h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 flex-shrink-0">
                {transaction.category?.name || 'Sem categoria'}
              </span>
            </div>

            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
              <span>{formatDate(transaction.date)}</span>
              {transaction.account && (
                <span>• {transaction.account.name}</span>
              )}
              {transaction.notes && (
                <span className="truncate">• {transaction.notes}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4 flex-shrink-0">
          {/* Amount */}
          <div className="text-right">
            <div
              className={cn(
                'text-lg font-semibold',
                isIncome && 'text-green-600',
                isExpense && 'text-red-600',
                transaction.transaction_type === 'transfer' && 'text-blue-600'
              )}
            >
              {isIncome && '+'}
              {isExpense && '-'}
              {formatCurrency(amountValue)}
            </div>
            <div className="text-xs text-gray-500 capitalize">
              {transaction.transaction_type === 'income' && 'Receita'}
              {transaction.transaction_type === 'expense' && 'Despesa'}
              {transaction.transaction_type === 'transfer' && 'Transferência'}
            </div>
          </div>

          {/* Actions */}
          <div className={cn(
            'flex items-center space-x-2 transition-opacity',
            showActions ? 'opacity-100' : 'opacity-0'
          )}>
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="p-2"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deleteTransaction.isPending}
              className="p-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
