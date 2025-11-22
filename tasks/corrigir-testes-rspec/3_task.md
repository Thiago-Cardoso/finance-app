---
status: pending
parallelizable: false
blocked_by: ["1.0", "2.0"]
---

<task_context>
<domain>backend/authentication</domain>
<type>implementation</type>
<scope>error_handling</scope>
<complexity>high</complexity>
<dependencies>jwt|controllers|rescue_from</dependencies>
<unblocks>"4.0,5.0,6.0,7.0,8.0,9.0"</unblocks>
</task_context>

# Tarefa 3.0: Corrigir Tratamento de Exceções de Autenticação nos Controllers

## Visão Geral
Corrigir o tratamento de exceções de autenticação para que controllers retornem status 401 (Unauthorized) ao invés de 500 (Internal Server Error) quando há problemas de autenticação. Esta é a tarefa mais crítica, pois resolve ~60 testes (78% dos problemas).

## Contexto
Atualmente, quando um usuário não está autenticado ou fornece um token inválido, os controllers estão retornando status 500 ao invés de 401. Isso indica que as exceções `JwtService::TokenInvalidError` e `JwtService::TokenExpiredError` não estão sendo capturadas pelos handlers específicos, sendo capturadas pelo handler genérico `StandardError`.

## Requisitos
- [ ] Entendimento do fluxo de autenticação JWT
- [ ] Conhecimento de ordem de processamento de rescue_from no Rails
- [ ] Capacidade de testar com diferentes cenários de autenticação
- [ ] Acesso aos controllers e concerns

## Subtarefas

### 3.1 Diagnosticar Problema Específico
- Adicionar logs em Authenticable#authenticate_user!
- Adicionar logs em JwtService.decode
- Executar teste de autenticação com logs
- Identificar exatamente onde exceção é capturada incorretamente
- Documentar stacktrace completo

### 3.2 Verificar e Corrigir JwtService
- Verificar se TokenInvalidError e TokenExpiredError são lançadas corretamente
- Testar decode com token inválido
- Testar decode com token expirado
- Testar decode sem token
- Garantir que exceções corretas são lançadas
- Adicionar testes unitários se necessário

### 3.3 Corrigir Ordem de rescue_from em BaseController
- Verificar ordem atual de rescue_from
- Reorganizar para colocar exceções específicas antes de StandardError
- Garantir que JwtService exceptions vêm antes de StandardError
- Testar mudança isoladamente
- Documentar ordem correta

### 3.4 Revisar Authenticable Concern
- Verificar se authenticate_user! lança exceções corretas
- Considerar adicionar tratamento explícito
- Testar diferentes cenários:
  - Token ausente
  - Token malformado
  - Token expirado
  - Token válido mas usuário não existe
  - Token válido mas jti não match
- Adicionar testes para concern

### 3.5 Validar com Testes de Swagger (Batch 1: Dashboard)
- Executar spec/requests/api/v1/swagger/dashboard_spec.rb
- Verificar testes de 401
- Corrigir problemas específicos se houver
- Validar mensagens de erro
- Documentar resultados

### 3.6 Validar com Testes de Swagger (Batch 2: Categories)
- Executar spec/requests/api/v1/swagger/categories_spec.rb
- Verificar todos os testes de autenticação
- Validar diferentes endpoints
- Documentar resultados

### 3.7 Validar com Testes de Swagger (Batch 3: Accounts, Analytics, Transactions, Auth)
- Executar todos os outros swagger specs
- Validar autenticação em todos os endpoints
- Verificar consistência de mensagens de erro
- Documentar quaisquer casos especiais

### 3.8 Criar Testes de Integração para Autenticação
- Criar teste explícito para cada cenário de erro de auth
- Validar status codes
- Validar formato de resposta
- Adicionar em spec/requests/api/v1/authentication_spec.rb

## Sequenciamento
- **Bloqueado por:** 1.0 (Investigação) ou 2.0 (Análise)
- **Desbloqueia:** 4.0-8.0 (todas as correções de services), 9.0 (validação)
- **Paralelizável:** Não - é crítico e deve ser feito isoladamente

## Detalhes de Implementação

### Arquivos a Modificar

```
app/controllers/api/v1/base_controller.rb
app/controllers/concerns/authenticable.rb
app/services/jwt_service.rb (verificação)
spec/requests/api/v1/authentication_spec.rb (novo)
```

### Mudança 1: Corrigir Ordem de rescue_from

**Antes (Api::V1::BaseController):**
```ruby
rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
rescue_from ActiveRecord::RecordInvalid, with: :render_validation_errors
rescue_from JwtService::TokenExpiredError, with: :render_token_expired
rescue_from JwtService::TokenInvalidError, with: :render_unauthorized
rescue_from StandardError, with: :render_internal_server_error
```

