---
status: partially_completed
parallelizable: true
blocked_by: ["6.0"]
completion_percentage: 70
review_date: 2025-09-30
approval: approved_with_conditions
---

<task_context>
<domain>backend/testing/rspec</domain>
<type>testing</type>
<scope>configuration</scope>
<complexity>medium</complexity>
<dependencies>rails|rspec|database</dependencies>
<unblocks>9.0</unblocks>
</task_context>

# Tarefa 7.0: Setup de Testes Backend

## Visão Geral

Configurar infraestrutura completa de testes para o backend Rails com RSpec, incluindo factories, helpers, coverage com SimpleCov, database cleaner e configurações para TDD/BDD. Esta tarefa estabelece a base para desenvolvimento orientado a testes e qualidade de código.

## Requisitos

- Configurar RSpec como framework de testes principal
- Implementar FactoryBot para factories de dados de teste
- Configurar SimpleCov para cobertura de código (meta: > 80%)
- Setup DatabaseCleaner para limpeza entre testes
- Configurar Shoulda Matchers para validações
- Implementar helpers para autenticação e JSON parsing
- Configurar testes de models, controllers e integração
- Setup de performance testing com Benchmark
- Configurar linting com RuboCop
- Implementar CI/CD ready test configuration

## Subtarefas

- [x] 7.1 Configuração inicial RSpec e gems de teste ✅ COMPLETA (Task 5.1)
- [x] 7.2 Database Cleaner e configuração de ambiente ✅ COMPLETA (Task 5.1)
- [x] 7.3 FactoryBot setup e factories básicas ✅ COMPLETA (Task 5.1)
- [x] 7.4 SimpleCov configuração e thresholds ✅ COMPLETA (Task 5.1)
- [x] 7.5 Shoulda Matchers e helpers de validação ✅ COMPLETA (Task 5.1)
- [x] 7.6 Authentication helpers e test utilities ✅ COMPLETA (Task 6.0)
- [ ] 7.7 Request specs helpers e JSON matchers ⚠️ PENDENTE
- [ ] 7.8 Performance testing setup ⚠️ PENDENTE
- [ ] 7.9 RuboCop configuration para qualidade ⚠️ PENDENTE
- [ ] 7.10 CI/CD test configuration e scripts ⚠️ PENDENTE

## Sequenciamento

- Bloqueado por: 6.0 (Sistema de Autenticação)
- Desbloqueia: 9.0 (API CRUD de Transações)
- Paralelizável: Sim (pode executar em paralelo com outras tarefas após dependências)

## Detalhes de Implementação

### 7.1 Configuração RSpec e Gems

**Gemfile (grupo :test):**
```ruby
# Gemfile
group :development, :test do
  gem 'rspec-rails', '~> 6.0'
  gem 'factory_bot_rails', '~> 6.2'
  gem 'faker', '~> 3.2'
  gem 'shoulda-matchers', '~> 5.3'
  gem 'database_cleaner-active_record', '~> 2.1'
  gem 'simplecov', '~> 0.22', require: false
  gem 'simplecov-html', require: false
  gem 'webmock', '~> 3.18'
  gem 'vcr', '~> 6.1'
  gem 'timecop', '~> 0.9'
  gem 'rspec-benchmark', '~> 0.6'
end

group :development do
  gem 'rubocop', '~> 1.56'
  gem 'rubocop-rails', '~> 2.21'
  gem 'rubocop-rspec', '~> 2.24'
  gem 'rubocop-performance', '~> 1.19'
  gem 'brakeman', '~> 6.0'
  gem 'bullet', '~> 7.0'
end
```

**RSpec Installation:**
```bash
# Comando para executar após bundle install
rails generate rspec:install
```

### 7.2 Configuração Principal do RSpec

