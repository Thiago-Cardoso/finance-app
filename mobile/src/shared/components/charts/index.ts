/**
 * Charts Components
 *
 * Componentes de gráficos para visualização de dados financeiros.
 * Implementação leve usando React Native puro (sem Victory Native).
 */

// Main chart components
export { PieChart } from './PieChart';
export type { PieChartProps, PieChartDataItem } from './PieChart';

export { LineChart } from './LineChart';
export type { LineChartProps, LineChartDataPoint } from './LineChart';

export { BarChart } from './BarChart';
export type { BarChartProps, BarChartDataItem } from './BarChart';

// Skeleton components
export {
  ChartSkeleton,
  PieChartSkeleton,
  LineChartSkeleton,
  BarChartSkeleton,
  ProgressSkeleton,
} from './ChartSkeleton';

// Theme configuration
export {
  CHART_CATEGORY_COLORS,
  CHART_SEMANTIC_COLORS,
  LIGHT_CHART_THEME,
  DARK_CHART_THEME,
  CHART_DEFAULTS,
  CHART_FONTS,
  CHART_SPACING,
  getChartTheme,
  getCategoryColor,
  getSemanticColor,
  generateColorGradient,
} from './chartTheme';
export type { ChartTheme } from './chartTheme';

// Formatters
export {
  formatCompactCurrency,
  formatCompactValue,
  formatChartPercent,
  formatMonthLabel,
  formatMonthLabelFull,
  formatWeekLabel,
  formatDayLabel,
  formatDayMonthLabel,
  generateChartColors,
  calculateYAxisInterval,
  generateYAxisLabels,
} from './chartFormatters';