**Problema:** A ordem pode não estar sendo respeitada, ou StandardError pode estar capturando antes.

**Depois:**
```ruby
# Exceções de autenticação (mais específicas - primeiro)
rescue_from JwtService::TokenExpiredError, with: :render_token_expired
rescue_from JwtService::TokenInvalidError, with: :render_unauthorized

# Exceções de ActiveRecord
rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
rescue_from ActiveRecord::RecordInvalid, with: :render_validation_errors

# Exceção genérica (deve ser a última)
rescue_from StandardError, with: :render_internal_server_error
```

**OU** se o problema persistir, capturar no próprio concern:

### Mudança 2: Tratamento Explícito no Authenticable (se necessário)

**Antes:**
```ruby
def authenticate_user!
  token = extract_token_from_header
  raise JwtService::TokenInvalidError, 'Token not provided' unless token

  payload = JwtService.decode(token)
  @current_user = User.find_by(id: payload[:user_id], jti: payload[:jti])

  raise JwtService::TokenInvalidError, 'User not found' unless @current_user
end
```

**Depois (opção alternativa se rescue_from não funcionar):**
```ruby
def authenticate_user!
  token = extract_token_from_header

  unless token
    return render_error(
      'Authentication required',
      [{ field: 'authorization', message: 'Token not provided' }],
      :unauthorized
    )
  end

  begin
    payload = JwtService.decode(token)
    @current_user = User.find_by(id: payload[:user_id], jti: payload[:jti])

    unless @current_user
      return render_error(
        'Authentication failed',
        [{ field: 'authorization', message: 'Invalid user' }],
        :unauthorized
      )
    end
  rescue JwtService::TokenExpiredError => e
    render_error(
      'Token expired',
      [{ field: 'authorization', message: e.message }],
      :unauthorized
    )
  rescue JwtService::TokenInvalidError => e
    render_error(
      'Invalid token',
      [{ field: 'authorization', message: e.message }],
      :unauthorized
    )
  end
end
```

**Decisão:** Tentar Mudança 1 primeiro. Se não resolver, implementar Mudança 2.

### Mudança 3: Adicionar Logs para Debug

```ruby
# Temporariamente em authenticable.rb
def authenticate_user!
  Rails.logger.debug "[AUTH] Starting authentication"
  token = extract_token_from_header
  Rails.logger.debug "[AUTH] Token extracted: #{token.present?}"

  raise JwtService::TokenInvalidError, 'Token not provided' unless token

  begin
    Rails.logger.debug "[AUTH] Decoding token"
    payload = JwtService.decode(token)
    Rails.logger.debug "[AUTH] Token decoded successfully: user_id=#{payload[:user_id]}"

    @current_user = User.find_by(id: payload[:user_id], jti: payload[:jti])
    Rails.logger.debug "[AUTH] User found: #{@current_user.present?}"

    raise JwtService::TokenInvalidError, 'User not found' unless @current_user
    Rails.logger.debug "[AUTH] Authentication successful"
  rescue JwtService::TokenExpiredError => e
    Rails.logger.debug "[AUTH] Token expired: #{e.message}"
    raise
  rescue JwtService::TokenInvalidError => e
    Rails.logger.debug "[AUTH] Token invalid: #{e.message}"
    raise
  rescue StandardError => e
    Rails.logger.error "[AUTH] Unexpected error: #{e.class.name} - #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
    raise
  end
end
```

**Nota:** Remover logs após diagnóstico.

### Mudança 4: Criar Teste de Integração

