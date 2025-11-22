---
status: pending
parallelizable: true
blocked_by: []
---

<task_context>
<domain>fullstack/infrastructure</domain>
<type>implementation</type>
<scope>core_feature</scope>
<complexity>medium</complexity>
<dependencies>rails_i18n, next-intl, react_context</dependencies>
<unblocks>""</unblocks>
</task_context>

# Tarefa 31.0: Sistema de Internacionalização (i18n)

## Visão Geral
Implementar sistema completo de internacionalização para suportar múltiplos idiomas (português pt-BR e inglês en-US) tanto no frontend quanto no backend, com seletor de idioma na tela de login e troca em tempo real.

## Requisitos

### Backend (Rails)
- Configurar Rails I18n
- Criar arquivos de tradução (pt-BR.yml, en-US.yml)
- Internacionalizar mensagens de validação
- Internacionalizar mensagens de erro
- Internacionalizar emails e notificações
- Suporte a locale via header Accept-Language
- Endpoint para retornar traduções

### Frontend (Next.js)
- Configurar next-intl ou react-i18next
- Criar arquivos de tradução JSON
- Implementar LanguageSelector com bandeiras
- Posicionar seletor na tela de login
- Context para gerenciar idioma atual
- Persistir preferência de idioma
- Internacionalizar todas as strings da UI
- Formato de data/hora por localidade
- Formato de moeda por localidade
- Troca de idioma em tempo real

## Subtarefas

### Backend
- [ ] 31.1 Configurar Rails I18n
- [ ] 31.2 Criar pt-BR.yml com todas as traduções
- [ ] 31.3 Criar en-US.yml com todas as traduções
- [ ] 31.4 Internacionalizar models (validações)
- [ ] 31.5 Internacionalizar controllers (mensagens)
- [ ] 31.6 Internacionalizar mailers
- [ ] 31.7 Criar endpoint GET /api/v1/locales
- [ ] 31.8 Middleware para detectar locale
- [ ] 31.9 Testes de internacionalização

### Frontend
- [ ] 31.10 Configurar next-intl
- [ ] 31.11 Criar pt-BR.json com traduções
- [ ] 31.12 Criar en-US.json com traduções
- [ ] 31.13 Criar LocaleContext
- [ ] 31.14 Criar LanguageSelector com bandeiras
- [ ] 31.15 Integrar seletor na tela de login
- [ ] 31.16 Internacionalizar todas as páginas
- [ ] 31.17 Configurar formatação de datas
- [ ] 31.18 Configurar formatação de moedas
- [ ] 31.19 Testes de componentes i18n

## Sequenciamento
- Bloqueado por: Nenhum (pode ser executada em paralelo)
- Desbloqueia: -
- Paralelizável: Sim (independente de outras features)

## Detalhes de Implementação

### 1. Configuração Backend Rails

```ruby
# config/application.rb
module FinanceApp
  class Application < Rails::Application
    # Supported locales
    config.i18n.available_locales = [:'pt-BR', :'en-US']
    config.i18n.default_locale = :'pt-BR'
    config.i18n.fallbacks = [:'pt-BR']
    
    # Load translations from subdirectories
    config.i18n.load_path += Dir[Rails.root.join('config', 'locales', '**', '*.{rb,yml}')]
  end
end
```

```ruby
# app/controllers/concerns/localizable.rb
module Localizable
  extend ActiveSupport::Concern

  included do
    around_action :switch_locale
  end

  def switch_locale(&action)
    locale = extract_locale_from_header || I18n.default_locale
    I18n.with_locale(locale, &action)
  end

  private

  def extract_locale_from_header
    locale = request.headers['Accept-Language']&.scan(/^[a-z]{2}/)&.first
    return nil unless locale
    
    case locale
    when 'pt'
      :'pt-BR'
    when 'en'
      :'en-US'
    else
      I18n.default_locale
    end
  end
end
```

### 2. Arquivos de Tradução Backend

