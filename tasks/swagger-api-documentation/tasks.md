# Lista de Tarefas: Configuração do Swagger para API Rails

## Resumo Executivo

Esta lista de tarefas detalha a implementação completa do Swagger/OpenAPI para a API Rails do aplicativo de controle financeiro pessoal. O objetivo é fornecer documentação interativa e testável de todos os endpoints da API, com autenticação JWT totalmente integrada.

**Escopo Total:**
- Instalação e configuração da gem rswag
- Configuração de autenticação JWT no Swagger UI
- Documentação de 40+ endpoints distribuídos em 8 controllers
- Schemas/Models para todas as entidades
- Exemplos de requisições/respostas para cada endpoint
- Testes de integração automatizados
- Configuração de UI customizada
- Segurança e controle de acesso

**Estimativa Total:** 5-7 dias de desenvolvimento
**Complexidade Geral:** Média-Alta

---

## Tarefas Sequenciais (Devem ser executadas em ordem)

### Tarefa 1: Setup Inicial - Instalação e Configuração do rswag

**Descrição:** Instalar a gem rswag e configurar o ambiente básico para gerar documentação Swagger/OpenAPI. A gem rswag integra Swagger com RSpec, permitindo que os testes gerem automaticamente a documentação.

**Arquivos:**
- `/Users/thiagocardoso/Documents/Projects/finance-app/backend/Gemfile`
- `/Users/thiagocardoso/Documents/Projects/finance-app/backend/config/initializers/rswag_api.rb` (novo)
- `/Users/thiagocardoso/Documents/Projects/finance-app/backend/config/initializers/rswag_ui.rb` (novo)
- `/Users/thiagocardoso/Documents/Projects/finance-app/backend/config/routes.rb`
- `/Users/thiagocardoso/Documents/Projects/finance-app/backend/spec/swagger_helper.rb` (novo)

**Complexidade:** Baixa

**Dependências:** Nenhuma

**Passos Detalhados:**

1. **Adicionar gems ao Gemfile:**
```ruby
# Gemfile - adicionar no grupo :development, :test
gem 'rswag'
gem 'rswag-api'
gem 'rswag-ui'
```

2. **Instalar gems:**
```bash
cd /Users/thiagocardoso/Documents/Projects/finance-app/backend
bundle install
```

3. **Executar instalador do rswag:**
```bash
rails g rswag:install
```

4. **Configurar rswag_ui.rb:**
```ruby
# config/initializers/rswag_ui.rb
Rswag::Ui.configure do |c|
  c.openapi_endpoint '/api-docs/v1/swagger.yaml', 'API V1 Docs'

  # Configurações de UI
  c.config_object = {
    deepLinking: true,
    displayRequestDuration: true,
    defaultModelsExpandDepth: 3,
    defaultModelExpandDepth: 3,
    docExpansion: 'list',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true
  }
end
```

5. **Configurar rswag_api.rb:**
```ruby
# config/initializers/rswag_api.rb
Rswag::Api.configure do |c|
  c.openapi_root = Rails.root.join('swagger').to_s
end
```

6. **Adicionar rotas no routes.rb:**
```ruby
# config/routes.rb - adicionar no início
mount Rswag::Ui::Engine => '/api-docs'
mount Rswag::Api::Engine => '/api-docs'
```

7. **Criar diretório para specs Swagger:**
```bash
mkdir -p spec/requests/api/v1/swagger
mkdir -p swagger/v1
```

**Validação:**
- [ ] Bundle install executado sem erros
- [ ] Arquivos de configuração criados
- [ ] Rotas /api-docs acessíveis (pode estar vazio ainda)
- [ ] Nenhum erro no console Rails ao iniciar servidor

---

### Tarefa 2: Configuração do swagger_helper.rb - Metadata Global

**Descrição:** Configurar o arquivo swagger_helper.rb com todas as definições globais da API, incluindo informações de autenticação JWT, schemas de resposta padrão, e metadados da API.

**Arquivos:**
- `/Users/thiagocardoso/Documents/Projects/finance-app/backend/spec/swagger_helper.rb`

**Complexidade:** Média

**Dependências:** Tarefa 1

**Passos Detalhados:**

1. **Configurar metadata básica:**
```ruby
# spec/swagger_helper.rb
require 'rails_helper'

RSpec.configure do |config|
  config.openapi_root = Rails.root.join('swagger').to_s

  config.openapi_specs = {
    'v1/swagger.yaml' => {
      openapi: '3.0.1',
      info: {
        title: 'Finance App API',
        version: 'v1',
        description: 'API para controle financeiro pessoal com gestão de transações, categorias, orçamentos, metas e relatórios.',
        contact: {
          name: 'Finance App Support',
          email: 'support@financeapp.com'
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT'
        }
      },

      # Definição de servidores
      servers: [
        {
          url: 'http://localhost:3001',
          description: 'Development server'
        },
        {
          url: 'https://api.financeapp.com',
          description: 'Production server'
        }
      ],

      # Configuração de autenticação JWT
      components: {
        securitySchemes: {
          bearerAuth: {
            type: :http,
            scheme: :bearer,
            bearerFormat: 'JWT',
            description: 'JWT token obtido através do endpoint /api/v1/auth/sign_in'
          }
        },

        # Schemas reutilizáveis
        schemas: {
          # Schema de erro padrão
          Error: {
            type: :object,
            properties: {
              success: { type: :boolean, example: false },
              message: { type: :string, example: 'Validation failed' },
              errors: {
                type: :array,
                items: {
                  type: :object,
                  properties: {
                    field: { type: :string, example: 'email' },
                    message: { type: :string, example: "can't be blank" }
                  }
                }
              }
            },
            required: [:success, :message]
          },

          # Schema de sucesso padrão
          SuccessResponse: {
            type: :object,
            properties: {
              success: { type: :boolean, example: true },
              message: { type: :string, example: 'Success' },
              data: { type: :object }
            },
            required: [:success, :data]
          },

          # Schema de paginação
          PaginationMeta: {
            type: :object,
            properties: {
              current_page: { type: :integer, example: 1 },
              total_pages: { type: :integer, example: 10 },
              total_count: { type: :integer, example: 100 },
              per_page: { type: :integer, example: 20 }
            }
          }
        }
      },

      # Aplicar autenticação JWT globalmente
      security: [
        { bearerAuth: [] }
      ],

      # Tags para organização
      tags: [
        { name: 'Authentication', description: 'Endpoints de autenticação e gerenciamento de usuários' },
        { name: 'Dashboard', description: 'Visão geral financeira' },
        { name: 'Transactions', description: 'Gestão de transações (receitas/despesas)' },
        { name: 'Categories', description: 'Gestão de categorias' },
        { name: 'Accounts', description: 'Gestão de contas bancárias' },
        { name: 'Budgets', description: 'Gestão de orçamentos' },
        { name: 'Goals', description: 'Gestão de metas financeiras' },
        { name: 'Reports', description: 'Relatórios e análises' },
        { name: 'Analytics', description: 'Analytics e insights financeiros' },
        { name: 'Health', description: 'Health checks do sistema' }
      ]
    }
  }

  config.openapi_format = :yaml
end
```

**Validação:**
- [ ] swagger_helper.rb criado sem erros de sintaxe
- [ ] Todas as tags definidas correspondem aos controllers existentes
- [ ] Schemas básicos de erro e sucesso definidos

---

### Tarefa 3: Definição de Schemas - Models Completos

**Descrição:** Criar todos os schemas (models) que representam as entidades da API. Isso inclui User, Transaction, Category, Account, Budget, Goal, Report e todos os objetos de request/response.

**Arquivos:**
- `/Users/thiagocardoso/Documents/Projects/finance-app/backend/spec/swagger_helper.rb` (adicionar na seção components/schemas)

**Complexidade:** Alta

**Dependências:** Tarefa 2

**Passos Detalhados:**

1. **Adicionar schemas de entidades no swagger_helper.rb:**

