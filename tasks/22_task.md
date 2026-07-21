---
status: pending
parallelizable: false
blocked_by: ["3.0", "16.0", "17.0"]
---

<task_context>
<domain>frontend/features</domain>
<type>implementation</type>
<scope>core_feature</scope>
<complexity>high</complexity>
<dependencies>frontend_setup, forms, budgets_backend</dependencies>
<unblocks>"23.0", "25.0"</unblocks>
</task_context>

# Tarefa 22.0: Interface de Orçamentos (Frontend)

## Visão Geral
Desenvolver interface completa para gerenciamento de orçamentos no frontend, incluindo criação, edição, monitoramento em tempo real, visualizações gráficas e sistema de alertas visuais.

## Requisitos
- CRUD completo de orçamentos
- Dashboard de monitoramento em tempo real
- Visualizações gráficas de progresso
- Sistema de alertas visuais
- Formulários intuitivos para criação/edição
- Comparação de múltiplos orçamentos
- Filtros e busca avançada
- Interface responsiva e acessível
- Notificações em tempo real
- Exportação de dados de orçamentos

## Subtarefas
- [ ] 22.1 Página principal de orçamentos
- [ ] 22.2 Formulário de criação/edição de orçamentos
- [ ] 22.3 Dashboard de monitoramento individual
- [ ] 22.4 Componentes de visualização de progresso
- [ ] 22.5 Sistema de alertas visuais
- [ ] 22.6 Comparação de orçamentos
- [ ] 22.7 Filtros e busca avançada
- [ ] 22.8 Configuração de alertas
- [ ] 22.9 Relatórios de performance
- [ ] 22.10 Integração com notificações

## Sequenciamento
- Bloqueado por: 3.0 (Frontend Setup), 16.0 (Forms), 17.0 (Budgets Backend)
- Desbloqueia: 23.0 (Dashboard Avançado), 25.0 (Metas Financeiras)
- Paralelizável: Não (depende de formulários e backend de orçamentos)

## Detalhes de Implementação

### 1. Types para Orçamentos
```ts
// src/types/budgets.ts
export interface Budget {
  id: number
  name: string
  description: string
  amount: number
  period_type: 'monthly' | 'quarterly' | 'yearly' | 'custom'
  status: 'active' | 'paused' | 'completed' | 'cancelled'
  start_date: string
  end_date: string
  is_recurring: boolean
  category?: Category
  spent_amount: number
  remaining_amount: number
  usage_percentage: number
  is_over_budget: boolean
  days_remaining: number
  status_summary: 'on_track' | 'over_budget' | 'critical' | 'ahead_of_schedule' | 'behind_schedule'
  created_at: string
  updated_at: string
}

export interface BudgetPeriod {
  id: number
  start_date: string
  end_date: string
  allocated_amount: number
  spent_amount: number
  remaining_amount: number
  usage_percentage: number
  is_current: boolean
  is_completed: boolean
  days_remaining: number
  performance_score: number
}

export interface BudgetAlert {
  id: number
  alert_type: 'percentage' | 'absolute' | 'days_remaining'
  threshold_value: number
  message: string
  status: 'pending' | 'sent' | 'dismissed'
  is_active: boolean
  sent_at?: string
  formatted_threshold: string
  created_at: string
}

export interface BudgetFilters {
  status?: 'active' | 'paused' | 'completed' | 'cancelled'
  period_type?: 'monthly' | 'quarterly' | 'yearly' | 'custom'
  category_id?: number
  search?: string
}

export interface BudgetFormData {
  name: string
  description?: string
  amount: number
  category_id?: number
  period_type: 'monthly' | 'quarterly' | 'yearly' | 'custom'
  start_date: Date
  end_date?: Date
  is_recurring: boolean
}
```

