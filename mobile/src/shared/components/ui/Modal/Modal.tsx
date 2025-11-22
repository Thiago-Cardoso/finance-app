/**
 * Componente Modal
 *
 * Modal fullscreen com backdrop e animações suaves.
 * - Animações de entrada/saída
 * - Backdrop com dismiss
 * - Acessibilidade completa
 */

import React from 'react';
import {
  Modal as RNModal,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  type ModalProps as RNModalProps,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';

export interface ModalProps extends Omit<RNModalProps, 'visible' | 'onRequestClose'> {
  /**
   * Se o modal está visível
   */
  visible: boolean;

  /**
   * Callback ao fechar o modal
   */
  onClose: () => void;

  /**
   * Conteúdo do modal
   */
  children: React.ReactNode;

  /**
   * Permitir fechar ao tocar no backdrop
   * @default true
   */
  dismissable?: boolean;

  /**
   * Mostrar botão de fechar (X)
   * @default true
   */
  showCloseButton?: boolean;

  /**
   * Classes CSS adicionais do container (NativeWind)
   */
  className?: string;

  /**
   * Label acessível
   */
  accessibilityLabel?: string;
}

export function Modal({
  visible,
  onClose,
  children,
  dismissable = true,
  showCloseButton = true,
  className = '',
  accessibilityLabel = 'Modal',
  ...rest
}: ModalProps) {
  const { colors } = useTheme();

  const handleBackdropPress = () => {
    if (dismissable) {
      onClose();
    }
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityViewIsModal={true}
      {...rest}
    >
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View
          className="flex-1 justify-center items-center px-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          {/* Modal Content */}
          <TouchableWithoutFeedback>
            <View
              className={`
                w-full max-w-lg rounded-lg p-6
                ${className}
              `}
              style={{ backgroundColor: colors.background }}
              accessible={true}
              accessibilityRole="dialog"
            >
              {/* Close Button */}
              {showCloseButton && (
                <TouchableOpacity
                  onPress={onClose}
                  className="absolute top-4 right-4 z-10"
                  hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                  accessible={true}
                  accessibilityLabel="Fechar modal"
                  accessibilityRole="button"
                  accessibilityHint="Toque duas vezes para fechar"
                >
                  <X size={24} color={colors.text.secondary} />
                </TouchableOpacity>
              )}

              {/* Content */}
              {children}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
}
