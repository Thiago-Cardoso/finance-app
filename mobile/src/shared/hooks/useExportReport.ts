/**
 * Hook: useExportReport
 *
 * Hook para gerenciar exportação de relatórios
 */

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import {
  exportReport,
  generateMockReportData,
  type ExportFormat,
  type ExportReportData,
} from '../services/export/exportReport.service';

export function useExportReport() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  /**
   * Exporta relatório no formato especificado
   */
  const handleExport = useCallback(
    async (format: ExportFormat, data?: ExportReportData) => {
      try {
        setIsExporting(true);
        setExportProgress(0);

        // Simula progresso
        setExportProgress(25);

        // Se não houver dados, usa mock
        const reportData = data || generateMockReportData();

        setExportProgress(50);

        // Exporta o relatório
        const result = await exportReport(reportData, format);

        setExportProgress(100);

        if (result.success) {
          // Sucesso silencioso - o Sharing já mostra o dialog do sistema
          return { success: true, filePath: result.filePath };
        } else {
          Alert.alert('Erro na Exportação', result.message || 'Erro desconhecido', [
            { text: 'OK' },
          ]);
          return { success: false, error: result.message };
        }
      } catch (error) {
        console.error('Export error:', error);
        Alert.alert(
          'Erro na Exportação',
          error instanceof Error ? error.message : 'Erro desconhecido',
          [{ text: 'OK' }]
        );
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        };
      } finally {
        setIsExporting(false);
        setExportProgress(0);
      }
    },
    []
  );

  /**
   * Exporta no formato CSV
   */
  const exportAsCSV = useCallback(
    async (data?: ExportReportData) => {
      return handleExport('csv', data);
    },
    [handleExport]
  );

  /**
   * Exporta no formato Excel
   */
  const exportAsExcel = useCallback(
    async (data?: ExportReportData) => {
      return handleExport('excel', data);
    },
    [handleExport]
  );

  /**
   * Exporta no formato PDF
   */
  const exportAsPDF = useCallback(
    async (data?: ExportReportData) => {
      return handleExport('pdf', data);
    },
    [handleExport]
  );

  return {
    isExporting,
    exportProgress,
    handleExport,
    exportAsCSV,
    exportAsExcel,
    exportAsPDF,
  };
}
