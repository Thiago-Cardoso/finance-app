'use client';

import { GoalFilters as GoalFiltersType, GoalStatus, GoalType, GoalPriority } from '@/types/goal';

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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mt-6">
      <div className="flex flex-wrap items-center gap-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtros:</h3>

        {/* Status Filter */}
        <select
          value={filters.status || ''}
          onChange={(e) => handleFilterChange('status', e.target.value as GoalStatus)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos os Status</option>
          <option value="active">Ativa</option>
          <option value="paused">Pausada</option>
          <option value="completed">Concluída</option>
          <option value="failed">Falhou</option>
          <option value="cancelled">Cancelada</option>
        </select>

        {/* Goal Type Filter */}
        <select
          value={filters.goal_type || ''}
          onChange={(e) => handleFilterChange('goal_type', e.target.value as GoalType)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos os Tipos</option>
          <option value="savings">Poupança</option>
          <option value="debt_payoff">Pagamento de Dívida</option>
          <option value="investment">Investimento</option>
          <option value="expense_reduction">Redução de Gastos</option>
          <option value="general">Geral</option>
        </select>

        {/* Priority Filter */}
        <select
          value={filters.priority || ''}
          onChange={(e) => handleFilterChange('priority', e.target.value as GoalPriority)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas as Prioridades</option>
          <option value="low">Baixa</option>
          <option value="medium">Média</option>
          <option value="high">Alta</option>
          <option value="urgent">Urgente</option>
        </select>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            Limpar Filtros
          </button>
        )}
      </div>
    </div>
  );
}
