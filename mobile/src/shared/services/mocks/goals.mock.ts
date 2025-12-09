/**
 * Goals Mock Data
 *
 * Mock data for testing goals functionality without backend.
 */

import type { Goal, GoalsListResponse } from '@/shared/models/Goal.model';

/**
 * Mock goals data
 */
export const mockGoals: Goal[] = [
  {
    id: 1,
    name: 'Viagem de Férias',
    description: 'Economizar para viagem de férias em família para o Nordeste',
    target_amount: 5000,
    current_amount: 2500,
    target_date: '2025-12-31',
    user_id: 1,
    is_achieved: false,
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-11-20T14:30:00Z',
    goal_type: 'savings',
    priority: 'high',
    status: 'active',
    category_id: 1,
    baseline_amount: null,
    completed_at: null,
    auto_track_progress: false,
    progress_percentage: 50,
    remaining_amount: 2500,
    days_remaining: 41,
    'is_overdue?': false,
    'is_on_track?': true,
    monthly_target: 500,
    category: {
      id: 1,
      name: 'Lazer',
      color: '#F59E0B',
      icon: 'palm-tree',
    },
    goal_milestones: [
      {
        id: 1,
        name: '25% do caminho',
        target_percentage: 25,
        status: 'completed',
        completed_at: '2025-09-01T10:00:00Z',
        description: 'Primeiro marco alcançado!',
      },
      {
        id: 2,
        name: 'Metade da jornada',
        target_percentage: 50,
        status: 'completed',
        completed_at: '2025-11-20T14:30:00Z',
        description: 'Já temos metade do valor!',
      },
      {
        id: 3,
        name: 'Quase lá!',
        target_percentage: 75,
        status: 'pending',
        completed_at: null,
        description: 'Falta pouco!',
      },
      {
        id: 4,
        name: 'Meta concluída!',
        target_percentage: 100,
        status: 'pending',
        completed_at: null,
        description: 'Objetivo alcançado!',
      },
    ],
    goal_contributions: [
      {
        id: 1,
        amount: 1000,
        description: 'Salário de Janeiro',
        contributed_at: '2025-01-15T10:00:00Z',
      },
      {
        id: 2,
        amount: 500,
        description: 'Freelance',
        contributed_at: '2025-02-10T15:20:00Z',
      },
      {
        id: 3,
        amount: 1000,
        description: 'Bônus',
        contributed_at: '2025-11-20T14:30:00Z',
      },
    ],
    goal_activities: [
      {
        id: 1,
        activity_type: 'created',
        description: 'Meta criada',
        metadata: {},
        created_at: '2025-01-15T10:00:00Z',
      },
      {
        id: 2,
        activity_type: 'contribution_added',
        description: 'Contribuição de R$ 1.000,00 adicionada',
        metadata: { amount: 1000 },
        created_at: '2025-01-15T10:00:00Z',
      },
    ],
  },
  {
    id: 2,
    name: 'Quitar Cartão de Crédito',
    description: 'Pagar dívida do cartão de crédito',
    target_amount: 3000,
    current_amount: 1200,
    target_date: '2026-03-31',
    user_id: 1,
    is_achieved: false,
    created_at: '2025-10-01T09:00:00Z',
    updated_at: '2025-11-15T16:00:00Z',
    goal_type: 'debt_payoff',
    priority: 'urgent',
    status: 'active',
    category_id: null,
    baseline_amount: null,
    completed_at: null,
    auto_track_progress: false,
    progress_percentage: 40,
    remaining_amount: 1800,
    days_remaining: 131,
    'is_overdue?': false,
    'is_on_track?': false,
    monthly_target: 450,
    goal_milestones: [],
    goal_contributions: [
      {
        id: 3,
        amount: 600,
        description: 'Pagamento inicial',
        contributed_at: '2025-10-01T09:00:00Z',
      },
      {
        id: 4,
        amount: 600,
        description: 'Pagamento mensal',
        contributed_at: '2025-11-15T16:00:00Z',
      },
    ],
    goal_activities: [],
  },
  {
    id: 3,
    name: 'Fundo de Emergência',
    description: 'Criar reserva de emergência de 6 meses de despesas',
    target_amount: 15000,
    current_amount: 8500,
    target_date: '2026-06-30',
    user_id: 1,
    is_achieved: false,
    created_at: '2025-01-01T08:00:00Z',
    updated_at: '2025-11-25T12:00:00Z',
    goal_type: 'savings',
    priority: 'medium',
    status: 'active',
    category_id: null,
    baseline_amount: null,
    completed_at: null,
    auto_track_progress: true,
    progress_percentage: 56.67,
    remaining_amount: 6500,
    days_remaining: 217,
    'is_overdue?': false,
    'is_on_track?': true,
    monthly_target: 930,
    goal_milestones: [],
    goal_contributions: [],
    goal_activities: [],
  },
  {
    id: 4,
    name: 'Investir em Ações',
    description: 'Começar a investir na bolsa de valores',
    target_amount: 10000,
    current_amount: 10000,
    target_date: '2025-11-01',
    user_id: 1,
    is_achieved: true,
    created_at: '2025-08-01T10:00:00Z',
    updated_at: '2025-11-01T14:00:00Z',
    goal_type: 'investment',
    priority: 'medium',
    status: 'completed',
    category_id: 2,
    baseline_amount: null,
    completed_at: '2025-11-01T14:00:00Z',
    auto_track_progress: false,
    progress_percentage: 100,
    remaining_amount: 0,
    days_remaining: 0,
    'is_overdue?': false,
    'is_on_track?': true,
    monthly_target: 0,
    category: {
      id: 2,
      name: 'Investimentos',
      color: '#10B981',
      icon: 'trending-up',
    },
    goal_milestones: [],
    goal_contributions: [
      {
        id: 5,
        amount: 10000,
        description: 'Valor total investido',
        contributed_at: '2025-11-01T14:00:00Z',
      },
    ],
    goal_activities: [],
  },
  {
    id: 5,
    name: 'Reduzir Gastos com Delivery',
    description: 'Diminuir pedidos de comida por delivery em 50%',
    target_amount: 500,
    current_amount: 150,
    target_date: '2025-12-31',
    user_id: 1,
    is_achieved: false,
    created_at: '2025-11-01T10:00:00Z',
    updated_at: '2025-11-29T18:00:00Z',
    goal_type: 'expense_reduction',
    priority: 'low',
    status: 'paused',
    category_id: 3,
    baseline_amount: 1000,
    completed_at: null,
    auto_track_progress: true,
    progress_percentage: 30,
    remaining_amount: 350,
    days_remaining: 32,
    'is_overdue?': false,
    'is_on_track?': false,
    monthly_target: 350,
    category: {
      id: 3,
      name: 'Alimentação',
      color: '#EF4444',
      icon: 'utensils',
    },
    goal_milestones: [],
    goal_contributions: [],
    goal_activities: [],
  },
];

