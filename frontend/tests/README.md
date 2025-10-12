# Testes Visuais com Playwright

Este diretório contém testes visuais e de regressão para o Finance App usando Playwright.

## Estrutura de Diretórios

```
tests/
├── helpers/              # Utilitários e helpers de teste
│   └── test-utils.ts    # Funções auxiliares para testes
├── visual-regression/    # Testes de regressão visual
│   ├── pages/           # Testes de páginas completas
│   ├── components/      # Testes de componentes UI
│   └── dark-mode/       # Testes específicos de dark mode
├── responsive/          # Testes de responsividade
└── integration/         # Testes de integração (futuro)
```

## Comandos Disponíveis

### Executar Todos os Testes
```bash
npm run test:e2e
```

### Executar com Interface Visual
```bash
npm run test:e2e:ui
```

### Testes Específicos

```bash
# Apenas testes visuais
npm run test:visual

# Apenas testes de responsividade
npm run test:responsive

# Apenas testes de dark mode
npm run test:dark

# Apenas testes de componentes
npm run test:components

# Apenas testes de páginas
npm run test:pages
```

### Atualizar Baseline de Screenshots

```bash
npm run test:visual:update
```

### Debug

```bash
# Modo debug interativo
npm run test:e2e:debug

# Rodar com browser visível
npm run test:e2e:headed
```

## Viewports Testados

### Mobile
- **Small**: 375x667 (iPhone SE)
- **Medium**: 390x844 (iPhone 13)
- **Large**: 428x926 (iPhone 14 Pro Max)

### Tablet
- **Portrait**: 768x1024 (iPad)
- **Landscape**: 1024x768 (iPad rotacionado)

### Desktop
- **Standard**: 1280x720
- **HD**: 1920x1080

## Projetos Configurados

O Playwright está configurado para testar em:
- Chromium Desktop
- Firefox Desktop
- WebKit Desktop (Safari)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 13)
- Tablet iPad Pro

## Como Funcionam os Testes Visuais

1. **Primeira Execução**: Gera screenshots baseline (referência)
2. **Execuções Subsequentes**: Compara com baseline
3. **Diferenças**: Falha se houver mais de 100 pixels diferentes
4. **Atualização**: Use `--update-snapshots` para atualizar baseline

## Tags de Testes

Os testes usam tags para facilitar filtros:

- `@visual` - Testes de regressão visual
- `@responsive` - Testes de responsividade
- `@dark` - Testes de dark mode
- `@component` - Testes de componentes
- `@page` - Testes de páginas completas

## Exemplo de Uso

```typescript
import { test, expect } from '@playwright/test'
import { enableDarkMode, waitForPageLoad } from '../helpers/test-utils'

test.describe('My Feature @visual', () => {
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

## CI/CD

Os testes podem ser configurados para rodar automaticamente em PRs usando GitHub Actions.
Veja `.github/workflows/visual-tests.yml` (a ser criado).

## Troubleshooting

### Testes Falhando com Pequenas Diferenças

Se os testes estão falhando por pequenas diferenças:
1. Verifique se não há elementos dinâmicos (timestamps, animações)
2. Aumente `maxDiffPixels` se necessário
3. Use `hideDynamicElements()` helper

### Screenshots Diferentes Entre Ambientes

- Certifique-se que a fonte está instalada em todos ambientes
- Use o mesmo SO/Browser em CI e local
- Considere usar Docker para consistência

### Performance

- Rode testes em paralelo quando possível
- Use `fullyParallel: true` no config
- Em CI, use `workers: 1` para consistência
