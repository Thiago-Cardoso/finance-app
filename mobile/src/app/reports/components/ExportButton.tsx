/**
 * Export Button Component
 *
 * Botão com modal para exportar relatórios em diferentes formatos
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Download, FileText, FileSpreadsheet, X } from 'lucide-react-native';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { useTheme } from '@/shared/hooks/useTheme';
import { useExportReport } from '@/shared/hooks/useExportReport';
import type { ExportReportData } from '@/shared/services/export/exportReport.service';

interface ExportButtonProps {
  /**
   * Dados do relatório para exportar
   * Se não fornecido, usa dados mock
   */
  reportData?: ExportReportData;

  /**
   * Período do relatório
   */
  period?: string;
}

export function ExportButton({ reportData, period }: ExportButtonProps) {
  const { colors, theme } = useTheme();
  const { isExporting, exportAsCSV, exportAsExcel, exportAsPDF } = useExportReport();
  const [showModal, setShowModal] = useState(false);

  const exportOptions = useMemo(
    () => [
      {
        id: 'csv',
        title: 'CSV',
        description: 'Arquivo de valores separados por vírgula',
        icon: FileText,
        color: theme.colors.success.DEFAULT,
        onPress: () => handleExport('csv'),
      },
      {
        id: 'excel',
        title: 'Excel (JSON)',
        description: 'Planilha estruturada em JSON',
        icon: FileSpreadsheet,
        color: theme.colors.primary.DEFAULT,
        onPress: () => handleExport('excel'),
      },
      {
        id: 'pdf',
        title: 'PDF (Texto)',
        description: 'Documento em formato de texto',
        icon: FileText,
        color: theme.colors.error.DEFAULT,
        onPress: () => handleExport('pdf'),
      },
    ],
    [theme]
  );

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    setShowModal(false);

    // Aguarda um frame para fechar o modal antes de exportar
    setTimeout(async () => {
      // Se não houver dados, não faz nada (o hook já vai usar mock internamente)
      switch (format) {
        case 'csv':
          await exportAsCSV(reportData);
          break;
        case 'excel':
          await exportAsExcel(reportData);
          break;
        case 'pdf':
          await exportAsPDF(reportData);
          break;
      }
    }, 100);
  };

  return (
    <>
      {/* Export Card Button */}
      <Card className="mx-4 p-4 mb-4">
        <TouchableOpacity
          onPress={() => setShowModal(true)}
          disabled={isExporting}
          activeOpacity={0.7}
          accessible={true}
          accessibilityLabel="Exportar relatório"
          accessibilityRole="button"
        >
          <View className="flex-row items-center">
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{
                backgroundColor: isExporting
                  ? colors.surface
                  : `${theme.colors.primary.DEFAULT}20`,
              }}
            >
              {isExporting ? (
                <ActivityIndicator size="small" color={theme.colors.primary.DEFAULT} />
              ) : (
                <Download size={20} color={theme.colors.primary.DEFAULT} />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium" style={{ color: colors.text.primary }}>
                Exportar Relatório
              </Text>
              <Text className="text-xs" style={{ color: colors.text.secondary }}>
                {isExporting ? 'Exportando...' : 'PDF, Excel, CSV'}
              </Text>
            </View>
            <View
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: `${theme.colors.success.DEFAULT}20` }}
            >
              <Text
                className="text-xs font-medium"
                style={{ color: theme.colors.success.DEFAULT }}
              >
                Disponível
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Card>

      {/* Export Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View
            className="rounded-t-3xl p-6"
            style={{ backgroundColor: colors.background }}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold" style={{ color: colors.text.primary }}>
                Exportar Relatório
              </Text>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                accessibilityLabel="Fechar"
                accessibilityRole="button"
              >
                <X size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            {/* Period Info */}
            {period && (
              <View className="mb-4 p-3 rounded-xl" style={{ backgroundColor: colors.surface }}>
                <Text className="text-xs" style={{ color: colors.text.secondary }}>
                  Período
                </Text>
                <Text className="text-sm font-medium" style={{ color: colors.text.primary }}>
                  {period}
                </Text>
              </View>
            )}

            {/* Export Options */}
            <View className="gap-3 mb-6">
              {exportOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  onPress={option.onPress}
                  className="flex-row items-center p-4 rounded-xl"
                  style={{ backgroundColor: colors.card }}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityLabel={`Exportar como ${option.title}`}
                  accessibilityRole="button"
                >
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: `${option.color}20` }}
                  >
                    <option.icon size={20} color={option.color} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-medium" style={{ color: colors.text.primary }}>
                      {option.title}
                    </Text>
                    <Text className="text-xs" style={{ color: colors.text.secondary }}>
                      {option.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Cancel Button */}
            <Button title="Cancelar" onPress={() => setShowModal(false)} variant="outline" />
          </View>
        </View>
      </Modal>
    </>
  );
}