```ruby
# spec/requests/api/v1/authentication_spec.rb
require 'swagger_helper'

RSpec.describe 'Authentication', type: :request do
  let(:user) { create(:user) }
  let(:valid_token) { JwtService.generate_tokens(user)[:access_token] }

  describe 'Authentication behavior' do
    context 'with no token' do
      it 'returns 401' do
        get '/api/v1/dashboard'

        expect(response).to have_http_status(:unauthorized)
        expect(json_response[:success]).to be false
        expect(json_response[:message]).to match(/unauthorized|authentication/i)
      end
    end

    context 'with invalid token' do
      it 'returns 401' do
        get '/api/v1/dashboard', headers: { 'Authorization' => 'Bearer invalid_token' }

        expect(response).to have_http_status(:unauthorized)
        expect(json_response[:success]).to be false
      end
    end

    context 'with malformed token' do
      it 'returns 401' do
        get '/api/v1/dashboard', headers: { 'Authorization' => 'InvalidFormat' }

        expect(response).to have_http_status(:unauthorized)
        expect(json_response[:success]).to be false
      end
    end

    context 'with expired token' do
      it 'returns 401' do
        # Criar token expirado
        expired_token = JWT.encode(
          { user_id: user.id, jti: user.jti, exp: 1.hour.ago.to_i },
          Rails.application.credentials.secret_key_base,
          'HS256'
        )

        get '/api/v1/dashboard', headers: { 'Authorization' => "Bearer #{expired_token}" }

        expect(response).to have_http_status(:unauthorized)
        expect(json_response[:message]).to match(/expired/i)
      end
    end

    context 'with valid token but non-existent user' do
      it 'returns 401' do
        fake_token = JWT.encode(
          { user_id: 999999, jti: 'fake_jti', exp: 1.hour.from_now.to_i },
          Rails.application.credentials.secret_key_base,
          'HS256'
        )

        get '/api/v1/dashboard', headers: { 'Authorization' => "Bearer #{fake_token}" }

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with valid token and jti mismatch' do
      it 'returns 401' do
        wrong_jti_token = JWT.encode(
          { user_id: user.id, jti: 'wrong_jti', exp: 1.hour.from_now.to_i },
          Rails.application.credentials.secret_key_base,
          'HS256'
        )

        get '/api/v1/dashboard', headers: { 'Authorization' => "Bearer #{wrong_jti_token}" }

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with valid token' do
      it 'returns 200' do
        get '/api/v1/dashboard', headers: { 'Authorization' => "Bearer #{valid_token}" }

        expect(response).to have_http_status(:ok)
      end
    end
  end

  private

  def json_response
    JSON.parse(response.body, symbolize_names: true)
  end
end
```

### Comandos de Teste

```bash
# Testar autenticação específica
bundle exec rspec spec/requests/api/v1/authentication_spec.rb

# Testar swagger dashboard (401 tests)
bundle exec rspec spec/requests/api/v1/swagger/dashboard_spec.rb -e "não autorizado"

# Testar todos os swagger specs de autenticação
bundle exec rspec spec/requests/api/v1/swagger/ -e "401"

# Com logs de debug
LOG_LEVEL=debug bundle exec rspec spec/requests/api/v1/swagger/dashboard_spec.rb -e "não autorizado"

# Verificar todos os testes de autenticação
bundle exec rspec spec/requests/api/v1/swagger/ --format documentation | grep -A 5 "401"
```

## Critérios de Sucesso
- [ ] Todos os testes de autenticação em swagger specs passando (~60 testes)
- [ ] Status 401 retornado para token ausente
- [ ] Status 401 retornado para token inválido
- [ ] Status 401 retornado para token expirado
- [ ] Status 401 retornado para usuário não encontrado
- [ ] Mensagens de erro claras e consistentes
- [ ] Testes de integração criados e passando
- [ ] Nenhum teste anteriormente passando quebrou
- [ ] Logs de debug removidos (se adicionados)
- [ ] Código revisado e limpo

## Notas de Teste

### Cenários a Validar

1. **Token Ausente:**
   - Header Authorization não enviado
   - Deve retornar 401 com mensagem apropriada

2. **Token Malformado:**
   - Authorization sem "Bearer " prefix
   - Authorization com formato inválido
   - Deve retornar 401

3. **Token Inválido:**
   - Token com assinatura incorreta
   - Token com payload corrompido
   - Deve retornar 401

4. **Token Expirado:**
   - Token válido mas com exp no passado
   - Deve retornar 401 com mensagem de "expired"

5. **Usuário Não Existe:**
   - Token válido mas user_id não existe no DB
   - Deve retornar 401

6. **JTI Mismatch:**
   - Token válido mas jti diferente do user.jti
   - Indica token revogado
   - Deve retornar 401

### Formato de Resposta Esperado

```json
{
  "success": false,
  "message": "Unauthorized",
  "errors": [
    {
      "field": "authorization",
      "message": "Invalid or missing token"
    }
  ]
}
```

### Debug Tips

1. **Se teste ainda falha com 500:**
   - Verificar logs Rails completos
   - Adicionar binding.pry em authenticate_user!
   - Verificar se exceção está sendo lançada
   - Verificar stacktrace completo

2. **Se exceção não é capturada:**
   - Verificar namespace da exceção (JwtService::TokenInvalidError)
   - Verificar se módulo JwtService está carregado
   - Tentar rescue_from com string: rescue_from 'JwtService::TokenInvalidError'

3. **Se ordem de rescue_from não funciona:**
   - Implementar tratamento explícito no concern
   - Chamar render_error diretamente

## Referências
- [PRD] tasks/corrigir-testes-rspec/prd.md
- [Tech Spec] tasks/corrigir-testes-rspec/techspec.md
- [Rails Guide: rescue_from] https://api.rubyonrails.org/classes/ActiveSupport/Rescuable/ClassMethods.html
- [JWT Authentication] https://jwt.io/introduction
