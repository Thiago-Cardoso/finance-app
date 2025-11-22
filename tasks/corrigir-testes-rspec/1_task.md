---
status: pending
parallelizable: true
blocked_by: []
---

<task_context>
<domain>testing/investigation</domain>
<type>testing</type>
<scope>test_suite_analysis</scope>
<complexity>medium</complexity>
<dependencies>rspec|factory_bot</dependencies>
<unblocks>"3.0"</unblocks>
</task_context>

# Tarefa 1.0: Investigar e Documentar Todos os 77 Testes Falhando em Detalhes

## Visão Geral
Executar uma investigação completa e sistemática de todos os 77 testes falhando, capturando logs detalhados, stacktraces, expectativas vs realidade, e criando uma documentação estruturada que servirá de guia para as correções.

## Contexto
Esta tarefa é fundamental pois fornecerá a informação necessária para todas as correções subsequentes. Uma investigação completa inicial economiza tempo ao evitar retrabalho e permite identificar padrões que podem indicar problemas sistêmicos.

## Requisitos
- [ ] RSpec configurado e funcionando
- [ ] Ambiente de teste limpo (database test limpo)
- [ ] Acesso ao log de testes detalhado
- [ ] Capacidade de executar testes individuais

## Subtarefas

### 1.1 Executar Suite Completa e Capturar Baseline
- Rodar `bundle exec rspec --format json --out tmp/rspec_baseline.json`
- Rodar `bundle exec rspec --format documentation --out tmp/rspec_baseline.txt`
- Capturar contagem exata: total, passing, failing
- Documentar seed usado e ambiente

### 1.2 Categorizar Todos os Testes Falhando
- Agrupar por tipo de erro (autenticação, validação, cálculo, etc)
- Agrupar por arquivo/contexto
- Identificar padrões comuns
- Criar matriz: Arquivo → Teste → Erro → Categoria

### 1.3 Executar Testes de Autenticação Individualmente
- Para cada teste de swagger spec que falha:
  - Executar com `--format documentation`
  - Capturar expected vs actual
  - Capturar stacktrace completo
  - Anotar linha exata do erro
- Documentar em: `tmp/investigation/auth_failures.md`

### 1.4 Executar Testes de DashboardService Individualmente
- Para cada teste falhando em dashboard_service_spec.rb:
  - Executar isoladamente
  - Capturar valores esperados vs atuais
  - Verificar setup do teste (factories, dados)
  - Verificar implementação atual do service
- Documentar em: `tmp/investigation/dashboard_failures.md`

### 1.5 Executar Testes de TransactionFilterService Individualmente
- Para cada teste falhando:
  - Executar isoladamente
  - Verificar se método existe
  - Capturar expected vs actual
  - Verificar implementation vs spec
- Documentar em: `tmp/investigation/transaction_filter_failures.md`

### 1.6 Executar Testes de CategoryStatisticsService Individualmente
- Para cada teste falhando:
  - Executar isoladamente
  - Capturar cálculos esperados vs atuais
  - Verificar queries e lógica
  - Documentar fórmulas/cálculos
- Documentar em: `tmp/investigation/category_stats_failures.md`

### 1.7 Criar Resumo Consolidado
- Consolidar todas as descobertas
- Criar lista priorizada de correções
- Identificar quick wins vs complex fixes
- Documentar em: `tmp/investigation/INVESTIGATION_SUMMARY.md`

## Sequenciamento
- **Bloqueado por:** Nenhuma (pode começar imediatamente)
- **Desbloqueia:** 3.0 (Autenticação), 4.0-8.0 (Services)
- **Paralelizável:** Sim - pode rodar em paralelo com 2.0 (Análise de Padrões)

## Detalhes de Implementação

### Arquivos a Criar
```
tmp/investigation/
├── auth_failures.md
├── dashboard_failures.md
├── transaction_filter_failures.md
├── category_stats_failures.md
├── INVESTIGATION_SUMMARY.md
tmp/rspec_baseline.json
tmp/rspec_baseline.txt
```

### Template de Documentação por Teste

