'use client'

import { useLocale } from '@/contexts/LocaleContext'
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
  const { t, formatCurrency } = useLocale()
  const isIncome = category.category_type === 'income'

  return (
    <div
      className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden"
      onClick={() => onClick?.(category)}
    >
      {/* Color Bar at Top */}
      <div
        className="h-2 w-full"
        style={{ backgroundColor: category.color }}
      />

      {/* Gradient Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50/50 dark:to-gray-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="p-5">

      {/* Category Icon and Color */}
      <div className="relative flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-lg transform group-hover:scale-110 transition-transform duration-300"
            style={{ backgroundColor: category.color }}
          >
            {category.icon}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {category.name}
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm ${
                  isIncome
                    ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-700 dark:from-green-900/40 dark:to-green-800/40 dark:text-green-400'
                    : 'bg-gradient-to-r from-red-100 to-red-200 text-red-700 dark:from-red-900/40 dark:to-red-800/40 dark:text-red-400'
                }`}
              >
                {isIncome ? t('categories.types.income') : t('categories.types.expense')}
              </span>
              {category.is_default && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 dark:from-gray-700 dark:to-gray-600 dark:text-gray-300 shadow-sm">
                  {t('categories.default')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {!category.is_default && (
          <div className="relative flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(category)
                }}
                className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
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
                className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
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
        <div className="relative space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('categories.transactions')}</span>
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
              {category.usage_stats.transactions_count}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('categories.thisMonth')}</span>
            <span
              className={`text-sm font-bold px-3 py-1 rounded-full shadow-sm ${
                isIncome
                  ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-700 dark:from-green-900/40 dark:to-green-800/40 dark:text-green-400'
                  : 'bg-gradient-to-r from-red-100 to-red-200 text-red-700 dark:from-red-900/40 dark:to-red-800/40 dark:text-red-400'
              }`}
            >
              {formatCurrency(Number(category.usage_stats.total_amount_current_month || 0))}
            </span>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
