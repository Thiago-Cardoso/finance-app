# Especificação Técnica - Aplicativo de Controle Financeiro Pessoal

## 1. Visão Geral da Arquitetura

### 1.1 Arquitetura do Sistema
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │     Backend      │    │   Database      │
│   Next.js 15    │◄──►│   Rails 8 API    │◄──►│  PostgreSQL     │
│   TailwindCSS   │    │      + JWT       │    │   (Supabase)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   CDN/Vercel    │    │   Redis/Sidekiq  │    │    Backups      │
│   Static Assets │    │ Background Jobs  │    │   Automated     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────▼───────────────────────┘
                    ┌──────────────────┐
                    │   AWS ECS        │
                    │   Fargate        │
                    │   (Production)   │
                    └──────────────────┘
```

### 1.2 Princípios Arquiteturais
- **Separação de Responsabilidades**: Backend API separado do Frontend SPA
- **API-First**: Backend serve apenas APIs RESTful
- **Stateless**: Autenticação via JWT tokens
- **Scalable**: Arquitetura preparada para escala horizontal
- **Secure**: Segurança em todas as camadas
- **Testable**: Cobertura de testes abrangente

### 1.3 Stack Tecnológica

#### Backend
- **Runtime**: Ruby 3.2+
- **Framework**: Ruby on Rails 8 (API-only mode)
- **Database**: PostgreSQL 15+ (Supabase)
- **Authentication**: Devise + JWT
- **Background Jobs**: Sidekiq + Redis
- **Testing**: RSpec + FactoryBot
- **Documentation**: Swagger/OpenAPI

#### Frontend
- **Runtime**: Node.js 18+
- **Framework**: Next.js 15 (App Router)
- **Styling**: TailwindCSS
- **State Management**: React Context + React Query
- **Testing**: Jest + React Testing Library
- **Build**: Next.js Build System

#### DevOps & Infrastructure
- **Containerization**: Docker + Docker Compose
- **Orchestration**: AWS ECS Fargate
- **CI/CD**: GitHub Actions
- **Monitoring**: CloudWatch + Application Insights
- **CDN**: CloudFront ou Vercel

## 2. Schema do Banco de Dados

### 2.1 Diagrama ER
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      users      │    │   categories    │    │  transactions   │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ email           │    │ name            │    │ description     │
│ encrypted_pwd   │    │ color           │    │ amount          │
│ first_name      │    │ user_id (FK)    │    │ transaction_type│
│ last_name       │    │ is_default      │    │ date            │
│ created_at      │    │ created_at      │    │ user_id (FK)    │
│ updated_at      │    │ updated_at      │    │ category_id (FK)│
│ jti             │    └─────────────────┘    │ account_id (FK) │
└─────────────────┘                           │ created_at      │
         │                                    │ updated_at      │
         │                                    └─────────────────┘
         │              ┌─────────────────┐           │
         │              │    budgets      │           │
         │              ├─────────────────┤           │
         │              │ id (PK)         │           │
         │              │ category_id(FK) │           │
         │              │ user_id (FK)    │           │
         │              │ amount_limit    │           │
         │              │ period          │           │
         │              │ start_date      │           │
         │              │ end_date        │           │
         └──────────────┤ created_at      │───────────┘
                        │ updated_at      │
                        └─────────────────┘

         ┌─────────────────┐    ┌─────────────────┐
         │    accounts     │    │      goals      │
         ├─────────────────┤    ├─────────────────┤
         │ id (PK)         │    │ id (PK)         │
         │ name            │    │ title           │
         │ account_type    │    │ target_amount   │
         │ initial_balance │    │ current_amount  │
         │ user_id (FK)    │    │ target_date     │
         │ is_active       │    │ user_id (FK)    │
         │ created_at      │    │ created_at      │
         │ updated_at      │    │ updated_at      │
         └─────────────────┘    └─────────────────┘
```

### 2.2 Especificação das Tabelas

#### users
```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  encrypted_password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  jti VARCHAR(255) NOT NULL UNIQUE, -- JWT identifier
  reset_password_token VARCHAR(255),
  reset_password_sent_at TIMESTAMP,
  remember_created_at TIMESTAMP,
  confirmation_token VARCHAR(255),
  confirmed_at TIMESTAMP,
  confirmation_sent_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX index_users_on_email ON users (email);
CREATE INDEX index_users_on_jti ON users (jti);
CREATE INDEX index_users_on_reset_password_token ON users (reset_password_token);
CREATE INDEX index_users_on_confirmation_token ON users (confirmation_token);
```