/**
 * Mock meta summary
 */
export const mockGoalsMeta = {
  total_count: 5,
  active_count: 3,
  completed_count: 1,
  total_target_amount: 33500,
  total_current_amount: 22350,
};

/**
 * Mock response for getGoals
 */
export const mockGoalsListResponse: GoalsListResponse = {
  success: true,
  data: mockGoals,
  meta: mockGoalsMeta,
};

/**
 * Generate a new mock contribution
 */
export function generateMockContribution(amount: number, description?: string) {
  return {
    id: Math.floor(Math.random() * 10000),
    amount,
    description: description || null,
    contributed_at: new Date().toISOString(),
    contributor_name: 'Mock User',
  };
}

/**
 * Generate a new mock goal
 */
export function generateMockGoal(data: Partial<Goal>): Goal {
  const now = new Date();
  const threeMonthsFromNow = new Date(now);
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

  return {
    id: Math.floor(Math.random() * 10000),
    name: data.name || 'Nova Meta',
    description: data.description || null,
    target_amount: data.target_amount || 1000,
    current_amount: data.current_amount || 0,
    target_date: data.target_date || threeMonthsFromNow.toISOString(),
    user_id: 1,
    is_achieved: false,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    goal_type: data.goal_type || 'savings',
    priority: data.priority || 'medium',
    status: 'active',
    category_id: data.category_id || null,
    baseline_amount: data.baseline_amount || null,
    completed_at: null,
    auto_track_progress: data.auto_track_progress || false,
    progress_percentage: 0,
    remaining_amount: data.target_amount || 1000,
    days_remaining: 90,
    'is_overdue?': false,
    'is_on_track?': true,
    monthly_target: ((data.target_amount || 1000) / 3),
    goal_milestones: [],
    goal_contributions: [],
    goal_activities: [],
  };
}
