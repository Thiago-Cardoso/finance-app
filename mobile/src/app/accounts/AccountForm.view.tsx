/**
 * View: AccountForm
 *
 * Formulário para criar/editar contas.
 */

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Screen } from '@/shared/components/ui/Screen';
import { Button } from '@/shared/components/ui/Button';
import { useTheme } from '@/shared/hooks/useTheme';
import { useAccountViewModel } from '@/viewModels/useAccount.viewModel';
import { accountSchema, getDefaultAccountValues } from '@/shared/schemas/account.schema';
import { getAccountIcon, ACCOUNT_TYPE_ICONS } from '@/shared/constants/icons';
import { ACCOUNT_TYPE_LABELS } from '@/shared/models/Account.model';
import type { Account, AccountFormData, AccountType } from '@/shared/models/Account.model';
import type { AccountSchemaType } from '@/shared/schemas/account.schema';

/**
 * Formata um valor numérico para moeda brasileira (1234.56 -> "1.234,56")
 */
function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Converte string de centavos para valor numérico (ex: "123456" -> 1234.56)
 */
function centsToNumber(cents: string): number {
  const numCents = parseInt(cents, 10) || 0;
  return numCents / 100;
}

interface AccountFormViewProps {
  account?: Account;
  onSuccess: () => void;
  onBack: () => void;
}

const ACCOUNT_TYPES: AccountType[] = ['checking', 'savings', 'credit_card', 'cash', 'investment'];

