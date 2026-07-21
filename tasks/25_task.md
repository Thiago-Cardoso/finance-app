---
status: pending
parallelizable: false
blocked_by: ["2.0", "17.0", "20.0"]
---

<task_context>
<domain>backend/advanced_features</domain>
<type>implementation</type>
<scope>core_feature</scope>
<complexity>high</complexity>
<dependencies>backend_setup, budgets, notifications</dependencies>
<unblocks>"26.0", "30.0"</unblocks>
</task_context>

# Tarefa 25.0: Sistema de Metas Financeiras (Backend)

## Visão Geral
Implementar sistema completo de metas financeiras no backend Rails, incluindo diferentes tipos de metas (poupança, quitação de dívidas, investimentos), acompanhamento automático de progresso, sistema de recompensas e gamificação.

## Requisitos
- CRUD completo de metas financeiras
- Diferentes tipos de metas (poupança, dívida, investimento, gastos)
- Acompanhamento automático de progresso
- Sistema de milestones e recompensas
- Gamificação com pontos e badges
- Notificações de progresso automáticas
- Metas compartilhadas e colaborativas
- Histórico e análise de performance
- API para dashboard de metas
- Integração com orçamentos e transações

## Subtarefas
- [ ] 25.1 Modelo Goal e relacionamentos
- [ ] 25.2 Sistema de tipos de metas
- [ ] 25.3 Acompanhamento automático de progresso
- [ ] 25.4 Sistema de milestones e recompensas
- [ ] 25.5 Gamificação com pontos e badges
- [ ] 25.6 Notificações de progresso
- [ ] 25.7 Metas colaborativas
- [ ] 25.8 API endpoints e controllers
- [ ] 25.9 Services de análise e relatórios
- [ ] 25.10 Testes unitários e de integração

## Sequenciamento
- Bloqueado por: 2.0 (Backend Setup), 17.0 (Orçamentos), 20.0 (Notificações)
- Desbloqueia: 26.0 (Performance), 30.0 (Deploy Produção)
- Paralelizável: Não (depende de orçamentos e notificações)

## Detalhes de Implementação

