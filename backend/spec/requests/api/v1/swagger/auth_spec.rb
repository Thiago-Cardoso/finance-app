# frozen_string_literal: true

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
              password: 'Password123!',
              password_confirmation: 'Password123!',
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
            password: 'Password123!',
            password_confirmation: 'Password123!',
            first_name: 'Test',
            last_name: 'User',
            confirmed_at: Time.now
          )
        end

        let(:credentials) do
          {
            user: {
              email: 'test@example.com',
              password: 'Password123!'
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
              password: { type: :string, format: :password, example: 'NewPassword123!' },
              password_confirmation: { type: :string, format: :password, example: 'NewPassword123!' }
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
              password: 'NewPassword123!',
              password_confirmation: 'NewPassword123!'
            }
          }
        end

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['success']).to eq(true)
          expect(data['data']['access_token']).to be_present
        end
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

      parameter name: :confirmation_params, in: :body, schema: {
        type: :object,
        properties: {
          confirmation_token: { type: :string, example: 'abc123token' }
        },
        required: [:confirmation_token]
      }

      response '200', 'Email confirmado com sucesso' do
        schema '$ref' => '#/components/schemas/AuthTokensResponse'

        let!(:user) { create(:user, :unconfirmed) }
        let(:token) { user.send(:generate_confirmation_token) }
        let(:confirmation_params) { { confirmation_token: token } }

        before do
          user.save
        end

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['success']).to eq(true)
          expect(data['data']['access_token']).to be_present
        end
      end

      response '422', 'Token de confirmação inválido' do
        schema '$ref' => '#/components/schemas/Error'

        let(:confirmation_params) { { confirmation_token: 'invalid_token' } }

        run_test!
      end
    end
  end
end
