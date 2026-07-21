---
status: pending
parallelizable: false
blocked_by: ["5.0", "2.0"]
---

<task_context>
<domain>backend/api</domain>
<type>implementation</type>
<scope>core_feature</scope>
<complexity>medium</complexity>
<dependencies>models|backend_setup</dependencies>
<unblocks>"10.0", "12.0", "17.0"</unblocks>
</task_context>

# Tarefa 11.0: Sistema de Categorias

## Visão Geral
Implementar API completa para gerenciamento de categorias de transações, incluindo CRUD, categorias padrão, categorias personalizadas por usuário, e funcionalidades de organização financeira.

## Requisitos
- API RESTful para CRUD de categorias
- Categorias padrão pré-definidas no sistema
- Categorias personalizadas por usuário
- Suporte a cores e ícones para categorias
- Filtros por tipo (receita/despesa)
- Estatísticas de uso de categorias
- Validações e regras de negócio

## Subtarefas
- [ ] 11.1 Implementar controller de categorias
- [ ] 11.2 Criar endpoints CRUD básicos
- [ ] 11.3 Implementar sistema de categorias padrão
- [ ] 11.4 Desenvolver categorias personalizadas
- [ ] 11.5 Adicionar validações e regras de negócio
- [ ] 11.6 Implementar filtros e busca
- [ ] 11.7 Criar endpoint de estatísticas
- [ ] 11.8 Implementar seeds de categorias padrão
- [ ] 11.9 Configurar serializers/formatação JSON
- [ ] 11.10 Implementar testes completos

## Sequenciamento
- Bloqueado por: 5.0 (Models), 2.0 (Backend Setup)
- Desbloqueia: 10.0 (Interface Transações), 12.0 (Filtros), 17.0 (Orçamentos)
- Paralelizável: Não (depende dos models)

## Detalhes de Implementação

### 1. Controller de Categorias
```ruby
# app/controllers/api/v1/categories_controller.rb
class Api::V1::CategoriesController < Api::V1::BaseController
  before_action :authenticate_user!
  before_action :set_category, only: [:show, :update, :destroy, :transactions]

  def index
    @categories = current_user.available_categories
                               .includes(:user)
                               .filter_by_params(category_params)
                               .order(:name)

    success_response(
      data: ActiveModel::Serializer::CollectionSerializer.new(
        @categories,
        serializer: CategorySerializer
      ).as_json,
      meta: {
        total_count: @categories.count,
        default_count: @categories.where(is_default: true).count,
        custom_count: @categories.where(is_default: false).count
      }
    )
  end

  def show
    success_response(
      data: CategorySerializer.new(@category).as_json
    )
  end

  def create
    @category = current_user.categories.build(category_params)
    @category.is_default = false # User categories are never default

    if @category.save
      success_response(
        data: CategorySerializer.new(@category).as_json,
        message: 'Categoria criada com sucesso',
        status: :created
      )
    else
      error_response(
        message: 'Erro ao criar categoria',
        errors: format_validation_errors(@category),
        status: :unprocessable_entity
      )
    end
  end

  def update
    # Only allow updating user's own categories (not default ones)
    if @category.is_default?
      return error_response(
        message: 'Categorias padrão não podem ser editadas',
        status: :forbidden
      )
    end

    if @category.update(category_params)
      success_response(
        data: CategorySerializer.new(@category).as_json,
        message: 'Categoria atualizada com sucesso'
      )
    else
      error_response(
        message: 'Erro ao atualizar categoria',
        errors: format_validation_errors(@category),
        status: :unprocessable_entity
      )
    end
  end

  def destroy
    # Only allow deleting user's own categories
    if @category.is_default?
      return error_response(
        message: 'Categorias padrão não podem ser excluídas',
        status: :forbidden
      )
    end

    # Check if category has transactions
    if @category.transactions.exists?
      return error_response(
        message: 'Não é possível excluir categoria com transações associadas',
        status: :unprocessable_entity
      )
    end

    @category.destroy!
    success_response(
      message: 'Categoria excluída com sucesso',
      status: :no_content
    )
  end

  def transactions
    @transactions = @category.transactions
                            .includes(:account, :category)
                            .where(user: current_user)
                            .order(date: :desc)
                            .page(params[:page])
                            .per(params[:per_page] || 20)

    success_response(
      data: ActiveModel::Serializer::CollectionSerializer.new(
        @transactions,
        serializer: TransactionSerializer
      ).as_json,
      meta: pagination_meta(@transactions)
    )
  end

  def statistics
    stats = CategoryStatisticsService.new(current_user, params).call

    success_response(
      data: stats,
      message: 'Estatísticas de categorias calculadas'
    )
  end

  private

  def set_category
    @category = current_user.available_categories.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    error_response(
      message: 'Categoria não encontrada',
      status: :not_found
    )
  end

  def category_params
    params.require(:category).permit(
      :name, :color, :icon, :category_type, :is_active
    ).tap do |whitelisted|
      # Additional filtering/processing
      whitelisted[:color] = normalize_color(whitelisted[:color]) if whitelisted[:color]
      whitelisted[:category_type] = whitelisted[:category_type]&.downcase
    end
  end

  def filter_params
    params.permit(:category_type, :is_active, :search, :is_default)
  end

  def normalize_color(color)
    # Ensure color starts with # and is valid hex
    color = "##{color}" unless color.start_with?('#')
    color.match?(/^#[0-9A-Fa-f]{6}$/) ? color : '#6366f1'
  end
end
```

