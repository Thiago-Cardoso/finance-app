---
status: pending
parallelizable: false
blocked_by: ["3.0", "4.0"]
---

<task_context>
<domain>frontend/ui/theming</domain>
<type>implementation</type>
<scope>core_feature</scope>
<complexity>medium</complexity>
<dependencies>tailwindcss|dark-mode</dependencies>
<unblocks>6.0</unblocks>
</task_context>

# Tarefa 5.0: Validar e Corrigir Dark Mode em Todos os Componentes

## Visão Geral

Realizar auditoria completa do dark mode em toda a aplicação, garantindo que todos os componentes, telas e estados visuais funcionem perfeitamente tanto em light mode quanto em dark mode, mantendo contraste adequado e acessibilidade.

## Requisitos

<requirements>
- Auditar todos os componentes para suporte a dark mode
- Garantir contraste adequado (WCAG AA: 4.5:1)
- Implementar toggle de theme funcional
- Persistir preferência do usuário
- Respeitar preferência do sistema operacional
- Garantir transições suaves entre themes
- Validar cores de gradientes em dark mode
- Testar todos os estados (hover, active, disabled, focus)
</requirements>

## Subtarefas

### 5.1 Auditoria Completa

- [ ] 5.1.1 Listar todos os componentes da aplicação
- [ ] 5.1.2 Testar cada componente em dark mode
- [ ] 5.1.3 Documentar problemas encontrados
- [ ] 5.1.4 Priorizar correções por criticidade

### 5.2 Configuração do Theme System

- [ ] 5.2.1 Verificar configuração do TailwindCSS dark mode
- [ ] 5.2.2 Implementar ThemeProvider context
- [ ] 5.2.3 Criar hook useTheme
- [ ] 5.2.4 Implementar persistência em localStorage

### 5.3 Componentes UI Base

- [ ] 5.3.1 Button: validar todas as variantes
- [ ] 5.3.2 Input: garantir contraste adequado
- [ ] 5.3.3 Select: testar dropdown em dark mode
- [ ] 5.3.4 Modal/Drawer: verificar backdrop e conteúdo
- [ ] 5.3.5 Pagination: validar estados e cores
- [ ] 5.3.6 Card: verificar borders e backgrounds

### 5.4 Telas Principais

- [ ] 5.4.1 Login/Register: validar formulários
- [ ] 5.4.2 Dashboard: verificar cards e gráficos
- [ ] 5.4.3 Transactions: validar lista e filtros
- [ ] 5.4.4 Categories: verificar cards e modais
- [ ] 5.4.5 Reports: validar visualizações

### 5.5 Estados Interativos

- [ ] 5.5.1 Hover: garantir feedback visual
- [ ] 5.5.2 Active: validar estados pressionados
- [ ] 5.5.3 Focus: verificar rings e outlines
- [ ] 5.5.4 Disabled: garantir contraste reduzido
- [ ] 5.5.5 Loading: validar skeletons e spinners

### 5.6 Cores e Gradientes

- [ ] 5.6.1 Validar gradientes blue-purple em dark mode
- [ ] 5.6.2 Verificar cores de sucesso/erro/warning
- [ ] 5.6.3 Garantir cores de categorias funcionem
- [ ] 5.6.4 Validar cores de gráficos

### 5.7 Acessibilidade

- [ ] 5.7.1 Testar com ferramentas de contraste
- [ ] 5.7.2 Validar com screen readers
- [ ] 5.7.3 Garantir WCAG AA compliance
- [ ] 5.7.4 Testar com usuários reais

### 5.8 Toggle de Theme

- [ ] 5.8.1 Implementar componente ThemeToggle
- [ ] 5.8.2 Posicionar no header/settings
- [ ] 5.8.3 Adicionar animação de transição
- [ ] 5.8.4 Testar em todos os dispositivos

## Detalhes de Implementação

