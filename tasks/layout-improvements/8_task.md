---
status: pending
parallelizable: false
blocked_by: ["7.0"]
---

<task_context>
<domain>frontend/testing/visual</domain>
<type>testing</type>
<scope>quality_assurance</scope>
<complexity>medium</complexity>
<dependencies>playwright|mcp</dependencies>
<unblocks></unblocks>
</task_context>

# Tarefa 8.0: Implementar Testes Visuais com Playwright

## Visão Geral

Implementar uma suite completa de testes visuais e de regressão usando Playwright e o MCP Playwright disponível, garantindo que todas as melhorias de layout sejam testadas e que não haja regressões visuais futuras.

## Requisitos

<requirements>
- Criar testes visuais para todas as telas principais
- Implementar visual regression testing
- Testar responsividade em múltiplos breakpoints
- Testar dark mode vs light mode
- Testar estados interativos (hover, focus, disabled)
- Usar Playwright MCP para automação
- Criar baseline de screenshots
- Configurar CI/CD para rodar testes
</requirements>

## Subtarefas

### 8.1 Setup e Configuração

- [ ] 8.1.1 Verificar configuração do Playwright
- [ ] 8.1.2 Configurar visual regression testing
- [ ] 8.1.3 Definir viewports para testes
- [ ] 8.1.4 Configurar threshold de diferenças

### 8.2 Testes de Componentes UI

- [ ] 8.2.1 Testar Button (todas as variantes)
- [ ] 8.2.2 Testar Input (estados e variantes)
- [ ] 8.2.3 Testar Modal/Drawer
- [ ] 8.2.4 Testar Pagination
- [ ] 8.2.5 Testar Card component
- [ ] 8.2.6 Testar Alert component

### 8.3 Testes de Páginas

- [ ] 8.3.1 Testar página de Login
- [ ] 8.3.2 Testar Dashboard
- [ ] 8.3.3 Testar Transactions page
- [ ] 8.3.4 Testar Categories page
- [ ] 8.3.5 Testar Reports page (se existir)

### 8.4 Testes de Responsividade

- [ ] 8.4.1 Testar em mobile (375px, 390px, 428px)
- [ ] 8.4.2 Testar em tablet (768px, 1024px)
- [ ] 8.4.3 Testar em desktop (1280px, 1920px)
- [ ] 8.4.4 Testar orientação landscape

### 8.5 Testes de Dark Mode

- [ ] 8.5.1 Comparar light vs dark em todas as páginas
- [ ] 8.5.2 Verificar contraste adequado
- [ ] 8.5.3 Validar cores de gradientes
- [ ] 8.5.4 Testar toggle de theme

### 8.6 Testes de Estados Interativos

- [ ] 8.6.1 Testar estados hover
- [ ] 8.6.2 Testar estados focus
- [ ] 8.6.3 Testar estados disabled
- [ ] 8.6.4 Testar estados loading

### 8.7 Testes de Fluxo

- [ ] 8.7.1 Testar fluxo de criação de transaction
- [ ] 8.7.2 Testar fluxo de edição de category
- [ ] 8.7.3 Testar fluxo de navegação entre páginas
- [ ] 8.7.4 Testar fluxo de filtros

### 8.8 CI/CD Integration

- [ ] 8.8.1 Configurar GitHub Actions para rodar testes
- [ ] 8.8.2 Configurar armazenamento de screenshots
- [ ] 8.8.3 Configurar reports automáticos
- [ ] 8.8.4 Configurar notificações de falhas

## Detalhes de Implementação

