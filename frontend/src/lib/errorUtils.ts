interface ApiError {
  message?: string;
  error?: string;
  errors?: Array<{
    field?: string;
    message?: string;
  } | string>;
}

// Type for translation function
type TranslateFn = (key: string, params?: Record<string, string | number>) => string

/**
 * Creates field translation mappings using the provided translation function
 */
function createFieldTranslations(t: TranslateFn): Record<string, string> {
  return {
    email: t('auth.login.email'),
    password: t('auth.login.password'),
    first_name: t('auth.register.firstName'),
    last_name: t('auth.register.lastName'),
    name: t('categories.fields.name'),
    description: t('transactions.fields.description'),
    amount: t('transactions.fields.amount'),
    date: t('transactions.fields.date'),
    category: t('transactions.fields.category'),
  };
}

/**
 * Creates message translation mappings using the provided translation function
 */
function createMessageTranslations(t: TranslateFn): Record<string, string> {
  return {
    'has already been taken': t('errors.api.alreadyTaken'),
    'is too short': t('errors.api.tooShort'),
    'is invalid': t('errors.api.invalid'),
    "can't be blank": t('errors.api.cantBeBlank'),
    'is required': t('validation.required'),
    'must be positive': t('validation.positiveNumber'),
  };
}

/**
 * Parses API error responses and returns a user-friendly message
 * @param errorData - The error data from the API
 * @param t - The translation function
 * @returns A formatted error message
 */
export function parseApiError(errorData: ApiError, t: TranslateFn): string {
  if (!errorData) {
    return t('errors.network');
  }

  if (errorData.message) {
    return errorData.message;
  }

  if (errorData.error) {
    return errorData.error;
  }

  if (errorData.errors && Array.isArray(errorData.errors)) {
    return formatFieldErrors(errorData.errors, t);
  }

  return t('errors.generic');
}

/**
 * Formats field errors into a readable string
 * @param errors - Array of field errors
 * @param t - The translation function
 * @returns Formatted error message
 */
export function formatFieldErrors(
  errors: Array<{ field?: string; message?: string } | string>,
  t: TranslateFn
): string {
  const fieldTranslations = createFieldTranslations(t);
  const messageTranslations = createMessageTranslations(t);

  const formattedErrors = errors.map(err => {
    if (typeof err === 'object' && err.field && err.message) {
      const fieldName = fieldTranslations[err.field] || err.field;
      const message = messageTranslations[err.message] || err.message;
      return `${fieldName} ${message}`;
    }
    return typeof err === 'object' ? (err.message || t('errors.api.unknown')) : err;
  });

  return formattedErrors.join('. ');
}

/**
 * Gets a user-friendly error message from an HTTP status code
 * @param statusCode - The HTTP status code
 * @param t - The translation function
 * @returns A translated error message
 */
export function getErrorMessageByStatus(statusCode: number, t: TranslateFn): string {
  switch (statusCode) {
    case 401:
      return t('errors.unauthorized');
    case 404:
      return t('errors.notFound');
    case 500:
    case 502:
    case 503:
      return t('errors.serverError');
    default:
      return t('errors.generic');
  }
}
