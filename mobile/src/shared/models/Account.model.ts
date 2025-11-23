/**
 * Account Models
 *
 * Tipos e interfaces para gerenciamento de contas financeiras.
 */

/**
 * Tipos de conta disponíveis
 */
export type AccountType = 'checking' | 'savings' | 'credit_card' | 'cash' | 'investment';

/**
 * Interface da conta financeira
 */
export interface Account {
  id: string;
  name: string;
  account_type: AccountType;
  initial_balance: number;
  current_balance: number;
  icon?: string;
  color?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Dados do formulário de conta
 */
export interface AccountFormData {
  name: string;
  account_type: AccountType;
  initial_balance: number;
  icon?: string;
  color?: string;
}

/**
 * Filtros para listagem de contas
 */
export interface AccountFilters {
  account_type?: AccountType;
  is_active?: boolean;
}

/**
 * Resposta da API para lista de contas
 */
export interface AccountsResponse {
  success: boolean;
  data: Account[];
  meta?: {
    total: number;
    page: number;
    per_page: number;
  };
}

/**
 * Resposta da API para uma conta
 */
export interface AccountResponse {
  success: boolean;
  data: Account;
}

/**
 * Resumo de saldo das contas
 */
export interface AccountsSummary {
  total_balance: number;
  total_income: number;
  total_expense: number;
  accounts_count: number;
}

/**
 * Labels para tipos de conta
 */
export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  checking: 'Conta Corrente',
  savings: 'Poupança',
  credit_card: 'Cartão de Crédito',
  cash: 'Dinheiro',
  investment: 'Investimento',
};

/**
 * Retorna o label do tipo de conta
 */
export function getAccountTypeLabel(type: AccountType): string {
  return ACCOUNT_TYPE_LABELS[type] || type;
}
