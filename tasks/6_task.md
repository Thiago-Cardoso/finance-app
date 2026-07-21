---
status: completed
parallelizable: false
blocked_by: ["5.0"]
---

<task_context>
<domain>backend/authentication/jwt</domain>
<type>implementation</type>
<scope>core_feature</scope>
<complexity>high</complexity>
<dependencies>database|rails|devise|jwt</dependencies>
<unblocks>7.0</unblocks>
</task_context>

# Tarefa 6.0: Sistema de Autenticação JWT

## Visão Geral

Implementar sistema completo de autenticação JWT com Devise, incluindo controllers de auth, middleware de autenticação, token management e integração com a estrutura Rails já criada. Esta tarefa estabelece a segurança e controle de acesso para toda a API.

## Requisitos

- Configurar Devise para modo API com JWT tokens
- Implementar controllers de autenticação (sign_up, sign_in, sign_out, password reset)
- Criar middleware de autenticação para proteger endpoints da API
- Implementar token management com refresh tokens
- Configurar rate limiting para endpoints de auth
- Implementar validações de segurança e headers
- Integrar com User model já criado na Tarefa 5.0
- Configurar CORS apropriado para frontend
- Implementar logout com invalidação de token

## Subtarefas

- [ ] 6.1 Configuração inicial Devise + JWT gems
- [ ] 6.2 Configuração JWT token encoding/decoding
- [ ] 6.3 Controller de Registro (sign_up)
- [ ] 6.4 Controller de Login (sign_in)
- [ ] 6.5 Controller de Logout (sign_out)
- [ ] 6.6 Controller de Reset de Senha
- [ ] 6.7 Middleware de Autenticação para APIs
- [ ] 6.8 Rate limiting e headers de segurança
- [ ] 6.9 Testes de integração dos endpoints
- [ ] 6.10 Documentação da API de autenticação

## Sequenciamento

- Bloqueado por: 5.0 (Models e Migrações)
- Desbloqueia: 7.0 (Setup de Testes Backend)
- Paralelizável: Não (depende do User model implementado)

## Detalhes de Implementação

### 6.1 Configuração Devise + JWT

**Gemfile (adições):**
```ruby
# Já incluído na Tarefa 2.0, mas verificar se está presente:
gem 'devise'
gem 'jwt'
gem 'rack-attack'
gem 'rack-cors'
```

**Configuração Devise:**
```ruby
# config/initializers/devise.rb
Devise.setup do |config|
  config.mailer_sender = 'noreply@financeapp.com'
  config.case_insensitive_keys = [:email]
  config.strip_whitespace_keys = [:email]
  config.skip_session_storage = [:http_auth, :params_auth]
  config.stretches = Rails.env.test? ? 1 : 12
  config.reconfirmable = true
  config.expire_all_remember_me_on_sign_out = true
  config.password_length = 8..128
  config.email_regexp = /\A[^@\s]+@[^@\s]+\z/
  config.reset_password_within = 6.hours
  config.sign_out_via = :delete
  config.navigational_formats = []

  # JWT specific configuration
  config.jwt do |jwt|
    jwt.secret = Rails.application.credentials.jwt_secret_key
    jwt.dispatch_requests = [
      ['POST', %r{^/api/v1/auth/sign_in$}]
    ]
    jwt.revocation_requests = [
      ['DELETE', %r{^/api/v1/auth/sign_out$}]
    ]
    jwt.expiration_time = 24.hours.to_i
  end
end
```

### 6.2 JWT Token Management

**JWT Service:**
```ruby
# app/services/jwt_service.rb
class JwtService
  JWT_SECRET = Rails.application.credentials.jwt_secret_key
  JWT_ALGORITHM = 'HS256'

  class << self
    def encode(payload, expiration = 24.hours.from_now)
      payload[:exp] = expiration.to_i
      payload[:iat] = Time.current.to_i
      JWT.encode(payload, JWT_SECRET, JWT_ALGORITHM)
    end

    def decode(token)
      decoded = JWT.decode(token, JWT_SECRET, true, {
        algorithm: JWT_ALGORITHM,
        verify_expiration: true,
        verify_iat: true
      })
      HashWithIndifferentAccess.new(decoded[0])
    rescue JWT::ExpiredSignature => e
      raise TokenExpiredError, 'Token has expired'
    rescue JWT::DecodeError => e
      raise TokenInvalidError, 'Invalid token'
    end

    def generate_tokens(user)
      access_payload = {
        user_id: user.id,
        jti: user.jti,
        email: user.email
      }

      refresh_payload = {
        user_id: user.id,
        jti: user.jti,
        type: 'refresh'
      }

      {
        access_token: encode(access_payload),
        refresh_token: encode(refresh_payload, 7.days.from_now),
        expires_in: 24.hours.to_i
      }
    end

    def refresh_access_token(refresh_token)
      payload = decode(refresh_token)

      unless payload[:type] == 'refresh'
        raise TokenInvalidError, 'Invalid refresh token'
      end

      user = User.find_by(id: payload[:user_id], jti: payload[:jti])
      raise TokenInvalidError, 'User not found or token revoked' unless user

      generate_tokens(user)
    end
  end

  class TokenExpiredError < StandardError; end
  class TokenInvalidError < StandardError; end
end
```

