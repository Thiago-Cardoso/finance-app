/**
 * Mock Configuration
 *
 * Enable/disable mock data for development and testing.
 */

/**
 * Mock configuration
 * Set USE_MOCK_DATA to true to use mock data instead of real API
 */
export const MOCK_CONFIG = {
  // Global flag to enable/disable all mocks
  USE_MOCK_DATA: true, // Set to true to enable mocks

  // Individual feature flags
  GOALS: {
    enabled: true, // Set to true to mock goals API
    delay: 500, // Simulated API delay in ms
  },

  BUDGETS: {
    enabled: false,
    delay: 500,
  },

  TRANSACTIONS: {
    enabled: false,
    delay: 500,
  },

  CATEGORIES: {
    enabled: false,
    delay: 500,
  },

  ACCOUNTS: {
    enabled: false,
    delay: 500,
  },
};

/**
 * Check if mocks are enabled globally
 */
export function isMockEnabled(): boolean {
  return MOCK_CONFIG.USE_MOCK_DATA;
}

/**
 * Check if goals mock is enabled
 */
export function isGoalsMockEnabled(): boolean {
  return MOCK_CONFIG.USE_MOCK_DATA && MOCK_CONFIG.GOALS.enabled;
}

/**
 * Get mock delay for goals
 */
export function getGoalsMockDelay(): number {
  return MOCK_CONFIG.GOALS.delay;
}

/**
 * Simulate API delay
 */
export function simulateDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
