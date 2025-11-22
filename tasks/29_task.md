---
status: pending # Opções: pending, in-progress, completed, excluded
parallelizable: false # Se pode executar em paralelo
blocked_by: ["27.0", "28.0"] # IDs de tarefas que devem ser completadas primeiro
---

<task_context>
<domain>devops/monitoring/observability</domain>
<type>implementation</type>
<scope>core_feature</scope>
<complexity>high</complexity>
<dependencies>cloudwatch|datadog|grafana|logging</dependencies>
<unblocks>"30.0"</unblocks>
</task_context>

# Tarefa 29.0: Monitoramento e Logs

## Visão Geral

Implementar sistema completo de monitoramento, logging e observabilidade para a aplicação em produção usando AWS CloudWatch, Datadog e ferramentas complementares. Esta tarefa estabelece visibilidade completa sobre performance, erros, métricas de negócio e saúde da aplicação.

## Requisitos

- Configurar logging estruturado para aplicações Rails e Next.js
- Implementar métricas de aplicação e infraestrutura
- Configurar alertas para eventos críticos
- Criar dashboards de monitoramento
- Implementar distributed tracing
- Configurar health checks avançados
- Monitorar métricas de negócio (transações, usuários, performance)
- Implementar log aggregation e análise
- Configurar monitoring de segurança
- Preparar ferramentas para debugging em produção

## Subtarefas

- [ ] 29.1 Configurar logging estruturado (Rails + Next.js)
- [ ] 29.2 Implementar AWS CloudWatch Logs e Metrics
- [ ] 29.3 Configurar Datadog APM e Infrastructure Monitoring
- [ ] 29.4 Criar dashboards de monitoramento
- [ ] 29.5 Implementar distributed tracing (AWS X-Ray)
- [ ] 29.6 Configurar alertas críticos
- [ ] 29.7 Monitorar métricas de negócio
- [ ] 29.8 Configurar monitoring de segurança
- [ ] 29.9 Implementar synthetic monitoring
- [ ] 29.10 Configurar log analysis e search
- [ ] 29.11 Testar alertas e recovery procedures
- [ ] 29.12 Documentar runbooks e procedimentos

## Sequenciamento

- Bloqueado por: 27.0 (Infraestrutura AWS), 28.0 (CI/CD)
- Desbloqueia: 30.0 (Launch MVP)
- Paralelizável: Não (requer aplicação deployada)

## Detalhes de Implementação

### Logging Estruturado

1. **Backend Rails Logging**:
   ```ruby
   # config/application.rb
   config.log_formatter = ::Logger::Formatter.new
   config.log_tags = [:request_id, :remote_ip]

   # Gemfile
   gem 'lograge'
   gem 'amazing_print'
   gem 'rails_semantic_logger'

   # config/initializers/logging.rb
   Rails.application.configure do
     config.lograge.enabled = true
     config.lograge.formatter = Lograge::Formatters::Json.new

     config.lograge.custom_payload do |controller|
       {
         user_id: controller.current_user&.id,
         request_id: controller.request.uuid,
         ip: controller.request.remote_ip,
         user_agent: controller.request.user_agent
       }
     end
   end
   ```

2. **Frontend Next.js Logging**:
   ```javascript
   // lib/logger.js
   import pino from 'pino';

   const logger = pino({
     level: process.env.LOG_LEVEL || 'info',
     transport: process.env.NODE_ENV === 'development'
       ? { target: 'pino-pretty' }
       : undefined,
     formatters: {
       level: (label) => {
         return { level: label };
       },
       log: (obj) => {
         const { req, res, ...rest } = obj;
         return {
           ...rest,
           req: req ? {
             method: req.method,
             url: req.url,
             headers: req.headers,
           } : undefined,
           res: res ? {
             statusCode: res.statusCode,
             headers: res.headers,
           } : undefined,
         };
       }
     }
   });

   export default logger;
   ```