```ruby
# Adicionar dentro de components: { schemas: { ... } }

# USER SCHEMAS
User: {
  type: :object,
  properties: {
    id: { type: :integer, example: 1 },
    email: { type: :string, format: :email, example: 'user@example.com' },
    first_name: { type: :string, example: 'John' },
    last_name: { type: :string, example: 'Doe' },
    confirmed_at: { type: :string, format: 'date-time', nullable: true }
  },
  required: [:id, :email, :first_name, :last_name]
},

UserSignUpRequest: {
  type: :object,
  properties: {
    user: {
      type: :object,
      properties: {
        email: { type: :string, format: :email, example: 'user@example.com' },
        password: { type: :string, format: :password, example: 'password123' },
        password_confirmation: { type: :string, format: :password, example: 'password123' },
        first_name: { type: :string, example: 'John' },
        last_name: { type: :string, example: 'Doe' }
      },
      required: [:email, :password, :password_confirmation, :first_name, :last_name]
    }
  },
  required: [:user]
},

UserSignInRequest: {
  type: :object,
  properties: {
    user: {
      type: :object,
      properties: {
        email: { type: :string, format: :email, example: 'user@example.com' },
        password: { type: :string, format: :password, example: 'password123' }
      },
      required: [:email, :password]
    }
  },
  required: [:user]
},

AuthTokensResponse: {
  type: :object,
  properties: {
    success: { type: :boolean, example: true },
    data: {
      type: :object,
      properties: {
        user: { '$ref' => '#/components/schemas/User' },
        access_token: { type: :string, example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        refresh_token: { type: :string, example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        token_type: { type: :string, example: 'Bearer' },
        expires_in: { type: :integer, example: 86400 }
      }
    },
    message: { type: :string, example: 'Signed in successfully' }
  }
},

# TRANSACTION SCHEMAS
Transaction: {
  type: :object,
  properties: {
    id: { type: :integer, example: 1 },
    description: { type: :string, example: 'Supermercado Extra' },
    amount: { type: :string, example: '150.00' },
    transaction_type: {
      type: :string,
      enum: ['income', 'expense', 'transfer'],
      example: 'expense'
    },
    date: { type: :string, format: :date, example: '2024-01-15' },
    notes: { type: :string, nullable: true, example: 'Compras da semana' },
    category: { '$ref' => '#/components/schemas/CategorySummary', nullable: true },
    account: { '$ref' => '#/components/schemas/AccountSummary', nullable: true },
    transfer_account: { '$ref' => '#/components/schemas/AccountSummary', nullable: true },
    created_at: { type: :string, format: 'date-time' },
    updated_at: { type: :string, format: 'date-time' }
  },
  required: [:id, :description, :amount, :transaction_type, :date]
},

TransactionRequest: {
  type: :object,
  properties: {
    transaction: {
      type: :object,
      properties: {
        description: { type: :string, example: 'Salário Janeiro' },
        amount: { type: :string, example: '5500.00' },
        transaction_type: {
          type: :string,
          enum: ['income', 'expense', 'transfer'],
          example: 'income'
        },
        date: { type: :string, format: :date, example: '2024-01-01' },
        notes: { type: :string, example: 'Salário do mês' },
        category_id: { type: :integer, example: 1 },
        account_id: { type: :integer, example: 1 },
        transfer_account_id: { type: :integer, nullable: true }
      },
      required: [:description, :amount, :transaction_type, :date]
    }
  },
  required: [:transaction]
},

TransactionListResponse: {
  type: :object,
  properties: {
    success: { type: :boolean, example: true },
    data: {
      type: :array,
      items: { '$ref' => '#/components/schemas/Transaction' }
    },
    meta: {
      type: :object,
      properties: {
        pagination: { '$ref' => '#/components/schemas/PaginationMeta' }
      }
    }
  }
},

# CATEGORY SCHEMAS
Category: {
  type: :object,
  properties: {
    id: { type: :integer, example: 1 },
    name: { type: :string, example: 'Alimentação' },
    color: { type: :string, example: '#ef4444' },
    icon: { type: :string, nullable: true, example: 'utensils' },
    category_type: {
      type: :string,
      enum: ['income', 'expense'],
      example: 'expense'
    },
    is_default: { type: :boolean, example: false },
    is_active: { type: :boolean, example: true },
    created_at: { type: :string, format: 'date-time' },
    updated_at: { type: :string, format: 'date-time' }
  },
  required: [:id, :name, :color, :category_type]
},

CategorySummary: {
  type: :object,
  properties: {
    id: { type: :integer, example: 1 },
    name: { type: :string, example: 'Alimentação' },
    color: { type: :string, example: '#ef4444' },
    icon: { type: :string, nullable: true }
  }
},

CategoryRequest: {
  type: :object,
  properties: {
    category: {
      type: :object,
      properties: {
        name: { type: :string, example: 'Nova Categoria' },
        color: { type: :string, example: '#3b82f6' },
        icon: { type: :string, example: 'star' },
        category_type: {
          type: :string,
          enum: ['income', 'expense'],
          example: 'expense'
        }
      },
      required: [:name, :category_type]
    }
  },
  required: [:category]
},

# ACCOUNT SCHEMAS
Account: {
  type: :object,
  properties: {
    id: { type: :integer, example: 1 },
    name: { type: :string, example: 'Conta Corrente' },
    account_type: {
      type: :string,
      enum: ['checking', 'savings', 'credit_card', 'investment', 'cash'],
      example: 'checking'
    },
    initial_balance: { type: :string, example: '1000.00' },
    current_balance: { type: :string, example: '1250.50' },
    is_active: { type: :boolean, example: true },
    created_at: { type: :string, format: 'date-time' },
    updated_at: { type: :string, format: 'date-time' }
  },
  required: [:id, :name, :account_type]
},

AccountSummary: {
  type: :object,
  properties: {
    id: { type: :integer, example: 1 },
    name: { type: :string, example: 'Conta Corrente' },
    account_type: { type: :string, example: 'checking' }
  }
},

AccountRequest: {
  type: :object,
  properties: {
    account: {
      type: :object,
      properties: {
        name: { type: :string, example: 'Nubank' },
        account_type: {
          type: :string,
          enum: ['checking', 'savings', 'credit_card', 'investment', 'cash'],
          example: 'checking'
        },
        initial_balance: { type: :string, example: '500.00' }
      },
      required: [:name, :account_type]
    }
  },
  required: [:account]
},

# BUDGET SCHEMAS
Budget: {
  type: :object,
  properties: {
    id: { type: :integer, example: 1 },
    category: { '$ref' => '#/components/schemas/CategorySummary' },
    amount_limit: { type: :string, example: '800.00' },
    period: {
      type: :string,
      enum: ['monthly', 'quarterly', 'yearly'],
      example: 'monthly'
    },
    start_date: { type: :string, format: :date, example: '2024-01-01' },
    end_date: { type: :string, format: :date, example: '2024-01-31' },
    is_active: { type: :boolean, example: true },
    spent_amount: { type: :string, example: '650.00' },
    percentage_used: { type: :number, format: :float, example: 81.25 },
    created_at: { type: :string, format: 'date-time' },
    updated_at: { type: :string, format: 'date-time' }
  },
  required: [:id, :category, :amount_limit, :period, :start_date, :end_date]
},

BudgetRequest: {
  type: :object,
  properties: {
    budget: {
      type: :object,
      properties: {
        category_id: { type: :integer, example: 1 },
        amount_limit: { type: :string, example: '1000.00' },
        period: {
          type: :string,
          enum: ['monthly', 'quarterly', 'yearly'],
          example: 'monthly'
        },
        start_date: { type: :string, format: :date, example: '2024-02-01' },
        end_date: { type: :string, format: :date, example: '2024-02-29' }
      },
      required: [:category_id, :amount_limit, :period, :start_date, :end_date]
    }
  },
  required: [:budget]
},

# GOAL SCHEMAS
Goal: {
  type: :object,
  properties: {
    id: { type: :integer, example: 1 },
    title: { type: :string, example: 'Casa própria' },
    description: { type: :string, nullable: true, example: 'Economizar para entrada' },
    target_amount: { type: :string, example: '50000.00' },
    current_amount: { type: :string, example: '12500.00' },
    target_date: { type: :string, format: :date, nullable: true, example: '2025-12-31' },
    is_achieved: { type: :boolean, example: false },
    percentage: { type: :number, format: :float, example: 25.0 },
    created_at: { type: :string, format: 'date-time' },
    updated_at: { type: :string, format: 'date-time' }
  },
  required: [:id, :title, :target_amount, :current_amount]
},

GoalRequest: {
  type: :object,
  properties: {
    goal: {
      type: :object,
      properties: {
        title: { type: :string, example: 'Viagem Europa' },
        description: { type: :string, example: 'Economizar para viagem de 15 dias' },
        target_amount: { type: :string, example: '15000.00' },
        target_date: { type: :string, format: :date, example: '2025-06-30' }
      },
      required: [:title, :target_amount]
    }
  },
  required: [:goal]
},

# DASHBOARD SCHEMA
DashboardSummary: {
  type: :object,
  properties: {
    success: { type: :boolean, example: true },
    data: {
      type: :object,
      properties: {
        summary: {
          type: :object,
          properties: {
            current_month: {
              type: :object,
              properties: {
                income: { type: :string, example: '5500.00' },
                expenses: { type: :string, example: '3200.00' },
                balance: { type: :string, example: '2300.00' }
              }
            },
            current_balance: { type: :string, example: '12500.00' }
          }
        },
        recent_transactions: {
          type: :array,
          items: { '$ref' => '#/components/schemas/Transaction' }
        },
        top_categories: {
          type: :array,
          items: {
            type: :object,
            properties: {
              category: { type: :string, example: 'Alimentação' },
              amount: { type: :string, example: '800.00' },
              percentage: { type: :number, example: 25 }
            }
          }
        },
        monthly_evolution: {
          type: :array,
          items: {
            type: :object,
            properties: {
              month: { type: :string, example: '2024-01' },
              income: { type: :string, example: '5500.00' },
              expenses: { type: :string, example: '3200.00' }
            }
          }
        }
      }
    }
  }
}
```

**Validação:**
- [ ] Todos os schemas seguem a estrutura dos models Rails
- [ ] Enums definidos para todos os campos com valores fixos
- [ ] Referências ($ref) funcionando corretamente
- [ ] Exemplos realistas em todos os campos

---

## Tarefas Paralelas - Grupo 1: Documentação de Endpoints de Autenticação

Este grupo documenta todos os endpoints de autenticação e pode ser executado em paralelo após a Tarefa 3.

### Tarefa 4.1: Documentar Endpoints de Sign Up e Sign In

**Descrição:** Criar specs Swagger para os endpoints de cadastro (sign_up) e login (sign_in) com exemplos completos de requisições e respostas.

**Arquivos:**
- `/Users/thiagocardoso/Documents/Projects/finance-app/backend/spec/requests/api/v1/swagger/auth_spec.rb` (novo)

**Complexidade:** Média

**Dependências:** Tarefa 3

**Paralelizável:** Sim (com outras tarefas do Grupo 1)

**Passos Detalhados:**

1. **Criar arquivo auth_spec.rb:**