### 2. Hooks para Orçamentos
```tsx
// src/hooks/useBudgets.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { Budget, BudgetFilters, BudgetFormData, BudgetAlert } from '@/types/budgets'

export function useBudgets(filters: BudgetFilters = {}) {
  return useQuery({
    queryKey: ['budgets', filters],
    queryFn: () => apiClient.get('/budgets', { params: filters }),
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useBudget(id: number) {
  return useQuery({
    queryKey: ['budgets', id],
    queryFn: () => apiClient.get(`/budgets/${id}`),
    staleTime: 1 * 60 * 1000, // 1 minute
    enabled: !!id
  })
}

export function useBudgetDashboard() {
  return useQuery({
    queryKey: ['budgets', 'dashboard'],
    queryFn: () => apiClient.get('/budgets/dashboard'),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  })
}

export function useCreateBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BudgetFormData) => apiClient.post('/budgets', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
    }
  })
}

export function useUpdateBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<BudgetFormData> }) =>
      apiClient.put(`/budgets/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      queryClient.invalidateQueries({ queryKey: ['budgets', id] })
    }
  })
}

export function useDeleteBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`/budgets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
    }
  })
}

export function useCreateBudgetAlert() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ budgetId, alert }: { budgetId: number; alert: Partial<BudgetAlert> }) =>
      apiClient.post(`/budgets/${budgetId}/alerts`, alert),
    onSuccess: (_, { budgetId }) => {
      queryClient.invalidateQueries({ queryKey: ['budgets', budgetId] })
    }
  })
}
```

### 3. Esquemas de Validação
```ts
// src/lib/validations/budgets.ts
import { z } from 'zod'

export const budgetFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome não pode ter mais de 100 caracteres'),
  description: z
    .string()
    .max(500, 'Descrição não pode ter mais de 500 caracteres')
    .optional(),
  amount: z
    .number({ invalid_type_error: 'Valor deve ser um número' })
    .positive('Valor deve ser positivo')
    .max(9999999.99, 'Valor máximo é R$ 9.999.999,99'),
  category_id: z.number().optional(),
  period_type: z.enum(['monthly', 'quarterly', 'yearly', 'custom'], {
    required_error: 'Tipo de período é obrigatório'
  }),
  start_date: z.date({
    required_error: 'Data de início é obrigatória',
    invalid_type_error: 'Data inválida'
  }),
  end_date: z.date({
    invalid_type_error: 'Data inválida'
  }).optional(),
  is_recurring: z.boolean().default(false)
}).refine((data) => {
  if (data.end_date && data.start_date) {
    return data.end_date >= data.start_date
  }
  return true
}, {
  message: 'Data final deve ser posterior à data inicial',
  path: ['end_date']
})

export const budgetAlertSchema = z.object({
  alert_type: z.enum(['percentage', 'absolute', 'days_remaining'], {
    required_error: 'Tipo de alerta é obrigatório'
  }),
  threshold_value: z
    .number({ invalid_type_error: 'Valor deve ser um número' })
    .positive('Valor deve ser positivo'),
  message: z
    .string()
    .min(1, 'Mensagem é obrigatória')
    .max(500, 'Mensagem não pode ter mais de 500 caracteres'),
  is_active: z.boolean().default(true)
})

export type BudgetFormData = z.infer<typeof budgetFormSchema>
export type BudgetAlertData = z.infer<typeof budgetAlertSchema>
```

