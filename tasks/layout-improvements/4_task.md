---
status: pending
parallelizable: true
blocked_by: ["2.0"]
---

<task_context>
<domain>frontend/ui/responsive</domain>
<type>implementation</type>
<scope>core_feature</scope>
<complexity>medium</complexity>
<dependencies>tailwindcss|responsive-design</dependencies>
<unblocks>5.0</unblocks>
</task_context>

# Tarefa 4.0: Otimizar Responsividade Mobile em Todas as Telas

## Visão Geral

Garantir que todas as telas da aplicação sejam completamente responsivas e otimizadas para dispositivos móveis, seguindo as melhores práticas de mobile-first design e garantindo uma experiência de usuário excepcional em todos os tamanhos de tela.

## Requisitos

<requirements>
- Implementar design mobile-first em todas as telas
- Garantir breakpoints consistentes (TailwindCSS padrão)
- Otimizar touch targets (mínimo 44x44px)
- Implementar navegação mobile adequada
- Otimizar performance para dispositivos móveis
- Testar em dispositivos reais (iOS e Android)
- Garantir gestos touch funcionem corretamente
- Implementar drawers/sheets para mobile quando apropriado
</requirements>

## Subtarefas

### 4.1 Auditoria de Responsividade

- [ ] 4.1.1 Listar todas as telas da aplicação
- [ ] 4.1.2 Testar cada tela em diferentes breakpoints
- [ ] 4.1.3 Documentar problemas encontrados
- [ ] 4.1.4 Priorizar correções

### 4.2 Definir Breakpoints Padrão

- [ ] 4.2.1 Documentar breakpoints TailwindCSS
- [ ] 4.2.2 Criar hook useMediaQuery customizado
- [ ] 4.2.3 Definir regras de layout por breakpoint
- [ ] 4.2.4 Criar componentes adaptativos

### 4.3 Login e Autenticação

- [ ] 4.3.1 Otimizar página de login para mobile
- [ ] 4.3.2 Otimizar página de registro
- [ ] 4.3.3 Otimizar recuperação de senha
- [ ] 4.3.4 Testar formulários em mobile

### 4.4 Dashboard

- [ ] 4.4.1 Adaptar cards de resumo para mobile
- [ ] 4.4.2 Otimizar gráficos para telas pequenas
- [ ] 4.4.3 Implementar scroll horizontal se necessário
- [ ] 4.4.4 Testar interatividade dos gráficos

### 4.5 Transactions

- [ ] 4.5.1 Adaptar layout de filtros para mobile (drawer)
- [ ] 4.5.2 Otimizar lista de transações
- [ ] 4.5.3 Melhorar modal de criação/edição
- [ ] 4.5.4 Implementar swipe actions (opcional)

### 4.6 Categories

- [ ] 4.6.1 Otimizar grade de categorias (1 coluna em mobile)
- [ ] 4.6.2 Adaptar cards para touch
- [ ] 4.6.3 Melhorar modais para mobile
- [ ] 4.6.4 Otimizar filtros

### 4.7 Navegação e Layout Global

- [ ] 4.7.1 Implementar bottom navigation para mobile
- [ ] 4.7.2 Adaptar sidebar/drawer para mobile
- [ ] 4.7.3 Otimizar header responsivo
- [ ] 4.7.4 Implementar menu hamburguer se necessário

### 4.8 Touch e Gestos

- [ ] 4.8.1 Garantir touch targets mínimos (44x44px)
- [ ] 4.8.2 Implementar pull-to-refresh (opcional)
- [ ] 4.8.3 Implementar swipe gestures onde apropriado
- [ ] 4.8.4 Testar em dispositivos touch reais

### 4.9 Performance Mobile

- [ ] 4.9.1 Otimizar imagens para mobile
- [ ] 4.9.2 Implementar lazy loading
- [ ] 4.9.3 Reduzir bundle size
- [ ] 4.9.4 Testar performance em 3G/4G

### 4.10 Testes

- [ ] 4.10.1 Testar em iPhone (Safari)
- [ ] 4.10.2 Testar em Android (Chrome)
- [ ] 4.10.3 Testar em diferentes tamanhos de tela
- [ ] 4.10.4 Validar orientação landscape

