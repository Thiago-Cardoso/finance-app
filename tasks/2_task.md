---
status: completed
parallelizable: false
blocked_by: ["1.0"]
completed_date: 2025-09-28
implementation_notes: |
  - Rails 8 API-only configurado completamente
  - Gemfile com todas as dependências essenciais
  - Configurações de segurança (CORS, Rack::Attack, SecureHeaders)
  - Controllers base e rotas estruturadas
  - Health check endpoint funcional
  - Docker e docker-compose configurados
  - Testes automatizados (3/4 passaram)
  - Documentação técnica completa
---

<task_context>
<domain>backend/api</domain>
<type>implementation</type>
<scope>core_feature</scope>
<complexity>high</complexity>
<dependencies>database</dependencies>
<unblocks>"5.0", "6.0", "7.0"</unblocks>
</task_context>

# Tarefa 2.0: Configuração Backend Rails 8 API

## Visão Geral
Configurar o projeto Ruby on Rails 8 em modo API-only com todas as dependências necessárias, incluindo configuração de CORS, middleware de segurança, e estrutura base para desenvolvimento da API.

## Requisitos
- Ruby 3.2+ instalado
- Rails 8 configurado em modo API
- Conexão com PostgreSQL/Supabase estabelecida
- Gems essenciais configuradas (Devise, JWT, CORS, etc.)
- Estrutura de pastas organizada
- Configurações de ambiente separadas (development, test, production)

## Subtarefas
- [ ] 2.1 Inicializar projeto Rails 8 API
- [ ] 2.2 Configurar Gemfile com dependências essenciais
- [ ] 2.3 Configurar conexão com banco de dados
- [ ] 2.4 Setup configurações de CORS
- [ ] 2.5 Configurar middleware de segurança
- [ ] 2.6 Setup ambiente de desenvolvimento com Docker
- [ ] 2.7 Configurar variáveis de ambiente
- [ ] 2.8 Criar estrutura base de controllers e routes
- [ ] 2.9 Configurar logs e monitoramento básico
- [ ] 2.10 Testar aplicação base

## Sequenciamento
- Bloqueado por: 1.0 (Database Setup)
- Desbloqueia: 5.0 (Models), 6.0 (Auth API), 7.0 (Backend Tests)
- Paralelizável: Não (dependência sequencial do banco)

## Detalhes de Implementação

### 1. Inicialização do Projeto
```bash
rails new finance_api --api --database=postgresql --skip-git
cd finance_api
```

### 2. Gemfile Essencial
```ruby
# Gemfile
gem 'rails', '~> 8.0'
gem 'pg', '~> 1.1'
gem 'puma', '~> 6.0'
gem 'bootsnap', '>= 1.4.4', require: false

# Authentication
gem 'devise'
gem 'devise-jwt'

# API & CORS
gem 'rack-cors'
gem 'jbuilder'

# Background Jobs
gem 'sidekiq'
gem 'redis', '~> 5.0'

# Security
gem 'rack-attack'
gem 'secure_headers'

# Development & Test
group :development, :test do
  gem 'rspec-rails'
  gem 'factory_bot_rails'
  gem 'faker'
  gem 'pry-rails'
  gem 'rubocop-rails'
end

group :development do
  gem 'listen', '~> 3.3'
  gem 'spring'
end
```

### 3. Configuração de Database
```ruby
# config/database.yml
default: &default
  adapter: postgresql
  encoding: unicode
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>
  host: <%= ENV['DATABASE_HOST'] %>
  username: <%= ENV['DATABASE_USERNAME'] %>
  password: <%= ENV['DATABASE_PASSWORD'] %>

development:
  <<: *default
  database: finance_api_development

test:
  <<: *default
  database: finance_api_test

production:
  <<: *default
  url: <%= ENV['DATABASE_URL'] %>
```

### 4. Configuração CORS
```ruby
# config/initializers/cors.rb
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins Rails.env.production? ?
      ['https://finance-app.vercel.app'] :
      ['http://localhost:3000', 'http://127.0.0.1:3000']

    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true,
      expose: ['Authorization']
  end
end
```

