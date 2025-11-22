---
status: pending
parallelizable: false
blocked_by: ["2.0", "11.0"]
---

<task_context>
<domain>backend/core_features</domain>
<type>implementation</type>
<scope>core_feature</scope>
<complexity>high</complexity>
<dependencies>backend_setup, categories</dependencies>
<unblocks>"22.0", "25.0"</unblocks>
</task_context>

# Tarefa 17.0: Sistema de Orçamentos (Backend)

## Visão Geral
Implementar sistema completo de orçamentos no backend Rails, incluindo criação, monitoramento, alertas automáticos e relatórios de performance, com suporte a orçamentos por categoria e período.

## Requisitos
- CRUD completo de orçamentos
- Orçamentos por categoria ou globais
- Períodos flexíveis (mensal, trimestral, anual)
- Monitoramento automático de gastos vs orçamento
- Alertas configuráveis por percentual de uso
- Histórico de performance dos orçamentos
- API para dashboard de orçamentos
- Relatórios comparativos e análises
- Suporte a múltiplas moedas (futuro)

## Subtarefas
- [ ] 17.1 Modelo Budget e relacionamentos
- [ ] 17.2 Sistema de períodos e recorrência
- [ ] 17.3 Monitoramento automático de gastos
- [ ] 17.4 Sistema de alertas configuráveis
- [ ] 17.5 Controller e API endpoints
- [ ] 17.6 Serializers e formatação de dados
- [ ] 17.7 Services para análise de performance
- [ ] 17.8 Jobs para processamento automático
- [ ] 17.9 Validações e regras de negócio
- [ ] 17.10 Testes unitários e de integração

## Sequenciamento
- Bloqueado por: 2.0 (Backend Setup), 11.0 (Sistema Categorias)
- Desbloqueia: 22.0 (Interface Orçamentos), 25.0 (Metas Financeiras)
- Paralelizável: Não (depende do sistema de categorias)

## Detalhes de Implementação

### 1. Modelo Budget
```ruby
# app/models/budget.rb
class Budget < ApplicationRecord
  belongs_to :user
  belongs_to :category, optional: true
  has_many :budget_alerts, dependent: :destroy
  has_many :budget_periods, dependent: :destroy

  validates :name, presence: true, length: { minimum: 2, maximum: 100 }
  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :period_type, presence: true, inclusion: { in: %w[monthly quarterly yearly custom] }
  validates :start_date, presence: true
  validates :end_date, presence: true
  validate :end_date_after_start_date
  validate :category_belongs_to_user

  enum status: { active: 0, paused: 1, completed: 2, cancelled: 3 }
  enum period_type: { monthly: 0, quarterly: 1, yearly: 2, custom: 3 }

  scope :active, -> { where(status: :active) }
  scope :for_category, ->(category) { where(category: category) }
  scope :global, -> { where(category_id: nil) }
  scope :current, -> { where('start_date <= ? AND end_date >= ?', Date.current, Date.current) }
  scope :in_period, ->(start_date, end_date) { where('start_date <= ? AND end_date >= ?', end_date, start_date) }

  before_validation :set_end_date_if_needed
  after_create :create_budget_periods
  after_update :update_budget_periods, if: :saved_change_to_period_type?

  def current_period
    budget_periods.current.first
  end

  def spent_amount(period = nil)
    target_period = period || current_period
    return 0 unless target_period

    transactions_scope = user.transactions
                            .where(transaction_type: :expense)
                            .where(date: target_period.start_date..target_period.end_date)

    if category_id.present?
      transactions_scope = transactions_scope.where(category_id: category_id)
    end

    transactions_scope.sum(:amount)
  end

  def remaining_amount(period = nil)
    amount - spent_amount(period)
  end

  def usage_percentage(period = nil)
    return 0 if amount == 0
    (spent_amount(period) / amount * 100).round(2)
  end

  def is_over_budget?(period = nil)
    spent_amount(period) > amount
  end

  def days_remaining(period = nil)
    target_period = period || current_period
    return 0 unless target_period

    (target_period.end_date - Date.current).to_i.clamp(0, Float::INFINITY)
  end

  def average_daily_spending(period = nil)
    target_period = period || current_period
    return 0 unless target_period

    days_passed = (Date.current - target_period.start_date).to_i + 1
    return 0 if days_passed <= 0

    spent_amount(period) / days_passed
  end

  def projected_total(period = nil)
    target_period = period || current_period
    return spent_amount(period) unless target_period

    days_total = (target_period.end_date - target_period.start_date).to_i + 1
    average_daily_spending(period) * days_total
  end

  def status_summary(period = nil)
    current_spent = spent_amount(period)
    current_usage = usage_percentage(period)

    if current_usage >= 100
      :over_budget
    elsif current_usage >= 90
      :critical
    elsif current_usage >= 75
      :warning
    elsif current_usage >= 50
      :moderate
    else
      :on_track
    end
  end

  private

  def end_date_after_start_date
    return unless start_date && end_date

    errors.add(:end_date, 'deve ser posterior à data de início') if end_date <= start_date
  end

  def category_belongs_to_user
    return unless category_id && user

    unless user.categories.exists?(id: category_id)
      errors.add(:category, 'deve pertencer ao usuário')
    end
  end

  def set_end_date_if_needed
    return if end_date.present? || start_date.blank?

    case period_type
    when 'monthly'
      self.end_date = start_date.end_of_month
    when 'quarterly'
      self.end_date = start_date.end_of_quarter
    when 'yearly'
      self.end_date = start_date.end_of_year
    end
  end

  def create_budget_periods
    BudgetPeriodCreatorService.new(self).call
  end

  def update_budget_periods
    budget_periods.destroy_all
    create_budget_periods
  end
end
```