### 1. Modelo Goal
```ruby
# app/models/goal.rb
class Goal < ApplicationRecord
  belongs_to :user
  belongs_to :category, optional: true
  has_many :goal_milestones, dependent: :destroy
  has_many :goal_contributions, dependent: :destroy
  has_many :goal_activities, dependent: :destroy
  has_many :shared_goals, dependent: :destroy
  has_many :collaborators, through: :shared_goals, source: :user

  validates :name, presence: true, length: { minimum: 2, maximum: 100 }
  validates :target_amount, presence: true, numericality: { greater_than: 0 }
  validates :goal_type, presence: true, inclusion: { in: %w[savings debt_payoff investment expense_reduction general] }
  validates :target_date, presence: true
  validates :status, presence: true, inclusion: { in: %w[active paused completed failed cancelled] }
  validate :target_date_in_future, on: :create
  validate :current_amount_not_greater_than_target

  enum status: { active: 0, paused: 1, completed: 2, failed: 3, cancelled: 4 }
  enum goal_type: { savings: 0, debt_payoff: 1, investment: 2, expense_reduction: 3, general: 4 }
  enum priority: { low: 0, medium: 1, high: 2, urgent: 3 }

  scope :active, -> { where(status: :active) }
  scope :by_type, ->(type) { where(goal_type: type) }
  scope :by_priority, ->(priority) { where(priority: priority) }
  scope :deadline_approaching, -> { where('target_date <= ?', 30.days.from_now) }
  scope :overdue, -> { where('target_date < ? AND status = ?', Date.current, 'active') }

  before_create :set_default_values
  after_create :create_initial_milestones
  after_update :check_completion_status
  after_update :update_milestones_if_needed

  def progress_percentage
    return 0 if target_amount == 0
    [(current_amount / target_amount * 100).round(2), 100].min
  end

  def remaining_amount
    [target_amount - current_amount, 0].max
  end

  def days_remaining
    return 0 if target_date < Date.current
    (target_date - Date.current).to_i
  end

  def is_overdue?
    target_date < Date.current && active?
  end

  def completion_rate
    return 0 if days_since_start == 0
    progress_percentage / 100.0
  end

  def days_since_start
    (Date.current - created_at.to_date).to_i
  end

  def expected_progress_percentage
    return 100 if days_remaining <= 0
    total_days = (target_date - created_at.to_date).to_i
    elapsed_days = days_since_start
    return 100 if total_days <= 0
    [(elapsed_days.to_f / total_days * 100).round(2), 100].min
  end

  def is_on_track?
    progress_percentage >= expected_progress_percentage
  end

  def monthly_target
    return 0 if months_remaining <= 0
    remaining_amount / months_remaining
  end

  def months_remaining
    return 0 if target_date < Date.current
    ((target_date.year - Date.current.year) * 12 + target_date.month - Date.current.month).to_f
  end

  def next_milestone
    goal_milestones.pending.order(:target_percentage).first
  end

  def completed_milestones_count
    goal_milestones.completed.count
  end

  def total_milestones_count
    goal_milestones.count
  end

  def add_contribution(amount, description = nil, transaction_id = nil)
    contribution = goal_contributions.create!(
      amount: amount,
      description: description,
      transaction_id: transaction_id,
      contributed_at: Time.current
    )

    update_current_amount!
    check_milestones_completion
    contribution
  end

  def update_current_amount!
    new_amount = calculate_current_amount
    update!(current_amount: new_amount)
  end

  def can_be_shared?
    active? && !shared_goals.exists?
  end

  def share_with_users(user_ids, permissions = {})
    return false unless can_be_shared?

    user_ids.each do |user_id|
      shared_goals.create!(
        user_id: user_id,
        can_contribute: permissions[:can_contribute] || false,
        can_edit: permissions[:can_edit] || false,
        can_view_details: permissions[:can_view_details] || true
      )
    end

    true
  end

  def calculate_points_earned
    base_points = (progress_percentage * 10).to_i
    bonus_points = 0

    # Bonus for completing on time
    bonus_points += 100 if completed? && !is_overdue?

    # Bonus for high priority goals
    bonus_points += 50 if urgent?
    bonus_points += 25 if high?

    # Bonus for large amounts
    bonus_points += 50 if target_amount >= 10000
    bonus_points += 25 if target_amount >= 5000

    base_points + bonus_points
  end

  private

  def target_date_in_future
    return unless target_date.present?

    if target_date <= Date.current
      errors.add(:target_date, 'deve ser uma data futura')
    end
  end

  def current_amount_not_greater_than_target
    return unless current_amount.present? && target_amount.present?

    if current_amount > target_amount
      errors.add(:current_amount, 'não pode ser maior que o valor alvo')
    end
  end

  def set_default_values
    self.current_amount ||= 0
    self.status ||= :active
    self.priority ||= :medium
  end

  def create_initial_milestones
    GoalMilestoneCreatorService.new(self).call
  end

  def check_completion_status
    if current_amount >= target_amount && !completed?
      complete_goal!
    elsif current_amount < target_amount && completed?
      reactivate_goal!
    end
  end

  def complete_goal!
    update!(status: :completed, completed_at: Time.current)
    create_completion_activity
    send_completion_notification
    award_completion_points
  end

  def reactivate_goal!
    update!(status: :active, completed_at: nil)
  end

  def update_milestones_if_needed
    if saved_change_to_target_amount? || saved_change_to_target_date?
      goal_milestones.destroy_all
      create_initial_milestones
    end
  end

  def calculate_current_amount
    case goal_type
    when 'savings'
      goal_contributions.sum(:amount)
    when 'debt_payoff'
      goal_contributions.sum(:amount)
    when 'investment'
      goal_contributions.sum(:amount)
    when 'expense_reduction'
      # Calculate based on budget savings
      calculate_expense_reduction_progress
    else
      goal_contributions.sum(:amount)
    end
  end

  def calculate_expense_reduction_progress
    return 0 unless category_id.present?

    # Compare current period expenses with baseline
    baseline_amount = self.baseline_amount || 0
    current_period_expenses = user.transactions
                                 .expense
                                 .where(category_id: category_id)
                                 .where(date: Date.current.beginning_of_month..Date.current.end_of_month)
                                 .sum(:amount)

    saved_amount = [baseline_amount - current_period_expenses, 0].max
    [saved_amount, target_amount].min
  end

  def check_milestones_completion
    goal_milestones.pending.each do |milestone|
      if progress_percentage >= milestone.target_percentage
        milestone.complete!
      end
    end
  end

  def create_completion_activity
    goal_activities.create!(
      activity_type: 'goal_completed',
      description: "Meta '#{name}' foi concluída!",
      metadata: {
        target_amount: target_amount,
        final_amount: current_amount,
        days_taken: days_since_start,
        points_earned: calculate_points_earned
      }
    )
  end

  def send_completion_notification
    NotificationService.send_goal_completion(self)
  end

  def award_completion_points
    points = calculate_points_earned
    user.add_points(points, "Conclusão da meta: #{name}")
  end
end
```

