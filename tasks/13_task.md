---
status: completed
parallelizable: false
blocked_by: ["5.0", "6.0", "9.0"]
completed_date: 2025-10-03
---

<task_context>
<domain>backend/api</domain>
<type>implementation</type>
<scope>core_feature</scope>
<complexity>high</complexity>
<dependencies>database</dependencies>
<unblocks>"14.0"</unblocks>
</task_context>

# Tarefa 13.0: API do Dashboard Principal

## Visão Geral
Implementar a API do dashboard principal que fornece uma visão consolidada das finanças do usuário, incluindo resumo mensal, saldo atual, transações recentes, top categorias de gastos e evolução temporal dos dados financeiros.

## Requisitos
- Endpoint único para dados do dashboard (/api/v1/dashboard)
- Resumo financeiro do mês atual (receitas, despesas, saldo)
- Saldo total atual de todas as contas
- Últimas 10 transações
- Top 5 categorias de gastos do mês
- Evolução mensal dos últimos 6 meses
- Performance otimizada com queries eficientes
- Cache para dados que mudam pouco
- Resposta estruturada e padronizada

## Subtarefas
- [x] 13.1 Criar DashboardController com endpoint principal
- [x] 13.2 Implementar service para cálculos financeiros
- [x] 13.3 Criar queries otimizadas para resumos
- [x] 13.4 Implementar cache para dados de dashboard
- [x] 13.5 Criar serializer para resposta do dashboard
- [x] 13.6 Implementar métricas de tendências
- [x] 13.7 Adicionar filtros por período
- [x] 13.8 Criar testes unitários e de integração
- [x] 13.9 Otimizar performance com índices

## Sequenciamento
- Bloqueado por: 5.0 (Models), 6.0 (Auth), 9.0 (Transactions API)
- Desbloqueia: 14.0 (Dashboard Frontend)
- Paralelizável: Não (depende de dados de transações)

## Detalhes de Implementação

### 1. DashboardController
```ruby
# app/controllers/api/v1/dashboard_controller.rb
class Api::V1::DashboardController < Api::V1::BaseController
  before_action :authenticate_user!

  def show
    @dashboard_data = DashboardService.new(current_user, dashboard_params).call

    render json: {
      success: true,
      data: DashboardSerializer.new(@dashboard_data).as_json
    }
  end

  private

  def dashboard_params
    params.permit(:period, :start_date, :end_date)
  end
end
```