### 2. Model de Category (Extensão)
```ruby
# app/models/category.rb (extensão do modelo da Tarefa 5.0)
class Category < ApplicationRecord
  belongs_to :user, optional: true # Default categories don't have users
  has_many :transactions, dependent: :restrict_with_error
  has_many :budgets, dependent: :restrict_with_error

  validates :name, presence: true, length: { maximum: 100 }
  validates :color, presence: true, format: { with: /\A#[0-9A-Fa-f]{6}\z/ }
  validates :category_type, inclusion: { in: %w[income expense] }
  validates :name, uniqueness: { scope: :user_id, case_sensitive: false }

  scope :active, -> { where(is_active: true) }
  scope :inactive, -> { where(is_active: false) }
  scope :default_categories, -> { where(is_default: true, user_id: nil) }
  scope :user_categories, ->(user) { where(user: user, is_default: false) }
  scope :by_type, ->(type) { where(category_type: type) if type.present? }
  scope :search, ->(term) { where('name ILIKE ?', "%#{term}%") if term.present? }

  # Class method to get all available categories for a user
  def self.available_for_user(user)
    default_categories.or(user_categories(user)).active
  end

  # Scope for filtering by parameters
  scope :filter_by_params, ->(params) {
    scope = all
    scope = scope.by_type(params[:category_type]) if params[:category_type].present?
    scope = scope.search(params[:search]) if params[:search].present?
    scope = scope.where(is_default: params[:is_default]) if params[:is_default].present?
    scope = scope.where(is_active: params[:is_active]) if params[:is_active].present?
    scope
  }

  def transactions_count
    transactions.count
  end

  def total_amount_this_month
    start_date = Date.current.beginning_of_month
    end_date = Date.current.end_of_month

    transactions.where(date: start_date..end_date).sum(:amount)
  end

  def can_be_deleted?
    !is_default? && transactions.empty?
  end
end

# Extension for User model
class User < ApplicationRecord
  def available_categories
    Category.available_for_user(self)
  end
end
```

### 3. Serializer de Category
```ruby
# app/serializers/category_serializer.rb
class CategorySerializer < ActiveModel::Serializer
  attributes :id, :name, :color, :icon, :category_type, :is_default,
             :is_active, :created_at, :updated_at, :usage_stats

  def usage_stats
    {
      transactions_count: object.transactions_count,
      total_amount_current_month: object.total_amount_this_month,
      can_be_deleted: object.can_be_deleted?
    }
  end
end
```

