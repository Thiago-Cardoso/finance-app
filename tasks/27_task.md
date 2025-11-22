---
status: pending # Opções: pending, in-progress, completed, excluded
parallelizable: false # Se pode executar em paralelo
blocked_by: ["1.0", "2.0", "3.0"] # IDs de tarefas que devem ser completadas primeiro
---

<task_context>
<domain>devops/infrastructure/aws</domain>
<type>implementation</type>
<scope>core_feature</scope>
<complexity>high</complexity>
<dependencies>aws|docker|ecs|fargate|networking</dependencies>
<unblocks>"28.0", "29.0"</unblocks>
</task_context>

# Tarefa 27.0: Configuração AWS ECS Fargate

## Visão Geral

Configurar infraestrutura completa na AWS usando ECS Fargate para hospedar a aplicação Rails API e Next.js frontend em produção. Esta tarefa estabelece a base de infraestrutura para deployment automatizado e operação em produção.

## Requisitos

- Configurar VPC e networking seguro
- Criar clusters ECS com Fargate
- Configurar ALB (Application Load Balancer)
- Configurar ECR (Elastic Container Registry)
- Preparar Task Definitions para backend e frontend
- Configurar SSL/TLS certificates
- Implementar configurações de segurança (Security Groups, IAM)
- Configurar RDS PostgreSQL para produção
- Preparar ambiente de staging e produção

## Subtarefas

- [ ] 27.1 Configurar VPC, subnets e security groups
- [ ] 27.2 Configurar ECR repositories para imagens Docker
- [ ] 27.3 Criar ECS clusters (staging e production)
- [ ] 27.4 Configurar Application Load Balancer (ALB)
- [ ] 27.5 Configurar SSL certificates (ACM)
- [ ] 27.6 Criar Task Definitions para backend Rails API
- [ ] 27.7 Criar Task Definitions para frontend Next.js
- [ ] 27.8 Configurar RDS PostgreSQL para produção
- [ ] 27.9 Configurar IAM roles e policies
- [ ] 27.10 Configurar Service Discovery e health checks
- [ ] 27.11 Testar deploy manual inicial
- [ ] 27.12 Documentar infraestrutura e configurações

## Sequenciamento

- Bloqueado por: 1.0 (Database), 2.0 (Backend), 3.0 (Frontend)
- Desbloqueia: 28.0 (CI/CD Pipelines), 29.0 (Monitoramento)
- Paralelizável: Não (requer aplicações funcionais)

## Detalhes de Implementação

### Arquitetura AWS

1. **VPC Configuration**:
   ```
   VPC: 10.0.0.0/16
   Public Subnets: 10.0.1.0/24, 10.0.2.0/24 (AZ-a, AZ-b)
   Private Subnets: 10.0.3.0/24, 10.0.4.0/24 (AZ-a, AZ-b)
   ```

2. **ECS Fargate Setup**:
   ```yaml
   Cluster: finance-app-cluster
   Services:
     - finance-api-service (Rails)
     - finance-web-service (Next.js)
   ```

### ECR Repositories

```bash
# Criar repositories
aws ecr create-repository --repository-name finance-app/api
aws ecr create-repository --repository-name finance-app/web
```

### Task Definitions

1. **Backend Rails API**:
   ```json
   {
     "family": "finance-api",
     "networkMode": "awsvpc",
     "requiresCompatibilities": ["FARGATE"],
     "cpu": "512",
     "memory": "1024",
     "containerDefinitions": [{
       "name": "api",
       "image": "ECR_URI/finance-app/api:latest",
       "portMappings": [{"containerPort": 3000}],
       "environment": [
         {"name": "RAILS_ENV", "value": "production"},
         {"name": "DATABASE_URL", "value": "RDS_CONNECTION_STRING"}
       ]
     }]
   }
   ```

2. **Frontend Next.js**:
   ```json
   {
     "family": "finance-web",
     "networkMode": "awsvpc",
     "requiresCompatibilities": ["FARGATE"],
     "cpu": "256",
     "memory": "512",
     "containerDefinitions": [{
       "name": "web",
       "image": "ECR_URI/finance-app/web:latest",
       "portMappings": [{"containerPort": 3000}],
       "environment": [
         {"name": "NODE_ENV", "value": "production"},
         {"name": "API_URL", "value": "https://api.finance-app.com"}
       ]
     }]
   }
   ```

### Load Balancer Configuration

1. **Application Load Balancer**:
   - Target Groups para backend (port 3000) e frontend (port 3000)
   - Health checks configurados
   - SSL termination
   - Rules para roteamento (api.* → backend, www.* → frontend)

2. **SSL Certificate**:
   ```bash
   # Request certificate via ACM
   aws acm request-certificate \
     --domain-name finance-app.com \
     --subject-alternative-names api.finance-app.com www.finance-app.com \
     --validation-method DNS
   ```