### 2. DashboardService
```ruby
# app/services/dashboard_service.rb
class DashboardService
  def initialize(user, params = {})
    @user = user
    @period = params[:period] || 'current_month'
    @start_date = params[:start_date] || Date.current.beginning_of_month
    @end_date = params[:end_date] || Date.current.end_of_month
  end

  def call
    Rails.cache.fetch(cache_key, expires_in: 15.minutes) do
      {
        summary: financial_summary,
        current_balance: total_balance,
        recent_transactions: recent_transactions,
        top_categories: top_categories,
        monthly_evolution: monthly_evolution,
        budget_status: budget_status,
        goals_progress: goals_progress
      }
    end
  end

  private

  def cache_key
    "dashboard:#{@user.id}:#{@period}:#{@start_date}:#{@end_date}:#{last_transaction_update}"
  end

  def last_transaction_update
    @user.transactions.maximum(:updated_at)&.to_i || 0
  end

  def financial_summary
    current_month_transactions = @user.transactions
                                     .where(date: @start_date..@end_date)

    income = current_month_transactions.where(transaction_type: 'income').sum(:amount)
    expenses = current_month_transactions.where(transaction_type: 'expense').sum(:amount)

    {
      current_month: {
        income: income.to_f,
        expenses: expenses.to_f,
        balance: (income - expenses).to_f,
        transactions_count: current_month_transactions.count
      },
      previous_month: previous_month_summary,
      variation: calculate_variation(income - expenses)
    }
  end

  def previous_month_summary
    previous_start = @start_date - 1.month
    previous_end = @end_date - 1.month

    previous_transactions = @user.transactions
                                .where(date: previous_start..previous_end)

    income = previous_transactions.where(transaction_type: 'income').sum(:amount)
    expenses = previous_transactions.where(transaction_type: 'expense').sum(:amount)

    {
      income: income.to_f,
      expenses: expenses.to_f,
      balance: (income - expenses).to_f
    }
  end

  def calculate_variation(current_balance)
    previous_balance = previous_month_summary[:balance]
    return 0 if previous_balance.zero?

    variation = ((current_balance - previous_balance) / previous_balance * 100).round(2)
    {
      percentage: variation,
      trend: variation > 0 ? 'up' : (variation < 0 ? 'down' : 'stable'),
      amount: (current_balance - previous_balance).to_f
    }
  end

  def total_balance
    @user.accounts.where(is_active: true).sum(:current_balance).to_f
  end

  def recent_transactions
    @user.transactions
         .includes(:category, :account)
         .order(created_at: :desc)
         .limit(10)
         .map { |t| TransactionSerializer.new(t).as_json }
  end

  def top_categories
    @user.transactions
         .joins(:category)
         .where(transaction_type: 'expense', date: @start_date..@end_date)
         .group('categories.id', 'categories.name', 'categories.color')
         .sum(:amount)
         .map do |key, amount|
           id, name, color = key
           {
             category_id: id,
             category_name: name,
             color: color,
             amount: amount.to_f,
             percentage: calculate_category_percentage(amount)
           }
         end
         .sort_by { |cat| -cat[:amount] }
         .first(5)
  end

  def calculate_category_percentage(amount)
    total_expenses = @user.transactions
                         .where(transaction_type: 'expense', date: @start_date..@end_date)
                         .sum(:amount)

    return 0 if total_expenses.zero?

    ((amount / total_expenses) * 100).round(2)
  end

  def monthly_evolution
    6.downto(0).map do |months_ago|
      month_start = Date.current.beginning_of_month - months_ago.months
      month_end = Date.current.end_of_month - months_ago.months

      transactions = @user.transactions.where(date: month_start..month_end)
      income = transactions.where(transaction_type: 'income').sum(:amount)
      expenses = transactions.where(transaction_type: 'expense').sum(:amount)

      {
        month: month_start.strftime('%Y-%m'),
        month_name: month_start.strftime('%B %Y'),
        income: income.to_f,
        expenses: expenses.to_f,
        balance: (income - expenses).to_f
      }
    end
  end

  def budget_status
    current_budgets = @user.budgets
                          .includes(:category)
                          .where(is_active: true)
                          .where('start_date <= ? AND end_date >= ?', Date.current, Date.current)

    current_budgets.map do |budget|
      spent = @user.transactions
                  .where(category: budget.category)
                  .where(transaction_type: 'expense')
                  .where(date: budget.start_date..budget.end_date)
                  .sum(:amount)

      percentage_used = (spent / budget.amount_limit * 100).round(2)
      status = determine_budget_status(percentage_used)

      {
        budget_id: budget.id,
        category: {
          id: budget.category.id,
          name: budget.category.name,
          color: budget.category.color
        },
        limit: budget.amount_limit.to_f,
        spent: spent.to_f,
        remaining: (budget.amount_limit - spent).to_f,
        percentage_used: percentage_used,
        status: status
      }
    end
  end

  def determine_budget_status(percentage)
    case percentage
    when 0..60 then 'safe'
    when 61..80 then 'warning'
    when 81..100 then 'danger'
    else 'exceeded'
    end
  end

  def goals_progress
    @user.goals
         .where(is_achieved: false)
         .order(:target_date)
         .limit(3)
         .map do |goal|
           progress_percentage = (goal.current_amount / goal.target_amount * 100).round(2)
           days_remaining = goal.target_date ? (goal.target_date - Date.current).to_i : nil

           {
             goal_id: goal.id,
             title: goal.title,
             target_amount: goal.target_amount.to_f,
             current_amount: goal.current_amount.to_f,
             progress_percentage: progress_percentage,
             days_remaining: days_remaining,
             target_date: goal.target_date&.strftime('%Y-%m-%d')
           }
         end
  end
end
```

### 3. DashboardSerializer
```ruby
# app/serializers/dashboard_serializer.rb
class DashboardSerializer
  def initialize(dashboard_data)
    @data = dashboard_data
  end

  def as_json
    {
      summary: @data[:summary],
      current_balance: format_currency(@data[:current_balance]),
      recent_transactions: @data[:recent_transactions],
      top_categories: format_categories(@data[:top_categories]),
      monthly_evolution: format_evolution(@data[:monthly_evolution]),
      budget_status: format_budgets(@data[:budget_status]),
      goals_progress: @data[:goals_progress],
      last_updated: Time.current.iso8601
    }
  end

  private

  def format_currency(amount)
    {
      raw: amount,
      formatted: sprintf('R$ %.2f', amount)
    }
  end

  def format_categories(categories)
    categories.map do |category|
      category.merge(
        formatted_amount: sprintf('R$ %.2f', category[:amount])
      )
    end
  end

  def format_evolution(evolution)
    evolution.map do |month|
      month.merge(
        formatted_income: sprintf('R$ %.2f', month[:income]),
        formatted_expenses: sprintf('R$ %.2f', month[:expenses]),
        formatted_balance: sprintf('R$ %.2f', month[:balance])
      )
    end
  end

  def format_budgets(budgets)
    budgets.map do |budget|
      budget.merge(
        formatted_limit: sprintf('R$ %.2f', budget[:limit]),
        formatted_spent: sprintf('R$ %.2f', budget[:spent]),
        formatted_remaining: sprintf('R$ %.2f', budget[:remaining])
      )
    end
  end
end
```

