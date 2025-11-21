import React from 'react';
import { Text, View, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ENV } from '../config/env';

export default function WelcomeView() {
  return (
    <ScrollView className="flex-1 bg-gray-50">
      <StatusBar style="auto" />
      
      <View className="flex-1 px-4 py-8">
        {/* Header */}
        <View className="items-center mb-8">
          <Text className="text-5xl font-bold text-primary mb-2">
            Finance App
          </Text>
          <Text className="text-lg text-gray-600">
            Seu controle financeiro pessoal
          </Text>
        </View>

        {/* Status Card */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <View className="flex-row items-center mb-4">
            <Text className="text-3xl mr-2">🎉</Text>
            <Text className="text-xl font-semibold text-gray-800">
              Setup Concluído!
            </Text>
          </View>
          
          <Text className="text-base text-gray-600 mb-4">
            O projeto mobile foi configurado com sucesso seguindo a arquitetura MVVM.
          </Text>

          <View className="bg-success-50 rounded-lg p-3">
            <Text className="text-sm font-medium text-success-700">
              ✓ Ambiente: {ENV.ENV}
            </Text>
            <Text className="text-sm text-success-600 mt-1">
              ✓ API URL: {ENV.API_URL}
            </Text>
            <Text className="text-sm text-success-600">
              ✓ Versão: v{ENV.APP_VERSION}
            </Text>
          </View>
        </View>

        {/* Stack Info */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            📦 Stack Tecnológica
          </Text>
          
          <StackItem icon="⚛️" title="React Native" version="0.82.0" />
          <StackItem icon="📱" title="Expo SDK" version="54.0.0" />
          <StackItem icon="🔷" title="TypeScript" version="5.3+" />
          <StackItem icon="🎨" title="NativeWind" version="4.2.0" />
          <StackItem icon="🧭" title="React Navigation" version="6.x" />
          <StackItem icon="🐻" title="Zustand" version="4.5.0" />
        </View>

        {/* Architecture Info */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            🏗️ Arquitetura MVVM
          </Text>
          
          <View className="space-y-2">
            <ArchItem layer="View" desc="Telas e componentes visuais" />
            <ArchItem layer="ViewModel" desc="Lógica de apresentação" />
            <ArchItem layer="Model" desc="Estruturas de dados" />
            <ArchItem layer="Service" desc="API e persistência" />
          </View>
        </View>

        {/* Next Steps */}
        <View className="bg-primary-50 rounded-2xl p-6 mb-6">
          <Text className="text-lg font-semibold text-primary-800 mb-3">
            🚀 Próximos Passos
          </Text>
          
          <Text className="text-sm text-primary-700 mb-2">
            • Implementar Design System (Tarefa 2.0)
          </Text>
          <Text className="text-sm text-primary-700 mb-2">
            • Criar sistema de autenticação (Tarefa 3.0)
          </Text>
          <Text className="text-sm text-primary-700 mb-2">
            • Configurar navegação (Tarefa 4.0)
          </Text>
          <Text className="text-sm text-primary-700">
            • Desenvolver funcionalidades core
          </Text>
        </View>

        {/* Footer */}
        <View className="items-center py-4">
          <Text className="text-xs text-gray-500">
            Pronto para começar o desenvolvimento! 💪
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function StackItem({ icon, title, version }: { icon: string; title: string; version: string }) {
  return (
    <View className="flex-row items-center py-2 border-b border-gray-100">
      <Text className="text-2xl mr-3">{icon}</Text>
      <View className="flex-1">
        <Text className="text-sm font-medium text-gray-800">{title}</Text>
        <Text className="text-xs text-gray-500">{version}</Text>
      </View>
    </View>
  );
}

function ArchItem({ layer, desc }: { layer: string; desc: string }) {
  return (
    <View className="py-2">
      <Text className="text-sm font-semibold text-gray-800">{layer}</Text>
      <Text className="text-xs text-gray-600">{desc}</Text>
    </View>
  );
}