#### categories
```sql
CREATE TYPE category_type AS ENUM ('income', 'expense');

CREATE TABLE categories (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) NOT NULL DEFAULT '#6366f1', -- Hex color
  icon VARCHAR(50), -- Icon identifier
  category_type category_type NOT NULL DEFAULT 'expense',
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX index_categories_on_user_id ON categories (user_id);
CREATE INDEX index_categories_on_category_type ON categories (category_type);
CREATE UNIQUE INDEX index_categories_on_user_and_name ON categories (user_id, name) WHERE user_id IS NOT NULL;
```

#### accounts
```sql
CREATE TYPE account_type AS ENUM ('checking', 'savings', 'credit_card', 'investment', 'cash');

CREATE TABLE accounts (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  account_type account_type NOT NULL,
  initial_balance DECIMAL(12,2) DEFAULT 0.00,
  current_balance DECIMAL(12,2) DEFAULT 0.00,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX index_accounts_on_user_id ON accounts (user_id);
CREATE INDEX index_accounts_on_account_type ON accounts (account_type);
```

#### transactions
```sql
CREATE TYPE transaction_type AS ENUM ('income', 'expense', 'transfer');

CREATE TABLE transactions (
  id BIGSERIAL PRIMARY KEY,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  transaction_type transaction_type NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  account_id BIGINT REFERENCES accounts(id) ON DELETE SET NULL,
  transfer_account_id BIGINT REFERENCES accounts(id) ON DELETE SET NULL, -- For transfers
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX index_transactions_on_user_id ON transactions (user_id);
CREATE INDEX index_transactions_on_category_id ON transactions (category_id);
CREATE INDEX index_transactions_on_account_id ON transactions (account_id);
CREATE INDEX index_transactions_on_date ON transactions (date);
CREATE INDEX index_transactions_on_transaction_type ON transactions (transaction_type);
CREATE INDEX index_transactions_on_user_date ON transactions (user_id, date);
```

#### budgets
```sql
CREATE TYPE budget_period AS ENUM ('monthly', 'quarterly', 'yearly');

CREATE TABLE budgets (
  id BIGSERIAL PRIMARY KEY,
  category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_limit DECIMAL(12,2) NOT NULL,
  period budget_period NOT NULL DEFAULT 'monthly',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX index_budgets_on_user_id ON budgets (user_id);
CREATE INDEX index_budgets_on_category_id ON budgets (category_id);
CREATE INDEX index_budgets_on_period ON budgets (period);
CREATE UNIQUE INDEX index_budgets_on_user_category_period ON budgets (user_id, category_id, period, start_date);
```

#### goals
```sql
CREATE TABLE goals (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_amount DECIMAL(12,2) NOT NULL,
  current_amount DECIMAL(12,2) DEFAULT 0.00,
  target_date DATE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_achieved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX index_goals_on_user_id ON goals (user_id);
CREATE INDEX index_goals_on_target_date ON goals (target_date);
```

### 2.3 Seeds e Dados Iniciais
```sql
-- Categorias padrão para todos os usuários
INSERT INTO categories (name, color, icon, category_type, is_default) VALUES
('Alimentação', '#ef4444', 'utensils', 'expense', true),
('Transporte', '#3b82f6', 'car', 'expense', true),
('Saúde', '#10b981', 'heart', 'expense', true),
('Educação', '#8b5cf6', 'graduation-cap', 'expense', true),
('Lazer', '#f59e0b', 'gamepad-2', 'expense', true),
('Moradia', '#6b7280', 'home', 'expense', true),
('Roupas', '#ec4899', 'shirt', 'expense', true),
('Outros', '#6b7280', 'more-horizontal', 'expense', true),
('Salário', '#10b981', 'briefcase', 'income', true),
('Freelance', '#3b82f6', 'laptop', 'income', true),
('Investimentos', '#8b5cf6', 'trending-up', 'income', true),
('Outros', '#6b7280', 'plus', 'income', true);
```

## 3. Especificação da API

### 3.1 Autenticação e Headers

