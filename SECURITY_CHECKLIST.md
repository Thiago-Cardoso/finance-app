# 🔐 Security Checklist - Deployment

Checklist de segurança para produção.

## ✅ Backend (Rails API)

### Secrets e Credenciais
- [ ] `SECRET_KEY_BASE` gerado com `rails secret` (128 caracteres)
- [ ] `JWT_SECRET_KEY` gerado com `rails secret` (128 caracteres)
- [ ] Secrets armazenados como variáveis de ambiente (não no código)
- [ ] `.env` e `.env.local` no `.gitignore`
- [ ] Nenhuma credencial hard-coded no código

### Database
- [ ] `DATABASE_URL` configurada via variável de ambiente
- [ ] Database acessível apenas pela aplicação (não exposta publicamente)
- [ ] Backups automáticos configurados (ou agendados manualmente)
- [ ] SSL/TLS habilitado para conexões com database

### CORS
- [ ] CORS configurado com origins específicos (não `*`)
- [ ] `credentials: true` apenas se necessário
- [ ] Origins de produção configurados via `FRONTEND_URL`
- [ ] Origins de desenvolvimento removidos em produção

### Headers de Segurança
- [ ] `Rack::Attack` configurado para rate limiting
- [ ] `SecureHeaders` configurado
- [ ] Content Security Policy (CSP) definida
- [ ] X-Frame-Options configurado
- [ ] X-Content-Type-Options configurado

### Authentication/Authorization
- [ ] JWT tokens com expiração curta (15-30 min)
- [ ] Refresh tokens implementados
- [ ] Passwords com bcrypt (mínimo 12 caracteres)
- [ ] Password reset seguro implementado
- [ ] Account lockout após tentativas falhas

### API
- [ ] Rate limiting configurado
- [ ] Input validation em todos os endpoints
- [ ] SQL injection prevenido (usar ActiveRecord properly)
- [ ] XSS prevenido (sanitizar inputs)
- [ ] CSRF protection habilitado
- [ ] Mass assignment protection (strong parameters)

### Logging
- [ ] Logs não contêm informações sensíveis
- [ ] Passwords e tokens filtrados dos logs
- [ ] Logging adequado para auditoria
- [ ] Erros logados mas não expostos ao cliente

## ✅ Frontend (Next.js)

### Variáveis de Ambiente
- [ ] Secrets do backend não expostos no frontend
- [ ] `NEXT_PUBLIC_*` usado apenas para valores públicos
- [ ] API keys privadas não no código do cliente
- [ ] `.env.local` no `.gitignore`

### Headers de Segurança
- [ ] Content Security Policy (CSP) configurada
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] Referrer-Policy configurada
- [ ] Permissions-Policy configurada

### API Calls
- [ ] HTTPS usado em produção
- [ ] Timeout configurado para requests
- [ ] Error handling adequado
- [ ] Tokens armazenados de forma segura (httpOnly cookies)
- [ ] Nenhuma API key exposta no client-side

### Dependencies
- [ ] `npm audit` executado e vulnerabilidades corrigidas
- [ ] Dependencies atualizadas regularmente
- [ ] Nenhuma dependency não utilizada
- [ ] Lock files commitados

### Build
- [ ] Source maps desabilitados em produção
- [ ] Debug code removido
- [ ] Console logs removidos/minimizados
- [ ] Minification habilitada

## ✅ CI/CD (GitHub Actions)

### Secrets Management
- [ ] GitHub Secrets usado para credenciais sensíveis
- [ ] Secrets não logados ou expostos
- [ ] Secrets rotacionados periodicamente
- [ ] Acesso aos secrets restrito

### Pipeline
- [ ] Tests rodando antes do deploy
- [ ] Security audit (bundler-audit, npm audit) no CI
- [ ] Linting configurado
- [ ] Type checking para TypeScript
- [ ] Deploy automático apenas da branch master/main

## ✅ Infrastructure

### Render (Backend)
- [ ] SSL/TLS habilitado (automático)
- [ ] Health check configurado
- [ ] Auto-deploy desabilitado (ou apenas para branch específica)
- [ ] Environment variables configuradas corretamente
- [ ] Logs monitorados

### Vercel (Frontend)
- [ ] SSL/TLS habilitado (automático)
- [ ] Preview deployments com environment variables corretas
- [ ] Production environment protegido
- [ ] Custom domain com SSL

### Database (PostgreSQL)
- [ ] Database em região apropriada
- [ ] Backups configurados
- [ ] Connection pooling configurado
- [ ] Acesso restrito à VPC interna

## ✅ Monitoring e Alerting

### Logs
- [ ] Logs centralizados
- [ ] Logs de erro alertando automaticamente
- [ ] Logs retidos por período adequado
- [ ] Logs não contêm PII (Personally Identifiable Information)

### Monitoring
- [ ] Health checks configurados
- [ ] Uptime monitoring ativo
- [ ] Error tracking (Sentry, Rollbar, etc)
- [ ] Performance monitoring

### Alerting
- [ ] Alertas para downtime
- [ ] Alertas para erros críticos
- [ ] Alertas para performance degradada
- [ ] Alertas para tentativas de ataque

## ✅ Compliance

### GDPR/Privacy
- [ ] Privacy policy presente
- [ ] Consent para cookies
- [ ] Data retention policy definida
- [ ] Right to deletion implementado
- [ ] Data export capability

### Data Protection
- [ ] Dados sensíveis encriptados em repouso
- [ ] Dados sensíveis encriptados em trânsito
- [ ] PII adequadamente protegida
- [ ] Minimal data collection

## 🔄 Manutenção Regular

### Mensal
- [ ] Revisar logs de segurança
- [ ] Verificar vulnerabilidades de dependencies
- [ ] Atualizar dependencies críticas
- [ ] Revisar acessos e permissões

### Trimestral
- [ ] Audit de segurança completo
- [ ] Revisar e atualizar secrets
- [ ] Testar disaster recovery
- [ ] Revisar políticas de acesso

### Anual
- [ ] Penetration testing
- [ ] Security training para equipe
- [ ] Revisar compliance
- [ ] Atualizar documentação de segurança

## 🚨 Incident Response

### Preparação
- [ ] Plano de resposta a incidentes documentado
- [ ] Contatos de emergência definidos
- [ ] Backup e recovery procedures testados
- [ ] Runbook para cenários comuns

### Detection
- [ ] Alertas configurados
- [ ] Log monitoring ativo
- [ ] Anomaly detection

### Response
- [ ] Procedimento de escalation definido
- [ ] Communication plan
- [ ] Rollback procedures testados

## 📚 Recursos

### Ferramentas
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Rails Security Guide](https://guides.rubyonrails.org/security.html)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
- [Snyk](https://snyk.io/) - Vulnerability scanning
- [bundler-audit](https://github.com/rubysec/bundler-audit)

### Best Practices
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [CIS Controls](https://www.cisecurity.org/controls/)
- [SANS Top 25](https://www.sans.org/top25-software-errors/)

---

**⚠️ IMPORTANTE**: Esta é uma checklist base. Adapte para suas necessidades específicas e requisitos regulatórios.
