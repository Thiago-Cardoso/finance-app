# frozen_string_literal: true

require 'rails_helper'

RSpec.configure do |config|
  # Specify a root folder where Swagger JSON files are generated
  config.openapi_root = Rails.root.join('swagger').to_s

  # Define one or more Swagger documents and provide global metadata for each one
  config.openapi_specs = {
    'v1/swagger.yaml' => {
      openapi: '3.0.1',
      info: {
        title: 'Personal Finance API',
        version: 'v1',
        description: 'API RESTful para aplicativo de controle financeiro pessoal. Permite gerenciar transações, categorias, contas, orçamentos, metas financeiras e gerar relatórios analíticos.',
        contact: {
          name: 'API Support',
          email: 'support@financeapp.com'
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT'
        }
      },
      paths: {},
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

      # Tags para organização dos endpoints
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
      ],

      components: {
        # Configuração de autenticação JWT
        securitySchemes: {
          bearerAuth: {
            type: :http,
            scheme: :bearer,
            bearerFormat: 'JWT',
            description: 'JWT token obtido após autenticação via /api/v1/auth/sign_in'
          }
        },

        # Schemas reutilizáveis
        schemas: {
          # ========== SCHEMAS BÁSICOS ==========
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

          SuccessResponse: {
            type: :object,
            properties: {
              success: { type: :boolean, example: true },
              message: { type: :string, example: 'Success' },
              data: { type: :object }
            },
            required: [:success, :data]
          },

          PaginationMeta: {
            type: :object,
            properties: {
              current_page: { type: :integer, example: 1 },
              total_pages: { type: :integer, example: 10 },
              total_count: { type: :integer, example: 100 },
              per_page: { type: :integer, example: 20 }
            }
          },

          # ========== USER & AUTH SCHEMAS ==========
          User: {
            type: :object,
            properties: {
              id: { type: :integer, example: 1 },
              email: { type: :string, format: :email, example: 'user@example.com' },
              first_name: { type: :string, example: 'John' },
              last_name: { type: :string, example: 'Doe' },
              confirmed_at: { type: :string, format: 'date-time', nullable: true },
              created_at: { type: :string, format: 'date-time' },
              updated_at: { type: :string, format: 'date-time' }
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

          # ========== TRANSACTION SCHEMAS ==========
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

          # ========== CATEGORY SCHEMAS ==========
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

          CategoryListResponse: {
            type: :object,
            properties: {
              success: { type: :boolean, example: true },
              data: {
                type: :array,
                items: { '$ref' => '#/components/schemas/Category' }
              },
              meta: {
                type: :object,
                properties: {
                  pagination: { '$ref' => '#/components/schemas/PaginationMeta' }
                }
              }
            }
          },

          # ========== ACCOUNT SCHEMAS ==========
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

          # ========== BUDGET SCHEMAS ==========
          Budget: {
            type: :object,
            properties: {
              id: { type: :integer, example: 1 },
              name: { type: :string, example: 'Orçamento Mensal Alimentação' },
              amount: { type: :string, example: '800.00' },
              period: {
                type: :string,
                enum: ['monthly', 'quarterly', 'yearly'],
                example: 'monthly'
              },
              category: { '$ref' => '#/components/schemas/CategorySummary' },
              start_date: { type: :string, format: :date, example: '2024-01-01' },
              end_date: { type: :string, format: :date, example: '2024-01-31' },
              spent: { type: :string, example: '650.00' },
              remaining: { type: :string, example: '150.00' },
              percentage_used: { type: :number, format: :float, example: 81.25 },
              is_active: { type: :boolean, example: true },
              created_at: { type: :string, format: 'date-time' },
              updated_at: { type: :string, format: 'date-time' }
            },
            required: [:id, :name, :amount, :period]
          },

          BudgetRequest: {
            type: :object,
            properties: {
              budget: {
                type: :object,
                properties: {
                  name: { type: :string, example: 'Orçamento Alimentação' },
                  amount: { type: :string, example: '800.00' },
                  period: {
                    type: :string,
                    enum: ['monthly', 'quarterly', 'yearly'],
                    example: 'monthly'
                  },
                  category_id: { type: :integer, example: 1 },
                  start_date: { type: :string, format: :date, example: '2024-01-01' },
                  end_date: { type: :string, format: :date, example: '2024-01-31' }
                },
                required: [:name, :amount, :period, :category_id]
              }
            },
            required: [:budget]
          },

          # ========== GOAL SCHEMAS ==========
          Goal: {
            type: :object,
            properties: {
              id: { type: :integer, example: 1 },
              name: { type: :string, example: 'Viagem para Europa' },
              description: { type: :string, nullable: true, example: 'Economizar para viagem em julho' },
              target_amount: { type: :string, example: '15000.00' },
              current_amount: { type: :string, example: '4500.00' },
              target_date: { type: :string, format: :date, example: '2024-07-01' },
              status: {
                type: :string,
                enum: ['active', 'completed', 'cancelled'],
                example: 'active'
              },
              progress_percentage: { type: :number, format: :float, example: 30.0 },
              created_at: { type: :string, format: 'date-time' },
              updated_at: { type: :string, format: 'date-time' }
            },
            required: [:id, :name, :target_amount, :current_amount]
          },

          GoalRequest: {
            type: :object,
            properties: {
              goal: {
                type: :object,
                properties: {
                  name: { type: :string, example: 'Comprar Casa' },
                  description: { type: :string, example: 'Economizar para entrada' },
                  target_amount: { type: :string, example: '80000.00' },
                  current_amount: { type: :string, example: '0.00' },
                  target_date: { type: :string, format: :date, example: '2025-12-31' }
                },
                required: [:name, :target_amount]
              }
            },
            required: [:goal]
          },

          # ========== DASHBOARD SCHEMAS ==========
          DashboardSummary: {
            type: :object,
            properties: {
              success: { type: :boolean, example: true },
              data: {
                type: :object,
                properties: {
                  monthly_income: { type: :string, example: '5500.00' },
                  monthly_expenses: { type: :string, example: '3200.00' },
                  monthly_balance: { type: :string, example: '2300.00' },
                  total_balance: { type: :string, example: '12500.00' },
                  recent_transactions: {
                    type: :array,
                    items: { '$ref' => '#/components/schemas/Transaction' }
                  },
                  top_categories: {
                    type: :array,
                    items: {
                      type: :object,
                      properties: {
                        category: { '$ref' => '#/components/schemas/CategorySummary' },
                        amount: { type: :string, example: '450.00' },
                        transaction_count: { type: :integer, example: 12 }
                      }
                    }
                  }
                }
              }
            }
          },

          # ========== ANALYTICS SCHEMAS ==========
          FinancialSummary: {
            type: :object,
            properties: {
              period: {
                type: :object,
                properties: {
                  start_date: { type: :string, format: :date },
                  end_date: { type: :string, format: :date }
                }
              },
              summary: {
                type: :object,
                properties: {
                  total_income: { type: :string },
                  total_expenses: { type: :string },
                  net_balance: { type: :string },
                  transaction_count: { type: :integer }
                }
              },
              monthly_breakdown: {
                type: :array,
                items: {
                  type: :object,
                  properties: {
                    month: { type: :string },
                    month_name: { type: :string },
                    income: { type: :string },
                    expense: { type: :string },
                    net: { type: :string }
                  }
                }
              },
              category_breakdown: {
                type: :array,
                items: {
                  type: :object,
                  properties: {
                    category_name: { type: :string },
                    category_color: { type: :string },
                    amount: { type: :string },
                    transaction_count: { type: :integer }
                  }
                }
              }
            }
          }
        }
      },

      # Aplicar autenticação JWT globalmente
      security: [
        {
          bearerAuth: []
        }
      ]
    }
  }

  # Specify the format of the output Swagger file when running 'rswag:specs:swaggerize'.
  config.openapi_format = :yaml
end
