---
status: pending
parallelizable: false
blocked_by: ["14.0", "19.0", "22.0"]
---

<task_context>
<domain>frontend/advanced_features</domain>
<type>implementation</type>
<scope>core_feature</scope>
<complexity>high</complexity>
<dependencies>dashboard_basic, reports, budgets_interface</dependencies>
<unblocks>"26.0", "30.0"</unblocks>
</task_context>

# Tarefa 23.0: Dashboard Avançado com Widgets Customizáveis

## Visão Geral
Desenvolver dashboard avançado e customizável no frontend, incluindo widgets arrastavéis, filtros em tempo real, comparações de períodos, alertas visuais e personalização completa da interface do usuário.

## Requisitos
- Layout de widgets customizável (drag & drop)
- Múltiplos tipos de widgets financeiros
- Filtros globais em tempo real
- Comparações de períodos automáticas
- Alertas e notificações visuais
- Temas e personalização visual
- Dashboard responsivo e acessível
- Salvamento de layouts personalizados
- Widgets de terceiros (futuro)
- Exportação de dashboard

## Subtarefas
- [ ] 23.1 Sistema de grid customizável para widgets
- [ ] 23.2 Componentes de widgets financeiros
- [ ] 23.3 Sistema de drag & drop para layout
- [ ] 23.4 Filtros globais e contexto
- [ ] 23.5 Comparações de períodos
- [ ] 23.6 Sistema de alertas visuais
- [ ] 23.7 Personalização e temas
- [ ] 23.8 Salvamento de configurações
- [ ] 23.9 Dashboard responsivo
- [ ] 23.10 Exportação e sharing

## Sequenciamento
- Bloqueado por: 14.0 (Dashboard Interface), 19.0 (Relatórios), 22.0 (Orçamentos Interface)
- Desbloqueia: 26.0 (Performance), 30.0 (Deploy Produção)
- Paralelizável: Não (integra funcionalidades anteriores)

## Detalhes de Implementação

### 1. Types para Dashboard
```ts
// src/types/dashboard.ts
export interface Widget {
  id: string
  type: WidgetType
  title: string
  position: WidgetPosition
  size: WidgetSize
  config: WidgetConfig
  data?: any
  loading?: boolean
  error?: string
}

export interface WidgetPosition {
  x: number
  y: number
  w: number
  h: number
}

export interface WidgetSize {
  minW?: number
  minH?: number
  maxW?: number
  maxH?: number
}

export interface WidgetConfig {
  timeframe?: '7d' | '30d' | '90d' | '1y' | 'custom'
  category_ids?: number[]
  transaction_type?: 'income' | 'expense' | 'all'
  comparison_period?: boolean
  refresh_interval?: number
  chart_type?: 'line' | 'bar' | 'pie' | 'area'
  color_scheme?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  show_legend?: boolean
  show_labels?: boolean
  custom_filters?: Record<string, any>
}

export type WidgetType =
  | 'financial_summary'
  | 'expense_chart'
  | 'income_chart'
  | 'category_breakdown'
  | 'budget_progress'
  | 'recent_transactions'
  | 'spending_trends'
  | 'savings_rate'
  | 'goal_progress'
  | 'alerts_list'
  | 'monthly_comparison'
  | 'custom_metric'

export interface DashboardLayout {
  id: string
  name: string
  widgets: Widget[]
  theme: DashboardTheme
  filters: GlobalFilters
  created_at: string
  updated_at: string
  is_default: boolean
}

export interface DashboardTheme {
  primary_color: string
  background_color: string
  card_background: string
  text_color: string
  border_color: string
  grid_gap: number
  border_radius: number
}

export interface GlobalFilters {
  date_range: {
    start_date: string
    end_date: string
    preset?: '7d' | '30d' | '90d' | '1y'
  }
  category_ids: number[]
  transaction_types: ('income' | 'expense')[]
  min_amount?: number
  max_amount?: number
}

export interface WidgetData {
  [key: string]: any
  loading?: boolean
  error?: string
  last_updated: string
}
```

