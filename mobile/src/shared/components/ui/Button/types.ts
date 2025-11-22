import type { TouchableOpacityProps } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'children'> {
  /**
   * Texto do botão
   */
  title: string;

  /**
   * Função chamada ao pressionar o botão
   */
  onPress: () => void;

  /**
   * Variante visual do botão
   * @default 'primary'
   */
  variant?: ButtonVariant;

  /**
   * Tamanho do botão
   * @default 'md'
   */
  size?: ButtonSize;

  /**
   * Estado de carregamento
   * @default false
   */
  loading?: boolean;

  /**
   * Estado desabilitado
   * @default false
   */
  disabled?: boolean;

  /**
   * Ícone à esquerda do texto (componente Lucide)
   */
  leftIcon?: LucideIcon;

  /**
   * Ícone à direita do texto (componente Lucide)
   */
  rightIcon?: LucideIcon;

  /**
   * Classes CSS adicionais (NativeWind)
   */
  className?: string;

  /**
   * Label acessível para leitores de tela
   */
  accessibilityLabel?: string;
}
