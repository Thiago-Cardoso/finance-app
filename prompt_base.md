Quero criar uma aplicação web Aplicativo de Controle Financeiro Pessoal com arquitetura moderna, separando backend e frontend:
utilize para a arquitetura base o @architectural.md que esta no root do projeto
Backend:
* Framework: Ruby on Rails 8, somente como API.
* Banco de dados: PostgreSQL hospedado no Supabase.
* Configuração: gerar modelos iniciais, controllers versionados (/api/v1), autenticação via JWT.
* Testes: RSpec com TDD.
* Deploy: Docker + possibilidade de deploy em AWS ECS Fargate.
Frontend:
* Framework: Next.js 15 (App Router).
* Estilo: TailwindCSS separado em componentes para fácil manutenção.
* Integração: consumo da API do backend com autenticação JWT.
* UI: componentes prontos para CRUD e dashboard.
Banco de Dados:
* Criar instância PostgreSQL no Supabase.
* Usar MCP do Supabase para gerenciar migrações e conexão.
* Configurar .env no Rails e no Next.js para usar as credenciais do Supabase.
Arquitetura:
* Backend e frontend em repositórios separados.
* Comunicação via REST (pode evoluir para GraphQL no futuro).
* Ambiente de desenvolvimento com Docker Compose (API, frontend e banco).

Objetivo:Gerar toda a configuração inicial para o desenvolvimento colaborativo.