```ruby
# spec/requests/api/v1/swagger/auth_spec.rb
require 'swagger_helper'

RSpec.describe 'api/v1/auth', type: :request do
  path '/api/v1/auth/sign_up' do
    post 'Registrar novo usuário' do
      tags 'Authentication'
      consumes 'application/json'
      produces 'application/json'
      security []  # Endpoint público, sem autenticação

      description 'Cria uma nova conta de usuário. O usuário é automaticamente confirmado em desenvolvimento/test. Em produção, será enviado um email de confirmação.'

      parameter name: :user_params, in: :body, schema: {
        '$ref' => '#/components/schemas/UserSignUpRequest'
      }

      response '201', 'Usuário criado com sucesso' do
        schema '$ref' => '#/components/schemas/AuthTokensResponse'

        let(:user_params) do
          {
            user: {
              email: 'newuser@example.com',
              password: 'password123',
              password_confirmation: 'password123',
              first_name: 'John',
              last_name: 'Doe'
            }
          }
        end

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['success']).to eq(true)
          expect(data['data']).to have_key('access_token')
          expect(data['data']).to have_key('user')
        end
      end

      response '422', 'Erro de validação' do
        schema '$ref' => '#/components/schemas/Error'

        let(:user_params) do
          {
            user: {
              email: 'invalid-email',
              password: '123',
              password_confirmation: '456',
              first_name: '',
              last_name: ''
            }
          }
        end

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['success']).to eq(false)
          expect(data['errors']).to be_present
        end
      end
    end
  end

  path '/api/v1/auth/sign_in' do
    post 'Fazer login' do
      tags 'Authentication'
      consumes 'application/json'
      produces 'application/json'
      security []  # Endpoint público

      description 'Autentica um usuário existente e retorna tokens JWT (access_token e refresh_token).'

      parameter name: :credentials, in: :body, schema: {
        '$ref' => '#/components/schemas/UserSignInRequest'
      }

      response '200', 'Login bem-sucedido' do
        schema '$ref' => '#/components/schemas/AuthTokensResponse'

        let!(:user) do
          User.create!(
            email: 'test@example.com',
            password: 'password123',
            password_confirmation: 'password123',
            first_name: 'Test',
            last_name: 'User',
            confirmed_at: Time.now
          )
        end

        let(:credentials) do
          {
            user: {
              email: 'test@example.com',
              password: 'password123'
            }
          }
        end

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['success']).to eq(true)
          expect(data['data']['access_token']).to be_present
          expect(data['data']['refresh_token']).to be_present
        end
      end

      response '401', 'Credenciais inválidas' do
        schema '$ref' => '#/components/schemas/Error'

        let(:credentials) do
          {
            user: {
              email: 'wrong@example.com',
              password: 'wrongpassword'
            }
          }
        end

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['success']).to eq(false)
          expect(data['message']).to include('Invalid')
        end
      end
    end
  end

  path '/api/v1/auth/sign_out' do
    delete 'Fazer logout' do
      tags 'Authentication'
      consumes 'application/json'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      description 'Invalida o token JWT atual do usuário, fazendo logout.'

      parameter name: :Authorization,
                in: :header,
                type: :string,
                required: true,
                description: 'Bearer token',
                example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

      response '200', 'Logout bem-sucedido' do
        schema type: :object,
               properties: {
                 success: { type: :boolean, example: true },
                 message: { type: :string, example: 'Signed out successfully' },
                 data: { type: :object, example: {} }
               }

        let!(:user) { create(:user) }
        let(:Authorization) { "Bearer #{JwtService.generate_tokens(user)[:access_token]}" }

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['success']).to eq(true)
        end
      end

      response '401', 'Token inválido ou ausente' do
        schema '$ref' => '#/components/schemas/Error'

        let(:Authorization) { 'Bearer invalid_token' }

        run_test!
      end
    end
  end

  path '/api/v1/auth/refresh_token' do
    post 'Renovar token de acesso' do
      tags 'Authentication'
      consumes 'application/json'
      produces 'application/json'
      security []

      description 'Gera um novo access_token usando o refresh_token ainda válido.'

      parameter name: :refresh_params, in: :body, schema: {
        type: :object,
        properties: {
          refresh_token: {
            type: :string,
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            description: 'Refresh token válido'
          }
        },
        required: [:refresh_token]
      }

      response '200', 'Token renovado com sucesso' do
        schema type: :object,
               properties: {
                 success: { type: :boolean, example: true },
                 data: {
                   type: :object,
                   properties: {
                     access_token: { type: :string },
                     refresh_token: { type: :string },
                     token_type: { type: :string, example: 'Bearer' },
                     expires_in: { type: :integer, example: 86400 }
                   }
                 },
                 message: { type: :string, example: 'Token refreshed successfully' }
               }

        let!(:user) { create(:user) }
        let(:tokens) { JwtService.generate_tokens(user) }
        let(:refresh_params) { { refresh_token: tokens[:refresh_token] } }

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['success']).to eq(true)
          expect(data['data']['access_token']).to be_present
        end
      end

      response '401', 'Refresh token inválido' do
        schema '$ref' => '#/components/schemas/Error'

        let(:refresh_params) { { refresh_token: 'invalid_refresh_token' } }

        run_test!
      end
    end
  end
end
```

2. **Gerar documentação Swagger:**
```bash
SWAGGER_DRY_RUN=0 RAILS_ENV=test bundle exec rake rswag:specs:swaggerize
```

**Validação:**
- [ ] Specs passam quando executados: `bundle exec rspec spec/requests/api/v1/swagger/auth_spec.rb`
- [ ] Arquivo swagger.yaml gerado em `/swagger/v1/swagger.yaml`
- [ ] Endpoints aparecem no Swagger UI em http://localhost:3001/api-docs
- [ ] Botão "Try it out" funciona para sign_up e sign_in

---

### Tarefa 4.2: Documentar Endpoints de Recuperação de Senha

**Descrição:** Documentar endpoints de reset_password, update_password e confirm_email.

**Arquivos:**
- `/Users/thiagocardoso/Documents/Projects/finance-app/backend/spec/requests/api/v1/swagger/auth_spec.rb` (adicionar)

**Complexidade:** Baixa

**Dependências:** Tarefa 3

**Paralelizável:** Sim (com Tarefa 4.1)

**Passos Detalhados:**

1. **Adicionar specs de recuperação de senha no auth_spec.rb:**

```ruby
# Adicionar no final do arquivo auth_spec.rb

path '/api/v1/auth/reset_password' do
  post 'Solicitar reset de senha' do
    tags 'Authentication'
    consumes 'application/json'
    produces 'application/json'
    security []

    description 'Envia instruções para reset de senha para o email do usuário.'

    parameter name: :email_params, in: :body, schema: {
      type: :object,
      properties: {
        user: {
          type: :object,
          properties: {
            email: { type: :string, format: :email, example: 'user@example.com' }
          },
          required: [:email]
        }
      },
      required: [:user]
    }

    response '200', 'Instruções enviadas (sempre retorna sucesso por segurança)' do
      schema type: :object,
             properties: {
               success: { type: :boolean, example: true },
               message: { type: :string, example: 'Password reset instructions sent' },
               data: { type: :object, example: {} }
             }

      let(:email_params) { { user: { email: 'any@example.com' } } }

      run_test!
    end
  end
end

path '/api/v1/auth/update_password' do
  put 'Atualizar senha' do
    tags 'Authentication'
    consumes 'application/json'
    produces 'application/json'
    security []

    description 'Atualiza a senha do usuário usando o token recebido por email.'

    parameter name: :password_params, in: :body, schema: {
      type: :object,
      properties: {
        user: {
          type: :object,
          properties: {
            reset_password_token: { type: :string, example: 'abc123token' },
            password: { type: :string, format: :password, example: 'newpassword123' },
            password_confirmation: { type: :string, format: :password, example: 'newpassword123' }
          },
          required: [:reset_password_token, :password, :password_confirmation]
        }
      },
      required: [:user]
    }

    response '200', 'Senha atualizada com sucesso' do
      schema '$ref' => '#/components/schemas/AuthTokensResponse'

      let!(:user) { create(:user) }
      let(:token) { user.send(:set_reset_password_token) }
      let(:password_params) do
        {
          user: {
            reset_password_token: token,
            password: 'newpassword123',
            password_confirmation: 'newpassword123'
          }
        }
      end

      run_test!
    end

    response '422', 'Token inválido ou senha não confere' do
      schema '$ref' => '#/components/schemas/Error'

      let(:password_params) do
        {
          user: {
            reset_password_token: 'invalid_token',
            password: 'newpass',
            password_confirmation: 'differentpass'
          }
        }
      end

      run_test!
    end
  end
end

path '/api/v1/auth/confirm_email' do
  post 'Confirmar email' do
    tags 'Authentication'
    consumes 'application/json'
    produces 'application/json'
    security []

    description 'Confirma o email do usuário usando o token enviado.'

    parameter name: :confirmation_token, in: :query, type: :string, required: true, example: 'abc123token'

    response '200', 'Email confirmado com sucesso' do
      schema '$ref' => '#/components/schemas/AuthTokensResponse'

      let!(:user) { create(:user, confirmed_at: nil) }
      let(:confirmation_token) { user.confirmation_token }

      run_test!
    end

    response '422', 'Token de confirmação inválido' do
      schema '$ref' => '#/components/schemas/Error'

      let(:confirmation_token) { 'invalid_token' }

      run_test!
    end
  end
end
```

**Validação:**
- [ ] Specs passam
- [ ] Documentação gerada
- [ ] Todos os endpoints de auth visíveis no Swagger UI

---

## Tarefas Paralelas - Grupo 2: Documentação de Endpoints Core

### Tarefa 5.1: Documentar Endpoints de Transações (CRUD)

**Descrição:** Documentar todos os endpoints CRUD de transações (index, show, create, update, destroy).

**Arquivos:**
- `/Users/thiagocardoso/Documents/Projects/finance-app/backend/spec/requests/api/v1/swagger/transactions_spec.rb` (novo)

**Complexidade:** Alta

**Dependências:** Tarefa 3

**Paralelizável:** Sim (com outras tarefas do Grupo 2)

**Passos Detalhados:**

1. **Criar transactions_spec.rb:**

