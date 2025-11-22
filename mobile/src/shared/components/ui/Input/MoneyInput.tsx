/**
 * Componente MoneyInput
 *
 * Campo de entrada de valores monetários com formatação automática.
 * - Formata automaticamente em Real Brasileiro (BRL)
 * - Aceita apenas números
 * - Valor armazenado em centavos (número inteiro)
 */

import React, { useState, useEffect } from 'react';
import { Input } from './Input';
import type { MoneyInputProps } from './types';

/**
 * Formata um valor em centavos para moeda
 * @param valueInCents Valor em centavos (ex: 12345 = R$ 123,45)
 * @param currency Código da moeda
 * @param locale Locale para formatação
 */
function formatMoney(
  valueInCents: number,
  currency: string = 'BRL',
  locale: string = 'pt-BR'
): string {
  const valueInUnits = valueInCents / 100;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valueInUnits);
}

/**
 * Converte string formatada para centavos
 * @param formattedValue String formatada (ex: "R$ 123,45")
 */
function parseMoney(formattedValue: string): number {
  // Remove tudo exceto dígitos
  const digits = formattedValue.replace(/\D/g, '');

  // Converte para número (já está em centavos)
  return digits === '' ? 0 : parseInt(digits, 10);
}

export function MoneyInput({
  value,
  onChangeValue,
  currency = 'BRL',
  locale = 'pt-BR',
  label,
  error,
  helperText,
  disabled = false,
  required = false,
  containerClassName = '',
  className = '',
  accessibilityLabel,
  ...rest
}: MoneyInputProps) {
  const [displayValue, setDisplayValue] = useState('');

  // Atualiza o display quando o valor muda externamente
  useEffect(() => {
    setDisplayValue(formatMoney(value, currency, locale));
  }, [value, currency, locale]);

  const handleChangeText = (text: string) => {
    // Parse o valor em centavos
    const valueInCents = parseMoney(text);

    // Formata para exibição
    const formatted = formatMoney(valueInCents, currency, locale);
    setDisplayValue(formatted);

    // Notifica mudança
    onChangeValue(valueInCents);
  };

  return (
    <Input
      label={label}
      error={error}
      helperText={helperText}
      disabled={disabled}
      required={required}
      containerClassName={containerClassName}
      className={className}
      value={displayValue}
      onChangeText={handleChangeText}
      keyboardType="numeric"
      placeholder={formatMoney(0, currency, locale)}
      accessibilityLabel={accessibilityLabel || label || 'Valor em dinheiro'}
      accessibilityHint="Digite o valor em dinheiro"
      {...rest}
    />
  );
}