**spec/rails_helper.rb:**
```ruby
# spec/rails_helper.rb
require 'spec_helper'
ENV['RAILS_ENV'] ||= 'test'
require_relative '../config/environment'

# Prevent database truncation if the environment is production
abort("The Rails environment is running in production mode!") if Rails.env.production?

require 'rspec/rails'
require 'factory_bot_rails'
require 'shoulda/matchers'
require 'database_cleaner/active_record'
require 'webmock/rspec'
require 'vcr'
require 'timecop'
require 'rspec-benchmark'

# Add additional requires below this line. Rails is not loaded until this point!

# Requires supporting ruby files with custom matchers and macros, etc, in
# spec/support/ and its subdirectories.
Dir[Rails.root.join('spec', 'support', '**', '*.rb')].sort.each { |f| require f }

# Checks for pending migrations and applies them before tests are run.
begin
  ActiveRecord::Migration.maintain_test_schema!
rescue ActiveRecord::PendingMigrationError => e
  abort e.to_s.strip
end

RSpec.configure do |config|
  # Remove this line if you're not using ActiveRecord or ActiveRecord fixtures
  config.fixture_path = "#{::Rails.root}/spec/fixtures"

  # If you're not using ActiveRecord, or you'd prefer not to run each of your
  # examples within a transaction, remove the following line or assign false
  config.use_transactional_fixtures = false

  # You can uncomment this line to turn off ActiveRecord support entirely.
  # config.use_active_record = false

  # RSpec Rails can automatically mix in different behaviours to your tests
  config.infer_spec_type_from_file_location!

  # Filter lines from Rails gems in backtraces.
  config.filter_rails_from_backtrace!

  # Include FactoryBot methods
  config.include FactoryBot::Syntax::Methods

  # Include custom helpers
  config.include AuthHelpers, type: :request
  config.include JsonHelpers, type: :request
  config.include RequestHelpers, type: :request

  # Database Cleaner
  config.before(:suite) do
    DatabaseCleaner.strategy = :transaction
    DatabaseCleaner.clean_with(:truncation)
  end

  config.around(:each) do |example|
    DatabaseCleaner.cleaning do
      example.run
    end
  end

  # WebMock configuration
  config.before(:each) do
    WebMock.disable_net_connect!(allow_localhost: true)
  end

  # Reset time after each test
  config.after(:each) do
    Timecop.return
  end

  # Performance testing configuration
  config.include RSpec::Benchmark::Matchers

  # Shared examples
  config.shared_context_metadata_behavior = :apply_to_host_groups
end
```

**spec/spec_helper.rb:**
```ruby
# spec/spec_helper.rb
require 'simplecov'

# SimpleCov configuration
SimpleCov.start 'rails' do
  add_filter '/vendor/'
  add_filter '/spec/'
  add_filter '/config/'
  add_filter '/db/'
  add_filter '/app/channels/' # Skip channels if not used

  add_group 'Models', 'app/models'
  add_group 'Controllers', 'app/controllers'
  add_group 'Services', 'app/services'
  add_group 'Serializers', 'app/serializers'
  add_group 'Mailers', 'app/mailers'
  add_group 'Jobs', 'app/jobs'

  minimum_coverage 80
  minimum_coverage_by_file 70

  track_files '{app,lib}/**/*.rb'
end

SimpleCov.formatter = SimpleCov::Formatter::MultiFormatter.new([
  SimpleCov::Formatter::HTMLFormatter
])

RSpec.configure do |config|
  config.expect_with :rspec do |expectations|
    expectations.include_chain_clauses_in_custom_matcher_descriptions = true
  end

  config.mock_with :rspec do |mocks|
    mocks.verify_partial_doubles = true
  end

  config.shared_context_metadata_behavior = :apply_to_host_groups
  config.filter_run_when_matching :focus
  config.example_status_persistence_file_path = "spec/examples.txt"
  config.disable_monkey_patching!

  config.warnings = false

  if config.files_to_run.one?
    config.default_formatter = "doc"
  end

  config.profile_examples = 10
  config.order = :random
  Kernel.srand config.seed
end
```

### 7.3 Support Files e Helpers

**spec/support/auth_helpers.rb:**
```ruby
# spec/support/auth_helpers.rb
module AuthHelpers
  def jwt_token(user)
    JwtService.generate_tokens(user)[:access_token]
  end

  def auth_headers(user)
    token = jwt_token(user)
    {
      'Authorization' => "Bearer #{token}",
      'Content-Type' => 'application/json',
      'Accept' => 'application/json'
    }
  end

  def authenticated_user
    @authenticated_user ||= create(:user)
  end

  def sign_in_as(user)
    @current_user = user
    allow_any_instance_of(ApplicationController).to receive(:current_user).and_return(user)
    allow_any_instance_of(ApplicationController).to receive(:authenticate_user!).and_return(true)
  end

  def expect_authentication_required(method, path, params = {})
    send(method, path, params: params)
    expect(response).to have_http_status(:unauthorized)
    expect(json_response['success']).to be false
    expect(json_response['message']).to eq('Unauthorized')
  end
end
```