#### Headers Obrigatórios
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
Accept: application/json
```

#### Estrutura de Resposta Padrão
```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "meta": {
    "pagination": {
      "current_page": 1,
      "total_pages": 10,
      "total_count": 100,
      "per_page": 10
    }
  }
}
```

#### Estrutura de Erro Padrão
```json
{
  "success": false,
  "errors": [
    {
      "field": "email",
      "message": "can't be blank"
    }
  ],
  "message": "Validation failed"
}
```

### 3.2 Endpoints da API

#### Autenticação
```
POST /api/v1/auth/sign_up
POST /api/v1/auth/sign_in
DELETE /api/v1/auth/sign_out
POST /api/v1/auth/password/reset
PUT /api/v1/auth/password/update
```

**POST /api/v1/auth/sign_up**
```json
// Request
{
  "user": {
    "email": "user@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "first_name": "John",
    "last_name": "Doe"
  }
}

// Response 201
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**POST /api/v1/auth/sign_in**
```json
// Request
{
  "user": {
    "email": "user@example.com",
    "password": "password123"
  }
}

// Response 200
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Dashboard
```
GET /api/v1/dashboard
```

**GET /api/v1/dashboard**
```json
// Response 200
{
  "success": true,
  "data": {
    "summary": {
      "current_month": {
        "income": "5500.00",
        "expenses": "3200.00",
        "balance": "2300.00"
      },
      "current_balance": "12500.00"
    },
    "recent_transactions": [
      {
        "id": 1,
        "description": "Supermercado",
        "amount": "-150.00",
        "date": "2024-01-15",
        "category": {
          "id": 1,
          "name": "Alimentação",
          "color": "#ef4444"
        }
      }
    ],
    "top_categories": [
      {
        "category": "Alimentação",
        "amount": "800.00",
        "percentage": 25
      }
    ],
    "monthly_evolution": [
      {
        "month": "2024-01",
        "income": "5500.00",
        "expenses": "3200.00"
      }
    ]
  }
}
```

#### Transações
```
GET /api/v1/transactions
POST /api/v1/transactions
GET /api/v1/transactions/:id
PUT /api/v1/transactions/:id
DELETE /api/v1/transactions/:id
```

**GET /api/v1/transactions**
```
Query Parameters:
- page: número da página (default: 1)
- per_page: itens por página (default: 20, max: 100)
- category_id: filtrar por categoria
- transaction_type: income|expense|transfer
- date_from: data inicial (YYYY-MM-DD)
- date_to: data final (YYYY-MM-DD)
- search: buscar na descrição
- account_id: filtrar por conta
```

```json
// Response 200
{
  "success": true,
  "data": [
    {
      "id": 1,
      "description": "Supermercado Extra",
      "amount": "-150.00",
      "transaction_type": "expense",
      "date": "2024-01-15",
      "notes": "Compras da semana",
      "category": {
        "id": 1,
        "name": "Alimentação",
        "color": "#ef4444"
      },
      "account": {
        "id": 1,
        "name": "Conta Corrente",
        "account_type": "checking"
      },
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_count": 95,
      "per_page": 20
    }
  }
}
```

**POST /api/v1/transactions**
```json
// Request
{
  "transaction": {
    "description": "Salário Janeiro",
    "amount": "5500.00",
    "transaction_type": "income",
    "date": "2024-01-01",
    "notes": "Salário do mês",
    "category_id": 9,
    "account_id": 1
  }
}