### 4. Service de Estatísticas
```ruby
# app/services/category_statistics_service.rb
class CategoryStatisticsService
  def initialize(user, params = {})
    @user = user
    @params = params
    @start_date = parse_date(@params[:start_date]) || 6.months.ago.beginning_of_month
    @end_date = parse_date(@params[:end_date]) || Date.current.end_of_month
  end

  def call
    {
      summary: category_summary,
      top_categories: top_categories_by_amount,
      monthly_breakdown: monthly_breakdown,
      category_trends: category_trends
    }
  end

  private

  def category_summary
    categories = @user.available_categories.includes(:transactions)

    {
      total_categories: categories.count,
      active_categories: categories.active.count,
      categories_with_transactions: categories.joins(:transactions).distinct.count,
      unused_categories: categories.left_joins(:transactions)
                                  .where(transactions: { id: nil }).count
    }
  end

  def top_categories_by_amount
    @user.transactions
         .joins(:category)
         .where(date: @start_date..@end_date)
         .group('categories.name', 'categories.color', 'categories.id')
         .sum(:amount)
         .map do |category_info, amount|
           {
             id: category_info[2],
             name: category_info[0],
             color: category_info[1],
             total_amount: amount.abs,
             transactions_count: transaction_counts_by_category[category_info[2]] || 0
           }
         end
         .sort_by { |cat| -cat[:total_amount] }
         .first(10)
  end

  def monthly_breakdown
    @user.transactions
         .joins(:category)
         .where(date: @start_date..@end_date)
         .group('categories.name')
         .group_by_month(:date, format: '%Y-%m')
         .sum(:amount)
         .group_by { |key, value| key[0] } # Group by category name
         .transform_values do |monthly_data|
           monthly_data.map { |date_cat, amount| [date_cat[1], amount] }.to_h
         end
  end

  def category_trends
    # Calculate growth/decline trends for each category
    current_period = @user.transactions
                          .joins(:category)
                          .where(date: (@end_date - 1.month)..@end_date)
                          .group('categories.name', 'categories.id')
                          .sum(:amount)

    previous_period = @user.transactions
                           .joins(:category)
                           .where(date: (@end_date - 2.months)..(@end_date - 1.month))
                           .group('categories.name', 'categories.id')
                           .sum(:amount)

    trends = {}
    current_period.each do |(cat_name, cat_id), current_amount|
      previous_amount = previous_period.find { |key, _| key[1] == cat_id }&.last || 0

      if previous_amount > 0
        change_percent = ((current_amount - previous_amount) / previous_amount.abs * 100).round(1)
      else
        change_percent = current_amount > 0 ? 100.0 : 0.0
      end

      trends[cat_name] = {
        id: cat_id,
        current_amount: current_amount.abs,
        previous_amount: previous_amount.abs,
        change_percent: change_percent,
        trend: change_percent > 5 ? 'increasing' : (change_percent < -5 ? 'decreasing' : 'stable')
      }
    end

    trends
  end

  def transaction_counts_by_category
    @transaction_counts ||= @user.transactions
                                 .where(date: @start_date..@end_date)
                                 .group(:category_id)
                                 .count
  end

  def parse_date(date_string)
    Date.parse(date_string) if date_string.present?
  rescue Date::Error
    nil
  end
end
```

### 5. Seeds para Categorias Padrão
```ruby
# db/seeds/categories.rb
# Default categories for the system
default_categories = [
  # Expense Categories
  { name: 'Alimentação', color: '#ef4444', icon: 'utensils', category_type: 'expense' },
  { name: 'Transporte', color: '#3b82f6', icon: 'car', category_type: 'expense' },
  { name: 'Saúde', color: '#10b981', icon: 'heart', category_type: 'expense' },
  { name: 'Educação', color: '#8b5cf6', icon: 'graduation-cap', category_type: 'expense' },
  { name: 'Lazer', color: '#f59e0b', icon: 'gamepad-2', category_type: 'expense' },
  { name: 'Moradia', color: '#6b7280', icon: 'home', category_type: 'expense' },
  { name: 'Roupas', color: '#ec4899', icon: 'shirt', category_type: 'expense' },
  { name: 'Tecnologia', color: '#06b6d4', icon: 'smartphone', category_type: 'expense' },
  { name: 'Beleza', color: '#f97316', icon: 'sparkles', category_type: 'expense' },
  { name: 'Animais', color: '#84cc16', icon: 'dog', category_type: 'expense' },
  { name: 'Impostos', color: '#dc2626', icon: 'receipt', category_type: 'expense' },
  { name: 'Seguros', color: '#7c3aed', icon: 'shield', category_type: 'expense' },
  { name: 'Outros Gastos', color: '#6b7280', icon: 'more-horizontal', category_type: 'expense' },

  # Income Categories
  { name: 'Salário', color: '#10b981', icon: 'briefcase', category_type: 'income' },
  { name: 'Freelance', color: '#3b82f6', icon: 'laptop', category_type: 'income' },
  { name: 'Investimentos', color: '#8b5cf6', icon: 'trending-up', category_type: 'income' },
  { name: 'Vendas', color: '#f59e0b', icon: 'shopping-bag', category_type: 'income' },
  { name: 'Prêmios', color: '#ec4899', icon: 'gift', category_type: 'income' },
  { name: 'Restituição', color: '#06b6d4', icon: 'refresh-cw', category_type: 'income' },
  { name: 'Outras Receitas', color: '#6b7280', icon: 'plus', category_type: 'income' }
]

puts "Creating default categories..."

default_categories.each do |cat_attrs|
  category = Category.find_or_create_by(
    name: cat_attrs[:name],
    category_type: cat_attrs[:category_type],
    is_default: true,
    user_id: nil
  ) do |cat|
    cat.color = cat_attrs[:color]
    cat.icon = cat_attrs[:icon]
    cat.is_active = true
  end

  if category.persisted?
    puts "✓ Created category: #{category.name}"
  else
    puts "✗ Failed to create category: #{cat_attrs[:name]} - #{category.errors.full_messages.join(', ')}"
  end
end

puts "Default categories setup completed!"
```

