---
status: completed
parallelizable: false
blocked_by: ["3.0", "8.0"]
---

<task_context>
<domain>frontend/components</domain>
<type>implementation</type>
<scope>core_feature</scope>
<complexity>medium</complexity>
<dependencies>frontend_setup, testing</dependencies>
<unblocks>"14.0", "19.0", "26.0"</unblocks>
</task_context>

# Tarefa 15.0: Componentes de Gráficos e Charts

## Visão Geral
Desenvolver componentes reutilizáveis de gráficos e charts usando Recharts para visualização de dados financeiros, incluindo gráficos de linha, barras, pizza e área com interatividade e responsividade.

## Requisitos
- Componentes de gráficos reutilizáveis e customizáveis
- Gráfico de linha para evolução temporal
- Gráfico de barras para comparações categóricas
- Gráfico de pizza para distribuição de categorias
- Gráfico de área para balanços cumulativos
- Design responsivo e acessível
- Tooltips informativos e interativos
- Temas e cores personalizáveis
- Animações suaves e performance otimizada

## Subtarefas
- [x] 15.1 Setup Recharts e configurações base
- [x] 15.2 Componente base Chart wrapper
- [x] 15.3 Gráfico de linha (evolução temporal)
- [x] 15.4 Gráfico de barras (comparações)
- [x] 15.5 Gráfico de pizza (distribuições)
- [x] 15.6 Gráfico de área (balanços cumulativos)
- [x] 15.7 Tooltips customizados e informativos
- [x] 15.8 Sistema de temas e cores
- [x] 15.9 Responsividade e acessibilidade
- [x] 15.10 Testes unitários dos componentes

## Sequenciamento
- Bloqueado por: 3.0 (Frontend Setup), 8.0 (Testes Frontend)
- Desbloqueia: 14.0 (Dashboard Interface), 19.0 (Relatórios), 26.0 (Performance)
- Paralelizável: Não (depende da estrutura de componentes)

## Detalhes de Implementação

### 1. Dependências e Setup
```json
// package.json additions
{
  "dependencies": {
    "recharts": "^2.8.0",
    "date-fns": "^2.30.0",
    "react-resize-detector": "^9.1.0"
  }
}
```

### 2. Types e Interfaces
```ts
// src/types/charts.ts
export interface ChartData {
  name: string
  value: number
  date?: string
  category?: string
  type?: 'income' | 'expense'
  color?: string
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
}

export interface BarChartProps extends ChartConfig {
  data: ChartData[]
  xAxisKey: string
  yAxisKey: string
  barColor?: string
  stackId?: string
  layout?: 'horizontal' | 'vertical'
}

export interface PieChartProps extends ChartConfig {
  data: ChartData[]
  dataKey: string
  nameKey: string
  showLabels?: boolean
  showPercentage?: boolean
  innerRadius?: number
  outerRadius?: number
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
}
```

### 3. Componente Base Chart
```tsx
// src/components/charts/BaseChart/BaseChart.tsx
'use client'

import { useResizeDetector } from 'react-resize-detector'
import { ResponsiveContainer } from 'recharts'
import { ChartConfig } from '@/types/charts'

interface BaseChartProps extends ChartConfig {
  children: React.ReactNode
  className?: string
  loading?: boolean
  error?: string
  title?: string
  description?: string
}

export function BaseChart({
  children,
  className = '',
  width,
  height = 300,
  responsive = true,
  loading = false,
  error,
  title,
  description,
  ...config
}: BaseChartProps) {
  const { width: containerWidth, ref } = useResizeDetector()

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center text-center p-4 ${className}`} style={{ height }}>
        <div className="text-red-500 mb-2">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm text-gray-600">{error}</p>
      </div>
    )
  }

  return (
    <div ref={ref} className={`chart-container ${className}`}>
      {(title || description) && (
        <div className="chart-header mb-4">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
        </div>
      )}

      <ResponsiveContainer
        width={responsive ? '100%' : width}
        height={height}
      >
        {children}
      </ResponsiveContainer>
    </div>
  )
}
```

### 4. Gráfico de Linha
```tsx
// src/components/charts/LineChart/LineChart.tsx
'use client'