### 2. Context para Dashboard
```tsx
// src/contexts/DashboardContext.tsx
'use client'

import { createContext, useContext, useReducer, useEffect } from 'react'
import { Widget, DashboardLayout, GlobalFilters, DashboardTheme } from '@/types/dashboard'

interface DashboardState {
  layout: DashboardLayout | null
  widgets: Widget[]
  globalFilters: GlobalFilters
  theme: DashboardTheme
  editMode: boolean
  loading: boolean
  error: string | null
}

interface DashboardContextType extends DashboardState {
  updateWidget: (widgetId: string, updates: Partial<Widget>) => void
  addWidget: (widget: Widget) => void
  removeWidget: (widgetId: string) => void
  updateGlobalFilters: (filters: Partial<GlobalFilters>) => void
  updateTheme: (theme: Partial<DashboardTheme>) => void
  toggleEditMode: () => void
  saveLayout: () => Promise<void>
  loadLayout: (layoutId: string) => Promise<void>
  resetLayout: () => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

type DashboardAction =
  | { type: 'SET_LAYOUT'; payload: DashboardLayout }
  | { type: 'UPDATE_WIDGET'; payload: { id: string; updates: Partial<Widget> } }
  | { type: 'ADD_WIDGET'; payload: Widget }
  | { type: 'REMOVE_WIDGET'; payload: string }
  | { type: 'UPDATE_GLOBAL_FILTERS'; payload: Partial<GlobalFilters> }
  | { type: 'UPDATE_THEME'; payload: Partial<DashboardTheme> }
  | { type: 'TOGGLE_EDIT_MODE' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_LAYOUT' }

const defaultTheme: DashboardTheme = {
  primary_color: '#3b82f6',
  background_color: '#f9fafb',
  card_background: '#ffffff',
  text_color: '#111827',
  border_color: '#e5e7eb',
  grid_gap: 16,
  border_radius: 8
}

const defaultFilters: GlobalFilters = {
  date_range: {
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    preset: '30d'
  },
  category_ids: [],
  transaction_types: ['income', 'expense']
}

const initialState: DashboardState = {
  layout: null,
  widgets: [],
  globalFilters: defaultFilters,
  theme: defaultTheme,
  editMode: false,
  loading: false,
  error: null
}

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'SET_LAYOUT':
      return {
        ...state,
        layout: action.payload,
        widgets: action.payload.widgets,
        globalFilters: action.payload.filters,
        theme: action.payload.theme
      }

    case 'UPDATE_WIDGET':
      return {
        ...state,
        widgets: state.widgets.map(widget =>
          widget.id === action.payload.id
            ? { ...widget, ...action.payload.updates }
            : widget
        )
      }

    case 'ADD_WIDGET':
      return {
        ...state,
        widgets: [...state.widgets, action.payload]
      }

    case 'REMOVE_WIDGET':
      return {
        ...state,
        widgets: state.widgets.filter(widget => widget.id !== action.payload)
      }

    case 'UPDATE_GLOBAL_FILTERS':
      return {
        ...state,
        globalFilters: { ...state.globalFilters, ...action.payload }
      }

    case 'UPDATE_THEME':
      return {
        ...state,
        theme: { ...state.theme, ...action.payload }
      }

    case 'TOGGLE_EDIT_MODE':
      return {
        ...state,
        editMode: !state.editMode
      }

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      }

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      }

    case 'RESET_LAYOUT':
      return {
        ...state,
        widgets: [],
        editMode: false
      }

    default:
      return state
  }
}

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState)

  const updateWidget = (widgetId: string, updates: Partial<Widget>) => {
    dispatch({ type: 'UPDATE_WIDGET', payload: { id: widgetId, updates } })
  }

  const addWidget = (widget: Widget) => {
    dispatch({ type: 'ADD_WIDGET', payload: widget })
  }

  const removeWidget = (widgetId: string) => {
    dispatch({ type: 'REMOVE_WIDGET', payload: widgetId })
  }

  const updateGlobalFilters = (filters: Partial<GlobalFilters>) => {
    dispatch({ type: 'UPDATE_GLOBAL_FILTERS', payload: filters })
  }

  const updateTheme = (theme: Partial<DashboardTheme>) => {
    dispatch({ type: 'UPDATE_THEME', payload: theme })
  }

  const toggleEditMode = () => {
    dispatch({ type: 'TOGGLE_EDIT_MODE' })
  }

  const saveLayout = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })

      // API call to save layout
      const layoutData = {
        name: state.layout?.name || 'My Dashboard',
        widgets: state.widgets,
        theme: state.theme,
        filters: state.globalFilters
      }

      // await apiClient.post('/dashboard/layouts', layoutData)

      dispatch({ type: 'SET_ERROR', payload: null })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save layout' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const loadLayout = async (layoutId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })

      // API call to load layout
      // const response = await apiClient.get(`/dashboard/layouts/${layoutId}`)
      // dispatch({ type: 'SET_LAYOUT', payload: response.data })

      dispatch({ type: 'SET_ERROR', payload: null })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load layout' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const resetLayout = () => {
    dispatch({ type: 'RESET_LAYOUT' })
  }

  // Load default layout on mount
  useEffect(() => {
    // loadLayout('default')
  }, [])

  const value: DashboardContextType = {
    ...state,
    updateWidget,
    addWidget,
    removeWidget,
    updateGlobalFilters,
    updateTheme,
    toggleEditMode,
    saveLayout,
    loadLayout,
    resetLayout
  }

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  )
}

export const useDashboard = () => {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}
```

