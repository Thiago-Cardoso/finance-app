---
status: pending
parallelizable: true
blocked_by: []
---

<task_context>
<domain>testing/analysis</domain>
<type>documentation</type>
<scope>pattern_analysis</scope>
<complexity>medium</complexity>
<dependencies>rspec</dependencies>
<unblocks>"3.0"</unblocks>
</task_context>

# Tarefa 2.0: Executar Análise de Padrões e Preparar Ambiente de Teste

## Visão Geral
Analisar padrões comuns nos testes falhando, identificar problemas sistêmicos, e preparar o ambiente de teste para garantir execuções consistentes e confiáveis durante o processo de correção.

## Contexto
Além de investigar testes individuais (Tarefa 1.0), é importante entender padrões sistêmicos que podem indicar problemas arquiteturais ou de configuração. Esta análise pode revelar que um único fix pode resolver múltiplos testes de uma vez.

## Requisitos
- [ ] Acesso aos arquivos de configuração de teste
- [ ] Entendimento da arquitetura do projeto
- [ ] Capacidade de rodar testes múltiplas vezes
- [ ] Ferramentas de análise de código (rubocop, reek, etc)

## Subtarefas

### 2.1 Analisar Padrões de Exceções
- Identificar exceções mais comuns nos testes falhando
- Mapear onde são lançadas vs onde deveriam ser capturadas
- Verificar hierarquia de exceções customizadas
- Documentar ordem de rescue_from em todos os controllers
- Criar diagrama de fluxo de exceções

### 2.2 Analisar Padrões de Factories
- Verificar consistência de todas as factories
- Identificar atributos obsoletos ou renomeados
- Verificar uso de Faker e possíveis problemas
- Validar traits e sequências
- Documentar padrões de bypass de validação (update_column)

### 2.3 Analisar Padrões de Helpers de Teste
- Revisar spec/support/ para helpers disponíveis
- Verificar uso consistente de auth_helpers
- Identificar helpers faltantes ou incompletos
- Documentar padrões de setup de teste

### 2.4 Analisar Dependências entre Testes
- Identificar shared_examples e shared_contexts
- Verificar se há state leaking entre testes
- Identificar testes que dependem de ordem específica
- Validar uso de let vs let! vs before
- Verificar database_cleaner configuration

### 2.5 Verificar Consistência de Seeds e Database
- Rodar testes múltiplas vezes com seeds diferentes
- Identificar testes flaky (que passam/falham intermitentemente)
- Verificar configuração de database_cleaner
- Validar truncation vs transaction strategy
- Documentar qualquer inconsistência

### 2.6 Analisar Cobertura de Código (Code Coverage)
- Rodar SimpleCov ou similar
- Identificar áreas com baixa cobertura
- Verificar se código não coberto está relacionado às falhas
- Gerar relatório de cobertura
- Documentar gaps de cobertura

### 2.7 Preparar Ambiente de Teste Otimizado
- Criar script de setup de teste consistente
- Configurar database test adequadamente
- Preparar scripts de rollback se necessário
- Criar aliases úteis para comandos frequentes
- Documentar setup completo

## Sequenciamento
- **Bloqueado por:** Nenhuma (pode começar imediatamente)
- **Desbloqueia:** 3.0 (Autenticação), 4.0-8.0 (Services)
- **Paralelizável:** Sim - pode rodar em paralelo com 1.0 (Investigação)

## Detalhes de Implementação

### Arquivos a Analisar
```
spec/
├── rails_helper.rb
├── spec_helper.rb
├── support/
│   ├── auth_helpers.rb
│   ├── database_cleaner.rb
│   └── factory_bot.rb
├── factories/
│   ├── users.rb
│   ├── accounts.rb
│   ├── transactions.rb
│   ├── categories.rb
│   ├── budgets.rb
│   └── goals.rb
app/controllers/
├── application_controller.rb
├── api/v1/base_controller.rb
└── concerns/authenticable.rb
```

### Arquivos a Criar
```
tmp/analysis/
├── exception_patterns.md
├── factory_patterns.md
├── helper_patterns.md
├── test_dependencies.md
├── seed_consistency.md
├── coverage_report/
└── PATTERN_ANALYSIS_SUMMARY.md
```

### Análise de Exceções - Template

