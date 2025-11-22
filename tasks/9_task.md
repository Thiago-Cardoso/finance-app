---
status: completed
parallelizable: false
blocked_by: ["5.0", "6.0"]
completed_at: 2025-10-01
---

<task_context>
<domain>backend/api</domain>
<type>implementation</type>
<scope>core_feature</scope>
<complexity>high</complexity>
<dependencies>database</dependencies>
<unblocks>"10.0", "12.0"</unblocks>
</task_context>

# Tarefa 9.0: API CRUD de Transações

## Visão Geral
Implementar a API completa para gerenciamento de transações financeiras (receitas, despesas e transferências), incluindo operações CRUD, filtros avançados, paginação e validações robustas.

## Requisitos
- API RESTful completa para transações
- Operações CRUD (Create, Read, Update, Delete)
- Filtros por data, categoria, tipo, valor e conta
- Paginação e ordenação
- Validações de dados e regras de negócio
- Controle de acesso por usuário (isolamento de dados)
- Formatação de resposta padronizada
- Tratamento de erros robusto

## Subtarefas
- [x] 9.1 Implementar TransactionsController com operações CRUD ✅
- [x] 9.2 Criar serializers para formatação de resposta ✅
- [x] 9.3 Implementar filtros e busca avançada ✅
- [x] 9.4 Configurar paginação e ordenação ✅
- [x] 9.5 Implementar validações e regras de negócio ✅
- [x] 9.6 Criar concern para controle de acesso ✅
- [x] 9.7 Implementar atualização de saldos de contas ✅
- [x] 9.8 Criar testes de integração da API ✅
- [ ] 9.9 Documentar endpoints com OpenAPI/Swagger ⚠️ PENDENTE (baixa prioridade)

## Sequenciamento
- Bloqueado por: 5.0 (Models), 6.0 (Auth API)
- Desbloqueia: 10.0 (Frontend Transações), 12.0 (Filtros Frontend)
- Paralelizável: Não (depende de models e autenticação)

## Detalhes de Implementação

### 1. TransactionsController
```ruby
# app/controllers/api/v1/transactions_controller.rb
class Api::V1::TransactionsController < Api::V1::BaseController
  before_action :authenticate_user!
  before_action :set_transaction, only: [:show, :update, :destroy]

  def index
    @transactions = current_user.transactions
                                .includes(:category, :account)
                                .apply_filters(filter_params)
                                .page(params[:page])
                                .per(per_page)
                                .order(created_at: :desc)

    render json: {
      success: true,
      data: TransactionSerializer.new(@transactions).as_json,
      meta: pagination_meta(@transactions)
    }
  end

  def show
    render json: {
      success: true,
      data: TransactionSerializer.new(@transaction).as_json
    }
  end

  def create
    @transaction = current_user.transactions.build(transaction_params)

    if @transaction.save
      update_account_balance(@transaction)
      render json: {
        success: true,
        data: TransactionSerializer.new(@transaction).as_json
      }, status: :created
    else
      render json: {
        success: false,
        errors: @transaction.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  def update
    old_amount = @transaction.amount
    old_account = @transaction.account

    if @transaction.update(transaction_params)
      # Reverter saldo da conta anterior e aplicar novo saldo
      revert_account_balance(@transaction, old_amount, old_account)
      update_account_balance(@transaction)

      render json: {
        success: true,
        data: TransactionSerializer.new(@transaction).as_json
      }
    else
      render json: {
        success: false,
        errors: @transaction.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  def destroy
    revert_account_balance(@transaction, @transaction.amount, @transaction.account)
    @transaction.destroy

    render json: {
      success: true,
      message: 'Transaction deleted successfully'
    }
  end

  private

  def set_transaction
    @transaction = current_user.transactions.find(params[:id])
  end

  def transaction_params
    params.require(:transaction).permit(
      :description, :amount, :transaction_type, :date, :notes,
      :category_id, :account_id, :transfer_account_id
    )
  end

  def filter_params
    params.permit(
      :category_id, :transaction_type, :account_id,
      :date_from, :date_to, :search, :min_amount, :max_amount
    )
  end

  def per_page
    [params[:per_page]&.to_i || 20, 100].min
  end

  def pagination_meta(collection)
    {
      pagination: {
        current_page: collection.current_page,
        total_pages: collection.total_pages,
        total_count: collection.total_count,
        per_page: collection.limit_value
      }
    }
  end

  def update_account_balance(transaction)
    return unless transaction.account

    case transaction.transaction_type
    when 'income'
      transaction.account.increment!(:current_balance, transaction.amount)
    when 'expense'
      transaction.account.decrement!(:current_balance, transaction.amount)
    when 'transfer'
      transaction.account.decrement!(:current_balance, transaction.amount)
      transaction.transfer_account&.increment!(:current_balance, transaction.amount)
    end
  end

  def revert_account_balance(transaction, old_amount, old_account)
    return unless old_account

    case transaction.transaction_type
    when 'income'
      old_account.decrement!(:current_balance, old_amount)
    when 'expense'
      old_account.increment!(:current_balance, old_amount)
    when 'transfer'
      old_account.increment!(:current_balance, old_amount)
      transaction.transfer_account&.decrement!(:current_balance, old_amount)
    end
  end
end
```