### 3. Componente Base de Widget
```tsx
// src/components/dashboard/Widget/Widget.tsx
'use client'

import { useState } from 'react'
import { Widget as WidgetType } from '@/types/dashboard'
import { useDashboard } from '@/contexts/DashboardContext'
import { clsx } from 'clsx'

interface WidgetProps {
  widget: WidgetType
  children: React.ReactNode
  className?: string
}

export function Widget({ widget, children, className }: WidgetProps) {
  const { editMode, removeWidget, updateWidget } = useDashboard()
  const [showMenu, setShowMenu] = useState(false)

  const handleRemove = () => {
    if (window.confirm('Tem certeza que deseja remover este widget?')) {
      removeWidget(widget.id)
    }
  }

  const handleDuplicate = () => {
    const duplicatedWidget: WidgetType = {
      ...widget,
      id: `${widget.id}_copy_${Date.now()}`,
      title: `${widget.title} (Cópia)`,
      position: {
        ...widget.position,
        x: widget.position.x + widget.position.w,
        y: widget.position.y
      }
    }

    // This would be handled by the grid system
    console.log('Duplicate widget:', duplicatedWidget)
  }

  const handleSettings = () => {
    // Open widget settings modal
    console.log('Open settings for:', widget.id)
  }

  return (
    <div
      className={clsx(
        'bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden',
        'transition-all duration-200 hover:shadow-md',
        editMode && 'ring-2 ring-primary-200 ring-opacity-50',
        className
      )}
      style={{
        backgroundColor: widget.config.color_scheme ? getColorScheme(widget.config.color_scheme).background : undefined
      }}
    >
      {/* Widget Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 truncate">
          {widget.title}
        </h3>

        <div className="flex items-center space-x-2">
          {widget.loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
          )}

          {editMode && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    <button
                      onClick={handleSettings}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Configurações
                    </button>
                    <button
                      onClick={handleDuplicate}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Duplicar
                    </button>
                    <button
                      onClick={handleRemove}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Widget Content */}
      <div className="p-4">
        {widget.error ? (
          <div className="flex items-center justify-center h-32 text-red-500">
            <div className="text-center">
              <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">Erro ao carregar dados</p>
            </div>
          </div>
        ) : widget.loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}

function getColorScheme(scheme: string) {
  const schemes = {
    default: { background: '#ffffff', text: '#111827' },
    primary: { background: '#eff6ff', text: '#1e40af' },
    success: { background: '#f0fdf4', text: '#166534' },
    warning: { background: '#fffbeb', text: '#92400e' },
    danger: { background: '#fef2f2', text: '#991b1b' }
  }

  return schemes[scheme as keyof typeof schemes] || schemes.default
}
```

