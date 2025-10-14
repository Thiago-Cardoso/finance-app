'use client'

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { BaseChart } from '../BaseChart/BaseChart'
import { CustomTooltip } from '../CustomTooltip/CustomTooltip'
import { BarChartProps } from '@/types/charts'
import { formatCurrency } from '@/lib/utils'

export function BarChart({
  data,
  xAxisKey,
  yAxisKey,
  barColor = '#3b82f6',
  stackId,
  layout = 'vertical',
  bars,
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
}: BarChartProps) {
  const formatYAxisTick = (value: number) => {
    return formatCurrency(value, { compact: true })
  }

  const truncateLabel = (label: string, maxLength = 15) => {
    return label.length > maxLength
      ? `${label.substring(0, maxLength)}...`
      : label
  }

  return (
    <BaseChart
      title={title}
      description={description}
      loading={loading}
      error={error}
      {...baseProps}
    >
      <RechartsBarChart data={data} layout={layout} margin={margin}>
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            className="opacity-30 dark:opacity-20"
            stroke="currentColor"
          />
        )}

        {layout === 'vertical' ? (
          <>
            <XAxis
              type="number"
              tickFormatter={formatYAxisTick}
              className="text-xs text-gray-600 dark:text-gray-400"
              axisLine={false}
              tickLine={false}
              stroke="currentColor"
            />
            <YAxis
              type="category"
              dataKey={xAxisKey}
              tickFormatter={truncateLabel}
              className="text-xs text-gray-600 dark:text-gray-400"
              axisLine={false}
              tickLine={false}
              width={100}
              stroke="currentColor"
            />
          </>
        ) : (
          <>
            <XAxis
              dataKey={xAxisKey}
              tickFormatter={truncateLabel}
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
          </>
        )}

        {showTooltip && (
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
          />
        )}

        {showLegend && <Legend />}

        {bars && bars.length > 0 ? (
          bars.map((bar, index) => (
            <Bar
              key={bar.key}
              dataKey={bar.key}
              fill={bar.color}
              stackId={bar.stackId}
              radius={[4, 4, 0, 0]}
              animationDuration={animation ? 1000 : 0}
            />
          ))
        ) : (
          <Bar
            dataKey={yAxisKey}
            fill={barColor}
            stackId={stackId}
            radius={[4, 4, 0, 0]}
            animationDuration={animation ? 1000 : 0}
          />
        )}
      </RechartsBarChart>
    </BaseChart>
  )
}