### 4. Formulário de Orçamento
```tsx
// src/components/budgets/BudgetForm/BudgetForm.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '@/components/forms/Form/Form'
import { FormField } from '@/components/forms/FormField/FormField'
import { Input } from '@/components/forms/Input/Input'
import { MoneyInput } from '@/components/forms/MoneyInput/MoneyInput'
import { Select } from '@/components/forms/Select/Select'
import { DatePicker } from '@/components/forms/DatePicker/DatePicker'
import { Button } from '@/components/ui/Button/Button'
import { useCategories } from '@/hooks/useCategories'
import { budgetFormSchema, BudgetFormData } from '@/lib/validations/budgets'
import { Budget } from '@/types/budgets'

interface BudgetFormProps {
  initialData?: Partial<Budget>
  onSubmit: (data: BudgetFormData) => void | Promise<void>
  loading?: boolean
  submitLabel?: string
}

export function BudgetForm({
  initialData,
  onSubmit,
  loading = false,
  submitLabel = 'Salvar Orçamento'
}: BudgetFormProps) {
  const { data: categoriesData } = useCategories()

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      name: '',
      description: '',
      amount: 0,
      period_type: 'monthly',
      start_date: new Date(),
      is_recurring: false,
      ...initialData
    }
  })

  const categories = categoriesData?.data || []
  const categoryOptions = [
    { value: '', label: 'Orçamento Geral' },
    ...categories.map(category => ({
      value: category.id.toString(),
      label: category.name,
      color: category.color
    }))
  ]

  const periodTypeOptions = [
    { value: 'monthly', label: 'Mensal' },
    { value: 'quarterly', label: 'Trimestral' },
    { value: 'yearly', label: 'Anual' },
    { value: 'custom', label: 'Personalizado' }
  ]

  const watchedPeriodType = form.watch('period_type')
  const watchedStartDate = form.watch('start_date')

  // Auto-set end date based on period type
  const handlePeriodTypeChange = (periodType: string) => {
    if (!watchedStartDate || periodType === 'custom') return

    const startDate = new Date(watchedStartDate)
    let endDate: Date

    switch (periodType) {
      case 'monthly':
        endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)
        break
      case 'quarterly':
        const quarterStart = Math.floor(startDate.getMonth() / 3) * 3
        endDate = new Date(startDate.getFullYear(), quarterStart + 3, 0)
        break
      case 'yearly':
        endDate = new Date(startDate.getFullYear(), 11, 31)
        break
      default:
        return
    }

    form.setValue('end_date', endDate)
  }

  return (
    <Form form={form} onSubmit={onSubmit} className="space-y-6">
      <FormField name="name" label="Nome do Orçamento" required>
        <Input
          name="name"
          placeholder="Ex: Orçamento Alimentação Janeiro"
        />
      </FormField>

      <FormField name="description" label="Descrição">
        <textarea
          {...form.register('description')}
          rows={3}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          placeholder="Descrição opcional do orçamento (opcional)"
        />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField name="amount" label="Valor do Orçamento" required>
          <MoneyInput name="amount" />
        </FormField>

        <FormField name="category_id" label="Categoria">
          <Select
            name="category_id"
            options={categoryOptions}
            placeholder="Selecione uma categoria"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField name="period_type" label="Tipo de Período" required>
          <Select
            name="period_type"
            options={periodTypeOptions}
            onChange={handlePeriodTypeChange}
            isClearable={false}
            isSearchable={false}
          />
        </FormField>

        <FormField name="start_date" label="Data de Início" required>
          <DatePicker name="start_date" />
        </FormField>
      </div>

      {watchedPeriodType === 'custom' && (
        <FormField name="end_date" label="Data de Término" required>
          <DatePicker name="end_date" />
        </FormField>
      )}

      <FormField name="is_recurring">
        <label className="flex items-center">
          <input
            type="checkbox"
            {...form.register('is_recurring')}
            className="rounded border-gray-300 text-primary-600 focus:border-primary-500 focus:ring-primary-500"
          />
          <span className="ml-2 text-sm text-gray-700">
            Orçamento recorrente (renovar automaticamente)
          </span>
        </label>
      </FormField>

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => form.reset()}
        >
          Limpar
        </Button>
        <Button
          type="submit"
          loading={loading}
        >
          {submitLabel}
        </Button>
      </div>
    </Form>
  )
}
```