### 2. Modelo Goal Milestone
```ruby
# app/models/goal_milestone.rb
class GoalMilestone < ApplicationRecord
  belongs_to :goal

  validates :name, presence: true, length: { maximum: 100 }
  validates :target_percentage, presence: true, numericality: { in: 0..100 }
  validates :reward_points, presence: true, numericality: { greater_than_or_equal_to: 0 }

  enum status: { pending: 0, completed: 1, skipped: 2 }

  scope :pending, -> { where(status: :pending) }
  scope :completed, -> { where(status: :completed) }
  scope :ordered, -> { order(:target_percentage) }

  def target_amount
    (goal.target_amount * target_percentage / 100).round(2)
  end

  def is_achieved?
    goal.progress_percentage >= target_percentage
  end

  def complete!
    return false if completed?

    transaction do
      update!(status: :completed, completed_at: Time.current)
      create_completion_activity
      award_milestone_points
      send_milestone_notification
    end

    true
  end

  def skip!
    update!(status: :skipped, completed_at: Time.current)
  end

  private

  def create_completion_activity
    goal.goal_activities.create!(
      activity_type: 'milestone_completed',
      description: "Marco '#{name}' alcançado!",
      metadata: {
        milestone_percentage: target_percentage,
        current_amount: goal.current_amount,
        points_earned: reward_points
      }
    )
  end

  def award_milestone_points
    goal.user.add_points(reward_points, "Marco alcançado: #{name}")
  end

  def send_milestone_notification
    NotificationService.send_milestone_achievement(self)
  end
end
```

### 3. Modelo Goal Contribution
```ruby
# app/models/goal_contribution.rb
class GoalContribution < ApplicationRecord
  belongs_to :goal
  belongs_to :transaction, optional: true
  belongs_to :contributor, class_name: 'User', foreign_key: 'contributor_id', optional: true

  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :contributed_at, presence: true

  scope :recent, -> { order(contributed_at: :desc) }
  scope :by_contributor, ->(user) { where(contributor: user) }

  after_create :update_goal_progress
  after_create :create_activity
  after_destroy :update_goal_progress

  def contributor_name
    contributor&.full_name || goal.user.full_name
  end

  def is_from_transaction?
    transaction_id.present?
  end

  private

  def update_goal_progress
    goal.update_current_amount!
  end

  def create_activity
    goal.goal_activities.create!(
      activity_type: 'contribution_added',
      description: "Contribuição de #{ActionController::Base.helpers.number_to_currency(amount)} adicionada",
      metadata: {
        amount: amount,
        contributor_id: contributor_id,
        transaction_id: transaction_id,
        description: description
      }
    )
  end
end
```

### 4. Service para Criação de Milestones
```ruby
# app/services/goal_milestone_creator_service.rb
class GoalMilestoneCreatorService
  include ActiveModel::Model

  attr_accessor :goal

  DEFAULT_MILESTONES = [
    { percentage: 10, name: 'Primeiros Passos', points: 50 },
    { percentage: 25, name: 'Um Quarto do Caminho', points: 100 },
    { percentage: 50, name: 'Meio Caminho Andado', points: 200 },
    { percentage: 75, name: 'Quase Lá!', points: 300 },
    { percentage: 90, name: 'Reta Final', points: 400 },
    { percentage: 100, name: 'Meta Alcançada!', points: 500 }
  ].freeze

  def call
    create_default_milestones
    create_custom_milestones if goal.target_amount >= 1000
  end

  private

  def create_default_milestones
    DEFAULT_MILESTONES.each do |milestone_data|
      goal.goal_milestones.create!(
        name: milestone_data[:name],
        target_percentage: milestone_data[:percentage],
        reward_points: calculate_milestone_points(milestone_data[:points]),
        description: generate_milestone_description(milestone_data[:percentage])
      )
    end
  end

  def create_custom_milestones
    # Create additional milestones for high-value goals
    if goal.target_amount >= 10000
      [20, 40, 60, 80].each do |percentage|
        next if goal.goal_milestones.exists?(target_percentage: percentage)

        goal.goal_milestones.create!(
          name: "#{percentage}% Concluído",
          target_percentage: percentage,
          reward_points: calculate_milestone_points(percentage * 2),
          description: "Você alcançou #{percentage}% da sua meta!"
        )
      end
    end
  end

  def calculate_milestone_points(base_points)
    multiplier = case goal.priority
                when 'urgent' then 2.0
                when 'high' then 1.5
                when 'medium' then 1.0
                else 0.8
                end

    (base_points * multiplier).to_i
  end

  def generate_milestone_description(percentage)
    case percentage
    when 10
      'Parabéns! Você deu o primeiro passo importante em direção à sua meta.'
    when 25
      'Excelente progresso! Um quarto da jornada já foi completado.'
    when 50
      'Impressionante! Você já está na metade do caminho.'
    when 75
      'Fantástico! Falta pouco para alcançar sua meta.'
    when 90
      'Quase lá! Você está muito próximo do seu objetivo.'
    when 100
      'Parabéns! Meta concluída com sucesso!'
    else
      "Parabéns por alcançar #{percentage}% da sua meta!"
    end
  end
end
```

