export interface ChartData {
  name: string
  value?: number
  date?: string
  category?: string
  type?: 'income' | 'expense'
  color?: string
  [key: string]: any
}

export interface ChartConfig {
  width?: number
  height?: number
  margin?: {
    top?: number
    right?: number
    bottom?: number
    left?: number
  }
  colors?: string[]
  theme?: 'light' | 'dark'
  showGrid?: boolean
  showLegend?: boolean
  showTooltip?: boolean
  animation?: boolean
  responsive?: boolean
}

export interface LineChartProps extends ChartConfig {
  data: ChartData[]
  xAxisKey: string
  yAxisKey: string
  lineKey?: string
  strokeColor?: string
  fillColor?: string
  showDots?: boolean
  showArea?: boolean
  title?: string
  description?: string
  loading?: boolean
  error?: string
}

export interface BarChartProps extends ChartConfig {
  data: ChartData[]
  xAxisKey: string
  yAxisKey?: string
  barColor?: string
  stackId?: string
  layout?: 'horizontal' | 'vertical'
  bars?: Array<{ key: string; color: string; stackId?: string }>
  title?: string
  description?: string
  loading?: boolean
  error?: string
}

export interface PieChartProps extends ChartConfig {
  data: ChartData[]
  dataKey: string
  nameKey: string
  showLabels?: boolean
  showPercentage?: boolean
  innerRadius?: number
  outerRadius?: number
  title?: string
  description?: string
  loading?: boolean
  error?: string
}

export interface AreaChartProps extends ChartConfig {
  data: ChartData[]
  xAxisKey: string
  yAxisKey: string
  areaKey?: string
  strokeColor?: string
  fillColor?: string
  stackId?: string
  type?: 'monotone' | 'linear' | 'step'
  title?: string
  description?: string
  loading?: boolean
  error?: string
}