### 6. Routes Configuration
```ruby
# config/routes.rb (extension)
Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :categories do
        member do
          get :transactions
        end
        collection do
          get :statistics
        end
      end
    end
  end
end
```

### 7. Testes RSpec
```ruby
# spec/requests/api/v1/categories_spec.rb
RSpec.describe 'Api::V1::Categories', type: :request do
  let(:user) { create(:user) }
  let(:auth_headers) { { 'Authorization' => "Bearer #{jwt_token(user)}" } }

  describe 'GET /api/v1/categories' do
    let!(:default_category) { create(:category, :default, name: 'Alimentação') }
    let!(:user_category) { create(:category, user: user, name: 'Categoria Pessoal') }

    it 'returns user available categories' do
      get '/api/v1/categories', headers: auth_headers

      expect(response).to have_http_status(:ok)
      expect(json_response['data'].size).to eq(2)

      category_names = json_response['data'].map { |cat| cat['name'] }
      expect(category_names).to include('Alimentação', 'Categoria Pessoal')
    end

    it 'filters by category type' do
      expense_category = create(:category, :default, category_type: 'expense')
      income_category = create(:category, :default, category_type: 'income')

      get '/api/v1/categories', params: { category_type: 'expense' }, headers: auth_headers

      expect(response).to have_http_status(:ok)
      returned_types = json_response['data'].map { |cat| cat['category_type'] }.uniq
      expect(returned_types).to eq(['expense'])
    end
  end

  describe 'POST /api/v1/categories' do
    let(:category_params) do
      {
        category: {
          name: 'Nova Categoria',
          color: '#ff0000',
          icon: 'star',
          category_type: 'expense'
        }
      }
    end

    it 'creates a new category' do
      expect {
        post '/api/v1/categories', params: category_params, headers: auth_headers
      }.to change(user.categories, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(json_response['data']['name']).to eq('Nova Categoria')
      expect(json_response['data']['is_default']).to be_falsey
    end

    it 'validates required fields' do
      category_params[:category][:name] = ''

      post '/api/v1/categories', params: category_params, headers: auth_headers

      expect(response).to have_http_status(:unprocessable_entity)
      expect(json_response['errors']).to be_present
    end
  end

  describe 'DELETE /api/v1/categories/:id' do
    it 'deletes user category' do
      category = create(:category, user: user)

      expect {
        delete "/api/v1/categories/#{category.id}", headers: auth_headers
      }.to change(Category, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end

    it 'prevents deletion of default categories' do
      category = create(:category, :default)

      delete "/api/v1/categories/#{category.id}", headers: auth_headers

      expect(response).to have_http_status(:forbidden)
      expect(Category.exists?(category.id)).to be_truthy
    end

    it 'prevents deletion of categories with transactions' do
      category = create(:category, user: user)
      create(:transaction, user: user, category: category)

      delete "/api/v1/categories/#{category.id}", headers: auth_headers

      expect(response).to have_http_status(:unprocessable_entity)
      expect(Category.exists?(category.id)).to be_truthy
    end
  end
end
```

## Critérios de Sucesso
- [ ] API CRUD de categorias funcionando completamente
- [ ] Categorias padrão criadas via seeds
- [ ] Categorias personalizadas por usuário implementadas
- [ ] Validações e regras de negócio aplicadas
- [ ] Filtros e busca operacionais
- [ ] Endpoint de estatísticas funcionando
- [ ] Serializers configurados corretamente
- [ ] Testes com cobertura > 90%
- [ ] Documentação API atualizada
- [ ] Performance otimizada com includes/joins

## Recursos Necessários
- Desenvolvedor backend Rails experiente
- Models da Tarefa 5.0 implementados
- Backend Rails da Tarefa 2.0 configurado

## Tempo Estimado
- Controller e endpoints básicos: 6-8 horas
- Validações e regras de negócio: 4-5 horas
- Sistema de categorias padrão: 3-4 horas
- Service de estatísticas: 4-6 horas
- Serializers e formatação: 2-3 horas
- Testes completos: 6-8 horas
- **Total**: 4-5 dias de trabalho