export function AccountFormView({ account, onSuccess, onBack }: AccountFormViewProps) {
  const { colors, theme } = useTheme();
  const { createAccount, updateAccount, isLoading } = useAccountViewModel();

  const isEditing = !!account;

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AccountSchemaType>({
    resolver: zodResolver(accountSchema) as any,
    defaultValues: account
      ? {
          name: account.name,
          account_type: account.account_type,
          initial_balance: account.initial_balance,
          icon: account.icon,
          color: account.color,
        }
      : getDefaultAccountValues(),
  });

  const selectedType = watch('account_type');

  const onSubmit: SubmitHandler<AccountSchemaType> = useCallback(
    async (data) => {
      const formData: AccountFormData = {
        name: data.name,
        account_type: data.account_type,
        initial_balance: data.initial_balance,
        icon: data.icon,
        color: data.color,
      };

      let result;
      if (isEditing && account) {
        result = await updateAccount(account.id, formData);
      } else {
        result = await createAccount(formData);
      }

      if (result.success) {
        Alert.alert(
          'Sucesso',
          isEditing ? 'Conta atualizada!' : 'Conta criada!',
          [{ text: 'OK', onPress: onSuccess }]
        );
      } else {
        Alert.alert('Erro', result.error || 'Erro ao salvar conta');
      }
    },
    [isEditing, account, createAccount, updateAccount, onSuccess]
  );

  return (
    <Screen
      title={isEditing ? 'Editar Conta' : 'Nova Conta'}
      showHeader
      showBackButton
      onBack={onBack}
      scrollable={false}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Nome da Conta */}
        <View className="mb-6">
          <Text
            className="text-sm font-medium mb-2"
            style={{ color: colors.text.primary }}
          >
            Nome da Conta *
          </Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <TextInput
                className="p-4 rounded-xl text-base"
                style={{
                  backgroundColor: colors.card,
                  color: colors.text.primary,
                  borderWidth: errors.name ? 1 : 0,
                  borderColor: theme.colors.error.DEFAULT,
                }}
                placeholder="Ex: Nubank, Carteira, Inter..."
                placeholderTextColor={colors.text.secondary}
                value={value}
                onChangeText={onChange}
                maxLength={50}
              />
            )}
          />
          {errors.name && (
            <Text className="text-xs mt-1" style={{ color: theme.colors.error.DEFAULT }}>
              {errors.name.message}
            </Text>
          )}
        </View>

        {/* Tipo de Conta */}
        <View className="mb-6">
          <Text
            className="text-sm font-medium mb-2"
            style={{ color: colors.text.primary }}
          >
            Tipo de Conta *
          </Text>
          <Controller
            control={control}
            name="account_type"
            render={({ field: { onChange, value } }) => (
              <View className="flex-row flex-wrap">
                {ACCOUNT_TYPES.map((type) => {
                  const IconComponent = getAccountIcon(type);
                  const isSelected = value === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      onPress={() => onChange(type)}
                      className="w-[48%] p-3 rounded-xl mb-2 mr-[2%] flex-row items-center"
                      style={{
                        backgroundColor: isSelected
                          ? `${theme.colors.primary.DEFAULT}15`
                          : colors.card,
                        borderWidth: isSelected ? 1 : 0,
                        borderColor: theme.colors.primary.DEFAULT,
                      }}
                    >
                      <View
                        className="w-10 h-10 rounded-full items-center justify-center mr-3"
                        style={{
                          backgroundColor: isSelected
                            ? theme.colors.primary.DEFAULT
                            : colors.border,
                        }}
                      >
                        <IconComponent
                          size={20}
                          color={isSelected ? '#FFFFFF' : colors.text.secondary}
                        />
                      </View>
                      <Text
                        className="text-sm flex-1"
                        style={{
                          color: isSelected
                            ? theme.colors.primary.DEFAULT
                            : colors.text.primary,
                          fontWeight: isSelected ? '600' : '400',
                        }}
                        numberOfLines={1}
                      >
                        {ACCOUNT_TYPE_LABELS[type]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          />
          {errors.account_type && (
            <Text className="text-xs mt-1" style={{ color: theme.colors.error.DEFAULT }}>
              {errors.account_type.message}
            </Text>
          )}
        </View>

        {/* Saldo Inicial */}
        <View className="mb-6">
          <Text
            className="text-sm font-medium mb-2"
            style={{ color: colors.text.primary }}
          >
            Saldo Inicial *
          </Text>
          <Controller
            control={control}
            name="initial_balance"
            render={({ field: { onChange, value } }) => {
              // Mantém o valor em centavos como string para manipulação
              const [displayValue, setDisplayValue] = React.useState(() =>
                value ? formatCurrency(value) : '0,00'
              );

              const handleChangeText = (text: string) => {
                // Remove tudo que não é número
                const onlyNumbers = text.replace(/\D/g, '');

                // Converte para número (centavos)
                const numValue = centsToNumber(onlyNumbers);

                // Atualiza o display formatado
                setDisplayValue(formatCurrency(numValue));

                // Atualiza o valor do form
                onChange(numValue);
              };

              return (
                <View
                  className="p-4 rounded-xl flex-row items-center"
                  style={{
                    backgroundColor: colors.card,
                    borderWidth: errors.initial_balance ? 1 : 0,
                    borderColor: theme.colors.error.DEFAULT,
                  }}
                >
                  <Text
                    className="text-lg mr-2"
                    style={{ color: colors.text.secondary }}
                  >
                    R$
                  </Text>
                  <TextInput
                    className="flex-1 text-lg"
                    style={{ color: colors.text.primary }}
                    placeholder="0,00"
                    placeholderTextColor={colors.text.secondary}
                    keyboardType="numeric"
                    value={displayValue}
                    onChangeText={handleChangeText}
                  />
                </View>
              );
            }}
          />
          {errors.initial_balance && (
            <Text className="text-xs mt-1" style={{ color: theme.colors.error.DEFAULT }}>
              {errors.initial_balance.message}
            </Text>
          )}
          <Text className="text-xs mt-1" style={{ color: colors.text.secondary }}>
            {isEditing
              ? 'Alterar o saldo inicial não afeta o saldo atual calculado.'
              : 'Informe o saldo atual da conta. Para cartões de crédito, use 0.'}
          </Text>
        </View>

        {/* Info */}
        <View
          className="p-4 rounded-xl mb-6"
          style={{ backgroundColor: `${theme.colors.primary.DEFAULT}10` }}
        >
          <Text className="text-xs" style={{ color: colors.text.secondary }}>
            O saldo atual da conta será atualizado automaticamente conforme você
            registrar transações. Você pode criar até 20 contas.
          </Text>
        </View>

        {/* Submit Button */}
        <Button
          title={isEditing ? 'Salvar Alterações' : 'Criar Conta'}
          onPress={handleSubmit(onSubmit as any)}
          loading={isLoading}
          disabled={isLoading}
        />
      </ScrollView>
    </Screen>
  );
}

export default AccountFormView;