**spec/support/json_helpers.rb:**
```ruby
# spec/support/json_helpers.rb
module JsonHelpers
  def json_response
    @json_response ||= JSON.parse(response.body)
  end

  def json_data
    json_response['data']
  end

  def json_errors
    json_response['errors']
  end

  def json_success?
    json_response['success'] == true
  end

  def expect_json_response(expected_keys = [])
    expect(response.content_type).to include('application/json')
    expect(json_response).to be_a(Hash)

    expected_keys.each do |key|
      expect(json_response).to have_key(key.to_s)
    end
  end

  def expect_success_response(message = nil)
    expect_json_response(['success', 'data'])
    expect(json_success?).to be true
    expect(json_response['message']).to eq(message) if message
  end

  def expect_error_response(message = nil, status = :unprocessable_entity)
    expect(response).to have_http_status(status)
    expect_json_response(['success', 'errors'])
    expect(json_success?).to be false
    expect(json_response['message']).to eq(message) if message
  end

  def expect_validation_error(field, message = nil)
    expect_error_response
    error = json_errors.find { |e| e['field'] == field.to_s }
    expect(error).to be_present
    expect(error['message']).to eq(message) if message
  end
end
```

**spec/support/request_helpers.rb:**
```ruby
# spec/support/request_helpers.rb
module RequestHelpers
  def json_post(path, params = {}, headers = {})
    post path, params: params.to_json, headers: default_headers.merge(headers)
  end

  def json_put(path, params = {}, headers = {})
    put path, params: params.to_json, headers: default_headers.merge(headers)
  end

  def json_patch(path, params = {}, headers = {})
    patch path, params: params.to_json, headers: default_headers.merge(headers)
  end

  def json_delete(path, headers = {})
    delete path, headers: default_headers.merge(headers)
  end

  def json_get(path, params = {}, headers = {})
    get path, params: params, headers: default_headers.merge(headers)
  end

  def authenticated_request(method, path, user = nil, params = {})
    user ||= authenticated_user
    headers = auth_headers(user)

    case method
    when :get
      json_get(path, params, headers)
    when :post
      json_post(path, params, headers)
    when :put
      json_put(path, params, headers)
    when :patch
      json_patch(path, params, headers)
    when :delete
      json_delete(path, headers)
    end
  end

  private

  def default_headers
    {
      'Content-Type' => 'application/json',
      'Accept' => 'application/json'
    }
  end
end
```

### 7.4 FactoryBot Configuration

**spec/support/factory_bot.rb:**
```ruby
# spec/support/factory_bot.rb
RSpec.configure do |config|
  config.include FactoryBot::Syntax::Methods

  config.before(:suite) do
    FactoryBot.find_definitions
  end
end

# Lint factories in development
if Rails.env.development?
  task default: :spec

  task :spec do
    sh "bundle exec rspec"
  end

  namespace :factory_bot do
    desc "Verify that all FactoryBot factories are valid"
    task lint: :environment do
      if Rails.env.test?
        conn = ActiveRecord::Base.connection
        conn.transaction do
          FactoryBot.lint
          raise ActiveRecord::Rollback
        end
      else
        system("bundle exec rake factory_bot:lint RAILS_ENV='test'")
        exit $?.exitstatus
      end
    end
  end
end
```