```markdown
# Análise de Padrões de Exceções

## Hierarquia de Exceções Customizadas
```ruby
StandardError
├── JwtService::TokenError
│   ├── JwtService::TokenInvalidError
│   └── JwtService::TokenExpiredError
└── [outras exceções customizadas]
```

## Ordem de rescue_from por Controller

### ApplicationController
1. StandardError → handle_internal_server_error
2. ActiveRecord::RecordNotFound → handle_not_found
3. ActiveRecord::RecordInvalid → handle_unprocessable_entity
4. ActionController::ParameterMissing → handle_bad_request
5. ActiveRecord::RecordNotUnique → handle_conflict

### Api::V1::BaseController
1. ActiveRecord::RecordNotFound → render_not_found
2. ActiveRecord::RecordInvalid → render_validation_errors
3. JwtService::TokenExpiredError → render_token_expired
4. JwtService::TokenInvalidError → render_unauthorized
5. StandardError → render_internal_server_error

**⚠️ PROBLEMA IDENTIFICADO:**
StandardError é último, mas pode estar capturando antes das específicas?

## Fluxo de Exceções de Autenticação
[diagrama]

## Padrões Comuns
- 60 testes esperam 401 mas recebem 500
- Indica que TokenInvalidError não está sendo capturado corretamente
- Provavelmente StandardError está capturando primeiro
```

### Script de Análise de Padrões

```bash
#!/bin/bash
# tmp/scripts/analyze_patterns.sh

echo "=== Análise de Padrões de Testes Falhando ==="

# 1. Contar tipos de erro
echo -e "\n1. Tipos de Erro:"
bundle exec rspec --format json --out /tmp/results.json
cat /tmp/results.json | jq '.examples[] | select(.status=="failed") | .exception.class' | sort | uniq -c | sort -rn

# 2. Arquivos com mais falhas
echo -e "\n2. Arquivos com Mais Falhas:"
cat /tmp/results.json | jq -r '.examples[] | select(.status=="failed") | .file_path' | sort | uniq -c | sort -rn

# 3. Mensagens de erro comuns
echo -e "\n3. Mensagens de Erro Comuns:"
cat /tmp/results.json | jq -r '.examples[] | select(.status=="failed") | .exception.message' | sort | uniq -c | sort -rn | head -10

# 4. Status codes retornados vs esperados (para request specs)
echo -e "\n4. Análise de Status Codes:"
grep -r "expect.*status.*to.*eq" spec/requests/ | grep -E "(401|403|404|500)" | sort | uniq -c

# 5. Factories usadas nos testes falhando
echo -e "\n5. Factories Mais Usadas em Testes Falhando:"
for file in $(cat /tmp/results.json | jq -r '.examples[] | select(.status=="failed") | .file_path' | uniq); do
  grep -h "create(" "$file" | sed 's/.*create(:\([a-z_]*\).*/\1/' | sort | uniq
done | sort | uniq -c | sort -rn

echo -e "\n=== Análise Completa ==="
```

### Script de Verificação de Seeds

```ruby
# tmp/scripts/verify_seed_consistency.rb
require 'json'

seeds = [1234, 5678, 9012, 3456, 7890]
results = {}

seeds.each do |seed|
  puts "Testing with seed: #{seed}"
  output = `bundle exec rspec --seed #{seed} --format json --out /tmp/seed_#{seed}.json 2>&1`

  result_data = JSON.parse(File.read("/tmp/seed_#{seed}.json"))
  results[seed] = {
    total: result_data['summary']['example_count'],
    failures: result_data['summary']['failure_count'],
    failed_examples: result_data['examples']
      .select { |e| e['status'] == 'failed' }
      .map { |e| "#{e['file_path']}:#{e['line_number']}" }
  }
end

# Verificar consistência
all_failures = results.values.flat_map { |r| r[:failed_examples] }.uniq
inconsistent = []

all_failures.each do |failure|
  seeds_with_failure = results.select { |seed, data| data[:failed_examples].include?(failure) }.keys
  if seeds_with_failure.length != seeds.length
    inconsistent << { test: failure, seeds: seeds_with_failure }
  end
end

puts "\n=== Seed Consistency Report ==="
puts "Total unique failures: #{all_failures.length}"
puts "Consistent failures: #{all_failures.length - inconsistent.length}"
puts "Inconsistent (flaky) failures: #{inconsistent.length}"

if inconsistent.any?
  puts "\nFlaky tests:"
  inconsistent.each do |item|
    puts "  #{item[:test]} - fails with seeds: #{item[:seeds].join(', ')}"
  end
end