### 5. Card de Orçamento
```tsx
// src/components/budgets/BudgetCard/BudgetCard.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Budget } from '@/types/budgets'
import { formatCurrency } from '@/lib/utils'
import { clsx } from 'clsx'

interface BudgetCardProps {
  budget: Budget
  onEdit?: (budget: Budget) => void
  onDelete?: (id: number) => void
}

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const [showActions, setShowActions] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'over_budget':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'critical':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'ahead_of_schedule':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'behind_schedule':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'on_track':
        return 'No Prazo'
      case 'over_budget':
        return 'Estourado'
      case 'critical':
        return 'Crítico'
      case 'ahead_of_schedule':
        return 'Adiantado'
      case 'behind_schedule':
        return 'Atrasado'
      default:
        return 'Desconhecido'
    }
  }

  const progressWidth = Math.min(budget.usage_percentage, 100)
  const progressColor = budget.usage_percentage >= 100
    ? 'bg-red-500'
    : budget.usage_percentage >= 90
      ? 'bg-orange-500'
      : budget.usage_percentage >= 75
        ? 'bg-yellow-500'
        : 'bg-green-500'

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-900">
              <Link
                href={`/budgets/${budget.id}`}
                className="hover:text-primary-600 transition-colors"
              >
                {budget.name}
              </Link>
            </h3>
            {budget.category && (
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: budget.category.color }}
                title={budget.category.name}
              />
            )}
          </div>
          {budget.description && (
            <p className="text-sm text-gray-600 mt-1">{budget.description}</p>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          {showActions && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
              <div className="py-1">
                <button
                  onClick={() => {
                    onEdit?.(budget)
                    setShowActions(false)
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Editar
                </button>
                <Link
                  href={`/budgets/${budget.id}`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowActions(false)}
                >
                  Ver Detalhes
                </Link>
                <button
                  onClick={() => {
                    onDelete?.(budget.id)
                    setShowActions(false)
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Excluir
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-4">
        <span className={clsx(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
          getStatusColor(budget.status_summary)
        )}>
          {getStatusLabel(budget.status_summary)}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progresso</span>
          <span>{budget.usage_percentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={clsx('h-2 rounded-full transition-all duration-300', progressColor)}
            style={{ width: `${progressWidth}%` }}
          />
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs text-gray-500">Orçado</p>
          <p className="text-sm font-semibold text-gray-900">
            {formatCurrency(budget.amount)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Gasto</p>
          <p className="text-sm font-semibold text-red-600">
            {formatCurrency(budget.spent_amount)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Restante</p>
          <p className={clsx(
            'text-sm font-semibold',
            budget.remaining_amount >= 0 ? 'text-green-600' : 'text-red-600'
          )}>
            {formatCurrency(budget.remaining_amount)}
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between text-xs text-gray-500">
          <span>
            {budget.period_type === 'monthly' ? 'Mensal' :
             budget.period_type === 'quarterly' ? 'Trimestral' :
             budget.period_type === 'yearly' ? 'Anual' : 'Personalizado'}
          </span>
          <span>{budget.days_remaining} dias restantes</span>
        </div>
      </div>
    </div>
  )
}
```

