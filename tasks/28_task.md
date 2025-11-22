---
status: pending # Opções: pending, in-progress, completed, excluded
parallelizable: false # Se pode executar em paralelo
blocked_by: ["27.0"] # IDs de tarefas que devem ser completadas primeiro
---

<task_context>
<domain>devops/cicd/automation</domain>
<type>implementation</type>
<scope>core_feature</scope>
<complexity>high</complexity>
<dependencies>github_actions|aws|docker|testing</dependencies>
<unblocks>"29.0", "30.0"</unblocks>
</task_context>

# Tarefa 28.0: Setup CI/CD Pipelines

## Visão Geral

Implementar pipelines completos de CI/CD usando GitHub Actions para automatizar testes, build, deploy e rollback das aplicações Rails API e Next.js frontend para AWS ECS Fargate. Esta tarefa estabelece automação completa do processo de desenvolvimento até produção.

## Requisitos

- Configurar GitHub Actions workflows para backend e frontend
- Implementar pipeline de testes automatizados
- Configurar build e push de imagens Docker para ECR
- Automatizar deploy para staging e produção
- Implementar rollback automático em caso de falhas
- Configurar notificações de status
- Implementar deployment com zero downtime
- Configurar approval gates para produção
- Integrar com ferramentas de qualidade de código

## Subtarefas

- [ ] 28.1 Configurar GitHub Actions para backend (Rails API)
- [ ] 28.2 Configurar GitHub Actions para frontend (Next.js)
- [ ] 28.3 Implementar pipeline de testes automatizados
- [ ] 28.4 Configurar build e push de imagens Docker
- [ ] 28.5 Automatizar deploy para staging
- [ ] 28.6 Configurar approval workflow para produção
- [ ] 28.7 Implementar deploy para produção
- [ ] 28.8 Configurar rollback automático
- [ ] 28.9 Implementar notificações (Slack/Discord)
- [ ] 28.10 Configurar environment variables e secrets
- [ ] 28.11 Testar pipelines completos
- [ ] 28.12 Documentar workflows e procedimentos

## Sequenciamento

- Bloqueado por: 27.0 (Configuração AWS ECS Fargate)
- Desbloqueia: 29.0 (Monitoramento), 30.0 (Launch MVP)
- Paralelizável: Não (requer infraestrutura AWS configurada)

## Detalhes de Implementação

### GitHub Actions Workflows

1. **Backend Rails API Pipeline** (.github/workflows/backend-ci-cd.yml):
   ```yaml
   name: Backend CI/CD

   on:
     push:
       branches: [main, develop]
       paths: ['backend/**']
     pull_request:
       branches: [main]
       paths: ['backend/**']

   jobs:
     test:
       runs-on: ubuntu-latest
       services:
         postgres:
           image: postgres:15
           env:
             POSTGRES_PASSWORD: postgres
           options: >-
             --health-cmd pg_isready
             --health-interval 10s
             --health-timeout 5s
             --health-retries 5

       steps:
         - uses: actions/checkout@v4

         - name: Set up Ruby
           uses: ruby/setup-ruby@v1
           with:
             ruby-version: 3.3
             bundler-cache: true

         - name: Set up database
           run: |
             cd backend
             bundle exec rails db:create
             bundle exec rails db:migrate
           env:
             DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

         - name: Run tests
           run: |
             cd backend
             bundle exec rspec
             bundle exec rubocop
           env:
             DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

     build:
       needs: test
       runs-on: ubuntu-latest
       if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'

       steps:
         - uses: actions/checkout@v4

         - name: Configure AWS credentials
           uses: aws-actions/configure-aws-credentials@v4
           with:
             aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
             aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
             aws-region: us-east-1

         - name: Login to Amazon ECR
           id: login-ecr
           uses: aws-actions/amazon-ecr-login@v2

         - name: Build, tag, and push image
           env:
             ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
             ECR_REPOSITORY: finance-app/api
             IMAGE_TAG: ${{ github.sha }}
           run: |
             docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG ./backend
             docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
             docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
             docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest

     deploy-staging:
       needs: build
       runs-on: ubuntu-latest
       if: github.ref == 'refs/heads/develop'
       environment: staging

       steps:
         - name: Deploy to staging
           run: |
             aws ecs update-service \
               --cluster finance-app-staging-cluster \
               --service finance-api-staging-service \
               --force-new-deployment

     deploy-production:
       needs: build
       runs-on: ubuntu-latest
       if: github.ref == 'refs/heads/main'
       environment: production

       steps:
         - name: Deploy to production
           run: |
             aws ecs update-service \
               --cluster finance-app-cluster \
               --service finance-api-service \
               --force-new-deployment

         - name: Wait for deployment
           run: |
             aws ecs wait services-stable \
               --cluster finance-app-cluster \
               --services finance-api-service

         - name: Health check
           run: |
             curl -f https://api.finance-app.com/health || exit 1
   ```

