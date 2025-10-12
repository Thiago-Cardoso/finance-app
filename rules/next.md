# Regras para Next.js

Este documento descreve as regras e melhores práticas para o desenvolvimento de aplicações com Next.js.

## Estrutura e Melhores Práticas

### Componentes de Servidor vs. Cliente

- **Composição:** Otimize o tamanho do bundle de JavaScript compondo Componentes de Servidor e Cliente. Mantenha componentes maiores e menos interativos como Componentes de Servidor e mova a interatividade para Componentes de Cliente menores.
- **Segurança:** Evite passar objetos de dados inteiros de Componentes de Servidor para Componentes de Cliente. Passe apenas os dados necessários para evitar a exposição de informações sensíveis.

### Mutações de Dados

- **Ações de Servidor:** Use Ações de Servidor para todas as mutações de dados (ex: envios de formulário, logout). Isso garante que as mutações ocorram no servidor e utilizem o método POST, o que é mais seguro.
- **Evite Mutações na Renderização:** Nunca acione uma mutação como um efeito colateral da renderização de um componente. O Next.js previne isso para evitar comportamentos inesperados.

### Otimistic UI

- **`useOptimistic`:** Use o hook `useOptimistic` do React para fornecer feedback instantâneo na interface do usuário. Isso melhora a experiência do usuário ao atualizar a UI imediatamente, antes que a ação do servidor seja concluída.

```tsx
'use client'

import { useOptimistic } from 'react'
import { send } from './actions'

export function Thread({ messages }) {
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, newMessage) => [...state, { message: newMessage }]
  )

  const formAction = async (formData) => {
    const message = formData.get('message')
    addOptimisticMessage(message)
    await send(message)
  }

  return (
    <form action={formAction}>
      {/* ... */}
    </form>
  )
}
```

## Desempenho no Desenvolvimento Local

- **Turbopack:** Use o Turbopack para um desenvolvimento local mais rápido.
  ```bash
  npm run dev --turbopack
  ```
- **Otimização de Importações:**
  - Importe ícones e outros componentes de bibliotecas grandes diretamente de seus caminhos de arquivo para evitar a inclusão de código não utilizado.
  - Configure `optimizePackageImports` no `next.config.js` para pacotes que usam "barrel files".
- **Configuração do Tailwind CSS:** Seja específico no array `content` do seu `tailwind.config.js` para evitar que o Tailwind escaneie diretórios desnecessários como `node_modules`.

## Análise de Bundle

- Use a variável de ambiente `ANALYZE=true` ao construir seu projeto para gerar um relatório visual dos seus bundles.
  ```bash
  ANALYZE=true npm run build
  ```