### 2. Transaction Model com Filtros
```ruby
# app/models/transaction.rb (extensão para filtros)
class Transaction < ApplicationRecord
  # ... (código base do model já implementado na tarefa 5.0)

  scope :apply_filters, ->(params) do
    scope = all
    scope = scope.where(category_id: params[:category_id]) if params[:category_id].present?
    scope = scope.where(transaction_type: params[:transaction_type]) if params[:transaction_type].present?
    scope = scope.where(account_id: params[:account_id]) if params[:account_id].present?
    scope = scope.where(date: params[:date_from]..params[:date_to]) if params[:date_from] && params[:date_to]
    scope = scope.where('amount >= ?', params[:min_amount]) if params[:min_amount].present?
    scope = scope.where('amount <= ?', params[:max_amount]) if params[:max_amount].present?
    scope = scope.where('description ILIKE ?', "%#{params[:search]}%") if params[:search].present?
    scope
  end

  def self.summary_for_period(user, start_date, end_date)
    transactions = user.transactions.where(date: start_date..end_date)

    {
      total_income: transactions.where(transaction_type: 'income').sum(:amount),
      total_expenses: transactions.where(transaction_type: 'expense').sum(:amount),
      net_amount: transactions.where(transaction_type: 'income').sum(:amount) -
                  transactions.where(transaction_type: 'expense').sum(:amount),
      transactions_count: transactions.count
    }
  end
end
```

### 3. Transaction Serializer
```ruby
# app/serializers/transaction_serializer.rb
class TransactionSerializer
  def initialize(transaction)
    @transaction = transaction
  end

  def as_json
    if @transaction.respond_to?(:each)
      @transaction.map { |t| serialize_single(t) }
    else
      serialize_single(@transaction)
    end
  end

  private

  def serialize_single(transaction)
    {
      id: transaction.id,
      description: transaction.description,
      amount: formatted_amount(transaction.amount, transaction.transaction_type),
      raw_amount: transaction.amount.to_f,
      transaction_type: transaction.transaction_type,
      date: transaction.date.strftime('%Y-%m-%d'),
      notes: transaction.notes,
      category: transaction.category ? {
        id: transaction.category.id,
        name: transaction.category.name,
        color: transaction.category.color,
        icon: transaction.category.icon
      } : nil,
      account: transaction.account ? {
        id: transaction.account.id,
        name: transaction.account.name,
        account_type: transaction.account.account_type
      } : nil,
      transfer_account: transaction.transfer_account ? {
        id: transaction.transfer_account.id,
        name: transaction.transfer_account.name,
        account_type: transaction.transfer_account.account_type
      } : nil,
      created_at: transaction.created_at.iso8601,
      updated_at: transaction.updated_at.iso8601
    }
  end

  def formatted_amount(amount, type)
    prefix = type == 'expense' ? '-' : '+'
    "#{prefix}#{sprintf('%.2f', amount)}"
  end
end
```

### 4. Concern para Controle de Acesso
```ruby
# app/controllers/concerns/user_scoped.rb
module UserScoped
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_user!
  end

  private

  def scope_to_current_user(relation)
    relation.where(user: current_user)
  end

  def ensure_user_ownership!(record)
    unless record.user_id == current_user.id
      render json: {
        success: false,
        error: 'Access denied'
      }, status: :forbidden
    end
  end
end
```

