/**
 * Componente DatePicker
 *
 * Seletor de data nativo para iOS e Android.
 * Usa @react-native-community/datetimepicker.
 */

import React, { useState } from 'react';
import { TouchableOpacity, Text, View, Platform } from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';

export interface DatePickerProps {
  /**
   * Label do DatePicker
   */
  label?: string;

  /**
   * Data selecionada
   */
  value: Date;

  /**
   * Callback quando a data muda
   */
  onChange: (date: Date) => void;

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
   * Data mínima selecionável
   */
  minimumDate?: Date;

  /**
   * Data máxima selecionável
   */
  maximumDate?: Date;

  /**
   * Formato de exibição da data
   * @default 'dd/MM/yyyy'
   */
  displayFormat?: 'dd/MM/yyyy' | 'MM/dd/yyyy' | 'yyyy-MM-dd';

  /**
   * Classes CSS adicionais do container (NativeWind)
   */
  containerClassName?: string;
}

/**
 * Formata data para exibição
 */
function formatDate(date: Date, format: string = 'dd/MM/yyyy'): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  switch (format) {
    case 'MM/dd/yyyy':
      return `${month}/${day}/${year}`;
    case 'yyyy-MM-dd':
      return `${year}-${month}-${day}`;
    case 'dd/MM/yyyy':
    default:
      return `${day}/${month}/${year}`;
  }
}

export function DatePicker({
  label,
  value,
  onChange,
  error,
  disabled = false,
  minimumDate,
  maximumDate,
  displayFormat = 'dd/MM/yyyy',
  containerClassName = '',
}: DatePickerProps) {
  const { colors, theme } = useTheme();
  const [showPicker, setShowPicker] = useState(false);

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    // No Android, o picker fecha automaticamente
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    if (event.type === 'set' && selectedDate) {
      onChange(selectedDate);
    }
  };

  const handlePress = () => {
    if (!disabled) {
      setShowPicker(true);
    }
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

      {/* Date Display */}
      <TouchableOpacity
        onPress={handlePress}
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
        accessibilityLabel={label || 'Selecionar data'}
        accessibilityHint="Toque para abrir o seletor de data"
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        accessibilityValue={{ text: formatDate(value, displayFormat) }}
      >
        <Text className="text-base flex-1" style={{ color: colors.text.primary }}>
          {formatDate(value, displayFormat)}
        </Text>
        <Calendar size={20} color={colors.text.secondary} />
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

      {/* Native Picker */}
      {showPicker && (
        <DateTimePicker
          value={value}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          textColor={colors.text.primary}
          // No iOS, adicionar botões de cancelar/confirmar
          {...(Platform.OS === 'ios' && {
            onTouchCancel: () => setShowPicker(false),
          })}
        />
      )}
    </View>
  );
}