### 6.3 Controllers de Autenticação

**Base Controller:**
```ruby
# app/controllers/api/v1/base_controller.rb
class Api::V1::BaseController < ApplicationController
  include Authenticable

  protect_from_forgery with: :null_session
  respond_to :json

  rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
  rescue_from ActiveRecord::RecordInvalid, with: :render_validation_errors
  rescue_from JwtService::TokenExpiredError, with: :render_token_expired
  rescue_from JwtService::TokenInvalidError, with: :render_unauthorized

  private

  def render_success(data = {}, message = 'Success', status = :ok)
    render json: {
      success: true,
      data: data,
      message: message
    }, status: status
  end

  def render_error(message, errors = [], status = :unprocessable_entity)
    render json: {
      success: false,
      message: message,
      errors: errors
    }, status: status
  end

  def render_not_found(exception)
    render json: {
      success: false,
      message: 'Resource not found',
      errors: [{ field: 'id', message: 'Record not found' }]
    }, status: :not_found
  end

  def render_validation_errors(exception)
    errors = exception.record.errors.map do |error|
      { field: error.attribute, message: error.message }
    end

    render_error('Validation failed', errors, :unprocessable_entity)
  end

  def render_unauthorized(exception = nil)
    render json: {
      success: false,
      message: 'Unauthorized',
      errors: [{ field: 'authorization', message: 'Invalid or missing token' }]
    }, status: :unauthorized
  end

  def render_token_expired(exception)
    render json: {
      success: false,
      message: 'Token expired',
      errors: [{ field: 'authorization', message: 'Token has expired' }]
    }, status: :unauthorized
  end
end
```

**Authenticable Concern:**
```ruby
# app/controllers/concerns/authenticable.rb
module Authenticable
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_user!
  end

  private

  def authenticate_user!
    token = extract_token_from_header
    return render_unauthorized unless token

    payload = JwtService.decode(token)
    @current_user = User.find_by(id: payload[:user_id], jti: payload[:jti])

    render_unauthorized unless @current_user
  rescue JwtService::TokenExpiredError => e
    render_token_expired(e)
  rescue JwtService::TokenInvalidError => e
    render_unauthorized(e)
  end

  def current_user
    @current_user
  end

  def extract_token_from_header
    header = request.headers['Authorization']
    return nil unless header

    header.split(' ').last if header.start_with?('Bearer ')
  end

  def render_unauthorized(exception = nil)
    render json: {
      success: false,
      message: 'Unauthorized',
      errors: [{ field: 'authorization', message: 'Invalid or missing token' }]
    }, status: :unauthorized
  end

  def render_token_expired(exception)
    render json: {
      success: false,
      message: 'Token expired',
      errors: [{ field: 'authorization', message: 'Token has expired' }]
    }, status: :unauthorized
  end
end
```