### 2. Modelo Budget Period
```ruby
# app/models/budget_period.rb
class BudgetPeriod < ApplicationRecord
  belongs_to :budget

  validates :start_date, presence: true
  validates :end_date, presence: true
  validates :allocated_amount, presence: true, numericality: { greater_than: 0 }
  validate :end_date_after_start_date
  validate :no_overlap_with_other_periods

  scope :current, -> { where('start_date <= ? AND end_date >= ?', Date.current, Date.current) }
  scope :past, -> { where('end_date < ?', Date.current) }
  scope :future, -> { where('start_date > ?', Date.current) }
  scope :ordered, -> { order(:start_date) }

  def spent_amount
    budget.spent_amount(self)
  end

  def remaining_amount
    allocated_amount - spent_amount
  end

  def usage_percentage
    return 0 if allocated_amount == 0
    (spent_amount / allocated_amount * 100).round(2)
  end

  def is_current?
    Date.current.between?(start_date, end_date)
  end

  def is_completed?
    Date.current > end_date
  end

  def days_remaining
    return 0 unless is_current?
    (end_date - Date.current).to_i.clamp(0, Float::INFINITY)
  end

  def performance_score
    return 0 if allocated_amount == 0

    if spent_amount <= allocated_amount
      ((allocated_amount - spent_amount) / allocated_amount * 100).round(2)
    else
      -((spent_amount - allocated_amount) / allocated_amount * 100).round(2)
    end
  end

  private

  def end_date_after_start_date
    return unless start_date && end_date

    errors.add(:end_date, 'deve ser posterior à data de início') if end_date <= start_date
  end

  def no_overlap_with_other_periods
    return unless budget && start_date && end_date

    overlapping = budget.budget_periods
                        .where.not(id: id)
                        .where('start_date <= ? AND end_date >= ?', end_date, start_date)

    errors.add(:base, 'Período não pode sobrepor com outros períodos') if overlapping.exists?
  end
end
```