### 5. Service para Acompanhamento de Progresso
```ruby
# app/services/goal_progress_tracker_service.rb
class GoalProgressTrackerService
  include ActiveModel::Model

  def self.update_all_goals
    Goal.active.find_each do |goal|
      new(goal: goal).update_progress
    end
  end

  attr_accessor :goal

  def update_progress
    case goal.goal_type
    when 'savings'
      update_savings_progress
    when 'debt_payoff'
      update_debt_progress
    when 'investment'
      update_investment_progress
    when 'expense_reduction'
      update_expense_reduction_progress
    end

    check_milestone_achievements
    send_progress_notifications if should_send_notification?
  end

  private

  def update_savings_progress
    # Automatically track savings based on categorized transactions
    if goal.category_id.present?
      savings_transactions = goal.user.transactions
                                 .income
                                 .where(category_id: goal.category_id)
                                 .where('created_at >= ?', goal.created_at)

      savings_transactions.find_each do |transaction|
        next if goal.goal_contributions.exists?(transaction_id: transaction.id)

        goal.add_contribution(
          transaction.amount,
          "Economia automática: #{transaction.description}",
          transaction.id
        )
      end
    end
  end

  def update_debt_progress
    # Track debt payments based on categorized transactions
    if goal.category_id.present?
      debt_payments = goal.user.transactions
                         .expense
                         .where(category_id: goal.category_id)
                         .where('created_at >= ?', goal.created_at)

      debt_payments.find_each do |transaction|
        next if goal.goal_contributions.exists?(transaction_id: transaction.id)

        goal.add_contribution(
          transaction.amount,
          "Pagamento de dívida: #{transaction.description}",
          transaction.id
        )
      end
    end
  end

  def update_investment_progress
    # Track investment contributions
    if goal.category_id.present?
      investment_transactions = goal.user.transactions
                                   .expense
                                   .where(category_id: goal.category_id)
                                   .where('created_at >= ?', goal.created_at)

      investment_transactions.find_each do |transaction|
        next if goal.goal_contributions.exists?(transaction_id: transaction.id)

        goal.add_contribution(
          transaction.amount,
          "Investimento: #{transaction.description}",
          transaction.id
        )
      end
    end
  end

  def update_expense_reduction_progress
    # Calculate expense reduction based on budget comparisons
    return unless goal.category_id.present? && goal.baseline_amount.present?

    current_month_expenses = goal.user.transactions
                                .expense
                                .where(category_id: goal.category_id)
                                .where(date: Date.current.beginning_of_month..Date.current.end_of_month)
                                .sum(:amount)

    monthly_baseline = goal.baseline_amount / 12.0
    savings_this_month = [monthly_baseline - current_month_expenses, 0].max

    if savings_this_month > 0
      # Check if we already recorded savings for this month
      existing_contribution = goal.goal_contributions
                                 .where(contributed_at: Date.current.beginning_of_month..Date.current.end_of_month)
                                 .where("description LIKE ?", "Economia mensal%")
                                 .first

      if existing_contribution
        # Update existing contribution
        existing_contribution.update!(amount: savings_this_month)
      else
        # Create new contribution
        goal.add_contribution(
          savings_this_month,
          "Economia mensal em #{goal.category.name}"
        )
      end
    end
  end

  def check_milestone_achievements
    goal.goal_milestones.pending.each do |milestone|
      if goal.progress_percentage >= milestone.target_percentage
        milestone.complete!
      end
    end
  end

  def should_send_notification?
    # Send notifications for significant progress milestones
    last_notification_progress = goal.last_notification_progress || 0
    current_progress = goal.progress_percentage

    # Send notification every 10% progress
    (current_progress / 10).to_i > (last_notification_progress / 10).to_i
  end

  def send_progress_notifications
    NotificationService.send_goal_progress_update(goal)
    goal.update!(last_notification_progress: goal.progress_percentage)
  end
end
```

