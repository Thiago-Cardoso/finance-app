# Guia de Teste Manual - Correção do Loop Infinito (Transações)

## Objetivo
Validar que o loop infinito foi corrigido e que todas as funcionalidades de filtros estão funcionando corretamente.

---

## Pré-requisitos

1. **Iniciar o servidor de desenvolvimento:**
   ```bash
   cd /Users/thiagocardoso/Documents/finance-app/mobile
   npm start
   ```

2. **Abrir o app no simulador/dispositivo**

3. **Abrir o console de logs** (Metro Bundler ou React Native Debugger)

---

## Checklist de Testes

### 1. Carregamento Inicial ✅

**Objetivo:** Verificar que a lista carrega sem loops infinitos

**Passos:**
1. Abrir o app
2. Navegar para a aba "Transações"
3. Observar o console de logs

**Resultado Esperado:**
- [ ] Lista de transações carrega normalmente
- [ ] Sem erros no console
- [ ] Sem loop infinito de logs
- [ ] Sem erro "Maximum update depth exceeded"
- [ ] Loading spinner aparece e desaparece rapidamente

**Resultado Incorreto:**
- ❌ Console mostra logs infinitos
- ❌ Erro "Maximum update depth exceeded"
- ❌ App trava ou fica lento

---

### 2. Filtros por Tipo (Tabs) ✅

**Objetivo:** Verificar que trocar entre tipos não causa loops

**Passos:**
1. Na tela de Transações
2. Clicar na aba "Despesas"
3. Observar console
4. Clicar na aba "Receitas"
5. Observar console
6. Clicar na aba "Todas"
7. Observar console

**Resultado Esperado:**
- [ ] Lista atualiza a cada clique
- [ ] Transações filtradas aparecem corretamente
- [ ] Contador de transações atualiza
- [ ] Console limpo, sem loops
- [ ] Cada clique causa apenas 1 request de API

**Teste de Stress:**
- [ ] Clicar rapidamente entre as abas (10 cliques em 5 segundos)
- [ ] App não trava
- [ ] Console sem erros

---

### 3. Busca/Search ✅

**Objetivo:** Verificar que a busca funciona com debounce correto

**Passos:**
1. Na tela de Transações
2. Clicar no campo de busca
3. Digitar "test" **devagar** (1 letra por segundo)
4. Observar console
5. Esperar 300ms após última letra
6. Observar se request foi feito

**Resultado Esperado:**
- [ ] Enquanto digita, nenhum request é feito
- [ ] 300ms após parar de digitar, 1 request é feito
- [ ] Lista atualiza com resultados
- [ ] Console sem loops

**Teste de Debounce:**
1. Digitar "t"
2. Esperar 200ms
3. Digitar "e"
4. Esperar 200ms
5. Digitar "s"
6. Esperar 200ms
7. Digitar "t"
8. Esperar 400ms

**Resultado Esperado:**
- [ ] Apenas 1 request é feito (após 300ms de "test")
- [ ] Não há 4 requests (um para cada letra)

**Teste de Stress:**
- [ ] Digitar rapidamente "abcdefghijklmnopqrstuvwxyz"
- [ ] Apenas 1 request ao final (300ms após última letra)

---

### 4. Filtros Avançados ✅

**Objetivo:** Verificar que filtros avançados não causam loops

**Passos:**
1. Na tela de Transações
2. Clicar no ícone de filtro (canto superior direito)
3. Modal de filtros abre
4. Selecionar uma categoria
5. Clicar em "Aplicar"
6. Observar console

**Resultado Esperado:**
- [ ] Modal abre normalmente
- [ ] Filtro é aplicado
- [ ] Lista atualiza
- [ ] Badge com número de filtros aparece no ícone
- [ ] Console sem loops
- [ ] Apenas 1 request de API

**Testes Adicionais:**
- [ ] Aplicar filtro de data
- [ ] Aplicar filtro de valor (min/max)
- [ ] Aplicar múltiplos filtros
- [ ] Remover um filtro (clicar no X do chip)
- [ ] Limpar todos os filtros

---

### 5. Chips de Filtros Ativos ✅

**Objetivo:** Verificar que remover filtros não causa loops

**Passos:**
1. Aplicar 3 filtros diferentes (tipo + busca + categoria)
2. Observar os chips abaixo dos tabs
3. Clicar no X de um chip para remover
4. Observar console
5. Clicar em "Limpar Tudo"
6. Observar console

**Resultado Esperado:**
- [ ] Cada chip mostra o filtro correto
- [ ] Remover um chip remove apenas aquele filtro
- [ ] "Limpar Tudo" remove todos os filtros
- [ ] Lista atualiza após cada ação
- [ ] Console sem loops
- [ ] Cada ação causa apenas 1 request

---

### 6. Pull-to-Refresh ✅

**Objetivo:** Verificar que refresh não causa loops

**Passos:**
1. Na lista de transações
2. Arrastar para baixo (pull-to-refresh)
3. Soltar
4. Observar loading spinner
5. Observar console

**Resultado Esperado:**
- [ ] Spinner de refresh aparece
- [ ] Lista recarrega
- [ ] Spinner desaparece
- [ ] Console sem loops
- [ ] Cache é limpo (nova request é feita)

**Teste com Filtros:**
1. Aplicar um filtro
2. Fazer pull-to-refresh
3. Verificar que filtro persiste

**Resultado Esperado:**
- [ ] Filtro não é perdido no refresh
- [ ] Lista recarrega com o filtro aplicado

