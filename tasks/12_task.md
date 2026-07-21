---
status: completed
parallelizable: false
blocked_by: ["2.0", "11.0"]
completed_date: 2025-10-03
---

<task_context>
<domain>backend/advanced_features</domain>
<type>implementation</type>
<scope>core_feature</scope>
<complexity>medium</complexity>
<dependencies>backend_setup, categories</dependencies>
<unblocks>"10.0", "19.0"</unblocks>
</task_context>

# Tarefa 12.0: Sistema de Filtros e Busca de Transações

## Visão Geral
Implementar sistema avançado de filtros e busca para transações no backend Rails, incluindo filtros por período, categoria, tipo, valor e busca textual com índices otimizados para performance.

## Requisitos
- Filtros avançados por múltiplos critérios
- Busca textual na descrição das transações
- Filtros por data com períodos pré-definidos
- Filtros por categoria e subcategoria
- Filtros por tipo de transação (receita/despesa)
- Filtros por faixa de valores
- Performance otimizada com índices de banco
- Paginação e ordenação configurável

## Subtarefas
- [x] 12.1 Implementar scopes para filtros básicos ✅
- [x] 12.2 Criar filtros de data avançados ✅
- [x] 12.3 Implementar busca textual otimizada ✅
- [x] 12.4 Filtros por categoria e tipo ✅
- [x] 12.5 Filtros por faixa de valores ✅
- [x] 12.6 Sistema de ordenação flexível ✅
- [x] 12.7 Otimização com índices de banco ✅
- [x] 12.8 Testes unitários e de performance ✅
- [x] 12.9 Documentação da API ✅
- [x] 12.10 Cache de filtros frequentes ✅

## Sequenciamento
- Bloqueado por: 2.0 (Backend Setup), 11.0 (Sistema Categorias)
- Desbloqueia: 10.0 (Interface Transações), 19.0 (Relatórios Financeiros)
- Paralelizável: Não (depende do modelo Transaction)

## Detalhes de Implementação

### 1. Modelo Transaction com Scopes
```ruby
# app/models/transaction.rb
class Transaction < ApplicationRecord
  belongs_to :user
  belongs_to :category, optional: true

  validates :description, presence: true, length: { minimum: 2, maximum: 100 }
  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :transaction_type, presence: true, inclusion: { in: %w[income expense] }
  validates :date, presence: true

  enum transaction_type: { income: 0, expense: 1 }

  # Search scopes
  scope :search_description, ->(query) {
    where("description ILIKE ?", "%#{query}%") if query.present?
  }

  scope :by_category, ->(category_id) {
    where(category_id: category_id) if category_id.present?
  }

  scope :by_categories, ->(category_ids) {
    where(category_id: category_ids) if category_ids.present?
  }

  scope :by_type, ->(type) {
    where(transaction_type: type) if type.present?
  }

  scope :by_date_range, ->(start_date, end_date) {
    where(date: start_date..end_date) if start_date.present? && end_date.present?
  }

  scope :by_amount_range, ->(min_amount, max_amount) {
    scope = all
    scope = scope.where("amount >= ?", min_amount) if min_amount.present?
    scope = scope.where("amount <= ?", max_amount) if max_amount.present?
    scope
  }

  scope :this_month, -> {
    current_month = Date.current.beginning_of_month..Date.current.end_of_month
    where(date: current_month)
  }

  scope :last_month, -> {
    last_month = Date.current.last_month.beginning_of_month..Date.current.last_month.end_of_month
    where(date: last_month)
  }

  scope :this_year, -> {
    current_year = Date.current.beginning_of_year..Date.current.end_of_year
    where(date: current_year)
  }

  scope :last_year, -> {
    last_year = Date.current.last_year.beginning_of_year..Date.current.last_year.end_of_year
    where(date: last_year)
  }

  scope :recent, ->(days = 30) {
    where("date >= ?", days.days.ago)
  }

  scope :order_by_date, ->(direction = :desc) {
    order(date: direction, created_at: direction)
  }

  scope :order_by_amount, ->(direction = :desc) {
    order(amount: direction)
  }

  scope :order_by_description, ->(direction = :asc) {
    order(description: direction)
  }

  # Combined filtering method
  def self.filtered_search(params)
    scope = includes(:category)

    scope = scope.search_description(params[:search]) if params[:search].present?
    scope = scope.by_category(params[:category_id]) if params[:category_id].present?
    scope = scope.by_categories(params[:category_ids]) if params[:category_ids].present?
    scope = scope.by_type(params[:type]) if params[:type].present?

    # Date filtering
    if params[:date_filter].present?
      case params[:date_filter]
      when 'this_month'
        scope = scope.this_month
      when 'last_month'
        scope = scope.last_month
      when 'this_year'
        scope = scope.this_year
      when 'last_year'
        scope = scope.last_year
      when 'custom'
        scope = scope.by_date_range(params[:start_date], params[:end_date])
      when 'recent'
        days = params[:recent_days].present? ? params[:recent_days].to_i : 30
        scope = scope.recent(days)
      end
    elsif params[:start_date].present? || params[:end_date].present?
      scope = scope.by_date_range(params[:start_date], params[:end_date])
    end

    # Amount filtering
    scope = scope.by_amount_range(params[:min_amount], params[:max_amount])

    # Ordering
    if params[:sort_by].present?
      case params[:sort_by]
      when 'date'
        scope = scope.order_by_date(params[:sort_direction]&.to_sym || :desc)
      when 'amount'
        scope = scope.order_by_amount(params[:sort_direction]&.to_sym || :desc)
      when 'description'
        scope = scope.order_by_description(params[:sort_direction]&.to_sym || :asc)
      else
        scope = scope.order_by_date(:desc)
      end
    else
      scope = scope.order_by_date(:desc)
    end

    scope
  end
end
```

