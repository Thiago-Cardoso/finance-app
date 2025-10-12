'use client'

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts'
import { BaseChart } from '../BaseChart/BaseChart'
import { CustomTooltip } from '../CustomTooltip/CustomTooltip'
import { PieChartProps } from '@/types/charts'

const DEFAULT_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6b7280'
]

export function PieChart({
  data,
  dataKey,
  nameKey,
  showLabels = true,
  showPercentage = true,
  innerRadius = 0,
  outerRadius = 80,
  colors = DEFAULT_COLORS,
  showLegend = true,
  showTooltip = true,
  animation = true,
  title,
  description,
  loading,
  error,
  ...baseProps
}: PieChartProps) {
  const RADIAN = Math.PI / 180

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }: any) => {
    if (!showLabels) return null

    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    if (percent < 0.05) return null // Don't show labels for slices < 5%

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {showPercentage ? `${(percent * 100).toFixed(0)}%` : (data[index] as any)[nameKey]}
      </text>
    )
  }

  return (
    <BaseChart
      title={title}
      description={description}
      loading={loading}
      error={error}
      {...baseProps}
    >
      <RechartsPieChart>
        <Pie
          data={data as any}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={outerRadius}
          innerRadius={innerRadius}
          fill="#8884d8"
          dataKey={dataKey}
          animationDuration={animation ? 1000 : 0}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color || colors[index % colors.length]}
            />
          ))}
        </Pie>

        {showTooltip && <Tooltip content={<CustomTooltip />} />}

        {showLegend && (
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry: any) => (
              <span style={{ color: entry.color }}>{value}</span>
            )}
          />
        )}
      </RechartsPieChart>
    </BaseChart>
  )
}