**Factories Completas:**
```ruby
# spec/factories/users.rb
FactoryBot.define do
  factory :user do
    email { Faker::Internet.unique.email }
    password { 'password123' }
    password_confirmation { 'password123' }
    first_name { Faker::Name.first_name }
    last_name { Faker::Name.last_name }
    confirmed_at { Time.current }

    trait :unconfirmed do
      confirmed_at { nil }
    end

    trait :with_transactions do
      after(:create) do |user|
        create_list(:transaction, 5, user: user)
      end
    end

    trait :with_accounts do
      after(:create) do |user|
        create(:account, :checking, user: user)
        create(:account, :savings, user: user)
      end
    end

    trait :with_budget do
      after(:create) do |user|
        category = create(:category, user: user)
        create(:budget, user: user, category: category)
      end
    end
  end
end

# spec/factories/categories.rb
FactoryBot.define do
  factory :category do
    name { Faker::Lorem.word.capitalize }
    color { Category::COLORS.sample }
    category_type { 'expense' }
    is_active { true }

    trait :income do
      category_type { 'income' }
    end

    trait :expense do
      category_type { 'expense' }
    end

    trait :default do
      user { nil }
      is_default { true }
    end

    trait :custom do
      association :user
      is_default { false }
    end

    trait :inactive do
      is_active { false }
    end
  end
end

# spec/factories/accounts.rb
FactoryBot.define do
  factory :account do
    association :user
    name { Faker::Bank.name }
    initial_balance { Faker::Number.decimal(l_digits: 3, r_digits: 2) }
    current_balance { initial_balance }
    is_active { true }

    trait :checking do
      account_type { 'checking' }
      name { 'Conta Corrente' }
    end

    trait :savings do
      account_type { 'savings' }
      name { 'Poupança' }
    end

    trait :credit_card do
      account_type { 'credit_card' }
      name { 'Cartão de Crédito' }
      initial_balance { 0 }
      current_balance { 0 }
    end

    trait :investment do
      account_type { 'investment' }
      name { 'Investimentos' }
    end

    trait :cash do
      account_type { 'cash' }
      name { 'Dinheiro' }
    end

    trait :inactive do
      is_active { false }
    end
  end
end

# spec/factories/transactions.rb
FactoryBot.define do
  factory :transaction do
    association :user
    association :category
    association :account

    description { Faker::Lorem.sentence(word_count: 3) }
    amount { Faker::Number.decimal(l_digits: 2, r_digits: 2) }
    date { Faker::Date.recent(days: 30) }
    notes { Faker::Lorem.paragraph }

    trait :income do
      transaction_type { 'income' }
      association :category, :income
    end

    trait :expense do
      transaction_type { 'expense' }
      association :category, :expense
    end

    trait :transfer do
      transaction_type { 'transfer' }
      association :transfer_account, factory: :account
      category { nil }
    end

    trait :recent do
      date { Date.current }
    end

    trait :last_month do
      date { 1.month.ago }
    end

    trait :high_amount do
      amount { Faker::Number.decimal(l_digits: 4, r_digits: 2) }
    end
  end
end

# spec/factories/budgets.rb
FactoryBot.define do
  factory :budget do
    association :user
    association :category, :expense
    amount_limit { Faker::Number.decimal(l_digits: 3, r_digits: 2) }
    period { 'monthly' }
    start_date { Date.current.beginning_of_month }
    end_date { Date.current.end_of_month }
    is_active { true }

    trait :quarterly do
      period { 'quarterly' }
      start_date { Date.current.beginning_of_quarter }
      end_date { Date.current.end_of_quarter }
    end

    trait :yearly do
      period { 'yearly' }
      start_date { Date.current.beginning_of_year }
      end_date { Date.current.end_of_year }
    end

    trait :exceeded do
      after(:create) do |budget|
        create(:transaction, :expense,
               user: budget.user,
               category: budget.category,
               amount: budget.amount_limit + 100,
               date: budget.start_date + 1.day)
      end
    end

    trait :inactive do
      is_active { false }
    end
  end
end

# spec/factories/goals.rb
FactoryBot.define do
  factory :goal do
    association :user
    title { Faker::Lorem.sentence(word_count: 3) }
    description { Faker::Lorem.paragraph }
    target_amount { Faker::Number.decimal(l_digits: 4, r_digits: 2) }
    current_amount { 0 }
    target_date { 6.months.from_now.to_date }
    is_achieved { false }

    trait :achieved do
      is_achieved { true }
      current_amount { target_amount }
    end

    trait :in_progress do
      current_amount { target_amount * 0.5 }
    end

    trait :expiring_soon do
      target_date { 1.week.from_now.to_date }
    end

    trait :no_target_date do
      target_date { nil }
    end
  end
end
```

### 7.5 Shoulda Matchers Configuration

**spec/support/shoulda_matchers.rb:**
```ruby
# spec/support/shoulda_matchers.rb
Shoulda::Matchers.configure do |config|
  config.integrate do |with|
    with.test_framework :rspec
    with.library :rails
  end
end
```

### 7.6 Shared Examples

**spec/support/shared_examples/api_authentication.rb:**
```ruby
# spec/support/shared_examples/api_authentication.rb
RSpec.shared_examples 'requires authentication' do |method, path, params = {}|
  it 'returns unauthorized without token' do
    send(method, path, params: params)
    expect(response).to have_http_status(:unauthorized)
    expect(json_response['success']).to be false
  end

  it 'returns unauthorized with invalid token' do
    headers = { 'Authorization' => 'Bearer invalid-token' }
    send(method, path, params: params, headers: headers)
    expect(response).to have_http_status(:unauthorized)
    expect(json_response['success']).to be false
  end
end

RSpec.shared_examples 'API endpoint' do |method, path|
  include_examples 'requires authentication', method, path

  it 'returns JSON content type' do
    user = create(:user)
    send(method, path, headers: auth_headers(user))
    expect(response.content_type).to include('application/json')
  end
end
```

