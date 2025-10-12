# Padrões de Código para Next.js

Este documento descreve os padrões de código e as melhores práticas para o desenvolvimento de aplicações com Next.js.

## Estrutura de Arquivos e Componentes

- **Componentes de Servidor e Cliente:** Componha componentes de servidor e cliente para otimizar o tamanho do bundle de JavaScript. Mantenha componentes maiores e menos interativos como Componentes de Servidor.

  ```tsx
  // app/layout.tsx (Componente de Servidor)
  import Search from './search' // Componente de Cliente
  import Logo from './logo'     // Componente de Servidor

  export default function Layout({ children }: { children: React.ReactNode }) {
    return (
      <>
        <nav>
          <Logo />
          <Search />
        </nav>
        <main>{children}</main>
      </>
    )
  }
  ```

- **Otimização de Importações de Ícones:** Para evitar tempos de compilação lentos, importe ícones diretamente do caminho do arquivo específico em vez do ponto de entrada principal da biblioteca.

  ```jsx
  // Em vez disto:
  import { TriangleIcon } from '@phosphor-icons/react'

  // Faça isto:
  import { TriangleIcon } from '@phosphor-icons/react/dist/csr/Triangle'
  ```

## Busca de Dados (Data Fetching)

- **Utilitário de Busca de Dados Reutilizável:** Crie um utilitário de busca de dados reutilizável com `cache` do React para memoização e `server-only` para restringir a execução ao servidor.

  ```typescript
  import { cache } from 'react'
  import 'server-only'
  import { getItem } from '@/lib/data'

  export const preload = (id: string) => {
    void getItem(id)
  }

  export const getItem = cache(async (id: string) => {
    // ...
  })
  ```

- **Encaminhamento de Cabeçalhos:** Use a função `headers` do Next.js para encaminhar cabeçalhos, como o de autorização, para requisições externas.

  ```jsx
  import { headers } from 'next/headers'

  export default async function Page() {
    const authorization = (await headers()).get('authorization')
    const res = await fetch('...', {
      headers: { authorization }, // Encaminha o cabeçalho de autorização
    })
    const user = await res.json()

    return <h1>{user.name}</h1>
  }
  ```

## Segurança

- **Ações de Servidor para Mutações:** Use Ações de Servidor para lidar com mutações, como logout. Isso separa a lógica de mutação da renderização do componente e melhora a segurança.

  ```typescript
  // BOM: Usando Ações de Servidor para lidar com mutações
  import { logout } from './actions'

  export default function Page() {
    return (
      <>
        <UserProfile />
        <form action={logout}>
          <button type="submit">Logout</button>
        </form>
      </>
    )
  }
  ```

- **Evite Exposição de Dados:** Não passe o objeto de dados inteiro de um Componente de Servidor para um Componente de Cliente. Em vez disso, passe apenas os campos necessários para evitar a exposição de dados sensíveis.

## Configuração (`next.config.js`)

- **Otimização de Imagens:** Configure os formatos e a qualidade das imagens para otimização.

  ```javascript
  module.exports = {
    images: {
      formats: ['image/avif', 'image/webp'],
      qualities: [25, 50, 75, 100],
    },
  }
  ```

- **Logging de Fetches:** Habilite o logging detalhado para requisições `fetch` durante o desenvolvimento.

  ```javascript
  module.exports = {
    logging: {
      fetches: {
        fullUrl: true,
      },
    },
  }
  ```

- **Otimização de Importações de Pacotes:** Use `optimizePackageImports` para otimizar importações de pacotes que usam "barrel files".

  ```javascript
  module.exports = {
    experimental: {
      optimizePackageImports: ['package-name'],
    },
  }
  ```