**Authentication Controller:**
```ruby
# app/controllers/api/v1/auth_controller.rb
class Api::V1::AuthController < Api::V1::BaseController
  skip_before_action :authenticate_user!, only: [:sign_up, :sign_in, :reset_password, :update_password]

  def sign_up
    user = User.new(sign_up_params)

    if user.save
      user.send_confirmation_instructions unless user.confirmed?
      tokens = JwtService.generate_tokens(user)

      render_success({
        user: user_data(user),
        **tokens
      }, 'User created successfully', :created)
    else
      render_validation_errors(ActiveRecord::RecordInvalid.new(user))
    end
  end

  def sign_in
    user = User.find_for_database_authentication(email: sign_in_params[:email])

    if user&.valid_password?(sign_in_params[:password])
      if user.confirmed?
        tokens = JwtService.generate_tokens(user)

        render_success({
          user: user_data(user),
          **tokens
        }, 'Signed in successfully')
      else
        render_error('Please confirm your email before signing in',
                    [{ field: 'email', message: 'Email not confirmed' }],
                    :unauthorized)
      end
    else
      render_error('Invalid email or password',
                  [{ field: 'credentials', message: 'Invalid email or password' }],
                  :unauthorized)
    end
  end

  def sign_out
    if current_user
      # Invalidate token by updating jti
      current_user.update!(jti: SecureRandom.uuid)
      render_success({}, 'Signed out successfully')
    else
      render_unauthorized
    end
  end

  def refresh_token
    refresh_token = params[:refresh_token]
    return render_error('Refresh token required') unless refresh_token

    tokens = JwtService.refresh_access_token(refresh_token)
    render_success(tokens, 'Token refreshed successfully')
  rescue JwtService::TokenInvalidError => e
    render_error('Invalid refresh token',
                [{ field: 'refresh_token', message: e.message }],
                :unauthorized)
  end

  def reset_password
    user = User.find_by(email: reset_password_params[:email])

    if user
      user.send_reset_password_instructions
      render_success({}, 'Password reset instructions sent')
    else
      # Don't reveal if email exists for security
      render_success({}, 'Password reset instructions sent')
    end
  end

  def update_password
    user = User.reset_password_by_token(update_password_params)

    if user.errors.empty?
      tokens = JwtService.generate_tokens(user)
      render_success({
        user: user_data(user),
        **tokens
      }, 'Password updated successfully')
    else
      render_validation_errors(ActiveRecord::RecordInvalid.new(user))
    end
  end

  def confirm_email
    user = User.confirm_by_token(params[:confirmation_token])

    if user.errors.empty?
      tokens = JwtService.generate_tokens(user)
      render_success({
        user: user_data(user),
        **tokens
      }, 'Email confirmed successfully')
    else
      render_validation_errors(ActiveRecord::RecordInvalid.new(user))
    end
  end

  private

  def sign_up_params
    params.require(:user).permit(:email, :password, :password_confirmation, :first_name, :last_name)
  end

  def sign_in_params
    params.require(:user).permit(:email, :password)
  end

  def reset_password_params
    params.require(:user).permit(:email)
  end

  def update_password_params
    params.require(:user).permit(:reset_password_token, :password, :password_confirmation)
  end

  def user_data(user)
    {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      confirmed_at: user.confirmed_at
    }
  end
end
```

### 6.4 Rate Limiting e Segurança

**Rack Attack Configuration:**
```ruby
# config/initializers/rack_attack.rb
class Rack::Attack
  # Throttle login attempts
  throttle('auth/sign_in', limit: 10, period: 1.minute) do |req|
    if req.path == '/api/v1/auth/sign_in' && req.post?
      req.ip
    end
  end

  # Throttle sign up attempts
  throttle('auth/sign_up', limit: 5, period: 1.hour) do |req|
    if req.path == '/api/v1/auth/sign_up' && req.post?
      req.ip
    end
  end

  # Throttle password reset attempts
  throttle('auth/reset_password', limit: 5, period: 1.hour) do |req|
    if req.path == '/api/v1/auth/reset_password' && req.post?
      req.ip
    end
  end

  # General API rate limiting
  throttle('api/requests', limit: 1000, period: 1.hour) do |req|
    if req.path.start_with?('/api/')
      req.ip
    end
  end

  # Block suspicious requests
  blocklist('block suspicious ips') do |req|
    # Block known malicious IPs
    ['127.0.0.2'].include?(req.ip)
  end

  # Response for throttled requests
  self.throttled_response = lambda do |env|
    [
      429, # status
      {
        'Content-Type' => 'application/json',
        'Retry-After' => '60'
      },
      [{
        success: false,
        message: 'Rate limit exceeded',
        errors: [{ field: 'requests', message: 'Too many requests. Please try again later.' }]
      }.to_json]
    ]
  end
end

# Enable rack attack
Rails.application.config.middleware.use Rack::Attack
```

**CORS Configuration:**
```ruby
# config/initializers/cors.rb
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins Rails.env.production? ?
            ['https://yourapp.com', 'https://app.yourapp.com'] :
            ['http://localhost:3000', 'http://127.0.0.1:3000']

    resource '/api/*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true,
      expose: ['Authorization']
  end
end
```

### 6.5 Routes Configuration

