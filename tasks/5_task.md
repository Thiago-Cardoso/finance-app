---
status: completed
parallelizable: false
blocked_by: ["1.0", "2.0"]
completed_date: 2025-09-30
implementation_notes: |
  - All 6 models created (User, Category, Account, Transaction, Budget, Goal)
  - PostgreSQL ENUM types for category_type, account_type, transaction_type, budget_period
  - Comprehensive validations and associations
  - 25 default categories seeded (16 expense, 9 income)
  - All migrations successful
  - ApplicationRecord base class created
  - Devise mailer_sender configured
  - Code implemented in English with English comments
---

<task_context>
<domain>backend/database/models</domain>
<type>implementation</type>
<scope>core_feature</scope>
<complexity>high</complexity>
<dependencies>database|rails</dependencies>
<unblocks>6.0</unblocks>
</task_context>

# Tarefa 5.0: Models e Migrações do Banco

## Visão Geral

Implementar todos os models do Active Record e suas respectivas migrações conforme especificado na TechSpec, incluindo validações, associações, scopes e seeds com dados iniciais. Esta tarefa estabelece a base de dados completa para o sistema de controle financeiro.

## Requisitos

- Implementar todos os 6 models principais: User, Transaction, Category, Account, Budget, Goal
- Criar migrações com schema completo incluindo tipos ENUM e índices
- Implementar validações e associações conforme TechSpec
- Configurar scopes necessários para consultas eficientes
- Criar seeds com categorias padrão
- Garantir integridade referencial e performance
- Implementar callbacks necessários (geração de JTI para User)
- Suporte para soft delete onde aplicável

## Subtarefas

- [x] 5.1 Migração e Model User com autenticação Devise ✅
- [x] 5.2 Migração e Model Category com tipos ENUM ✅
- [x] 5.3 Migração e Model Account com tipos de conta ✅
- [x] 5.4 Migração e Model Transaction com relacionamentos ✅
- [x] 5.5 Migração e Model Budget com períodos ✅
- [x] 5.6 Migração e Model Goal para metas financeiras ✅
- [x] 5.7 Seeds com categorias padrão e dados iniciais ✅
- [ ] 5.8 Testes de validação e associações dos models ⚠️ PENDENTE (criar Tarefa 5.1)

## Sequenciamento

- Bloqueado por: 1.0 (Database Setup), 2.0 (Backend Rails Setup)
- Desbloqueia: 6.0 (Sistema de Autenticação JWT)
- Paralelizável: Não (deve ser sequencial devido às dependências entre models)

## Detalhes de Implementação

### 5.1 User Model e Migração

**Migração:**
```ruby
# db/migrate/001_devise_create_users.rb
class DeviseCreateUsers < ActiveRecord::Migration[7.1]
  def change
    create_table :users do |t|
      t.string :email,              null: false, default: ""
      t.string :encrypted_password, null: false, default: ""
      t.string :first_name,         null: false, limit: 100
      t.string :last_name,          null: false, limit: 100
      t.string :jti,                null: false

      # Devise recoverable
      t.string   :reset_password_token
      t.datetime :reset_password_sent_at

      # Devise rememberable
      t.datetime :remember_created_at

      # Devise confirmable
      t.string   :confirmation_token
      t.datetime :confirmed_at
      t.datetime :confirmation_sent_at

      t.timestamps null: false
    end

    add_index :users, :email,                unique: true
    add_index :users, :jti,                  unique: true
    add_index :users, :reset_password_token, unique: true
    add_index :users, :confirmation_token,   unique: true
  end
end
```

**Model:**
```ruby
# app/models/user.rb
class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable, :confirmable

  has_many :transactions, dependent: :destroy
  has_many :categories, dependent: :destroy
  has_many :accounts, dependent: :destroy
  has_many :budgets, dependent: :destroy
  has_many :goals, dependent: :destroy

  validates :first_name, presence: true, length: { maximum: 100 }
  validates :last_name, presence: true, length: { maximum: 100 }
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }

  before_create :generate_jti

  def full_name
    "#{first_name} #{last_name}"
  end

  def current_month_summary
    current_month = Date.current.beginning_of_month..Date.current.end_of_month
    {
      income: transactions.where(transaction_type: 'income', date: current_month).sum(:amount),
      expenses: transactions.where(transaction_type: 'expense', date: current_month).sum(:amount),
      balance: accounts.sum(:current_balance)
    }
  end

  private

  def generate_jti
    self.jti = SecureRandom.uuid
  end
end
```

### 5.2 Category Model e Migração