```markdown
### Teste: [Descrição do Teste]
**Arquivo:** spec/path/to/spec.rb:123
**Categoria:** [auth|service|model|etc]
**Prioridade:** [alta|média|baixa]

**Comando:**
```bash
bundle exec rspec spec/path/to/spec.rb:123
```

**Expected:**
- Status: 401
- Response: { "error": "Unauthorized" }

**Actual:**
- Status: 500
- Response: { "error": "Internal Server Error" }

**Stacktrace:**
```
[stacktrace aqui]
```

**Causa Provável:**
[hipótese sobre a causa]

**Correção Sugerida:**
[sugestão de como corrigir]

**Impacto:**
[quantos testes similares existem]
```

### Comandos Úteis

```bash
# Executar teste específico com detalhes
bundle exec rspec spec/path/to/spec.rb:123 --format documentation --backtrace

# Executar grupo de testes
bundle exec rspec spec/requests/api/v1/swagger/ --format documentation

# Executar com seed específico
bundle exec rspec --seed 12345

# Executar apenas failures
bundle exec rspec --only-failures

# Gerar relatório JSON
bundle exec rspec --format json --out tmp/results.json

# Gerar relatório HTML
bundle exec rspec --format html --out tmp/results.html
```

### Script de Automação

Criar script helper para automatizar coleta:

```ruby
# tmp/scripts/investigate_failures.rb
require 'json'

# Rodar suite e capturar resultados
system("bundle exec rspec --format json --out tmp/rspec_results.json")

# Parsear resultados
results = JSON.parse(File.read('tmp/rspec_results.json'))
failures = results['examples'].select { |e| e['status'] == 'failed' }

# Agrupar por arquivo
by_file = failures.group_by { |f| f['file_path'] }

# Para cada arquivo, rodar testes individualmente
by_file.each do |file, tests|
  tests.each do |test|
    line = test['line_number']
    puts "Investigating: #{file}:#{line}"

    # Rodar teste individual
    output = `bundle exec rspec #{file}:#{line} --format documentation 2>&1`

    # Salvar output
    File.write("tmp/investigation/#{File.basename(file, '.rb')}_#{line}.txt", output)
  end
end

puts "Investigation complete. Results in tmp/investigation/"
```

## Critérios de Sucesso
- [ ] Todos os 77 testes falhando identificados e documentados
- [ ] Stacktraces completos capturados para cada teste
- [ ] Expectativas vs realidade documentadas para cada teste
- [ ] Causa provável identificada para cada categoria de erro
- [ ] Resumo consolidado criado com priorização
- [ ] Quick wins identificados (correções fáceis/rápidas)
- [ ] Pasta tmp/investigation/ criada com todos os documentos

## Notas de Teste

### Categorias Conhecidas
1. **Autenticação (~60 testes)**
   - Status esperado: 401
   - Status atual: 500
   - Arquivos: swagger/*_spec.rb

2. **DashboardService (6 testes)**
   - dashboard_service_spec.rb:87 (total_balance)
   - dashboard_service_spec.rb:208 (budget_status - budgets ativos)
   - dashboard_service_spec.rb:223 (budget_status - cálculo spent)
   - dashboard_service_spec.rb:242 (budget_status - status)
   - Outros relacionados a goals_progress

3. **TransactionFilterService (3 testes)**
   - transaction_filter_service_spec.rb:286 (search_suggestions)
   - transaction_filter_service_spec.rb:254 (filter_options - categories)
   - transaction_filter_service_spec.rb:262 (filter_options - accounts)

4. **CategoryStatisticsService (8 testes)**
   - Estatísticas e trends
   - Prevent deletion

### Dicas de Investigação

1. **Para testes de autenticação:**
   - Adicionar `binding.pry` em Authenticable#authenticate_user!
   - Verificar ordem de rescue_from
   - Verificar se JwtService::TokenInvalidError está sendo lançado

2. **Para testes de services:**
   - Verificar factory setup
   - Verificar data de criação dos objetos
   - Verificar scopes e queries SQL (usar `.to_sql`)
   - Comparar implementação vs expectativa do teste

3. **Para testes de cálculo:**
   - Imprimir valores intermediários
   - Verificar tipos (BigDecimal vs Float vs Integer)
   - Verificar formatação de datas e períodos

## Referências
- [PRD] tasks/corrigir-testes-rspec/prd.md
- [Tech Spec] tasks/corrigir-testes-rspec/techspec.md
- [Correções Anteriores] RSPEC_FIXES_SUMMARY.md
- [RSpec Documentation] https://rspec.info/
- [FactoryBot Documentation] https://github.com/thoughtbot/factory_bot
