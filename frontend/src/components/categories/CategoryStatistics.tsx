'use client'

import { CategoryStatistics as CategoryStatisticsType } from '@/types/category'
import { TrendingUp, TrendingDown, Minus, Tag, Activity } from 'lucide-react'

interface CategoryStatisticsProps {
  statistics: CategoryStatisticsType
  isLoading?: boolean
}

export function CategoryStatistics({
  statistics,
  isLoading = false,
}: CategoryStatisticsProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    )
  }

  const getTrendIcon = (trend: 'increasing' | 'decreasing' | 'stable') => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-red-500" />
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-green-500" />
      default:
        return <Minus className="w-4 h-4 text-gray-500" />
    }
  }

  const getTrendColor = (trend: 'increasing' | 'decreasing' | 'stable') => {
    switch (trend) {
      case 'increasing':
        return 'text-red-600 dark:text-red-400'
      case 'decreasing':
        return 'text-green-600 dark:text-green-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Tag className="w-5 h-5" />
          Summary
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Categories</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
              {statistics.summary.total_categories}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
              {statistics.summary.active_categories}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">With Transactions</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {statistics.summary.categories_with_transactions}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Unused</p>
            <p className="text-2xl font-bold text-gray-500 dark:text-gray-400 mt-1">
              {statistics.summary.unused_categories}
            </p>
          </div>
        </div>
      </div>

      {/* Top Categories */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Top Categories
        </h3>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {statistics.top_categories.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No category data available
              </div>
            ) : (
              statistics.top_categories.map((category) => (
                <div
                  key={category.id}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg"
                      style={{ backgroundColor: category.color }}
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {category.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {category.transactions_count} transaction
                        {category.transactions_count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        category.category_type === 'income'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      ${category.total_amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Category Trends */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Trends (Last 2 Months)
        </h3>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {Object.entries(statistics.category_trends).length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No trend data available
              </div>
            ) : (
              Object.entries(statistics.category_trends).map(([name, trend]) => (
                <div
                  key={trend.id}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Previous: ${trend.previous_amount.toFixed(2)} → Current: $
                      {trend.current_amount.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(trend.trend)}
                    <span className={`font-semibold ${getTrendColor(trend.trend)}`}>
                      {trend.change_percent > 0 ? '+' : ''}
                      {trend.change_percent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