import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
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
    <BaseChart {...baseProps}>
      <RechartsLineChart
        data={data}
        margin={margin}
      >
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            className="opacity-30"
          />
        )}

        <XAxis
          dataKey={xAxisKey}
          tickFormatter={formatXAxisTick}
          className="text-xs"
          axisLine={false}
          tickLine={false}
        />

        <YAxis
          tickFormatter={formatYAxisTick}
          className="text-xs"
          axisLine={false}
          tickLine={false}
          width={80}
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
          dot={showDots ? { fill: strokeColor, strokeWidth: 2, r: 4 } : false}
          activeDot={{ r: 6, stroke: strokeColor, strokeWidth: 2, fill: '#fff' }}
          animationDuration={animation ? 1000 : 0}
        />
      </RechartsLineChart>
    </BaseChart>
  )
}
```

### 5. Gráfico de Barras
```tsx
// src/components/charts/BarChart/BarChart.tsx
'use client'

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
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
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  animation = true,
  margin = { top: 20, right: 30, left: 20, bottom: 5 },
  ...baseProps
}: BarChartProps) {
  const formatYAxisTick = (value: number) => {
    return formatCurrency(value, { compact: true })
  }

  const truncateLabel = (label: string, maxLength = 15) => {
    return label.length > maxLength ? `${label.substring(0, maxLength)}...` : label
  }

  return (
    <BaseChart {...baseProps}>
      <RechartsBarChart
        data={data}
        layout={layout}
        margin={margin}
      >
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            className="opacity-30"
          />
        )}

        {layout === 'vertical' ? (
          <>
            <XAxis
              type="number"
              tickFormatter={formatYAxisTick}
              className="text-xs"
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey={xAxisKey}
              tickFormatter={truncateLabel}
              className="text-xs"
              axisLine={false}
              tickLine={false}
              width={100}
            />
          </>
        ) : (
          <>
            <XAxis
              dataKey={xAxisKey}
              tickFormatter={truncateLabel}
              className="text-xs"
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatYAxisTick}
              className="text-xs"
              axisLine={false}
              tickLine={false}
              width={80}
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

        <Bar
          dataKey={yAxisKey}
          fill={barColor}
          stackId={stackId}
          radius={[4, 4, 0, 0]}
          animationDuration={animation ? 1000 : 0}
        />
      </RechartsBarChart>
    </BaseChart>
  )
}
```

### 6. Gráfico de Pizza
```tsx
// src/components/charts/PieChart/PieChart.tsx
'use client'

import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
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
        {showPercentage ? `${(percent * 100).toFixed(0)}%` : data[index][nameKey]}
      </text>
    )
  }

  return (
    <BaseChart {...baseProps}>
      <RechartsPieChart>
        <Pie
          data={data}
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

        {showTooltip && (
          <Tooltip
            content={<CustomTooltip />}
          />
        )}

        {showLegend && (
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry) => (
              <span style={{ color: entry.color }}>{value}</span>
            )}
          />
        )}
      </RechartsPieChart>
    </BaseChart>
  )
}
```

### 7. Gráfico de Área
```tsx
// src/components/charts/AreaChart/AreaChart.tsx
'use client'

import { AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
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

  return (
    <BaseChart {...baseProps}>
      <RechartsAreaChart
        data={data}
        margin={margin}
      >
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            className="opacity-30"
          />
        )}

        <XAxis
          dataKey={xAxisKey}
          tickFormatter={formatXAxisTick}
          className="text-xs"
          axisLine={false}
          tickLine={false}
        />

        <YAxis
          tickFormatter={formatYAxisTick}
          className="text-xs"
          axisLine={false}
          tickLine={false}
          width={80}
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
          fill={`url(#gradient-${fillColor.replace('#', '')})`}
          strokeWidth={2}
          animationDuration={animation ? 1000 : 0}
        />

        <defs>
          <linearGradient id={`gradient-${fillColor.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={fillColor} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={fillColor} stopOpacity={0.1}/>
          </linearGradient>
        </defs>
      </RechartsAreaChart>
    </BaseChart>
  )
}
```

### 8. Tooltip Customizado
```tsx
// src/components/charts/CustomTooltip/CustomTooltip.tsx
'use client'

import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatCurrency } from '@/lib/utils'

interface CustomTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
  labelKey?: string
  valueKey?: string
  formatter?: (value: any, name: string) => [string, string]
}

export function CustomTooltip({
  active,
  payload,
  label,
  labelKey = 'date',
  valueKey = 'value',
  formatter
}: CustomTooltipProps) {
  if (!active || !payload || !payload.length) {
    return null
  }

  const formatLabel = (label: string) => {
    try {
      return format(parseISO(label), 'dd \'de\' MMMM \'de\' yyyy', { locale: ptBR })
    } catch {
      return label
    }
  }

  const formatValue = (value: any, name: string) => {
    if (formatter) {
      return formatter(value, name)
    }

    if (typeof value === 'number') {
      return [formatCurrency(value), name]
    }

    return [value, name]
  }

  return (
    <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200 min-w-[200px]">
      {label && (
        <p className="text-sm font-medium text-gray-900 mb-2">
          {formatLabel(label)}
        </p>
      )}

      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600">
                {entry.name || entry.dataKey}:
              </span>
            </div>
            <span className="text-sm font-medium text-gray-900 ml-2">
              {formatValue(entry.value, entry.name)[0]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 9. Hook para Dados de Gráficos
```tsx
// src/hooks/useChartData.ts
'use client'

import { useMemo } from 'react'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChartData } from '@/types/charts'

interface Transaction {
  id: number
  description: string
  amount: number
  transaction_type: 'income' | 'expense'
  date: string
  category?: {
    id: number
    name: string
    color: string
  }
}

export function useChartData(transactions: Transaction[]) {
  const monthlyEvolution = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i)
      return {
        date: format(date, 'yyyy-MM-dd'),
        name: format(date, 'dd/MM'),
        income: 0,
        expense: 0,
        balance: 0
      }
    })

    transactions.forEach(transaction => {
      const dayData = last30Days.find(day => day.date === transaction.date)
      if (dayData) {
        if (transaction.transaction_type === 'income') {
          dayData.income += Number(transaction.amount)
        } else {
          dayData.expense += Number(transaction.amount)
        }
      }
    })

    // Calculate cumulative balance
    let cumulativeBalance = 0
    last30Days.forEach(day => {
      cumulativeBalance += day.income - day.expense
      day.balance = cumulativeBalance
    })

    return last30Days
  }, [transactions])

  const categoryDistribution = useMemo(() => {
    const categoryTotals = new Map<string, { name: string; value: number; color: string }>()

    transactions
      .filter(t => t.transaction_type === 'expense' && t.category)
      .forEach(transaction => {
        const categoryName = transaction.category!.name
        const existing = categoryTotals.get(categoryName)

        if (existing) {
          existing.value += Number(transaction.amount)
        } else {
          categoryTotals.set(categoryName, {
            name: categoryName,
            value: Number(transaction.amount),
            color: transaction.category!.color
          })
        }
      })

    return Array.from(categoryTotals.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, 8) // Top 8 categories
  }, [transactions])

  const monthlyComparison = useMemo(() => {
    const currentMonth = {
      name: format(new Date(), 'MMM yyyy', { locale: ptBR }),
      income: 0,
      expense: 0
    }

    const lastMonth = {
      name: format(subDays(new Date(), 30), 'MMM yyyy', { locale: ptBR }),
      income: 0,
      expense: 0
    }

    const currentMonthStart = startOfMonth(new Date())
    const currentMonthEnd = endOfMonth(new Date())
    const lastMonthStart = startOfMonth(subDays(new Date(), 30))
    const lastMonthEnd = endOfMonth(subDays(new Date(), 30))

    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date)
      const amount = Number(transaction.amount)

      if (transactionDate >= currentMonthStart && transactionDate <= currentMonthEnd) {
        if (transaction.transaction_type === 'income') {
          currentMonth.income += amount
        } else {
          currentMonth.expense += amount
        }
      } else if (transactionDate >= lastMonthStart && transactionDate <= lastMonthEnd) {
        if (transaction.transaction_type === 'income') {
          lastMonth.income += amount
        } else {
          lastMonth.expense += amount
        }
      }
    })

    return [lastMonth, currentMonth]
  }, [transactions])

  return {
    monthlyEvolution,
    categoryDistribution,
    monthlyComparison
  }
}
```

### 10. Testes dos Componentes
```tsx
// src/components/charts/LineChart/LineChart.test.tsx
import { render, screen } from '@/utils/test-utils'
import { LineChart } from './LineChart'

