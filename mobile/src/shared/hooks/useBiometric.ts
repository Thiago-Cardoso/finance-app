/**
 * Hook: useBiometric
 *
 * Gerencia autenticação biométrica (Touch ID / Face ID).
 */

import { useState, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BIOMETRIC_ENABLED_KEY = '@finance-app:biometric_enabled';

interface BiometricResult {
  success: boolean;
  error?: string;
}

export function useBiometric() {
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [isBiometricEnrolled, setIsBiometricEnrolled] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState<string | null>(null);

  /**
   * Verifica se o dispositivo suporta biometria
   */
  useEffect(() => {
    checkBiometricSupport();
    loadBiometricPreference();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricSupported(compatible);

      if (compatible) {
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setIsBiometricEnrolled(enrolled);

        if (enrolled) {
          const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

          if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
            setBiometricType('Face ID');
          } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
            setBiometricType('Touch ID');
          } else {
            setBiometricType('Biometria');
          }
        }
      }
    } catch (error) {
      console.error('Erro ao verificar suporte biométrico:', error);
      setIsBiometricSupported(false);
    }
  };

  /**
   * Carrega preferência de biometria salva
   */
  const loadBiometricPreference = async () => {
    try {
      const enabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
      setIsBiometricEnabled(enabled === 'true');
    } catch (error) {
      console.error('Erro ao carregar preferência biométrica:', error);
    }
  };

  /**
   * Autentica usando biometria
   */
  const authenticate = async (promptMessage?: string) => {
    const message = promptMessage || 'Autentique-se para continuar';
    try {
      if (!isBiometricSupported) {
        return {
          success: false,
          error: 'Dispositivo não suporta autenticação biométrica',
        };
      }

      if (!isBiometricEnrolled) {
        return {
          success: false,
          error: 'Nenhuma biometria cadastrada no dispositivo',
        };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: message,
        fallbackLabel: 'Usar senha',
        disableDeviceFallback: false,
        cancelLabel: 'Cancelar',
      });

      if (result.success) {
        return { success: true };
      } else {
        return {
          success: false,
          error: result.error || 'Autenticação biométrica falhou',
        };
      }
    } catch (error: any) {
      console.error('Erro na autenticação biométrica:', error);
      return {
        success: false,
        error: error.message || 'Erro ao autenticar',
      };
    }
  };

  /**
   * Ativa/desativa biometria
   */
  const toggleBiometric = async (enabled: boolean) => {
    try {
      if (enabled && !isBiometricEnrolled) {
        return false;
      }

      await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, String(enabled));
      setIsBiometricEnabled(enabled);
      return true;
    } catch (error) {
      console.error('Erro ao alterar preferência biométrica:', error);
      return false;
    }
  };

  /**
   * Verifica se biometria está disponível e habilitada
   */
  const canUseBiometric = (): boolean => {
    return isBiometricSupported && isBiometricEnrolled && isBiometricEnabled;
  };

  return {
    // Estado
    isBiometricSupported,
    isBiometricEnrolled,
    isBiometricEnabled,
    biometricType,

    // Métodos
    authenticate,
    toggleBiometric,
    canUseBiometric,
  };
}
