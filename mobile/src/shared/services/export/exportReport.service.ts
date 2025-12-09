/**
 * Export Report Service
 *
 * Service para exportar relatórios financeiros em diferentes formatos
 */

import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform, Alert } from 'react-native';

export type ExportFormat = 'pdf' | 'excel' | 'csv';

export interface ExportReportData {
  period: string;
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
    transactionCount: number;
  };
  monthlyData: Array<{
    month: string;
    income: number;
    expense: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  transactions?: Array<{
    date: string;
    description: string;
    category: string;
    amount: number;
    type: 'income' | 'expense';
  }>;
}

/**
 * Gera conteúdo CSV do relatório
 */
function generateCSV(data: ExportReportData): string {
  let csv = '';

  // Header
  csv += `Relatório Financeiro - ${data.period}\n\n`;

  // Summary
  csv += 'Resumo do Período\n';
  csv += 'Métrica,Valor\n';
  csv += `Receitas,${data.summary.totalIncome.toFixed(2)}\n`;
  csv += `Despesas,${data.summary.totalExpenses.toFixed(2)}\n`;
  csv += `Saldo,${data.summary.netBalance.toFixed(2)}\n`;
  csv += `Transações,${data.summary.transactionCount}\n`;
  csv += '\n';

  // Monthly Data
  csv += 'Dados Mensais\n';
  csv += 'Mês,Receitas,Despesas\n';
  data.monthlyData.forEach((item) => {
    csv += `${item.month},${item.income.toFixed(2)},${item.expense.toFixed(2)}\n`;
  });
  csv += '\n';

  // Category Breakdown
  csv += 'Despesas por Categoria\n';
  csv += 'Categoria,Valor,Percentual\n';
  data.categoryBreakdown.forEach((item) => {
    csv += `${item.category},${item.amount.toFixed(2)},${item.percentage.toFixed(2)}%\n`;
  });

  // Transactions (if provided)
  if (data.transactions && data.transactions.length > 0) {
    csv += '\n';
    csv += 'Transações\n';
    csv += 'Data,Descrição,Categoria,Tipo,Valor\n';
    data.transactions.forEach((txn) => {
      csv += `${txn.date},${txn.description},${txn.category},${txn.type},${txn.amount.toFixed(2)}\n`;
    });
  }

  return csv;
}

/**
 * Gera conteúdo JSON estruturado (para Excel)
 */
function generateJSON(data: ExportReportData): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Exporta relatório
 */
export async function exportReport(
  data: ExportReportData,
  format: ExportFormat
): Promise<{ success: boolean; message?: string; filePath?: string }> {
  try {
    let content: string;
    let fileName: string;
    let mimeType: string;

    const timestamp = new Date().toISOString().split('T')[0];
    const sanitizedPeriod = data.period.replace(/[^a-zA-Z0-9]/g, '_');

    switch (format) {
      case 'csv':
        content = generateCSV(data);
        fileName = `relatorio_financeiro_${sanitizedPeriod}_${timestamp}.csv`;
        mimeType = 'text/csv';
        break;

      case 'excel':
        // Para Excel, vamos usar JSON por enquanto (em produção, usar biblioteca específica)
        content = generateJSON(data);
        fileName = `relatorio_financeiro_${sanitizedPeriod}_${timestamp}.json`;
        mimeType = 'application/json';
        break;

      case 'pdf':
        // PDF seria gerado com uma biblioteca específica (react-native-pdf, etc)
        // Por enquanto, vamos simular com texto
        content = generateCSV(data).replace(/,/g, ' | ');
        fileName = `relatorio_financeiro_${sanitizedPeriod}_${timestamp}.txt`;
        mimeType = 'text/plain';
        break;

      default:
        throw new Error(`Formato não suportado: ${format}`);
    }

    // Salva o arquivo
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(fileUri, content);

    // Verifica se o dispositivo suporta compartilhamento
    const canShare = await Sharing.isAvailableAsync();

    if (canShare) {
      await Sharing.shareAsync(fileUri, {
        mimeType,
        dialogTitle: 'Exportar Relatório',
        UTI: mimeType,
      });
    } else {
      // Fallback: apenas informa o caminho do arquivo
      if (Platform.OS === 'ios') {
        Alert.alert(
          'Arquivo salvo',
          `O relatório foi salvo em: ${fileUri}`,
          [{ text: 'OK' }]
        );
      }
    }

    return {
      success: true,
      message: 'Relatório exportado com sucesso!',
      filePath: fileUri,
    };
  } catch (error) {
    console.error('Error exporting report:', error);
    return {
      success: false,
      message: `Erro ao exportar relatório: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    };
  }
}

/**
 * Mock: Gera dados de exemplo para teste
 */
export function generateMockReportData(period: string = 'Novembro 2025'): ExportReportData {
  return {
    period,
    summary: {
      totalIncome: 8500.0,
      totalExpenses: 6250.75,
      netBalance: 2249.25,
      transactionCount: 45,
    },
    monthlyData: [
      { month: 'Setembro', income: 7800.0, expense: 5900.5 },
      { month: 'Outubro', income: 8200.0, expense: 6100.25 },
      { month: 'Novembro', income: 8500.0, expense: 6250.75 },
    ],
    categoryBreakdown: [
      { category: 'Alimentação', amount: 1800.0, percentage: 28.8 },
      { category: 'Transporte', amount: 950.0, percentage: 15.2 },
      { category: 'Moradia', amount: 2200.0, percentage: 35.2 },
      { category: 'Lazer', amount: 580.0, percentage: 9.3 },
      { category: 'Saúde', amount: 420.75, percentage: 6.7 },
      { category: 'Educação', amount: 300.0, percentage: 4.8 },
    ],
    transactions: [
      {
        date: '2025-11-01',
        description: 'Salário',
        category: 'Receita',
        amount: 8500.0,
        type: 'income',
      },
      {
        date: '2025-11-05',
        description: 'Aluguel',
        category: 'Moradia',
        amount: -2200.0,
        type: 'expense',
      },
      {
        date: '2025-11-08',
        description: 'Supermercado',
        category: 'Alimentação',
        amount: -450.0,
        type: 'expense',
      },
      {
        date: '2025-11-10',
        description: 'Gasolina',
        category: 'Transporte',
        amount: -280.0,
        type: 'expense',
      },
      {
        date: '2025-11-15',
        description: 'Cinema',
        category: 'Lazer',
        amount: -80.0,
        type: 'expense',
      },
    ],
  };
}