3. **Custom Middleware para Request/Response Logging**:
   ```javascript
   // middleware/logging.js
   import logger from '../lib/logger';
   import { v4 as uuidv4 } from 'uuid';

   export function withLogging(handler) {
     return async (req, res) => {
       const requestId = uuidv4();
       const startTime = Date.now();

       req.requestId = requestId;
       logger.info({
         requestId,
         method: req.method,
         url: req.url,
         userAgent: req.headers['user-agent'],
         ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
       }, 'Request started');

       try {
         await handler(req, res);

         logger.info({
           requestId,
           statusCode: res.statusCode,
           duration: Date.now() - startTime
         }, 'Request completed');
       } catch (error) {
         logger.error({
           requestId,
           error: error.message,
           stack: error.stack,
           duration: Date.now() - startTime
         }, 'Request failed');
         throw error;
       }
     };
   }
   ```

### AWS CloudWatch Configuration

1. **CloudWatch Logs Groups**:
   ```bash
   # Create log groups
   aws logs create-log-group --log-group-name /finance-app/api/application
   aws logs create-log-group --log-group-name /finance-app/web/application
   aws logs create-log-group --log-group-name /finance-app/nginx/access
   aws logs create-log-group --log-group-name /finance-app/nginx/error
   ```

2. **ECS Task Definition com CloudWatch**:
   ```json
   {
     "logConfiguration": {
       "logDriver": "awslogs",
       "options": {
         "awslogs-group": "/finance-app/api/application",
         "awslogs-region": "us-east-1",
         "awslogs-stream-prefix": "ecs"
       }
     }
   }
   ```

3. **Custom Metrics**:
   ```ruby
   # app/services/metrics_service.rb
   class MetricsService
     def self.record_transaction_created(amount, category)
       CloudWatch.put_metric_data({
         namespace: 'FinanceApp/Business',
         metric_data: [{
           metric_name: 'TransactionsCreated',
           dimensions: [
             { name: 'Category', value: category }
           ],
           value: 1,
           unit: 'Count',
           timestamp: Time.current
         }, {
           metric_name: 'TransactionAmount',
           dimensions: [
             { name: 'Category', value: category }
           ],
           value: amount.to_f,
           unit: 'None',
           timestamp: Time.current
         }]
       })
     end

     def self.record_user_login(user_id)
       CloudWatch.put_metric_data({
         namespace: 'FinanceApp/Users',
         metric_data: [{
           metric_name: 'UserLogins',
           value: 1,
           unit: 'Count',
           timestamp: Time.current
         }]
       })
     end
   end
   ```

### Datadog Integration

1. **Datadog Agent Configuration**:
   ```yaml
   # datadog-agent.yaml
   apiVersion: apps/v1
   kind: DaemonSet
   metadata:
     name: datadog-agent
   spec:
     selector:
       matchLabels:
         app: datadog-agent
     template:
       metadata:
         labels:
           app: datadog-agent
       spec:
         containers:
         - name: datadog-agent
           image: datadog/agent:latest
           env:
           - name: DD_API_KEY
             value: "YOUR_DATADOG_API_KEY"
           - name: DD_SITE
             value: "datadoghq.com"
           - name: DD_LOGS_ENABLED
             value: "true"
           - name: DD_LOGS_CONFIG_CONTAINER_COLLECT_ALL
             value: "true"
           - name: DD_APM_ENABLED
             value: "true"
   ```

2. **Ruby APM Configuration**:
   ```ruby
   # Gemfile
   gem 'ddtrace', '~> 1.0'

   # config/initializers/datadog.rb
   require 'datadog/tracing'
   require 'datadog/profiling'

   Datadog.configure do |c|
     c.service = 'finance-api'
     c.env = Rails.env
     c.version = ENV['APP_VERSION'] || '1.0.0'

     # APM & Tracing
     c.tracing.instrument :rails
     c.tracing.instrument :postgres
     c.tracing.instrument :redis
     c.tracing.instrument :http

     # Profiling
     c.profiling.enabled = true
   end
   ```

3. **JavaScript APM Configuration**:
   ```javascript
   // lib/datadog.js
   import { datadogRum } from '@datadog/browser-rum';

   datadogRum.init({
     applicationId: process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID,
     clientToken: process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN,
     site: 'datadoghq.com',
     service: 'finance-web',
     env: process.env.NODE_ENV,
     version: process.env.NEXT_PUBLIC_APP_VERSION,
     sessionSampleRate: 100,
     trackResources: true,
     trackLongTasks: true,
     trackUserInteractions: true,
   });

   export default datadogRum;
   ```