### 4. Widget de Resumo Financeiro
```tsx
// src/components/dashboard/widgets/FinancialSummaryWidget/FinancialSummaryWidget.tsx
'use client'

import { Widget } from '../Widget/Widget'
import { Widget as WidgetType } from '@/types/dashboard'
import { useFinancialSummary } from '@/hooks/useAnalytics'
import { useDashboard } from '@/contexts/DashboardContext'
import { formatCurrency } from '@/lib/utils'
import { clsx } from 'clsx'

interface FinancialSummaryWidgetProps {
  widget: WidgetType
}

export function FinancialSummaryWidget({ widget }: FinancialSummaryWidgetProps) {
  const { globalFilters } = useDashboard()

  const { data, isLoading, error } = useFinancialSummary({
    start_date: globalFilters.date_range.start_date,
    end_date: globalFilters.date_range.end_date,
    category_ids: globalFilters.category_ids,
    transaction_type: globalFilters.transaction_types.length === 1 ? globalFilters.transaction_types[0] : undefined
  })

  const summary = data?.data?.summary?.current_period
  const growth = data?.data?.summary?.growth_rates

  const widgetWithState = {
    ...widget,
    loading: isLoading,
    error: error?.message
  }

  return (
    <Widget widget={widgetWithState}>
      {summary && (
        <div className="space-y-4">
          {/* Main Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              title="Receitas"
              value={summary.total_income}
              growth={growth?.income_growth}
              positive={true}
            />
            <MetricCard
              title="Despesas"
              value={summary.total_expense}
              growth={growth?.expense_growth}
              positive={false}
            />
            <MetricCard
              title="Saldo"
              value={summary.net_amount}
              growth={growth?.net_growth}
              positive={summary.net_amount >= 0}
            />
          </div>

          {/* Additional Info */}
          <div className="pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Transações:</span>
                <span className="ml-2 font-medium">{summary.transaction_count}</span>
              </div>
              <div>
                <span className="text-gray-500">Média por dia:</span>
                <span className="ml-2 font-medium">
                  {formatCurrency(summary.total_expense / 30)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Widget>
  )
}

interface MetricCardProps {
  title: string
  value: number
  growth?: number
  positive: boolean
}

function MetricCard({ title, value, growth, positive }: MetricCardProps) {
  const hasGrowth = growth !== undefined && growth !== 0
  const isPositiveGrowth = growth && growth > 0

  return (
    <div className="text-center">
      <p className="text-xs text-gray-500 mb-1">{title}</p>
      <p className={clsx(
        'text-lg font-bold',
        positive ? 'text-green-600' : 'text-red-600'
      )}>
        {formatCurrency(value)}
      </p>
      {hasGrowth && (
        <div className={clsx(
          'flex items-center justify-center text-xs mt-1',
          isPositiveGrowth ? 'text-green-600' : 'text-red-600'
        )}>
          {isPositiveGrowth ? (
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
          {Math.abs(growth!).toFixed(1)}%
        </div>
      )}
    </div>
  )
}
```