// Response 201
{
  "success": true,
  "data": {
    "id": 2,
    "description": "Salário Janeiro",
    "amount": "5500.00",
    "transaction_type": "income",
    "date": "2024-01-01",
    "notes": "Salário do mês",
    "category": {
      "id": 9,
      "name": "Salário",
      "color": "#10b981"
    },
    "account": {
      "id": 1,
      "name": "Conta Corrente",
      "account_type": "checking"
    }
  }
}
```

#### Categorias
```
GET /api/v1/categories
POST /api/v1/categories
PUT /api/v1/categories/:id
DELETE /api/v1/categories/:id
```

#### Contas
```
GET /api/v1/accounts
POST /api/v1/accounts
PUT /api/v1/accounts/:id
DELETE /api/v1/accounts/:id
GET /api/v1/accounts/:id/balance
```

#### Orçamentos
```
GET /api/v1/budgets
POST /api/v1/budgets
PUT /api/v1/budgets/:id
DELETE /api/v1/budgets/:id
GET /api/v1/budgets/current
```

#### Metas
```
GET /api/v1/goals
POST /api/v1/goals
PUT /api/v1/goals/:id
DELETE /api/v1/goals/:id
```

#### Relatórios
```
GET /api/v1/reports/monthly
GET /api/v1/reports/category
GET /api/v1/reports/cash_flow
GET /api/v1/reports/export
```

### 3.3 Rate Limiting
- **Geral**: 1000 requests/hour por usuário
- **Autenticação**: 10 requests/minuto por IP
- **Exportação**: 5 requests/minuto por usuário

### 3.4 Códigos de Status HTTP
- **200**: OK - Sucesso
- **201**: Created - Recurso criado
- **204**: No Content - Sucesso sem conteúdo
- **400**: Bad Request - Dados inválidos
- **401**: Unauthorized - Token inválido/expirado
- **403**: Forbidden - Sem permissão
- **404**: Not Found - Recurso não encontrado
- **422**: Unprocessable Entity - Validação falhou
- **429**: Too Many Requests - Rate limit excedido
- **500**: Internal Server Error - Erro interno

## 4. Estrutura do Frontend

### 4.1 Arquitetura de Componentes

```
src/
├── app/                    # Next.js 15 App Router
│   ├── (auth)/            # Auth group
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/
│   ├── transactions/
│   ├── categories/
│   ├── budgets/
│   ├── reports/
│   ├── settings/
│   ├── layout.tsx         # Root layout
│   ├── loading.tsx        # Global loading
│   ├── error.tsx          # Global error
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Modal/
│   │   ├── Table/
│   │   └── Chart/
│   ├── forms/            # Form components
│   │   ├── TransactionForm/
│   │   ├── CategoryForm/
│   │   └── BudgetForm/
│   ├── charts/           # Chart components
│   │   ├── IncomeExpenseChart/
│   │   ├── CategoryPieChart/
│   │   └── BalanceEvolutionChart/
│   └── layout/           # Layout components
│       ├── Header/
│       ├── Sidebar/
│       └── Footer/
├── lib/                  # Utilities and configurations
│   ├── auth.ts           # Auth utilities
│   ├── api.ts            # API client
│   ├── utils.ts          # General utilities
│   ├── validations.ts    # Form validations
│   └── constants.ts      # App constants
├── hooks/                # Custom React hooks
│   ├── useAuth.ts
│   ├── useTransactions.ts
│   ├── useCategories.ts
│   └── useDashboard.ts
├── contexts/             # React contexts
│   ├── AuthContext.tsx
│   ├── ThemeContext.tsx
│   └── NotificationContext.tsx
├── types/                # TypeScript types
│   ├── auth.ts
│   ├── transaction.ts
│   ├── category.ts
│   └── api.ts
└── styles/               # Global styles
    ├── globals.css
    └── components.css
```

### 4.2 Componentes Base (UI Kit)

#### Button Component
```tsx
// components/ui/Button/Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  children,
  ...props
}) => {
  const baseClasses = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2';

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? <Spinner size="sm" /> : children}
    </button>
  );
};
```

#### Input Component
```tsx
// components/ui/Input/Input.tsx
interface InputProps {
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'date';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  ...props
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`
          w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
        `}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};
```

### 4.3 Contextos e Estado Global

#### AuthContext
```tsx
// contexts/AuthContext.tsx
interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setToken(storedToken);
      // Validate token and get user data
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/sign_in', { user: { email, password } });
      const { user, token } = response.data.data;

      setUser(user);
      setToken(token);
      localStorage.setItem('auth_token', token);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 4.4 Custom Hooks

#### useTransactions
```tsx
// hooks/useTransactions.ts
export const useTransactions = () => {
  const { user } = useAuth();

  const {
    data: transactions,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: () => api.get('/transactions'),
    enabled: !!user
  });

  const createTransactionMutation = useMutation({
    mutationFn: (data: CreateTransactionData) => api.post('/transactions', { transaction: data }),
    onSuccess: () => {
      queryClient.invalidateQueries(['transactions']);
      queryClient.invalidateQueries(['dashboard']);
    }
  });

  const updateTransactionMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: UpdateTransactionData }) =>
      api.put(`/transactions/${id}`, { transaction: data }),
    onSuccess: () => {
      queryClient.invalidateQueries(['transactions']);
      queryClient.invalidateQueries(['dashboard']);
    }
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/transactions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['transactions']);
      queryClient.invalidateQueries(['dashboard']);
    }
  });

  return {
    transactions: transactions?.data || [],
    isLoading,
    error,
    refetch,
    createTransaction: createTransactionMutation.mutate,
    updateTransaction: updateTransactionMutation.mutate,
    deleteTransaction: deleteTransactionMutation.mutate,
    isCreating: createTransactionMutation.isLoading,
    isUpdating: updateTransactionMutation.isLoading,
    isDeleting: deleteTransactionMutation.isLoading
  };
};
```