```ruby
# spec/requests/api/v1/swagger/transactions_spec.rb
require 'swagger_helper'

RSpec.describe 'api/v1/transactions', type: :request do
  let!(:user) { create(:user) }
  let(:Authorization) { "Bearer #{JwtService.generate_tokens(user)[:access_token]}" }
  let!(:category) { create(:category, user: user) }
  let!(:account) { create(:account, user: user) }

  path '/api/v1/transactions' do
    get 'Listar transações' do
      tags 'Transactions'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      description 'Lista todas as transações do usuário autenticado com paginação e filtros.'

      parameter name: :Authorization, in: :header, type: :string, required: true
      parameter name: :page, in: :query, type: :integer, required: false, description: 'Número da página (default: 1)'
      parameter name: :per_page, in: :query, type: :integer, required: false, description: 'Itens por página (max: 100, default: 20)'
      parameter name: :category_id, in: :query, type: :integer, required: false, description: 'Filtrar por categoria'
      parameter name: :transaction_type, in: :query, type: :string, enum: ['income', 'expense', 'transfer'], required: false
      parameter name: :date_from, in: :query, type: :string, format: :date, required: false, description: 'Data inicial (YYYY-MM-DD)'
      parameter name: :date_to, in: :query, type: :string, format: :date, required: false, description: 'Data final (YYYY-MM-DD)'
      parameter name: :search, in: :query, type: :string, required: false, description: 'Buscar na descrição'

      response '200', 'Lista de transações retornada' do
        schema '$ref' => '#/components/schemas/TransactionListResponse'

        let!(:transactions) { create_list(:transaction, 5, user: user) }

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['success']).to eq(true)
          expect(data['data']).to be_an(Array)
          expect(data['meta']['pagination']).to be_present
        end
      end

      response '401', 'Não autorizado' do
        schema '$ref' => '#/components/schemas/Error'

        let(:Authorization) { 'Bearer invalid_token' }

        run_test!
      end
    end

    post 'Criar transação' do
      tags 'Transactions'
      consumes 'application/json'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      description 'Cria uma nova transação (receita, despesa ou transferência).'

      parameter name: :Authorization, in: :header, type: :string, required: true
      parameter name: :transaction_params, in: :body, schema: {
        '$ref' => '#/components/schemas/TransactionRequest'
      }

      response '201', 'Transação criada com sucesso' do
        schema type: :object,
               properties: {
                 success: { type: :boolean, example: true },
                 data: { '$ref' => '#/components/schemas/Transaction' },
                 message: { type: :string, example: 'Transaction created successfully' }
               }

        let(:transaction_params) do
          {
            transaction: {
              description: 'Supermercado',
              amount: '150.00',
              transaction_type: 'expense',
              date: Date.current.to_s,
              category_id: category.id,
              account_id: account.id
            }
          }
        end

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['success']).to eq(true)
          expect(data['data']['description']).to eq('Supermercado')
        end
      end

      response '422', 'Dados inválidos' do
        schema '$ref' => '#/components/schemas/Error'

        let(:transaction_params) do
          {
            transaction: {
              description: '',
              amount: '',
              transaction_type: 'invalid'
            }
          }
        end

        run_test!
      end
    end
  end

  path '/api/v1/transactions/{id}' do
    parameter name: :id, in: :path, type: :integer, description: 'ID da transação'

    get 'Exibir transação' do
      tags 'Transactions'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      parameter name: :Authorization, in: :header, type: :string, required: true

      response '200', 'Transação encontrada' do
        schema type: :object,
               properties: {
                 success: { type: :boolean, example: true },
                 data: { '$ref' => '#/components/schemas/Transaction' }
               }

        let!(:transaction) { create(:transaction, user: user) }
        let(:id) { transaction.id }

        run_test!
      end

      response '404', 'Transação não encontrada' do
        schema '$ref' => '#/components/schemas/Error'

        let(:id) { 999999 }

        run_test!
      end
    end

    put 'Atualizar transação' do
      tags 'Transactions'
      consumes 'application/json'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      parameter name: :Authorization, in: :header, type: :string, required: true
      parameter name: :transaction_params, in: :body, schema: {
        '$ref' => '#/components/schemas/TransactionRequest'
      }

      response '200', 'Transação atualizada' do
        schema type: :object,
               properties: {
                 success: { type: :boolean, example: true },
                 data: { '$ref' => '#/components/schemas/Transaction' },
                 message: { type: :string, example: 'Transaction updated successfully' }
               }

        let!(:transaction) { create(:transaction, user: user) }
        let(:id) { transaction.id }
        let(:transaction_params) do
          {
            transaction: {
              description: 'Descrição Atualizada',
              amount: '200.00'
            }
          }
        end

        run_test!
      end
    end

    delete 'Excluir transação' do
      tags 'Transactions'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      parameter name: :Authorization, in: :header, type: :string, required: true

      response '200', 'Transação excluída' do
        schema type: :object,
               properties: {
                 success: { type: :boolean, example: true },
                 message: { type: :string, example: 'Transaction deleted successfully' }
               }

        let!(:transaction) { create(:transaction, user: user) }
        let(:id) { transaction.id }

        run_test!
      end
    end
  end
end
```

**Validação:**
- [ ] Specs passam
- [ ] CRUD completo documentado
- [ ] Filtros de paginação funcionando

---

### Tarefa 5.2: Documentar Endpoints Adicionais de Transações

**Descrição:** Documentar endpoints de summary, search, filter_options, search_suggestions e export.

**Arquivos:**
- `/Users/thiagocardoso/Documents/Projects/finance-app/backend/spec/requests/api/v1/swagger/transactions_spec.rb` (adicionar)

**Complexidade:** Média

**Dependências:** Tarefa 3

**Paralelizável:** Sim (com Tarefa 5.1)

**Passos Detalhados:**

1. **Adicionar no transactions_spec.rb:**

```ruby
# Adicionar após os endpoints CRUD

path '/api/v1/transactions/summary' do
  get 'Resumo de transações' do
    tags 'Transactions'
    produces 'application/json'
    security [{ bearerAuth: [] }]

    description 'Retorna resumo financeiro (receitas, despesas, saldo) para um período.'

    parameter name: :Authorization, in: :header, type: :string, required: true
    parameter name: :start_date, in: :query, type: :string, format: :date, required: false
    parameter name: :end_date, in: :query, type: :string, format: :date, required: false

    response '200', 'Resumo gerado' do
      schema type: :object,
             properties: {
               success: { type: :boolean, example: true },
               data: {
                 type: :object,
                 properties: {
                   total_income: { type: :string, example: '5500.00' },
                   total_expenses: { type: :string, example: '3200.00' },
                   balance: { type: :string, example: '2300.00' },
                   period: {
                     type: :object,
                     properties: {
                       start_date: { type: :string, format: :date },
                       end_date: { type: :string, format: :date }
                     }
                   }
                 }
               }
             }

      run_test!
    end
  end
end

path '/api/v1/transactions/search' do
  get 'Buscar transações' do
    tags 'Transactions'
    produces 'application/json'
    security [{ bearerAuth: [] }]

    description 'Busca avançada de transações com múltiplos filtros.'

    parameter name: :Authorization, in: :header, type: :string, required: true
    parameter name: :search, in: :query, type: :string, required: false
    parameter name: :category_id, in: :query, type: :integer, required: false
    parameter name: :min_amount, in: :query, type: :number, required: false
    parameter name: :max_amount, in: :query, type: :number, required: false

    response '200', 'Resultados da busca' do
      schema '$ref' => '#/components/schemas/TransactionListResponse'

      run_test!
    end
  end
end

path '/api/v1/transactions/filter_options' do
  get 'Opções de filtros disponíveis' do
    tags 'Transactions'
    produces 'application/json'
    security [{ bearerAuth: [] }]

    description 'Retorna todas as opções disponíveis para filtrar transações (categorias, contas, tipos).'

    parameter name: :Authorization, in: :header, type: :string, required: true

    response '200', 'Opções de filtro' do
      schema type: :object,
             properties: {
               success: { type: :boolean, example: true },
               data: {
                 type: :object,
                 properties: {
                   categories: {
                     type: :array,
                     items: { '$ref' => '#/components/schemas/CategorySummary' }
                   },
                   accounts: {
                     type: :array,
                     items: { '$ref' => '#/components/schemas/AccountSummary' }
                   },
                   transaction_types: {
                     type: :array,
                     items: { type: :string },
                     example: ['income', 'expense', 'transfer']
                   }
                 }
               }
             }

      run_test!
    end
  end
end

path '/api/v1/transactions/search_suggestions' do
  get 'Sugestões de busca' do
    tags 'Transactions'
    produces 'application/json'
    security [{ bearerAuth: [] }]

    description 'Retorna sugestões de descrições de transações baseadas no histórico.'

    parameter name: :Authorization, in: :header, type: :string, required: true
    parameter name: :query, in: :query, type: :string, required: true, description: 'Termo de busca (mínimo 2 caracteres)'

    response '200', 'Sugestões retornadas' do
      schema type: :object,
             properties: {
               success: { type: :boolean, example: true },
               data: {
                 type: :array,
                 items: { type: :string },
                 example: ['Supermercado Extra', 'Supermercado Carrefour']
               }
             }

      let(:query) { 'super' }

      run_test!
    end
  end
end
```

**Validação:**
- [ ] Todos os endpoints adicionais documentados
- [ ] Specs passam
- [ ] Exemplos realistas

---

### Tarefa 5.3: Documentar Endpoints de Categorias

**Descrição:** Documentar CRUD completo de categorias e endpoint de statistics.

**Arquivos:**
- `/Users/thiagocardoso/Documents/Projects/finance-app/backend/spec/requests/api/v1/swagger/categories_spec.rb` (novo)

**Complexidade:** Média

**Dependências:** Tarefa 3

**Paralelizável:** Sim (com tarefas 5.1 e 5.2)

**Passos Detalhados:**

1. **Criar categories_spec.rb:**