### 6. Sistema de Gamificação
```ruby
# app/models/user_achievement.rb
class UserAchievement < ApplicationRecord
  belongs_to :user

  validates :badge_type, presence: true
  validates :title, presence: true
  validates :description, presence: true
  validates :points_earned, presence: true, numericality: { greater_than_or_equal_to: 0 }

  enum badge_type: {
    goal_master: 0,
    savings_champion: 1,
    debt_destroyer: 2,
    investment_guru: 3,
    budget_wizard: 4,
    milestone_crusher: 5,
    consistency_king: 6,
    early_achiever: 7
  }

  scope :recent, -> { order(earned_at: :desc) }
  scope :by_type, ->(type) { where(badge_type: type) }

  def icon
    case badge_type
    when 'goal_master'
      '🏆'
    when 'savings_champion'
      '💰'
    when 'debt_destroyer'
      '⚔️'
    when 'investment_guru'
      '📈'
    when 'budget_wizard'
      '🧙‍♂️'
    when 'milestone_crusher'
      '🎯'
    when 'consistency_king'
      '👑'
    when 'early_achiever'
      '⚡'
    else
      '🏅'
    end
  end
end

# app/services/gamification_service.rb
class GamificationService
  include ActiveModel::Model

  attr_accessor :user

  def check_achievements
    check_goal_achievements
    check_savings_achievements
    check_consistency_achievements
    check_milestone_achievements
  end

  def award_badge(badge_type, title, description, points)
    return if user.user_achievements.exists?(badge_type: badge_type)

    achievement = user.user_achievements.create!(
      badge_type: badge_type,
      title: title,
      description: description,
      points_earned: points,
      earned_at: Time.current
    )

    user.add_points(points, "Badge conquistado: #{title}")
    NotificationService.send_achievement_notification(achievement)

    achievement
  end

  private

  def check_goal_achievements
    completed_goals_count = user.goals.completed.count

    case completed_goals_count
    when 1
      award_badge('goal_master', 'Primeira Meta', 'Concluiu sua primeira meta financeira!', 100)
    when 5
      award_badge('goal_master', 'Mestre das Metas', 'Concluiu 5 metas financeiras!', 500)
    when 10
      award_badge('goal_master', 'Lenda das Metas', 'Concluiu 10 metas financeiras!', 1000)
    end
  end

  def check_savings_achievements
    total_saved = user.goals.savings.completed.sum(:target_amount)

    case
    when total_saved >= 1000
      award_badge('savings_champion', 'Primeiro Mil', 'Economizou R$ 1.000!', 200)
    when total_saved >= 10000
      award_badge('savings_champion', 'Dez Mil Club', 'Economizou R$ 10.000!', 1000)
    when total_saved >= 100000
      award_badge('savings_champion', 'Cem Mil Master', 'Economizou R$ 100.000!', 5000)
    end
  end

  def check_consistency_achievements
    # Check for consistent goal progress
    active_goals = user.goals.active
    consistent_goals = active_goals.select { |goal| goal.is_on_track? }

    if consistent_goals.count >= 3 && consistent_goals.count == active_goals.count
      award_badge('consistency_king', 'Rei da Consistência', 'Mantém todas as metas em dia!', 300)
    end
  end

  def check_milestone_achievements
    completed_milestones = user.goals.joins(:goal_milestones)
                              .where(goal_milestones: { status: 'completed' })
                              .count

    case completed_milestones
    when 10
      award_badge('milestone_crusher', 'Destruidor de Marcos', 'Alcançou 10 marcos!', 250)
    when 50
      award_badge('milestone_crusher', 'Mestre dos Marcos', 'Alcançou 50 marcos!', 1000)
    end
  end
end
```