### 6. Página Principal de Orçamentos
```tsx
// src/app/budgets/page.tsx
'use client'

import { useState } from 'react'
import { BudgetCard } from '@/components/budgets/BudgetCard/BudgetCard'
import { BudgetForm } from '@/components/budgets/BudgetForm/BudgetForm'
import { Button } from '@/components/ui/Button/Button'
import { Modal } from '@/components/ui/Modal/Modal'
import { Select } from '@/components/forms/Select/Select'
import { Input } from '@/components/forms/Input/Input'
import { useBudgets, useCreateBudget, useUpdateBudget, useDeleteBudget } from '@/hooks/useBudgets'
import { useCategories } from '@/hooks/useCategories'
import { Budget, BudgetFilters } from '@/types/budgets'
import { BudgetFormData } from '@/lib/validations/budgets'

export default function BudgetsPage() {
  const [filters, setFilters] = useState<BudgetFilters>({})
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const { data: budgetsData, isLoading } = useBudgets(filters)
  const { data: categoriesData } = useCategories()
  const { mutate: createBudget, isPending: creating } = useCreateBudget()
  const { mutate: updateBudget, isPending: updating } = useUpdateBudget()
  const { mutate: deleteBudget } = useDeleteBudget()

  const budgets = budgetsData?.data || []
  const categories = categoriesData?.data || []

  const statusOptions = [
    { value: '', label: 'Todos os status' },
    { value: 'active', label: 'Ativos' },
    { value: 'paused', label: 'Pausados' },
    { value: 'completed', label: 'Concluídos' },
    { value: 'cancelled', label: 'Cancelados' }
  ]

  const periodOptions = [
    { value: '', label: 'Todos os períodos' },
    { value: 'monthly', label: 'Mensal' },
    { value: 'quarterly', label: 'Trimestral' },
    { value: 'yearly', label: 'Anual' },
    { value: 'custom', label: 'Personalizado' }
  ]

  const categoryOptions = [
    { value: '', label: 'Todas as categorias' },
    ...categories.map(category => ({
      value: category.id.toString(),
      label: category.name
    }))
  ]

  const handleCreateBudget = (data: BudgetFormData) => {
    createBudget(data, {
      onSuccess: () => {
        setShowCreateModal(false)
      }
    })
  }

  const handleUpdateBudget = (data: BudgetFormData) => {
    if (!editingBudget) return

    updateBudget({
      id: editingBudget.id,
      data
    }, {
      onSuccess: () => {
        setEditingBudget(null)
      }
    })
  }

  const handleDeleteBudget = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este orçamento?')) {
      deleteBudget(id)
    }
  }

  const filteredBudgets = budgets.filter(budget =>
    budget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    budget.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Orçamentos</h1>
            <p className="text-gray-600 mt-2">
              Gerencie seus orçamentos e monitore seus gastos
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            Novo Orçamento
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar orçamentos..."
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <Select
                value={filters.status || ''}
                onChange={(value) => setFilters({ ...filters, status: value || undefined })}
                options={statusOptions}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Período
              </label>
              <Select
                value={filters.period_type || ''}
                onChange={(value) => setFilters({ ...filters, period_type: value || undefined })}
                options={periodOptions}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <Select
                value={filters.category_id?.toString() || ''}
                onChange={(value) => setFilters({ ...filters, category_id: value ? parseInt(value) : undefined })}
                options={categoryOptions}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Budget Grid */}
        {filteredBudgets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBudgets.map(budget => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                onEdit={setEditingBudget}
                onDelete={handleDeleteBudget}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum orçamento encontrado
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filters.status || filters.period_type || filters.category_id
                ? 'Tente ajustar os filtros ou buscar por outros termos.'
                : 'Comece criando seu primeiro orçamento para controlar seus gastos.'
              }
            </p>
            {!searchTerm && !filters.status && !filters.period_type && !filters.category_id && (
              <Button onClick={() => setShowCreateModal(true)}>
                Criar Primeiro Orçamento
              </Button>
            )}
          </div>
        )}

        {/* Create Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Novo Orçamento"
          size="lg"
        >
          <BudgetForm
            onSubmit={handleCreateBudget}
            loading={creating}
            submitLabel="Criar Orçamento"
          />
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={!!editingBudget}
          onClose={() => setEditingBudget(null)}
          title="Editar Orçamento"
          size="lg"
        >
          {editingBudget && (
            <BudgetForm
              initialData={editingBudget}
              onSubmit={handleUpdateBudget}
              loading={updating}
              submitLabel="Atualizar Orçamento"
            />
          )}
        </Modal>
      </div>
    </div>
  )
}
```

