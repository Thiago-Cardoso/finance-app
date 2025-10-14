require 'rails_helper'

RSpec.describe Api::V1::AnalyticsController, type: :controller do
  let(:user) { create(:user) }
  let(:auth_headers) { { 'Authorization' => "Bearer #{generate_jwt_token(user)}" } }

  before do
    request.headers.merge!(auth_headers)
  end

  describe 'GET #financial_summary' do
    context 'when authenticated' do
      it 'returns financial summary data' do
        get :financial_summary

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['success']).to be true
        expect(json_response['data']).to be_present
      end

      it 'caches the result' do
        expect(Rails.cache).to receive(:fetch).and_call_original

        get :financial_summary
      end

      it 'accepts filter parameters' do
        get :financial_summary, params: {
          period_type: 'monthly',
          start_date: Date.current.beginning_of_month,
          end_date: Date.current.end_of_month
        }

        expect(response).to have_http_status(:ok)
      end
    end

    context 'when not authenticated' do
      before { request.headers.delete('Authorization') }

      it 'returns unauthorized' do
        get :financial_summary
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when generation fails' do
      before do
        allow_any_instance_of(Reports::FinancialSummaryGenerator)
          .to receive(:generate).and_raise(StandardError, 'Generation failed')
      end

      it 'returns error response' do
        get :financial_summary

        expect(response).to have_http_status(:unprocessable_entity)
        json_response = JSON.parse(response.body)
        expect(json_response['success']).to be false
        expect(json_response['error']).to eq('Generation failed')
      end
    end
  end

  describe 'GET #budget_performance' do
    context 'when authenticated' do
      it 'returns budget performance data' do
        get :budget_performance

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['success']).to be true
        expect(json_response['data']).to be_present
      end

      it 'caches the result' do
        expect(Rails.cache).to receive(:fetch).and_call_original

        get :budget_performance
      end
    end
  end

  describe 'GET #export' do
    context 'with valid parameters' do
      it 'exports financial_summary as PDF' do
        get :export, params: {
          report_type: 'financial_summary',
          format: 'pdf'
        }

        expect(response).to have_http_status(:ok)
        expect(response.content_type).to eq('application/pdf')
        expect(response.headers['Content-Disposition']).to include('attachment')
        expect(response.headers['Content-Disposition']).to include('.pdf')
      end

      it 'exports budget_performance as Excel' do
        get :export, params: {
          report_type: 'budget_performance',
          format: 'excel'
        }

        expect(response).to have_http_status(:ok)
        expect(response.content_type).to eq('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        expect(response.headers['Content-Disposition']).to include('.xlsx')
      end

      it 'defaults to PDF format if not specified' do
        get :export, params: {
          report_type: 'financial_summary'
        }

        expect(response).to have_http_status(:ok)
        expect(response.content_type).to eq('application/pdf')
      end
    end

    context 'with invalid report type' do
      it 'returns bad request error' do
        get :export, params: {
          report_type: 'invalid_type',
          format: 'pdf'
        }

        expect(response).to have_http_status(:bad_request)
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Invalid report type')
      end
    end

    context 'with invalid format' do
      it 'returns bad request error' do
        get :export, params: {
          report_type: 'financial_summary',
          format: 'invalid_format'
        }

        expect(response).to have_http_status(:bad_request)
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Invalid format type')
      end
    end
  end

  describe 'GET #reports' do
    let!(:report1) { create(:report, user: user, generated_at: 2.days.ago) }
    let!(:report2) { create(:report, user: user, generated_at: 1.day.ago) }
    let!(:other_user_report) { create(:report) }

    it 'returns user reports' do
      get :reports

      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response['success']).to be true
      expect(json_response['data'].length).to eq(2)
      expect(json_response['pagination']).to be_present
    end

    it 'orders reports by most recent first' do
      get :reports

      json_response = JSON.parse(response.body)
      report_ids = json_response['data'].map { |r| r['id'] }
      expect(report_ids).to eq([report2.id, report1.id])
    end

    it 'does not return other users reports' do
      get :reports

      json_response = JSON.parse(response.body)
      report_ids = json_response['data'].map { |r| r['id'] }
      expect(report_ids).not_to include(other_user_report.id)
    end

    it 'supports pagination' do
      get :reports, params: { page: 1, per_page: 1 }

      json_response = JSON.parse(response.body)
      expect(json_response['data'].length).to eq(1)
      expect(json_response['pagination']['total_count']).to eq(2)
    end
  end

  describe 'GET #show_report' do
    let(:report) { create(:report, user: user) }

    it 'returns the report details' do
      get :show_report, params: { id: report.id }

      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response['success']).to be true
      expect(json_response['data']['id']).to eq(report.id)
    end

    context 'when report does not exist' do
      it 'returns not found error' do
        get :show_report, params: { id: 99999 }

        expect(response).to have_http_status(:not_found)
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Report not found')
      end
    end

    context 'when report belongs to another user' do
      let(:other_user_report) { create(:report) }

      it 'returns not found error' do
        get :show_report, params: { id: other_user_report.id }

        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe 'DELETE #destroy_report' do
    let!(:report) { create(:report, user: user) }

    it 'deletes the report' do
      expect {
        delete :destroy_report, params: { id: report.id }
      }.to change(Report, :count).by(-1)

      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response['success']).to be true
    end

    context 'when report does not exist' do
      it 'returns not found error' do
        delete :destroy_report, params: { id: 99999 }

        expect(response).to have_http_status(:not_found)
      end
    end

    context 'when report belongs to another user' do
      let(:other_user_report) { create(:report) }

      it 'does not delete the report' do
        expect {
          delete :destroy_report, params: { id: other_user_report.id }
        }.not_to change(Report, :count)

        expect(response).to have_http_status(:not_found)
      end
    end
  end

  private

  def generate_jwt_token(user)
    # Helper method to generate JWT token for testing
    # This should match your authentication logic
    payload = { user_id: user.id, jti: user.jti }
    JWT.encode(payload, Rails.application.credentials.devise_jwt_secret_key!)
  end
end