```yaml
# config/locales/pt-BR.yml
pt-BR:
  activerecord:
    models:
      user: "Usuário"
      transaction: "Transação"
      category: "Categoria"
      budget: "Orçamento"
      goal: "Meta"
    attributes:
      user:
        email: "E-mail"
        password: "Senha"
        first_name: "Primeiro nome"
        last_name: "Sobrenome"
      transaction:
        description: "Descrição"
        amount: "Valor"
        date: "Data"
        transaction_type: "Tipo"
      category:
        name: "Nome"
        color: "Cor"
      goal:
        name: "Nome da meta"
        target_amount: "Valor alvo"
        target_date: "Data alvo"
    errors:
      messages:
        blank: "não pode ficar em branco"
        invalid: "é inválido"
        taken: "já está em uso"
        too_short: "é muito curto (mínimo: %{count} caracteres)"
        too_long: "é muito longo (máximo: %{count} caracteres)"
        greater_than: "deve ser maior que %{count}"
        greater_than_or_equal_to: "deve ser maior ou igual a %{count}"
  
  controllers:
    auth:
      sign_in:
        success: "Login realizado com sucesso"
        failure: "E-mail ou senha inválidos"
      sign_up:
        success: "Cadastro realizado com sucesso"
        failure: "Erro ao realizar cadastro"
      sign_out:
        success: "Logout realizado com sucesso"
    transactions:
      create:
        success: "Transação criada com sucesso"
        failure: "Erro ao criar transação"
      update:
        success: "Transação atualizada com sucesso"
        failure: "Erro ao atualizar transação"
      destroy:
        success: "Transação excluída com sucesso"
        failure: "Erro ao excluir transação"
    categories:
      create:
        success: "Categoria criada com sucesso"
      update:
        success: "Categoria atualizada com sucesso"
      destroy:
        success: "Categoria excluída com sucesso"
    goals:
      create:
        success: "Meta criada com sucesso"
      update:
        success: "Meta atualizada com sucesso"
      destroy:
        success: "Meta excluída com sucesso"
      contribution:
        success: "Contribuição adicionada com sucesso"
  
  enums:
    transaction:
      transaction_type:
        income: "Receita"
        expense: "Despesa"
        transfer: "Transferência"
    goal:
      goal_type:
        savings: "Poupança"
        debt_payoff: "Quitação de Dívida"
        investment: "Investimento"
        expense_reduction: "Redução de Gastos"
        general: "Geral"
      status:
        active: "Ativa"
        paused: "Pausada"
        completed: "Concluída"
        failed: "Falhada"
        cancelled: "Cancelada"
      priority:
        low: "Baixa"
        medium: "Média"
        high: "Alta"
        urgent: "Urgente"
```

```yaml
# config/locales/en-US.yml
en-US:
  activerecord:
    models:
      user: "User"
      transaction: "Transaction"
      category: "Category"
      budget: "Budget"
      goal: "Goal"
    attributes:
      user:
        email: "Email"
        password: "Password"
        first_name: "First name"
        last_name: "Last name"
      transaction:
        description: "Description"
        amount: "Amount"
        date: "Date"
        transaction_type: "Type"
      category:
        name: "Name"
        color: "Color"
      goal:
        name: "Goal name"
        target_amount: "Target amount"
        target_date: "Target date"
    errors:
      messages:
        blank: "can't be blank"
        invalid: "is invalid"
        taken: "has already been taken"
        too_short: "is too short (minimum: %{count} characters)"
        too_long: "is too long (maximum: %{count} characters)"
        greater_than: "must be greater than %{count}"
        greater_than_or_equal_to: "must be greater than or equal to %{count}"
  
  controllers:
    auth:
      sign_in:
        success: "Successfully signed in"
        failure: "Invalid email or password"
      sign_up:
        success: "Successfully signed up"
        failure: "Sign up failed"
      sign_out:
        success: "Successfully signed out"
    transactions:
      create:
        success: "Transaction created successfully"
        failure: "Failed to create transaction"
      update:
        success: "Transaction updated successfully"
        failure: "Failed to update transaction"
      destroy:
        success: "Transaction deleted successfully"
        failure: "Failed to delete transaction"
    categories:
      create:
        success: "Category created successfully"
      update:
        success: "Category updated successfully"
      destroy:
        success: "Category deleted successfully"
    goals:
      create:
        success: "Goal created successfully"
      update:
        success: "Goal updated successfully"
      destroy:
        success: "Goal deleted successfully"
      contribution:
        success: "Contribution added successfully"
  
  enums:
    transaction:
      transaction_type:
        income: "Income"
        expense: "Expense"
        transfer: "Transfer"
    goal:
      goal_type:
        savings: "Savings"
        debt_payoff: "Debt Payoff"
        investment: "Investment"
        expense_reduction: "Expense Reduction"
        general: "General"
      status:
        active: "Active"
        paused: "Paused"
        completed: "Completed"
        failed: "Failed"
        cancelled: "Cancelled"
      priority:
        low: "Low"
        medium: "Medium"
        high: "High"
        urgent: "Urgent"
```

