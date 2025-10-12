import { Page, expect } from '@playwright/test'

/**
 * Helper para ativar dark mode
 */
export async function enableDarkMode(page: Page) {
  await page.evaluate(() => {
    localStorage.setItem('theme', 'dark')
    document.documentElement.classList.add('dark')
  })
}

/**
 * Helper para desativar dark mode
 */
export async function disableDarkMode(page: Page) {
  await page.evaluate(() => {
    localStorage.setItem('theme', 'light')
    document.documentElement.classList.remove('dark')
  })
}

/**
 * Helper para fazer login
 * Usa variáveis de ambiente para credenciais de teste
 */
export async function login(
  page: Page,
  email = process.env.TEST_USER_EMAIL || 'test@example.com',
  password = process.env.TEST_USER_PASSWORD || 'test123'
) {
  await page.goto('/auth/login')
  await page.fill('[name="email"]', email)
  await page.fill('[name="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL('/dashboard', { timeout: 10000 })
}

/**
 * Helper para aguardar carregamento completo da página
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle')
  await page.waitForLoadState('domcontentloaded')
}

/**
 * Helper para tirar screenshot com configurações padrão
 */
export async function takeScreenshot(page: Page, name: string, options = {}) {
  await waitForPageLoad(page)
  return await page.screenshot({
    path: `test-results/screenshots/${name}.png`,
    fullPage: true,
    ...options,
  })
}

/**
 * Helper para comparar screenshot com baseline
 */
export async function compareScreenshot(page: Page, name: string, options = {}) {
  await waitForPageLoad(page)
  expect(await page.screenshot({ fullPage: true })).toMatchSnapshot(`${name}.png`, {
    maxDiffPixels: 100,
    ...options,
  })
}

/**
 * Helper para ocultar elementos dinâmicos antes de screenshot
 */
export async function hideDynamicElements(page: Page) {
  await page.evaluate(() => {
    // Ocultar elementos com timestamps, valores aleatórios, etc.
    const dynamicSelectors = [
      '[data-dynamic="true"]',
      '.timestamp',
      '.random-value',
    ]

    dynamicSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector)
      elements.forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.visibility = 'hidden'
        }
      })
    })
  })
}

/**
 * Viewports para testes de responsividade
 */
export const viewports = {
  mobile: {
    small: { width: 375, height: 667 },
    medium: { width: 390, height: 844 },
    large: { width: 428, height: 926 },
  },
  tablet: {
    portrait: { width: 768, height: 1024 },
    landscape: { width: 1024, height: 768 },
  },
  desktop: {
    standard: { width: 1280, height: 720 },
    hd: { width: 1920, height: 1080 },
  },
}

/**
 * Helper para testar em múltiplos viewports
 */
export async function testInViewport(
  page: Page,
  viewport: { width: number; height: number },
  testFn: () => Promise<void>
) {
  await page.setViewportSize(viewport)
  await testFn()
}
