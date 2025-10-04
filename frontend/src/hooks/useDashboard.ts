import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { API_BASE_URL } from '@/lib/constants'

interface DashboardPeriod {
  start: Date
  end: Date
}

interface DashboardData {
  summary: {
    current_month: {
      income: number
      expenses: number
      balance: number
      transactions_count: number
    }
    previous_month: {
      income: number
      expenses: number
      balance: number
    }
    variation: {
      percentage: number
      trend: 'up' | 'down' | 'stable'
      amount: number
    }
  }
  current_balance: {
    raw: number
    formatted: string
  }
  recent_transactions: Array<{
    id: string
    description: string
    amount: number
    transaction_type: 'income' | 'expense' | 'transfer'
    date: string
    category?: {
      id: string
      name: string
      color: string
      icon?: string
    }
    account?: {
      id: string
      name: string
    }
  }>
  top_categories: Array<{
    category_id: string
    category_name: string
    color: string
    icon?: string
    amount: number
    percentage: number
    formatted_amount: string
  }>
  monthly_evolution: Array<{
    month: string
    month_name: string
    income: number
    expenses: number
    balance: number
    formatted_income: string
    formatted_expenses: string
    formatted_balance: string
  }>
  budget_status: Array<{
    budget_id: string
    category: {
      id: string
      name: string
      color: string
      icon?: string
    }
    limit: number
    spent: number
    remaining: number
    percentage_used: number
    status: 'safe' | 'warning' | 'danger' | 'exceeded'
    formatted_limit: string
    formatted_spent: string
    formatted_remaining: string
  }>
  goals_progress: Array<{
    goal_id: string
    title: string
    target_amount: number
    current_amount: number
    progress_percentage: number
    days_remaining: number | null
    target_date: string | null
  }>
  last_updated: string
}

export function useDashboard(period?: DashboardPeriod) {
  return useQuery<DashboardData>({
    queryKey: ['dashboard', period],
    queryFn: async () => {
      const token = localStorage.getItem('token')

      let url = `${API_BASE_URL}/dashboard`

      if (period) {
        const params = new URLSearchParams({
          start_date: format(period.start, 'yyyy-MM-dd'),
          end_date: format(period.end, 'yyyy-MM-dd')
        })
        url += `?${params.toString()}`
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar dados do dashboard')
      }

      const result = await response.json()
      return result.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5 // Auto-refresh every 5 minutes
  })
}
