# Personal Finance App

Sistema completo de controle financeiro pessoal com interface moderna e API RESTful robusta desenvolvido utilizando IA e o LLM Claude sonnet 4.5 com o apoio de Agentes.

## Visao Geral

Aplicacao web full-stack para gerenciamento de financas pessoais, permitindo controle de transacoes, categorias, orcamentos, metas financeiras e geracao de relatorios analiticos detalhados.

## Stack Tecnologica

### Backend
- **Ruby on Rails 8.0.3** - Framework API
- **PostgreSQL** - Banco de dados relacional
- **RSpec** - Framework de testes (478 testes, 100% passing)
- **Devise + JWT** - Autenticacao e autorizacao
- **Swagger/OpenAPI** - Documentacao da API
- **Prawn** - Geracao de PDFs
- **Caxlsx** - Exportacao para Excel

### Frontend
- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estatica
- **Tailwind CSS** - Framework de estilos
- **React Query** - Gerenciamento de estado e cache
- **Recharts** - Graficos e visualizacoes
- **Axios** - Cliente HTTP

## Funcionalidades

### Gerenciamento Financeiro
- Transacoes (receitas, despesas e transferencias)
- Categorias personalizaveis
- Contas bancarias multiplas
- Orcamentos por categoria e periodo
- Metas financeiras com rastreamento de progresso

### Dashboard Inteligente
- Resumo financeiro mensal
- Evolucao de saldo (ultimos 6 meses)
- Top 5 categorias de despesas
- Status de orcamentos
- Progresso de metas
- Transacoes recentes

### Relatorios e Analytics
- Resumo financeiro
- Performance de orcamentos
- Analise de categorias
- Exportacao em PDF, Excel e CSV
- Graficos e visualizacoes interativas

### Recursos Adicionais
- Filtros avancados de transacoes
- Sugestoes de busca inteligente
- Cache para melhor performance
- Validacao robusta de dados
- Tratamento completo de erros

## Pre-requisitos

- **Ruby** 3.2.0 ou superior
- **Rails** 8.0.3
- **PostgreSQL** 14 ou superior
- **Node.js** 18 ou superior
- **npm** ou **yarn**
- **Bundler** 2.x

## Instalacao

### 1. Clone o Repositorio

```bash
git clone <repository-url>
cd finance-app
```

### 2. Configuracao do Backend

```bash
cd backend

# Instalar dependencias
bundle install

# Configurar banco de dados
cp config/database.yml.example config/database.yml
# Edite config/database.yml com suas credenciais do PostgreSQL

# Criar e popular banco de dados
rails db:create
rails db:migrate
rails db:seed

# Configurar variaveis de ambiente
cp .env.example .env
# Edite .env com suas configuracoes
```

### 3. Configuracao do Frontend

```bash
cd ../frontend

# Instalar dependencias
npm install

# Configurar variaveis de ambiente
cp .env.local.example .env.local
# Edite .env.local com a URL do backend
```

## Configuracao

### Backend (.env)

```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/finance_app_development
DEVISE_JWT_SECRET_KEY=<sua-chave-secreta>
RAILS_ENV=development
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Personal Finance
```

## Executando a Aplicacao

### Iniciar Backend (Porta 3000)

```bash
cd backend
bundle exec rails server -p 3000
```

O backend estara disponivel em: `http://localhost:3000`

### Iniciar Frontend (Porta 3001)

```bash
cd frontend
PORT=3001 npm run dev
```

O frontend estara disponivel em: `http://localhost:3001`

## API Documentation (Swagger)

A documentacao interativa da API esta disponivel em:

```
http://localhost:3000/api-docs
```

### Como Testar a API com Swagger

1. Acesse `http://localhost:3000/api-docs`
2. Faca login usando o endpoint `POST /api/v1/auth/sign_in`
3. Copie o token JWT da resposta
4. Clique no botao "Authorize" no topo da pagina
5. Cole o token no formato: `Bearer <seu-token>`
6. Agora voce pode testar todos os endpoints autenticados

### Exemplo de Login via cURL

```bash
curl -X POST http://localhost:3000/api/v1/auth/sign_in \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Exemplo de Requisicao Autenticada

```bash
curl -X GET http://localhost:3000/api/v1/categories/1 \
  -H "Authorization: Bearer <seu-token>" \
  -H "Content-Type: application/json"
```

## Testes

### Backend (RSpec)

```bash
cd backend

# Executar todos os testes
bundle exec rspec

# Executar com detalhes
bundle exec rspec --format documentation

# Executar arquivo especifico
bundle exec rspec spec/models/transaction_spec.rb

# Executar com cobertura
COVERAGE=true bundle exec rspec
```

### Resultados dos Testes (Outubro 2025)

```
==========================================
   BACKEND TEST RESULTS - ALL PASSING
==========================================

Total Examples: 478
Failures: 0
Success Rate: 100%