### 3. Controller de Locales (API)

```ruby
# app/controllers/api/v1/locales_controller.rb
class Api::V1::LocalesController < Api::V1::BaseController
  skip_before_action :authenticate_user!, only: [:index, :show]

  # GET /api/v1/locales
  def index
    locales = I18n.available_locales.map do |locale|
      {
        code: locale.to_s,
        name: I18n.t('locale.name', locale: locale),
        native_name: I18n.t('locale.native_name', locale: locale)
      }
    end

    render json: {
      success: true,
      data: locales,
      default_locale: I18n.default_locale
    }
  end

  # GET /api/v1/locales/:locale
  def show
    locale = params[:id].to_sym
    
    unless I18n.available_locales.include?(locale)
      return render json: {
        success: false,
        message: "Locale not supported"
      }, status: :not_found
    end

    translations = I18n.t('.', locale: locale)

    render json: {
      success: true,
      data: {
        locale: locale,
        translations: translations
      }
    }
  end
end
```

### 4. Configuração Frontend (Next.js com next-intl)

```typescript
// next.config.js
const withNextIntl = require('next-intl/plugin')();

module.exports = withNextIntl({
  // ... other config
});
```

```typescript
// src/i18n.ts
import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['pt-BR', 'en-US'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as Locale)) notFound();

  return {
    messages: (await import(`./locales/${locale}.json`)).default,
  };
});
```

### 5. Arquivos de Tradução Frontend

```json
// src/locales/pt-BR.json
{
  "common": {
    "loading": "Carregando...",
    "save": "Salvar",
    "cancel": "Cancelar",
    "edit": "Editar",
    "delete": "Excluir",
    "confirm": "Confirmar",
    "back": "Voltar",
    "next": "Próximo",
    "search": "Buscar",
    "filter": "Filtrar",
    "clear": "Limpar"
  },
  "auth": {
    "login": {
      "title": "Entrar",
      "email": "E-mail",
      "password": "Senha",
      "submit": "Entrar",
      "forgotPassword": "Esqueceu sua senha?",
      "noAccount": "Não tem uma conta?",
      "signUp": "Cadastre-se",
      "success": "Login realizado com sucesso",
      "error": "E-mail ou senha inválidos"
    },
    "register": {
      "title": "Criar Conta",
      "firstName": "Primeiro Nome",
      "lastName": "Sobrenome",
      "email": "E-mail",
      "password": "Senha",
      "confirmPassword": "Confirmar Senha",
      "submit": "Criar Conta",
      "hasAccount": "Já tem uma conta?",
      "signIn": "Entrar",
      "success": "Conta criada com sucesso",
      "error": "Erro ao criar conta"
    }
  },
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Bem-vindo, {name}",
    "summary": {
      "income": "Receitas",
      "expenses": "Despesas",
      "balance": "Saldo",
      "thisMonth": "Este mês"
    },
    "recentTransactions": "Transações Recentes",
    "topCategories": "Principais Categorias",
    "goals": "Metas Financeiras"
  },
  "transactions": {
    "title": "Transações",
    "new": "Nova Transação",
    "edit": "Editar Transação",
    "delete": "Excluir Transação",
    "deleteConfirm": "Tem certeza que deseja excluir esta transação?",
    "fields": {
      "description": "Descrição",
      "amount": "Valor",
      "date": "Data",
      "type": "Tipo",
      "category": "Categoria"
    },
    "types": {
      "income": "Receita",
      "expense": "Despesa",
      "transfer": "Transferência"
    },
    "noTransactions": "Nenhuma transação encontrada",
    "success": {
      "created": "Transação criada com sucesso",
      "updated": "Transação atualizada com sucesso",
      "deleted": "Transação excluída com sucesso"
    }
  },
  "goals": {
    "title": "Metas Financeiras",
    "new": "Nova Meta",
    "edit": "Editar Meta",
    "delete": "Excluir Meta",
    "fields": {
      "name": "Nome da Meta",
      "description": "Descrição",
      "targetAmount": "Valor Alvo",
      "currentAmount": "Valor Atual",
      "targetDate": "Data Alvo",
      "type": "Tipo de Meta",
      "priority": "Prioridade"
    },
    "types": {
      "savings": "Poupança",
      "debtPayoff": "Quitação de Dívida",
      "investment": "Investimento",
      "expenseReduction": "Redução de Gastos",
      "general": "Geral"
    },
    "priority": {
      "low": "Baixa",
      "medium": "Média",
      "high": "Alta",
      "urgent": "Urgente"
    },
    "status": {
      "active": "Ativa",
      "paused": "Pausada",
      "completed": "Concluída",
      "failed": "Falhada",
      "cancelled": "Cancelada"
    },
    "progress": "Progresso",
    "remaining": "Restante",
    "daysRemaining": "{days} dias restantes",
    "monthlyTarget": "Meta Mensal",
    "onTrack": "No caminho certo",
    "behindSchedule": "Atrasada",
    "addContribution": "Adicionar Contribuição",
    "milestones": "Marcos de Conquista",
    "achievements": "Conquistas"
  },
  "languageSelector": {
    "title": "Idioma",
    "portuguese": "Português (Brasil)",
    "english": "English (USA)",
    "changeLanguage": "Alterar idioma"
  }
}
```