### 4.5 Roteamento e Proteção

#### Layout Principal
```tsx
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ThemeProvider>
              <NotificationProvider>
                {children}
              </NotificationProvider>
            </ThemeProvider>
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
}
```

#### Middleware de Autenticação
```tsx
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
                     request.nextUrl.pathname.startsWith('/register');

  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

## 5. Configuração de Deploy e CI/CD

### 5.1 Docker Configuration

#### Backend Dockerfile
```dockerfile
# Dockerfile.backend
FROM ruby:3.2-alpine

RUN apk add --no-cache \
  build-base \
  postgresql-dev \
  git \
  tzdata

WORKDIR /app

COPY Gemfile Gemfile.lock ./
RUN bundle install --without development test

COPY . .

RUN bundle exec rails assets:precompile

EXPOSE 3000

CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0"]
```

#### Frontend Dockerfile
```dockerfile
# Dockerfile.frontend
FROM node:18-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
```

#### Docker Compose para Desenvolvimento
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: finance_app_development
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    volumes:
      - ./backend:/app
      - gems:/usr/local/bundle
    ports:
      - "3001:3000"
    environment:
      DATABASE_URL: postgresql://postgres:password@postgres:5432/finance_app_development
      REDIS_URL: redis://redis:6379/0
      JWT_SECRET: your_jwt_secret_here
    depends_on:
      - postgres
      - redis

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001/api/v1
    depends_on:
      - backend

  sidekiq:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    command: bundle exec sidekiq
    volumes:
      - ./backend:/app
      - gems:/usr/local/bundle
    environment:
      DATABASE_URL: postgresql://postgres:password@postgres:5432/finance_app_development
      REDIS_URL: redis://redis:6379/0
    depends_on:
      - postgres
      - redis

volumes:
  postgres_data:
  redis_data:
  gems:
```

### 5.2 GitHub Actions CI/CD

#### Backend CI/CD
```yaml
# .github/workflows/backend.yml
name: Backend CI/CD

on:
  push:
    branches: [main, develop]
    paths: ['backend/**']
  pull_request:
    branches: [main]
    paths: ['backend/**']

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: password
          POSTGRES_DB: finance_app_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: 3.2
          bundler-cache: true
          working-directory: backend

      - name: Setup database
        working-directory: backend
        env:
          DATABASE_URL: postgresql://postgres:password@localhost:5432/finance_app_test
          RAILS_ENV: test
        run: |
          bundle exec rails db:create
          bundle exec rails db:schema:load

      - name: Run tests
        working-directory: backend
        env:
          DATABASE_URL: postgresql://postgres:password@localhost:5432/finance_app_test
          REDIS_URL: redis://localhost:6379/0
          RAILS_ENV: test
        run: |
          bundle exec rspec --format documentation

      - name: Run security audit
        working-directory: backend
        run: |
          bundle exec bundle-audit
          bundle exec brakeman -z

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build and push Docker image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: finance-app-backend
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG ./backend
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG

      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster finance-app-cluster \
            --service backend-service \
            --force-new-deployment
```

#### Frontend CI/CD
```yaml
# .github/workflows/frontend.yml
name: Frontend CI/CD

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
        run: npm test -- --coverage

      - name: Build application
        working-directory: frontend
        run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

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

      - name: Build application
        working-directory: frontend
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.PRODUCTION_API_URL }}
        run: npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: frontend
          vercel-args: '--prod'
```

### 5.3 AWS ECS Task Definition

```json
{
  "family": "finance-app-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/finance-app-backend:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "RAILS_ENV",
          "value": "production"
        },
        {
          "name": "RAILS_LOG_TO_STDOUT",
          "value": "true"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT:secret:finance-app/database-url"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT:secret:finance-app/jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/finance-app-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3
      }
    }
  ]
}
```

## 6. Configurações de Segurança

### 6.1 Autenticação JWT

#### Configuração Rails
```ruby
# config/initializers/jwt.rb
require 'jwt'

module JwtAuth
  JWT_SECRET = Rails.application.credentials.jwt_secret
  JWT_ALGORITHM = 'HS256'

  def self.encode(payload, expiration = 24.hours.from_now)
    payload[:exp] = expiration.to_i
    JWT.encode(payload, JWT_SECRET, JWT_ALGORITHM)
  end

  def self.decode(token)
    decoded = JWT.decode(token, JWT_SECRET, true, { algorithm: JWT_ALGORITHM })
    decoded[0]
  rescue JWT::DecodeError
    nil
  end
end
```

