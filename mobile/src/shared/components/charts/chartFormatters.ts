/**
 * Chart Formatters
 *
 * Funções utilitárias para formatação de dados em gráficos.
 */

/**
 * Formata valor monetário de forma compacta para gráficos
 * Ex: 1500 -> "1.5K", 1000000 -> "1M"
 */
export function formatCompactCurrency(value: number): string {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absValue >= 1000000) {
    return `${sign}R$ ${(absValue / 1000000).toFixed(1)}M`;
  }
  if (absValue >= 1000) {
    return `${sign}R$ ${(absValue / 1000).toFixed(1)}K`;
  }
  return `${sign}R$ ${absValue.toFixed(0)}`;
}

/**
 * Formata valor monetário curto sem símbolo
 * Ex: 1500 -> "1.5K"
 */
export function formatCompactValue(value: number): string {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absValue >= 1000000) {
    return `${sign}${(absValue / 1000000).toFixed(1)}M`;
  }
  if (absValue >= 1000) {
    return `${sign}${(absValue / 1000).toFixed(1)}K`;
  }
  return `${sign}${absValue.toFixed(0)}`;
}

/**
 * Formata percentual
 */
export function formatChartPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Formata label de mês abreviado
 * Ex: "2024-01" -> "Jan"
 */
export function formatMonthLabel(dateString: string): string {
  const months = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
  ];

  try {
    const [, month] = dateString.split('-');
    const monthIndex = parseInt(month, 10) - 1;
    return months[monthIndex] || dateString;
  } catch {
    return dateString;
  }
}

/**
 * Formata label de mês completo
 * Ex: "2024-01" -> "Janeiro"
 */
export function formatMonthLabelFull(dateString: string): string {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  try {
    const [, month] = dateString.split('-');
    const monthIndex = parseInt(month, 10) - 1;
    return months[monthIndex] || dateString;
  } catch {
    return dateString;
  }
}

/**
 * Formata label de semana
 * Ex: "2024-W01" -> "Sem 1"
 */
export function formatWeekLabel(dateString: string): string {
  try {
    const weekMatch = dateString.match(/W(\d+)/);
    if (weekMatch) {
      return `Sem ${parseInt(weekMatch[1], 10)}`;
    }
    return dateString;
  } catch {
    return dateString;
  }
}

/**
 * Formata label de dia
 * Ex: "2024-01-15" -> "15"
 */
export function formatDayLabel(dateString: string): string {
  try {
    const parts = dateString.split('-');
    if (parts.length >= 3) {
      return parts[2];
    }
    return dateString;
  } catch {
    return dateString;
  }
}

/**
 * Formata label de dia com mês
 * Ex: "2024-01-15" -> "15/01"
 */
export function formatDayMonthLabel(dateString: string): string {
  try {
    const parts = dateString.split('-');
    if (parts.length >= 3) {
      return `${parts[2]}/${parts[1]}`;
    }
    return dateString;
  } catch {
    return dateString;
  }
}

/**
 * Gera cores para categorias
 */
export function generateChartColors(count: number): string[] {
  const baseColors = [
    '#5843BE', // Primary purple
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#FFD93D', // Yellow
    '#95E1D3', // Mint
    '#F38181', // Pink
    '#AA96DA', // Light purple
    '#FCBAD3', // Rose
    '#6C5CE7', // Indigo
    '#00B894', // Green
    '#FDCB6E', // Orange
    '#74B9FF', // Blue
  ];

  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }

  // Se precisar de mais cores, gera variações
  const colors = [...baseColors];
  while (colors.length < count) {
    const baseColor = baseColors[colors.length % baseColors.length];
    const variation = Math.floor(colors.length / baseColors.length) * 20;
    colors.push(adjustColorBrightness(baseColor, variation));
  }

  return colors.slice(0, count);
}

/**
 * Ajusta brilho de uma cor hex
 */
function adjustColorBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;

  return `#${(
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  )
    .toString(16)
    .slice(1)}`;
}

/**
 * Calcula intervalo ideal para eixo Y
 */
export function calculateYAxisInterval(maxValue: number): number {
  if (maxValue <= 100) return 20;
  if (maxValue <= 500) return 100;
  if (maxValue <= 1000) return 200;
  if (maxValue <= 5000) return 1000;
  if (maxValue <= 10000) return 2000;
  if (maxValue <= 50000) return 10000;
  if (maxValue <= 100000) return 20000;
  return Math.ceil(maxValue / 5);
}

/**
 * Gera labels para eixo Y
 */
export function generateYAxisLabels(
  maxValue: number,
  steps: number = 5
): number[] {
  const interval = calculateYAxisInterval(maxValue);
  const adjustedMax = Math.ceil(maxValue / interval) * interval;
  const stepValue = adjustedMax / steps;

  return Array.from({ length: steps + 1 }, (_, i) => i * stepValue);
}