```ruby
# spec/requests/api/v1/swagger/categories_spec.rb
require 'swagger_helper'

RSpec.describe 'api/v1/categories', type: :request do
  let!(:user) { create(:user) }
  let(:Authorization) { "Bearer #{JwtService.generate_tokens(user)[:access_token]}" }

  path '/api/v1/categories' do
    get 'Listar categorias' do
      tags 'Categories'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      description 'Lista todas as categorias do usuário (padrão + personalizadas).'

      parameter name: :Authorization, in: :header, type: :string, required: true

      response '200', 'Lista de categorias' do
        schema type: :object,
               properties: {
                 success: { type: :boolean, example: true },
                 data: {
                   type: :array,
                   items: { '$ref' => '#/components/schemas/Category' }
                 }
               }

        let!(:categories) { create_list(:category, 3, user: user) }

        run_test!
      end
    end

    post 'Criar categoria' do
      tags 'Categories'
      consumes 'application/json'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      parameter name: :Authorization, in: :header, type: :string, required: true
      parameter name: :category_params, in: :body, schema: {
        '$ref' => '#/components/schemas/CategoryRequest'
      }

      response '201', 'Categoria criada' do
        schema type: :object,
               properties: {
                 success: { type: :boolean, example: true },
                 data: { '$ref' => '#/components/schemas/Category' },
                 message: { type: :string }
               }

        let(:category_params) do
          {
            category: {
              name: 'Nova Categoria',
              color: '#3b82f6',
              icon: 'star',
              category_type: 'expense'
            }
          }
        end

        run_test!
      end
    end
  end

  path '/api/v1/categories/{id}' do
    parameter name: :id, in: :path, type: :integer

    put 'Atualizar categoria' do
      tags 'Categories'
      consumes 'application/json'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      parameter name: :Authorization, in: :header, type: :string, required: true
      parameter name: :category_params, in: :body, schema: {
        '$ref' => '#/components/schemas/CategoryRequest'
      }

      response '200', 'Categoria atualizada' do
        let!(:category) { create(:category, user: user) }
        let(:id) { category.id }
        let(:category_params) do
          { category: { name: 'Nome Atualizado' } }
        end

        run_test!
      end
    end

    delete 'Excluir categoria' do
      tags 'Categories'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      parameter name: :Authorization, in: :header, type: :string, required: true

      response '200', 'Categoria excluída' do
        let!(:category) { create(:category, user: user) }
        let(:id) { category.id }

        run_test!
      end
    end
  end

  path '/api/v1/categories/statistics' do
    get 'Estatísticas de categorias' do
      tags 'Categories'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      description 'Retorna estatísticas de gastos/receitas por categoria.'

      parameter name: :Authorization, in: :header, type: :string, required: true

      response '200', 'Estatísticas geradas' do
        run_test!
      end
    end
  end
end
```

**Validação:**
- [ ] CRUD de categorias documentado
- [ ] Endpoint de statistics incluído
- [ ] Specs passam

---

### Tarefa 5.4: Documentar Endpoints de Dashboard

**Descrição:** Documentar o endpoint GET /api/v1/dashboard que retorna resumo financeiro completo.

**Arquivos:**
- `/Users/thiagocardoso/Documents/Projects/finance-app/backend/spec/requests/api/v1/swagger/dashboard_spec.rb` (novo)

**Complexidade:** Baixa

**Dependências:** Tarefa 3

**Paralelizável:** Sim (com outras tarefas do Grupo 2)

**Passos Detalhados:**

1. **Criar dashboard_spec.rb:**

```ruby
# spec/requests/api/v1/swagger/dashboard_spec.rb
require 'swagger_helper'

RSpec.describe 'api/v1/dashboard', type: :request do
  let!(:user) { create(:user) }
  let(:Authorization) { "Bearer #{JwtService.generate_tokens(user)[:access_token]}" }

  path '/api/v1/dashboard' do
    get 'Resumo do dashboard' do
      tags 'Dashboard'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      description 'Retorna visão geral completa das finanças: resumo mensal, transações recentes, top categorias e evolução mensal.'

      parameter name: :Authorization, in: :header, type: :string, required: true

      response '200', 'Dashboard retornado com sucesso' do
        schema '$ref' => '#/components/schemas/DashboardSummary'

        let!(:transactions) { create_list(:transaction, 5, user: user) }

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['success']).to eq(true)
          expect(data['data']).to have_key('summary')
          expect(data['data']).to have_key('recent_transactions')
        end
      end

      response '401', 'Não autorizado' do
        schema '$ref' => '#/components/schemas/Error'

        let(:Authorization) { 'Bearer invalid_token' }

        run_test!
      end
    end
  end
end
```

**Validação:**
- [ ] Endpoint documentado
- [ ] Schema DashboardSummary utilizado
- [ ] Spec passa

---

## Tarefas Paralelas - Grupo 3: Documentação de Endpoints Avançados

### Tarefa 6.1: Documentar Endpoints de Accounts

**Descrição:** Documentar CRUD de contas bancárias e endpoints de balance, transactions, transfer.

**Arquivos:**
- `/Users/thiagocardoso/Documents/Projects/finance-app/backend/spec/requests/api/v1/swagger/accounts_spec.rb` (novo)

**Complexidade:** Média

**Dependências:** Tarefa 3

**Paralelizável:** Sim (com outras tarefas do Grupo 3)

**Passos Detalhados:**

1. **Criar accounts_spec.rb com CRUD e métodos especiais:**

```ruby
# spec/requests/api/v1/swagger/accounts_spec.rb
require 'swagger_helper'

RSpec.describe 'api/v1/accounts', type: :request do
  let!(:user) { create(:user) }
  let(:Authorization) { "Bearer #{JwtService.generate_tokens(user)[:access_token]}" }

  path '/api/v1/accounts' do
    get 'Listar contas' do
      tags 'Accounts'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      parameter name: :Authorization, in: :header, type: :string, required: true

      response '200', 'Lista de contas' do
        let!(:accounts) { create_list(:account, 3, user: user) }
        run_test!
      end
    end

    post 'Criar conta' do
      tags 'Accounts'
      consumes 'application/json'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      parameter name: :Authorization, in: :header, type: :string, required: true
      parameter name: :account_params, in: :body, schema: {
        '$ref' => '#/components/schemas/AccountRequest'
      }

      response '201', 'Conta criada' do
        let(:account_params) do
          {
            account: {
              name: 'Nubank',
              account_type: 'checking',
              initial_balance: '1000.00'
            }
          }
        end

        run_test!
      end
    end
  end

  path '/api/v1/accounts/{id}/balance' do
    parameter name: :id, in: :path, type: :integer

    get 'Consultar saldo da conta' do
      tags 'Accounts'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      parameter name: :Authorization, in: :header, type: :string, required: true

      response '200', 'Saldo retornado' do
        let!(:account) { create(:account, user: user) }
        let(:id) { account.id }

        run_test!
      end
    end
  end

  path '/api/v1/accounts/transfer' do
    post 'Transferir entre contas' do
      tags 'Accounts'
      consumes 'application/json'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      description 'Realiza transferência entre duas contas do usuário.'

      parameter name: :Authorization, in: :header, type: :string, required: true
      parameter name: :transfer_params, in: :body, schema: {
        type: :object,
        properties: {
          from_account_id: { type: :integer, example: 1 },
          to_account_id: { type: :integer, example: 2 },
          amount: { type: :string, example: '500.00' },
          description: { type: :string, example: 'Transferência interna' },
          date: { type: :string, format: :date }
        },
        required: [:from_account_id, :to_account_id, :amount]
      }

      response '201', 'Transferência realizada' do
        let!(:account1) { create(:account, user: user) }
        let!(:account2) { create(:account, user: user) }
        let(:transfer_params) do
          {
            from_account_id: account1.id,
            to_account_id: account2.id,
            amount: '500.00',
            description: 'Transferência',
            date: Date.current.to_s
          }
        end

        run_test!
      end
    end
  end
end
```

**Validação:**
- [ ] CRUD documentado
- [ ] Endpoints especiais (balance, transfer) incluídos
- [ ] Specs passam

---

### Tarefa 6.2: Documentar Endpoints de Budgets e Goals

**Descrição:** Documentar CRUD de orçamentos (budgets) e metas (goals), incluindo endpoints especiais.

**Arquivos:**
- `/Users/thiagocardoso/Documents/Projects/finance-app/backend/spec/requests/api/v1/swagger/budgets_spec.rb` (novo)
- `/Users/thiagocardoso/Documents/Projects/finance-app/backend/spec/requests/api/v1/swagger/goals_spec.rb` (novo)

**Complexidade:** Média

**Dependências:** Tarefa 3

**Paralelizável:** Sim (com Tarefa 6.1)

**Passos Detalhados:**

1. **Criar budgets_spec.rb:**

```ruby
# spec/requests/api/v1/swagger/budgets_spec.rb
require 'swagger_helper'

RSpec.describe 'api/v1/budgets', type: :request do
  let!(:user) { create(:user) }
  let(:Authorization) { "Bearer #{JwtService.generate_tokens(user)[:access_token]}" }
  let!(:category) { create(:category, user: user) }

  path '/api/v1/budgets' do
    get 'Listar orçamentos' do
      tags 'Budgets'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      parameter name: :Authorization, in: :header, type: :string, required: true

      response '200', 'Lista de orçamentos' do
        let!(:budgets) { create_list(:budget, 3, user: user, category: category) }
        run_test!
      end
    end

    post 'Criar orçamento' do
      tags 'Budgets'
      consumes 'application/json'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      parameter name: :Authorization, in: :header, type: :string, required: true
      parameter name: :budget_params, in: :body, schema: {
        '$ref' => '#/components/schemas/BudgetRequest'
      }

      response '201', 'Orçamento criado' do
        let(:budget_params) do
          {
            budget: {
              category_id: category.id,
              amount_limit: '1000.00',
              period: 'monthly',
              start_date: Date.current.beginning_of_month.to_s,
              end_date: Date.current.end_of_month.to_s
            }
          }
        end

        run_test!
      end
    end
  end

  path '/api/v1/budgets/current' do
    get 'Orçamentos do período atual' do
      tags 'Budgets'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      description 'Retorna orçamentos ativos para o mês/período atual.'

      parameter name: :Authorization, in: :header, type: :string, required: true

      response '200', 'Orçamentos atuais' do
        run_test!
      end
    end
  end

  path '/api/v1/budgets/alerts' do
    get 'Alertas de orçamento' do
      tags 'Budgets'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      description 'Retorna orçamentos que atingiram 80% ou 100% do limite.'

      parameter name: :Authorization, in: :header, type: :string, required: true

      response '200', 'Alertas de orçamento' do
        run_test!
      end
    end
  end
end
```