### 7. Controller de Goals
```ruby
# app/controllers/api/v1/goals_controller.rb
class Api::V1::GoalsController < Api::V1::BaseController
  before_action :authenticate_user!
  before_action :set_goal, only: [:show, :update, :destroy, :add_contribution]

  # GET /api/v1/goals
  def index
    goals = current_user.goals
                       .includes(:category, :goal_milestones, :goal_contributions)
                       .order(created_at: :desc)

    goals = filter_goals(goals) if filter_params.any?

    render json: {
      success: true,
      data: ActiveModelSerializers::SerializableResource.new(
        goals,
        each_serializer: GoalSerializer
      ),
      meta: build_index_meta(goals)
    }
  end

  # GET /api/v1/goals/:id
  def show
    render json: {
      success: true,
      data: GoalSerializer.new(@goal, include_details: true)
    }
  end

  # POST /api/v1/goals
  def create
    goal = current_user.goals.build(goal_params)

    if goal.save
      render json: {
        success: true,
        data: GoalSerializer.new(goal),
        message: 'Meta criada com sucesso'
      }, status: :created
    else
      render json: {
        success: false,
        message: 'Erro ao criar meta',
        errors: goal.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/v1/goals/:id
  def update
    if @goal.update(goal_params)
      render json: {
        success: true,
        data: GoalSerializer.new(@goal),
        message: 'Meta atualizada com sucesso'
      }
    else
      render json: {
        success: false,
        message: 'Erro ao atualizar meta',
        errors: @goal.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/goals/:id
  def destroy
    @goal.destroy
    render json: {
      success: true,
      message: 'Meta excluída com sucesso'
    }
  end

  # POST /api/v1/goals/:id/contributions
  def add_contribution
    contribution = @goal.add_contribution(
      contribution_params[:amount],
      contribution_params[:description]
    )

    if contribution.persisted?
      render json: {
        success: true,
        data: GoalContributionSerializer.new(contribution),
        message: 'Contribuição adicionada com sucesso'
      }
    else
      render json: {
        success: false,
        message: 'Erro ao adicionar contribuição',
        errors: contribution.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  # GET /api/v1/goals/dashboard
  def dashboard
    service = GoalDashboardService.new(current_user)
    result = service.call

    render json: {
      success: true,
      data: result
    }
  end

  # GET /api/v1/goals/achievements
  def achievements
    achievements = current_user.user_achievements
                              .recent
                              .limit(params[:limit] || 20)

    render json: {
      success: true,
      data: ActiveModelSerializers::SerializableResource.new(
        achievements,
        each_serializer: UserAchievementSerializer
      )
    }
  end

  private

  def set_goal
    @goal = current_user.goals.find(params[:id])
  end

  def goal_params
    params.require(:goal).permit(
      :name, :description, :target_amount, :target_date, :goal_type,
      :priority, :category_id, :baseline_amount, :auto_track_progress
    )
  end

  def contribution_params
    params.require(:contribution).permit(:amount, :description)
  end

  def filter_params
    params.permit(:status, :goal_type, :priority, :category_id)
  end

  def filter_goals(goals)
    goals = goals.where(status: filter_params[:status]) if filter_params[:status].present?
    goals = goals.where(goal_type: filter_params[:goal_type]) if filter_params[:goal_type].present?
    goals = goals.where(priority: filter_params[:priority]) if filter_params[:priority].present?
    goals = goals.where(category_id: filter_params[:category_id]) if filter_params[:category_id].present?
    goals
  end

  def build_index_meta(goals)
    {
      total_count: goals.count,
      active_count: goals.active.count,
      completed_count: goals.completed.count,
      total_target_amount: goals.active.sum(:target_amount),
      total_current_amount: goals.active.sum(:current_amount)
    }
  end
end
```

