# frozen_string_literal: true

require 'swagger_helper'

RSpec.describe 'api/v1/categories', type: :request do
  let!(:user) { create(:user) }
  let(:Authorization) { "Bearer #{JwtService.generate_tokens(user)[:access_token]}" }

  path '/api/v1/categories' do
    get 'Listar categorias' do
      tags 'Categories'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      description 'Lista todas as categorias disponíveis para o usuário (próprias + padrão do sistema).'

      parameter name: :category_type, in: :query, type: :string, enum: ['income', 'expense'], required: false, description: 'Filtrar por tipo de categoria'
      parameter name: :page, in: :query, type: :integer, required: false
      parameter name: :per_page, in: :query, type: :integer, required: false

      response '200', 'Lista de categorias retornada' do
        schema type: :object,
               properties: {
                 success: { type: :boolean, example: true },
                 data: {
                   type: :array,
                   items: { '$ref' => '#/components/schemas/Category' }
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

        let!(:categories) { create_list(:category, 3, :custom, user: user) }

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

    post 'Criar categoria' do
      tags 'Categories'
      consumes 'application/json'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      description 'Cria uma nova categoria personalizada para o usuário.'

      parameter name: :category_params, in: :body, schema: {
        type: :object,
        properties: {
          category: {
            type: :object,
            properties: {
              name: { type: :string, example: 'Alimentação' },
              icon: { type: :string, example: 'utensils' },
              color: { type: :string, example: '#ff6b6b' },
              category_type: { type: :string, enum: ['income', 'expense'], example: 'expense' },
              is_active: { type: :boolean, example: true }
            },
            required: [:name, :category_type]
          }
        },
        required: [:category]
      }

      response '201', 'Categoria criada com sucesso' do
        schema type: :object,
               properties: {
                 success: { type: :boolean, example: true },
                 data: { '$ref' => '#/components/schemas/Category' },
                 message: { type: :string, example: 'Category created successfully' }
               }

        let(:category_params) do
          {
            category: {
              name: 'Nova Categoria',
              icon: 'shopping-cart',
              color: '#6366f1',
              category_type: 'expense',
              is_active: true
            }
          }
        end

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['success']).to eq(true)
          expect(data['data']['name']).to eq('Nova Categoria')
        end
      end

      response '422', 'Dados inválidos' do
        schema '$ref' => '#/components/schemas/Error'

        let(:category_params) do
          {
            category: {
              name: '',
              category_type: 'invalid'
            }
          }
        end

        run_test!
      end

      response '401', 'Não autorizado' do
        schema '$ref' => '#/components/schemas/Error'

        let(:Authorization) { 'Bearer invalid_token' }
        let(:category_params) do
          {
            category: {
              name: 'Test',
              category_type: 'expense'
            }
          }
        end

        run_test!
      end
    end
  end

  path '/api/v1/categories/{id}' do
    parameter name: :id, in: :path, type: :integer, description: 'ID da categoria'

    get 'Exibir categoria' do
      tags 'Categories'
      produces 'application/json'
      security [{ bearerAuth: [] }]


      response '200', 'Categoria encontrada' do
        schema type: :object,
               properties: {
                 success: { type: :boolean, example: true },
                 data: { '$ref' => '#/components/schemas/Category' }
               }

        let!(:category) { create(:category, :custom, user: user) }
        let(:id) { category.id }

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['success']).to eq(true)
          expect(data['data']['id']).to eq(category.id)
        end
      end

      response '404', 'Categoria não encontrada' do
        schema '$ref' => '#/components/schemas/Error'

        let(:id) { 999999 }

        run_test!
      end

      response '401', 'Não autorizado' do
        schema '$ref' => '#/components/schemas/Error'

        let(:Authorization) { 'Bearer invalid_token' }
        let!(:category) { create(:category, :custom, user: user) }
        let(:id) { category.id }

        run_test!
      end
    end

    put 'Atualizar categoria' do
      tags 'Categories'
      consumes 'application/json'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      description 'Atualiza uma categoria personalizada do usuário. Categorias padrão do sistema não podem ser atualizadas.'

      parameter name: :category_params, in: :body, schema: {
        type: :object,
        properties: {
          category: {
            type: :object,
            properties: {
              name: { type: :string },
              icon: { type: :string },
              color: { type: :string },
              category_type: { type: :string, enum: ['income', 'expense'] },
              is_active: { type: :boolean }
            }
          }
        },
        required: [:category]
      }

      response '200', 'Categoria atualizada' do
        schema type: :object,
               properties: {
                 success: { type: :boolean, example: true },
                 data: { '$ref' => '#/components/schemas/Category' },
                 message: { type: :string, example: 'Category updated successfully' }
               }

        let!(:category) { create(:category, :custom, user: user) }
        let(:id) { category.id }
        let(:category_params) do
          {
            category: {
              name: 'Nome Atualizado',
              color: '#ff0000'
            }
          }
        end

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['success']).to eq(true)
          expect(data['data']['name']).to eq('Nome Atualizado')
        end
      end

      response '403', 'Proibido - não pode modificar categorias padrão' do
        schema '$ref' => '#/components/schemas/Error'

        let!(:category) { create(:category, :default) }
        let(:id) { category.id }
        let(:category_params) do
          {
            category: {
              name: 'Tentando Atualizar'
            }
          }
        end

        run_test!
      end

      response '404', 'Categoria não encontrada' do
        schema '$ref' => '#/components/schemas/Error'

        let(:id) { 999999 }
        let(:category_params) do
          {
            category: {
              name: 'Test'
            }
          }
        end

        run_test!
      end

      response '401', 'Não autorizado' do
        schema '$ref' => '#/components/schemas/Error'

        let(:Authorization) { 'Bearer invalid_token' }
        let!(:category) { create(:category, :custom, user: user) }
        let(:id) { category.id }
        let(:category_params) do
          {
            category: {
              name: 'Test'
            }
          }
        end

        run_test!
      end
    end

    delete 'Excluir categoria' do
      tags 'Categories'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      description 'Exclui uma categoria personalizada do usuário. Categorias padrão do sistema não podem ser excluídas.'


      response '204', 'Categoria excluída' do
        let!(:category) { create(:category, :custom, user: user) }
        let(:id) { category.id }

        run_test!
      end

      response '403', 'Proibido - não pode excluir categorias padrão' do
        schema '$ref' => '#/components/schemas/Error'

        let!(:category) { create(:category, :default) }
        let(:id) { category.id }

        run_test!
      end

      response '404', 'Categoria não encontrada' do
        schema '$ref' => '#/components/schemas/Error'

        let(:id) { 999999 }

        run_test!
      end

      response '401', 'Não autorizado' do
        schema '$ref' => '#/components/schemas/Error'

        let(:Authorization) { 'Bearer invalid_token' }
        let!(:category) { create(:category, :custom, user: user) }
        let(:id) { category.id }

        run_test!
      end
    end
  end

  path '/api/v1/categories/{id}/transactions' do
    parameter name: :id, in: :path, type: :integer, description: 'ID da categoria'

    get 'Listar transações da categoria' do
      tags 'Categories'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      description 'Retorna todas as transações associadas a uma categoria específica.'

      parameter name: :page, in: :query, type: :integer, required: false
      parameter name: :per_page, in: :query, type: :integer, required: false

      response '200', 'Transações da categoria retornadas' do
        schema type: :object,
               properties: {
                 success: { type: :boolean, example: true },
                 data: {
                   type: :array,
                   items: { '$ref' => '#/components/schemas/Transaction' }
                 },
                 meta: {
                   type: :object,
                   properties: {
                     pagination: {
                       type: :object,
                       properties: {
                         current_page: { type: :integer },
                         total_pages: { type: :integer },
                         total_count: { type: :integer },
                         per_page: { type: :integer }
                       }
                     }
                   }
                 }
               }

        let!(:category) { create(:category, :custom, user: user) }
        let!(:account) { create(:account, user: user) }
        let!(:transactions) { create_list(:transaction, 3, user: user, category: category, account: account) }
        let(:id) { category.id }

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['success']).to eq(true)
          expect(data['data']).to be_an(Array)
          expect(data['meta']['pagination']).to be_present
        end
      end

      response '404', 'Categoria não encontrada' do
        schema '$ref' => '#/components/schemas/Error'

        let(:id) { 999999 }

        run_test!
      end

      response '401', 'Não autorizado' do
        schema '$ref' => '#/components/schemas/Error'

        let(:Authorization) { 'Bearer invalid_token' }
        let!(:category) { create(:category, :custom, user: user) }
        let(:id) { category.id }

        run_test!
      end
    end
  end

  path '/api/v1/categories/statistics' do
    get 'Obter estatísticas de categorias' do
      tags 'Categories'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      description 'Retorna estatísticas de uso e gastos por categoria para análise financeira.'

      parameter name: :start_date, in: :query, type: :string, format: :date, required: false, description: 'Data inicial'
      parameter name: :end_date, in: :query, type: :string, format: :date, required: false, description: 'Data final'
      parameter name: :category_type, in: :query, type: :string, enum: ['income', 'expense'], required: false

      response '200', 'Estatísticas calculadas com sucesso' do
        schema type: :object,
               properties: {
                 success: { type: :boolean, example: true },
                 message: { type: :string, example: 'Estatísticas de categorias calculadas' },
                 data: {
                   type: :object,
                   additionalProperties: true
                 }
               }

        let!(:category) { create(:category, :custom, user: user) }
        let!(:account) { create(:account, user: user) }
        let!(:transactions) { create_list(:transaction, 3, user: user, category: category, account: account) }

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['success']).to eq(true)
          expect(data['message']).to eq('Estatísticas de categorias calculadas')
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
