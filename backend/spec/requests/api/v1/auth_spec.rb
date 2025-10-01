# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Auth', type: :request do
  let(:valid_attributes) do
    {
      email: 'test@example.com',
      password: 'Password123!',
      password_confirmation: 'Password123!',
      first_name: 'John',
      last_name: 'Doe'
    }
  end

  describe 'POST /api/v1/auth/sign_up' do
    context 'with valid parameters' do
      it 'creates a new user and returns tokens' do
        expect do
          post '/api/v1/auth/sign_up', params: { user: valid_attributes }
        end.to change(User, :count).by(1)

        expect(response).to have_http_status(:created)
        expect(json_response['success']).to be true
        expect(json_response['data']).to have_key('access_token')
        expect(json_response['data']).to have_key('refresh_token')
        expect(json_response['data']).to have_key('user')
        expect(json_response['data']['user']['email']).to eq('test@example.com')
      end
    end

    context 'with invalid parameters' do
      it 'returns validation errors for invalid email' do
        post '/api/v1/auth/sign_up', params: {
          user: valid_attributes.merge(email: 'invalid-email')
        }

        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_response['success']).to be false
        expect(json_response['errors']).to be_present
      end

      it 'returns validation errors for missing password' do
        post '/api/v1/auth/sign_up', params: {
          user: valid_attributes.except(:password)
        }

        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_response['success']).to be false
      end
    end

    context 'with duplicate email' do
      before { create(:user, email: 'test@example.com') }

      it 'returns email taken error' do
        post '/api/v1/auth/sign_up', params: { user: valid_attributes }

        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_response['errors']).to be_present
      end
    end
  end

  describe 'POST /api/v1/auth/sign_in' do
    let!(:user) { create(:user, email: 'test@example.com', password: 'Password123!') }

    context 'with valid credentials' do
      it 'returns access token and user data' do
        post '/api/v1/auth/sign_in', params: {
          user: { email: 'test@example.com', password: 'Password123!' }
        }

        expect(response).to have_http_status(:ok)
        expect(json_response['success']).to be true
        expect(json_response['data']).to have_key('access_token')
        expect(json_response['data']).to have_key('refresh_token')
        expect(json_response['data']['user']['email']).to eq('test@example.com')
      end
    end

    context 'with invalid credentials' do
      it 'returns unauthorized error for wrong password' do
        post '/api/v1/auth/sign_in', params: {
          user: { email: 'test@example.com', password: 'wrong-password' }
        }

        expect(response).to have_http_status(:unauthorized)
        expect(json_response['success']).to be false
        expect(json_response['message']).to eq('Invalid email or password')
      end

      it 'returns unauthorized error for non-existent email' do
        post '/api/v1/auth/sign_in', params: {
          user: { email: 'nonexistent@example.com', password: 'Password123!' }
        }

        expect(response).to have_http_status(:unauthorized)
        expect(json_response['success']).to be false
      end
    end

    context 'with unconfirmed email' do
      let!(:unconfirmed_user) do
        create(:user, :unconfirmed, email: 'unconfirmed@example.com', password: 'Password123!')
      end

      it 'returns error for unconfirmed email' do
        post '/api/v1/auth/sign_in', params: {
          user: { email: 'unconfirmed@example.com', password: 'Password123!' }
        }

        expect(response).to have_http_status(:unauthorized)
        expect(json_response['success']).to be false
        expect(json_response['message']).to eq('Please confirm your email before signing in')
      end
    end
  end

  describe 'DELETE /api/v1/auth/sign_out' do
    let(:user) { create(:user) }
    let(:auth_headers_hash) { auth_headers(user) }

    it 'invalidates the token by updating jti' do
      old_jti = user.jti

      delete '/api/v1/auth/sign_out', headers: auth_headers_hash

      expect(response).to have_http_status(:ok)
      expect(json_response['success']).to be true
      expect(json_response['message']).to eq('Signed out successfully')
      expect(user.reload.jti).not_to eq(old_jti)
    end

    it 'returns unauthorized without token' do
      delete '/api/v1/auth/sign_out'

      expect(response).to have_http_status(:unauthorized)
      expect(json_response['success']).to be false
    end

    it 'returns unauthorized with invalid token' do
      delete '/api/v1/auth/sign_out', headers: { 'Authorization' => 'Bearer invalid-token' }

      expect(response).to have_http_status(:unauthorized)
      expect(json_response['success']).to be false
    end
  end

  describe 'POST /api/v1/auth/refresh_token' do
    let(:user) { create(:user) }
    let(:tokens) { JwtService.generate_tokens(user) }

    context 'with valid refresh token' do
      it 'returns new access token' do
        post '/api/v1/auth/refresh_token', params: {
          refresh_token: tokens[:refresh_token]
        }

        expect(response).to have_http_status(:ok)
        expect(json_response['success']).to be true
        expect(json_response['data']).to have_key('access_token')
        expect(json_response['data']).to have_key('refresh_token')
      end
    end

    context 'with invalid refresh token' do
      it 'returns error with invalid token' do
        post '/api/v1/auth/refresh_token', params: {
          refresh_token: 'invalid-token'
        }

        expect(response).to have_http_status(:unauthorized)
        expect(json_response['success']).to be false
      end

      it 'returns error with access token instead of refresh token' do
        post '/api/v1/auth/refresh_token', params: {
          refresh_token: tokens[:access_token]
        }

        expect(response).to have_http_status(:unauthorized)
        expect(json_response['success']).to be false
      end
    end

    context 'with revoked token' do
      it 'returns error when user jti has changed' do
        # Force evaluation of tokens before updating jti
        refresh_token = tokens[:refresh_token]
        user.update!(jti: SecureRandom.uuid)

        post '/api/v1/auth/refresh_token', params: {
          refresh_token: refresh_token
        }

        expect(response).to have_http_status(:unauthorized)
        expect(json_response['success']).to be false
      end
    end
  end

  describe 'POST /api/v1/auth/reset_password' do
    let!(:user) { create(:user, email: 'test@example.com') }

    it 'sends reset password instructions' do
      expect do
        post '/api/v1/auth/reset_password', params: {
          user: { email: 'test@example.com' }
        }
      end.to change { ActionMailer::Base.deliveries.count }.by(1)

      expect(response).to have_http_status(:ok)
      expect(json_response['success']).to be true
      expect(json_response['message']).to eq('Password reset instructions sent')
    end

    it 'does not reveal if email does not exist' do
      post '/api/v1/auth/reset_password', params: {
        user: { email: 'nonexistent@example.com' }
      }

      expect(response).to have_http_status(:ok)
      expect(json_response['success']).to be true
      expect(json_response['message']).to eq('Password reset instructions sent')
    end
  end

  describe 'PUT /api/v1/auth/update_password' do
    let(:user) { create(:user) }
    let(:reset_token) { user.send_reset_password_instructions }

    context 'with valid reset token' do
      it 'updates password and returns tokens' do
        raw_token = user.send(:set_reset_password_token)

        put '/api/v1/auth/update_password', params: {
          user: {
            reset_password_token: raw_token,
            password: 'NewPassword123!',
            password_confirmation: 'NewPassword123!'
          }
        }

        expect(response).to have_http_status(:ok)
        expect(json_response['success']).to be true
        expect(json_response['data']).to have_key('access_token')
        expect(user.reload.valid_password?('NewPassword123!')).to be true
      end
    end

    context 'with invalid reset token' do
      it 'returns validation errors' do
        put '/api/v1/auth/update_password', params: {
          user: {
            reset_password_token: 'invalid-token',
            password: 'NewPassword123!',
            password_confirmation: 'NewPassword123!'
          }
        }

        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_response['success']).to be false
      end
    end

    context 'with mismatched passwords' do
      it 'returns validation errors' do
        raw_token = user.send(:set_reset_password_token)

        put '/api/v1/auth/update_password', params: {
          user: {
            reset_password_token: raw_token,
            password: 'NewPassword123!',
            password_confirmation: 'DifferentPassword123!'
          }
        }

        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_response['success']).to be false
      end
    end
  end

  describe 'POST /api/v1/auth/confirm_email' do
    let(:user) { create(:user, :unconfirmed) }

    context 'with valid confirmation token' do
      it 'confirms email and returns tokens' do
        raw_token = user.confirmation_token

        post '/api/v1/auth/confirm_email', params: {
          confirmation_token: raw_token
        }

        expect(response).to have_http_status(:ok)
        expect(json_response['success']).to be true
        expect(json_response['data']).to have_key('access_token')
        expect(user.reload.confirmed?).to be true
      end
    end

    context 'with invalid confirmation token' do
      it 'returns validation errors' do
        post '/api/v1/auth/confirm_email', params: {
          confirmation_token: 'invalid-token'
        }

        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_response['success']).to be false
      end
    end
  end
end
