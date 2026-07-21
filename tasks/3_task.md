---
status: completed
parallelizable: true
blocked_by: []
completed_at: 2025-09-29
---

<task_context>
<domain>frontend/setup</domain>
<type>implementation</type>
<scope>core_feature</scope>
<complexity>high</complexity>
<dependencies>none</dependencies>
<unblocks>"8.0", "10.0", "14.0"</unblocks>
</task_context>

# Tarefa 3.0: Setup Frontend Next.js 15

## Visão Geral
Configurar o projeto Next.js 15 com App Router, TailwindCSS, TypeScript e todas as dependências necessárias para o frontend do aplicativo de controle financeiro pessoal.

## Requisitos
- Next.js 15 com App Router configurado
- TypeScript com configurações otimizadas
- TailwindCSS para estilização
- Estrutura de componentes reutilizáveis
- Context API + React Query para estado global
- Configurações de ESLint, Prettier e ambiente de desenvolvimento

## Subtarefas
- [x] 3.1 Inicializar projeto Next.js 15 com TypeScript ✅
- [x] 3.2 Configurar TailwindCSS e design system ✅
- [x] 3.3 Setup React Query para gerenciamento de estado ✅
- [x] 3.4 Configurar estrutura de pastas e componentes base ✅
- [x] 3.5 Implementar Context API para autenticação ✅
- [x] 3.6 Configurar ESLint, Prettier e ferramentas de desenvolvimento ✅
- [x] 3.7 Setup de environment variables e configurações ✅
- [x] 3.8 Configurar layout principal e navegação ✅
- [x] 3.9 Implementar componentes UI básicos ✅
- [x] 3.10 Testar configuração e hot reload ✅

## Sequenciamento
- Bloqueado por: Nenhuma tarefa (pode ser executada em paralelo)
- Desbloqueia: 8.0 (Testes Frontend), 10.0 (Interface Transações), 14.0 (Interface Dashboard)
- Paralelizável: Sim (independente do backend)

## Detalhes de Implementação

### 1. Inicialização do Projeto
```bash
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir
cd frontend
```

### 2. Estrutura de Pastas
```
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── dashboard/
│   │   ├── transactions/
│   │   ├── categories/
│   │   ├── budgets/
│   │   ├── reports/
│   │   ├── settings/
│   │   ├── layout.tsx
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   ├── Table/
│   │   │   └── Chart/
│   │   ├── forms/
│   │   ├── charts/
│   │   └── layout/
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── api.ts
│   │   ├── utils.ts
│   │   ├── validations.ts
│   │   └── constants.ts
│   ├── hooks/
│   ├── contexts/
│   ├── types/
│   └── styles/
├── public/
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── .env.local
```

### 3. Package.json Essencial
```json
{
  "name": "finance-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@tanstack/react-query": "^5.0.0",
    "@hookform/resolvers": "^3.0.0",
    "react-hook-form": "^7.0.0",
    "zod": "^3.0.0",
    "recharts": "^2.8.0",
    "date-fns": "^2.30.0",
    "clsx": "^2.0.0",
    "lucide-react": "^0.280.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^15.0.0",
    "prettier": "^3.0.0",
    "prettier-plugin-tailwindcss": "^0.5.0"
  }
}
```

### 4. Configuração TailwindCSS
```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
        },
        danger: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

### 5. Context de Autenticação
```tsx
// src/contexts/AuthContext.tsx
'use client'

import { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: number
  email: string
  first_name: string
  last_name: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (userData: RegisterData) => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token')
    if (storedToken) {
      setToken(storedToken)
      // Validate token and get user data
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // Implementation will be added in Task 6.0
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth_token')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

### 6. React Query Setup
```tsx
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      cacheTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

// src/app/layout.tsx
'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { queryClient } from '@/lib/queryClient'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
}
```

### 7. API Client Base
```ts
// src/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const token = localStorage.getItem('auth_token')

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint)
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
```

### 8. Componentes UI Base
```tsx
// src/components/ui/Button/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled,
    children,
    ...props
  }, ref) => {
    return (
      <button
        className={clsx(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
          {
            'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500': variant === 'primary',
            'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500': variant === 'secondary',
            'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500': variant === 'danger',
            'text-gray-600 hover:bg-gray-100 focus:ring-gray-500': variant === 'ghost',
          },
          {
            'px-3 py-2 text-sm': size === 'sm',
            'px-4 py-2 text-base': size === 'md',
            'px-6 py-3 text-lg': size === 'lg',
          },
          className
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
```

## Critérios de Sucesso
- [x] Projeto Next.js 15 inicializado e funcionando ✅
- [x] TailwindCSS configurado com design system ✅
- [x] TypeScript configurado com strict mode ✅
- [x] React Query funcionando para gerenciamento de estado ✅
- [x] Context API implementado para autenticação ✅
- [x] Estrutura de componentes UI básicos criada ✅
- [x] Hot reload e desenvolvimento funcionando ✅
- [x] ESLint e Prettier configurados ✅
- [x] Environment variables configuradas ✅
- [x] Build de produção funcionando ✅

## Revisão de Código
- [x] Validação da definição da tarefa ✅
- [x] Análise de regras do projeto ✅
- [x] Revisão de código completa ✅
- [x] Problemas corrigidos ✅
- [x] Cobertura de testes validada (Task 8.0) ✅
- [x] Relatório de revisão gerado ✅

## Status Final
**✅ TAREFA CONCLUÍDA E APROVADA**
- Pontuação: 9.7/10
- Todos requisitos atendidos
- Código revisado e formatado
- Build de produção funcionando
- Pronto para deploy
- Relatório: `3_task_review.md`

## Configurações de Ambiente

### Environment Variables (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_APP_NAME=Finance App
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Next.js Configuration
```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: [],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig
```

## Recursos Necessários
- Desenvolvedor frontend React/Next.js experiente
- Designer para definir design system
- Conexão com backend (será implementado posteriormente)

## Tempo Estimado
- Setup inicial Next.js: 3-4 horas
- Configuração TailwindCSS e design system: 4-5 horas
- React Query e Context API: 3-4 horas
- Componentes UI base: 4-6 horas
- Configurações e testes: 2-3 horas
- **Total**: 3 dias de trabalho