---

### 7. Paginação (Load More) ✅

**Objetivo:** Verificar que carregar mais não causa loops

**Passos:**
1. Na lista de transações
2. Scroll até o final da lista
3. Observar loading spinner no footer
4. Aguardar próxima página carregar
5. Observar console

**Resultado Esperado:**
- [ ] Ao chegar no final, próxima página carrega automaticamente
- [ ] Spinner aparece no footer
- [ ] Novas transações são adicionadas ao final
- [ ] Console sem loops
- [ ] Apenas 1 request por página

**Teste de Stress:**
- [ ] Scroll rápido até o final
- [ ] Múltiplas páginas carregam sequencialmente
- [ ] App não trava

---

### 8. Combinação de Ações ✅

**Objetivo:** Teste de integração completo

**Sequência:**
1. Abrir Transações
2. Digitar "test" na busca
3. Trocar para aba "Despesas"
4. Aplicar filtro de categoria
5. Scroll até o final (paginação)
6. Pull-to-refresh
7. Remover filtro de categoria
8. Limpar busca
9. Voltar para "Todas"

**Resultado Esperado:**
- [ ] Todas as ações funcionam normalmente
- [ ] Console limpo em todas as etapas
- [ ] Nenhum erro ou loop
- [ ] Performance fluida

---

### 9. Teste de Re-render ✅

**Objetivo:** Verificar que não há re-renders desnecessários

**Passos (Avançado - requer React DevTools):**
1. Abrir React DevTools
2. Ativar "Highlight updates"
3. Na tela de Transações, não fazer nada
4. Observar se componente re-renderiza sozinho

**Resultado Esperado:**
- [ ] Sem re-renders automáticos
- [ ] Componente só renderiza quando há ação do usuário

---

### 10. Teste de Memory Leak ✅

**Objetivo:** Verificar que não há vazamento de memória

**Passos:**
1. Abrir Transações
2. Realizar todas as ações acima
3. Navegar para outra tela
4. Voltar para Transações
5. Repetir 5 vezes
6. Observar performance

**Resultado Esperado:**
- [ ] Performance mantém-se consistente
- [ ] App não fica cada vez mais lento
- [ ] Sem warnings de memory leak

---

## Verificação de Console

### ✅ Console Limpo
```
✓ GET /api/v1/transactions?page=1&per_page=20 200
✓ Component mounted
✓ Data loaded successfully
```

### ❌ Console com Loop
```
✗ GET /api/v1/transactions?page=1&per_page=20 200
✗ GET /api/v1/transactions?page=1&per_page=20 200
✗ GET /api/v1/transactions?page=1&per_page=20 200
✗ GET /api/v1/transactions?page=1&per_page=20 200
✗ ... (infinito)
✗ Warning: Maximum update depth exceeded
```

---

## Checklist Final

### Funcionalidades
- [ ] Carregamento inicial funciona
- [ ] Filtros por tipo (tabs) funcionam
- [ ] Busca funciona com debounce
- [ ] Filtros avançados funcionam
- [ ] Remover filtros funciona
- [ ] Pull-to-refresh funciona
- [ ] Paginação funciona
- [ ] Combinações funcionam

### Performance
- [ ] App não trava
- [ ] Sem delays perceptíveis
- [ ] Debounce funciona (300ms)
- [ ] Requests não são duplicados

### Console
- [ ] Sem erros
- [ ] Sem warnings
- [ ] Sem loops infinitos
- [ ] Sem "Maximum update depth exceeded"

### UX
- [ ] Loading states aparecem
- [ ] Feedback visual correto
- [ ] Contadores atualizados
- [ ] Empty states corretos

---

## Relatório de Bugs (Se Encontrar)

### Template
```markdown
## Bug: [Título]

**Passos para Reproduzir:**
1. [Passo 1]
2. [Passo 2]
3. [Passo 3]

**Resultado Esperado:**
[O que deveria acontecer]

**Resultado Atual:**
[O que está acontecendo]

**Console/Logs:**
```
[Cole os logs relevantes]
```

**Screenshots/Vídeo:**
[Se possível]

**Ambiente:**
- OS: [iOS/Android/Web]
- Versão: [X.X.X]
- Device: [iPhone 14 / Pixel 6 / etc]
```

---

## Próximos Passos Após Testes

### ✅ Se Tudo Passar
1. Marcar todos os checkboxes acima
2. Fazer commit das mudanças
3. Criar PR
4. Deploy para produção

### ❌ Se Encontrar Bugs
1. Documentar usando template acima
2. Criar issue no GitHub
3. Retornar para debug
4. Re-testar após correção

---

## Comandos Úteis

### Limpar cache e reiniciar
```bash
npm run clean
npm start -- --reset-cache
```

### Ver logs do Metro
```bash
# Metro Bundler já mostra logs
# Ou use React Native Debugger
```

### Ver re-renders (DevTools)
1. Instalar [React DevTools](https://react-devtools-experimental.vercel.app/)
2. Ativar "Highlight updates when components render"
3. Observar componentes

---

## Contato

Se encontrar problemas ou tiver dúvidas, favor reportar:
- **Issues:** GitHub Issues
- **Urgente:** Notificar time imediatamente

---

**Data do Teste:** ___/___/_____
**Testador:** __________________
**Resultado:** [ ] PASSOU [ ] FALHOU
**Observações:**
```
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________
```

---

🎯 **Objetivo:** Garantir que o loop infinito foi corrigido e o app está estável para produção.