Test Execution Time: 5.68 seconds
Coverage: 71.92%

Status: ✓ ALL TESTS PASSING

==========================================
```

Todos os 478 testes estao passando, incluindo:
- Testes de modelos
- Testes de controladores
- Testes de servicos
- Testes de integracao da API
- Testes de autenticacao
- Testes de validacao
- Testes de callbacks
- Testes de scopes
- Testes Swagger/OpenAPI

### Frontend

```bash
cd frontend

# Executar testes
npm test

# Executar com cobertura
npm test -- --coverage
```

## Estrutura do Projeto

```
finance-app/
├── backend/                 # API Rails
│   ├── app/
│   │   ├── controllers/     # Controladores da API
│   │   ├── models/          # Modelos ActiveRecord
│   │   ├── services/        # Logica de negocio
│   │   ├── serializers/     # Serializadores JSON
│   │   └── exporters/       # Exportadores (PDF, Excel, CSV)
│   ├── config/              # Configuracoes
│   ├── db/                  # Migrations e seeds
│   ├── spec/                # Testes RSpec
│   └── swagger/             # Schemas OpenAPI
│
└── frontend/                # App Next.js
    ├── src/
    │   ├── app/             # Rotas e paginas
    │   ├── components/      # Componentes React
    │   ├── hooks/           # Custom hooks
    │   ├── services/        # Servicos API
    │   ├── types/           # Definicoes TypeScript
    │   └── utils/           # Utilitarios
    └── public/              # Arquivos estaticos
```

## Principais Endpoints da API

### Autenticacao
- `POST /api/v1/auth/sign_up` - Registro de usuario
- `POST /api/v1/auth/sign_in` - Login
- `DELETE /api/v1/auth/sign_out` - Logout
- `POST /api/v1/auth/refresh_token` - Renovar token
- `POST /api/v1/auth/reset_password` - Solicitar reset de senha
- `PUT /api/v1/auth/update_password` - Atualizar senha
- `POST /api/v1/auth/confirm_email` - Confirmar email

### Transacoes
- `GET /api/v1/transactions` - Listar transacoes (com filtros e paginacao)
- `POST /api/v1/transactions` - Criar transacao
- `GET /api/v1/transactions/:id` - Detalhes da transacao
- `PUT /api/v1/transactions/:id` - Atualizar transacao
- `DELETE /api/v1/transactions/:id` - Excluir transacao
- `GET /api/v1/transactions/summary` - Resumo de transacoes
- `GET /api/v1/transactions/filter_options` - Opcoes de filtros
- `GET /api/v1/transactions/search_suggestions` - Sugestoes de busca

### Categorias
- `GET /api/v1/categories` - Listar categorias
- `POST /api/v1/categories` - Criar categoria
- `GET /api/v1/categories/:id` - Detalhes da categoria
- `PUT /api/v1/categories/:id` - Atualizar categoria
- `DELETE /api/v1/categories/:id` - Excluir categoria
- `GET /api/v1/categories/:id/transactions` - Transacoes da categoria
- `GET /api/v1/categories/statistics` - Estatisticas de categorias

### Contas
- `GET /api/v1/accounts` - Listar contas
- `POST /api/v1/accounts` - Criar conta
- `GET /api/v1/accounts/:id` - Detalhes da conta
- `PUT /api/v1/accounts/:id` - Atualizar conta
- `DELETE /api/v1/accounts/:id` - Excluir conta

### Orcamentos
- `GET /api/v1/budgets` - Listar orcamentos
- `POST /api/v1/budgets` - Criar orcamento
- `GET /api/v1/budgets/:id` - Detalhes do orcamento
- `PUT /api/v1/budgets/:id` - Atualizar orcamento
- `DELETE /api/v1/budgets/:id` - Excluir orcamento

### Metas
- `GET /api/v1/goals` - Listar metas
- `POST /api/v1/goals` - Criar meta
- `GET /api/v1/goals/:id` - Detalhes da meta
- `PUT /api/v1/goals/:id` - Atualizar meta
- `DELETE /api/v1/goals/:id` - Excluir meta
- `POST /api/v1/goals/:id/contributions` - Adicionar contribuicao

### Dashboard
- `GET /api/v1/dashboard` - Dados do dashboard

### Analytics
- `GET /api/v1/analytics/financial_summary` - Resumo financeiro
- `GET /api/v1/analytics/budget_performance` - Performance de orcamentos
- `GET /api/v1/analytics/export` - Exportar relatorios (PDF, Excel, CSV)
- `GET /api/v1/analytics/reports` - Listar relatorios salvos
- `GET /api/v1/analytics/reports/:id` - Detalhes do relatorio
- `DELETE /api/v1/analytics/reports/:id` - Excluir relatorio

## Capturas de Tela da Aplicacao

### Dashboard
O dashboard apresenta uma visao completa das suas financas com:
- Resumo financeiro mensal (receitas, despesas, saldo)
- Grafico de evolucao de saldo dos ultimos 6 meses
- Top 5 categorias de despesas com grafico de pizza
- Status de orcamentos ativos
- Progresso de metas financeiras
- Lista de transacoes recentes

### Pagina de Transacoes
Interface completa para gerenciar transacoes:
- Lista de todas as transacoes (receitas, despesas, transferencias)
- Filtros por tipo e categoria
- Filtros avancados (data, conta, valor)
- Botao para adicionar nova transacao
- Visualizacao detalhada com categoria e valor
- Opcoes de editar e excluir para cada transacao

### Pagina de Metas
Acompanhe o progresso das suas metas financeiras:
- Cards com resumo de metas (total, ativas, concluidas)
- Percentual de progresso geral
- Filtros por status, tipo e prioridade
- Visualizacao de cada meta com barra de progresso
- Detalhes de valor alvo e data limite
- Status visual (ativa, concluida, etc)

### Swagger API Documentation
Documentacao interativa completa da API:
- Todos os endpoints organizados por categoria
- Schemas de request e response
- Botao "Authorize" para autenticacao
- Teste direto dos endpoints na interface
- Exemplos de requisicoes
- Descriao detalhada de cada endpoint
- Codigos de status HTTP
- Modelos de dados

## Solucao de Problemas

### Backend nao inicia

1. Verifique se o PostgreSQL esta rodando:
```bash
pg_isready
```

2. Verifique as credenciais do banco em `config/database.yml`

3. Recrie o banco de dados:
```bash
rails db:drop db:create db:migrate db:seed
```

### Erro de autenticacao

1. Verifique se a variavel `DEVISE_JWT_SECRET_KEY` esta configurada
2. Certifique-se de que o token esta sendo enviado no header:
```
Authorization: Bearer <token>
```
3. Verifique se o token nao expirou (tokens tem 24h de validade)

### Testes falhando

1. Certifique-se de estar no ambiente de teste:
```bash
RAILS_ENV=test rails db:migrate
```

2. Limpe o banco de teste:
```bash
RAILS_ENV=test rails db:reset
```

3. Execute os testes com seed especifico:
```bash
bundle exec rspec --seed 1234
```

### Frontend nao conecta ao backend

1. Verifique se o backend esta rodando na porta 3000
2. Verifique a variavel `NEXT_PUBLIC_API_URL` em `.env.local`
3. Verifique o CORS no backend (`config/initializers/cors.rb`)
4. Limpe o cache do navegador

### Erro de CORS

Certifique-se de que o CORS esta configurado corretamente em `backend/config/initializers/cors.rb`:

```ruby
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins 'http://localhost:3001'
    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head]
  end
