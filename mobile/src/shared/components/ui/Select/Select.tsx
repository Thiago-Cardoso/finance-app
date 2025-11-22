/**
 * Componente Select
 *
 * Campo de seleção simples com modal picker.
 * Para uma versão mais elaborada, considere usar @react-native-picker/picker.
 */

import React, { useState } from 'react';
import { TouchableOpacity, Text, View, FlatList } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { Modal } from '../Modal';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  /**
   * Label do select
   */
  label?: string;

  /**
   * Valor selecionado
   */
  value: string;

  /**
   * Opções disponíveis
   */
  options: SelectOption[];

  /**
   * Callback quando o valor muda
   */
  onValueChange: (value: string) => void;

  /**
   * Placeholder quando nenhum valor está selecionado
   */
  placeholder?: string;

  /**
   * Mensagem de erro
   */
  error?: string;

  /**
   * Campo desabilitado
   * @default false
   */
  disabled?: boolean;

  /**
   * Classes CSS adicionais do container (NativeWind)
   */
  containerClassName?: string;
}

export function Select({
  label,
  value,
  options,
  onValueChange,
  placeholder = 'Selecione uma opção',
  error,
  disabled = false,
  containerClassName = '',
}: SelectProps) {
  const { colors, theme } = useTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = selectedOption?.label || placeholder;

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setIsModalVisible(false);
  };

  const hasError = Boolean(error);
  const borderColor = hasError ? theme.colors.error.DEFAULT : colors.border;

  return (
    <View className={containerClassName}>
      {/* Label */}
      {label && (
        <Text
          className="text-sm font-medium mb-2"
          style={{ color: colors.text.primary }}
        >
          {label}
        </Text>
      )}

      {/* Select Trigger */}
      <TouchableOpacity
        onPress={() => !disabled && setIsModalVisible(true)}
        className={`
          flex-row items-center justify-between
          px-4 py-3 rounded-lg
          ${disabled ? 'opacity-50' : 'opacity-100'}
        `}
        style={{
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor,
        }}
        disabled={disabled}
        accessible={true}
        accessibilityLabel={label}
        accessibilityHint="Toque para selecionar uma opção"
        accessibilityRole="button"
        accessibilityState={{ disabled }}
      >
        <Text
          className="text-base flex-1"
          style={{
            color: selectedOption ? colors.text.primary : colors.text.disabled,
          }}
        >
          {displayValue}
        </Text>
        <ChevronDown size={20} color={colors.text.secondary} />
      </TouchableOpacity>

      {/* Error Message */}
      {error && (
        <Text
          className="text-sm mt-1"
          style={{ color: theme.colors.error.DEFAULT }}
        >
          {error}
        </Text>
      )}

      {/* Options Modal */}
      <Modal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        accessibilityLabel={`Selecionar ${label || 'opção'}`}
      >
        <Text
          className="text-xl font-bold mb-4"
          style={{ color: colors.text.primary }}
        >
          {label || 'Selecione'}
        </Text>

        <FlatList
          data={options}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleSelect(item.value)}
              className="py-3 px-4 rounded-lg mb-2"
              style={{
                backgroundColor:
                  item.value === value ? colors.surfaceHover : 'transparent',
              }}
              accessible={true}
              accessibilityLabel={item.label}
              accessibilityRole="button"
              accessibilityState={{ selected: item.value === value }}
            >
              <Text
                className="text-base"
                style={{
                  color:
                    item.value === value
                      ? theme.colors.primary.DEFAULT
                      : colors.text.primary,
                  fontWeight: item.value === value ? '600' : '400',
                }}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </Modal>
    </View>
  );
}