```json
// src/locales/en-US.json
{
  "common": {
    "loading": "Loading...",
    "save": "Save",
    "cancel": "Cancel",
    "edit": "Edit",
    "delete": "Delete",
    "confirm": "Confirm",
    "back": "Back",
    "next": "Next",
    "search": "Search",
    "filter": "Filter",
    "clear": "Clear"
  },
  "auth": {
    "login": {
      "title": "Sign In",
      "email": "Email",
      "password": "Password",
      "submit": "Sign In",
      "forgotPassword": "Forgot your password?",
      "noAccount": "Don't have an account?",
      "signUp": "Sign Up",
      "success": "Successfully signed in",
      "error": "Invalid email or password"
    },
    "register": {
      "title": "Create Account",
      "firstName": "First Name",
      "lastName": "Last Name",
      "email": "Email",
      "password": "Password",
      "confirmPassword": "Confirm Password",
      "submit": "Create Account",
      "hasAccount": "Already have an account?",
      "signIn": "Sign In",
      "success": "Account created successfully",
      "error": "Failed to create account"
    }
  },
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Welcome, {name}",
    "summary": {
      "income": "Income",
      "expenses": "Expenses",
      "balance": "Balance",
      "thisMonth": "This month"
    },
    "recentTransactions": "Recent Transactions",
    "topCategories": "Top Categories",
    "goals": "Financial Goals"
  },
  "transactions": {
    "title": "Transactions",
    "new": "New Transaction",
    "edit": "Edit Transaction",
    "delete": "Delete Transaction",
    "deleteConfirm": "Are you sure you want to delete this transaction?",
    "fields": {
      "description": "Description",
      "amount": "Amount",
      "date": "Date",
      "type": "Type",
      "category": "Category"
    },
    "types": {
      "income": "Income",
      "expense": "Expense",
      "transfer": "Transfer"
    },
    "noTransactions": "No transactions found",
    "success": {
      "created": "Transaction created successfully",
      "updated": "Transaction updated successfully",
      "deleted": "Transaction deleted successfully"
    }
  },
  "goals": {
    "title": "Financial Goals",
    "new": "New Goal",
    "edit": "Edit Goal",
    "delete": "Delete Goal",
    "fields": {
      "name": "Goal Name",
      "description": "Description",
      "targetAmount": "Target Amount",
      "currentAmount": "Current Amount",
      "targetDate": "Target Date",
      "type": "Goal Type",
      "priority": "Priority"
    },
    "types": {
      "savings": "Savings",
      "debtPayoff": "Debt Payoff",
      "investment": "Investment",
      "expenseReduction": "Expense Reduction",
      "general": "General"
    },
    "priority": {
      "low": "Low",
      "medium": "Medium",
      "high": "High",
      "urgent": "Urgent"
    },
    "status": {
      "active": "Active",
      "paused": "Paused",
      "completed": "Completed",
      "failed": "Failed",
      "cancelled": "Cancelled"
    },
    "progress": "Progress",
    "remaining": "Remaining",
    "daysRemaining": "{days} days remaining",
    "monthlyTarget": "Monthly Target",
    "onTrack": "On track",
    "behindSchedule": "Behind schedule",
    "addContribution": "Add Contribution",
    "milestones": "Milestones",
    "achievements": "Achievements"
  },
  "languageSelector": {
    "title": "Language",
    "portuguese": "Português (Brasil)",
    "english": "English (USA)",
    "changeLanguage": "Change language"
  }
}
```