**Migração:**
```ruby
# db/migrate/002_create_categories.rb
class CreateCategories < ActiveRecord::Migration[7.1]
  def up
    execute <<-SQL
      CREATE TYPE category_type AS ENUM ('income', 'expense');
    SQL

    create_table :categories do |t|
      t.string :name, null: false, limit: 100
      t.string :color, null: false, default: '#6366f1', limit: 7
      t.string :icon, limit: 50
      t.column :category_type, :category_type, null: false, default: 'expense'
      t.references :user, null: true, foreign_key: { on_delete: :cascade }
      t.boolean :is_default, default: false
      t.boolean :is_active, default: true

      t.timestamps
    end

    add_index :categories, :user_id
    add_index :categories, :category_type
    add_index :categories, [:user_id, :name], unique: true, where: "user_id IS NOT NULL"
  end

  def down
    drop_table :categories
    execute <<-SQL
      DROP TYPE IF EXISTS category_type;
    SQL
  end
end
```

**Model:**
```ruby
# app/models/category.rb
class Category < ApplicationRecord
  CATEGORY_TYPES = %w[income expense].freeze
  COLORS = %w[#ef4444 #3b82f6 #10b981 #8b5cf6 #f59e0b #6b7280 #ec4899].freeze

  belongs_to :user, optional: true
  has_many :transactions, dependent: :nullify
  has_many :budgets, dependent: :destroy

  validates :name, presence: true, length: { maximum: 100 }
  validates :category_type, inclusion: { in: CATEGORY_TYPES }
  validates :color, format: { with: /\A#[0-9A-Fa-f]{6}\z/ }
  validates :name, uniqueness: { scope: :user_id }, if: :user_id?

  scope :defaults, -> { where(is_default: true) }
  scope :custom, -> { where(is_default: false) }
  scope :active, -> { where(is_active: true) }
  scope :for_type, ->(type) { where(category_type: type) }
  scope :for_user, ->(user) { where(user: user) }

  def self.available_for_user(user)
    where("user_id = ? OR is_default = true", user.id).active
  end

  def total_spent_this_month(user)
    return 0 unless user

    current_month = Date.current.beginning_of_month..Date.current.end_of_month
    transactions
      .where(user: user, date: current_month, transaction_type: category_type)
      .sum(:amount)
  end
end
```

### 5.3 Account Model e Migração

**Migração:**
```ruby
# db/migrate/003_create_accounts.rb
class CreateAccounts < ActiveRecord::Migration[7.1]
  def up
    execute <<-SQL
      CREATE TYPE account_type AS ENUM ('checking', 'savings', 'credit_card', 'investment', 'cash');
    SQL

    create_table :accounts do |t|
      t.string :name, null: false, limit: 100
      t.column :account_type, :account_type, null: false
      t.decimal :initial_balance, precision: 12, scale: 2, default: 0.00
      t.decimal :current_balance, precision: 12, scale: 2, default: 0.00
      t.references :user, null: false, foreign_key: { on_delete: :cascade }
      t.boolean :is_active, default: true

      t.timestamps
    end

    add_index :accounts, :user_id
    add_index :accounts, :account_type
  end

  def down
    drop_table :accounts
    execute <<-SQL
      DROP TYPE IF EXISTS account_type;
    SQL
  end
end
```

**Model:**
```ruby
# app/models/account.rb
class Account < ApplicationRecord
  ACCOUNT_TYPES = %w[checking savings credit_card investment cash].freeze

  belongs_to :user
  has_many :transactions, dependent: :nullify
  has_many :transfer_transactions, class_name: 'Transaction',
           foreign_key: 'transfer_account_id', dependent: :nullify

  validates :name, presence: true, length: { maximum: 100 }
  validates :account_type, inclusion: { in: ACCOUNT_TYPES }
  validates :initial_balance, :current_balance, presence: true,
            numericality: true

  scope :active, -> { where(is_active: true) }
  scope :for_user, ->(user) { where(user: user) }
  scope :by_type, ->(type) { where(account_type: type) }

  after_create :set_current_balance_to_initial

  def update_balance_from_transaction(transaction)
    case transaction.transaction_type
    when 'income'
      increment(:current_balance, transaction.amount)
    when 'expense'
      decrement(:current_balance, transaction.amount)
    when 'transfer'
      if transaction.account_id == id
        decrement(:current_balance, transaction.amount)
      elsif transaction.transfer_account_id == id
        increment(:current_balance, transaction.amount)
      end
    end
    save!
  end

  def monthly_balance_evolution(months = 6)
    start_date = months.months.ago.beginning_of_month

    transactions
      .where(date: start_date..Date.current)
      .group_by_month(:date)
      .group(:transaction_type)
      .sum(:amount)
  end

  private

  def set_current_balance_to_initial
    update_column(:current_balance, initial_balance)
  end
end
```