## Detalhes de Implementação

### Breakpoints TailwindCSS Padrão

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'sm': '640px',   // Small devices (landscape phones)
      'md': '768px',   // Medium devices (tablets)
      'lg': '1024px',  // Large devices (laptops)
      'xl': '1280px',  // Extra large devices (desktops)
      '2xl': '1536px', // 2X Extra large devices (large desktops)
    }
  }
}
```

### Hook useMediaQuery

```typescript
// hooks/useMediaQuery.ts
import { useState, useEffect } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    const listener = () => setMatches(media.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [matches, query])

  return matches
}

// Hooks específicos
export const useIsMobile = () => useMediaQuery('(max-width: 768px)')
export const useIsTablet = () => useMediaQuery('(min-width: 768px) and (max-width: 1024px)')
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)')
```

### Componente Adaptativo: ResponsiveContainer

```tsx
// components/ui/ResponsiveContainer.tsx
interface ResponsiveContainerProps {
  mobile?: React.ReactNode
  tablet?: React.ReactNode
  desktop: React.ReactNode
  children?: never
}

export function ResponsiveContainer({
  mobile,
  tablet,
  desktop
}: ResponsiveContainerProps) {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()

  if (isMobile && mobile) return <>{mobile}</>
  if (isTablet && tablet) return <>{tablet}</>
  return <>{desktop}</>
}

// Uso:
<ResponsiveContainer
  mobile={<MobileLayout />}
  tablet={<TabletLayout />}
  desktop={<DesktopLayout />}
/>
```

### Drawer para Filtros Mobile

```tsx
// components/ui/Drawer.tsx
import { Dialog, Transition } from '@headlessui/react'
import { X } from 'lucide-react'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  position?: 'left' | 'right' | 'bottom'
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  position = 'bottom'
}: DrawerProps) {
  return (
    <Transition show={isOpen}>
      <Dialog onClose={onClose} className="relative z-50">
        {/* Backdrop */}
        <Transition.Child
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        </Transition.Child>

        {/* Drawer Panel */}
        <Transition.Child
          enter="ease-out duration-300"
          enterFrom={position === 'bottom' ? 'translate-y-full' : '-translate-x-full'}
          enterTo="translate-y-0"
          leave="ease-in duration-200"
          leaveFrom="translate-y-0"
          leaveTo={position === 'bottom' ? 'translate-y-full' : '-translate-x-full'}
        >
          <Dialog.Panel className={`fixed ${
            position === 'bottom'
              ? 'bottom-0 left-0 right-0 rounded-t-2xl max-h-[85vh]'
              : 'top-0 left-0 bottom-0 w-80 rounded-r-2xl'
          } bg-white dark:bg-gray-800 shadow-xl overflow-y-auto`}>
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
              <Dialog.Title className="text-lg font-bold">
                {title}
              </Dialog.Title>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {children}
            </div>
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition>
  )
}
```

### Bottom Navigation (Mobile)

```tsx
// components/layout/BottomNav.tsx
import { Home, Receipt, FolderOpen, BarChart3, User } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/transactions', icon: Receipt, label: 'Transactions' },
  { href: '/categories', icon: FolderOpen, label: 'Categories' },
  { href: '/reports', icon: BarChart3, label: 'Reports' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export function BottomNav() {
  const pathname = usePathname()
  const isMobile = useIsMobile()

  if (!isMobile) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 safe-area-inset-bottom">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
```

### Adaptação de Filtros para Mobile

```tsx
// app/transactions/page.tsx
export default function TransactionsPage() {
  const isMobile = useIsMobile()
  const [showFilters, setShowFilters] = useState(false)

  return (
    <div>
      {/* Mobile: Botão para abrir drawer */}
      {isMobile && (
        <Button onClick={() => setShowFilters(true)}>
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      )}

      {/* Desktop: Filtros inline */}
      {!isMobile && (
        <div className="grid grid-cols-4 gap-6">
          <aside className="col-span-1">
            <TransactionFilters ... />
          </aside>
          <main className="col-span-3">...</main>
        </div>
      )}

      {/* Mobile: Drawer de filtros */}
      {isMobile && (
        <Drawer
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          title="Filters"
          position="bottom"
        >
          <TransactionFilters ... />
          <div className="mt-4 flex gap-2">
            <Button onClick={() => setShowFilters(false)} className="flex-1">
              Apply Filters
            </Button>
            <Button variant="secondary" onClick={clearFilters}>
              Clear
            </Button>
          </div>
        </Drawer>
      )}
    </div>
  )
}
```

### Touch Targets

```tsx
// Garantir mínimo 44x44px para touch
<button className="min-h-[44px] min-w-[44px] p-2">
  <Icon className="w-5 h-5" />
</button>

// Aumentar área de toque sem aumentar visual
<button className="relative p-2 before:content-[''] before:absolute before:inset-0 before:-m-2">
  <Icon className="w-4 h-4" />
</button>
```

### Swipe Actions (Opcional)

```tsx
// components/transactions/TransactionItem.tsx
import { motion, PanInfo } from 'framer-motion'

export function TransactionItem({ transaction, onEdit, onDelete }) {
  const [dragX, setDragX] = useState(0)

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.x < -100) {
      onDelete(transaction)
    } else if (info.offset.x > 100) {
      onEdit(transaction)
    }
    setDragX(0)
  }

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -150, right: 150 }}
      onDragEnd={handleDragEnd}
      style={{ x: dragX }}
      className="relative bg-white"
    >
      {/* Background actions */}
      <div className="absolute inset-y-0 left-0 w-24 bg-blue-500 flex items-center justify-center">
        <Pencil className="w-5 h-5 text-white" />
      </div>
      <div className="absolute inset-y-0 right-0 w-24 bg-red-500 flex items-center justify-center">
        <Trash className="w-5 h-5 text-white" />
      </div>

      {/* Transaction content */}
      <div className="relative bg-white p-4">
        {/* ... */}
      </div>
    </motion.div>
  )
}
```

### Safe Area Insets (iOS)

```css
/* globals.css */
.safe-area-inset-top {
  padding-top: env(safe-area-inset-top);
}