### 3. Modelo Budget Alert
```ruby
# app/models/budget_alert.rb
class BudgetAlert < ApplicationRecord
  belongs_to :budget
  belongs_to :budget_period, optional: true

  validates :alert_type, presence: true, inclusion: { in: %w[percentage absolute days_remaining] }
  validates :threshold_value, presence: true, numericality: { greater_than: 0 }
  validates :message, presence: true, length: { maximum: 500 }

  enum alert_type: { percentage: 0, absolute: 1, days_remaining: 2 }
  enum status: { pending: 0, sent: 1, dismissed: 2 }

  scope :active, -> { where(is_active: true) }
  scope :pending, -> { where(status: :pending) }

  def should_trigger?(current_period = nil)
    return false unless is_active? && pending?

    period = current_period || budget.current_period
    return false unless period

    case alert_type
    when 'percentage'
      budget.usage_percentage(period) >= threshold_value
    when 'absolute'
      budget.spent_amount(period) >= threshold_value
    when 'days_remaining'
      budget.days_remaining(period) <= threshold_value
    else
      false
    end
  end

  def trigger!
    update!(status: :sent, sent_at: Time.current)
    BudgetAlertNotificationJob.perform_later(self)
  end

  def formatted_threshold
    case alert_type
    when 'percentage'
      "#{threshold_value}%"
    when 'absolute'
      "R$ #{threshold_value}"
    when 'days_remaining'
      "#{threshold_value} dias"
    end
  end
end
```

### 4. Service para Criação de Períodos
```ruby
# app/services/budget_period_creator_service.rb
class BudgetPeriodCreatorService
  include ActiveModel::Model

  attr_accessor :budget

  def initialize(budget)
    @budget = budget
  end

  def call
    case budget.period_type
    when 'monthly'
      create_monthly_periods
    when 'quarterly'
      create_quarterly_periods
    when 'yearly'
      create_yearly_periods
    when 'custom'
      create_custom_period
    end
  end

  private

  def create_monthly_periods
    current_date = budget.start_date.beginning_of_month

    while current_date <= budget.end_date
      period_start = [current_date, budget.start_date].max
      period_end = [current_date.end_of_month, budget.end_date].min

      create_period(period_start, period_end)
      current_date = current_date.next_month.beginning_of_month
    end
  end

  def create_quarterly_periods
    current_date = budget.start_date.beginning_of_quarter

    while current_date <= budget.end_date
      period_start = [current_date, budget.start_date].max
      period_end = [current_date.end_of_quarter, budget.end_date].min

      create_period(period_start, period_end)
      current_date = (current_date + 3.months).beginning_of_quarter
    end
  end

  def create_yearly_periods
    current_date = budget.start_date.beginning_of_year

    while current_date <= budget.end_date
      period_start = [current_date, budget.start_date].max
      period_end = [current_date.end_of_year, budget.end_date].min

      create_period(period_start, period_end)
      current_date = current_date.next_year.beginning_of_year
    end
  end

  def create_custom_period
    create_period(budget.start_date, budget.end_date)
  end

  def create_period(start_date, end_date)
    days_in_total_budget = (budget.end_date - budget.start_date).to_i + 1
    days_in_period = (end_date - start_date).to_i + 1
    allocated_amount = (budget.amount * days_in_period / days_in_total_budget).round(2)

    budget.budget_periods.create!(
      start_date: start_date,
      end_date: end_date,
      allocated_amount: allocated_amount
    )
  end
end
```

### 5. Service para Monitoramento
```ruby
# app/services/budget_monitoring_service.rb
class BudgetMonitoringService
  include ActiveModel::Model

  def call
    check_all_budgets
    process_alerts
    update_budget_statistics
  end

  private

  def check_all_budgets
    Budget.active.current.find_each do |budget|
      check_budget_alerts(budget)
      update_budget_status(budget)
    end
  end

  def check_budget_alerts(budget)
    current_period = budget.current_period
    return unless current_period

    budget.budget_alerts.active.pending.each do |alert|
      alert.trigger! if alert.should_trigger?(current_period)
    end
  end

  def update_budget_status(budget)
    current_period = budget.current_period
    return unless current_period

    if budget.is_over_budget?(current_period)
      BudgetOverrunNotificationJob.perform_later(budget, current_period)
    end
  end

  def process_alerts
    # Process any pending alert notifications
    BudgetAlert.pending.where('created_at < ?', 1.hour.ago).find_each do |alert|
      alert.trigger! if alert.should_trigger?
    end
  end

  def update_budget_statistics
    # Update any cached statistics or analytics
    Rails.cache.delete_matched("budget_stats_*")
  end
end
```