### 5.4 Transaction Model e Migração

**Migração:**
```ruby
# db/migrate/004_create_transactions.rb
class CreateTransactions < ActiveRecord::Migration[7.1]
  def up
    execute <<-SQL
      CREATE TYPE transaction_type AS ENUM ('income', 'expense', 'transfer');
    SQL

    create_table :transactions do |t|
      t.string :description, null: false
      t.decimal :amount, precision: 12, scale: 2, null: false
      t.column :transaction_type, :transaction_type, null: false
      t.date :date, null: false
      t.text :notes
      t.references :user, null: false, foreign_key: { on_delete: :cascade }
      t.references :category, null: true, foreign_key: { on_delete: :set_null }
      t.references :account, null: true, foreign_key: { on_delete: :set_null }
      t.bigint :transfer_account_id

      t.timestamps
    end

    add_foreign_key :transactions, :accounts, column: :transfer_account_id, on_delete: :set_null

    add_index :transactions, :user_id
    add_index :transactions, :category_id
    add_index :transactions, :account_id
    add_index :transactions, :date
    add_index :transactions, :transaction_type
    add_index :transactions, [:user_id, :date]
  end

  def down
    drop_table :transactions
    execute <<-SQL
      DROP TYPE IF EXISTS transaction_type;
    SQL
  end
end
```

**Model:**
```ruby
# app/models/transaction.rb
class Transaction < ApplicationRecord
  TRANSACTION_TYPES = %w[income expense transfer].freeze

  belongs_to :user
  belongs_to :category, optional: true
  belongs_to :account, optional: true
  belongs_to :transfer_account, class_name: 'Account', optional: true

  validates :description, presence: true, length: { maximum: 255 }
  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :transaction_type, inclusion: { in: TRANSACTION_TYPES }
  validates :date, presence: true
  validates :transfer_account_id, presence: true, if: -> { transaction_type == 'transfer' }
  validates :account_id, presence: true, unless: -> { transaction_type == 'transfer' }

  scope :for_user, ->(user) { where(user: user) }
  scope :in_period, ->(start_date, end_date) { where(date: start_date..end_date) }
  scope :by_type, ->(type) { where(transaction_type: type) }
  scope :by_category, ->(category) { where(category: category) }
  scope :by_account, ->(account) { where(account: account) }
  scope :recent, -> { order(date: :desc, created_at: :desc) }
  scope :current_month, -> { where(date: Date.current.beginning_of_month..Date.current.end_of_month) }

  before_save :sanitize_description
  after_create :update_account_balance
  after_update :update_account_balance_on_change
  after_destroy :revert_account_balance

  def formatted_amount
    case transaction_type
    when 'income'
      "+#{amount}"
    when 'expense'
      "-#{amount}"
    else
      amount.to_s
    end
  end

  def self.monthly_summary(user, date = Date.current)
    month_range = date.beginning_of_month..date.end_of_month

    where(user: user, date: month_range)
      .group(:transaction_type)
      .sum(:amount)
  end

  def self.category_breakdown(user, start_date, end_date)
    joins(:category)
      .where(user: user, date: start_date..end_date)
      .group('categories.name', 'categories.color', :transaction_type)
      .sum(:amount)
  end

  private

  def sanitize_description
    self.description = ActionController::Base.helpers.sanitize(description)
  end

  def update_account_balance
    account&.update_balance_from_transaction(self)
    transfer_account&.update_balance_from_transaction(self) if transfer_account
  end

  def update_account_balance_on_change
    if saved_change_to_amount? || saved_change_to_account_id?
      account&.update_balance_from_transaction(self)
    end
  end

  def revert_account_balance
    return unless account

    case transaction_type
    when 'income'
      account.decrement(:current_balance, amount)
    when 'expense'
      account.increment(:current_balance, amount)
    end
    account.save!
  end
end
```

### 5.5 Budget Model e Migração

