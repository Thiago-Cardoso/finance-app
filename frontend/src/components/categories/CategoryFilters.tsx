'use client'

import { Search, X } from 'lucide-react'
import { CategoryFilters as CategoryFiltersType } from '@/types/category'
import { Select } from '@/components/ui/Select/Select'

interface CategoryFiltersProps {
  filters: CategoryFiltersType
  onChange: (filters: CategoryFiltersType) => void
}

export function CategoryFilters({ filters, onChange }: CategoryFiltersProps) {
  const handleSearchChange = (value: string) => {
    onChange({ ...filters, search: value || undefined })
  }

  const handleTypeChange = (value: string) => {
    onChange({
      ...filters,
      category_type: value === 'all' ? 'all' : (value as 'income' | 'expense'),
    })
  }

  const handleDefaultFilterChange = (value: string) => {
    onChange({
      ...filters,
      is_default: value === 'all' ? undefined : value === 'true',
    })
  }

  const clearFilters = () => {
    onChange({
      category_type: 'all',
      search: undefined,
      is_default: undefined,
    })
  }

  const hasActiveFilters =
    filters.search ||
    (filters.category_type && filters.category_type !== 'all') ||
    filters.is_default !== undefined

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Type Filter */}
        <div className="w-full sm:w-48">
          <Select
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'income', label: 'Income' },
              { value: 'expense', label: 'Expense' },
            ]}
            value={filters.category_type || 'all'}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Default Filter */}
        <div className="w-full sm:w-48">
          <Select
            options={[
              { value: 'all', label: 'All Categories' },
              { value: 'true', label: 'Default Only' },
              { value: 'false', label: 'Custom Only' },
            ]}
            value={
              filters.is_default === undefined
                ? 'all'
                : filters.is_default
                ? 'true'
                : 'false'
            }
            onChange={(e) => handleDefaultFilterChange(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Clear all filters"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </div>
    </div>
  )
}
