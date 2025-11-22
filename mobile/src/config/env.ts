export const ENV = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
  API_VERSION: process.env.EXPO_PUBLIC_API_VERSION || 'v1',
  API_TIMEOUT: Number(process.env.EXPO_PUBLIC_API_TIMEOUT) || 30000,
  ENV: process.env.EXPO_PUBLIC_ENV || 'development',
  ENABLE_ANALYTICS: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === 'true',
  ENABLE_SENTRY: process.env.EXPO_PUBLIC_ENABLE_SENTRY === 'true',
  APP_NAME: process.env.EXPO_PUBLIC_APP_NAME || 'FinanceApp',
  APP_VERSION: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
} as const;

export const isDevelopment = ENV.ENV === 'development';
export const isProduction = ENV.ENV === 'production';
