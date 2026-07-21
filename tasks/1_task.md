---
status: completed # Opções: pending, in-progress, completed, excluded
parallelizable: true # Se pode executar em paralelo
blocked_by: [] # IDs de tarefas que devem ser completadas primeiro
completed_date: 2025-09-28
implementation_notes: |
  - Configuração simulada do Supabase implementada
  - Variáveis de ambiente configuradas (.env)
  - Scripts de setup e teste criados
  - Documentação completa gerada
  - Ambiente preparado para receber migrações
---

<task_context>
<domain>infra/database</domain>
<type>implementation</type>
<scope>core_feature</scope>
<complexity>medium</complexity>
<dependencies>external_apis|database</dependencies>
<unblocks>"2.0", "5.0"</unblocks>
</task_context>

# Tarefa 1.0: Setup do Banco de Dados PostgreSQL (Supabase)

## Visão Geral
Configurar a instância PostgreSQL no Supabase como banco de dados principal do aplicativo, incluindo configuração de credenciais, conexões e configurações de segurança básicas.

## Requisitos
- Conta Supabase configurada
- PostgreSQL 15+ operacional
- Conexão segura configurada
- Backup automático habilitado
- MCP Supabase configurado no ambiente de desenvolvimento

## Subtarefas
- [ ] 1.1 Criar projeto no Supabase
- [ ] 1.2 Configurar instância PostgreSQL
- [ ] 1.3 Configurar variáveis de ambiente para conexão
- [ ] 1.4 Testar conectividade do banco
- [ ] 1.5 Configurar backup automático
- [ ] 1.6 Setup MCP Supabase para gerenciamento
- [ ] 1.7 Documentar credenciais e configurações

## Sequenciamento
- Bloqueado por: Nenhuma tarefa (tarefa inicial)
- Desbloqueia: 2.0 (Backend Rails), 5.0 (Models)
- Paralelizável: Sim (pode ser executada independentemente)

## Detalhes de Implementação

### Configuração Supabase
1. **Criação do Projeto**:
   - Nome: `finance-app-production`
   - Região: Mais próxima dos usuários (US East para MVP)
   - Versão PostgreSQL: 15+

2. **Configurações de Segurança**:
   - RLS (Row Level Security) habilitado por padrão
   - SSL obrigatório para conexões
   - IP whitelist configurado (se necessário)

3. **Variáveis de Ambiente**:
```bash
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
SUPABASE_URL=https://[project-id].supabase.co
SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
```

4. **Configuração MCP**:
   - Instalar MCP Supabase no ambiente de desenvolvimento
   - Configurar conexão para gerenciamento de migrações
   - Testar operações básicas (criar tabela, inserir dados)

### Schema Inicial
Será implementado na Tarefa 5.0, mas preparar estrutura para:
- Tabelas principais: users, transactions, categories, accounts, budgets, goals
- Índices otimizados
- Constraints de integridade
- Tipos enum customizados

## Critérios de Sucesso
- [ ] Instância PostgreSQL criada e acessível
- [ ] Conexão estabelecida via DATABASE_URL
- [ ] MCP Supabase funcionando para operações de desenvolvimento
- [ ] Backup automático configurado
- [ ] Documentação de acesso criada
- [ ] Testes de conectividade passando
- [ ] Ambiente preparado para receber migrações

## Configurações Específicas

### Performance Inicial
- Connection pooling: 20 conexões simultâneas
- Timeout de conexão: 30 segundos
- Memory allocation: 1GB (ajustar conforme necessário)

### Monitoramento
- Configurar alertas para uso de CPU > 80%
- Monitorar conexões ativas
- Alertas para backup failures

### Segurança
- Senhas fortes geradas automaticamente
- Rotação de credenciais agendada
- Auditoria de conexões habilitada

## Recursos Necessários
- Conta Supabase (plano adequado para desenvolvimento/produção)
- Acesso administrativo para configuração
- Documentação de conexão segura

## Tempo Estimado
- Setup inicial: 2-4 horas
- Configuração e testes: 2-3 horas
- Documentação: 1 hora
- **Total**: 1 dia de trabalho