### 6. Controller
```ruby
# app/controllers/api/v1/budgets_controller.rb
class Api::V1::BudgetsController < Api::V1::BaseController
  before_action :authenticate_user!
  before_action :set_budget, only: [:show, :update, :destroy]

  # GET /api/v1/budgets
  def index
    budgets = current_user.budgets
                         .includes(:category, :budget_periods, :budget_alerts)
                         .ordered

    budgets = filter_budgets(budgets) if filter_params.any?

    render json: {
      success: true,
      data: ActiveModelSerializers::SerializableResource.new(
        budgets,
        each_serializer: BudgetSerializer
      ),
      meta: build_index_meta(budgets)
    }
  end

  # GET /api/v1/budgets/:id
  def show
    render json: {
      success: true,
      data: BudgetSerializer.new(@budget, include_periods: true)
    }
  end

  # POST /api/v1/budgets
  def create
    budget = current_user.budgets.build(budget_params)

    if budget.save
      render json: {
        success: true,
        data: BudgetSerializer.new(budget),
        message: 'Orçamento criado com sucesso'
      }, status: :created
    else
      render json: {
        success: false,
        message: 'Erro ao criar orçamento',
        errors: budget.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/v1/budgets/:id
  def update
    if @budget.update(budget_params)
      render json: {
        success: true,
        data: BudgetSerializer.new(@budget),
        message: 'Orçamento atualizado com sucesso'
      }
    else
      render json: {
        success: false,
        message: 'Erro ao atualizar orçamento',
        errors: @budget.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/budgets/:id
  def destroy
    @budget.destroy
    render json: {
      success: true,
      message: 'Orçamento excluído com sucesso'
    }
  end

  # GET /api/v1/budgets/dashboard
  def dashboard
    service = BudgetDashboardService.new(current_user)
    result = service.call

    render json: {
      success: true,
      data: result
    }
  end

  # GET /api/v1/budgets/:id/performance
  def performance
    service = BudgetPerformanceService.new(@budget)
    result = service.call

    render json: {
      success: true,
      data: result
    }
  end

  # POST /api/v1/budgets/:id/alerts
  def create_alert
    alert = @budget.budget_alerts.build(alert_params)

    if alert.save
      render json: {
        success: true,
        data: BudgetAlertSerializer.new(alert),
        message: 'Alerta criado com sucesso'
      }, status: :created
    else
      render json: {
        success: false,
        message: 'Erro ao criar alerta',
        errors: alert.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  private

  def set_budget
    @budget = current_user.budgets.find(params[:id])
  end

  def budget_params
    params.require(:budget).permit(
      :name, :description, :amount, :category_id, :period_type,
      :start_date, :end_date, :is_recurring, :status
    )
  end

  def alert_params
    params.require(:alert).permit(
      :alert_type, :threshold_value, :message, :is_active
    )
  end

  def filter_params
    params.permit(:status, :period_type, :category_id, :search)
  end

  def filter_budgets(budgets)
    budgets = budgets.where(status: filter_params[:status]) if filter_params[:status].present?
    budgets = budgets.where(period_type: filter_params[:period_type]) if filter_params[:period_type].present?
    budgets = budgets.where(category_id: filter_params[:category_id]) if filter_params[:category_id].present?
    budgets = budgets.where("name ILIKE ?", "%#{filter_params[:search]}%") if filter_params[:search].present?
    budgets
  end

  def build_index_meta(budgets)
    {
      total_count: budgets.count,
      active_count: budgets.active.count,
      over_budget_count: budgets.active.select { |b| b.is_over_budget? }.count,
      total_budgeted: budgets.active.sum(:amount),
      total_spent: budgets.active.sum { |b| b.spent_amount }
    }
  end
end
```