2. **Criar goals_spec.rb:**

```ruby
# spec/requests/api/v1/swagger/goals_spec.rb
require 'swagger_helper'

RSpec.describe 'api/v1/goals', type: :request do
  let!(:user) { create(:user) }
  let(:Authorization) { "Bearer #{JwtService.generate_tokens(user)[:access_token]}" }

  path '/api/v1/goals' do
    get 'Listar metas' do
      tags 'Goals'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      parameter name: :Authorization, in: :header, type: :string, required: true

      response '200', 'Lista de metas' do
        let!(:goals) { create_list(:goal, 3, user: user) }
        run_test!
      end
    end

    post 'Criar meta' do
      tags 'Goals'
      consumes 'application/json'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      parameter name: :Authorization, in: :header, type: :string, required: true
      parameter name: :goal_params, in: :body, schema: {
        '$ref' => '#/components/schemas/GoalRequest'
      }

      response '201', 'Meta criada' do
        let(:goal_params) do
          {
            goal: {
              title: 'Casa Própria',
              description: 'Economizar para entrada',
              target_amount: '50000.00',
              target_date: 1.year.from_now.to_date.to_s
            }
          }
        end

        run_test!
      end
    end
  end

  path '/api/v1/goals/{id}' do
    parameter name: :id, in: :path, type: :integer

    patch 'Atualizar progresso da meta' do
      tags 'Goals'
      consumes 'application/json'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      description 'Atualiza o valor atual da meta (current_amount).'

      parameter name: :Authorization, in: :header, type: :string, required: true
      parameter name: :update_params, in: :body, schema: {
        type: :object,
        properties: {
          current_amount: { type: :string, example: '12500.00' }
        },
        required: [:current_amount]
      }

      response '200', 'Progresso atualizado' do
        let!(:goal) { create(:goal, user: user) }
        let(:id) { goal.id }
        let(:update_params) { { current_amount: '15000.00' } }

        run_test!
      end
    end
  end
end
```

**Validação:**
- [ ] Budgets CRUD documentado
- [ ] Goals CRUD documentado
- [ ] Endpoints especiais incluídos (current, alerts, update_progress)
- [ ] Specs passam

---

### Tarefa 6.3: Documentar Endpoints de Reports e Analytics

**Descrição:** Documentar todos os endpoints de relatórios (reports namespace) e analytics.

**Arquivos:**
- `/Users/thiagocardoso/Documents/Projects/finance-app/backend/spec/requests/api/v1/swagger/reports_spec.rb` (novo)
- `/Users/thiagocardoso/Documents/Projects/finance-app/backend/spec/requests/api/v1/swagger/analytics_spec.rb` (novo)

**Complexidade:** Média

**Dependências:** Tarefa 3

**Paralelizável:** Sim (com tarefas 6.1 e 6.2)

**Passos Detalhados:**

1. **Criar reports_spec.rb:**

```ruby
# spec/requests/api/v1/swagger/reports_spec.rb
require 'swagger_helper'

RSpec.describe 'api/v1/reports', type: :request do
  let!(:user) { create(:user) }
  let(:Authorization) { "Bearer #{JwtService.generate_tokens(user)[:access_token]}" }

  path '/api/v1/reports/monthly' do
    get 'Relatório mensal' do
      tags 'Reports'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      description 'Relatório de receitas e despesas do mês.'

      parameter name: :Authorization, in: :header, type: :string, required: true
      parameter name: :month, in: :query, type: :integer, required: false, description: 'Mês (1-12)'
      parameter name: :year, in: :query, type: :integer, required: false, description: 'Ano'

      response '200', 'Relatório mensal gerado' do
        run_test!
      end
    end
  end

  path '/api/v1/reports/category' do
    get 'Relatório por categoria' do
      tags 'Reports'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      description 'Análise de gastos/receitas por categoria.'

      parameter name: :Authorization, in: :header, type: :string, required: true

      response '200', 'Relatório por categoria' do
        run_test!
      end
    end
  end

  path '/api/v1/reports/cash_flow' do
    get 'Relatório de fluxo de caixa' do
      tags 'Reports'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      parameter name: :Authorization, in: :header, type: :string, required: true

      response '200', 'Fluxo de caixa gerado' do
        run_test!
      end
    end
  end

  path '/api/v1/reports/export' do
    get 'Exportar relatórios' do
      tags 'Reports'
      produces 'application/pdf, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      security [{ bearerAuth: [] }]

      description 'Exporta relatórios em PDF ou Excel.'

      parameter name: :Authorization, in: :header, type: :string, required: true
      parameter name: :format, in: :query, type: :string, enum: ['pdf', 'xlsx'], required: true

      response '200', 'Arquivo exportado' do
        let(:format) { 'pdf' }
        run_test!
      end
    end
  end
end
```

2. **Criar analytics_spec.rb:**

```ruby
# spec/requests/api/v1/swagger/analytics_spec.rb
require 'swagger_helper'

RSpec.describe 'api/v1/analytics', type: :request do
  let!(:user) { create(:user) }
  let(:Authorization) { "Bearer #{JwtService.generate_tokens(user)[:access_token]}" }

  path '/api/v1/analytics/financial_summary' do
    get 'Resumo financeiro analítico' do
      tags 'Analytics'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      parameter name: :Authorization, in: :header, type: :string, required: true

      response '200', 'Resumo analítico' do
        run_test!
      end
    end
  end

  path '/api/v1/analytics/budget_performance' do
    get 'Performance de orçamentos' do
      tags 'Analytics'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      parameter name: :Authorization, in: :header, type: :string, required: true

      response '200', 'Performance calculada' do
        run_test!
      end
    end
  end

  path '/api/v1/analytics/export' do
    get 'Exportar analytics' do
      tags 'Analytics'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      parameter name: :Authorization, in: :header, type: :string, required: true

      response '200', 'Dados exportados' do
        run_test!
      end
    end
  end
end
```

**Validação:**
- [ ] Todos os endpoints de reports documentados
- [ ] Endpoints de analytics incluídos
- [ ] Specs passam

---

## Tarefas Sequenciais Finais

### Tarefa 7: Configuração de Autenticação JWT no Swagger UI

**Descrição:** Configurar o Swagger UI para aceitar tokens JWT e permitir testes de endpoints autenticados diretamente na interface.

**Arquivos:**
- `/Users/thiagocardoso/Documents/Projects/finance-app/backend/config/initializers/rswag_ui.rb`
- `/Users/thiagocardoso/Documents/Projects/finance-app/backend/public/swagger-ui-custom.js` (novo)

**Complexidade:** Média

**Dependências:** Tarefas 1-6 (todas as anteriores)

**Passos Detalhados:**

1. **Atualizar rswag_ui.rb com configuração de autenticação:**

```ruby
# config/initializers/rswag_ui.rb
Rswag::Ui.configure do |c|
  c.openapi_endpoint '/api-docs/v1/swagger.yaml', 'API V1 Docs'

  c.config_object = {
    deepLinking: true,
    displayRequestDuration: true,
    defaultModelsExpandDepth: 3,
    defaultModelExpandDepth: 3,
    docExpansion: 'list',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,

    # Habilitar autenticação persistente
    persistAuthorization: true,

    # Configuração de segurança
    supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],

    # Mostrar botão de autorização
    oauth2RedirectUrl: "#{ENV.fetch('API_URL', 'http://localhost:3001')}/api-docs/oauth2-redirect.html"
  }
end
```

2. **Criar arquivo de customização JavaScript (opcional):**

```javascript
// public/swagger-ui-custom.js
window.onload = function() {
  // Customizações opcionais do Swagger UI
  const ui = SwaggerUIBundle({
    // ... configurações
    onComplete: function() {
      // Verificar se existe token salvo no localStorage
      const savedToken = localStorage.getItem('swagger_auth_token');
      if (savedToken) {
        ui.preauthorizeApiKey('bearerAuth', savedToken);
      }
    },
    // Interceptar requisições para salvar token
    requestInterceptor: function(request) {
      if (request.headers.Authorization) {
        const token = request.headers.Authorization.replace('Bearer ', '');
        localStorage.setItem('swagger_auth_token', token);
      }
      return request;
    }
  });
};
```

3. **Adicionar instruções de uso no início do swagger.yaml:**

Adicionar no swagger_helper.rb:
```ruby
info: {
  title: 'Finance App API',
  version: 'v1',
  description: <<~DESC
    API para controle financeiro pessoal.

    ## Autenticação

    Esta API usa autenticação JWT (JSON Web Tokens). Para usar endpoints autenticados:

    1. Faça login usando o endpoint `POST /api/v1/auth/sign_in`
    2. Copie o `access_token` da resposta
    3. Clique no botão "Authorize" no topo desta página
    4. Cole o token no campo (sem adicionar "Bearer")
    5. Clique em "Authorize" e depois "Close"

    Agora você pode testar todos os endpoints autenticados!

    ## Rate Limiting

    - Geral: 1000 requests/hora por usuário
    - Login: 10 requests/minuto por IP
    - Export: 5 requests/minuto por usuário
  DESC
}
```

**Validação:**
- [ ] Botão "Authorize" aparece no topo do Swagger UI
- [ ] É possível adicionar token JWT
- [ ] Após autorizar, endpoints protegidos funcionam com "Try it out"
- [ ] Token persiste entre recarregamentos (se implementou localStorage)

---

### Tarefa 8: Customização Visual e UX do Swagger UI