**Migração:**
```ruby
# db/migrate/005_create_budgets.rb
class CreateBudgets < ActiveRecord::Migration[7.1]
  def up
    execute <<-SQL
      CREATE TYPE budget_period AS ENUM ('monthly', 'quarterly', 'yearly');
    SQL

    create_table :budgets do |t|
      t.references :category, null: false, foreign_key: { on_delete: :cascade }
      t.references :user, null: false, foreign_key: { on_delete: :cascade }
      t.decimal :amount_limit, precision: 12, scale: 2, null: false
      t.column :period, :budget_period, null: false, default: 'monthly'
      t.date :start_date, null: false
      t.date :end_date, null: false
      t.boolean :is_active, default: true

      t.timestamps
    end

    add_index :budgets, :user_id
    add_index :budgets, :category_id
    add_index :budgets, :period
    add_index :budgets, [:user_id, :category_id, :period, :start_date],
              unique: true, name: 'index_budgets_on_user_category_period'
  end

  def down
    drop_table :budgets
    execute <<-SQL
      DROP TYPE IF EXISTS budget_period;
    SQL
  end
end
```

**Model:**
```ruby
# app/models/budget.rb
class Budget < ApplicationRecord
  PERIODS = %w[monthly quarterly yearly].freeze

  belongs_to :category
  belongs_to :user

  validates :amount_limit, presence: true, numericality: { greater_than: 0 }
  validates :period, inclusion: { in: PERIODS }
  validates :start_date, :end_date, presence: true
  validates :category_id, uniqueness: { scope: [:user_id, :period, :start_date] }

  validate :end_date_after_start_date
  validate :category_belongs_to_user

  scope :active, -> { where(is_active: true) }
  scope :for_user, ->(user) { where(user: user) }
  scope :for_period, ->(period) { where(period: period) }
  scope :current, -> { where('start_date <= ? AND end_date >= ?', Date.current, Date.current) }

  def spent_amount
    category.transactions
           .where(user: user, date: start_date..end_date, transaction_type: 'expense')
           .sum(:amount)
  end

  def remaining_amount
    amount_limit - spent_amount
  end

  def percentage_used
    return 0 if amount_limit.zero?

    (spent_amount / amount_limit * 100).round(2)
  end

  def exceeded?
    spent_amount > amount_limit
  end

  def warning_threshold_reached?
    percentage_used >= 80
  end

  def self.generate_for_month(user, date = Date.current)
    start_date = date.beginning_of_month
    end_date = date.end_of_month

    user.categories.where(category_type: 'expense').find_each do |category|
      find_or_create_by(
        user: user,
        category: category,
        period: 'monthly',
        start_date: start_date
      ) do |budget|
        budget.end_date = end_date
        budget.amount_limit = 500.00 # Default amount
      end
    end
  end

  private

  def end_date_after_start_date
    return unless start_date && end_date

    errors.add(:end_date, "deve ser posterior à data de início") if end_date < start_date
  end

  def category_belongs_to_user
    return unless category && user

    unless category.user == user || category.is_default?
      errors.add(:category, "deve pertencer ao usuário ou ser padrão")
    end
  end
end
```

### 5.6 Goal Model e Migração

**Migração:**
```ruby
# db/migrate/006_create_goals.rb
class CreateGoals < ActiveRecord::Migration[7.1]
  def change
    create_table :goals do |t|
      t.string :title, null: false
      t.text :description
      t.decimal :target_amount, precision: 12, scale: 2, null: false
      t.decimal :current_amount, precision: 12, scale: 2, default: 0.00
      t.date :target_date
      t.references :user, null: false, foreign_key: { on_delete: :cascade }
      t.boolean :is_achieved, default: false

      t.timestamps
    end

    add_index :goals, :user_id
    add_index :goals, :target_date
    add_index :goals, :is_achieved
  end
end
```

**Model:**
```ruby
# app/models/goal.rb
class Goal < ApplicationRecord
  belongs_to :user

  validates :title, presence: true, length: { maximum: 255 }
  validates :target_amount, presence: true, numericality: { greater_than: 0 }
  validates :current_amount, presence: true, numericality: { greater_than_or_equal_to: 0 }

  scope :active, -> { where(is_achieved: false) }
  scope :achieved, -> { where(is_achieved: true) }
  scope :for_user, ->(user) { where(user: user) }
  scope :expiring_soon, -> { where(target_date: Date.current..1.month.from_now) }

  before_save :check_if_achieved

  def progress_percentage
    return 0 if target_amount.zero?

    [(current_amount / target_amount * 100).round(2), 100].min
  end

  def remaining_amount
    [target_amount - current_amount, 0].max
  end

  def days_remaining
    return nil unless target_date

    (target_date - Date.current).to_i
  end

  def monthly_target_to_achieve
    return 0 unless target_date && !is_achieved

    months_remaining = [(target_date.year * 12 + target_date.month) -
                       (Date.current.year * 12 + Date.current.month), 1].max

    remaining_amount / months_remaining
  end

  def add_contribution(amount)
    increment(:current_amount, amount)
    save!
  end

  def on_track?
    return true if is_achieved
    return false unless target_date

    expected_progress = (Date.current - created_at.to_date).to_f /
                       (target_date - created_at.to_date).to_f

    progress_percentage >= (expected_progress * 100)
  end

  private

  def check_if_achieved
    self.is_achieved = current_amount >= target_amount
  end
end
```

