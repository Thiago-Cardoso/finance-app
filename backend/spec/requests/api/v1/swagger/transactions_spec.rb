# frozen_string_literal: true

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

      parameter name: :page, in: :query, type: :integer, required: false, description: 'Número da página (default: 1)'
      parameter name: :per_page, in: :query, type: :integer, required: false, description: 'Itens por página (max: 100, default: 20)'
      parameter name: :category_id, in: :query, type: :integer, required: false, description: 'Filtrar por categoria'
      parameter name: :transaction_type, in: :query, type: :string, enum: ['income', 'expense', 'transfer'], required: false
      parameter name: :date_from, in: :query, type: :string, format: :date, required: false, description: 'Data inicial (YYYY-MM-DD)'
      parameter name: :date_to, in: :query, type: :string, format: :date, required: false, description: 'Data final (YYYY-MM-DD)'
      parameter name: :search, in: :query, type: :string, required: false, description: 'Buscar na descrição'

      response '200', 'Lista de transações retornada' do
        schema '$ref' => '#/components/schemas/TransactionListResponse'

        let!(:transactions) { create_list(:transaction, 5, user: user, category: category, account: account) }

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

      response '401', 'Não autorizado' do
        schema '$ref' => '#/components/schemas/Error'

        let(:Authorization) { 'Bearer invalid_token' }
        let(:transaction_params) do
          {
            transaction: {
              description: 'Test',
              amount: '100.00',
              transaction_type: 'expense',
              date: Date.current.to_s
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


      response '200', 'Transação encontrada' do
        schema type: :object,
               properties: {
                 success: { type: :boolean, example: true },
                 data: { '$ref' => '#/components/schemas/Transaction' }
               }

        let!(:transaction) { create(:transaction, user: user, category: category, account: account) }
        let(:id) { transaction.id }

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['success']).to eq(true)
          expect(data['data']['id']).to eq(transaction.id)
        end
      end

      response '404', 'Transação não encontrada' do
        schema '$ref' => '#/components/schemas/Error'

        let(:id) { 999999 }

        run_test!
      end

      response '401', 'Não autorizado' do
        schema '$ref' => '#/components/schemas/Error'

        let(:Authorization) { 'Bearer invalid_token' }
        let!(:transaction) { create(:transaction, user: user, category: category, account: account) }
        let(:id) { transaction.id }

        run_test!
      end
    end

    put 'Atualizar transação' do
      tags 'Transactions'
      consumes 'application/json'
      produces 'application/json'
      security [{ bearerAuth: [] }]

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

        let!(:transaction) { create(:transaction, user: user, category: category, account: account) }
        let(:id) { transaction.id }
        let(:transaction_params) do
          {
            transaction: {
              description: 'Descrição Atualizada',
              amount: '200.00'
            }
          }
        end

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['success']).to eq(true)
          expect(data['data']['description']).to eq('Descrição Atualizada')
        end
      end

      response '404', 'Transação não encontrada' do
        schema '$ref' => '#/components/schemas/Error'

        let(:id) { 999999 }
        let(:transaction_params) do
          {
            transaction: {
              description: 'Test'
            }
          }
        end

        run_test!
      end

      response '401', 'Não autorizado' do
        schema '$ref' => '#/components/schemas/Error'

        let(:Authorization) { 'Bearer invalid_token' }
        let!(:transaction) { create(:transaction, user: user, category: category, account: account) }
        let(:id) { transaction.id }
        let(:transaction_params) do
          {
            transaction: {
              description: 'Test'
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


      response '200', 'Transação excluída' do
        schema type: :object,
               properties: {
                 success: { type: :boolean, example: true },
                 message: { type: :string, example: 'Transaction deleted successfully' }
               }

        let!(:transaction) { create(:transaction, user: user, category: category, account: account) }
        let(:id) { transaction.id }

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['success']).to eq(true)
        end
      end

      response '404', 'Transação não encontrada' do
        schema '$ref' => '#/components/schemas/Error'

        let(:id) { 999999 }

        run_test!
      end

      response '401', 'Não autorizado' do
        schema '$ref' => '#/components/schemas/Error'

        let(:Authorization) { 'Bearer invalid_token' }
        let!(:transaction) { create(:transaction, user: user, category: category, account: account) }
        let(:id) { transaction.id }

        run_test!
      end
    end
  end

  path '/api/v1/transactions/summary' do
    get 'Obter resumo de transações' do
      tags 'Transactions'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      description 'Retorna resumo financeiro (receitas, despesas, saldo) para um período específico.'

      parameter name: :start_date, in: :query, type: :string, format: :date, required: false, description: 'Data inicial (YYYY-MM-DD). Default: início do mês atual'
      parameter name: :end_date, in: :query, type: :string, format: :date, required: false, description: 'Data final (YYYY-MM-DD). Default: fim do mês atual'

      response '200', 'Resumo calculado com sucesso' do
        schema type: :object,
               properties: {
                 success: { type: :boolean, example: true },
                 data: {
                   type: :object,
                   properties: {
                     total_income: { type: :number, example: 5000.00 },
                     total_expenses: { type: :number, example: 3000.00 },
                     net_amount: { type: :number, example: 2000.00 },
                     transactions_count: { type: :integer, example: 2 }
                   }
                 }
               }

        let!(:income_transaction) { create(:transaction, :income, user: user, category: create(:category, :income, user: user), account: account, amount: 5000.00) }
        let!(:expense_transaction) { create(:transaction, :expense, user: user, category: category, account: account, amount: 3000.00) }

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['success']).to eq(true)
          expect(data['data']).to have_key('total_income')
          expect(data['data']).to have_key('total_expenses')
          expect(data['data']).to have_key('net_amount')
        end
      end

      response '401', 'Não autorizado' do
        schema '$ref' => '#/components/schemas/Error'

        let(:Authorization) { 'Bearer invalid_token' }

        run_test!
      end
    end
  end

  path '/api/v1/transactions/filter_options' do
    get 'Obter opções de filtros' do
      tags 'Transactions'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      description 'Retorna opções disponíveis para filtros (categorias, contas, tipos).'


      response '200', 'Opções de filtros retornadas' do
        schema type: :object,
               properties: {
                 success: { type: :boolean, example: true },
                 data: {
                   type: :object,
                   properties: {
                     categories: {
                       type: :array,
                       items: {
                         type: :object,
                         properties: {
                           id: { type: :integer },
                           name: { type: :string },
                           category_type: { type: :string }
                         }
                       }
                     },
                     accounts: {
                       type: :array,
                       items: {
                         type: :object,
                         properties: {
                           id: { type: :integer },
                           name: { type: :string },
                           account_type: { type: :string }
                         }
                       }
                     },
                     transaction_types: {
                       type: :array,
                       items: { type: :string },
                       example: ['income', 'expense', 'transfer']
                     }
                   }
                 }
               }

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['success']).to eq(true)
          expect(data['data']).to have_key('categories')
          expect(data['data']).to have_key('accounts')
          expect(data['data']).to have_key('transaction_types')
        end
      end

      response '401', 'Não autorizado' do
        schema '$ref' => '#/components/schemas/Error'

        let(:Authorization) { 'Bearer invalid_token' }

        run_test!
      end
    end
  end

  path '/api/v1/transactions/search_suggestions' do
    get 'Obter sugestões de busca' do
      tags 'Transactions'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      description 'Retorna sugestões de descrições de transações baseadas no termo de busca.'

      parameter name: :query, in: :query, type: :string, required: true, description: 'Termo de busca (mínimo 2 caracteres)'

      response '200', 'Sugestões retornadas' do
        schema type: :object,
               properties: {
                 success: { type: :boolean, example: true },
                 data: {
                   type: :array,
                   items: { type: :string },
                   example: ['Supermercado', 'Aluguel', 'Salário']
                 }
               }

        let!(:transactions) { create_list(:transaction, 3, user: user, category: category, account: account) }
        let(:query) { 'Trans' }

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['success']).to eq(true)
          expect(data['data']).to be_an(Array)
        end
      end

      response '200', 'Query muito curta retorna array vazio' do
        schema type: :object,
               properties: {
                 success: { type: :boolean, example: true },
                 data: { type: :array, items: {} }
               }

        let(:query) { 'a' }

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['success']).to eq(true)
          expect(data['data']).to eq([])
        end
      end

      response '401', 'Não autorizado' do
        schema '$ref' => '#/components/schemas/Error'

        let(:Authorization) { 'Bearer invalid_token' }
        let(:query) { 'test' }

        run_test!
      end
    end
  end
end