### Distributed Tracing com AWS X-Ray

1. **X-Ray Configuration**:
   ```ruby
   # Gemfile
   gem 'aws-xray-sdk', '~> 0.16.0'

   # config/initializers/xray.rb
   require 'aws-xray-sdk/facets/rails/railtie'

   XRay.recorder.configure(
     context_missing: :log_error,
     plugins: [:ec2, :ecs],
     name: 'finance-api'
   )
   ```

2. **ECS Task Definition com X-Ray**:
   ```json
   {
     "containerDefinitions": [
       {
         "name": "xray-daemon",
         "image": "amazon/aws-xray-daemon:latest",
         "portMappings": [{
           "containerPort": 2000,
           "protocol": "udp"
         }],
         "command": ["-o"]
       }
     ]
   }
   ```

### Alerting Configuration

1. **CloudWatch Alarms**:
   ```yaml
   # cloudformation/alarms.yml
   HighErrorRate:
     Type: AWS::CloudWatch::Alarm
     Properties:
       AlarmName: FinanceApp-HighErrorRate
       AlarmDescription: High error rate detected
       MetricName: 4XXError
       Namespace: AWS/ApplicationELB
       Statistic: Sum
       Period: 300
       EvaluationPeriods: 2
       Threshold: 10
       ComparisonOperator: GreaterThanThreshold
       AlarmActions:
         - !Ref SNSTopicAlarms

   HighResponseTime:
     Type: AWS::CloudWatch::Alarm
     Properties:
       AlarmName: FinanceApp-HighResponseTime
       MetricName: TargetResponseTime
       Namespace: AWS/ApplicationELB
       Statistic: Average
       Period: 300
       EvaluationPeriods: 3
       Threshold: 2
       ComparisonOperator: GreaterThanThreshold
   ```

2. **Datadog Monitors**:
   ```yaml
   # monitoring/datadog-monitors.yml
   api_error_rate:
     type: query alert
     query: "sum(last_5m):sum:rails.request.status{service:finance-api,status:error}.as_count() > 10"
     message: "High error rate detected on Finance API"
     tags:
       - service:finance-api
       - priority:high

   response_time:
     type: query alert
     query: "avg(last_10m):avg:rails.request.duration{service:finance-api} > 2"
     message: "High response time detected"
     tags:
       - service:finance-api
       - priority:medium
   ```

### Business Metrics Dashboard

1. **Custom Dashboards**:
   ```javascript
   // components/admin/MetricsDashboard.js
   import { useState, useEffect } from 'react';
   import { getBusinessMetrics } from '../lib/api/metrics';

   export default function MetricsDashboard() {
     const [metrics, setMetrics] = useState({});

     useEffect(() => {
       const fetchMetrics = async () => {
         const data = await getBusinessMetrics();
         setMetrics(data);
       };

       fetchMetrics();
       const interval = setInterval(fetchMetrics, 30000);
       return () => clearInterval(interval);
     }, []);

     return (
       <div className="metrics-dashboard">
         <div className="metric-card">
           <h3>Daily Active Users</h3>
           <span className="metric-value">{metrics.daily_active_users}</span>
         </div>
         <div className="metric-card">
           <h3>Transactions Today</h3>
           <span className="metric-value">{metrics.transactions_today}</span>
         </div>
         <div className="metric-card">
           <h3>Average Response Time</h3>
           <span className="metric-value">{metrics.avg_response_time}ms</span>
         </div>
       </div>
     );
   }
   ```

### Health Checks Avançados

1. **Detailed Health Check Endpoint**:
   ```ruby
   # app/controllers/health_controller.rb
   class HealthController < ApplicationController
     def check
       health_status = {
         status: 'ok',
         timestamp: Time.current,
         version: ENV['APP_VERSION'],
         checks: {
           database: database_check,
           redis: redis_check,
           external_apis: external_apis_check
         }
       }

       if health_status[:checks].values.all? { |check| check[:status] == 'ok' }
         render json: health_status, status: :ok
       else
         render json: health_status, status: :service_unavailable
       end
     end

     private

     def database_check
       ActiveRecord::Base.connection.execute('SELECT 1')
       { status: 'ok', response_time: measure_time { User.count } }
     rescue => e
       { status: 'error', error: e.message }
     end

     def redis_check
       Redis.current.ping
       { status: 'ok' }
     rescue => e
       { status: 'error', error: e.message }
     end

     def external_apis_check
       # Test Supabase connection
       response_time = measure_time { Supabase.client.ping }
       { status: 'ok', response_time: response_time }
     rescue => e
       { status: 'error', error: e.message }
     end

     def measure_time
       start_time = Time.current
       yield
       ((Time.current - start_time) * 1000).round(2)
     end
   end
   ```

