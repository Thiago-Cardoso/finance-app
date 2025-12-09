/**
 * Currency Input Component
 *
 * Input com máscara de moeda brasileira (R$)
 */

import React, { useState, useCallback } from 'react';
import { TextInput, type TextInputProps } from 'react-native';

interface CurrencyInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  value: number;
  onChangeValue: (value: number) => void;
}

const formatCurrencyDisplay = (num: number): string => {
  if (num === 0 || isNaN(num)) return '';

  const formatted = num.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `R$ ${formatted}`;
};

export function CurrencyInput({ value, onChangeValue, ...rest }: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState(formatCurrencyDisplay(value));

  const handleChangeText = useCallback(
    (text: string) => {
      // Remove tudo exceto dígitos
      const digitsOnly = text.replace(/\D/g, '');

      if (digitsOnly === '') {
        setDisplayValue('');
        onChangeValue(0);
        return;
      }

      // Converte para número (divide por 100 para considerar centavos)
      const numericValue = parseInt(digitsOnly, 10) / 100;

      // Formata para exibição
      const formatted = formatCurrencyDisplay(numericValue);
      setDisplayValue(formatted);

      // Retorna o valor numérico
      onChangeValue(numericValue);
    },
    [onChangeValue]
  );

  return (
    <TextInput
      {...rest}
      value={displayValue}
      onChangeText={handleChangeText}
      keyboardType="numeric"
      placeholder="R$ 0,00"
    />
  );
}