### 2. Service para Filtros Avançados
```ruby
# app/services/transaction_filter_service.rb
class TransactionFilterService
  include ActiveModel::Model
  include ActiveModel::Attributes

  attribute :user, default: -> { nil }
  attribute :search, :string
  attribute :category_id, :integer
  attribute :category_ids, default: -> { [] }
  attribute :type, :string
  attribute :date_filter, :string
  attribute :start_date, :date
  attribute :end_date, :date
  attribute :recent_days, :integer
  attribute :min_amount, :decimal
  attribute :max_amount, :decimal
  attribute :sort_by, :string, default: 'date'
  attribute :sort_direction, :string, default: 'desc'
  attribute :page, :integer, default: 1
  attribute :per_page, :integer, default: 20

  validates :user, presence: true
  validates :sort_by, inclusion: { in: %w[date amount description] }
  validates :sort_direction, inclusion: { in: %w[asc desc] }
  validates :type, inclusion: { in: %w[income expense] }, allow_blank: true
  validates :per_page, inclusion: { in: (1..100) }

  def call
    return failure_result("Invalid parameters") unless valid?

    transactions = base_scope.filtered_search(filter_params)
    paginated_transactions = paginate_transactions(transactions)

    success_result(paginated_transactions, transactions)
  end

  private

  def base_scope
    user.transactions
  end

  def filter_params
    {
      search: search,
      category_id: category_id,
      category_ids: category_ids,
      type: type,
      date_filter: date_filter,
      start_date: start_date,
      end_date: end_date,
      recent_days: recent_days,
      min_amount: min_amount,
      max_amount: max_amount,
      sort_by: sort_by,
      sort_direction: sort_direction
    }
  end

  def paginate_transactions(transactions)
    transactions.page(page).per(per_page)
  end

  def success_result(paginated_transactions, all_transactions)
    {
      success: true,
      data: paginated_transactions,
      meta: build_meta(paginated_transactions, all_transactions)
    }
  end

  def failure_result(message)
    {
      success: false,
      message: message,
      errors: errors.full_messages
    }
  end

  def build_meta(paginated_transactions, all_transactions)
    {
      pagination: {
        current_page: paginated_transactions.current_page,
        total_pages: paginated_transactions.total_pages,
        total_count: paginated_transactions.total_count,
        per_page: paginated_transactions.limit_value
      },
      filters: {
        applied_filters: applied_filters_summary,
        total_filtered: all_transactions.count,
        summary: calculate_summary(all_transactions)
      }
    }
  end

  def applied_filters_summary
    filters = []
    filters << "Search: #{search}" if search.present?
    filters << "Category: #{Category.find(category_id).name}" if category_id.present?
    filters << "Type: #{type.humanize}" if type.present?
    filters << "Date: #{date_filter || 'Custom range'}" if date_filtering_applied?
    filters << "Amount: #{amount_range_description}" if amount_filtering_applied?
    filters
  end

  def date_filtering_applied?
    date_filter.present? || start_date.present? || end_date.present?
  end

  def amount_filtering_applied?
    min_amount.present? || max_amount.present?
  end

  def amount_range_description
    if min_amount.present? && max_amount.present?
      "#{min_amount} - #{max_amount}"
    elsif min_amount.present?
      "> #{min_amount}"
    elsif max_amount.present?
      "< #{max_amount}"
    end
  end

  def calculate_summary(transactions)
    {
      total_income: transactions.income.sum(:amount),
      total_expense: transactions.expense.sum(:amount),
      net_amount: transactions.income.sum(:amount) - transactions.expense.sum(:amount),
      transaction_count: transactions.count
    }
  end
end
```

