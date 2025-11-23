/**
 * Chart Theme Configuration
 *
 * Configuração de cores e estilos para os gráficos.
 * Integrado com o sistema de temas do app.
 */

/**
 * Cores padrão para categorias em gráficos
 */
export const CHART_CATEGORY_COLORS = [
  '#5843BE', // Primary purple
  '#FF6B6B', // Red (expenses)
  '#4ECDC4', // Teal
  '#FFD93D', // Yellow
  '#95E1D3', // Mint
  '#F38181', // Pink
  '#AA96DA', // Light purple
  '#FCBAD3', // Rose
  '#6C5CE7', // Indigo
  '#00B894', // Green (income)
  '#FDCB6E', // Orange
  '#74B9FF', // Blue
] as const;

/**
 * Cores semânticas para gráficos financeiros
 */
export const CHART_SEMANTIC_COLORS = {
  income: '#00B894', // Verde para receitas
  expense: '#FF6B6B', // Vermelho para despesas
  balance: '#5843BE', // Roxo para saldo
  budget: '#74B9FF', // Azul para orçamento
  warning: '#FFD93D', // Amarelo para alertas
  danger: '#F38181', // Rosa para perigo
} as const;

/**
 * Configuração de tema claro para gráficos
 */
export const LIGHT_CHART_THEME = {
  background: '#FFFFFF',
  text: {
    primary: '#1A1A2E',
    secondary: '#6B7280',
    muted: '#9CA3AF',
  },
  grid: '#E5E7EB',
  axis: '#D1D5DB',
  tooltip: {
    background: '#FFFFFF',
    border: '#E5E7EB',
    text: '#1A1A2E',
  },
} as const;

/**
 * Configuração de tema escuro para gráficos
 */
export const DARK_CHART_THEME = {
  background: '#1A1A2E',
  text: {
    primary: '#F9FAFB',
    secondary: '#9CA3AF',
    muted: '#6B7280',
  },
  grid: '#374151',
  axis: '#4B5563',
  tooltip: {
    background: '#1F2937',
    border: '#374151',
    text: '#F9FAFB',
  },
} as const;

/**
 * Tipo para tema de gráfico
 */
export type ChartTheme = typeof LIGHT_CHART_THEME;

/**
 * Obtém tema de gráfico baseado no modo
 */
export function getChartTheme(isDarkMode: boolean): ChartTheme {
  return isDarkMode ? DARK_CHART_THEME : LIGHT_CHART_THEME;
}

/**
 * Configurações padrão para gráficos
 */
export const CHART_DEFAULTS = {
  /** Altura padrão dos gráficos */
  height: 200,
  /** Padding interno */
  padding: 16,
  /** Raio de borda para barras */
  barBorderRadius: 4,
  /** Espessura de linha */
  lineWidth: 2,
  /** Tamanho de pontos em gráficos de linha */
  pointSize: 6,
  /** Duração de animações (ms) */
  animationDuration: 300,
  /** Número máximo de itens em legendas */
  maxLegendItems: 6,
  /** Número de labels no eixo Y */
  yAxisLabelCount: 5,
} as const;

/**
 * Estilos de fonte para gráficos
 */
export const CHART_FONTS = {
  title: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  label: {
    fontSize: 12,
    fontWeight: '400' as const,
  },
  value: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  axis: {
    fontSize: 10,
    fontWeight: '400' as const,
  },
  legend: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
} as const;

/**
 * Retorna cor para uma categoria pelo índice
 */
export function getCategoryColor(index: number): string {
  return CHART_CATEGORY_COLORS[index % CHART_CATEGORY_COLORS.length];
}

/**
 * Retorna cor semântica por tipo
 */
export function getSemanticColor(
  type: keyof typeof CHART_SEMANTIC_COLORS
): string {
  return CHART_SEMANTIC_COLORS[type];
}

/**
 * Gera gradiente de cores (para gráficos de área)
 */
export function generateColorGradient(
  baseColor: string,
  steps: number = 3
): string[] {
  const colors: string[] = [];

  for (let i = 0; i < steps; i++) {
    const opacity = 1 - (i / steps) * 0.7;
    colors.push(`${baseColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`);
  }

  return colors;
}

/**
 * Configuração de espaçamento para gráficos
 */
export const CHART_SPACING = {
  /** Margem externa */
  margin: {
    top: 16,
    right: 16,
    bottom: 24,
    left: 48,
  },
  /** Espaçamento entre barras */
  barGap: 8,
  /** Espaçamento entre grupos de barras */
  groupGap: 16,
  /** Espaçamento de legenda */
  legendGap: 8,
} as const;
