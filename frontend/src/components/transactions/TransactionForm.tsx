'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Transaction, Account } from '@/types/transaction'
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/useTransactions'
import { useCategories } from '@/hooks/useCategories'
import { useAccounts } from '@/hooks/useAccounts'
import { useLocale } from '@/contexts/LocaleContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { RadioGroup } from '@/components/ui/RadioGroup'
import { AlertCircle } from 'lucide-react'

import { createTransactionFormSchema, type TransactionFormData } from '@/lib/validations'

interface TransactionFormProps {
  transaction?: Transaction
  initialType?: 'income' | 'expense' | 'transfer'
  onSuccess: () => void
  onCancel: () => void
}

export function TransactionForm({ transaction, initialType, onSuccess, onCancel }: TransactionFormProps) {
  const { t } = useLocale()
  const isEditing = !!transaction
  const [formError, setFormError] = useState<string | null>(null)
  const createTransaction = useCreateTransaction()
  const updateTransaction = useUpdateTransaction()
  const { data: categoryResponse } = useCategories(undefined, 1, 100) // Fetch all categories (up to 100)
  const { data: accountsData } = useAccounts()

  const categories = Array.isArray(categoryResponse?.data) ? categoryResponse.data : []
  const accounts = Array.isArray(accountsData) ? accountsData : []

  // Get current date in local timezone (YYYY-MM-DD)
  const getTodayDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }


  const formatCurrency = (value: string): string => {
    const numbers = value.replace(/\D/g, '')
    if (!numbers) return ''


    const amount = parseInt(numbers) / 100

    return amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  const parseCurrency = (value: string): string => {
    return value.replace(/\./g, '').replace(',', '.')
  }

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<TransactionFormData>({
    resolver: zodResolver(createTransactionFormSchema(t)),
    defaultValues: transaction ? {
      description: transaction.description || '',
      amount: transaction.raw_amount
        ? formatCurrency((transaction.raw_amount * 100).toString())
        : transaction.amount
          ? formatCurrency((parseFloat(transaction.amount) * 100).toString())
          : '',
      transaction_type: transaction.transaction_type || 'expense',
      date: transaction.date || getTodayDate(),
      category_id: transaction.category?.id?.toString() || '',
      account_id: transaction.account?.id?.toString() || '',
      transfer_account_id: transaction.transfer_account?.id?.toString() || '',
      notes: transaction.notes || '',
    } : {
      transaction_type: initialType || 'expense',
      date: getTodayDate(),
      description: '',
      amount: '',
    }
  })

  // Reset form when transaction changes (for editing)
  useEffect(() => {
    if (transaction) {
      reset({
        description: transaction.description || '',
        amount: transaction.raw_amount
          ? formatCurrency((transaction.raw_amount * 100).toString())
          : transaction.amount
            ? formatCurrency((parseFloat(transaction.amount) * 100).toString())
            : '',
        transaction_type: transaction.transaction_type || 'expense',
        date: transaction.date || getTodayDate(),
        category_id: transaction.category?.id?.toString() || '',
        account_id: transaction.account?.id?.toString() || '',
        transfer_account_id: transaction.transfer_account?.id?.toString() || '',
        notes: transaction.notes || '',
      })
    }
  }, [transaction, reset])

  const transactionType = watch('transaction_type')

  const onSubmit = async (data: TransactionFormData) => {
    setFormError(null)
    try {
      const numericAmount = parseFloat(parseCurrency(data.amount))

      const payload = {
        description: data.description,
        amount: numericAmount,
        transaction_type: data.transaction_type,
        date: data.date,
        notes: data.notes || undefined,
        category_id: data.category_id ? parseInt(data.category_id) : undefined,
        account_id: data.account_id ? parseInt(data.account_id) : undefined,
        transfer_account_id: data.transfer_account_id ? parseInt(data.transfer_account_id) : undefined,
      }

      if (isEditing) {
        await updateTransaction.mutateAsync({
          id: transaction.id,
          data: payload
        })
      } else {
        await createTransaction.mutateAsync(payload)
      }

      onSuccess()
    } catch (error) {
      const message = error instanceof Error ? error.message : t('transactions.errors.createFailed')
      setFormError(message)
      console.error('Error saving transaction:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Transaction Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {t('transactions.fields.type')}
        </label>
        <RadioGroup
          {...register('transaction_type')}
          value={watch('transaction_type')}
          onChange={(value) => setValue('transaction_type', value as 'income' | 'expense' | 'transfer')}
          name="transaction_type"
          options={[
            { value: 'expense', label: t('transactions.types.expense'), color: 'text-red-600' },
            { value: 'income', label: t('transactions.types.income'), color: 'text-green-600' },
            { value: 'transfer', label: t('transactions.types.transfer'), color: 'text-blue-600' },
          ]}
        />
      </div>

      {/* Description */}
      <Input
        label={t('transactions.fields.description')}
        {...register('description')}
        error={errors.description?.message}
        placeholder={t('transactions.fields.description')}
        required
      />

      {/* Amount */}
      <Input
        label={t('transactions.fields.amount')}
        type="text"
        inputMode="decimal"
        {...register('amount')}
        error={errors.amount?.message}
        placeholder="0,00"
        required
        onChange={(e) => {
          const formatted = formatCurrency(e.target.value)
          setValue('amount', formatted)
        }}
      />

      {/* Date */}
      <Input
        label={t('transactions.fields.date')}
        type="date"
        {...register('date')}
        error={errors.date?.message}
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category */}
        {transactionType !== 'transfer' && (
          <Select
            label={t('transactions.fields.category')}
            {...register('category_id')}
            error={errors.category_id?.message}
            options={[
              { value: '', label: t('common.select') },
              ...(categories?.filter(cat =>
                cat.category_type === transactionType
              ).map(cat => ({
                value: cat.id.toString(),
                label: cat.name
              })) || [])
            ]}
          />
        )}

        {/* Account */}
        <Select
          label={t('transactions.fields.account')}
          {...register('account_id')}
          error={errors.account_id?.message}
          options={[
            { value: '', label: t('common.select') },
            ...(accounts?.map((account: { id: number; name: string }) => ({
              value: account.id.toString(),
              label: account.name
            })) || [])
          ]}
        />

        {/* Transfer Account (only for transfers) */}
        {transactionType === 'transfer' && (
          <Select
            label={t('transactions.fields.transferAccount')}
            {...register('transfer_account_id')}
            error={errors.transfer_account_id?.message}
            options={[
              { value: '', label: t('common.select') },
              ...(accounts?.map((account: Account) => ({
                value: account.id.toString(),
                label: account.name
              })) || [])
            ]}
          />
        )}
      </div>

      {/* Notes */}
      <Textarea
        label={t('transactions.fields.notes')}
        {...register('notes')}
        error={errors.notes?.message}
        placeholder={t('transactions.fields.notes')}
        rows={3}
      />

      {/* Error Message */}
      {formError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300">{t('transactions.errors.createFailed')}</h3>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">{formError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {t('common.cancel')}
        </Button>
        <Button
          type="submit"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {isEditing ? t('common.update') : t('common.create')}
        </Button>
      </div>
    </form>
  )
}
