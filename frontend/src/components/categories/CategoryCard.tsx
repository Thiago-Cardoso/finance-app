'use client'

import { Category } from '@/types/category'
import { Edit2, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/Button/Button'

interface CategoryCardProps {
  category: Category
  onEdit?: (category: Category) => void
  onDelete?: (category: Category) => void
  onClick?: (category: Category) => void
}

export function CategoryCard({
  category,
  onEdit,
  onDelete,
  onClick,
}: CategoryCardProps) {
  const isIncome = category.category_type === 'income'

  return (
    <div
      className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick?.(category)}
    >
      {/* Category Icon and Color */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
            style={{ backgroundColor: category.color }}
          >
            {category.icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {category.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  isIncome
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}
              >
                {isIncome ? 'Income' : 'Expense'}
              </span>
              {category.is_default && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                  Default
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {!category.is_default && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(category)
                }}
                className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                aria-label="Edit category"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {onDelete && category.usage_stats?.can_be_deleted && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(category)
                }}
                className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                aria-label="Delete category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Usage Stats */}
      {category.usage_stats && (
        <div className="space-y-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Transactions</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {category.usage_stats.transactions_count}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">This Month</span>
            <span
              className={`font-medium ${
                isIncome
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              ${category.usage_stats.total_amount_current_month.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
