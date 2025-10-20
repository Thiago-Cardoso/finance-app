# frozen_string_literal: true

require 'swagger_helper'

RSpec.describe 'api/v1/dashboard', type: :request do
  let!(:user) { create(:user) }
  let(:Authorization) { "Bearer #{JwtService.generate_tokens(user)[:access_token]}" }

  path '/api/v1/dashboard' do
    get 'Obter dados do dashboard' do
      tags 'Dashboard'
      produces 'application/json'
      security [{ bearerAuth: [] }]

      description 'Retorna dados consolidados do dashboard financeiro do usuário, incluindo resumo, saldo, transações recentes, categorias principais, evolução mensal, status dos orçamentos e progresso das metas.'

      parameter name: :period, in: :query, type: :string, enum: ['current_month', 'last_month', 'current_year', 'custom'], required: false, description: 'Período dos dados (default: current_month)'
      parameter name: :start_date, in: :query, type: :string, format: :date, required: false, description: 'Data inicial (usado com period=custom)'
      parameter name: :end_date, in: :query, type: :string, format: :date, required: false, description: 'Data final (usado com period=custom)'

      response '200', 'Dashboard retornado com sucesso' do
        schema type: :object,
               properties: {
                 success: { type: :boolean, example: true },
                 data: {
                   type: :object,
                   properties: {
                     summary: {
                       type: :object,
                       properties: {
                         total_income: { type: :number, example: 5000.00 },
                         total_expenses: { type: :number, example: 3000.00 },
                         net_amount: { type: :number, example: 2000.00 },
                         variation_percentage: { type: :number, example: 15.5 },
                         variation_trend: { type: :string, enum: ['up', 'down', 'stable'], example: 'up' }
                       }
                     },
                     current_balance: {
                       type: :object,
                       properties: {
                         raw: { type: :number, example: 10500.50 },
                         formatted: { type: :string, example: 'R$ 10.500,50' }
                       }
                     },
                     recent_transactions: {
                       type: :array,
                       items: { '$ref' => '#/components/schemas/Transaction' },
                       description: 'Últimas 5 transações'
                     },
                     top_categories: {
                       type: :array,
                       items: {
                         type: :object,
                         properties: {
                           id: { type: :integer },
                           name: { type: :string },
                           amount: { type: :number },
                           formatted_amount: { type: :string },
                           percentage: { type: :number },
                           color: { type: :string }
                         }
                       },
                       description: 'Top 5 categorias por gasto'
                     },
                     monthly_evolution: {
                       type: :array,
                       items: {
                         type: :object,
                         properties: {
                           month: { type: :string, example: '2025-01' },
                           income: { type: :number },
                           expenses: { type: :number },
                           balance: { type: :number },
                           formatted_income: { type: :string },
                           formatted_expenses: { type: :string },
                           formatted_balance: { type: :string }
                         }
                       },
                       description: 'Evolução dos últimos 6 meses'
                     },
                     budget_status: {
                       type: :array,
                       items: {
                         type: :object,
                         properties: {
                           id: { type: :integer },
                           category_name: { type: :string },
                           limit: { type: :number },
                           spent: { type: :number },
                           remaining: { type: :number },
                           percentage_used: { type: :number },
                           formatted_limit: { type: :string },
                           formatted_spent: { type: :string },
                           formatted_remaining: { type: :string },
                           status: { type: :string, enum: ['ok', 'warning', 'exceeded'] }
                         }
                       }
                     },
                     goals_progress: {
                       type: :array,
                       items: {
                         type: :object,
                         properties: {
                           id: { type: :integer },
                           name: { type: :string },
                           target_amount: { type: :number },
                           current_amount: { type: :number },
                           percentage: { type: :number },
                           deadline: { type: :string, format: :date },
                           status: { type: :string, enum: ['on_track', 'at_risk', 'completed'] }
                         }
                       }
                     },
                     last_updated: { type: :string, format: 'date-time', example: '2025-01-19T10:30:00Z' }
                   }
                 }
               }

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['success']).to eq(true)
          expect(data['data']).to have_key('summary')
          expect(data['data']).to have_key('current_balance')
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