**Routes:**
```ruby
# config/routes.rb
Rails.application.routes.draw do
  devise_for :users, skip: :all

  namespace :api do
    namespace :v1 do
      namespace :auth do
        post :sign_up
        post :sign_in
        delete :sign_out
        post :refresh_token
        post :reset_password
        put :update_password
        post :confirm_email
      end

      # Protected routes will be added in subsequent tasks
      # resources :transactions
      # resources :categories
      # etc...
    end
  end

  # Health check endpoint
  get '/health', to: 'health#show'
end
```

### 6.6 Email Configuration

**Mailer Configuration:**
```ruby
# config/environments/development.rb
config.action_mailer.default_url_options = { host: 'localhost', port: 3000 }
config.action_mailer.delivery_method = :smtp
config.action_mailer.smtp_settings = {
  address: 'localhost',
  port: 1025, # MailCatcher port
  domain: 'localhost'
}

# config/environments/production.rb
config.action_mailer.default_url_options = { host: 'api.yourapp.com' }
config.action_mailer.delivery_method = :smtp
config.action_mailer.smtp_settings = {
  address: ENV['SMTP_ADDRESS'],
  port: ENV['SMTP_PORT'],
  domain: ENV['SMTP_DOMAIN'],
  user_name: ENV['SMTP_USERNAME'],
  password: ENV['SMTP_PASSWORD'],
  authentication: :plain,
  enable_starttls_auto: true
}
```

**Custom Mailer Views:**
```erb
<!-- app/views/devise/mailer/confirmation_instructions.html.erb -->
<p>Welcome <%= @resource.first_name %>!</p>

<p>You can confirm your account email through the link below:</p>

<p><%= link_to 'Confirm my account', confirmation_url(@resource, confirmation_token: @token) %></p>

<!-- app/views/devise/mailer/reset_password_instructions.html.erb -->
<p>Hello <%= @resource.first_name %>!</p>

<p>Someone has requested a link to change your password. You can do this through the link below.</p>

<p><%= link_to 'Change my password', edit_password_url(@resource, reset_password_token: @token) %></p>

<p>If you didn't request this, please ignore this email.</p>
<p>Your password won't change until you access the link above and create a new one.</p>
```

### 6.7 Security Headers

**Security Headers Middleware:**
```ruby
# app/middleware/security_headers_middleware.rb
class SecurityHeadersMiddleware
  def initialize(app)
    @app = app
  end

  def call(env)
    status, headers, response = @app.call(env)

    # Add security headers
    headers['X-Frame-Options'] = 'DENY'
    headers['X-Content-Type-Options'] = 'nosniff'
    headers['X-XSS-Protection'] = '1; mode=block'
    headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    headers['X-Download-Options'] = 'noopen'
    headers['X-Permitted-Cross-Domain-Policies'] = 'none'

    if Rails.env.production?
      headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    end

    [status, headers, response]
  end
end

# config/application.rb
config.middleware.use SecurityHeadersMiddleware
```

### 6.8 Testes de Integração

