interface ApiError {
  message?: string;
  error?: string;
  errors?: Array<{
    field?: string;
    message?: string;
  } | string>;
}

interface FieldMapping {
  [key: string]: string;
}

const fieldTranslations: FieldMapping = {
  email: 'Email',
  password: 'Senha',
  first_name: 'Nome',
  last_name: 'Sobrenome',
};

const messageTranslations: FieldMapping = {
  'has already been taken': 'já está em uso',
  'is too short': 'é muito curto',
  'is invalid': 'é inválido',
  "can't be blank": 'não pode ficar em branco',
};

export function parseApiError(errorData: ApiError): string {
  if (!errorData) {
    return 'Erro de conexão';
  }

  if (errorData.message) {
    return errorData.message;
  }

  if (errorData.error) {
    return errorData.error;
  }

  if (errorData.errors && Array.isArray(errorData.errors)) {
    return formatFieldErrors(errorData.errors);
  }

  return 'Ocorreu um erro inesperado';
}

export function formatFieldErrors(errors: Array<{ field?: string; message?: string } | string>): string {
  const formattedErrors = errors.map(err => {
    if (typeof err === 'object' && err.field && err.message) {
      const fieldName = fieldTranslations[err.field] || err.field;
      const message = messageTranslations[err.message] || err.message;
      return `${fieldName} ${message}`;
    }
    return typeof err === 'object' ? (err.message || 'Erro desconhecido') : err;
  });

  return formattedErrors.join('. ');
}