'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

function NewTransactionContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get('type') as 'income' | 'expense' | 'transfer' | null

  const handleSuccess = () => {
    router.push('/transactions')
  }

  const handleCancel = () => {
    router.push('/transactions')
  }

  const getTitle = () => {
    switch (type) {
      case 'income':
        return 'Nova Receita'
      case 'expense':
        return 'Nova Despesa'
      case 'transfer':
        return 'Nova Transferência'
      default:
        return 'Nova Transação'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/transactions"
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar para transações
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {getTitle()}
          </h1>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <TransactionForm
            initialType={type || undefined}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  )
}

export default function NewTransactionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Carregando...</div>
      </div>
    }>
      <NewTransactionContent />
    </Suspense>
  )
}