### 6. Context de Localização

```typescript
// src/contexts/LocaleContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export type Locale = 'pt-BR' | 'en-US';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [locale, setLocaleState] = useState<Locale>('pt-BR');

  useEffect(() => {
    // Load saved locale from localStorage
    const savedLocale = localStorage.getItem('locale') as Locale | null;
    if (savedLocale && ['pt-BR', 'en-US'].includes(savedLocale)) {
      setLocaleState(savedLocale);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
    
    // Update document direction if needed
    document.documentElement.lang = newLocale;
    
    // Refresh the page to apply translations
    router.refresh();
  };

  const value = {
    locale,
    setLocale,
    t: (key: string) => key, // Simplified version
  };

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return context;
}
```

### 7. Componente LanguageSelector

```typescript
// src/components/ui/LanguageSelector/LanguageSelector.tsx
'use client';

import { useState } from 'react';
import { useLocale, type Locale } from '@/contexts/LocaleContext';
import { Globe, Check } from 'lucide-react';
import Image from 'next/image';

const languages = [
  {
    code: 'pt-BR' as Locale,
    name: 'Português (Brasil)',
    flag: '🇧🇷',
    flagImage: '/flags/br.svg',
  },
  {
    code: 'en-US' as Locale,
    name: 'English (USA)',
    flag: '🇺🇸',
    flagImage: '/flags/us.svg',
  },
];

export function LanguageSelector() {
  const { locale, setLocale } = useLocale();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find((lang) => lang.code === locale);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Select language"
      >
        <Globe className="w-5 h-5 text-gray-600" />
        <span className="text-2xl">{currentLanguage?.flag}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="py-2">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => {
                    setLocale(language.code);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-2xl">{language.flag}</span>
                  <span className="flex-1 text-left text-sm font-medium text-gray-900">
                    {language.name}
                  </span>
                  {locale === language.code && (
                    <Check className="w-5 h-5 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
```

### 8. Integração na Tela de Login

```typescript
// src/app/auth/login/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { useTranslations } from 'next-intl';

export default function LoginPage() {
  const t = useTranslations('auth.login');
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4">
      {/* Language Selector - Top Right */}
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>

      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">{t('title')}</h2>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('password')}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            {t('submit')}
          </button>
        </form>
      </div>
    </div>
  );
}
```

## Critérios de Sucesso

### Backend
- [ ] Rails I18n configurado corretamente
- [ ] Arquivos pt-BR.yml e en-US.yml completos
- [ ] Todas as mensagens de validação traduzidas
- [ ] Todas as mensagens de erro traduzidas
- [ ] Emails e notificações traduzidos
- [ ] Middleware de locale funcionando
- [ ] Endpoint /api/v1/locales retornando traduções
- [ ] Testes de i18n passando

### Frontend
- [ ] next-intl configurado corretamente
- [ ] Arquivos JSON de tradução completos
- [ ] LocaleContext funcionando
- [ ] LanguageSelector implementado com bandeiras
- [ ] Seletor posicionado na tela de login
- [ ] Todas as páginas internacionalizadas
- [ ] Troca de idioma em tempo real funcionando
- [ ] Preferência de idioma persistida
- [ ] Formatos de data/hora por localidade
- [ ] Formatos de moeda por localidade
- [ ] Testes de componentes i18n passando

## Recursos Necessários
- Desenvolvedor fullstack com experiência em i18n
- Tradutor nativo em inglês (para revisar traduções en-US)
- Tester para validação em ambos os idiomas

## Tempo Estimado
- Configuração backend Rails: 2-3 horas
- Traduções backend (pt-BR + en-US): 4-6 horas
- Middleware e endpoint de locales: 2-3 horas
- Configuração frontend next-intl: 2-3 horas
- Traduções frontend (pt-BR + en-US): 6-8 horas
- LocaleContext e LanguageSelector: 3-4 horas
- Integração na tela de login: 1-2 horas
- Internacionalização de todas as páginas: 8-10 horas
- Formatação de datas e moedas: 2-3 horas
- Testes backend e frontend: 4-6 horas
- **Total**: 5-7 dias de trabalho

## Observações
- Priorizar tradução de strings críticas (autenticação, erros, validações)
- Considerar expansão futura para outros idiomas (espanhol, etc.)
- Garantir que bandeiras e formatações sejam culturalmente apropriadas
- Testar em ambos os idiomas durante desenvolvimento
- Documentar processo de adição de novas traduções
