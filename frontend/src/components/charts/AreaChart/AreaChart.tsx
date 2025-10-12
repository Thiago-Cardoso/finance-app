'use client'

import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BaseChart } from '../BaseChart/BaseChart'
import { CustomTooltip } from '../CustomTooltip/CustomTooltip'
import { AreaChartProps } from '@/types/charts'
import { formatCurrency } from '@/lib/utils'

export function AreaChart({
  data,
  xAxisKey,
  yAxisKey,
  areaKey,
  strokeColor = '#3b82f6',
  fillColor = '#3b82f6',
  stackId,
  type = 'monotone',
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  animation = true,
  margin = { top: 20, right: 30, left: 20, bottom: 5 },
  title,
  description,
  loading,
  error,
  ...baseProps
}: AreaChartProps) {
  const formatXAxisTick = (value: string) => {
    try {
      return format(parseISO(value), 'dd/MM', { locale: ptBR })
    } catch {
      return value
    }
  }

  const formatYAxisTick = (value: number) => {
    return formatCurrency(value, { compact: true })
  }

  const gradientId = `gradient-${fillColor.replace('#', '')}`

  return (
    <BaseChart
      title={title}
      description={description}
      loading={loading}
      error={error}
      {...baseProps}
    >
      <RechartsAreaChart data={data} margin={margin}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={fillColor} stopOpacity={0.8} />
            <stop offset="95%" stopColor={fillColor} stopOpacity={0.1} />
          </linearGradient>
        </defs>

        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            className="opacity-30 dark:opacity-20"
            stroke="currentColor"
          />
        )}

        <XAxis
          dataKey={xAxisKey}
          tickFormatter={formatXAxisTick}
          className="text-xs text-gray-600 dark:text-gray-400"
          axisLine={false}
          tickLine={false}
          stroke="currentColor"
        />

        <YAxis
          tickFormatter={formatYAxisTick}
          className="text-xs text-gray-600 dark:text-gray-400"
          axisLine={false}
          tickLine={false}
          width={80}
          stroke="currentColor"
        />

        {showTooltip && (
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: strokeColor, strokeDasharray: '5 5' }}
          />
        )}

        {showLegend && <Legend />}

        <Area
          type={type}
          dataKey={yAxisKey}
          stackId={stackId}
          stroke={strokeColor}
          fill={`url(#${gradientId})`}
          strokeWidth={2}
          animationDuration={animation ? 1000 : 0}
        />
      </RechartsAreaChart>
    </BaseChart>
  )
}