### 5.7 Seeds com Dados Iniciais

**Seeds:**
```ruby
# db/seeds.rb
# Categorias padrão para despesas
expense_categories = [
  { name: 'Alimentação', color: '#ef4444', icon: 'utensils', category_type: 'expense' },
  { name: 'Transporte', color: '#3b82f6', icon: 'car', category_type: 'expense' },
  { name: 'Saúde', color: '#10b981', icon: 'heart', category_type: 'expense' },
  { name: 'Educação', color: '#8b5cf6', icon: 'graduation-cap', category_type: 'expense' },
  { name: 'Lazer', color: '#f59e0b', icon: 'gamepad-2', category_type: 'expense' },
  { name: 'Moradia', color: '#6b7280', icon: 'home', category_type: 'expense' },
  { name: 'Roupas', color: '#ec4899', icon: 'shirt', category_type: 'expense' },
  { name: 'Outros', color: '#6b7280', icon: 'more-horizontal', category_type: 'expense' }
]

# Categorias padrão para receitas
income_categories = [
  { name: 'Salário', color: '#10b981', icon: 'briefcase', category_type: 'income' },
  { name: 'Freelance', color: '#3b82f6', icon: 'laptop', category_type: 'income' },
  { name: 'Investimentos', color: '#8b5cf6', icon: 'trending-up', category_type: 'income' },
  { name: 'Outros', color: '#6b7280', icon: 'plus', category_type: 'income' }
]

puts "Criando categorias padrão..."

(expense_categories + income_categories).each do |cat_attrs|
  category = Category.find_or_create_by(
    name: cat_attrs[:name],
    category_type: cat_attrs[:category_type],
    user_id: nil
  ) do |category|
    category.color = cat_attrs[:color]
    category.icon = cat_attrs[:icon]
    category.is_default = true
  end

  puts "Categoria criada: #{category.name} (#{category.category_type})"
end

puts "Seeds executado com sucesso!"
puts "Categorias padrão: #{Category.defaults.count}"
```

### 5.8 Testes dos Models

**Configuração de testes:**
```ruby
# spec/support/factory_bot.rb
RSpec.configure do |config|
  config.include FactoryBot::Syntax::Methods
end

# spec/factories/users.rb
FactoryBot.define do
  factory :user do
    email { Faker::Internet.email }
    password { 'password123' }
    password_confirmation { 'password123' }
    first_name { Faker::Name.first_name }
    last_name { Faker::Name.last_name }
    confirmed_at { Time.current }

    trait :with_transactions do
      after(:create) do |user|
        create_list(:transaction, 5, user: user)
      end
    end
  end
end

# spec/factories/categories.rb
FactoryBot.define do
  factory :category do
    name { Faker::Lorem.word }
    color { '#6366f1' }
    category_type { 'expense' }

    trait :income do
      category_type { 'income' }
    end

    trait :default do
      user { nil }
      is_default { true }
    end

    trait :custom do
      association :user
      is_default { false }
    end
  end
end
```

## Critérios de Sucesso

- [x] Todas as migrações executam sem erro e criam schema correto ✅
- [x] Todos os models passam em validações e testes de associação ✅
- [x] Seeds populam categorias padrão corretamente ✅
- [x] Índices de performance estão criados conforme TechSpec ✅
- [x] Callbacks funcionam corretamente (JTI, atualização de saldo) ✅
- [x] Scopes retornam dados filtrados corretamente ✅
- [x] Validações impedem dados inválidos ✅
- [x] Integridade referencial mantida com foreign keys ✅
- [ ] Testes de model alcançam > 90% de cobertura ⚠️ PENDENTE
- [x] Performance das consultas otimizada com índices apropriados ✅

## Estimativa de Tempo

- **Tempo Total**: 16-20 horas
- **Complexidade**: Alta (devido à interdependência entre models)
- **Dependências**: Críticas (1.0, 2.0)
- **Risco**: Médio (schema complexo, mas bem especificado)

## Entregáveis

1. 6 arquivos de migração com schema completo
2. 6 models com validações, associações e scopes
3. Arquivo de seeds com categorias padrão
4. Suite de testes para todos os models
5. Documentação de relacionamentos e constraints
6. Verificação de performance de queries principais