#### JWT Controller Concern
```ruby
# app/controllers/concerns/authenticable.rb
module Authenticable
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_user!
  end

  private

  def authenticate_user!
    header = request.headers['Authorization']
    return render_unauthorized unless header

    token = header.split(' ').last
    decoded = JwtAuth.decode(token)
    return render_unauthorized unless decoded

    @current_user = User.find_by(id: decoded['user_id'], jti: decoded['jti'])
    render_unauthorized unless @current_user
  rescue JWT::ExpiredSignature
    render json: { error: 'Token expired' }, status: :unauthorized
  end

  def current_user
    @current_user
  end

  def render_unauthorized
    render json: { error: 'Unauthorized' }, status: :unauthorized
  end
end
```

### 6.2 Configurações de Segurança Rails

```ruby
# config/application.rb
config.force_ssl = true # Production only
config.middleware.use Rack::Attack

# CORS configuration
config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins Rails.env.production? ? ['https://yourapp.com'] : ['http://localhost:3000']
    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true
  end
end
```

```ruby
# config/initializers/rack_attack.rb
class Rack::Attack
  # Rate limiting por IP
  throttle('requests by ip', limit: 1000, period: 1.hour) do |request|
    request.ip
  end

  # Rate limiting para login
  throttle('login attempts', limit: 10, period: 1.minute) do |request|
    if request.path == '/api/v1/auth/sign_in' && request.post?
      request.ip
    end
  end

  # Rate limiting para signup
  throttle('signup attempts', limit: 5, period: 1.hour) do |request|
    if request.path == '/api/v1/auth/sign_up' && request.post?
      request.ip
    end
  end
end
```

### 6.3 Configurações de Headers de Segurança

```ruby
# config/application.rb
config.force_ssl = true if Rails.env.production?

# Security headers
config.middleware.use Rack::Deflater
config.middleware.use Secure::Headers::Middleware

# config/initializers/secure_headers.rb
SecureHeaders::Configuration.default do |config|
  config.hsts = "max-age=#{1.year.to_i}; includeSubdomains"
  config.x_frame_options = "DENY"
  config.x_content_type_options = "nosniff"
  config.x_xss_protection = "1; mode=block"
  config.x_download_options = "noopen"
  config.x_permitted_cross_domain_policies = "none"
  config.referrer_policy = %w(origin-when-cross-origin strict-origin-when-cross-origin)

  config.csp = {
    default_src: %w('self'),
    script_src: %w('self' 'unsafe-inline'),
    style_src: %w('self' 'unsafe-inline'),
    img_src: %w('self' data: https:),
    font_src: %w('self' data:),
    connect_src: %w('self'),
    object_src: %w('none'),
    media_src: %w('self'),
    frame_src: %w('none'),
    base_uri: %w('self')
  }
end
```

### 6.4 Validações e Sanitização

```ruby
# app/models/user.rb
class User < ApplicationRecord
  devise :database_authenticatable, :registerable, :validatable

  validates :first_name, presence: true, length: { maximum: 100 }
  validates :last_name, presence: true, length: { maximum: 100 }
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }

  before_create :generate_jti

  private

  def generate_jti
    self.jti = SecureRandom.uuid
  end
end
```

```ruby
# app/models/transaction.rb
class Transaction < ApplicationRecord
  belongs_to :user
  belongs_to :category, optional: true
  belongs_to :account, optional: true

  validates :description, presence: true, length: { maximum: 255 }
  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :transaction_type, inclusion: { in: %w[income expense transfer] }
  validates :date, presence: true

  scope :for_user, ->(user) { where(user: user) }
  scope :in_period, ->(start_date, end_date) { where(date: start_date..end_date) }
  scope :by_type, ->(type) { where(transaction_type: type) }

  before_save :sanitize_description

  private

  def sanitize_description
    self.description = ActionController::Base.helpers.sanitize(description)
  end
end
```

## 7. Plano de Testes

### 7.1 Estrutura de Testes Backend (RSpec)

```ruby
# spec/rails_helper.rb
require 'spec_helper'
require 'rspec/rails'
require 'factory_bot_rails'
require 'shoulda/matchers'

RSpec.configure do |config|
  config.include FactoryBot::Syntax::Methods
  config.include RequestSpecHelper, type: :request

  config.before(:suite) do
    DatabaseCleaner.strategy = :transaction
    DatabaseCleaner.clean_with(:truncation)
  end

  config.around(:each) do |example|
    DatabaseCleaner.cleaning do
      example.run
    end
  end
end
```

