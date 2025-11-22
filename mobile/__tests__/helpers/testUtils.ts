/**
 * Test Utils
 *
 * Utilitários gerais para testes.
 */

/**
 * Aguarda até que uma condição seja verdadeira
 */
export const waitFor = async (
  callback: () => boolean,
  timeout = 5000,
  interval = 50
): Promise<void> => {
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const check = () => {
      if (callback()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout waiting for condition'));
      } else {
        setTimeout(check, interval);
      }
    };

    check();
  });
};

/**
 * Aguarda um tempo específico
 */
export const wait = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Cria um mock de função que pode ser espionada
 */
export const createMockFn = <T extends (...args: any[]) => any>(): jest.Mock<
  ReturnType<T>,
  Parameters<T>
> => {
  return jest.fn();
};

/**
 * Aguarda até que todos os promises pendentes sejam resolvidos
 */
export const flushPromises = (): Promise<void> => {
  return new Promise((resolve) => setImmediate(resolve));
};

/**
 * Mock de navegação
 */
export const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  setParams: jest.fn(),
  dispatch: jest.fn(),
  setOptions: jest.fn(),
  isFocused: jest.fn(() => true),
  canGoBack: jest.fn(() => true),
  getParent: jest.fn(),
  getState: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
};

/**
 * Mock de route
 */
export const mockRoute = {
  key: 'test-route',
  name: 'TestScreen',
  params: {},
  path: undefined,
};

/**
 * Limpa todos os mocks de navegação
 */
export const clearNavigationMocks = () => {
  Object.values(mockNavigation).forEach((fn) => {
    if (typeof fn === 'function' && 'mockClear' in fn) {
      (fn as jest.Mock).mockClear();
    }
  });
};
