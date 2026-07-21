---
status: pending
parallelizable: false
blocked_by: ["3.0"]
---

<task_context>
<domain>frontend/testing</domain>
<type>implementation</type>
<scope>core_feature</scope>
<complexity>medium</complexity>
<dependencies>frontend_setup</dependencies>
<unblocks>"10.0", "14.0", "15.0"</unblocks>
</task_context>

# Tarefa 8.0: Configuração de Testes Frontend (Jest/RTL)

## Visão Geral
Configurar infraestrutura completa de testes para o frontend Next.js 15, incluindo Jest, React Testing Library, MSW para mocks de API, e configurações de coverage para garantir qualidade do código.

## Requisitos
- Jest configurado para Next.js 15 e TypeScript
- React Testing Library para testes de componentes
- MSW (Mock Service Worker) para interceptar APIs
- Testing utilities e helpers customizados
- Coverage reports com meta de 80%+
- Testes de integração e unitários

## Subtarefas
- [ ] 8.1 Configurar Jest com Next.js 15 e TypeScript
- [ ] 8.2 Setup React Testing Library com custom renders
- [ ] 8.3 Configurar MSW para mock de APIs
- [ ] 8.4 Criar testing utilities e helpers
- [ ] 8.5 Configurar coverage reports e thresholds
- [ ] 8.6 Implementar testes de componentes UI base
- [ ] 8.7 Setup testes de hooks customizados
- [ ] 8.8 Configurar testes de integração
- [ ] 8.9 Criar scripts de CI/CD para testes
- [ ] 8.10 Documentar padrões de teste

## Sequenciamento
- Bloqueado por: 3.0 (Frontend Setup)
- Desbloqueia: 10.0 (Interface Transações), 14.0 (Interface Dashboard), 15.0 (Componentes Charts)
- Paralelizável: Não (depende da estrutura frontend)

## Detalhes de Implementação

### 1. Configuração Jest
```js
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    // Handle module aliases (this will match tsconfig.json paths)
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**/*',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/index.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
```

### 2. Jest Setup File
```js
// jest.setup.js
import '@testing-library/jest-dom'
import { server } from './src/mocks/server'

// Establish API mocking before all tests
beforeAll(() => server.listen())

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => server.resetHandlers())

// Clean up after the tests are finished
afterAll(() => server.close())

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))
```

### 3. Configuração MSW (Mock Service Worker)
```ts
// src/mocks/handlers.ts
import { rest } from 'msw'

export const handlers = [
  // Auth endpoints
  rest.post('/api/v1/auth/sign_in', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          user: {
            id: 1,
            email: 'test@example.com',
            first_name: 'Test',
            last_name: 'User'
          },
          token: 'mock-jwt-token'
        }
      })
    )
  }),

  rest.post('/api/v1/auth/sign_up', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          user: {
            id: 1,
            email: 'test@example.com',
            first_name: 'Test',
            last_name: 'User'
          },
          token: 'mock-jwt-token'
        }
      })
    )
  }),

  // Transactions endpoints
  rest.get('/api/v1/transactions', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: [
          {
            id: 1,
            description: 'Test Transaction',
            amount: '100.00',
            transaction_type: 'expense',
            date: '2024-01-15',
            category: {
              id: 1,
              name: 'Alimentação',
              color: '#ef4444'
            }
          }
        ],
        meta: {
          pagination: {
            current_page: 1,
            total_pages: 1,
            total_count: 1,
            per_page: 20
          }
        }
      })
    )
  }),

  // Dashboard endpoint
  rest.get('/api/v1/dashboard', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          summary: {
            current_month: {
              income: '5500.00',
              expenses: '3200.00',
              balance: '2300.00'
            },
            current_balance: '12500.00'
          },
          recent_transactions: [],
          top_categories: [],
          monthly_evolution: []
        }
      })
    )
  }),

  // Error simulation
  rest.get('/api/v1/error', (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        success: false,
        message: 'Internal server error'
      })
    )
  }),
]

// src/mocks/server.ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// This configures a request mocking server with the given request handlers
export const server = setupServer(...handlers)
```

