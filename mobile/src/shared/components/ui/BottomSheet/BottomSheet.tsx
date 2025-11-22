/**
 * Componente BottomSheet
 *
 * BottomSheet com drag, backdrop e animações suaves.
 * Usa @gorhom/bottom-sheet para funcionalidade completa.
 */

import React, { forwardRef, useMemo } from 'react';
import { View, Text } from 'react-native';
import RNBottomSheet, {
  type BottomSheetProps as RNBottomSheetProps,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useTheme } from '@/shared/hooks/useTheme';

export interface BottomSheetProps extends Partial<RNBottomSheetProps> {
  /**
   * Conteúdo do BottomSheet
   */
  children: React.ReactNode;

  /**
   * Pontos de snap (porcentagens ou valores absolutos)
   * @default ['25%', '50%', '90%']
   */
  snapPoints?: Array<string | number>;

  /**
   * Título opcional
   */
  title?: string;

  /**
   * Mostrar indicador de drag
   * @default true
   */
  enableHandlePanningGesture?: boolean;

  /**
   * Mostrar backdrop
   * @default true
   */
  enableBackdrop?: boolean;
}

export const BottomSheet = forwardRef<RNBottomSheet, BottomSheetProps>(
  (
    {
      children,
      snapPoints: customSnapPoints,
      title,
      enableHandlePanningGesture = true,
      enableBackdrop = true,
      ...rest
    },
    ref
  ) => {
    const { colors } = useTheme();

    const snapPoints = useMemo(
      () => customSnapPoints || ['25%', '50%', '90%'],
      [customSnapPoints]
    );

    const renderBackdrop = (props: BottomSheetBackdropProps) =>
      enableBackdrop ? (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ) : null;

    return (
      <RNBottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        enableHandlePanningGesture={enableHandlePanningGesture}
        backdropComponent={renderBackdrop}
        backgroundStyle={{
          backgroundColor: colors.background,
        }}
        handleIndicatorStyle={{
          backgroundColor: colors.border,
        }}
        {...rest}
      >
        <View className="flex-1 px-4">
          {title && (
            <Text
              className="text-xl font-bold mb-4"
              style={{ color: colors.text.primary }}
              accessible={true}
              accessibilityRole="header"
            >
              {title}
            </Text>
          )}
          {children}
        </View>
      </RNBottomSheet>
    );
  }
);

BottomSheet.displayName = 'BottomSheet';