2. **Frontend Next.js Pipeline** (.github/workflows/frontend-ci-cd.yml):
   ```yaml
   name: Frontend CI/CD

   on:
     push:
       branches: [main, develop]
       paths: ['frontend/**']
     pull_request:
       branches: [main]
       paths: ['frontend/**']

   jobs:
     test:
       runs-on: ubuntu-latest

       steps:
         - uses: actions/checkout@v4

         - name: Set up Node.js
           uses: actions/setup-node@v4
           with:
             node-version: '18'
             cache: 'npm'
             cache-dependency-path: frontend/package-lock.json

         - name: Install dependencies
           run: |
             cd frontend
             npm ci

         - name: Run linter
           run: |
             cd frontend
             npm run lint

         - name: Run tests
           run: |
             cd frontend
             npm run test:ci

         - name: Build application
           run: |
             cd frontend
             npm run build
           env:
             NEXT_PUBLIC_API_URL: https://api-staging.finance-app.com

     build:
       needs: test
       runs-on: ubuntu-latest
       if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'

       steps:
         - uses: actions/checkout@v4

         - name: Configure AWS credentials
           uses: aws-actions/configure-aws-credentials@v4
           with:
             aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
             aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
             aws-region: us-east-1

         - name: Login to Amazon ECR
           id: login-ecr
           uses: aws-actions/amazon-ecr-login@v2

         - name: Build, tag, and push image
           env:
             ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
             ECR_REPOSITORY: finance-app/web
             IMAGE_TAG: ${{ github.sha }}
           run: |
             docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG ./frontend
             docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
             docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
             docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest

     deploy-staging:
       needs: build
       runs-on: ubuntu-latest
       if: github.ref == 'refs/heads/develop'
       environment: staging

       steps:
         - name: Deploy to staging
           run: |
             aws ecs update-service \
               --cluster finance-app-staging-cluster \
               --service finance-web-staging-service \
               --force-new-deployment

     deploy-production:
       needs: build
       runs-on: ubuntu-latest
       if: github.ref == 'refs/heads/main'
       environment: production

       steps:
         - name: Deploy to production
           run: |
             aws ecs update-service \
               --cluster finance-app-cluster \
               --service finance-web-service \
               --force-new-deployment
   ```

### Docker Configuration

1. **Backend Dockerfile** (backend/Dockerfile):
   ```dockerfile
   FROM ruby:3.3-alpine

   RUN apk add --no-cache \
     build-base \
     postgresql-dev \
     tzdata \
     nodejs \
     npm

   WORKDIR /app

   COPY Gemfile Gemfile.lock ./
   RUN bundle config --global frozen 1 && \
       bundle install

   COPY . .

   RUN bundle exec rails assets:precompile

   EXPOSE 3000

   CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0"]
   ```

2. **Frontend Dockerfile** (frontend/Dockerfile):
   ```dockerfile
   FROM node:18-alpine AS builder

   WORKDIR /app
   COPY package*.json ./
   RUN npm ci

   COPY . .
   RUN npm run build

   FROM node:18-alpine AS runner

   WORKDIR /app

   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs

   COPY --from=builder /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

   USER nextjs

   EXPOSE 3000

   ENV PORT 3000

   CMD ["node", "server.js"]
   ```

### Environment Configuration

1. **GitHub Secrets**:
   ```bash
   AWS_ACCESS_KEY_ID
   AWS_SECRET_ACCESS_KEY
   AWS_REGION
   ECR_REGISTRY
   SLACK_WEBHOOK_URL
   DISCORD_WEBHOOK_URL
   ```

2. **Environment Variables per Branch**:
   ```yaml
   # Staging
   NEXT_PUBLIC_API_URL: https://api-staging.finance-app.com
   DATABASE_URL: [staging-rds-url]

   # Production
   NEXT_PUBLIC_API_URL: https://api.finance-app.com
   DATABASE_URL: [production-rds-url]
   ```

### Rollback Strategy