#### Factories
```ruby
# spec/factories/users.rb
FactoryBot.define do
  factory :user do
    email { Faker::Internet.email }
    password { 'password123' }
    password_confirmation { 'password123' }
    first_name { Faker::Name.first_name }
    last_name { Faker::Name.last_name }

    trait :with_transactions do
      after(:create) do |user|
        create_list(:transaction, 5, user: user)
      end
    end
  end
end

# spec/factories/transactions.rb
FactoryBot.define do
  factory :transaction do
    association :user
    association :category
    association :account

    description { Faker::Lorem.sentence }
    amount { Faker::Number.decimal(l_digits: 3, r_digits: 2) }
    transaction_type { %w[income expense].sample }
    date { Faker::Date.recent }

    trait :income do
      transaction_type { 'income' }
    end

    trait :expense do
      transaction_type { 'expense' }
    end
  end
end
```

#### Model Tests
```ruby
# spec/models/user_spec.rb
RSpec.describe User, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:email) }
    it { should validate_presence_of(:first_name) }
    it { should validate_presence_of(:last_name) }
    it { should validate_uniqueness_of(:email) }
    it { should validate_length_of(:first_name).is_at_most(100) }
  end

  describe 'associations' do
    it { should have_many(:transactions).dependent(:destroy) }
    it { should have_many(:categories).dependent(:destroy) }
    it { should have_many(:accounts).dependent(:destroy) }
  end

  describe 'callbacks' do
    it 'generates jti before creation' do
      user = build(:user)
      expect(user.jti).to be_nil
      user.save!
      expect(user.jti).to be_present
    end
  end
end

# spec/models/transaction_spec.rb
RSpec.describe Transaction, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:description) }
    it { should validate_presence_of(:amount) }
    it { should validate_presence_of(:date) }
    it { should validate_numericality_of(:amount).is_greater_than(0) }
    it { should validate_inclusion_of(:transaction_type).in_array(%w[income expense transfer]) }
  end

  describe 'scopes' do
    let(:user) { create(:user) }
    let!(:income) { create(:transaction, :income, user: user) }
    let!(:expense) { create(:transaction, :expense, user: user) }

    it 'filters by type' do
      expect(Transaction.by_type('income')).to include(income)
      expect(Transaction.by_type('income')).not_to include(expense)
    end

    it 'filters by user' do
      other_user = create(:user)
      other_transaction = create(:transaction, user: other_user)

      expect(Transaction.for_user(user)).to include(income, expense)
      expect(Transaction.for_user(user)).not_to include(other_transaction)
    end
  end
end
```

#### Controller Tests
```ruby
# spec/requests/api/v1/transactions_spec.rb
RSpec.describe 'Api::V1::Transactions', type: :request do
  let(:user) { create(:user) }
  let(:auth_headers) { { 'Authorization' => "Bearer #{jwt_token(user)}" } }

  describe 'GET /api/v1/transactions' do
    let!(:transactions) { create_list(:transaction, 3, user: user) }

    it 'returns user transactions' do
      get '/api/v1/transactions', headers: auth_headers

      expect(response).to have_http_status(:ok)
      expect(json_response['data'].size).to eq(3)
    end

    it 'filters by transaction type' do
      income = create(:transaction, :income, user: user)
      create(:transaction, :expense, user: user)

      get '/api/v1/transactions', params: { transaction_type: 'income' }, headers: auth_headers

      expect(response).to have_http_status(:ok)
      expect(json_response['data'].size).to eq(1)
      expect(json_response['data'][0]['id']).to eq(income.id)
    end

    it 'requires authentication' do
      get '/api/v1/transactions'
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'POST /api/v1/transactions' do
    let(:transaction_params) do
      {
        transaction: {
          description: 'Test transaction',
          amount: '100.00',
          transaction_type: 'expense',
          date: Date.current.to_s
        }
      }
    end

    it 'creates a new transaction' do
      expect {
        post '/api/v1/transactions', params: transaction_params, headers: auth_headers
      }.to change(Transaction, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(json_response['data']['description']).to eq('Test transaction')
    end

    it 'returns error for invalid data' do
      transaction_params[:transaction][:amount] = ''

      post '/api/v1/transactions', params: transaction_params, headers: auth_headers

      expect(response).to have_http_status(:unprocessable_entity)
      expect(json_response['errors']).to be_present
    end
  end
end
```

