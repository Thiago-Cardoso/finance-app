'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Transaction } from '@/types/transaction'
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/useTransactions'
import { useCategories } from '@/hooks/useCategories'
import { useAccounts } from '@/hooks/useAccounts'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { RadioGroup } from '@/components/ui/RadioGroup'
import { AlertCircle } from 'lucide-react'

const transactionSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.string()
    .min(1, 'Valor é obrigatório')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Valor deve ser um número positivo'
    }),
  transaction_type: z.enum(['income', 'expense', 'transfer']),
  date: z.string().min(1, 'Data é obrigatória'),
  category_id: z.string().optional(),
  account_id: z.string().optional(),
  transfer_account_id: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => {
  if (data.transaction_type === 'transfer') {
    return !!data.transfer_account_id
  }
  return true
}, {
  message: 'Conta de destino é obrigatória para transferências',
  path: ['transfer_account_id']
})

type TransactionFormData = z.infer<typeof transactionSchema>

interface TransactionFormProps {
  transaction?: Transaction
  onSuccess: () => void
  onCancel: () => void
}

export function TransactionForm({ transaction, onSuccess, onCancel }: TransactionFormProps) {
  const isEditing = !!transaction
  const [formError, setFormError] = useState<string | null>(null)
  const createTransaction = useCreateTransaction()
  const updateTransaction = useUpdateTransaction()
  const { data: categoryResponse } = useCategories()
  const { data: accountResponse } = useAccounts()

  const categories = Array.isArray(categoryResponse?.data) ? categoryResponse.data : []
  const accounts = Array.isArray(accountResponse?.data) ? accountResponse.data : []

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: transaction ? {
      description: transaction.description,
      amount: transaction.raw_amount.toString(),
      transaction_type: transaction.transaction_type,
      date: transaction.date,
      category_id: transaction.category?.id?.toString(),
      account_id: transaction.account?.id?.toString(),
      transfer_account_id: transaction.transfer_account?.id?.toString(),
      notes: transaction.notes || '',
    } : {
      transaction_type: 'expense',
      date: new Date().toISOString().split('T')[0],
    }
  })

  const transactionType = watch('transaction_type')

  const onSubmit = async (data: TransactionFormData) => {
    setFormError(null)
    try {
      const payload = {
        description: data.description,
        amount: parseFloat(data.amount),
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
      const message = error instanceof Error ? error.message : 'Erro ao salvar transação'
      setFormError(message)
      console.error('Erro ao salvar transação:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Transaction Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Tipo de Transação
        </label>
        <RadioGroup
          {...register('transaction_type')}
          value={watch('transaction_type')}
          onChange={(value) => setValue('transaction_type', value as any)}
          name="transaction_type"
          options={[
            { value: 'expense', label: 'Despesa', color: 'text-red-600' },
            { value: 'income', label: 'Receita', color: 'text-green-600' },
            { value: 'transfer', label: 'Transferência', color: 'text-blue-600' },
          ]}
        />
      </div>

      {/* Description */}
      <Input
        label="Descrição"
        {...register('description')}
        error={errors.description?.message}
        placeholder="Ex: Supermercado, Salário, Aluguel..."
        required
      />

      {/* Amount */}
      <Input
        label="Valor"
        type="number"
        step="0.01"
        {...register('amount')}
        error={errors.amount?.message}
        placeholder="0,00"
        required
      />

      {/* Date */}
      <Input
        label="Data"
        type="date"
        {...register('date')}
        error={errors.date?.message}
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category */}
        {transactionType !== 'transfer' && (
          <Select
            label="Categoria"
            {...register('category_id')}
            error={errors.category_id?.message}
            options={[
              { value: '', label: 'Selecione uma categoria' },
              ...(categories?.filter(cat =>
                cat.category_type === transactionType ||
                cat.category_type === 'both'
              ).map(cat => ({
                value: cat.id.toString(),
                label: cat.name
              })) || [])
            ]}
          />
        )}

        {/* Account */}
        <Select
          label="Conta"
          {...register('account_id')}
          error={errors.account_id?.message}
          options={[
            { value: '', label: 'Selecione uma conta' },
            ...(accounts?.map(account => ({
              value: account.id.toString(),
              label: account.name
            })) || [])
          ]}
        />

        {/* Transfer Account (only for transfers) */}
        {transactionType === 'transfer' && (
          <Select
            label="Conta de Destino"
            {...register('transfer_account_id')}
            error={errors.transfer_account_id?.message}
            options={[
              { value: '', label: 'Selecione uma conta' },
              ...(accounts?.map(account => ({
                value: account.id.toString(),
                label: account.name
              })) || [])
            ]}
          />
        )}
      </div>

      {/* Notes */}
      <Textarea
        label="Observações"
        {...register('notes')}
        error={errors.notes?.message}
        placeholder="Informações adicionais (opcional)"
        rows={3}
      />

      {/* Error Message */}
      {formError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Erro ao salvar transação</h3>
              <p className="text-sm text-red-700 mt-1">{formError}</p>
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
          Cancelar
        </Button>
        <Button
          type="submit"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {isEditing ? 'Atualizar' : 'Criar'} Transação
        </Button>
      </div>
    </form>
  )
}