1. **Automatic Rollback Workflow** (.github/workflows/rollback.yml):
   ```yaml
   name: Automatic Rollback

   on:
     workflow_dispatch:
       inputs:
         environment:
           description: 'Environment to rollback'
           required: true
           default: 'production'
         service:
           description: 'Service to rollback (api/web)'
           required: true

   jobs:
     rollback:
       runs-on: ubuntu-latest
       environment: ${{ github.event.inputs.environment }}

       steps:
         - name: Configure AWS credentials
           uses: aws-actions/configure-aws-credentials@v4
           with:
             aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
             aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
             aws-region: us-east-1

         - name: Get previous task definition
           run: |
             aws ecs describe-services \
               --cluster finance-app-cluster \
               --services finance-${{ github.event.inputs.service }}-service \
               --query 'services[0].deployments[1].taskDefinition' \
               --output text > previous_task_def.txt

         - name: Rollback service
           run: |
             aws ecs update-service \
               --cluster finance-app-cluster \
               --service finance-${{ github.event.inputs.service }}-service \
               --task-definition $(cat previous_task_def.txt)
   ```

### Quality Gates

1. **Code Quality Checks**:
   ```yaml
   - name: Run code quality checks
     run: |
       # Backend
       cd backend
       bundle exec rubocop
       bundle exec brakeman --no-pager
       bundle exec rails_best_practices .

       # Frontend
       cd frontend
       npm run lint
       npm run type-check
       npm audit --audit-level moderate
   ```

2. **Security Scans**:
   ```yaml
   - name: Run security scans
     run: |
       # Dependency scanning
       npm audit
       bundle audit check --update

       # Container scanning
       docker scout cves $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
   ```

### Notifications

1. **Slack Integration**:
   ```yaml
   - name: Notify Slack
     uses: 8398a7/action-slack@v3
     with:
       status: ${{ job.status }}
       text: |
         Deployment ${{ job.status }} for ${{ github.repository }}
         Branch: ${{ github.ref }}
         Commit: ${{ github.sha }}
     env:
       SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
     if: always()
   ```

### Monitoring Integration

1. **Deployment Tracking**:
   ```yaml
   - name: Track deployment
     run: |
       curl -X POST "https://api.datadog.com/api/v1/events" \
         -H "Content-Type: application/json" \
         -H "DD-API-KEY: ${{ secrets.DATADOG_API_KEY }}" \
         -d '{
           "title": "Deployment Complete",
           "text": "Finance App deployed to production",
           "tags": ["environment:production", "service:finance-app"]
         }'
   ```

## Critérios de Sucesso

- [ ] GitHub Actions workflows configurados e funcionando
- [ ] Testes automatizados executando em todos os PRs
- [ ] Build e push de imagens Docker automatizados
- [ ] Deploy para staging automático no branch develop
- [ ] Deploy para produção com approval gate no branch main
- [ ] Rollback automático funcionando
- [ ] Health checks validando deployments
- [ ] Notificações de status configuradas
- [ ] Zero downtime deployments funcionando
- [ ] Quality gates impedindo deploys com problemas
- [ ] Security scans integrados ao pipeline
- [ ] Documentação completa dos workflows

## Configurações de Segurança

### Secrets Management
- Todas as credenciais armazenadas em GitHub Secrets
- Rotação automática de AWS credentials
- Principle of least privilege para IAM roles

### Branch Protection
- Require PR reviews before merging
- Require status checks to pass
- Dismiss stale reviews when new commits are pushed
- Require branches to be up to date before merging

### Environment Protection
- Required reviewers for production deployments
- Wait timer before deployment
- Prevent self-review

## Performance Optimization

### Build Optimization
- Docker layer caching
- Dependency caching
- Parallel job execution
- Matrix builds for multiple environments

### Deployment Strategy
- Blue-green deployments para zero downtime
- Canary deployments para releases críticos
- Circuit breaker pattern para rollbacks automáticos

## Recursos Necessários

- Conta GitHub com GitHub Actions habilitado
- AWS credentials com permissions adequadas
- Slack/Discord webhook para notificações
- Infraestrutura AWS ECS configurada (Tarefa 27.0)

## Tempo Estimado

- Configuração workflows básicos: 6-8 horas
- Implementação pipelines completos: 8-10 horas
- Configuração rollback e monitoring: 4-6 horas
- Testes e documentação: 4-6 horas
- **Total**: 3-4 dias de trabalho