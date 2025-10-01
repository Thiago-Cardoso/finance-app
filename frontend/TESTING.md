# Frontend Testing Guide

## Visão Geral

Este projeto utiliza **Jest** e **React Testing Library** para testes de componentes e **MSW (Mock Service Worker)** para mock de APIs.

## Estrutura de Testes

```
frontend/
├── jest.config.js          # Configuração do Jest
├── jest.setup.js           # Setup global dos testes
├── src/
│   ├── mocks/              # MSW handlers para mock de API
│   │   ├── handlers.ts     # Definição dos handlers
│   │   └── server.ts       # Setup do MSW server
│   ├── utils/
│   │   └── test-utils.tsx  # Utilities customizadas para testes
│   └── components/
│       └── ui/
│           ├── Button/
│           │   ├── Button.tsx
│           │   └── Button.test.tsx
│           └── Input/
│               ├── Input.tsx
│               └── Input.test.tsx
```

## Comandos de Teste

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Gerar relatório de coverage
npm run test:coverage

# Executar testes para CI (sem watch, com coverage)
npm run test:ci

# Debug de testes
npm run test:debug
```

## Padrões de Teste

### 1. Importação e Setup

Sempre importe o render customizado de `test-utils`:

```tsx
import { render, screen, fireEvent } from '@/utils/test-utils'
import { MyComponent } from './MyComponent'
```

### 2. Estrutura de Testes de Componentes

```tsx
describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />)
    expect(screen.getByText('Expected text')).toBeInTheDocument()
  })

  it('handles user interactions', () => {
    const handleClick = jest.fn()
    render(<ComponentName onClick={handleClick} />)

    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  describe('variants/props', () => {
    it('applies variant correctly', () => {
      render(<ComponentName variant="primary" />)
      expect(screen.getByRole('button')).toHaveClass('expected-class')
    })
  })
})
```

### 3. Queries Recomendadas (Por Prioridade)

1. **getByRole**: Mais acessível e semântico
   ```tsx
   screen.getByRole('button', { name: /submit/i })
   ```

2. **getByLabelText**: Para form fields
   ```tsx
   screen.getByLabelText(/email/i)
   ```

3. **getByPlaceholderText**: Para inputs sem label visível
   ```tsx
   screen.getByPlaceholderText(/enter email/i)
   ```

4. **getByText**: Para texto geral
   ```tsx
   screen.getByText(/welcome/i)
   ```

5. **getByTestId**: Último recurso
   ```tsx
   screen.getByTestId('custom-element')
   ```

### 4. Testes Assíncronos

Use `waitFor` ou `findBy*` queries para operações assíncronas:

```tsx
it('loads data asynchronously', async () => {
  render(<AsyncComponent />)

  // Usando findBy (automaticamente aguarda)
  const element = await screen.findByText(/loaded data/i)
  expect(element).toBeInTheDocument()

  // Ou usando waitFor
  await waitFor(() => {
    expect(screen.getByText(/loaded data/i)).toBeInTheDocument()
  })
})
```

### 5. Mock de APIs com MSW

#### Definir Handlers Personalizados

```tsx
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'

it('handles API error', async () => {
  // Sobrescrever handler para este teste
  server.use(
    http.get('/api/v1/transactions', () => {
      return HttpResponse.json(
        {
          success: false,
          message: 'Server error',
        },
        { status: 500 }
      )
    })
  )

  render(<TransactionList />)

  await screen.findByText(/error loading transactions/i)
})
```

### 6. Teste de User Interactions

Use `@testing-library/user-event` para interações mais realistas:

```tsx
import userEvent from '@testing-library/user-event'

it('submits form with user input', async () => {
  const user = userEvent.setup()
  render(<LoginForm />)

  await user.type(screen.getByLabelText(/email/i), 'test@example.com')
  await user.type(screen.getByLabelText(/password/i), 'password123')
  await user.click(screen.getByRole('button', { name: /login/i }))

  await screen.findByText(/welcome/i)
})
```

### 7. Teste de Componentes com Context

```tsx
import { render, screen } from '@/utils/test-utils'

it('uses context values', () => {
  // test-utils.tsx já inclui os providers necessários
  render(<ComponentThatUsesContext />)

  expect(screen.getByText(/context value/i)).toBeInTheDocument()
})
```

## Mock de Dados

Use os mocks pré-definidos de `test-utils.tsx`:

```tsx
import { mockUser, mockTransaction, mockCategory } from '@/utils/test-utils'

it('displays user information', () => {
  render(<UserProfile user={mockUser} />)
  expect(screen.getByText(mockUser.email)).toBeInTheDocument()
})
```

## Boas Práticas

### ✅ DO

- Use queries acessíveis (`getByRole`, `getByLabelText`)
- Teste comportamento do usuário, não implementação
- Use `screen` ao invés de desestruturar do render
- Aguarde operações assíncronas com `findBy*` ou `waitFor`
- Agrupe testes relacionados com `describe`
- Use nomes descritivos de testes
- Teste casos de erro além do caminho feliz

```tsx
// ✅ BOM
it('shows error message when email is invalid', async () => {
  const user = userEvent.setup()
  render(<LoginForm />)

  await user.type(screen.getByLabelText(/email/i), 'invalid-email')
  await user.click(screen.getByRole('button', { name: /submit/i }))

  expect(await screen.findByText(/invalid email/i)).toBeInTheDocument()
})
```

### ❌ DON'T

- Não teste detalhes de implementação
- Não use `container.querySelector()` quando houver query melhor
- Não teste classes CSS como proxy para comportamento
- Não acesse state diretamente dos componentes

```tsx
// ❌ RUIM
it('has correct class name', () => {
  const { container } = render(<Button />)
  expect(container.querySelector('.button-primary')).toBeInTheDocument()
})

// ✅ BOM
it('is visible and clickable', () => {
  render(<Button>Click me</Button>)
  const button = screen.getByRole('button', { name: /click me/i })
  expect(button).toBeVisible()
  expect(button).toBeEnabled()
})
```

## Coverage Goals

Mantemos os seguintes thresholds de coverage:

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

Para ver relatório de coverage:

```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## Debugging

### VSCode

Adicione ao `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/frontend/node_modules/.bin/jest",
  "args": ["--runInBand", "${file}"],
  "console": "integratedTerminal"
}
```

### Chrome DevTools

```bash
npm run test:debug
```

Abra `chrome://inspect` e clique em "inspect".

## Troubleshooting

### Teste falhando com "Can't perform a React state update on an unmounted component"

```tsx
// Limpe side effects no unmount
afterEach(() => {
  cleanup()
  jest.clearAllMocks()
})
```

### MSW não interceptando requests

Verifique que:
1. `server.listen()` está no `beforeAll`
2. `server.resetHandlers()` está no `afterEach`
3. URL do request coincide com os handlers

### Timeout em testes assíncronos

Aumente o timeout:

```tsx
it('long operation', async () => {
  // ...
}, 10000) // 10 segundos
```

## Recursos

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [MSW Documentation](https://mswjs.io/)
- [Testing Library Cheatsheet](https://testing-library.com/docs/react-testing-library/cheatsheet)