### Configuração do Playwright

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'test-results.xml' }],
  ],

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // Desktop browsers
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox-desktop',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit-desktop',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile devices
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
    },

    // Tablet
    {
      name: 'tablet',
      use: { ...devices['iPad Pro'] },
    },

    // Custom viewports
    {
      name: 'desktop-1920',
      use: {
        viewport: { width: 1920, height: 1080 },
      },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### Visual Regression Testing Setup

```typescript
// tests/visual-regression.spec.ts
import { test, expect } from '@playwright/test'

// Helper function for visual tests
async function takeScreenshot(page, name: string, options = {}) {
  await page.screenshot({
    path: `screenshots/${name}.png`,
    fullPage: true,
    ...options,
  })
}

// Helper function for visual comparison
async function compareScreenshot(page, name: string) {
  expect(await page.screenshot()).toMatchSnapshot(`${name}.png`, {
    maxDiffPixels: 100, // Allow small differences
  })
}

// Test dark mode vs light mode
test.describe('Dark Mode Visual Regression', () => {
  test('Dashboard - Light Mode', async ({ page }) => {
    await page.goto('/dashboard')
    await compareScreenshot(page, 'dashboard-light')
  })

  test('Dashboard - Dark Mode', async ({ page }) => {
    await page.goto('/dashboard')
    // Toggle dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark')
    })
    await compareScreenshot(page, 'dashboard-dark')
  })
})
```

### Testes de Componentes UI

```typescript
// tests/components/button.visual.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Button Component Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar para página de teste de componentes
    await page.goto('/component-tests/button')
  })

  test('All button variants', async ({ page }) => {
    await expect(page.locator('[data-testid="button-primary"]')).toHaveScreenshot()
    await expect(page.locator('[data-testid="button-secondary"]')).toHaveScreenshot()
    await expect(page.locator('[data-testid="button-danger"]')).toHaveScreenshot()
    await expect(page.locator('[data-testid="button-ghost"]')).toHaveScreenshot()
  })

  test('Button hover state', async ({ page }) => {
    const button = page.locator('[data-testid="button-primary"]')
    await button.hover()
    await expect(button).toHaveScreenshot()
  })

  test('Button disabled state', async ({ page }) => {
    const button = page.locator('[data-testid="button-disabled"]')
    await expect(button).toHaveScreenshot()
  })

  test('Button loading state', async ({ page }) => {
    const button = page.locator('[data-testid="button-loading"]')
    await expect(button).toHaveScreenshot()
  })
})
```

### Testes de Páginas Completas

```typescript
// tests/pages/categories.visual.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Categories Page Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/auth/login')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('Categories page - Empty state', async ({ page }) => {
    await page.goto('/categories')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot('categories-empty.png', {
      fullPage: true,
    })
  })

  test('Categories page - With data', async ({ page }) => {
    // Create some test categories first
    await page.goto('/categories')
    await page.click('button:has-text("New Category")')
    await page.fill('[name="name"]', 'Test Category')
    await page.click('button:has-text("Save")')
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveScreenshot('categories-with-data.png', {
      fullPage: true,
    })
  })

  test('Categories page - Modal open', async ({ page }) => {
    await page.goto('/categories')
    await page.click('button:has-text("New Category")')
    await page.waitForSelector('[role="dialog"]')

    await expect(page).toHaveScreenshot('categories-modal-open.png', {
      fullPage: true,
    })
  })
})
```

### Testes de Responsividade

```typescript
// tests/responsive/categories.responsive.spec.ts
import { test, expect } from '@playwright/test'

const viewports = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 13', width: 390, height: 844 },
  { name: 'iPhone 14 Pro Max', width: 428, height: 926 },
  { name: 'iPad', width: 768, height: 1024 },
  { name: 'Desktop', width: 1920, height: 1080 },
]

test.describe('Categories Responsive Tests', () => {
  for (const viewport of viewports) {
    test(`Categories page at ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      })

      await page.goto('/categories')
      await page.waitForLoadState('networkidle')

      await expect(page).toHaveScreenshot(`categories-${viewport.name}.png`, {
        fullPage: true,
      })
    })
  }
})
```

### Testes de Dark Mode

```typescript
// tests/dark-mode/all-pages.spec.ts
import { test, expect } from '@playwright/test'

const pages = [
  { path: '/dashboard', name: 'dashboard' },
  { path: '/transactions', name: 'transactions' },
  { path: '/categories', name: 'categories' },
]