**Descrição:** Customizar a aparência do Swagger UI para combinar com a identidade visual da aplicação e melhorar a experiência do usuário.

**Arquivos:**
- `/Users/thiagocardoso/Documents/Projects/finance-app/backend/app/views/layouts/rswag_ui.html.erb` (novo)
- `/Users/thiagocardoso/Documents/Projects/finance-app/backend/app/assets/stylesheets/swagger-custom.css` (novo)

**Complexidade:** Baixa

**Dependências:** Tarefa 7

**Passos Detalhados:**

1. **Criar layout customizado:**

```erb
<!-- app/views/layouts/rswag_ui.html.erb -->
<!DOCTYPE html>
<html>
<head>
  <title>Finance App API Documentation</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <%= csrf_meta_tags %>

  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
  <%= stylesheet_link_tag 'swagger-custom', media: 'all' %>

  <style>
    /* Custom branding */
    .topbar {
      background-color: #3b82f6 !important;
    }

    .topbar-wrapper img {
      content: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><text x="0" y="30" font-size="30">💰</text></svg>');
    }

    .swagger-ui .topbar .download-url-wrapper {
      display: none;
    }

    .info .title {
      color: #1e40af;
      font-size: 36px;
    }

    /* Highlight authentication section */
    .swagger-ui .scheme-container {
      background: #eff6ff;
      border: 2px solid #3b82f6;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
    }

    /* Improve readability */
    .swagger-ui .opblock .opblock-summary {
      border-left-width: 5px;
    }

    .swagger-ui .opblock.opblock-get .opblock-summary {
      border-left-color: #10b981;
    }

    .swagger-ui .opblock.opblock-post .opblock-summary {
      border-left-color: #3b82f6;
    }

    .swagger-ui .opblock.opblock-delete .opblock-summary {
      border-left-color: #ef4444;
    }
  </style>
</head>
<body>
  <%= yield %>

  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
</body>
</html>
```

2. **Adicionar cabeçalho customizado:**

Configurar no rswag_ui.rb:
```ruby
c.config_object[:customCss] = <<~CSS
  .topbar-wrapper::before {
    content: "Finance App API";
    color: white;
    font-size: 20px;
    font-weight: bold;
    margin-right: 20px;
  }
CSS
```

**Validação:**
- [ ] Logo/título customizado aparece
- [ ] Cores ajustadas para identidade da aplicação
- [ ] Layout responsivo funcionando
- [ ] Sem erros de console

---

### Tarefa 9: Testes de Integração e Validação Final

**Descrição:** Executar todos os testes Swagger, validar a documentação gerada e corrigir quaisquer inconsistências.

**Arquivos:**
- Todos os arquivos `spec/requests/api/v1/swagger/*_spec.rb`
- `/Users/thiagocardoso/Documents/Projects/finance-app/backend/swagger/v1/swagger.yaml`

**Complexidade:** Média

**Dependências:** Tarefas 1-8 (todas)

**Passos Detalhados:**

1. **Executar todos os specs Swagger:**

```bash
cd /Users/thiagocardoso/Documents/Projects/finance-app/backend

# Executar apenas specs Swagger
bundle exec rspec spec/requests/api/v1/swagger --format documentation

# Gerar documentação
SWAGGER_DRY_RUN=0 RAILS_ENV=test bundle exec rake rswag:specs:swaggerize
```

2. **Verificar arquivo swagger.yaml gerado:**

```bash
# Verificar se foi gerado
ls -lh swagger/v1/swagger.yaml

# Validar sintaxe YAML
ruby -ryaml -e "YAML.load_file('swagger/v1/swagger.yaml')"
```

3. **Criar script de validação:**

```ruby
# lib/tasks/swagger_validate.rake
namespace :swagger do
  desc 'Validate Swagger documentation completeness'
  task validate: :environment do
    yaml_file = Rails.root.join('swagger', 'v1', 'swagger.yaml')

    unless File.exist?(yaml_file)
      puts "❌ Swagger YAML not found. Run 'rake rswag:specs:swaggerize' first."
      exit 1
    end

    spec = YAML.load_file(yaml_file)

    # Validar que todos os controllers têm documentação
    expected_tags = ['Authentication', 'Dashboard', 'Transactions', 'Categories',
                     'Accounts', 'Budgets', 'Goals', 'Reports', 'Analytics', 'Health']

    documented_tags = spec['tags']&.map { |t| t['name'] } || []
    missing_tags = expected_tags - documented_tags

    if missing_tags.any?
      puts "⚠️  Missing documentation for: #{missing_tags.join(', ')}"
    end

    # Contar endpoints
    total_paths = spec['paths']&.size || 0
    puts "\n📊 Documentation Statistics:"
    puts "  Total endpoints: #{total_paths}"
    puts "  Total tags: #{documented_tags.size}"
    puts "  Schemas defined: #{spec.dig('components', 'schemas')&.size || 0}"

    # Validar que todos os endpoints têm exemplos
    paths_without_examples = []
    spec['paths']&.each do |path, methods|
      methods.each do |method, details|
        next if method == 'parameters'
        if details['responses']&.dig('200', 'content', 'application/json', 'example').nil?
          paths_without_examples << "#{method.upcase} #{path}"
        end
      end
    end

    if paths_without_examples.any?
      puts "\n⚠️  Endpoints without examples:"
      paths_without_examples.each { |p| puts "    - #{p}" }
    else
      puts "\n✅ All endpoints have examples!"
    end

    puts "\n✅ Swagger documentation validation complete!"
  end
end
```

4. **Executar validação:**

```bash
bundle exec rake swagger:validate
```

5. **Testar endpoints manualmente no Swagger UI:**

Checklist de testes manuais:
- [ ] Acessar http://localhost:3001/api-docs
- [ ] UI carrega sem erros
- [ ] Fazer sign_up de um novo usuário
- [ ] Copiar access_token da resposta
- [ ] Clicar em "Authorize" e colar token
- [ ] Testar GET /api/v1/dashboard (deve retornar 200)
- [ ] Testar POST /api/v1/transactions (criar transação)
- [ ] Testar GET /api/v1/transactions (listar transações)
- [ ] Testar filtros e paginação
- [ ] Testar ao menos 1 endpoint de cada tag/controller
- [ ] Fazer logout e verificar que endpoints protegidos retornam 401

6. **Verificar documentação de erros:**

Testar cenários de erro:
- [ ] Tentar acessar endpoint protegido sem token (401)
- [ ] Tentar criar transação com dados inválidos (422)
- [ ] Tentar acessar recurso inexistente (404)

**Validação:**
- [ ] Todos os specs Swagger passam (100% green)
- [ ] swagger.yaml gerado sem erros
- [ ] Validação customizada passa
- [ ] Testes manuais no Swagger UI funcionam
- [ ] Todos os cenários de erro documentados

---

### Tarefa 10: Documentação de Uso e Deployment

**Descrição:** Criar documentação para desenvolvedores sobre como usar e manter a documentação Swagger, além de configurar para produção.

**Arquivos:**
- `/Users/thiagocardoso/Documents/Projects/finance-app/docs/swagger-setup.md` (novo)
- `/Users/thiagocardoso/Documents/Projects/finance-app/backend/config/environments/production.rb`
- `/Users/thiagocardoso/Documents/Projects/finance-app/README.md` (atualizar)

**Complexidade:** Baixa

**Dependências:** Tarefa 9

**Passos Detalhados:**

1. **Criar documentação completa:**

```markdown
# docs/swagger-setup.md

# Swagger API Documentation - Setup e Uso

## Visão Geral

Esta aplicação usa **rswag** para gerar documentação interativa OpenAPI/Swagger da API Rails.

## Acesso

- **Desenvolvimento:** http://localhost:3001/api-docs
- **Produção:** https://api.financeapp.com/api-docs

## Estrutura de Arquivos

```
backend/
├── spec/
│   ├── swagger_helper.rb          # Configuração global do Swagger
│   └── requests/api/v1/swagger/   # Specs que geram documentação
│       ├── auth_spec.rb
│       ├── transactions_spec.rb
│       ├── categories_spec.rb
│       └── ...
├── swagger/
│   └── v1/
│       └── swagger.yaml           # Documentação gerada (não commitar)
└── config/initializers/
    ├── rswag_api.rb
    └── rswag_ui.rb
```

## Como Adicionar Documentação para um Novo Endpoint

### 1. Criar ou editar spec Swagger

```ruby
# spec/requests/api/v1/swagger/example_spec.rb
require 'swagger_helper'

RSpec.describe 'api/v1/examples', type: :request do
  path '/api/v1/examples' do
    get 'Lista exemplos' do
      tags 'Examples'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      parameter name: :Authorization, in: :header, type: :string, required: true

      response '200', 'sucesso' do
        schema type: :object,
               properties: {
                 success: { type: :boolean },
                 data: { type: :array, items: { type: :object } }
               }

        let(:Authorization) { "Bearer #{valid_token}" }

        run_test!
      end
    end
  end
end
```

### 2. Gerar documentação

```bash
# Executar specs e gerar YAML
SWAGGER_DRY_RUN=0 RAILS_ENV=test bundle exec rake rswag:specs:swaggerize

# Ou executar apenas os testes
bundle exec rspec spec/requests/api/v1/swagger/example_spec.rb
```

### 3. Verificar no Swagger UI

Acessar http://localhost:3001/api-docs e verificar se o endpoint aparece.

## Comandos Úteis

```bash
# Gerar toda a documentação
rake rswag:specs:swaggerize

# Validar documentação
rake swagger:validate

# Executar apenas specs Swagger
rspec spec/requests/api/v1/swagger