### 3. Controller Atualizado
```ruby
# app/controllers/api/v1/transactions_controller.rb
class Api::V1::TransactionsController < Api::V1::BaseController
  before_action :authenticate_user!
  before_action :set_transaction, only: [:show, :update, :destroy]

  # GET /api/v1/transactions
  def index
    filter_service = TransactionFilterService.new(
      filter_params.merge(user: current_user)
    )

    result = filter_service.call

    if result[:success]
      render json: {
        success: true,
        data: ActiveModelSerializers::SerializableResource.new(
          result[:data],
          each_serializer: TransactionSerializer
        ),
        meta: result[:meta]
      }
    else
      render json: {
        success: false,
        message: result[:message],
        errors: result[:errors]
      }, status: :unprocessable_entity
    end
  end

  # GET /api/v1/transactions/filters
  def filter_options
    render json: {
      success: true,
      data: {
        categories: current_user.categories.active.order(:name).select(:id, :name, :color),
        types: Transaction.transaction_types.keys,
        date_filters: [
          { key: 'this_month', label: 'Este mês' },
          { key: 'last_month', label: 'Mês passado' },
          { key: 'this_year', label: 'Este ano' },
          { key: 'last_year', label: 'Ano passado' },
          { key: 'recent', label: 'Últimos dias' },
          { key: 'custom', label: 'Período personalizado' }
        ],
        sort_options: [
          { key: 'date', label: 'Data' },
          { key: 'amount', label: 'Valor' },
          { key: 'description', label: 'Descrição' }
        ]
      }
    }
  end

  # GET /api/v1/transactions/search_suggestions
  def search_suggestions
    query = params[:q]
    return render json: { success: true, data: [] } if query.blank?

    suggestions = current_user.transactions
                             .where("description ILIKE ?", "%#{query}%")
                             .distinct
                             .limit(10)
                             .pluck(:description)

    render json: {
      success: true,
      data: suggestions
    }
  end

  private

  def filter_params
    params.permit(
      :search, :category_id, :type, :date_filter, :start_date, :end_date,
      :recent_days, :min_amount, :max_amount, :sort_by, :sort_direction,
      :page, :per_page, category_ids: []
    )
  end

  def set_transaction
    @transaction = current_user.transactions.find(params[:id])
  end
end
```

### 4. Migrations para Índices
```ruby
# db/migrate/xxx_add_search_indexes_to_transactions.rb
class AddSearchIndexesToTransactions < ActiveRecord::Migration[7.1]
  def change
    # Índice para busca textual
    add_index :transactions, :description, using: :gin, opclass: :gin_trgm_ops

    # Índices compostos para filtros comuns
    add_index :transactions, [:user_id, :date, :transaction_type]
    add_index :transactions, [:user_id, :category_id, :date]
    add_index :transactions, [:user_id, :amount, :date]
    add_index :transactions, [:user_id, :transaction_type, :date, :amount]

    # Índice para ordenação por data
    add_index :transactions, [:user_id, :date, :created_at], order: { date: :desc, created_at: :desc }
  end
end

# db/migrate/xxx_enable_pg_trgm_extension.rb
class EnablePgTrgmExtension < ActiveRecord::Migration[7.1]
  def change
    enable_extension 'pg_trgm'
  end
end
```

### 5. Rotas
```ruby
# config/routes.rb
Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :transactions do
        collection do
          get :filter_options
          get :search_suggestions
        end
      end
    end
  end
end
```