test.describe('Dark Mode Visual Tests', () => {
  for (const { path, name } of pages) {
    test(`${name} - Light Mode`, async ({ page }) => {
      await page.goto(path)
      await page.waitForLoadState('networkidle')
      await expect(page).toHaveScreenshot(`${name}-light.png`)
    })

    test(`${name} - Dark Mode`, async ({ page }) => {
      await page.goto(path)
      await page.evaluate(() => {
        localStorage.setItem('theme', 'dark')
        document.documentElement.classList.add('dark')
      })
      await page.reload()
      await page.waitForLoadState('networkidle')
      await expect(page).toHaveScreenshot(`${name}-dark.png`)
    })
  }
})
```

### Usando Playwright MCP

```typescript
// tests/mcp/categories.mcp.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Categories using Playwright MCP', () => {
  test('Navigate and take snapshot', async ({ page }) => {
    // Usar MCP tools se disponível
    // mcp__playwright__browser_navigate
    await page.goto('/categories')

    // mcp__playwright__browser_snapshot
    const snapshot = await page.accessibility.snapshot()
    console.log('Accessibility tree:', snapshot)

    // mcp__playwright__browser_take_screenshot
    await page.screenshot({
      path: 'test-results/categories-mcp.png',
      fullPage: true,
    })

    // Validar elementos visíveis
    await expect(page.getByRole('heading', { name: 'Categories' })).toBeVisible()
  })

  test('Click new category button', async ({ page }) => {
    await page.goto('/categories')

    // mcp__playwright__browser_click
    await page.click('button:has-text("New Category")')

    // Verificar modal aberto
    await expect(page.getByRole('dialog')).toBeVisible()
  })
})
```

### GitHub Actions Workflow

```yaml
# .github/workflows/visual-tests.yml
name: Visual Regression Tests

on:
  pull_request:
    branches: [main, master]
  push:
    branches: [main, master]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        working-directory: frontend
        run: npm ci

      - name: Install Playwright
        working-directory: frontend
        run: npx playwright install --with-deps

      - name: Run visual tests
        working-directory: frontend
        run: npm run test:visual

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: frontend/playwright-report/
          retention-days: 30

      - name: Upload screenshots
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: screenshots
          path: frontend/test-results/
          retention-days: 30
```

### Package.json Scripts

```json
{
  "scripts": {
    "test:visual": "playwright test --grep @visual",
    "test:visual:ui": "playwright test --ui",
    "test:visual:update": "playwright test --update-snapshots",
    "test:responsive": "playwright test --grep @responsive",
    "test:dark-mode": "playwright test --grep @dark",
    "test:components": "playwright test --grep @component"
  }
}
```

### Organização de Testes

```
tests/
├── visual-regression/
│   ├── components/
│   │   ├── button.spec.ts
│   │   ├── input.spec.ts
│   │   ├── modal.spec.ts
│   │   └── pagination.spec.ts
│   ├── pages/
│   │   ├── dashboard.spec.ts
│   │   ├── transactions.spec.ts
│   │   └── categories.spec.ts
│   └── dark-mode/
│       └── all-pages.spec.ts
├── responsive/
│   ├── mobile.spec.ts
│   ├── tablet.spec.ts
│   └── desktop.spec.ts
└── integration/
    ├── create-transaction.spec.ts
    └── filter-categories.spec.ts
```

## Critérios de Sucesso

- [ ] Todos os componentes UI têm testes visuais
- [ ] Todas as páginas principais têm testes
- [ ] Responsividade é testada em 5+ viewports
- [ ] Dark mode é testado em todas as páginas
- [ ] Estados interativos são testados
- [ ] Baseline de screenshots criado
- [ ] CI/CD configurado e funcionando
- [ ] Testes passam sem falsos positivos
- [ ] Reports são gerados automaticamente
- [ ] Documentação de testes está clara

## Baseline de Screenshots

Para criar baseline inicial:

```bash
# Gerar screenshots baseline
npm run test:visual:update

# Revisar screenshots gerados
ls -la tests/__screenshots__/

# Commitar baselines
git add tests/__screenshots__/
git commit -m "Add visual regression baseline screenshots"
```

## Casos de Teste Prioritários

### Alta Prioridade
1. Dashboard (light e dark)
2. Transactions page (light e dark)
3. Categories page (light e dark)
4. Button component (todas variantes)
5. Modal component

### Média Prioridade
6. Login page
7. Input component
8. Pagination component
9. Card component
10. Alert component

### Baixa Prioridade
11. Empty states
12. Loading states
13. Error states
14. Settings page

## Estimativa de Complexidade

- **Complexidade**: Média
- **Tempo Estimado**: 8-10 horas
- **Risco**: Baixo (testes não afetam produção)
- **Dependências**: 7.0 (todos layouts finalizados)

## Próximos Passos

Após completar esta tarefa:
- Feature de melhorias de layout estará 100% completa
- Baseline de qualidade visual estabelecido
- CI/CD garantirá que não haja regressões
- Time pode focar em novas features com confiança