### 4. Optimizações de Performance
```ruby
# app/models/user.rb (métodos de cache)
class User < ApplicationRecord
  # ... código existente

  def dashboard_cache_key
    "user:#{id}:dashboard:#{updated_at.to_i}:#{last_transaction_timestamp}"
  end

  def last_transaction_timestamp
    transactions.maximum(:updated_at)&.to_i || 0
  end
end
```

### 5. Índices de Banco Otimizados
```ruby
# db/migrate/add_dashboard_indexes.rb
class AddDashboardIndexes < ActiveRecord::Migration[7.0]
  def change
    # Índices para queries do dashboard
    add_index :transactions, [:user_id, :date, :transaction_type]
    add_index :transactions, [:user_id, :created_at]
    add_index :transactions, [:user_id, :category_id, :date]
    add_index :accounts, [:user_id, :is_active]
    add_index :budgets, [:user_id, :is_active, :start_date, :end_date]
  end
end
```

### 6. Background Jobs para Cache
```ruby
# app/jobs/dashboard_cache_warming_job.rb
class DashboardCacheWarmingJob < ApplicationJob
  def perform(user_id)
    user = User.find(user_id)
    DashboardService.new(user).call
  end
end

# Trigger após criação/atualização de transação
# app/models/transaction.rb
class Transaction < ApplicationRecord
  # ... código existente

  after_commit :warm_dashboard_cache

  private

  def warm_dashboard_cache
    DashboardCacheWarmingJob.perform_later(user_id)
  end
end
```

## Critérios de Sucesso
- [x] Endpoint /api/v1/dashboard respondendo corretamente
- [x] Todos os dados do dashboard calculados corretamente
- [x] Performance otimizada (resposta < 500ms)
- [x] Cache funcionando para reduzir carga no banco
- [x] Queries otimizadas sem N+1 problems
- [x] Resposta estruturada e padronizada
- [x] Testes unitários com 100% cobertura
- [x] Testes de performance validados
- [x] Documentação da API atualizada

## Exemplo de Resposta da API
```json
{
  "success": true,
  "data": {
    "summary": {
      "current_month": {
        "income": 5500.00,
        "expenses": 3200.50,
        "balance": 2299.50,
        "transactions_count": 45
      },
      "previous_month": {
        "income": 5200.00,
        "expenses": 3100.00,
        "balance": 2100.00
      },
      "variation": {
        "percentage": 9.50,
        "trend": "up",
        "amount": 199.50
      }
    },
    "current_balance": {
      "raw": 12500.75,
      "formatted": "R$ 12.500,75"
    },
    "recent_transactions": [...],
    "top_categories": [
      {
        "category_id": 1,
        "category_name": "Alimentação",
        "color": "#ef4444",
        "amount": 800.00,
        "percentage": 25.0,
        "formatted_amount": "R$ 800,00"
      }
    ],
    "monthly_evolution": [...],
    "budget_status": [...],
    "goals_progress": [...],
    "last_updated": "2024-01-15T10:30:00Z"
  }
}
```

## Testes
```ruby
# spec/requests/api/v1/dashboard_spec.rb
RSpec.describe 'Api::V1::Dashboard', type: :request do
  let(:user) { create(:user) }
  let(:auth_headers) { { 'Authorization' => "Bearer #{jwt_token(user)}" } }

  before do
    # Setup test data
    create(:account, user: user, current_balance: 1000)
    create_list(:transaction, 10, user: user)
  end

  describe 'GET /api/v1/dashboard' do
    it 'returns dashboard data successfully' do
      get '/api/v1/dashboard', headers: auth_headers

      expect(response).to have_http_status(:ok)
      expect(json_response['success']).to be true
      expect(json_response['data']).to include(
        'summary', 'current_balance', 'recent_transactions',
        'top_categories', 'monthly_evolution'
      )
    end

    it 'calculates financial summary correctly' do
      income = create(:transaction, :income, user: user, amount: 1000)
      expense = create(:transaction, :expense, user: user, amount: 300)

      get '/api/v1/dashboard', headers: auth_headers

      summary = json_response['data']['summary']['current_month']
      expect(summary['income']).to eq(1000.0)
      expect(summary['expenses']).to eq(300.0)
      expect(summary['balance']).to eq(700.0)
    end
  end
end
```

## Recursos Necessários
- Desenvolvedor backend Rails senior
- Models e autenticação implementados
- Redis para cache (configurado na infraestrutura)

## Tempo Estimado
- Service e controller: 2 dias
- Otimizações e cache: 1 dia
- Serialização e formatação: 1 dia
- Testes e validação: 1 dia
- **Total**: 5 dias de trabalho