**spec/support/shared_examples/validates_presence.rb:**
```ruby
# spec/support/shared_examples/validates_presence.rb
RSpec.shared_examples 'validates presence of' do |field|
  it "validates presence of #{field}" do
    subject.send("#{field}=", nil)
    expect(subject).not_to be_valid
    expect(subject.errors[field]).to include("can't be blank")
  end
end

RSpec.shared_examples 'validates numericality of' do |field, options = {}|
  it "validates numericality of #{field}" do
    subject.send("#{field}=", 'not a number')
    expect(subject).not_to be_valid
    expect(subject.errors[field]).to include('is not a number')
  end

  if options[:greater_than]
    it "validates #{field} is greater than #{options[:greater_than]}" do
      subject.send("#{field}=", options[:greater_than] - 1)
      expect(subject).not_to be_valid
      expect(subject.errors[field]).to include("must be greater than #{options[:greater_than]}")
    end
  end
end
```

### 7.7 Database Configuration para Testes

**config/database.yml (test section):**
```yaml
test:
  <<: *default
  database: finance_app_test
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>
  host: <%= ENV.fetch("DATABASE_HOST") { "localhost" } %>
  port: <%= ENV.fetch("DATABASE_PORT") { 5432 } %>
  username: <%= ENV.fetch("DATABASE_USER") { "postgres" } %>
  password: <%= ENV.fetch("DATABASE_PASSWORD") { "password" } %>
```

### 7.8 RuboCop Configuration

**.rubocop.yml:**
```yaml
require:
  - rubocop-rails
  - rubocop-rspec
  - rubocop-performance

AllCops:
  TargetRubyVersion: 3.2
  NewCops: enable
  Exclude:
    - 'db/schema.rb'
    - 'db/migrate/*'
    - 'bin/*'
    - 'config/boot.rb'
    - 'config/environment.rb'
    - 'config/initializers/*'
    - 'node_modules/**/*'
    - 'vendor/**/*'

Style/Documentation:
  Enabled: false

Style/FrozenStringLiteralComment:
  Enabled: false

Metrics/LineLength:
  Max: 120
  AllowHeredoc: true
  AllowURI: true

Metrics/BlockLength:
  Exclude:
    - 'spec/**/*'
    - 'config/routes.rb'
    - 'db/seeds.rb'

Metrics/MethodLength:
  Max: 15
  Exclude:
    - 'spec/**/*'

Metrics/AbcSize:
  Max: 20
  Exclude:
    - 'spec/**/*'

RSpec/ExampleLength:
  Max: 10

RSpec/MultipleExpectations:
  Max: 5

RSpec/NestedGroups:
  Max: 4

Rails/FilePath:
  Enabled: false

Performance/CollectionLiteralInLoop:
  Enabled: true
```

### 7.9 Performance Testing Setup

**spec/support/performance_helpers.rb:**
```ruby
# spec/support/performance_helpers.rb
module PerformanceHelpers
  def benchmark_expectation(expected_time = 0.1)
    expect { yield }.to perform_under(expected_time).sec
  end

  def memory_expectation(expected_memory = 10)
    expect { yield }.to perform_allocation(expected_memory).objects
  end

  def database_query_expectation(max_queries = 5)
    expect { yield }.not_to exceed_query_limit(max_queries)
  end
end

RSpec.configure do |config|
  config.include PerformanceHelpers, :performance
end
```

### 7.10 CI/CD Scripts

**bin/ci_test:**
```bash
#!/bin/bash
# bin/ci_test

set -e

echo "=== Running CI Tests ==="

echo "Setting up test database..."
bundle exec rails db:test:prepare

echo "Running RuboCop..."
bundle exec rubocop

echo "Running Brakeman security scan..."
bundle exec brakeman -q

echo "Running factory lint..."
bundle exec rails factory_bot:lint RAILS_ENV=test

echo "Running RSpec tests..."
bundle exec rspec --format progress --format RspecJunitFormatter --out tmp/rspec.xml

echo "Checking test coverage..."
if [ -f coverage/.last_run.json ]; then
  coverage=$(cat coverage/.last_run.json | grep -o '"covered_percent":[0-9.]*' | cut -d':' -f2)
  echo "Coverage: $coverage%"

  if (( $(echo "$coverage < 80" | bc -l) )); then
    echo "ERROR: Coverage below 80%"
    exit 1
  fi
fi

echo "=== All tests passed! ==="
```