### 6. Testes RSpec
```ruby
# spec/services/transaction_filter_service_spec.rb
require 'rails_helper'

RSpec.describe TransactionFilterService do
  let(:user) { create(:user) }
  let(:category1) { create(:category, user: user, name: 'Alimentação') }
  let(:category2) { create(:category, user: user, name: 'Transporte') }

  let!(:transaction1) { create(:transaction, user: user, description: 'Supermercado', amount: 100, transaction_type: 'expense', category: category1, date: 1.day.ago) }
  let!(:transaction2) { create(:transaction, user: user, description: 'Salário', amount: 5000, transaction_type: 'income', date: 2.days.ago) }
  let!(:transaction3) { create(:transaction, user: user, description: 'Uber', amount: 25, transaction_type: 'expense', category: category2, date: 3.days.ago) }

  describe '#call' do
    context 'without filters' do
      it 'returns all user transactions' do
        service = described_class.new(user: user)
        result = service.call

        expect(result[:success]).to be true
        expect(result[:data].count).to eq(3)
      end
    end

    context 'with search filter' do
      it 'filters by description' do
        service = described_class.new(user: user, search: 'Super')
        result = service.call

        expect(result[:success]).to be true
        expect(result[:data].count).to eq(1)
        expect(result[:data].first.description).to eq('Supermercado')
      end
    end

    context 'with category filter' do
      it 'filters by category' do
        service = described_class.new(user: user, category_id: category1.id)
        result = service.call

        expect(result[:success]).to be true
        expect(result[:data].count).to eq(1)
        expect(result[:data].first.category).to eq(category1)
      end
    end

    context 'with type filter' do
      it 'filters by transaction type' do
        service = described_class.new(user: user, type: 'expense')
        result = service.call

        expect(result[:success]).to be true
        expect(result[:data].count).to eq(2)
        expect(result[:data].all? { |t| t.expense? }).to be true
      end
    end

    context 'with date filter' do
      it 'filters by this month' do
        service = described_class.new(user: user, date_filter: 'this_month')
        result = service.call

        expect(result[:success]).to be true
        expect(result[:data].count).to eq(3) # All transactions are from this month
      end

      it 'filters by custom date range' do
        service = described_class.new(
          user: user,
          start_date: 2.days.ago.to_date,
          end_date: 1.day.ago.to_date
        )
        result = service.call

        expect(result[:success]).to be true
        expect(result[:data].count).to eq(2)
      end
    end

    context 'with amount filter' do
      it 'filters by minimum amount' do
        service = described_class.new(user: user, min_amount: 100)
        result = service.call

        expect(result[:success]).to be true
        expect(result[:data].count).to eq(2)
        expect(result[:data].all? { |t| t.amount >= 100 }).to be true
      end

      it 'filters by amount range' do
        service = described_class.new(user: user, min_amount: 50, max_amount: 200)
        result = service.call

        expect(result[:success]).to be true
        expect(result[:data].count).to eq(1)
        expect(result[:data].first.amount).to eq(100)
      end
    end

    context 'with sorting' do
      it 'sorts by amount descending' do
        service = described_class.new(user: user, sort_by: 'amount', sort_direction: 'desc')
        result = service.call

        expect(result[:success]).to be true
        amounts = result[:data].map(&:amount)
        expect(amounts).to eq([5000, 100, 25])
      end

      it 'sorts by date ascending' do
        service = described_class.new(user: user, sort_by: 'date', sort_direction: 'asc')
        result = service.call

        expect(result[:success]).to be true
        dates = result[:data].map(&:date)
        expect(dates).to eq(dates.sort)
      end
    end

    context 'with pagination' do
      it 'paginates results' do
        service = described_class.new(user: user, page: 1, per_page: 2)
        result = service.call

        expect(result[:success]).to be true
        expect(result[:data].count).to eq(2)
        expect(result[:meta][:pagination][:total_pages]).to eq(2)
        expect(result[:meta][:pagination][:total_count]).to eq(3)
      end
    end

    context 'with multiple filters' do
      it 'combines multiple filters correctly' do
        service = described_class.new(
          user: user,
          search: 'Super',
          type: 'expense',
          category_id: category1.id,
          min_amount: 50
        )
        result = service.call

        expect(result[:success]).to be true
        expect(result[:data].count).to eq(1)
        expect(result[:data].first.description).to eq('Supermercado')
      end
    end

    context 'with invalid parameters' do
      it 'returns error for invalid sort_by' do
        service = described_class.new(user: user, sort_by: 'invalid')
        result = service.call

        expect(result[:success]).to be false
        expect(result[:message]).to eq('Invalid parameters')
      end

      it 'returns error when user is missing' do
        service = described_class.new(search: 'test')
        result = service.call

        expect(result[:success]).to be false
        expect(result[:message]).to eq('Invalid parameters')
      end
    end
  end
end
```

## Critérios de Sucesso
- [x] Filtros básicos (categoria, tipo, data) funcionando ✅
- [x] Busca textual otimizada implementada ✅
- [x] Filtros de faixa de valores funcionando ✅
- [x] Sistema de ordenação flexível implementado ✅
- [x] Períodos pré-definidos (mês atual, ano, etc.) funcionando ✅
- [x] Índices de banco criados para performance ✅
- [x] Paginação implementada corretamente ✅
- [x] Testes unitários com cobertura 90%+ ✅
- [x] API documentada com exemplos ✅
- [x] Performance otimizada para grandes volumes ✅

## Performance e Otimização

### Cache Strategy
```ruby
# app/controllers/api/v1/transactions_controller.rb
def filter_options
  Rails.cache.fetch("filter_options_#{current_user.id}", expires_in: 1.hour) do
    {
      success: true,
      data: {
        categories: current_user.categories.active.order(:name).select(:id, :name, :color),
        types: Transaction.transaction_types.keys,
        date_filters: date_filter_options,
        sort_options: sort_options
      }
    }
  end
end
```

## Recursos Necessários
- Desenvolvedor backend Rails experiente
- DBA para otimização de índices
- Tester para casos de uso complexos

## Tempo Estimado
- Scopes e filtros básicos: 6-8 horas
- Service de filtros avançados: 8-10 horas
- Índices e otimização: 4-6 horas
- Testes e documentação: 6-8 horas
- **Total**: 3-4 dias de trabalho