### 7.2 Testes Frontend (Jest + React Testing Library)

#### Setup dos Testes
```typescript
// __tests__/setup.ts
import '@testing-library/jest-dom';
import { server } from '../src/mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

#### Mocks MSW
```typescript
// src/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
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
    );
  }),

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
            date: '2024-01-15'
          }
        ]
      })
    );
  })
];
```

#### Component Tests
```typescript
// __tests__/components/TransactionForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TransactionForm } from '../src/components/forms/TransactionForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('TransactionForm', () => {
  it('renders form fields correctly', () => {
    renderWithProviders(<TransactionForm onSubmit={jest.fn()} />);

    expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/valor/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tipo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/data/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const onSubmit = jest.fn();
    renderWithProviders(<TransactionForm onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() => {
      expect(screen.getByText(/descrição é obrigatória/i)).toBeInTheDocument();
      expect(screen.getByText(/valor é obrigatório/i)).toBeInTheDocument();
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    const onSubmit = jest.fn();
    renderWithProviders(<TransactionForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/descrição/i), {
      target: { value: 'Test Transaction' }
    });
    fireEvent.change(screen.getByLabelText(/valor/i), {
      target: { value: '100.00' }
    });
    fireEvent.change(screen.getByLabelText(/data/i), {
      target: { value: '2024-01-15' }
    });

    fireEvent.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        description: 'Test Transaction',
        amount: '100.00',
        transaction_type: 'expense',
        date: '2024-01-15'
      });
    });
  });
});
```

#### Page Tests
```typescript
// __tests__/pages/Dashboard.test.tsx
import { render, screen } from '@testing-library/react';
import Dashboard from '../src/app/dashboard/page';
import { AuthProvider } from '../src/contexts/AuthContext';

const renderWithAuth = (component: React.ReactElement) => {
  const mockUser = {
    id: 1,
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User'
  };

  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  );
};

describe('Dashboard', () => {
  it('renders dashboard summary', async () => {
    renderWithAuth(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/resumo financeiro/i)).toBeInTheDocument();
      expect(screen.getByText(/receitas/i)).toBeInTheDocument();
      expect(screen.getByText(/despesas/i)).toBeInTheDocument();
      expect(screen.getByText(/saldo/i)).toBeInTheDocument();
    });
  });

  it('shows recent transactions', async () => {
    renderWithAuth(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/transações recentes/i)).toBeInTheDocument();
      expect(screen.getByText(/test transaction/i)).toBeInTheDocument();
    });
  });
});
```

### 7.3 Configuração de Cobertura

#### Backend Coverage (SimpleCov)
```ruby
# spec/spec_helper.rb
require 'simplecov'
SimpleCov.start 'rails' do
  add_filter '/vendor/'
  add_filter '/spec/'
  minimum_coverage 80
end
```

#### Frontend Coverage (Jest)
```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch"
  },
  "jest": {
    "collectCoverageFrom": [
      "src/**/*.{ts,tsx}",
      "!src/**/*.d.ts",
      "!src/types/**/*"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

## 8. Monitoramento e Observabilidade

### 8.1 Logging
```ruby
# config/environments/production.rb
config.log_level = :info
config.log_tags = [:request_id, :subdomain]

# Custom logging
Rails.application.configure do
  config.semantic_logger.add_appender(
    io: $stdout,
    formatter: :json
  )
end
```

### 8.2 Health Checks
```ruby
# config/routes.rb
get '/health', to: 'health#show'

# app/controllers/health_controller.rb
class HealthController < ApplicationController
  skip_before_action :authenticate_user!

  def show
    checks = {
      database: database_check,
      redis: redis_check,
      storage: storage_check
    }

    status = checks.values.all? ? :ok : :service_unavailable
    render json: { status: status, checks: checks }, status: status
  end

  private

  def database_check
    ActiveRecord::Base.connection.execute('SELECT 1')
    'healthy'
  rescue
    'unhealthy'
  end

  def redis_check
    Redis.current.ping == 'PONG' ? 'healthy' : 'unhealthy'
  rescue
    'unhealthy'
  end

  def storage_check
    'healthy' # Implement storage check
  rescue
    'unhealthy'
  end
end
```

---

**Versão**: 1.0
**Data**: 28/09/2025
**Autor**: Equipe de Desenvolvimento
**Aprovação**: Pendente
**Próxima Revisão**: 05/10/2025