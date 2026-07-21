---
status: completed # Opções: pending, in-progress, completed, excluded
parallelizable: true # Se pode executar em paralelo
blocked_by: ["2.0"] # IDs de tarefas que devem ser completadas primeiro
completed_date: 2025-09-29
implementation_notes: |
  - Devise instalado e configurado para modo API
  - JWT module criado com encode/decode/validation
  - CORS configurado para frontend (localhost e produção)
  - Rack::Attack configurado com rate limiting
  - Variáveis de ambiente JWT criadas com chaves seguras
  - Middleware stack configurado (CORS, Rack::Attack, SecureHeaders)
  - Testes básicos de JWT encode/decode executados com sucesso
  - Documentação completa criada em JWT_AUTH_SETUP.md
---

<task_context>
<domain>backend/authentication/configuration</domain>
<type>configuration</type>
<scope>core_feature</scope>
<complexity>medium</complexity>
<dependencies>rails|jwt|devise</dependencies>
<unblocks>"6.0"</unblocks>
</task_context>

# Tarefa 4.0: Configuração de Autenticação JWT

## Visão Geral

Configurar as dependências e estruturas básicas necessárias para implementação de autenticação JWT no Rails 8 API. Esta tarefa prepara o ambiente para que a Tarefa 6.0 possa implementar o sistema de autenticação completo.

## Requisitos

- Configurar gems necessárias (Devise, JWT, rack-cors)
- Configurar Devise para modo API
- Configurar CORS para frontend
- Preparar estrutura de JWT tokens
- Configurar middleware básico
- Definir variáveis de ambiente necessárias
- Configurar rate limiting básico

## Subtarefas

- [x] 4.1 Adicionar gems de autenticação ao Gemfile ✅
- [x] 4.2 Executar bundle install e generators do Devise ✅
- [x] 4.3 Configurar Devise para modo API ✅
- [x] 4.4 Configurar CORS para permitir requisições do frontend ✅
- [x] 4.5 Configurar variáveis de ambiente JWT (secret keys) ✅
- [x] 4.6 Configurar middleware básico para CORS e JSON responses ✅
- [x] 4.7 Configurar rate limiting básico ✅
- [x] 4.8 Configurar estructura para JWT token generation ✅
- [x] 4.9 Testar configurações básicas ✅
- [x] 4.10 Documentar configurações realizadas ✅

## Sequenciamento

- Bloqueado por: 2.0 (Configuração Backend Rails 8 API)
- Desbloqueia: 6.0 (Desenvolvimento da API de Autenticação)
- Paralelizável: Sim (após conclusão do task 2.0)

## Detalhes de Implementação

### Gems Necessárias

```ruby
# Gemfile additions
gem 'devise', '~> 4.9'
gem 'devise-jwt', '~> 0.11.0'
gem 'rack-cors', '~> 2.0'
gem 'rack-attack', '~> 6.7'
```

### Configuração Devise

1. **Instalação e Configuração**:
   - `rails generate devise:install`
   - Configurar para modo API
   - Configurar JWT como strategy padrão

2. **Configuração CORS**:
   ```ruby
   # config/initializers/cors.rb
   Rails.application.config.middleware.insert_before 0, Rack::Cors do
     allow do
       origins ENV.fetch("FRONTEND_URL", "http://localhost:3000")
       resource "*",
         headers: :any,
         methods: [:get, :post, :put, :patch, :delete, :options, :head],
         credentials: true
     end
   end
   ```

3. **Variáveis de Ambiente**:
   ```bash
   JWT_SECRET_KEY=your_super_secret_jwt_key_here
   DEVISE_JWT_SECRET_KEY=your_devise_jwt_secret_here
   FRONTEND_URL=http://localhost:3000
   ```

### Configuração JWT

1. **JWT Token Configuration**:
   - Secret key configuration
   - Token expiration settings
   - Refresh token strategy preparation
   - Token blacklist strategy

2. **Middleware Configuration**:
   ```ruby
   # config/application.rb
   config.api_only = true
   config.session_store :disabled
   ```

### Rate Limiting

1. **Rack Attack Configuration**:
   ```ruby
   # config/initializers/rack_attack.rb
   class Rack::Attack
     # Throttle auth endpoints
     throttle('auth/ip', limit: 5, period: 1.minute) do |req|
       req.ip if req.path.match(/^\/auth/)
     end
   end
   ```

## Critérios de Sucesso

- [x] Gems de autenticação instaladas e configuradas ✅
- [x] Devise configurado para modo API ✅
- [x] CORS configurado para permitir requisições do frontend ✅
- [x] JWT secrets configurados nas variáveis de ambiente ✅
- [x] Rate limiting básico funcionando ✅
- [x] Middleware essencial configurado ✅
- [x] Aplicação Rails carrega sem erros ✅
- [x] Preparação concluída para implementação da API de auth ✅
- [x] Documentação de configuração criada ✅
- [x] Testes básicos de configuração passando ✅

## Configurações Específicas

### Performance
- Session storage desabilitado (API only)
- Middleware desnecessário removido
- JSON response como padrão

### Segurança
- CORS restrito ao domínio do frontend
- Rate limiting configurado
- JWT secrets seguros
- Headers de segurança configurados

### Desenvolvimento
- Configuração flexível para desenvolvimento local
- Logs de autenticação habilitados
- Debug mode para JWT em desenvolvimento

## Recursos Necessários
- Ruby on Rails 8 configurado (Tarefa 2.0)
- Acesso para instalar gems
- Configuração de variáveis de ambiente

## Tempo Estimado
- Configuração de gems: 1-2 horas
- Configuração Devise: 2-3 horas
- Configuração CORS e middleware: 1-2 horas
- Testes e documentação: 1-2 horas
- **Total**: 1 dia de trabalho