**Makefile:**
```makefile
# Makefile
.PHONY: test test-fast setup lint security coverage

test:
	bin/ci_test

test-fast:
	bundle exec rspec --tag ~slow

setup:
	bundle install
	bundle exec rails db:test:prepare
	bundle exec rails factory_bot:lint RAILS_ENV=test

lint:
	bundle exec rubocop

security:
	bundle exec brakeman

coverage:
	bundle exec rspec --format progress
	open coverage/index.html

ci: setup lint security test

install-hooks:
	echo "#!/bin/bash\nmake lint" > .git/hooks/pre-commit
	chmod +x .git/hooks/pre-commit
```

### 7.11 Teste de Exemplo Completo

**spec/models/user_spec.rb (exemplo):**
```ruby
# spec/models/user_spec.rb
RSpec.describe User, type: :model do
  subject { build(:user) }

  describe 'validations' do
    it { should validate_presence_of(:email) }
    it { should validate_presence_of(:first_name) }
    it { should validate_presence_of(:last_name) }
    it { should validate_uniqueness_of(:email).case_insensitive }
    it { should validate_length_of(:first_name).is_at_most(100) }
    it { should validate_length_of(:last_name).is_at_most(100) }
    it { should allow_value('user@example.com').for(:email) }
    it { should_not allow_value('invalid-email').for(:email) }
  end

  describe 'associations' do
    it { should have_many(:transactions).dependent(:destroy) }
    it { should have_many(:categories).dependent(:destroy) }
    it { should have_many(:accounts).dependent(:destroy) }
    it { should have_many(:budgets).dependent(:destroy) }
    it { should have_many(:goals).dependent(:destroy) }
  end

  describe 'callbacks' do
    it 'generates jti before creation' do
      user = build(:user)
      expect(user.jti).to be_nil
      user.save!
      expect(user.jti).to be_present
      expect(user.jti).to match(/\A[\w-]+\z/)
    end
  end

  describe '#full_name' do
    it 'returns concatenated first and last name' do
      user = build(:user, first_name: 'John', last_name: 'Doe')
      expect(user.full_name).to eq('John Doe')
    end
  end

  describe '#current_month_summary', :performance do
    let(:user) { create(:user) }

    before do
      create(:transaction, :income, user: user, amount: 5000)
      create(:transaction, :expense, user: user, amount: 2000)
      create(:account, user: user, current_balance: 3000)
    end

    it 'returns correct summary' do
      summary = user.current_month_summary

      expect(summary[:income]).to eq(5000)
      expect(summary[:expenses]).to eq(2000)
      expect(summary[:balance]).to eq(3000)
    end

    it 'performs efficiently' do
      benchmark_expectation(0.1) do
        user.current_month_summary
      end
    end
  end
end
```

## Critérios de Sucesso

- [ ] RSpec configurado e executando testes corretamente
- [ ] FactoryBot factories para todos os models funcionando
- [ ] SimpleCov reportando cobertura > 80%
- [ ] DatabaseCleaner limpando entre testes
- [ ] Shoulda Matchers configurado para validações
- [ ] Helpers de autenticação e JSON funcionando
- [ ] RuboCop configurado com regras apropriadas
- [ ] Performance testing configurado
- [ ] Brakeman security scan configurado
- [ ] CI/CD scripts prontos para pipeline
- [ ] Shared examples para padrões comuns
- [ ] Testes passando em ambiente local e CI
- [ ] Factory lint verificando integridade das factories

## Estimativa de Tempo

- **Tempo Total**: 12-16 horas
- **Complexidade**: Média (configuração extensiva mas padrão)
- **Dependências**: Críticas (6.0 - Sistema de Autenticação)
- **Risco**: Baixo (configuração bem documentada)

## Entregáveis

1. Configuração completa do RSpec com helpers
2. FactoryBot factories para todos os models
3. SimpleCov com configuração de cobertura
4. Shoulda Matchers para validações
5. Helpers de autenticação e JSON
6. RuboCop configuration apropriada
7. Scripts de CI/CD para testes
8. Shared examples para padrões comuns
9. Performance testing setup
10. Security scanning com Brakeman
11. Database cleaner configuration
12. Documentação de como executar testes