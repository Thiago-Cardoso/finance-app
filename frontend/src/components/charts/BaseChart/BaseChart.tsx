'use client'

import { useResizeDetector } from 'react-resize-detector'
import { ResponsiveContainer } from 'recharts'
import { ChartConfig } from '@/types/charts'
import { AlertCircle } from 'lucide-react'

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
}: BaseChartProps) {
  const { width: containerWidth, ref } = useResizeDetector()

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ height }}
        role="status"
        aria-label="Loading chart"
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={`flex flex-col items-center justify-center text-center p-4 ${className}`}
        style={{ height }}
        role="alert"
      >
        <div className="text-red-500 dark:text-red-400 mb-2">
          <AlertCircle className="w-8 h-8" />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
      </div>
    )
  }

  return (
    <div ref={ref} className={`chart-container ${className}`}>
      {(title || description) && (
        <div className="chart-header mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
      )}

      <ResponsiveContainer
        width={responsive ? '100%' : width}
        height={height}
      >
        {children as any}
      </ResponsiveContainer>
    </div>
  )
}
