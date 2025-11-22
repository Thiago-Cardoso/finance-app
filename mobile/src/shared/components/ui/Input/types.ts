import type { TextInputProps } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

export interface InputProps extends Omit<TextInputProps, 'editable'> {
  /**
   * Label do input
   */
  label?: string;

  /**
   * Mensagem de erro
   */
  error?: string;

  /**
   * Texto de ajuda/descrição
   */
  helperText?: string;

  /**
   * Ícone à esquerda (componente Lucide)
   */
  leftIcon?: LucideIcon;

  /**
   * Ícone à direita (componente Lucide)
   */
  rightIcon?: LucideIcon;

  /**
   * Campo obrigatório (adiciona asterisco no label)
   * @default false
   */
  required?: boolean;

  /**
   * Campo desabilitado
   * @default false
   */
  disabled?: boolean;

  /**
   * Classes CSS adicionais do container (NativeWind)
   */
  containerClassName?: string;

  /**
   * Classes CSS adicionais do input (NativeWind)
   */
  className?: string;
}

export interface MoneyInputProps extends Omit<InputProps, 'value' | 'onChangeText' | 'keyboardType'> {
  /**
   * Valor numérico (em centavos)
   */
  value: number;

  /**
   * Callback quando o valor mudar
   */
  onChangeValue: (value: number) => void;

  /**
   * Código da moeda (ISO 4217)
   * @default 'BRL'
   */
  currency?: string;

  /**
   * Locale para formatação
   * @default 'pt-BR'
   */
  locale?: string;
}
