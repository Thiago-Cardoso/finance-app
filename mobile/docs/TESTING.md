# Guia de Testes - Mobile App

Este documento descreve as convenções, padrões e melhores práticas para escrever testes no aplicativo mobile.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Estrutura de Testes](#estrutura-de-testes)
- [Executando Testes](#executando-testes)
- [Convenções de Nomenclatura](#convenções-de-nomenclatura)
- [Tipos de Testes](#tipos-de-testes)
- [Mocks e Helpers](#mocks-e-helpers)
- [Boas Práticas](#boas-práticas)
- [Coverage](#coverage)

## Visão Geral

O projeto utiliza:
- **Jest**: Framework de testes
- **React Native Testing Library**: Para testar componentes React Native
- **jest-expo**: Preset do Jest para Expo
- **@testing-library/jest-native**: Matchers adicionais para React Native

### Meta de Coverage

- **Global**: 70% mínimo (branches, functions, lines, statements)
- **ViewModels**: 80%+ (prioridade alta)
- **Services**: 80%+ (prioridade alta)
- **Components**: 60%+ (prioridade média)

## Estrutura de Testes

```
mobile/
├── __mocks__/                 # Mocks globais (axios, etc)
├── __tests__/
│   ├── helpers/               # Helpers de teste reutilizáveis
│   │   ├── mockApi.ts        # Dados fake de API
│   │   ├── mockStores.ts     # Mocks de Zustand stores
│   │   ├── renderWithProviders.tsx
│   │   └── testUtils.ts
│   │
│   ├── unit/                  # Testes unitários
│   │   ├── components/
│   │   ├── viewModels/
│   │   ├── services/
│   │   └── utils/
│   │
│   └── integration/           # Testes de integração
│
├── jest.config.js
└── jest.setup.js
```

## Executando Testes

### Comandos Disponíveis

```bash
# Executar todos os testes
npm test

# Executar em modo watch (re-executa ao salvar)
npm run test:watch

# Executar com coverage
npm run test:coverage

# Executar no CI (sem watch, com coverage)
npm run test:ci
```

### Executar Testes Específicos

```bash
# Por arquivo
npm test Button.test.tsx

# Por padrão
npm test viewModels

# Por describe/it name
npm test -t "should sign in successfully"
```

## Convenções de Nomenclatura

### Arquivos de Teste

- **Padrão**: `NomeDoArquivo.test.tsx` ou `NomeDoArquivo.test.ts`
- **Localização**: Mesmo diretório do código ou em `__tests__/`

Exemplos:
```
src/shared/components/ui/Button.tsx
→ __tests__/unit/components/Button.test.tsx

src/viewModels/useAuth.viewModel.ts
→ __tests__/unit/viewModels/useAuth.viewModel.test.ts
```

### Blocos `describe` e `it`

```typescript
describe('ComponentName', () => {
  describe('methodName', () => {
    it('should do something when condition', () => {
      // Test
    });
  });
});
```

**Boas práticas**:
- Use `describe` para agrupar testes relacionados
- Use `it` com descrições claras em inglês
- Comece com `should` para descrever comportamento esperado

## Tipos de Testes

### 1. Testes de Componentes UI

Testar **comportamento**, não **implementação**.

```typescript
import { fireEvent } from '@testing-library/react-native';
import { Button } from '@/shared/components/ui/Button';
import { renderWithProviders } from '../../helpers/renderWithProviders';

describe('Button Component', () => {
  it('should call onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = renderWithProviders(
      <Button title="Click Me" onPress={onPressMock} />
    );

    fireEvent.press(getByText('Click Me'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});
```

**O que testar**:
- ✅ Props renderizam corretamente
- ✅ Eventos de interação funcionam
- ✅ Estados visuais (loading, disabled, error)
- ✅ Acessibilidade (testID, accessibilityLabel)

**O que NÃO testar**:
- ❌ Estilos CSS específicos
- ❌ Implementação interna
- ❌ Componentes de terceiros

### 2. Testes de ViewModels

ViewModels contêm lógica de negócio - devem ter alta cobertura.

```typescript
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAuthViewModel } from '@/viewModels/useAuth.viewModel';

describe('useAuth ViewModel', () => {
  it('should sign in successfully', async () => {
    const { result } = renderHook(() => useAuthViewModel());

    await act(async () => {
      await result.current.handleSignIn('test@example.com', 'password123');
    });

    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });
});
```

**O que testar**:
- ✅ Todos os métodos públicos
- ✅ Estados (loading, error, success)
- ✅ Chamadas a services
- ✅ Tratamento de erros
- ✅ Side effects

### 3. Testes de Services

Services fazem chamadas de API - mockar axios.

```typescript
import axios from 'axios';
import * as authService from '@/shared/services/api/auth.service';
import { mockAuthResponse, createSuccessResponse } from '../../helpers/mockApi';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Auth Service', () => {
  it('should sign in successfully', async () => {
    mockedAxios.post.mockResolvedValue(createSuccessResponse(mockAuthResponse));

    const result = await authService.signIn({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(mockedAxios.post).toHaveBeenCalledWith('/auth/login', {
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result).toEqual(mockAuthResponse);
  });
});
```

**O que testar**:
- ✅ Chamadas corretas de API
- ✅ Resposta de sucesso
- ✅ Tratamento de erros (400, 401, 500)
- ✅ Transformação de dados

## Mocks e Helpers

### Usando `renderWithProviders`

Sempre use `renderWithProviders` ao invés de `render` direto:

```typescript
import { renderWithProviders } from '../../helpers/renderWithProviders';

const { getByText } = renderWithProviders(<MyComponent />);
```

Isso garante que componentes tenham acesso a:
- NavigationContainer
- SafeAreaProvider
- Outros providers necessários

### Mocks de Stores

```typescript
import { createMockAuthStore } from '../../helpers/mockStores';

jest.mock('@/shared/stores/authStore', () => ({
  useAuthStore: () => createMockAuthStore({
    isAuthenticated: true,
    user: mockUser,
  }),
}));
```

### Mocks de API

```typescript
import { mockAuthResponse, mockUser, mockApiError } from '../../helpers/mockApi';

mockedAxios.post.mockResolvedValue(createSuccessResponse(mockAuthResponse));
mockedAxios.get.mockRejectedValue(mockApiError);
```

## Boas Práticas

### 1. AAA Pattern (Arrange, Act, Assert)

```typescript
it('should do something', () => {
  // Arrange: Setup
  const onPress = jest.fn();
  const { getByText } = renderWithProviders(<Button onPress={onPress} />);

  // Act: Execute
  fireEvent.press(getByText('Click'));

  // Assert: Verify
  expect(onPress).toHaveBeenCalled();
});
```

### 2. Limpar Mocks

```typescript
describe('MyTests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // tests...
});
```

### 3. Usar `waitFor` para Assíncronas

```typescript
it('should load data', async () => {
  const { getByText } = renderWithProviders(<MyComponent />);

  await waitFor(() => {
    expect(getByText('Data loaded')).toBeTruthy();
  });
});
```

### 4. Testar Comportamento, Não Implementação

```typescript
// ❌ Ruim: testa implementação
expect(component.state.count).toBe(1);

// ✅ Bom: testa comportamento
expect(getByText('Count: 1')).toBeTruthy();
```

### 5. Use `data-testid` com Moderação

```typescript
// ✅ Prefira queries semânticas
getByText('Submit');
getByRole('button');

// ⚠️ Use testID apenas quando necessário
getByTestId('submit-button');
```

## Coverage

### Visualizar Coverage

```bash
npm run test:coverage
```

O relatório HTML estará em: `coverage/lcov-report/index.html`

### Threshold no CI

O CI falhará se o coverage for < 70% em qualquer categoria:
- Branches
- Functions
- Lines
- Statements

### Ignorar Arquivos

Arquivos já ignorados no coverage (ver `jest.config.js`):
- `*.d.ts`
- `*.test.{ts,tsx}`
- `__tests__/**`
- `types.ts`
- `App.tsx`

## Troubleshooting

### Testes Lentos

- Use `jest.mock()` para mockar módulos pesados
- Evite renderizar toda a árvore de componentes
- Use `--maxWorkers=2` no CI

### Erros de Timeout

```typescript
jest.setTimeout(10000); // 10s
```

### Mock não Funciona

Verifique se o mock está **antes** do import:

```typescript
jest.mock('@/shared/stores/authStore');
import { useAuthStore } from '@/shared/stores/authStore';
```

## Recursos

- [Jest Docs](https://jestjs.io/)
- [Testing Library Docs](https://testing-library.com/docs/react-native-testing-library/intro/)
- [Testing Expo Apps](https://docs.expo.dev/develop/unit-testing/)

---

**Atualizado em**: 2025-11-17
