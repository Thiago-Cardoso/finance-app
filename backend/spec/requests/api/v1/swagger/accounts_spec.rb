# frozen_string_literal: true

require 'swagger_helper'

RSpec.describe 'api/v1/accounts', type: :request do
  let!(:user) { create(:user) }
  let(:Authorization) { "Bearer #{JwtService.generate_tokens(user)[:access_token]}" }

  path '/api/v1/accounts' do
    get 'Listar contas' do
      tags 'Accounts'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      description 'Lista todas as contas financeiras do usuário autenticado. Pode retornar com paginação ou todas as contas (útil para dropdowns).'

      parameter name: :account_type, in: :query, type: :string, enum: ['checking', 'savings', 'credit_card', 'investment', 'cash'], required: false, description: 'Filtrar por tipo de conta'
      parameter name: :all, in: :query, type: :string, enum: ['true', 'false'], required: false, description: 'Retornar todas as contas sem paginação'
      parameter name: :page, in: :query, type: :integer, required: false
      parameter name: :per_page, in: :query, type: :integer, required: false

      response '200', 'Lista de contas retornada' do
        schema type: :object,
               properties: {
                 success: { type: :boolean, example: true },
                 data: {
                   type: :array,
                   items: { '$ref' => '#/components/schemas/Account' }
                 },
                 meta: {
                   type: :object,
                   properties: {
                     pagination: {
                       type: :object,
                       properties: {
                         current_page: { type: :integer },
                         next_page: { type: :integer, nullable: true },
                         prev_page: { type: :integer, nullable: true },
                         total_pages: { type: :integer },
                         total_count: { type: :integer }
                       }
                     }
                   }
                 }
               }

        let!(:accounts) { create_list(:account, 3, user: user) }

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

    post 'Criar conta' do
      tags 'Accounts'
      consumes 'application/json'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      description 'Cria uma nova conta financeira para o usuário.'

      parameter name: :account_params, in: :body, schema: {
        type: :object,
        properties: {
          account: {
            type: :object,
            properties: {
              name: { type: :string, example: 'Conta Corrente Principal' },
              account_type: { type: :string, enum: ['checking', 'savings', 'credit_card', 'investment', 'cash'], example: 'checking' },
              initial_balance: { type: :number, example: 1000.00 },
              current_balance: { type: :number, example: 1000.00 },
              is_active: { type: :boolean, example: true }
            },
            required: [:name, :account_type]
          }
        },
        required: [:account]
      }

      response '201', 'Conta criada com sucesso' do
        schema '$ref' => '#/components/schemas/Account'

        let(:account_params) do
          {
            account: {
              name: 'Nova Conta',
              account_type: 'checking',
              initial_balance: 1000.00,
              current_balance: 1000.00,
              is_active: true
            }
          }
        end

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['name']).to eq('Nova Conta')
          expect(data['account_type']).to eq('checking')
        end
      end

      response '422', 'Dados inválidos' do
        schema type: :object,
               properties: {
                 errors: { type: :array, items: { type: :string } }
               }

        let(:account_params) do
          {
            account: {
              name: '',
              account_type: 'invalid'
            }
          }
        end

        run_test!
      end

      response '401', 'Não autorizado' do
        schema '$ref' => '#/components/schemas/Error'

        let(:Authorization) { 'Bearer invalid_token' }
        let(:account_params) do
          {
            account: {
              name: 'Test',
              account_type: 'checking'
            }
          }
        end

        run_test!
      end
    end
  end

  path '/api/v1/accounts/{id}' do
    parameter name: :id, in: :path, type: :integer, description: 'ID da conta'

    get 'Exibir conta' do
      tags 'Accounts'
      produces 'application/json'
      security [{ bearerAuth: [] }]


      response '200', 'Conta encontrada' do
        schema '$ref' => '#/components/schemas/Account'

        let!(:account) { create(:account, user: user) }
        let(:id) { account.id }

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['id']).to eq(account.id)
        end
      end

      response '404', 'Conta não encontrada' do
        schema type: :object,
               properties: {
                 error: { type: :string, example: 'Account not found' }
               }

        let(:id) { 999999 }

        run_test!
      end

      response '401', 'Não autorizado' do
        schema '$ref' => '#/components/schemas/Error'

        let(:Authorization) { 'Bearer invalid_token' }
        let!(:account) { create(:account, user: user) }
        let(:id) { account.id }

        run_test!
      end
    end

    put 'Atualizar conta' do
      tags 'Accounts'
      consumes 'application/json'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      description 'Atualiza uma conta financeira do usuário.'

      parameter name: :account_params, in: :body, schema: {
        type: :object,
        properties: {
          account: {
            type: :object,
            properties: {
              name: { type: :string },
              account_type: { type: :string, enum: ['checking', 'savings', 'credit_card', 'investment', 'cash'] },
              initial_balance: { type: :number },
              current_balance: { type: :number },
              is_active: { type: :boolean }
            }
          }
        },
        required: [:account]
      }

      response '200', 'Conta atualizada' do
        schema '$ref' => '#/components/schemas/Account'

        let!(:account) { create(:account, user: user) }
        let(:id) { account.id }
        let(:account_params) do
          {
            account: {
              name: 'Nome Atualizado',
              current_balance: 2000.00
            }
          }
        end

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['name']).to eq('Nome Atualizado')
        end
      end

      response '404', 'Conta não encontrada' do
        schema type: :object,
               properties: {
                 error: { type: :string, example: 'Account not found' }
               }

        let(:id) { 999999 }
        let(:account_params) do
          {
            account: {
              name: 'Test'
            }
          }
        end

        run_test!
      end

      response '422', 'Dados inválidos' do
        schema type: :object,
               properties: {
                 errors: { type: :array, items: { type: :string } }
               }

        let!(:account) { create(:account, user: user) }
        let(:id) { account.id }
        let(:account_params) do
          {
            account: {
              name: '',
              account_type: 'invalid'
            }
          }
        end

        run_test!
      end

      response '401', 'Não autorizado' do
        schema '$ref' => '#/components/schemas/Error'

        let(:Authorization) { 'Bearer invalid_token' }
        let!(:account) { create(:account, user: user) }
        let(:id) { account.id }
        let(:account_params) do
          {
            account: {
              name: 'Test'
            }
          }
        end

        run_test!
      end
    end

    delete 'Excluir conta' do
      tags 'Accounts'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      description 'Desativa uma conta financeira do usuário (soft delete). A conta é marcada como inativa mas não é removida do banco de dados.'


      response '204', 'Conta desativada' do
        let!(:account) { create(:account, user: user) }
        let(:id) { account.id }

        run_test!
      end

      response '404', 'Conta não encontrada' do
        schema type: :object,
               properties: {
                 error: { type: :string, example: 'Account not found' }
               }

        let(:id) { 999999 }

        run_test!
      end

      response '401', 'Não autorizado' do
        schema '$ref' => '#/components/schemas/Error'

        let(:Authorization) { 'Bearer invalid_token' }
        let!(:account) { create(:account, user: user) }
        let(:id) { account.id }

        run_test!
      end
    end
  end
end