.safe-area-inset-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

.safe-area-inset-left {
  padding-left: env(safe-area-inset-left);
}

.safe-area-inset-right {
  padding-right: env(safe-area-inset-right);
}
```

## Critérios de Sucesso

- [ ] Todas as telas funcionam em mobile (375px+)
- [ ] Touch targets atendem requisitos (44x44px mínimo)
- [ ] Navegação mobile é intuitiva
- [ ] Performance mobile é adequada (Lighthouse > 80)
- [ ] Gestos touch funcionam corretamente
- [ ] Orientação landscape funciona
- [ ] Safe areas (iOS) são respeitadas
- [ ] Teclado virtual não quebra layout
- [ ] Scroll é suave em dispositivos móveis
- [ ] Testado em dispositivos reais iOS e Android

## Casos de Teste

### Teste 1: Breakpoints
- 375px (iPhone SE)
- 390px (iPhone 12/13/14)
- 428px (iPhone 14 Pro Max)
- 768px (iPad portrait)
- 1024px (iPad landscape)
- 1920px (Desktop)

### Teste 2: Touch Targets
- Todos os botões > 44x44px
- Links têm área de toque adequada
- Ícones são tocáveis

### Teste 3: Navegação Mobile
- Bottom navigation funciona
- Drawer/sidebar funciona
- Transições são suaves

### Teste 4: Formulários Mobile
- Teclado não cobre inputs
- Autocomplete funciona
- Validação é clara
- Submit é fácil

### Teste 5: Performance
- FCP < 1.8s em 3G
- TTI < 3.9s em 3G
- CLS < 0.1

## Estimativa de Complexidade

- **Complexidade**: Média
- **Tempo Estimado**: 8-10 horas
- **Risco**: Médio (requer testes em múltiplos dispositivos)
- **Dependências**: 2.0 (layout transactions)

## Próximos Passos

Após completar esta tarefa, desbloqueia:
- **5.0**: Validar e Corrigir Dark Mode