end
```

## Recursos Tecnicos

### Cache
O sistema utiliza cache em memoria para otimizar performance:
- Dashboard (5 minutos)
- Resumo financeiro (1 hora)
- Performance de orcamentos (1 hora)

### Validacoes
- Todas as entradas sao validadas no backend
- Validacao de tipos de dados
- Validacao de ranges de datas
- Prevencao de delecao de dados relacionados
- Validacao de valores monetarios

### Seguranca
- Autenticacao JWT
- Tokens com expiracao (24 horas)
- Refresh tokens para renovacao
- Validacao de propriedade de recursos
- Sanitizacao de inputs
- CORS configurado
- Password encryption com bcrypt
- Prevencao de SQL injection
- Validacao de parametros

### Performance
- Eager loading para evitar N+1 queries
- Indices no banco de dados
- Cache de queries frequentes
- Paginacao de resultados
- Compressao de respostas

## Melhorias Futuras

- [ ] Graficos adicionais de analise
- [ ] Notificacoes de orcamentos excedidos
- [ ] Importacao de extratos bancarios (OFX, CSV)
- [ ] App mobile com React Native
- [ ] Integracao com bancos via API (Open Banking)
- [ ] Previsoes e insights com IA
- [ ] Modo offline com sincronizacao
- [ ] Compartilhamento de orcamentos
- [ ] Categorias automaticas com ML
- [ ] Alertas personalizados
- [ ] Dashboard customizavel
- [ ] Temas personalizados

## Contribuicao

Contribuicoes sao bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudancas (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licenca

Este projeto esta licenciado sob a Licenca MIT - veja o arquivo LICENSE para detalhes.

## Suporte

Para suporte, abra uma issue no GitHub ou entre em contato via email.

## Autores

- Thiago Cardoso

## Agradecimentos

- Comunidade Rails
- Comunidade React/Next.js
- Contribuidores open source
- Claude AI pela assistencia no desenvolvimento

---

**Status do Projeto:** Em desenvolvimento ativo

**Ultima atualizacao:** Outubro 2025

**Versao:** 1.0.0