### Database Configuration

1. **RDS PostgreSQL**:
   ```yaml
   Engine: postgres
   Version: 15.x
   Instance Class: db.t3.micro (inicial)
   Storage: 20GB GP2
   Multi-AZ: Yes (production)
   Backup Retention: 7 days
   ```

2. **Security Groups**:
   - RDS: Allow port 5432 from ECS tasks only
   - ECS: Allow ports 3000 from ALB only
   - ALB: Allow ports 80/443 from internet

### IAM Roles

1. **ECS Task Execution Role**:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [{
       "Effect": "Allow",
       "Action": [
         "ecr:GetAuthorizationToken",
         "ecr:BatchCheckLayerAvailability",
         "ecr:GetDownloadUrlForLayer",
         "ecr:BatchGetImage",
         "logs:CreateLogStream",
         "logs:PutLogEvents"
       ],
       "Resource": "*"
     }]
   }
   ```

2. **ECS Task Role**:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [{
       "Effect": "Allow",
       "Action": [
         "rds-db:connect",
         "ssm:GetParameter",
         "ssm:GetParameters"
       ],
       "Resource": "arn:aws:rds-db:region:account:dbuser:dbname/*"
     }]
   }
   ```

### Service Discovery

1. **Cloud Map Configuration**:
   ```yaml
   Namespace: finance-app.local
   Services:
     - api.finance-app.local
     - web.finance-app.local
   ```

### Health Checks

1. **Backend Health Check**:
   ```ruby
   # config/routes.rb
   get '/health', to: 'health#check'

   # app/controllers/health_controller.rb
   class HealthController < ApplicationController
     def check
       render json: { status: 'ok', timestamp: Time.current }
     end
   end
   ```

2. **Frontend Health Check**:
   ```javascript
   // pages/api/health.js
   export default function handler(req, res) {
     res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
   }
   ```

### Environment Configuration

1. **Production Environment Variables**:
   ```bash
   # Backend
   RAILS_ENV=production
   DATABASE_URL=postgresql://...
   JWT_SECRET_KEY=...
   DEVISE_JWT_SECRET_KEY=...
   SUPABASE_URL=...
   SUPABASE_SERVICE_ROLE_KEY=...

   # Frontend
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://api.finance-app.com
   NEXTAUTH_SECRET=...
   NEXTAUTH_URL=https://www.finance-app.com
   ```

2. **AWS Systems Manager Parameters**:
   ```bash
   # Store sensitive values in Parameter Store
   aws ssm put-parameter \
     --name "/finance-app/production/jwt-secret" \
     --value "your-secret" \
     --type "SecureString"
   ```

## Critérios de Sucesso

- [ ] VPC e networking configurados e funcionais
- [ ] ECR repositories criados e acessíveis
- [ ] ECS clusters rodando com Fargate
- [ ] Application Load Balancer distribuindo tráfego
- [ ] SSL certificates instalados e válidos
- [ ] Task Definitions funcionando corretamente
- [ ] RDS PostgreSQL conectado e operacional
- [ ] IAM roles e policies configuradas apropriadamente
- [ ] Health checks respondendo corretamente
- [ ] Deploy manual inicial bem-sucedido
- [ ] Ambiente de staging operacional
- [ ] Documentação completa da infraestrutura

## Configurações de Produção

### Performance
- Auto Scaling configurado para ECS services
- RDS com conexões otimizadas
- Load Balancer com health checks eficientes
- CDN CloudFront para assets estáticos

### Segurança
- VPC com private subnets para aplicações
- Security Groups com least privilege
- WAF configurado no ALB
- RDS em subnets privadas apenas
- SSL/TLS end-to-end

### Monitoramento
- CloudWatch Logs configurado
- CloudWatch Metrics para todos os recursos
- Alarmes básicos configurados
- AWS X-Ray para tracing (preparação)

### Backup e Recovery
- RDS automated backups
- Point-in-time recovery habilitado
- Cross-region backup para disaster recovery

## Recursos Necessários

- Conta AWS com permissions adequadas
- Domínio registrado para SSL certificates
- Aplicações containerizadas (Docker)
- Conhecimento de AWS networking e ECS

## Custos Estimados (Mensais)

- ECS Fargate: ~$50-100
- RDS PostgreSQL: ~$30-50
- ALB: ~$20
- ECR: ~$5
- **Total estimado**: $105-175/mês

## Tempo Estimado

- Configuração VPC e networking: 4-6 horas
- Setup ECS e Fargate: 6-8 horas
- Configuração ALB e SSL: 2-4 horas
- RDS setup: 2-3 horas
- Task Definitions e deployment: 4-6 horas
- Testes e documentação: 2-4 horas
- **Total**: 3-4 dias de trabalho