**Request Specs:**
```ruby
# spec/requests/api/v1/auth_spec.rb
RSpec.describe 'Api::V1::Auth', type: :request do
  let(:valid_attributes) do
    {
      email: 'test@example.com',
      password: 'password123',
      password_confirmation: 'password123',
      first_name: 'John',
      last_name: 'Doe'
    }
  end

  describe 'POST /api/v1/auth/sign_up' do
    context 'with valid parameters' do
      it 'creates a new user and returns tokens' do
        expect {
          post '/api/v1/auth/sign_up', params: { user: valid_attributes }
        }.to change(User, :count).by(1)

        expect(response).to have_http_status(:created)
        expect(json_response['success']).to be true
        expect(json_response['data']).to have_key('access_token')
        expect(json_response['data']).to have_key('user')
        expect(json_response['data']['user']['email']).to eq('test@example.com')
      end
    end

    context 'with invalid parameters' do
      it 'returns validation errors' do
        post '/api/v1/auth/sign_up', params: {
          user: valid_attributes.merge(email: 'invalid-email')
        }

        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_response['success']).to be false
        expect(json_response['errors']).to be_present
      end
    end

    context 'with duplicate email' do
      before { create(:user, email: 'test@example.com') }

      it 'returns email taken error' do
        post '/api/v1/auth/sign_up', params: { user: valid_attributes }

        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_response['errors']).to include(
          hash_including('field' => 'email', 'message' => 'has already been taken')
        )
      end
    end
  end

  describe 'POST /api/v1/auth/sign_in' do
    let!(:user) { create(:user, email: 'test@example.com', password: 'password123') }

    context 'with valid credentials' do
      it 'returns access token and user data' do
        post '/api/v1/auth/sign_in', params: {
          user: { email: 'test@example.com', password: 'password123' }
        }

        expect(response).to have_http_status(:ok)
        expect(json_response['success']).to be true
        expect(json_response['data']).to have_key('access_token')
        expect(json_response['data']['user']['email']).to eq('test@example.com')
      end
    end

    context 'with invalid credentials' do
      it 'returns unauthorized error' do
        post '/api/v1/auth/sign_in', params: {
          user: { email: 'test@example.com', password: 'wrong-password' }
        }

        expect(response).to have_http_status(:unauthorized)
        expect(json_response['success']).to be false
      end
    end
  end

  describe 'DELETE /api/v1/auth/sign_out' do
    let(:user) { create(:user) }
    let(:auth_headers) { { 'Authorization' => "Bearer #{jwt_token(user)}" } }

    it 'invalidates the token' do
      old_jti = user.jti

      delete '/api/v1/auth/sign_out', headers: auth_headers

      expect(response).to have_http_status(:ok)
      expect(json_response['success']).to be true
      expect(user.reload.jti).not_to eq(old_jti)
    end
  end

  describe 'POST /api/v1/auth/refresh_token' do
    let(:user) { create(:user) }
    let(:tokens) { JwtService.generate_tokens(user) }

    it 'returns new access token with valid refresh token' do
      post '/api/v1/auth/refresh_token', params: {
        refresh_token: tokens[:refresh_token]
      }

      expect(response).to have_http_status(:ok)
      expect(json_response['data']).to have_key('access_token')
    end

    it 'returns error with invalid refresh token' do
      post '/api/v1/auth/refresh_token', params: {
        refresh_token: 'invalid-token'
      }

      expect(response).to have_http_status(:unauthorized)
      expect(json_response['success']).to be false
    end
  end
end

# spec/support/auth_helpers.rb
module AuthHelpers
  def jwt_token(user)
    JwtService.generate_tokens(user)[:access_token]
  end

  def auth_headers(user)
    { 'Authorization' => "Bearer #{jwt_token(user)}" }
  end

  def json_response
    JSON.parse(response.body)
  end
end

RSpec.configure do |config|
  config.include AuthHelpers, type: :request
end
```

### 6.9 Environment Variables

**Environment Configuration:**
```bash
# .env.example
JWT_SECRET_KEY=your_jwt_secret_key_here_make_it_long_and_random
SMTP_ADDRESS=smtp.gmail.com
SMTP_PORT=587
SMTP_DOMAIN=gmail.com
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

**Credentials Configuration:**
```ruby
# config/credentials.yml.enc (use: rails credentials:edit)
jwt_secret_key: your_very_long_and_secure_secret_key_for_jwt_tokens

production:
  jwt_secret_key: production_jwt_secret_key
  smtp:
    address: smtp.gmail.com
    username: production-email@gmail.com
    password: production-app-password
```

## Critérios de Sucesso

- [ ] Usuários podem se registrar via API com validações apropriadas
- [ ] Login retorna JWT tokens válidos e dados do usuário
- [ ] Logout invalida tokens corretamente (via JTI update)
- [ ] Refresh token funciona para renovar access tokens
- [ ] Reset de senha envia emails e permite atualização
- [ ] Middleware de auth protege endpoints corretamente
- [ ] Rate limiting impede ataques de força bruta
- [ ] Headers de segurança estão configurados
- [ ] CORS permite acesso apenas de origens autorizadas
- [ ] Tokens expiram no tempo configurado (24h)
- [ ] Testes cobrem todos os cenários de auth (> 95% coverage)
- [ ] Email de confirmação funciona corretamente
- [ ] Validações de entrada impedem dados maliciosos

## Estimativa de Tempo

- **Tempo Total**: 20-24 horas
- **Complexidade**: Alta (segurança é crítica)
- **Dependências**: Críticas (5.0 - User model)
- **Risco**: Alto (falhas de segurança são críticas)

## Entregáveis

1. JWT Service para encoding/decoding de tokens
2. Controllers de autenticação completos (sign_up, sign_in, etc.)
3. Middleware de autenticação para proteção de APIs
4. Configuração de rate limiting e headers de segurança
5. Configuração CORS apropriada
6. Suite completa de testes de integração
7. Configuração de email para reset de senha
8. Documentação dos endpoints de autenticação
9. Tratamento de erros padronizado
10. Configuração de environment variables para produção