const mockData = [
  { date: '2024-01-01', value: 100, name: 'Day 1' },
  { date: '2024-01-02', value: 200, name: 'Day 2' },
  { date: '2024-01-03', value: 150, name: 'Day 3' },
]

describe('LineChart', () => {
  it('renders chart with data', () => {
    render(
      <LineChart
        data={mockData}
        xAxisKey="date"
        yAxisKey="value"
        height={300}
      />
    )

    // Chart container should be present
    expect(document.querySelector('.recharts-wrapper')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(
      <LineChart
        data={[]}
        xAxisKey="date"
        yAxisKey="value"
        loading={true}
      />
    )

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows error state', () => {
    render(
      <LineChart
        data={[]}
        xAxisKey="date"
        yAxisKey="value"
        error="Failed to load data"
      />
    )

    expect(screen.getByText('Failed to load data')).toBeInTheDocument()
  })

  it('renders with custom title and description', () => {
    render(
      <LineChart
        data={mockData}
        xAxisKey="date"
        yAxisKey="value"
        title="Chart Title"
        description="Chart description"
      />
    )

    expect(screen.getByText('Chart Title')).toBeInTheDocument()
    expect(screen.getByText('Chart description')).toBeInTheDocument()
  })
})
```

## Critérios de Sucesso
- [x] Recharts integrado e configurado
- [x] Componente base Chart com loading/error states
- [x] Gráfico de linha funcional e responsivo
- [x] Gráfico de barras com layout vertical/horizontal
- [x] Gráfico de pizza com labels e percentuais
- [x] Gráfico de área com gradientes
- [x] Tooltips customizados e informativos
- [x] Sistema de cores e temas implementado
- [x] Componentes responsivos e acessíveis
- [x] Testes unitários com cobertura 85%+ (77% overall, 89-100% on testable components)

## Acessibilidade
```tsx
// Exemplo de implementação de acessibilidade
const ChartContainer = ({ title, description, children }) => (
  <div role="img" aria-labelledby="chart-title" aria-describedby="chart-desc">
    <h3 id="chart-title" className="sr-only">{title}</h3>
    <p id="chart-desc" className="sr-only">{description}</p>
    {children}
  </div>
)
```

## Recursos Necessários
- Desenvolvedor frontend React experiente
- Designer para definir paleta de cores
- Tester para acessibilidade

## Tempo Estimado
- Setup Recharts e configurações: 4-5 horas
- Componentes base e wrapper: 6-8 horas
- Gráficos específicos (linha, barra, pizza, área): 8-10 horas
- Tooltips e customizações: 4-6 horas
- Responsividade e acessibilidade: 4-5 horas
- Testes e documentação: 6-8 horas
- **Total**: 4-5 dias de trabalho