### 5. Sistema de Grid com Drag & Drop
```tsx
// src/components/dashboard/DashboardGrid/DashboardGrid.tsx
'use client'

import { useCallback } from 'react'
import { Responsive, WidthProvider, Layout } from 'react-grid-layout'
import { useDashboard } from '@/contexts/DashboardContext'
import { WidgetFactory } from '../WidgetFactory/WidgetFactory'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

const ResponsiveGridLayout = WidthProvider(Responsive)

export function DashboardGrid() {
  const { widgets, editMode, updateWidget, theme } = useDashboard()

  const layouts = {
    lg: widgets.map(widget => ({
      i: widget.id,
      x: widget.position.x,
      y: widget.position.y,
      w: widget.position.w,
      h: widget.position.h,
      minW: widget.size?.minW || 2,
      minH: widget.size?.minH || 2,
      maxW: widget.size?.maxW || 12,
      maxH: widget.size?.maxH || 10
    }))
  }

  const handleLayoutChange = useCallback((layout: Layout[], allLayouts: any) => {
    if (!editMode) return

    layout.forEach(item => {
      const widget = widgets.find(w => w.id === item.i)
      if (widget) {
        updateWidget(widget.id, {
          position: {
            x: item.x,
            y: item.y,
            w: item.w,
            h: item.h
          }
        })
      }
    })
  }, [editMode, widgets, updateWidget])

  if (widgets.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Seu dashboard está vazio
          </h3>
          <p className="text-gray-600 mb-4">
            Adicione widgets para começar a visualizar seus dados financeiros
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        backgroundColor: theme.background_color,
        borderRadius: theme.border_radius
      }}
    >
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={60}
        isDraggable={editMode}
        isResizable={editMode}
        onLayoutChange={handleLayoutChange}
        margin={[theme.grid_gap, theme.grid_gap]}
        containerPadding={[theme.grid_gap, theme.grid_gap]}
        useCSSTransforms={true}
        preventCollision={false}
        compactType="vertical"
      >
        {widgets.map(widget => (
          <div key={widget.id} className="widget-container">
            <WidgetFactory widget={widget} />
          </div>
        ))}
      </ResponsiveGridLayout>

      <style jsx>{`
        .widget-container {
          background: ${theme.card_background};
          border: 1px solid ${theme.border_color};
          border-radius: ${theme.border_radius}px;
          overflow: hidden;
        }

        .react-grid-item.react-grid-placeholder {
          background: ${theme.primary_color};
          opacity: 0.2;
          transition-duration: 100ms;
          z-index: 2;
          user-select: none;
          border-radius: ${theme.border_radius}px;
        }

        .react-grid-item > .react-resizable-handle {
          position: absolute;
          width: 20px;
          height: 20px;
          bottom: 0;
          right: 0;
          background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNiIgaGVpZ2h0PSI2IiB2aWV3Qm94PSIwIDAgNiA2IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZG90cyBmaWxsPSIjNjg3Mjc5IiBkPSJtMTUgMTJjMC0xLjY1Ni0uMzQ0LTMuMjY5LS45MTYtNC42Q2wuOTk2IDQuOTk2QTcuOTYzIDcuOTYzIDAgMDAyIDEwSDJhOCA4IDAgMCAwIDggOGgtMlpNNCAxMS4xOXYtLjM4YzAtMC41NTItLjQ0OC0xLTEtMXMtMSAuNDQ4LTEgMXYuMzhjMCAuNTUyLjQ0OCAxIDEgMXMxLS40NDggMS0xWiIvPgo8L3N2Zz4=');
          background-position: bottom right;
          padding: 0 3px 3px 0;
          background-repeat: no-repeat;
          background-origin: content-box;
          box-sizing: border-box;
          cursor: se-resize;
        }
      `}</style>
    </div>
  )
}
```

### 6. Factory de Widgets
```tsx
// src/components/dashboard/WidgetFactory/WidgetFactory.tsx
'use client'

import { Widget as WidgetType } from '@/types/dashboard'
import { FinancialSummaryWidget } from '../widgets/FinancialSummaryWidget/FinancialSummaryWidget'
import { ExpenseChartWidget } from '../widgets/ExpenseChartWidget/ExpenseChartWidget'
import { BudgetProgressWidget } from '../widgets/BudgetProgressWidget/BudgetProgressWidget'
import { RecentTransactionsWidget } from '../widgets/RecentTransactionsWidget/RecentTransactionsWidget'
import { CategoryBreakdownWidget } from '../widgets/CategoryBreakdownWidget/CategoryBreakdownWidget'
// Import other widgets...

interface WidgetFactoryProps {
  widget: WidgetType
}

export function WidgetFactory({ widget }: WidgetFactoryProps) {
  switch (widget.type) {
    case 'financial_summary':
      return <FinancialSummaryWidget widget={widget} />

    case 'expense_chart':
      return <ExpenseChartWidget widget={widget} />

    case 'budget_progress':
      return <BudgetProgressWidget widget={widget} />

    case 'recent_transactions':
      return <RecentTransactionsWidget widget={widget} />

    case 'category_breakdown':
      return <CategoryBreakdownWidget widget={widget} />

    // Add other widget cases...

    default:
      return (
        <div className="p-4 text-center text-gray-500">
          <p>Widget tipo "{widget.type}" não encontrado</p>
        </div>
      )
  }
}
```