### 7. Testes dos Componentes
```tsx
// src/components/budgets/BudgetCard/BudgetCard.test.tsx
import { render, screen, fireEvent } from '@/utils/test-utils'
import { BudgetCard } from './BudgetCard'

const mockBudget = {
  id: 1,
  name: 'Orçamento Alimentação',
  description: 'Orçamento mensal para gastos com alimentação',
  amount: 1000,
  period_type: 'monthly',
  status: 'active',
  start_date: '2024-01-01',
  end_date: '2024-01-31',
  is_recurring: true,
  category: {
    id: 1,
    name: 'Alimentação',
    color: '#ef4444'
  },
  spent_amount: 750,
  remaining_amount: 250,
  usage_percentage: 75,
  is_over_budget: false,
  days_remaining: 10,
  status_summary: 'on_track',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-15T12:00:00Z'
}

describe('BudgetCard', () => {
  it('renders budget information correctly', () => {
    render(<BudgetCard budget={mockBudget} />)

    expect(screen.getByText('Orçamento Alimentação')).toBeInTheDocument()
    expect(screen.getByText('Orçamento mensal para gastos com alimentação')).toBeInTheDocument()
    expect(screen.getByText('R$ 1.000,00')).toBeInTheDocument() // Orçado
    expect(screen.getByText('R$ 750,00')).toBeInTheDocument() // Gasto
    expect(screen.getByText('R$ 250,00')).toBeInTheDocument() // Restante
    expect(screen.getByText('75.0%')).toBeInTheDocument() // Progresso
  })

  it('shows correct status badge', () => {
    render(<BudgetCard budget={mockBudget} />)

    expect(screen.getByText('No Prazo')).toBeInTheDocument()
  })

  it('displays progress bar with correct color', () => {
    render(<BudgetCard budget={mockBudget} />)

    const progressBar = document.querySelector('.bg-yellow-500')
    expect(progressBar).toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', () => {
    const mockOnEdit = jest.fn()
    render(<BudgetCard budget={mockBudget} onEdit={mockOnEdit} />)

    // Click actions menu
    const actionsButton = screen.getByRole('button')
    fireEvent.click(actionsButton)

    // Click edit button
    const editButton = screen.getByText('Editar')
    fireEvent.click(editButton)

    expect(mockOnEdit).toHaveBeenCalledWith(mockBudget)
  })

  it('calls onDelete when delete button is clicked', () => {
    const mockOnDelete = jest.fn()
    window.confirm = jest.fn(() => true)

    render(<BudgetCard budget={mockBudget} onDelete={mockOnDelete} />)

    // Click actions menu
    const actionsButton = screen.getByRole('button')
    fireEvent.click(actionsButton)

    // Click delete button
    const deleteButton = screen.getByText('Excluir')
    fireEvent.click(deleteButton)

    expect(mockOnDelete).toHaveBeenCalledWith(mockBudget.id)
  })

  it('shows over budget status correctly', () => {
    const overBudget = {
      ...mockBudget,
      spent_amount: 1200,
      remaining_amount: -200,
      usage_percentage: 120,
      is_over_budget: true,
      status_summary: 'over_budget'
    }

    render(<BudgetCard budget={overBudget} />)

    expect(screen.getByText('Estourado')).toBeInTheDocument()

    const progressBar = document.querySelector('.bg-red-500')
    expect(progressBar).toBeInTheDocument()
  })
})
```

## Critérios de Sucesso
- [ ] CRUD completo de orçamentos funcionando
- [ ] Dashboard de monitoramento implementado
- [ ] Visualizações gráficas de progresso
- [ ] Sistema de alertas visuais
- [ ] Formulários intuitivos e validados
- [ ] Filtros e busca funcionando
- [ ] Interface responsiva e acessível
- [ ] Integração com backend completa
- [ ] Testes unitários com cobertura 85%+
- [ ] Performance otimizada

## UX e Acessibilidade
- Design intuitivo e responsivo
- Feedback visual claro de status
- Navegação por teclado
- Screen reader compatibility
- Loading states em todas as operações

## Recursos Necessários
- Desenvolvedor frontend React sênior
- Designer UX para validação da interface
- Tester para validação de usabilidade

## Tempo Estimado
- Estrutura e types: 4-6 horas
- Formulários de orçamento: 8-10 horas
- Componentes de visualização: 8-10 horas
- Página principal: 8-10 horas
- Sistema de filtros: 6-8 horas
- Alertas e notificações: 6-8 horas
- Testes e otimização: 8-10 horas
- **Total**: 6-8 dias de trabalho