### 7. Serializers
```ruby
# app/serializers/budget_serializer.rb
class BudgetSerializer < ActiveModel::Serializer
  attributes :id, :name, :description, :amount, :period_type, :status,
             :start_date, :end_date, :is_recurring, :created_at, :updated_at,
             :spent_amount, :remaining_amount, :usage_percentage,
             :is_over_budget, :days_remaining, :status_summary

  belongs_to :category, serializer: CategorySerializer
  has_many :budget_periods, serializer: BudgetPeriodSerializer, if: :include_periods?
  has_many :budget_alerts, serializer: BudgetAlertSerializer, if: :include_alerts?

  def spent_amount
    object.spent_amount
  end

  def remaining_amount
    object.remaining_amount
  end

  def usage_percentage
    object.usage_percentage
  end

  def is_over_budget
    object.is_over_budget?
  end

  def days_remaining
    object.days_remaining
  end

  def status_summary
    object.status_summary
  end

  private

  def include_periods?
    instance_options[:include_periods] || false
  end

  def include_alerts?
    instance_options[:include_alerts] || false
  end
end

# app/serializers/budget_period_serializer.rb
class BudgetPeriodSerializer < ActiveModel::Serializer
  attributes :id, :start_date, :end_date, :allocated_amount,
             :spent_amount, :remaining_amount, :usage_percentage,
             :is_current, :is_completed, :days_remaining, :performance_score

  def spent_amount
    object.spent_amount
  end

  def remaining_amount
    object.remaining_amount
  end

  def usage_percentage
    object.usage_percentage
  end

  def is_current
    object.is_current?
  end

  def is_completed
    object.is_completed?
  end

  def days_remaining
    object.days_remaining
  end

  def performance_score
    object.performance_score
  end
end

# app/serializers/budget_alert_serializer.rb
class BudgetAlertSerializer < ActiveModel::Serializer
  attributes :id, :alert_type, :threshold_value, :message, :status,
             :is_active, :sent_at, :formatted_threshold, :created_at

  def formatted_threshold
    object.formatted_threshold
  end
end
```

### 8. Jobs para Processamento
```ruby
# app/jobs/budget_monitoring_job.rb
class BudgetMonitoringJob < ApplicationJob
  queue_as :default

  def perform
    BudgetMonitoringService.new.call
  end
end

# app/jobs/budget_alert_notification_job.rb
class BudgetAlertNotificationJob < ApplicationJob
  queue_as :notifications

  def perform(budget_alert)
    # Send email, push notification, etc.
    BudgetAlertMailer.alert_triggered(budget_alert).deliver_now
  end
end

# app/jobs/budget_overrun_notification_job.rb
class BudgetOverrunNotificationJob < ApplicationJob
  queue_as :notifications

  def perform(budget, period)
    # Send overrun notification
    BudgetAlertMailer.budget_overrun(budget, period).deliver_now
  end
end
```

