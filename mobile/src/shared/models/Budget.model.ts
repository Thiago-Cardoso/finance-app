/**
 * Budget Model
 *
 * Interface para orçamentos mensais por categoria.
 */

/**
 * Status do orçamento baseado no uso
 */
export type BudgetStatus = 'on_track' | 'warning' | 'over_budget' | 'critical';

/**
 * Interface principal do orçamento
 */
export interface Budget {
  id: number;
  user_id: number;
  category_id: number;
  category_name: string;
  category_color?: string;
  category_icon?: string;

  // Valores
  limit_amount: number;
  spent_amount: number;
  remaining_amount: number;

  // Período
  period_start: string;
  period_end: string;
  period_type: 'monthly' | 'weekly' | 'yearly';

  // Progresso
  usage_percentage: number;
  status: BudgetStatus;

  // Alertas
  alert_threshold: number; // Padrão 80%
  is_alert_enabled: boolean;

  // Metadata
  created_at: string;
  updated_at: string;
}

/**
 * Dados do formulário de criação/edição de orçamento
 */
export interface BudgetFormData {
  category_id: number;
  limit_amount: number;
  period_start?: string;
  period_end?: string;
  period_type?: 'monthly' | 'weekly' | 'yearly';
  alert_threshold?: number;
  is_alert_enabled?: boolean;
}

/**
 * Filtros para listagem de orçamentos
 */
export interface BudgetFilters {
  period_start?: string;
  period_end?: string;
  category_id?: number;
  status?: BudgetStatus;
  include_expired?: boolean;
}

/**
 * Resposta da API para listagem de orçamentos
 */
export interface BudgetsResponse {
  success: boolean;
  data: Budget[];
  pagination?: {
    current_page: number;
    total_pages: number;
    total_count: number;
    per_page: number;
  };
}

/**
 * Resposta da API para um único orçamento
 */
export interface BudgetResponse {
  success: boolean;
  data: Budget;
  message?: string;
}

/**
 * Alerta de orçamento
 */
export interface BudgetAlert {
  id: number;
  budget_id: number;
  budget_name: string;
  category_name: string;
  category_color?: string;
  usage_percentage: number;
  threshold: number;
  type: 'warning' | 'exceeded';
  message: string;
  created_at: string;
  is_read: boolean;
}

/**
 * Resposta de alertas
 */
export interface BudgetAlertsResponse {
  success: boolean;
  data: BudgetAlert[];
}

/**
 * Resumo de orçamentos para o Dashboard
 */
export interface BudgetsSummary {
  total_budgets: number;
  total_limit: number;
  total_spent: number;
  total_remaining: number;
  average_usage: number;
  over_budget_count: number;
  warning_count: number;
  on_track_count: number;
}

/**
 * Helper para determinar o status baseado no percentual
 */
export function getBudgetStatus(percentage: number): BudgetStatus {
  if (percentage >= 100) return 'over_budget';
  if (percentage >= 90) return 'critical';
  if (percentage >= 70) return 'warning';
  return 'on_track';
}

/**
 * Helper para obter cor do status
 */
export function getBudgetStatusColor(status: BudgetStatus): string {
  switch (status) {
    case 'on_track':
      return '#10B981'; // Verde
    case 'warning':
      return '#F59E0B'; // Amarelo
    case 'critical':
      return '#EF4444'; // Vermelho
    case 'over_budget':
      return '#DC2626'; // Vermelho escuro
    default:
      return '#6B7280'; // Cinza
  }
}

/**
 * Helper para obter texto do status
 */
export function getBudgetStatusText(status: BudgetStatus): string {
  switch (status) {
    case 'on_track':
      return 'No limite';
    case 'warning':
      return 'Atenção';
    case 'critical':
      return 'Crítico';
    case 'over_budget':
      return 'Excedido';
    default:
      return 'Desconhecido';
  }
}
