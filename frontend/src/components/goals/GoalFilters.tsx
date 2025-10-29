'use client';

import { GoalFilters as GoalFiltersType, GoalStatus, GoalType, GoalPriority } from '@/types/goal';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { X } from 'lucide-react';

interface GoalFiltersProps {
  filters: GoalFiltersType;
  onFiltersChange: (filters: GoalFiltersType) => void;
}

export function GoalFilters({ filters, onFiltersChange }: GoalFiltersProps) {
  const handleFilterChange = (key: keyof GoalFiltersType, value: any) => {
    const newFilters = { ...filters };
    if (value === '' || value === undefined) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  const statusOptions = [
    { value: '', label: 'Todos os Status' },
    { value: 'active', label: 'Ativa' },
    { value: 'paused', label: 'Pausada' },
    { value: 'completed', label: 'Concluída' },
    { value: 'failed', label: 'Falhou' },
    { value: 'cancelled', label: 'Cancelada' },
  ];

  const typeOptions = [
    { value: '', label: 'Todos os Tipos' },
    { value: 'savings', label: 'Poupança' },
    { value: 'debt_payoff', label: 'Pagamento de Dívida' },
    { value: 'investment', label: 'Investimento' },
    { value: 'expense_reduction', label: 'Redução de Gastos' },
    { value: 'general', label: 'Geral' },
  ];

  const priorityOptions = [
    { value: '', label: 'Todas as Prioridades' },
    { value: 'low', label: 'Baixa' },
    { value: 'medium', label: 'Média' },
    { value: 'high', label: 'Alta' },
    { value: 'urgent', label: 'Urgente' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
          Filtros
        </h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
            <span>Limpar Filtros</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Filter */}
        <Select
          value={filters.status || ''}
          onChange={(e) => handleFilterChange('status', e.target.value as GoalStatus)}
          options={statusOptions}
          className="text-sm"
        />

        {/* Goal Type Filter */}
        <Select
          value={filters.goal_type || ''}
          onChange={(e) => handleFilterChange('goal_type', e.target.value as GoalType)}
          options={typeOptions}
          className="text-sm"
        />

        {/* Priority Filter */}
        <Select
          value={filters.priority || ''}
          onChange={(e) => handleFilterChange('priority', e.target.value as GoalPriority)}
          options={priorityOptions}
          className="text-sm"
        />
      </div>
    </div>
  );
}