### 9. Testes RSpec
```ruby
# spec/models/budget_spec.rb
require 'rails_helper'

RSpec.describe Budget, type: :model do
  let(:user) { create(:user) }
  let(:category) { create(:category, user: user) }

  describe 'validations' do
    subject { build(:budget, user: user) }

    it { should validate_presence_of(:name) }
    it { should validate_presence_of(:amount) }
    it { should validate_presence_of(:period_type) }
    it { should validate_presence_of(:start_date) }
    it { should validate_presence_of(:end_date) }

    it 'validates amount is positive' do
      budget = build(:budget, user: user, amount: -100)
      expect(budget).not_to be_valid
      expect(budget.errors[:amount]).to include('must be greater than 0')
    end

    it 'validates end_date is after start_date' do
      budget = build(:budget, user: user, start_date: Date.current, end_date: 1.day.ago)
      expect(budget).not_to be_valid
      expect(budget.errors[:end_date]).to include('deve ser posterior à data de início')
    end
  end

  describe 'associations' do
    it { should belong_to(:user) }
    it { should belong_to(:category).optional }
    it { should have_many(:budget_alerts).dependent(:destroy) }
    it { should have_many(:budget_periods).dependent(:destroy) }
  end

  describe 'scopes' do
    let!(:active_budget) { create(:budget, user: user, status: :active) }
    let!(:paused_budget) { create(:budget, user: user, status: :paused) }

    it 'returns only active budgets' do
      expect(Budget.active).to include(active_budget)
      expect(Budget.active).not_to include(paused_budget)
    end
  end

  describe '#spent_amount' do
    let(:budget) { create(:budget, user: user, category: category, start_date: Date.current.beginning_of_month) }
    let!(:transaction1) { create(:transaction, user: user, category: category, amount: 100, date: Date.current) }
    let!(:transaction2) { create(:transaction, user: user, category: category, amount: 50, date: Date.current) }

    before do
      budget.budget_periods.create!(
        start_date: Date.current.beginning_of_month,
        end_date: Date.current.end_of_month,
        allocated_amount: budget.amount
      )
    end

    it 'calculates spent amount for the current period' do
      expect(budget.spent_amount).to eq(150)
    end
  end

  describe '#usage_percentage' do
    let(:budget) { create(:budget, user: user, amount: 1000) }

    before do
      allow(budget).to receive(:spent_amount).and_return(250)
    end

    it 'calculates usage percentage' do
      expect(budget.usage_percentage).to eq(25.0)
    end
  end

  describe '#is_over_budget?' do
    let(:budget) { create(:budget, user: user, amount: 1000) }

    context 'when spent amount exceeds budget' do
      before do
        allow(budget).to receive(:spent_amount).and_return(1500)
      end

      it 'returns true' do
        expect(budget.is_over_budget?).to be true
      end
    end

    context 'when spent amount is within budget' do
      before do
        allow(budget).to receive(:spent_amount).and_return(500)
      end

      it 'returns false' do
        expect(budget.is_over_budget?).to be false
      end
    end
  end

  describe '#status_summary' do
    let(:budget) { create(:budget, user: user, amount: 1000) }

    it 'returns correct status for different usage levels' do
      allow(budget).to receive(:usage_percentage).and_return(25)
      expect(budget.status_summary).to eq(:on_track)

      allow(budget).to receive(:usage_percentage).and_return(60)
      expect(budget.status_summary).to eq(:moderate)

      allow(budget).to receive(:usage_percentage).and_return(80)
      expect(budget.status_summary).to eq(:warning)

      allow(budget).to receive(:usage_percentage).and_return(95)
      expect(budget.status_summary).to eq(:critical)

      allow(budget).to receive(:usage_percentage).and_return(110)
      expect(budget.status_summary).to eq(:over_budget)
    end
  end
end
```

## Critérios de Sucesso
- [ ] Modelo Budget com validações robustas
- [ ] Sistema de períodos automáticos funcionando
- [ ] Monitoramento de gastos em tempo real
- [ ] Alertas configuráveis implementados
- [ ] API completa com endpoints RESTful
- [ ] Serializers formatando dados corretamente
- [ ] Jobs para processamento automático
- [ ] Performance otimizada para consultas
- [ ] Testes unitários com cobertura 95%+
- [ ] Documentação da API completa

## Performance e Otimização
- Índices de banco para consultas frequentes
- Cache de estatísticas calculadas
- Jobs assíncronos para alertas
- Paginação eficiente
- Queries otimizadas com includes

## Recursos Necessários
- Desenvolvedor backend Rails sênior
- DBA para otimização de queries
- Tester para casos complexos de negócio

## Tempo Estimado
- Modelos e relacionamentos: 8-10 horas
- Sistema de períodos: 6-8 horas
- Monitoramento e alertas: 8-10 horas
- Controller e API: 6-8 horas
- Services e jobs: 8-10 horas
- Testes e otimização: 10-12 horas
- **Total**: 6-7 dias de trabalho