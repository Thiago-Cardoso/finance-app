'use client'

import {
  LineChart as RechartsLineChart,
  Line,
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
import { LineChartProps } from '@/types/charts'
import { formatCurrency } from '@/lib/utils'

export function LineChart({
  data,
  xAxisKey,
  yAxisKey,
  lineKey,
  strokeColor = '#3b82f6',
  fillColor = '#3b82f6',
  showDots = true,
  showArea = false,
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
}: LineChartProps) {
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

  return (
    <BaseChart
      title={title}
      description={description}
      loading={loading}
      error={error}
      {...baseProps}
    >
      <RechartsLineChart data={data} margin={margin}>
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

        <Line
          type="monotone"
          dataKey={yAxisKey}
          stroke={strokeColor}
          strokeWidth={2}
          fill={showArea ? fillColor : 'none'}
          dot={
            showDots
              ? { fill: strokeColor, strokeWidth: 2, r: 4 }
              : false
          }
          activeDot={{
            r: 6,
            stroke: strokeColor,
            strokeWidth: 2,
            fill: '#fff',
          }}
          animationDuration={animation ? 1000 : 0}
        />
      </RechartsLineChart>
    </BaseChart>
  )
}