### Configuração TailwindCSS

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // ou 'media' para respeitar SO
  theme: {
    extend: {
      colors: {
        // Cores customizadas para dark mode
        primary: {
          50: '#eff6ff',
          // ...
          900: '#1e3a8a',
          950: '#172554', // Para dark mode
        }
      }
    }
  }
}
```

### ThemeProvider Context

```tsx
// contexts/ThemeContext.tsx
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Carregar preferência salva
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    const root = window.document.documentElement

    // Remover classes anteriores
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      root.classList.add(systemTheme)
      setResolvedTheme(systemTheme)

      // Listener para mudanças do sistema
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e: MediaQueryListEvent) => {
        const newTheme = e.matches ? 'dark' : 'light'
        root.classList.remove('light', 'dark')
        root.classList.add(newTheme)
        setResolvedTheme(newTheme)
      }
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else {
      root.classList.add(theme)
      setResolvedTheme(theme)
      localStorage.setItem('theme', theme)
    }
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
```

### ThemeToggle Component

```tsx
// components/ui/ThemeToggle.tsx
import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center gap-1 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
      <button
        onClick={() => setTheme('light')}
        className={`p-2 rounded transition-colors ${
          theme === 'light'
            ? 'bg-white dark:bg-gray-800 shadow'
            : 'hover:bg-gray-100 dark:hover:bg-gray-600'
        }`}
        aria-label="Light mode"
      >
        <Sun className="w-4 h-4" />
      </button>

      <button
        onClick={() => setTheme('system')}
        className={`p-2 rounded transition-colors ${
          theme === 'system'
            ? 'bg-white dark:bg-gray-800 shadow'
            : 'hover:bg-gray-100 dark:hover:bg-gray-600'
        }`}
        aria-label="System mode"
      >
        <Monitor className="w-4 h-4" />
      </button>

      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded transition-colors ${
          theme === 'dark'
            ? 'bg-white dark:bg-gray-800 shadow'
            : 'hover:bg-gray-100 dark:hover:bg-gray-600'
        }`}
        aria-label="Dark mode"
      >
        <Moon className="w-4 h-4" />
      </button>
    </div>
  )
}
```

### Gradientes em Dark Mode

```tsx
// Problema: Gradientes muito vibrantes em dark mode
// Solução: Versões diferentes para light/dark

// Antes:
<div className="bg-gradient-to-r from-blue-600 to-purple-600">

// Depois:
<div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500">

// Ou usando opacity para suavizar:
<div className="bg-gradient-to-r from-blue-600/80 to-purple-600/80">

// Para textos com gradiente:
<h1 className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
  Title
</h1>
```

### Palette de Cores Consistente

```typescript
// lib/colors.ts
export const colors = {
  // Background
  background: {
    light: '#ffffff',
    dark: '#1f2937', // gray-800
  },
  backgroundSecondary: {
    light: '#f9fafb', // gray-50
    dark: '#111827', // gray-900
  },

  // Text
  text: {
    primary: {
      light: '#111827', // gray-900
      dark: '#f9fafb', // gray-50
    },
    secondary: {
      light: '#6b7280', // gray-500
      dark: '#9ca3af', // gray-400
    }
  },

  // Borders
  border: {
    light: '#e5e7eb', // gray-200
    dark: '#374151', // gray-700
  },

  // States
  hover: {
    light: '#f3f4f6', // gray-100
    dark: '#374151', // gray-700
  },

  // Brand
  primary: {
    light: '#2563eb', // blue-600
    dark: '#3b82f6', // blue-500
  },
  secondary: {
    light: '#7c3aed', // purple-600
    dark: '#8b5cf6', // purple-500
  },

  // Semantic
  success: {
    light: '#10b981', // green-500
    dark: '#34d399', // green-400
  },
  error: {
    light: '#ef4444', // red-500
    dark: '#f87171', // red-400
  },
  warning: {
    light: '#f59e0b', // yellow-500
    dark: '#fbbf24', // yellow-400
  }
}
```

### Auditoria de Componentes

```typescript
// Checklist para cada componente:

// 1. Backgrounds
// ✅ bg-white dark:bg-gray-800
// ✅ bg-gray-50 dark:bg-gray-900
// ❌ bg-white (sem dark mode)

// 2. Texto
// ✅ text-gray-900 dark:text-gray-100
// ✅ text-gray-600 dark:text-gray-400
// ❌ text-black (muito forte em dark)

// 3. Borders
// ✅ border-gray-200 dark:border-gray-700
// ❌ border-gray-300 (contraste baixo em dark)

// 4. Shadows
// ✅ shadow-md (funciona em ambos)
// ⚠️ shadow-xl (pode ser muito forte em dark)

// 5. Hover States
// ✅ hover:bg-gray-100 dark:hover:bg-gray-700
// ❌ hover:bg-gray-50 (sem dark variant)

// 6. Focus States
// ✅ focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
// ❌ focus:ring-blue-600 (sem ajuste para dark)
```