### 7. Página Principal do Dashboard
```tsx
// src/app/dashboard/page.tsx
'use client'

import { DashboardProvider } from '@/contexts/DashboardContext'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader/DashboardHeader'
import { DashboardGrid } from '@/components/dashboard/DashboardGrid/DashboardGrid'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar/DashboardSidebar'
import { GlobalFilters } from '@/components/dashboard/GlobalFilters/GlobalFilters'

export default function DashboardPage() {
  return (
    <DashboardProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[1920px] mx-auto">
          {/* Header */}
          <DashboardHeader />

          <div className="flex">
            {/* Sidebar */}
            <DashboardSidebar />

            {/* Main Content */}
            <div className="flex-1 p-6">
              {/* Global Filters */}
              <div className="mb-6">
                <GlobalFilters />
              </div>

              {/* Dashboard Grid */}
              <DashboardGrid />
            </div>
          </div>
        </div>
      </div>
    </DashboardProvider>
  )
}
```

### 8. Testes do Dashboard
```tsx
// src/components/dashboard/DashboardGrid/DashboardGrid.test.tsx
import { render, screen } from '@/utils/test-utils'
import { DashboardProvider } from '@/contexts/DashboardContext'
import { DashboardGrid } from './DashboardGrid'

const MockDashboard = ({ children }: { children: React.ReactNode }) => (
  <DashboardProvider>
    {children}
  </DashboardProvider>
)

describe('DashboardGrid', () => {
  it('renders empty state when no widgets', () => {
    render(
      <MockDashboard>
        <DashboardGrid />
      </MockDashboard>
    )

    expect(screen.getByText('Seu dashboard está vazio')).toBeInTheDocument()
    expect(screen.getByText('Adicione widgets para começar a visualizar seus dados financeiros')).toBeInTheDocument()
  })

  it('renders widgets when available', () => {
    // Mock context with widgets
    const mockWidgets = [
      {
        id: 'widget-1',
        type: 'financial_summary',
        title: 'Resumo Financeiro',
        position: { x: 0, y: 0, w: 6, h: 4 },
        size: { minW: 4, minH: 3 },
        config: {}
      }
    ]

    // This would require mocking the context or creating a test provider
    // with initial state containing widgets
  })

  it('enables drag and drop in edit mode', () => {
    // Test drag and drop functionality when editMode is true
  })

  it('saves layout changes', () => {
    // Test layout change handling
  })
})
```

## Critérios de Sucesso
- [ ] Sistema de grid customizável funcionando
- [ ] Widgets financeiros implementados
- [ ] Drag & drop funcionando perfeitamente
- [ ] Filtros globais aplicados automaticamente
- [ ] Personalização de tema implementada
- [ ] Salvamento de layouts funcionando
- [ ] Interface responsiva e acessível
- [ ] Performance otimizada para muitos widgets
- [ ] Exportação de dashboard
- [ ] Testes unitários com cobertura 85%+

## Performance e UX
- Lazy loading de widgets
- Virtualization para grids grandes
- Cache inteligente de dados
- Skeleton loaders
- Animações suaves
- Feedback visual em tempo real

## Recursos Necessários
- Desenvolvedor frontend React sênior
- Designer UX especializado em dashboards
- Tester para validação de usabilidade

## Tempo Estimado
- Sistema de grid e context: 8-10 horas
- Componentes de widgets: 12-15 horas
- Drag & drop e layout: 8-10 horas
- Sistema de filtros globais: 6-8 horas
- Personalização e temas: 6-8 horas
- Dashboard responsivo: 6-8 horas
- Testes e otimização: 10-12 horas
- **Total**: 8-10 dias de trabalho