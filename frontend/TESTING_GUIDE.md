# Guia de Testes - Finance App Frontend

## Visão Geral

Este projeto utiliza duas estratégias de teste:
1. **Testes Unitários**: Jest + React Testing Library
2. **Testes E2E/Visuais**: Playwright

## Setup Inicial

### 1. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo e configure as credenciais de teste:

```bash
cp .env.test.example .env.test
```

Edite `.env.test` com suas credenciais de teste:
```env
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=test123
```

### 2. Instalar Browsers do Playwright

```bash
npx playwright install --with-deps
```

### Verificar Instalação

```bash
npx playwright --version
npm run test:e2e -- --list
```

## Executando Testes

### Testes Unitários (Jest)

```bash
# Rodar todos os testes unitários
npm test

# Watch mode
npm run test:watch

# Com cobertura
npm run test:coverage
```

### Testes E2E/Visuais (Playwright)

```bash
# Rodar todos os testes E2E
npm run test:e2e

# Interface visual (recomendado)
npm run test:e2e:ui

# Com browser visível
npm run test:e2e:headed

# Modo debug
npm run test:e2e:debug
```

### Testes Específicos

```bash
# Apenas testes visuais
npm run test:visual

# Atualizar baseline de screenshots
npm run test:visual:update

# Apenas testes de responsividade
npm run test:responsive

# Apenas testes de dark mode
npm run test:dark

# Apenas testes de componentes
npm run test:components

# Apenas testes de páginas
npm run test:pages
```

## Estrutura de Testes

### Testes Unitários (`src/**/*.test.tsx`)
- Componentes isolados
- Hooks
- Utilitários
- Lógica de negócio

### Testes E2E (`tests/`)
```
tests/
├── smoke-test.spec.ts           # Testes básicos de fumaça
├── visual-regression/
│   ├── pages/                   # Testes de páginas completas
│   │   ├── dashboard.spec.ts
│   │   ├── categories.spec.ts
│   │   └── transactions.spec.ts
│   ├── components/              # Testes de componentes UI
│   │   └── ui-components.spec.ts
│   └── dark-mode/               # Testes de tema
│       └── all-pages-dark.spec.ts
├── responsive/                  # Testes de responsividade
│   └── responsive-pages.spec.ts
├── integration/                 # Testes de integração (futuro)
└── helpers/                     # Utilitários
    └── test-utils.ts
```

## Criando Novos Testes

### Teste Visual de Página

```typescript
import { test, expect } from '@playwright/test'
import { waitForPageLoad } from '../helpers/test-utils'

test.describe('My Page Visual Tests @visual @page', () => {
  test('should render correctly', async ({ page }) => {
    await page.goto('/my-page')
    await waitForPageLoad(page)

    await expect(page).toHaveScreenshot('my-page.png', {
      fullPage: true,
      maxDiffPixels: 100,
    })
  })
})
```

### Teste de Responsividade

```typescript
import { test, expect } from '@playwright/test'
import { viewports } from '../helpers/test-utils'

test('should be responsive', async ({ page }) => {
  await page.setViewportSize(viewports.mobile.small)
  await page.goto('/my-page')
  await expect(page).toHaveScreenshot('my-page-mobile.png')
})
```

### Teste de Dark Mode

```typescript
import { test, expect } from '@playwright/test'
import { enableDarkMode } from '../helpers/test-utils'

test('should work in dark mode', async ({ page }) => {
  await page.goto('/my-page')
  await enableDarkMode(page)
  await page.reload()
  await expect(page).toHaveScreenshot('my-page-dark.png')
})
```

## Boas Práticas

### 1. Use Tags para Organização
```typescript
test.describe('Feature @visual @responsive', () => {
  // testes aqui
})
```

### 2. Aguarde Carregamento Completo
```typescript
import { waitForPageLoad } from '../helpers/test-utils'

await page.goto('/page')
await waitForPageLoad(page)
```

### 3. Configure Tolerância de Diferenças
```typescript
await expect(page).toHaveScreenshot('name.png', {
  maxDiffPixels: 100, // Ajuste conforme necessário
})
```

### 4. Oculte Elementos Dinâmicos
```typescript
import { hideDynamicElements } from '../helpers/test-utils'

await hideDynamicElements(page)
await expect(page).toHaveScreenshot('name.png')
```

### 5. Use Viewports Consistentes
```typescript
import { viewports } from '../helpers/test-utils'

await page.setViewportSize(viewports.desktop.standard)
```

## Screenshots Baseline

### Primeira Execução
```bash
# Gera screenshots baseline
npm run test:visual:update
```

### Atualizando Baseline
```bash
# Após mudanças intencionais no UI
npm run test:visual:update
```

### Localizando Screenshots
```
tests/
├── visual-regression/
│   ├── pages/
│   │   └── dashboard.spec.ts-snapshots/
│   │       ├── dashboard-full-page.png
│   │       └── ...
```

## CI/CD

### GitHub Actions (Exemplo)

```yaml
name: E2E Tests

on: [pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18

      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e

      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Troubleshooting

### Problema: Browsers não instalados
**Solução**:
```bash
npx playwright install --with-deps
```

### Problema: Screenshots diferentes em diferentes ambientes
**Solução**:
- Use Docker para consistência
- Ou ajuste `maxDiffPixels`
- Ou use o mesmo SO/Browser

### Problema: Testes lentos
**Solução**:
- Rode em paralelo: `fullyParallel: true` (já configurado)
- Reduza número de projetos para desenvolvimento local
- Use `test.describe.configure({ mode: 'parallel' })`

### Problema: Falsos positivos
**Solução**:
- Aumente `maxDiffPixels`
- Use `hideDynamicElements()`
- Aguarde animações: `await page.waitForTimeout(300)`

## Recursos Úteis

- [Playwright Docs](https://playwright.dev)
- [Testing Library](https://testing-library.com)
- [Jest Docs](https://jestjs.io)

## Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm test` | Testes unitários (Jest) |
| `npm run test:e2e` | Todos os testes E2E |
| `npm run test:e2e:ui` | Interface visual do Playwright |
| `npm run test:visual` | Apenas testes visuais |
| `npm run test:visual:update` | Atualizar baseline |
| `npm run test:responsive` | Testes de responsividade |
| `npm run test:dark` | Testes de dark mode |
| `npm run test:components` | Testes de componentes |
| `npm run test:pages` | Testes de páginas |

## Helpers Disponíveis

### test-utils.ts

- `enableDarkMode(page)` - Ativa dark mode
- `disableDarkMode(page)` - Desativa dark mode
- `login(page, email, password)` - Faz login
- `waitForPageLoad(page)` - Aguarda carregamento
- `takeScreenshot(page, name)` - Tira screenshot
- `compareScreenshot(page, name)` - Compara com baseline
- `hideDynamicElements(page)` - Oculta elementos dinâmicos
- `viewports` - Viewports pré-configurados
- `testInViewport(page, viewport, testFn)` - Testa em viewport específico