### Skeleton Loading em Dark Mode

```tsx
// Antes:
<div className="animate-pulse bg-gray-200 h-4 rounded" />

// Depois:
<div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 rounded" />

// Componente reutilizável:
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
    />
  )
}
```

### Validação de Contraste

```bash
# Instalar ferramenta de teste
npm install --save-dev @axe-core/cli

# Rodar testes de acessibilidade
npx @axe-core/cli http://localhost:3000 --tags wcag21aa

# Ou usar extensão do Chrome:
# axe DevTools - Web Accessibility Testing
```

### Gráficos em Dark Mode

```tsx
// Para Chart.js / Recharts
const chartOptions = {
  scales: {
    x: {
      grid: {
        color: resolvedTheme === 'dark' ? '#374151' : '#e5e7eb',
      },
      ticks: {
        color: resolvedTheme === 'dark' ? '#9ca3af' : '#6b7280',
      }
    }
  },
  plugins: {
    legend: {
      labels: {
        color: resolvedTheme === 'dark' ? '#f9fafb' : '#111827',
      }
    }
  }
}
```

## Matriz de Testes

### Componentes UI

| Componente | Light Mode | Dark Mode | Hover | Focus | Disabled |
|------------|-----------|-----------|-------|-------|----------|
| Button     | ✅        | ✅        | ✅    | ✅    | ✅       |
| Input      | ✅        | ❌        | ✅    | ✅    | ✅       |
| Select     | ✅        | ❌        | ✅    | ✅    | ✅       |
| Modal      | ✅        | ⚠️        | -     | ✅    | -        |
| Card       | ✅        | ❌        | ✅    | -     | -        |
| Pagination | ✅        | ⚠️        | ✅    | ✅    | ✅       |

### Telas

| Tela         | Light | Dark | Mobile | Tablet | Desktop |
|--------------|-------|------|--------|--------|---------|
| Login        | ✅    | ❌   | ✅     | ✅     | ✅      |
| Dashboard    | ✅    | ⚠️   | ✅     | ✅     | ✅      |
| Transactions | ✅    | ❌   | ✅     | ✅     | ✅      |
| Categories   | ✅    | ⚠️   | ✅     | ✅     | ✅      |

Legenda:
- ✅ Funcionando perfeitamente
- ⚠️ Funcionando mas com problemas menores
- ❌ Não funcionando ou problemas graves

## Critérios de Sucesso

- [ ] Todos os componentes funcionam em dark mode
- [ ] Contraste atende WCAG AA (4.5:1 para texto)
- [ ] Toggle de theme funciona perfeitamente
- [ ] Preferência é persistida corretamente
- [ ] Preferência do sistema é respeitada
- [ ] Transições entre themes são suaves
- [ ] Gradientes ficam bem em ambos os modes
- [ ] Gráficos são legíveis em dark mode
- [ ] Estados interativos têm contraste adequado
- [ ] Sem flicker ao carregar página
- [ ] Screenshots de dark mode ficam profissionais

## Ferramentas de Teste

### 1. Contrast Checker
- WebAIM Contrast Checker
- Colour Contrast Analyser (CCA)
- axe DevTools

### 2. Screen Readers
- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS/iOS)
- TalkBack (Android)

### 3. Lighthouse
```bash
# Rodar Lighthouse para acessibilidade
npx lighthouse http://localhost:3000 --only-categories=accessibility
```

### 4. Manual Testing
- Testar com tema do sistema em dark
- Testar toggle manual
- Testar persistência (refresh página)
- Testar em diferentes navegadores

## Estimativa de Complexidade

- **Complexidade**: Média
- **Tempo Estimado**: 6-8 horas
- **Risco**: Baixo (mudanças cosméticas)
- **Dependências**: 3.0, 4.0 (todos componentes prontos)

## Próximos Passos

Após completar esta tarefa, desbloqueia:
- **6.0**: Refatorar e Padronizar Componentes UI Base
