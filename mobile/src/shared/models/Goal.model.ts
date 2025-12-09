/**
 * Goal Model
 *
 * Interface para metas financeiras (economia, investimento, pagamento de dívidas).
 */

/**
 * Tipos de meta financeira
 */
export type GoalType = 'savings' | 'debt_payoff' | 'investment' | 'expense_reduction' | 'general';

/**
 * Status da meta
 */
export type GoalStatus = 'active' | 'paused' | 'completed' | 'failed' | 'cancelled';

/**
 * Prioridade da meta
 */
export type GoalPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Status do milestone
 */
export type MilestoneStatus = 'pending' | 'completed' | 'skipped';

/**
 * Milestone (marco) de progresso da meta
 */
export interface GoalMilestone {
  id: number;
  name: string;
  target_percentage: number;
  reward_points?: number;
  status: MilestoneStatus;
  completed_at: string | null;
  description?: string;
}

/**
 * Contribuição manual para a meta
 */
export interface GoalContribution {
  id: number;
  amount: string | number;
  description: string | null;
  contributed_at: string;
  contributor_name?: string;
}

/**
 * Atividade relacionada à meta
 */
export interface GoalActivity {
  id: number;
  activity_type: string;
  description: string;
  metadata: Record<string, any>;
  created_at: string;
}

/**
 * Interface principal da meta financeira
 */
export interface Goal {
  id: number;
  name: string;
  description: string | null;
  target_amount: string | number;
  current_amount: string | number;
  target_date: string;
  user_id: number;
  is_achieved: boolean;
  created_at: string;
  updated_at: string;
  goal_type: GoalType;
  priority: GoalPriority;
  status: GoalStatus;
  category_id: number | null;
  baseline_amount: string | number | null;
  completed_at: string | null;
  auto_track_progress: boolean;

  // Campos computados (calculados pelo backend)
  progress_percentage: string | number;
  remaining_amount: string | number;
  days_remaining: number;
  'is_overdue?': boolean;
  'is_on_track?': boolean;
  monthly_target?: string | number;

  // Relações
  goal_milestones?: GoalMilestone[];
  goal_contributions?: GoalContribution[];
  goal_activities?: GoalActivity[];
  category?: {
    id: number;
    name: string;
    color: string;
    icon: string;
  };
}

/**
 * Resposta da API para listagem de metas
 */
export interface GoalsListResponse {
  success: boolean;
  data: Goal[];
  meta: {
    total_count: number;
    active_count: number;
    completed_count: number;
    total_target_amount: string | number;
    total_current_amount: string | number;
  };
}

/**
 * Dados para criação de meta
 */
export interface CreateGoalData {
  name: string;
  description?: string;
  target_amount: number;
  target_date: string;
  goal_type: GoalType;
  priority: GoalPriority;
  category_id?: number;
  baseline_amount?: number;
  auto_track_progress?: boolean;
}

/**
 * Dados para atualização de meta
 */
export interface UpdateGoalData extends Partial<CreateGoalData> {
  status?: GoalStatus;
  current_amount?: number;
}

/**
 * Dados para criar contribuição
 */
export interface CreateContributionData {
  amount: number;
  description?: string;
}

/**
 * Filtros para listagem de metas
 */
export interface GoalFilters {
  status?: GoalStatus;
  goal_type?: GoalType;
  priority?: GoalPriority;
  category_id?: number;
}

/**
 * Helper para obter texto do tipo de meta
 */
export function getGoalTypeText(type: GoalType): string {
  switch (type) {
    case 'savings':
      return 'Economia';
    case 'debt_payoff':
      return 'Pagamento de Dívida';
    case 'investment':
      return 'Investimento';
    case 'expense_reduction':
      return 'Redução de Despesas';
    case 'general':
      return 'Geral';
    default:
      return 'Desconhecido';
  }
}

/**
 * Helper para obter texto do status
 */
export function getGoalStatusText(status: GoalStatus): string {
  switch (status) {
    case 'active':
      return 'Ativa';
    case 'paused':
      return 'Pausada';
    case 'completed':
      return 'Concluída';
    case 'failed':
      return 'Não Alcançada';
    case 'cancelled':
      return 'Cancelada';
    default:
      return 'Desconhecido';
  }
}

/**
 * Helper para obter cor do status
 */
export function getGoalStatusColor(status: GoalStatus): string {
  switch (status) {
    case 'active':
      return '#10B981'; // Verde
    case 'paused':
      return '#F59E0B'; // Amarelo
    case 'completed':
      return '#3B82F6'; // Azul
    case 'failed':
      return '#EF4444'; // Vermelho
    case 'cancelled':
      return '#6B7280'; // Cinza
    default:
      return '#6B7280'; // Cinza
  }
}

/**
 * Helper para obter texto da prioridade
 */
export function getGoalPriorityText(priority: GoalPriority): string {
  switch (priority) {
    case 'low':
      return 'Baixa';
    case 'medium':
      return 'Média';
    case 'high':
      return 'Alta';
    case 'urgent':
      return 'Urgente';
    default:
      return 'Desconhecido';
  }
}

/**
 * Helper para obter cor da prioridade
 */
export function getGoalPriorityColor(priority: GoalPriority): string {
  switch (priority) {
    case 'low':
      return '#6B7280'; // Cinza
    case 'medium':
      return '#3B82F6'; // Azul
    case 'high':
      return '#F59E0B'; // Amarelo
    case 'urgent':
      return '#EF4444'; // Vermelho
    default:
      return '#6B7280'; // Cinza
  }
}

/**
 * Helper para determinar se a meta está no prazo
 */
export function isGoalOnTrack(goal: Goal): boolean {
  return goal['is_on_track?'] ?? false;
}

/**
 * Helper para determinar se a meta está atrasada
 */
export function isGoalOverdue(goal: Goal): boolean {
  return goal['is_overdue?'] ?? false;
}

/**
 * Helper para formatar progresso da meta
 */
export function formatGoalProgress(percentage: string | number): string {
  const numPercentage = typeof percentage === 'string' ? parseFloat(percentage) : percentage;
  return `${numPercentage.toFixed(2)}%`;
}