### 8. Testes RSpec
```ruby
# spec/models/goal_spec.rb
require 'rails_helper'

RSpec.describe Goal, type: :model do
  let(:user) { create(:user) }
  let(:category) { create(:category, user: user) }

  describe 'validations' do
    subject { build(:goal, user: user) }

    it { should validate_presence_of(:name) }
    it { should validate_presence_of(:target_amount) }
    it { should validate_presence_of(:goal_type) }
    it { should validate_presence_of(:target_date) }

    it 'validates target_amount is positive' do
      goal = build(:goal, user: user, target_amount: -100)
      expect(goal).not_to be_valid
      expect(goal.errors[:target_amount]).to include('must be greater than 0')
    end

    it 'validates target_date is in the future' do
      goal = build(:goal, user: user, target_date: 1.day.ago)
      expect(goal).not_to be_valid
      expect(goal.errors[:target_date]).to include('deve ser uma data futura')
    end
  end

  describe 'associations' do
    it { should belong_to(:user) }
    it { should belong_to(:category).optional }
    it { should have_many(:goal_milestones).dependent(:destroy) }
    it { should have_many(:goal_contributions).dependent(:destroy) }
  end

  describe '#progress_percentage' do
    let(:goal) { create(:goal, user: user, target_amount: 1000, current_amount: 250) }

    it 'calculates progress percentage correctly' do
      expect(goal.progress_percentage).to eq(25.0)
    end

    it 'caps progress at 100%' do
      goal.update!(current_amount: 1500)
      expect(goal.progress_percentage).to eq(100.0)
    end
  end

  describe '#remaining_amount' do
    let(:goal) { create(:goal, user: user, target_amount: 1000, current_amount: 250) }

    it 'calculates remaining amount correctly' do
      expect(goal.remaining_amount).to eq(750)
    end

    it 'returns 0 when goal is exceeded' do
      goal.update!(current_amount: 1500)
      expect(goal.remaining_amount).to eq(0)
    end
  end

  describe '#is_overdue?' do
    it 'returns true for overdue active goals' do
      goal = create(:goal, user: user, target_date: 1.day.ago, status: :active)
      expect(goal.is_overdue?).to be true
    end

    it 'returns false for future goals' do
      goal = create(:goal, user: user, target_date: 1.month.from_now, status: :active)
      expect(goal.is_overdue?).to be false
    end

    it 'returns false for completed goals' do
      goal = create(:goal, user: user, target_date: 1.day.ago, status: :completed)
      expect(goal.is_overdue?).to be false
    end
  end

  describe '#add_contribution' do
    let(:goal) { create(:goal, user: user, target_amount: 1000, current_amount: 0) }

    it 'creates a contribution and updates current amount' do
      expect {
        goal.add_contribution(100, 'Test contribution')
      }.to change { goal.goal_contributions.count }.by(1)
                                                   .and change { goal.current_amount }.from(0).to(100)
    end

    it 'completes goal when target is reached' do
      goal.add_contribution(1000, 'Final contribution')

      goal.reload
      expect(goal.status).to eq('completed')
      expect(goal.completed_at).to be_present
    end
  end

  describe 'milestone creation' do
    it 'creates default milestones after creation' do
      goal = create(:goal, user: user)

      expect(goal.goal_milestones.count).to be > 0
      expect(goal.goal_milestones.pluck(:target_percentage)).to include(10, 25, 50, 75, 90, 100)
    end
  end

  describe '#is_on_track?' do
    let(:goal) do
      create(:goal,
        user: user,
        target_amount: 1000,
        current_amount: 250,
        target_date: 30.days.from_now,
        created_at: 30.days.ago
      )
    end

    it 'returns true when progress is on track' do
      # 25% progress in 50% of time = on track
      expect(goal.is_on_track?).to be true
    end

    it 'returns false when progress is behind' do
      goal.update!(current_amount: 100) # Only 10% progress in 50% of time
      expect(goal.is_on_track?).to be false
    end
  end
end
```

## Critérios de Sucesso
- [ ] Modelo Goal com validações robustas
- [ ] Sistema de tipos de metas funcionando
- [ ] Acompanhamento automático implementado
- [ ] Sistema de milestones e recompensas
- [ ] Gamificação com pontos e badges
- [ ] Notificações de progresso automáticas
- [ ] API completa de metas
- [ ] Performance otimizada
- [ ] Testes unitários com cobertura 95%+
- [ ] Documentação completa

## Gamificação e Engagement
- Sistema de pontos por conquistas
- Badges para diferentes tipos de metas
- Milestones com recompensas
- Notificações motivacionais
- Progresso visual atrativo

## Recursos Necessários
- Desenvolvedor backend Rails sênior
- Game designer para mecânicas de gamificação
- Tester para validação de regras de negócio

## Tempo Estimado
- Modelos e relacionamentos: 8-10 horas
- Sistema de tipos e acompanhamento: 10-12 horas
- Milestones e gamificação: 8-10 horas
- Notificações e progresso: 6-8 horas
- API e controllers: 8-10 horas
- Testes e otimização: 10-12 horas
- **Total**: 7-9 dias de trabalho