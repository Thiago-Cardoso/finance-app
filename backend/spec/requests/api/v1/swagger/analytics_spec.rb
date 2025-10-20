# frozen_string_literal: true

require 'swagger_helper'

RSpec.describe 'api/v1/analytics', type: :request do
  let!(:user) { create(:user) }
  let(:Authorization) { "Bearer #{JwtService.generate_tokens(user)[:access_token]}" }

  path '/api/v1/analytics/financial_summary' do
    get 'Obter resumo financeiro' do
      tags 'Analytics'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      description 'Retorna um relatório de resumo financeiro detalhado com análise de receitas, despesas, saldo e tendências para o período especificado.'

      parameter name: :period_type, in: :query, type: :string, enum: ['monthly', 'quarterly', 'yearly', 'custom'], required: false, description: 'Tipo de período para o relatório'
      parameter name: :start_date, in: :query, type: :string, format: :date, required: false, description: 'Data inicial (usado com period_type=custom)'
      parameter name: :end_date, in: :query, type: :string, format: :date, required: false, description: 'Data final (usado com period_type=custom)'
      parameter name: :category_id, in: :query, type: :integer, required: false, description: 'Filtrar por categoria específica'
      parameter name: :account_id, in: :query, type: :integer, required: false, description: 'Filtrar por conta específica'

      response '200', 'Resumo financeiro gerado com sucesso' do
        schema type: :object,
               properties: {
                 success: { type: :boolean, example: true },
                 data: {
                   type: :object,
                   additionalProperties: true,
                   description: 'Dados do resumo financeiro incluindo receitas, despesas, saldo, categorias principais e tendências'
                 }
               }

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['success']).to eq(true)
          expect(data['data']).to be_present
        end
      end

      response '422', 'Parâmetros inválidos' do
        schema type: :object,
               properties: {
                 success: { type: :boolean, example: false },
                 error: { type: :string }
               }

        let(:period_type) { 'invalid' }

        run_test!
      end

      response '401', 'Não autorizado' do
        schema '$ref' => '#/components/schemas/Error'

        let(:Authorization) { 'Bearer invalid_token' }

        run_test!
      end
    end
  end

  path '/api/v1/analytics/budget_performance' do
    get 'Obter performance de orçamentos' do
      tags 'Analytics'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      description 'Retorna análise de performance dos orçamentos, mostrando gastos vs. limites orçamentários, categorias que excederam o orçamento e projeções.'

      parameter name: :period_type, in: :query, type: :string, enum: ['monthly', 'quarterly', 'yearly', 'custom'], required: false
      parameter name: :start_date, in: :query, type: :string, format: :date, required: false
      parameter name: :end_date, in: :query, type: :string, format: :date, required: false
      parameter name: :category_id, in: :query, type: :integer, required: false
      parameter name: :account_id, in: :query, type: :integer, required: false

      response '200', 'Performance de orçamentos calculada' do
        schema type: :object,
               properties: {
                 success: { type: :boolean, example: true },
                 data: {
                   type: :object,
                   additionalProperties: true,
                   description: 'Dados de performance incluindo orçamentos, gastos atuais, projeções e alertas'
                 }
               }

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['success']).to eq(true)
          expect(data['data']).to be_present
        end
      end

      response '422', 'Parâmetros inválidos' do
        schema type: :object,
               properties: {
                 success: { type: :boolean, example: false },
                 error: { type: :string }
               }

        let(:period_type) { 'invalid' }

        run_test!
      end

      response '401', 'Não autorizado' do
        schema '$ref' => '#/components/schemas/Error'

        let(:Authorization) { 'Bearer invalid_token' }

        run_test!
      end
    end
  end

  path '/api/v1/analytics/export' do
    get 'Exportar relatório' do
      tags 'Analytics'
      produces 'application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      security [{ bearerAuth: [] }]

      description 'Exporta relatórios financeiros em formato PDF ou Excel para download.'

      parameter name: :report_type, in: :query, type: :string, enum: ['financial_summary', 'budget_performance'], required: true, description: 'Tipo de relatório a exportar'
      parameter name: :format, in: :query, type: :string, enum: ['pdf', 'excel'], required: false, description: 'Formato de exportação (default: pdf)'
      parameter name: :period_type, in: :query, type: :string, enum: ['monthly', 'quarterly', 'yearly', 'custom'], required: false
      parameter name: :start_date, in: :query, type: :string, format: :date, required: false
      parameter name: :end_date, in: :query, type: :string, format: :date, required: false
      parameter name: :category_id, in: :query, type: :integer, required: false
      parameter name: :account_id, in: :query, type: :integer, required: false

      response '200', 'Arquivo exportado com sucesso' do
        produces 'application/pdf'

        let(:report_type) { 'financial_summary' }
        let(:format) { 'pdf' }

        run_test! do |response|
          # Binary PDF response - just verify status code
          expect(response.status).to eq(200)
          expect(response.headers['Content-Type']).to include('application/pdf')
        end
      end

      response '400', 'Tipo de relatório ou formato inválido' do
        schema type: :object,
               properties: {
                 success: { type: :boolean, example: false },
                 error: { type: :string, example: 'Invalid report type' }
               }

        let(:report_type) { 'invalid_type' }

        run_test!
      end

      response '422', 'Erro ao gerar relatório' do
        schema type: :object,
               properties: {
                 success: { type: :boolean, example: false },
                 error: { type: :string }
               }

        let(:report_type) { 'financial_summary' }
        let(:period_type) { 'invalid' }

        run_test!
      end

      response '401', 'Não autorizado' do
        schema '$ref' => '#/components/schemas/Error'

        let(:Authorization) { 'Bearer invalid_token' }
        let(:report_type) { 'financial_summary' }

        run_test!
      end
    end
  end

  path '/api/v1/analytics/reports' do
    get 'Listar relatórios salvos' do
      tags 'Analytics'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      description 'Lista todos os relatórios gerados e salvos pelo usuário com paginação.'

      parameter name: :page, in: :query, type: :integer, required: false, description: 'Número da página'
      parameter name: :per_page, in: :query, type: :integer, required: false, description: 'Itens por página (default: 20)'

      response '200', 'Lista de relatórios retornada' do
        schema type: :object,
               properties: {
                 success: { type: :boolean, example: true },
                 data: {
                   type: :array,
                   items: {
                     type: :object,
                     properties: {
                       id: { type: :integer },
                       name: { type: :string },
                       report_type: { type: :string },
                       period_type: { type: :string },
                       status: { type: :string },
                       filter_criteria: { type: :object },
                       generated_at: { type: :string, format: 'date-time', nullable: true },
                       created_at: { type: :string, format: 'date-time' }
                     }
                   }
                 },
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

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['success']).to eq(true)
          expect(data['data']).to be_an(Array)
          expect(data['pagination']).to be_present
        end
      end

      response '401', 'Não autorizado' do
        schema '$ref' => '#/components/schemas/Error'

        let(:Authorization) { 'Bearer invalid_token' }

        run_test!
      end
    end
  end

  path '/api/v1/analytics/reports/{id}' do
    parameter name: :id, in: :path, type: :integer, description: 'ID do relatório'

    get 'Exibir relatório salvo' do
      tags 'Analytics'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      description 'Retorna os detalhes de um relatório específico salvo.'


      response '200', 'Relatório encontrado' do
        schema type: :object,
               properties: {
                 success: { type: :boolean, example: true },
                 data: {
                   type: :object,
                   properties: {
                     id: { type: :integer },
                     name: { type: :string },
                     report_type: { type: :string },
                     period_type: { type: :string },
                     status: { type: :string },
                     filter_criteria: { type: :object },
                     generated_at: { type: :string, format: 'date-time', nullable: true },
                     created_at: { type: :string, format: 'date-time' }
                   }
                 }
               }

        let!(:report) { create(:report, user: user) }
        let(:id) { report.id }

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['success']).to eq(true)
          expect(data['data']['id']).to eq(report.id)
        end
      end

      response '404', 'Relatório não encontrado' do
        schema type: :object,
               properties: {
                 success: { type: :boolean, example: false },
                 error: { type: :string, example: 'Report not found' }
               }

        let(:id) { 999999 }

        run_test!
      end

      response '401', 'Não autorizado' do
        schema '$ref' => '#/components/schemas/Error'

        let(:Authorization) { 'Bearer invalid_token' }
        let!(:report) { create(:report, user: user) }
        let(:id) { report.id }

        run_test!
      end
    end

    delete 'Excluir relatório salvo' do
      tags 'Analytics'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      description 'Remove um relatório salvo do usuário.'


      response '200', 'Relatório excluído' do
        schema type: :object,
               properties: {
                 success: { type: :boolean, example: true },
                 message: { type: :string, example: 'Report deleted successfully' }
               }

        let!(:report) { create(:report, user: user) }
        let(:id) { report.id }

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['success']).to eq(true)
        end
      end

      response '404', 'Relatório não encontrado' do
        schema type: :object,
               properties: {
                 success: { type: :boolean, example: false },
                 error: { type: :string, example: 'Report not found' }
               }

        let(:id) { 999999 }

        run_test!
      end

      response '401', 'Não autorizado' do
        schema '$ref' => '#/components/schemas/Error'

        let(:Authorization) { 'Bearer invalid_token' }
        let!(:report) { create(:report, user: user) }
        let(:id) { report.id }

        run_test!
      end
    end
  end
end
