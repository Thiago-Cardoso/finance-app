/**
 * View: TransactionForm
 *
 * Formulário para criar/editar transações.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Screen } from '@/shared/components/ui/Screen';
import { Input } from '@/shared/components/ui/Input';
import { MoneyInput } from '@/shared/components/ui/Input/MoneyInput';
import { DatePicker } from '@/shared/components/ui/DatePicker';
import { Button } from '@/shared/components/ui/Button';
import { useTheme } from '@/shared/hooks/useTheme';
import { useTransactionViewModel } from '@/viewModels/useTransaction.viewModel';
import { TransactionTypeSelector } from './components/TransactionTypeSelector';
import { CategorySelector } from './components/CategorySelector';
import { transactionSchema, type TransactionFormData } from '@/shared/schemas/transaction.schema';
import type { Transaction, TransactionType } from '@/shared/models/Transaction.model';

interface TransactionFormViewProps {
  transaction?: Transaction;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TransactionFormView({
  transaction,
  onSuccess,
  onCancel,
}: TransactionFormViewProps) {
  const { colors, theme } = useTheme();
  const { createTransaction, updateTransaction, isLoading, error, clearErrors } =
    useTransactionViewModel();

  const isEditing = !!transaction;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: transaction?.description || '',
      amount: transaction?.raw_amount || 0,
      transaction_type: transaction?.transaction_type || 'expense',
      date: transaction?.date || new Date().toISOString().split('T')[0],
      notes: transaction?.notes || '',
      category_id: transaction?.category?.id || null,
      account_id: transaction?.account?.id || null,
      transfer_account_id: transaction?.transfer_account?.id || null,
    },
    mode: 'onChange',
  });

  const transactionType = watch('transaction_type');

  // Clear category when type changes
  useEffect(() => {
    if (!isEditing) {
      setValue('category_id', null);
    }
  }, [transactionType, isEditing, setValue]);

  const onSubmit = async (data: TransactionFormData) => {
    clearErrors();

    const amount = typeof data.amount === 'string'
      ? parseFloat(data.amount) / 100
      : data.amount / 100;

    const payload = {
      description: data.description,
      amount,
      transaction_type: data.transaction_type,
      date: data.date,
      notes: data.notes || undefined,
      category_id: data.category_id || undefined,
      account_id: data.account_id || undefined,
      transfer_account_id: data.transfer_account_id || undefined,
    };

    let result;

    if (isEditing && transaction) {
      result = await updateTransaction(transaction.id, payload);
    } else {
      result = await createTransaction(payload);
    }

    if (result.success) {
      Alert.alert(
        'Sucesso',
        isEditing ? 'Transação atualizada!' : 'Transação criada!',
        [{ text: 'OK', onPress: onSuccess }]
      );
    }
  };

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Excluir Transação',
      'Tem certeza que deseja excluir esta transação?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            // TODO: Implement delete
            onSuccess();
          },
        },
      ]
    );
  }, [onSuccess]);

  return (
    <Screen
      title={isEditing ? 'Editar Transação' : 'Nova Transação'}
      showHeader
      showBackButton
      onBack={onCancel}
      scrollable={false}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Error Message */}
          {error && (
            <View
              className="p-3 rounded-lg mb-4"
              style={{ backgroundColor: `${theme.colors.error.DEFAULT}20` }}
            >
              <Text style={{ color: theme.colors.error.DEFAULT }}>{error}</Text>
            </View>
          )}

          {/* Transaction Type */}
          <View className="mb-4">
            <Text
              className="text-sm font-medium mb-2"
              style={{ color: colors.text.primary }}
            >
              Tipo
            </Text>
            <Controller
              control={control}
              name="transaction_type"
              render={({ field: { onChange, value } }) => (
                <TransactionTypeSelector
                  value={value}
                  onChange={onChange}
                  disabled={isLoading}
                  showTransfer={false}
                />
              )}
            />
          </View>

          {/* Amount */}
          <View className="mb-4">
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, value } }) => (
                <MoneyInput
                  label="Valor"
                  value={typeof value === 'number' ? value : 0}
                  onChangeValue={onChange}
                  error={errors.amount?.message}
                  required
                />
              )}
            />
          </View>

          {/* Description */}
          <View className="mb-4">
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Descrição"
                  placeholder="Ex: Almoço, Salário, etc."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.description?.message}
                  required
                />
              )}
            />
          </View>

          {/* Date */}
          <View className="mb-4">
            <Controller
              control={control}
              name="date"
              render={({ field: { onChange, value } }) => (
                <DatePicker
                  label="Data"
                  value={new Date(value + 'T00:00:00')}
                  onChange={(date) => {
                    const formatted = date.toISOString().split('T')[0];
                    onChange(formatted);
                  }}
                  maximumDate={new Date()}
                  error={errors.date?.message}
                />
              )}
            />
          </View>

          {/* Category */}
          {transactionType !== 'transfer' && (
            <View className="mb-4">
              <Controller
                control={control}
                name="category_id"
                render={({ field: { onChange, value } }) => (
                  <CategorySelector
                    value={value}
                    onChange={onChange}
                    categoryType={transactionType as 'income' | 'expense'}
                    error={errors.category_id?.message}
                    disabled={isLoading}
                  />
                )}
              />
            </View>
          )}

          {/* Notes */}
          <View className="mb-6">
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Observações (opcional)"
                  placeholder="Adicione uma nota..."
                  value={value || ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={3}
                  error={errors.notes?.message}
                />
              )}
            />
          </View>

          {/* Action Buttons */}
          <View className="gap-3 pb-8">
            <Button
              title={isEditing ? 'Salvar Alterações' : 'Criar Transação'}
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={isLoading}
            />

            {isEditing && (
              <TouchableOpacity
                onPress={handleDelete}
                disabled={isLoading}
                className="py-3 px-6 rounded-lg items-center justify-center"
                style={{
                  borderWidth: 2,
                  borderColor: theme.colors.error.DEFAULT,
                  opacity: isLoading ? 0.5 : 1,
                }}
              >
                <Text
                  className="text-base font-semibold"
                  style={{ color: theme.colors.error.DEFAULT }}
                >
                  Excluir Transação
                </Text>
              </TouchableOpacity>
            )}

            <Button
              title="Cancelar"
              variant="ghost"
              onPress={onCancel}
              disabled={isLoading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

export default TransactionFormView;