### Synthetic Monitoring

1. **Datadog Synthetics**:
   ```yaml
   # monitoring/synthetic-tests.yml
   api_health_check:
     type: api
     config:
       request:
         url: https://api.finance-app.com/health
         method: GET
       assertions:
         - type: statusCode
           operator: is
           target: 200
         - type: responseTime
           operator: lessThan
           target: 1000
       locations: [us-east-1, us-west-2]
       frequency: 60

   user_login_flow:
     type: browser
     config:
       request:
         url: https://www.finance-app.com
       steps:
         - click: '[data-testid="login-button"]'
         - type: '[data-testid="email-input"]' text: test@example.com
         - type: '[data-testid="password-input"]' text: password
         - click: '[data-testid="submit-login"]'
         - assertElementContent: '[data-testid="dashboard"]' text: Dashboard
   ```

### Log Analysis e Search

1. **ElasticSearch Integration**:
   ```yaml
   # docker-compose.yml (for development)
   elasticsearch:
     image: elasticsearch:8.8.0
     environment:
       - discovery.type=single-node
       - xpack.security.enabled=false
     ports:
       - "9200:9200"

   kibana:
     image: kibana:8.8.0
     environment:
       - ELASTICSEARCH_URL=http://elasticsearch:9200
     ports:
       - "5601:5601"
     depends_on:
       - elasticsearch
   ```

## Critérios de Sucesso

- [ ] Logging estruturado implementado em todas as aplicações
- [ ] Métricas de infraestrutura coletadas no CloudWatch
- [ ] Datadog APM coletando traces e métricas de aplicação
- [ ] Dashboards de monitoramento funcionais e informativos
- [ ] Alertas configurados para eventos críticos
- [ ] Distributed tracing funcionando end-to-end
- [ ] Health checks detalhados respondendo corretamente
- [ ] Synthetic monitoring validando funcionalidades críticas
- [ ] Métricas de negócio sendo coletadas e visualizadas
- [ ] Log analysis e search operacional
- [ ] Runbooks documentados para incidents
- [ ] Recovery procedures testados e documentados

## Performance Monitoring

### Key Metrics
- **Response Time**: P50, P95, P99
- **Throughput**: Requests per second
- **Error Rate**: 4xx, 5xx responses
- **Resource Utilization**: CPU, Memory, Network

### Business Metrics
- **User Engagement**: DAU, MAU, session duration
- **Transaction Metrics**: Volume, amount, categories
- **Conversion Rates**: Sign-up, feature adoption
- **Financial KPIs**: Revenue, costs, ROI

## Security Monitoring

### Security Events
- Failed login attempts
- Unusual API access patterns
- Data export/import activities
- Admin actions
- Permission changes

### Compliance Monitoring
- Data access logs
- User consent tracking
- GDPR compliance metrics
- Financial data handling

## Recursos Necessários

- AWS CloudWatch (incluído com ECS)
- Datadog subscription (~$15-30/host/month)
- ElasticSearch cluster (opcional)
- Slack/PagerDuty para alertas
- SSL certificates para synthetic monitoring

## Custos Estimados (Mensais)

- AWS CloudWatch: $20-50
- Datadog Pro: $45-90 (3 hosts)
- X-Ray traces: $5-15
- **Total estimado**: $70-155/mês

## Tempo Estimado

- Configuração logging estruturado: 6-8 horas
- Setup CloudWatch e Datadog: 8-10 horas
- Configuração dashboards e alertas: 6-8 horas
- Implementação health checks: 4-6 horas
- Synthetic monitoring: 2-4 horas
- Testes e documentação: 4-6 horas
- **Total**: 4-5 dias de trabalho