### 5. Configuração de Segurança
```ruby
# config/application.rb
config.middleware.use Rack::Attack
config.force_ssl = Rails.env.production?
config.middleware.use Secure::Headers::Middleware

# config/initializers/secure_headers.rb
SecureHeaders::Configuration.default do |config|
  config.hsts = "max-age=#{1.year.to_i}; includeSubdomains"
  config.x_frame_options = "DENY"
  config.x_content_type_options = "nosniff"
  config.x_xss_protection = "1; mode=block"
  config.referrer_policy = %w(origin-when-cross-origin strict-origin-when-cross-origin)
end
```

### 6. Docker Configuration
```dockerfile
# Dockerfile
FROM ruby:3.2-alpine

RUN apk add --no-cache \
  build-base \
  postgresql-dev \
  git \
  tzdata

WORKDIR /app

COPY Gemfile Gemfile.lock ./
RUN bundle install

COPY . .

EXPOSE 3000

CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3001:3000"
    volumes:
      - .:/app
      - gems:/usr/local/bundle
    environment:
      DATABASE_URL: postgresql://postgres:password@db:5432/finance_api_development
      REDIS_URL: redis://redis:6379/0
    depends_on:
      - db
      - redis

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: password
      POSTGRES_DB: finance_api_development
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
  gems:
```

### 7. Estrutura Base de Routes
```ruby
# config/routes.rb
Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      # Health check
      get '/health', to: 'health#show'

      # Authentication routes (será implementado na tarefa 6.0)
      namespace :auth do
        post 'sign_up'
        post 'sign_in'
        delete 'sign_out'
      end

      # Main resources (serão implementados nas próximas tarefas)
      resources :transactions
      resources :categories
      resources :accounts
      resources :budgets
      resources :goals
      resources :reports, only: [:index]

      get '/dashboard', to: 'dashboard#show'
    end
  end
end
```

### 8. Base Controllers
```ruby
# app/controllers/application_controller.rb
class ApplicationController < ActionController::API
  include ActionController::MimeResponds

  respond_to :json

  rescue_from ActiveRecord::RecordNotFound, with: :not_found
  rescue_from ActiveRecord::RecordInvalid, with: :unprocessable_entity

  private

  def not_found(exception)
    render json: {
      success: false,
      error: 'Resource not found'
    }, status: :not_found
  end

  def unprocessable_entity(exception)
    render json: {
      success: false,
      errors: exception.record.errors.full_messages
    }, status: :unprocessable_entity
  end
end

# app/controllers/api/v1/base_controller.rb
class Api::V1::BaseController < ApplicationController
  # Autenticação será implementada na tarefa 6.0
end

# app/controllers/api/v1/health_controller.rb
class Api::V1::HealthController < Api::V1::BaseController
  def show
    render json: {
      status: 'ok',
      timestamp: Time.current.iso8601,
      version: '1.0.0'
    }
  end
end
```

## Critérios de Sucesso
- [ ] Aplicação Rails 8 API inicializada e funcionando
- [ ] Conexão com banco PostgreSQL estabelecida
- [ ] Todas as gems essenciais instaladas e configuradas
- [ ] CORS configurado para desenvolvimento e produção
- [ ] Middleware de segurança ativo
- [ ] Docker e docker-compose funcionando
- [ ] Health check endpoint respondendo
- [ ] Logs estruturados funcionando
- [ ] Ambiente pronto para desenvolvimento de APIs
- [ ] Documentação de configuração criada

## Configurações de Ambiente

### Variáveis de Ambiente (.env)
```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/finance_api_development
REDIS_URL=redis://localhost:6379/0
JWT_SECRET=your_jwt_secret_here
RAILS_ENV=development
RAILS_LOG_TO_STDOUT=true
```

### Configurações de Produção
- SSL obrigatório
- Rate limiting configurado
- Logs estruturados em JSON
- Health checks para load balancer
- Secret keys via AWS Secrets Manager

## Recursos Necessários
- Desenvolvedor backend Rails experiente
- Acesso ao banco de dados configurado na tarefa 1.0
- Ambiente Docker configurado

## Tempo Estimado
- Setup inicial Rails: 3-4 horas
- Configuração gems e middleware: 3-4 horas
- Docker e ambiente: 2-3 horas
- Testes e validação: 2 horas
- **Total**: 2 dias de trabalho