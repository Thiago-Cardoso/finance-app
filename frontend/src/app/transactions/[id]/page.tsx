'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTransaction, useDeleteTransaction } from '@/hooks/useTransactions'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { Button } from '@/components/ui/Button'
import { SimpleModal } from '@/components/ui/Modal/SimpleModal'
import { formatCurrency } from '@/lib/utils'
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Calendar,
  Tag,
  Wallet,
  FileText,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function TransactionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = parseInt(params.id as string)

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const { data, isLoading, error } = useTransaction(id)
  const deleteTransaction = useDeleteTransaction()

  const transaction = data?.data

  const handleDelete = async () => {
    try {
      await deleteTransaction.mutateAsync(id)
      router.push('/transactions')
    } catch (error) {
      console.error('Erro ao deletar transação:', error)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    } catch {
      return dateString
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Carregando transação...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center max-w-md">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Transação não encontrada
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                A transação solicitada não existe ou você não tem permissão para acessá-la.
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="secondary"
                  onClick={() => router.push('/dashboard')}
                >
                  Ir para Dashboard
                </Button>
                <Button onClick={() => router.push('/transactions')}>
                  Ver todas as transações
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const isIncome = transaction.transaction_type === 'income'
  const isExpense = transaction.transaction_type === 'expense'
  const isTransfer = transaction.transaction_type === 'transfer'
  const categoryColor = transaction.category?.color || '#6b7280'
  const amountColor = isIncome ? '#10b981' : isExpense ? '#f43f5e' : '#3b82f6'

  const transactionTypeLabel = isIncome ? 'Receita' : isExpense ? 'Despesa' : 'Transferência'
  const TransactionIcon = isIncome ? TrendingUp : isExpense ? TrendingDown : ArrowRight

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Navigation Buttons */}
        <div className="flex gap-3 mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push('/transactions')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Todas as transações</span>
          </Button>
        </div>

        {/* Transaction Detail Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="relative p-8 pb-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${categoryColor}20, ${categoryColor}40)`
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full shadow-md flex items-center justify-center"
                    style={{ backgroundColor: amountColor }}
                  >
                    <TransactionIcon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold shadow-sm"
                      style={{
                        backgroundColor: `${amountColor}15`,
                        color: amountColor
                      }}
                    >
                      {transactionTypeLabel}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {transaction.description}
                  </h1>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Editar</span>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Excluir</span>
                </Button>
              </div>
            </div>

            {/* Amount Display */}
            <div className="text-center py-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Valor</p>
              <p
                className="text-5xl font-black"
                style={{ color: amountColor }}
              >
                {isIncome && '+'}
                {isExpense && '-'}
                {formatCurrency(Math.abs(transaction.raw_amount))}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Data</p>
                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {formatDate(transaction.date)}
                </p>
              </div>
            </div>

            {/* Category */}
            {transaction.category && (
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: `${categoryColor}20`
                  }}
                >
                  <Tag className="w-5 h-5" style={{ color: categoryColor }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Categoria</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    {transaction.category.name}
                  </p>
                </div>
              </div>
            )}

            {/* Account */}
            {transaction.account && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                  <Wallet className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {isTransfer ? 'Conta de Origem' : 'Conta'}
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    {transaction.account.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {transaction.account.account_type}
                  </p>
                </div>
              </div>
            )}

            {/* Transfer Account */}
            {transaction.transfer_account && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <Wallet className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Conta de Destino</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    {transaction.transfer_account.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {transaction.transfer_account.account_type}
                  </p>
                </div>
              </div>
            )}

            {/* Notes */}
            {transaction.notes && (
              <div className="md:col-span-2 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Observações</p>
                  <p className="text-base text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {transaction.notes}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
              <span>
                Criado em: {format(new Date(transaction.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </span>
              {transaction.created_at !== transaction.updated_at && (
                <span>
                  Atualizado em: {format(new Date(transaction.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <SimpleModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Transação"
        size="lg"
      >
        <TransactionForm
          transaction={transaction}
          onSuccess={() => {
            setIsEditModalOpen(false)
            router.refresh()
          }}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </SimpleModal>

      {/* Delete Confirmation Modal */}
      <SimpleModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar Exclusão"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900 dark:text-red-100">
                Tem certeza que deseja excluir esta transação?
              </p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                Esta ação não pode ser desfeita.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Você está excluindo:</p>
            <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {transaction.description}
            </p>
            <p className="text-lg font-bold mt-2" style={{ color: amountColor }}>
              {isIncome && '+'}
              {isExpense && '-'}
              {formatCurrency(Math.abs(transaction.raw_amount))}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleteTransaction.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              loading={deleteTransaction.isPending}
              disabled={deleteTransaction.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir Transação
            </Button>
          </div>
        </div>
      </SimpleModal>
    </div>
  )
}
