'use client'

import { useCategories } from '@/hooks/useCategories'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Search, Filter, X } from 'lucide-react'

interface TransactionFiltersProps {
  filters: {
    search: string
    category_id: string
    transaction_type: string
    date_from: string
    date_to: string
    amount_min: string
    amount_max: string
  }
  onFiltersChange: (filters: any) => void
}

export function TransactionFilters({ filters, onFiltersChange }: TransactionFiltersProps) {
  const { data: categories } = useCategories()

  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const handleClearFilters = () => {
    onFiltersChange({
      search: '',
      category_id: '',
      transaction_type: '',
      date_from: '',
      date_to: '',
      amount_min: '',
      amount_max: ''
    })
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Filtros
        </h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar transações..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Transaction Type */}
        <Select
          label="Tipo"
          value={filters.transaction_type}
          onChange={(e) => handleFilterChange('transaction_type', e.target.value)}
          options={[
            { value: '', label: 'Todos os tipos' },
            { value: 'income', label: 'Receitas' },
            { value: 'expense', label: 'Despesas' },
            { value: 'transfer', label: 'Transferências' },
          ]}
        />

        {/* Category */}
        <Select
          label="Categoria"
          value={filters.category_id}
          onChange={(e) => handleFilterChange('category_id', e.target.value)}
          options={[
            { value: '', label: 'Todas as categorias' },
            ...(categories?.map(cat => ({
              value: cat.id.toString(),
              label: cat.name
            })) || [])
          ]}
        />

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Período
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              placeholder="Data inicial"
              value={filters.date_from}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
            />
            <Input
              type="date"
              placeholder="Data final"
              value={filters.date_to}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
            />
          </div>
        </div>

        {/* Amount Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Valor
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              step="0.01"
              placeholder="Valor mínimo"
              value={filters.amount_min}
              onChange={(e) => handleFilterChange('amount_min', e.target.value)}
            />
            <Input
              type="number"
              step="0.01"
              placeholder="Valor máximo"
              value={filters.amount_max}
              onChange={(e) => handleFilterChange('amount_max', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
