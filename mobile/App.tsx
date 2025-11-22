/**
 * Finance App - Mobile
 *
 * Aplicativo principal com navegação, autenticação e tema.
 */

import './global.css';

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Routes } from './src/routes';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <Routes />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