File.write('tmp/analysis/seed_consistency.json', JSON.pretty_generate(results))
```

### Configuração de Ambiente

```bash
# tmp/scripts/setup_test_env.sh
#!/bin/bash

echo "=== Configurando Ambiente de Teste ==="

# 1. Limpar database test
echo "1. Limpando database test..."
RAILS_ENV=test bundle exec rake db:reset

# 2. Verificar configuração
echo "2. Verificando configuração..."
RAILS_ENV=test bundle exec rake db:version

# 3. Rodar migrations pendentes
echo "3. Rodando migrations..."
RAILS_ENV=test bundle exec rake db:migrate

# 4. Limpar cache
echo "4. Limpando cache..."
rm -rf tmp/cache/*

# 5. Preparar diretórios
echo "5. Preparando diretórios..."
mkdir -p tmp/investigation tmp/analysis tmp/scripts

# 6. Instalar gems de análise (se não instaladas)
echo "6. Verificando gems de análise..."
bundle check || bundle install

# 7. Verificar SimpleCov
echo "7. Verificando SimpleCov..."
if ! grep -q "SimpleCov" spec/rails_helper.rb; then
  echo "⚠️  SimpleCov não configurado"
else
  echo "✓ SimpleCov configurado"
fi

echo -e "\n=== Ambiente Preparado ==="
```

### Aliases Úteis

```bash
# Adicionar ao ~/.bashrc ou ~/.zshrc

# RSpec aliases
alias rspec-all='bundle exec rspec'
alias rspec-fast='bundle exec rspec --tag ~slow'
alias rspec-doc='bundle exec rspec --format documentation'
alias rspec-html='bundle exec rspec --format html --out tmp/rspec_results.html'
alias rspec-json='bundle exec rspec --format json --out tmp/rspec_results.json'
alias rspec-fail='bundle exec rspec --only-failures'

# Teste aliases específicos do projeto
alias rspec-auth='bundle exec rspec spec/requests/api/v1/swagger/'
alias rspec-services='bundle exec rspec spec/services/'
alias rspec-models='bundle exec rspec spec/models/'

# Análise
alias analyze-patterns='bash tmp/scripts/analyze_patterns.sh'
alias verify-seeds='ruby tmp/scripts/verify_seed_consistency.rb'
alias setup-tests='bash tmp/scripts/setup_test_env.sh'
```

## Critérios de Sucesso
- [ ] Padrões de exceções identificados e documentados
- [ ] Factories analisadas e inconsistências documentadas
- [ ] Helpers de teste documentados
- [ ] Dependências entre testes identificadas
- [ ] Testes flaky identificados (se houver)
- [ ] Cobertura de código gerada e analisada
- [ ] Ambiente de teste preparado e validado
- [ ] Scripts de análise criados e testados
- [ ] Relatório consolidado criado (PATTERN_ANALYSIS_SUMMARY.md)

## Notas de Teste

### Áreas de Foco

1. **Ordem de rescue_from:**
   - Rails processa na ordem inversa da definição
   - Mais específico deve vir antes de mais genérico
   - StandardError deve ser o último

2. **Factory consistency:**
   - Atributos renomeados (title → name, is_achieved → status)
   - Tipos mudados (boolean → enum)
   - Validações que podem falhar em factories

3. **Test helpers:**
   - auth_helpers: jwt_token(user) vs generate_jwt_token(user)
   - Inclusão correta nos specs
   - Métodos disponíveis vs métodos usados

4. **Database cleaning:**
   - Transaction vs Truncation
   - Timing de limpeza
   - Impacto em performance

### Ferramentas Recomendadas

```ruby
# Gemfile (group :test)
group :test do
  gem 'rspec-rails'
  gem 'factory_bot_rails'
  gem 'faker'
  gem 'database_cleaner-active_record'
  gem 'simplecov', require: false
  gem 'rspec-retry'  # Para lidar com flaky tests
end
```

### Métricas a Coletar

- Tempo de execução da suite completa
- Tempo por categoria de teste (requests, services, models)
- Memória utilizada
- Número de queries SQL por teste
- Cobertura de código por módulo

## Referências
- [PRD] tasks/corrigir-testes-rspec/prd.md
- [Tech Spec] tasks/corrigir-testes-rspec/techspec.md
- [Rails Testing Guide] https://guides.rubyonrails.org/testing.html
- [RSpec Best Practices] https://rspec.info/documentation/
- [Database Cleaner] https://github.com/DatabaseCleaner/database_cleaner