# Limpar e regerar
rm swagger/v1/swagger.yaml && rake rswag:specs:swaggerize
```

## Schemas Reutilizáveis

Adicionar em `spec/swagger_helper.rb` na seção `components: { schemas: {} }`:

```ruby
MyNewModel: {
  type: :object,
  properties: {
    id: { type: :integer },
    name: { type: :string }
  },
  required: [:id, :name]
}
```

Usar com `'$ref' => '#/components/schemas/MyNewModel'`

## Autenticação em Testes

Todos os endpoints autenticados precisam:

```ruby
let!(:user) { create(:user) }
let(:Authorization) { "Bearer #{JwtService.generate_tokens(user)[:access_token]}" }
```

## Configuração para Produção

### 1. Variáveis de ambiente

```bash
# .env.production
API_URL=https://api.financeapp.com
SWAGGER_ENABLED=true
```

### 2. Configurar CORS

```ruby
# config/initializers/cors.rb
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins ENV['FRONTEND_URL']
    resource '/api-docs/*', headers: :any, methods: [:get]
  end
end
```

### 3. Desabilitar em ambientes específicos (opcional)

```ruby
# config/initializers/rswag_ui.rb
if Rails.env.production? && ENV['SWAGGER_ENABLED'] != 'true'
  Rswag::Ui.configure do |c|
    c.openapi_endpoint nil
  end
end
```

## Segurança em Produção

⚠️ **IMPORTANTE:**

- Considere adicionar autenticação básica ao Swagger UI em produção
- Ou disponibilize apenas em rede interna/VPN
- Nunca exponha swagger.yaml com dados sensíveis

### Proteger Swagger UI (opcional):

```ruby
# config/initializers/rswag_ui.rb
if Rails.env.production?
  require 'rack/auth/basic'

  Rswag::Ui.configure do |c|
    c.basic_auth_enabled = true
    c.basic_auth_credentials 'admin', ENV['SWAGGER_PASSWORD']
  end
end
```

## Troubleshooting

### Swagger UI não carrega

1. Verificar se `swagger/v1/swagger.yaml` existe
2. Verificar logs Rails para erros
3. Verificar console do browser para erros JavaScript

### Specs falhando

1. Verificar factories: `create(:user)` deve funcionar
2. Verificar JwtService configurado
3. Executar com `--format documentation` para ver detalhes

### Endpoint não aparece

1. Verificar se tag está definida em swagger_helper.rb
2. Regerar documentação: `rake rswag:specs:swaggerize`
3. Limpar cache do browser

## Manutenção

- **Atualizar quando:** Adicionar/modificar endpoints da API
- **Frequência:** A cada PR que muda contratos da API
- **Responsável:** Desenvolvedor que modificou a API
- **Verificação:** CI deve executar `rspec spec/requests/api/v1/swagger` e passar

## Integração com CI/CD

Adicionar ao GitHub Actions:

```yaml
# .github/workflows/backend.yml
- name: Generate Swagger Documentation
  run: |
    SWAGGER_DRY_RUN=0 RAILS_ENV=test bundle exec rake rswag:specs:swaggerize

- name: Upload Swagger YAML
  uses: actions/upload-artifact@v3
  with:
    name: swagger-docs
    path: swagger/v1/swagger.yaml
```

## Recursos

- [Documentação rswag](https://github.com/rswag/rswag)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
```

2. **Atualizar README principal:**

```markdown
# Adicionar ao README.md

## 📚 Documentação da API

A API possui documentação interativa Swagger/OpenAPI.

### Acesso

- **Local:** http://localhost:3001/api-docs
- **Produção:** https://api.financeapp.com/api-docs

### Como usar

1. Acesse a URL do Swagger UI
2. Faça login usando `POST /api/v1/auth/sign_in`
3. Copie o `access_token` da resposta
4. Clique em "Authorize" e cole o token
5. Agora pode testar todos os endpoints!

Para mais detalhes, veja [docs/swagger-setup.md](docs/swagger-setup.md)
```

3. **Configurar ambiente de produção:**

```ruby
# config/environments/production.rb

# Adicionar configuração de Swagger para produção
Rails.application.configure do
  # ... outras configurações ...

  # Swagger configuration
  config.swagger_enabled = ENV.fetch('SWAGGER_ENABLED', 'false') == 'true'

  # Se quiser proteger com senha
  # config.swagger_basic_auth = {
  #   username: ENV['SWAGGER_USERNAME'],
  #   password: ENV['SWAGGER_PASSWORD']
  # }
end
```

4. **Criar tarefa rake para deploy da documentação:**

```ruby
# lib/tasks/swagger_deploy.rake
namespace :swagger do
  desc 'Deploy Swagger documentation to S3 (optional)'
  task deploy: :environment do
    # Gerar documentação
    Rake::Task['rswag:specs:swaggerize'].invoke

    # Upload para S3 ou outro storage (opcional)
    # yaml_file = Rails.root.join('swagger', 'v1', 'swagger.yaml')
    # S3Client.upload(yaml_file, 'docs/swagger.yaml')

    puts "✅ Swagger documentation deployed!"
  end
end
```

**Validação:**
- [ ] Documentação criada em `/docs/swagger-setup.md`
- [ ] README atualizado com seção de API Docs
- [ ] Configuração de produção adicionada
- [ ] Instruções de segurança incluídas
- [ ] CI/CD configurado (opcional)

---

## Checklist de Validação Final

### Funcionalidades Completas

- [ ] Swagger UI acessível em http://localhost:3001/api-docs
- [ ] Todos os 40+ endpoints documentados
- [ ] Autenticação JWT funcionando no Swagger UI
- [ ] Todos os schemas/models definidos
- [ ] Exemplos de requisições/respostas funcionais
- [ ] Testes de integração (specs) passando 100%
- [ ] Documentação visual customizada
- [ ] Segurança configurada

### Qualidade da Documentação

- [ ] Todas as tags/controllers cobertos
- [ ] Descrições claras em português
- [ ] Exemplos realistas e úteis
- [ ] Tipos de dados corretos (string, integer, etc.)
- [ ] Enums definidos para campos com valores fixos
- [ ] Paginação documentada onde aplicável
- [ ] Códigos de erro (400, 401, 404, 422, 500) documentados

### Performance e UX

- [ ] Swagger UI carrega rapidamente (< 2s)
- [ ] Sem erros no console do browser
- [ ] Botão "Try it out" funciona em todos os endpoints
- [ ] Layout responsivo funcionando
- [ ] Filtros e buscas funcionando

### Segurança

- [ ] Endpoints públicos marcados com `security: []`
- [ ] Endpoints protegidos requerem bearerAuth
- [ ] Instruções de autenticação claras
- [ ] Plano de segurança para produção definido

### Documentação e Manutenção

- [ ] `/docs/swagger-setup.md` criado
- [ ] README atualizado
- [ ] Comandos rake documentados
- [ ] Processo de CI/CD definido
- [ ] Responsabilidades de manutenção claras

---

## Estimativas de Tempo

| Tarefa | Complexidade | Tempo Estimado |
|--------|--------------|----------------|
| 1. Setup Inicial | Baixa | 1 hora |
| 2. swagger_helper.rb | Média | 2 horas |
| 3. Schemas/Models | Alta | 4 horas |
| 4.1 Auth Sign Up/In | Média | 2 horas |
| 4.2 Auth Recuperação Senha | Baixa | 1 hora |
| 5.1 Transactions CRUD | Alta | 3 horas |
| 5.2 Transactions Adicionais | Média | 2 horas |
| 5.3 Categories | Média | 2 horas |
| 5.4 Dashboard | Baixa | 1 hora |
| 6.1 Accounts | Média | 2 horas |
| 6.2 Budgets & Goals | Média | 3 horas |
| 6.3 Reports & Analytics | Média | 2 horas |
| 7. Config JWT UI | Média | 2 horas |
| 8. Customização Visual | Baixa | 1.5 horas |
| 9. Testes e Validação | Média | 3 horas |
| 10. Documentação | Baixa | 2 horas |
| **TOTAL** | - | **33.5 horas (~5 dias)** |

---

## Notas Importantes

### Edge Cases e Considerações

1. **Versionamento da API:**
   - Documentação preparada para `/api/v1/`
   - Para v2, criar novo swagger_helper com `v2/swagger.yaml`

2. **Dados Sensíveis:**
   - NUNCA incluir tokens reais ou senhas em exemplos
   - Usar dados fictícios mas realistas

3. **Performance:**
   - swagger.yaml pode ficar grande (>500KB)
   - Considerar cache no Swagger UI
   - Em produção, servir via CDN se necessário

4. **Internacionalização:**
   - Descrições em português para usuários brasileiros
   - Nomes de campos em inglês (padrão REST)

5. **Testes Automatizados:**
   - Specs Swagger SÃO testes de integração
   - Contam para cobertura de testes
   - Mantêm documentação sincronizada com código

### Possíveis Problemas

**Problema:** Specs Swagger falham mas endpoint funciona
- **Solução:** Verificar factories, dados de teste, tokens JWT

**Problema:** Swagger UI não carrega
- **Solução:** Verificar rotas montadas, arquivo YAML gerado, CORS

**Problema:** "Try it out" retorna 401 mesmo com token
- **Solução:** Verificar formato do token (sem "Bearer" no campo), verificar expiração

**Problema:** Documentação desatualizada
- **Solução:** Adicionar `rake rswag:specs:swaggerize` no CI/CD

---

## Comando Rápido para Executar Tudo

```bash
#!/bin/bash
# Script completo para setup Swagger

cd /Users/thiagocardoso/Documents/Projects/finance-app/backend

# 1. Instalar gems
bundle install

# 2. Executar todos os specs Swagger
SWAGGER_DRY_RUN=0 RAILS_ENV=test bundle exec rspec spec/requests/api/v1/swagger --format documentation

# 3. Gerar documentação
bundle exec rake rswag:specs:swaggerize

# 4. Validar
bundle exec rake swagger:validate

# 5. Iniciar servidor
rails s -p 3001

echo "✅ Swagger configurado! Acesse http://localhost:3001/api-docs"
```

---

**Lista de Tarefas Criada por:** Claude (Anthropic)
**Data:** 2025-01-19
**Versão:** 1.0
**Revisão:** Pendente