### 4. Testing Utilities
```tsx
// src/utils/test-utils.tsx
import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  )
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Mock user data for tests
export const mockUser = {
  id: 1,
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User'
}

// Mock transaction data
export const mockTransaction = {
  id: 1,
  description: 'Test Transaction',
  amount: '100.00',
  transaction_type: 'expense' as const,
  date: '2024-01-15',
  category: {
    id: 1,
    name: 'Alimentação',
    color: '#ef4444'
  }
}

// Utility function to create mock API responses
export const createMockApiResponse = <T>(data: T, success = true) => ({
  success,
  data,
  message: success ? 'Success' : 'Error',
})
```

### 5. Exemplos de Testes de Componentes
```tsx
// src/components/ui/Button/Button.test.tsx
import { render, screen, fireEvent } from '@/utils/test-utils'
import { Button } from './Button'

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('shows loading state', () => {
    render(<Button loading>Loading</Button>)

    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByRole('button')).toHaveClass('disabled:opacity-50')
  })

  it('applies variant classes correctly', () => {
    render(<Button variant="danger">Delete</Button>)

    expect(screen.getByRole('button')).toHaveClass('bg-red-600')
  })

  it('applies size classes correctly', () => {
    render(<Button size="sm">Small</Button>)

    expect(screen.getByRole('button')).toHaveClass('px-3 py-2 text-sm')
  })
})
```

### 6. Testes de Hooks
```tsx
// src/hooks/useAuth.test.tsx
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { AuthProvider } from '@/contexts/AuthContext'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  )
}

describe('useAuth', () => {
  it('should start with loading state', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBe(null)
    expect(result.current.token).toBe(null)
  })

  it('should handle login successfully', async () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Test login functionality when implemented
    expect(typeof result.current.login).toBe('function')
    expect(typeof result.current.logout).toBe('function')
  })
})
```

### 7. Testes de Integração
```tsx
// src/app/(auth)/login/login.test.tsx
import { render, screen, fireEvent, waitFor } from '@/utils/test-utils'
import LoginPage from './page'

describe('Login Page', () => {
  it('renders login form', () => {
    render(<LoginPage />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    render(<LoginPage />)

    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(screen.getByText(/email é obrigatório/i)).toBeInTheDocument()
      expect(screen.getByText(/senha é obrigatória/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    })

    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      // Check for successful login behavior
      expect(screen.queryByText(/erro/i)).not.toBeInTheDocument()
    })
  })
})
```

### 8. Package.json Scripts
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --watchAll=false",
    "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@types/jest": "^29.0.0",
    "jest": "^29.0.0",
    "jest-environment-jsdom": "^29.0.0",
    "msw": "^2.0.0"
  }
}
```

## Critérios de Sucesso
- [ ] Jest configurado e funcionando com Next.js 15
- [ ] React Testing Library configurado com custom renders
- [ ] MSW configurado para mock de APIs
- [ ] Coverage reports gerados com threshold 80%+
- [ ] Testes de componentes UI básicos implementados
- [ ] Testes de hooks customizados funcionando
- [ ] Testes de integração de páginas principais
- [ ] Scripts de CI/CD para testes configurados
- [ ] Documentação de padrões de teste criada
- [ ] Pipeline de testes automatizados funcionando

## Configurações de CI/CD

### GitHub Actions
```yaml
# .github/workflows/frontend-tests.yml
name: Frontend Tests

on:
  push:
    branches: [main, develop]
    paths: ['frontend/**']
  pull_request:
    branches: [main]
    paths: ['frontend/**']

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        working-directory: frontend
        run: npm ci

      - name: Run linting
        working-directory: frontend
        run: npm run lint

      - name: Run type checking
        working-directory: frontend
        run: npm run type-check

      - name: Run tests
        working-directory: frontend
        run: npm run test:ci

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: frontend/coverage/lcov.info
          directory: frontend/coverage/
```

## Recursos Necessários
- Desenvolvedor frontend com experiência em testes
- Configuração de CI/CD
- Conhecimento em Jest, RTL e MSW

## Tempo Estimado
- Configuração Jest e RTL: 4-5 horas
- Setup MSW e mocks: 3-4 horas
- Testing utilities e helpers: 2-3 horas
- Testes de componentes base: 4-6 horas
- Testes de integração: 3-4 horas
- CI/CD e documentação: 2-3 horas
- **Total**: 3-4 dias de trabalho