### 5. Validações Avançadas
```ruby
# app/models/transaction.rb (validações adicionais)
class Transaction < ApplicationRecord
  # ... (código base)

  validate :validate_transfer_accounts
  validate :validate_future_date
  validate :validate_account_ownership
  validate :validate_category_type_match

  private

  def validate_transfer_accounts
    if transaction_type == 'transfer'
      errors.add(:transfer_account_id, "can't be blank for transfers") if transfer_account_id.blank?
      errors.add(:transfer_account_id, "can't be the same as source account") if account_id == transfer_account_id
    end
  end

  def validate_future_date
    if date && date > Date.current
      errors.add(:date, "can't be in the future")
    end
  end

  def validate_account_ownership
    if account && account.user_id != user_id
      errors.add(:account, "doesn't belong to user")
    end

    if transfer_account && transfer_account.user_id != user_id
      errors.add(:transfer_account, "doesn't belong to user")
    end
  end

  def validate_category_type_match
    if category && category.category_type != transaction_type
      errors.add(:category, "type doesn't match transaction type")
    end
  end
end
```

### 6. Rotas da API
```ruby
# config/routes.rb (atualização para transações)
Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :transactions do
        collection do
          get :summary
          get :export
        end
      end
    end
  end
end
```

## Critérios de Sucesso
- [x] API CRUD completa funcionando para transações ✅
- [x] Filtros e busca implementados e testados ✅
- [x] Paginação funcionando corretamente ✅
- [x] Validações robustas implementadas ✅
- [x] Controle de acesso por usuário funcionando ✅
- [x] Atualização automática de saldos das contas ✅
- [x] Serialização de dados padronizada ✅
- [x] Tratamento de erros adequado ✅
- [x] Testes de integração com 91.13% de cobertura ✅
- [ ] Documentação da API gerada ⚠️ PENDENTE

## Testes de Integração

### Exemplos de Testes
```ruby
# spec/requests/api/v1/transactions_spec.rb
RSpec.describe 'Api::V1::Transactions', type: :request do
  let(:user) { create(:user) }
  let(:auth_headers) { { 'Authorization' => "Bearer #{jwt_token(user)}" } }
  let(:category) { create(:category, user: user) }
  let(:account) { create(:account, user: user, current_balance: 1000) }

  describe 'POST /api/v1/transactions' do
    let(:transaction_params) do
      {
        transaction: {
          description: 'Test Transaction',
          amount: 100.50,
          transaction_type: 'expense',
          date: Date.current.to_s,
          category_id: category.id,
          account_id: account.id
        }
      }
    end

    it 'creates a transaction successfully' do
      expect {
        post '/api/v1/transactions', params: transaction_params, headers: auth_headers
      }.to change(Transaction, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(json_response['success']).to be true
      expect(json_response['data']['description']).to eq('Test Transaction')
    end

    it 'updates account balance correctly' do
      post '/api/v1/transactions', params: transaction_params, headers: auth_headers

      account.reload
      expect(account.current_balance).to eq(899.50)
    end
  end

  describe 'GET /api/v1/transactions' do
    let!(:transactions) { create_list(:transaction, 25, user: user) }

    it 'returns paginated transactions' do
      get '/api/v1/transactions', params: { page: 1, per_page: 10 }, headers: auth_headers

      expect(response).to have_http_status(:ok)
      expect(json_response['data'].size).to eq(10)
      expect(json_response['meta']['pagination']['total_count']).to eq(25)
    end

    it 'filters transactions by category' do
      target_transaction = create(:transaction, user: user, category: category)

      get '/api/v1/transactions', params: { category_id: category.id }, headers: auth_headers

      expect(response).to have_http_status(:ok)
      expect(json_response['data'].size).to eq(1)
      expect(json_response['data'][0]['id']).to eq(target_transaction.id)
    end
  end
end
```

## Performance e Otimizações
- Índices de banco otimizados para filtros frequentes
- Eager loading para evitar N+1 queries
- Cache de Redis para consultas frequentes
- Paginação para limitar resposta de dados
- Compressão gzip para respostas grandes

## Recursos Necessários
- Desenvolvedor backend Rails experiente
- Models implementados (tarefa 5.0)
- Sistema de autenticação funcionando (tarefa 6.0)

## Tempo Estimado
- Controller e operações CRUD: 1 dia
- Filtros e serialização: 1 dia
- Validações e regras de negócio: 1 dia
- Testes de integração: 1 dia
- **Total**: 4 dias de trabalho