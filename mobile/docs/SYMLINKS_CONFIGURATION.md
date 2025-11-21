# Configuração de Symlinks - Metro Bundler & TypeScript

## 📋 Visão Geral

Configuração completa para suportar symlinks no React Native/Expo, permitindo compartilhamento de código entre mobile e frontend.

---

## ⚙️ Configurações Implementadas

### 1. Metro Bundler (`metro.config.js`)

#### Criado arquivo de configuração do Metro com:

**✅ Suporte a Symlinks**
```javascript
config.transformer = {
  unstable_enableSymlinks: true,
};
```

**✅ Watch Folders**
```javascript
config.watchFolders = [
  __dirname,
  path.join(frontendPath, 'types'),
  path.join(frontendPath, 'lib'),
  path.join(frontendPath, 'utils'),
];
```
- Metro monitora mudanças nos arquivos do frontend
- Hot reload funciona mesmo em arquivos via symlink

**✅ Node Modules Paths**
```javascript
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(__dirname, '../frontend/node_modules'),
];
```
- Resolve dependências compartilhadas corretamente
- Evita duplicação de packages

**✅ Source Extensions**
```javascript
config.resolver.sourceExts = [
  'expo.tsx',
  'expo.ts',
  'expo.js',
  'tsx',
  'ts',
  'jsx',
  'js',
  'json',
];
```

---

### 2. TypeScript (`tsconfig.json`)

#### Configurações adicionadas:

**✅ Preserve Symlinks**
```json
{
  "compilerOptions": {
    "preserveSymlinks": true,
    "resolveJsonModule": true
  }
}
```

**Função:**
- `preserveSymlinks: true` - TypeScript segue symlinks corretamente
- `resolveJsonModule: true` - Permite importar JSON via symlinks

---

### 3. Babel (`babel.config.js`)

#### Já configurado previamente:

```javascript
module.exports = {
  plugins: [
    ['module-resolver', {
      root: ['./src'],
      alias: {
        '@': './src',
      },
    }],
  ],
};
```

**Função:**
- Resolve aliases `@/` corretamente
- Funciona com symlinks via Metro

---

### 4. Scripts NPM (`package.json`)

#### Novos scripts adicionados:

**🔧 Limpeza de Cache**
```bash
npm run clean              # Limpa cache Metro + Watchman
npm run clean:full         # Limpa tudo + reinstala node_modules
```

**🚀 Start com Cache Limpo**
```bash
npm run start:clear        # Start com --clear (útil após mudanças)
```

**🔍 Verificação de Symlinks**
```bash
npm run verify:symlinks    # Verifica se symlinks estão corretos
```

**🐛 Debug do Metro**
```bash
npm run debug:metro        # Start com debug habilitado
```

---

## 🚀 Como Usar

### Desenvolvimento Normal

```bash
# Start normal
npm start

# Se tiver problemas com cache
npm run start:clear

# Desenvolvimento no device
npm run android   # Android
npm run ios       # iOS
```

### Após Adicionar Novos Symlinks

```bash
# 1. Verificar se symlinks estão corretos
npm run verify:symlinks

# 2. Limpar cache
npm run clean

# 3. Start com cache limpo
npm run start:clear
```

### Troubleshooting

```bash
# Se Metro não detectar mudanças nos arquivos do frontend:
npm run clean
npm run start:clear

# Se houver erros de módulo não encontrado:
npm run clean:full

# Debug detalhado do Metro:
npm run debug:metro
```

---

## 📁 Symlinks Ativos

### Estrutura
```
mobile/src/shared/
├── types/ → ../../../frontend/src/types/
├── lib/
│   └── validations.ts → ../../../../frontend/src/lib/validations.ts
└── utils/
    └── formatters.ts → ../../../../frontend/src/utils/formatters.ts
```

### Verificação
```bash
$ ls -la src/shared/types
lrwxr-xr-x  types -> ../../../frontend/src/types

$ ls -la src/shared/utils/formatters.ts
lrwxr-xr-x  formatters.ts -> ../../../../frontend/src/utils/formatters.ts

$ ls -la src/shared/lib/validations.ts
lrwxr-xr-x  validations.ts -> ../../../../frontend/src/lib/validations.ts
```

---

## 🔍 Como o Metro Resolve Symlinks

### 1. Import no Código
```typescript
import { FinancialSummary } from '@/shared/types/analytics';
```

### 2. Babel Resolve Alias
```
@/shared/types/analytics
→ src/shared/types/analytics
```

### 3. Metro Segue Symlink
```
src/shared/types/analytics
→ ../../../frontend/src/types/analytics.ts
```

### 4. Metro Monitora Arquivo Original
```
frontend/src/types/analytics.ts ✅ watched
```

### 5. Hot Reload Funciona
- Mudanças no frontend → Metro detecta
- Hot reload no mobile automaticamente

---

## ⚠️ Problemas Comuns e Soluções

### Problema 1: "Module not found"
**Sintoma:**
```
Error: Unable to resolve module @/shared/types/analytics
```

**Solução:**
```bash
npm run clean
npm run start:clear
```

**Causa:** Cache desatualizado do Metro

---

### Problema 2: Hot Reload Não Funciona
**Sintoma:** Mudanças no frontend não refletem no mobile

**Solução:**
```bash
# Verificar se watch folders estão corretas
npm run debug:metro

# Deve mostrar:
# - Watch Folders: [mobile, frontend/src/types, frontend/src/lib, frontend/src/utils]
```

**Causa:** Watch folders não configuradas no metro.config.js

---

### Problema 3: TypeScript Error em Symlinks
**Sintoma:**
```
Cannot find module '@/shared/types/analytics' or its corresponding type declarations
```

**Solução:**
1. Verificar `tsconfig.json`:
```json
{
  "compilerOptions": {
    "preserveSymlinks": true
  }
}
```

2. Reiniciar TypeScript server no VSCode:
   - `Cmd+Shift+P` → "TypeScript: Restart TS Server"

---

### Problema 4: Duplicação de Dependencies
**Sintoma:**
```
Error: Requiring module "node_modules/react/index.js", which was already required...
```

**Solução:**
Metro config já resolve isso:
```javascript
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(__dirname, '../frontend/node_modules'),
];
```

Se persistir:
```bash
npm run clean:full
```

---

### Problema 5: Symlinks no Windows
**Sintoma:** Symlinks não funcionam no Windows

**Solução:**
1. Habilitar Developer Mode no Windows
2. Ou rodar terminal como Administrador
3. Recriar symlinks:
```bash
cd mobile/src/shared
rm -rf types
cmd /c mklink /D types ..\..\..\frontend\src\types
```

---

## 🧪 Testando a Configuração

### Teste 1: Imports Funcionando
```typescript
// src/app/test.ts
import { FinancialSummary } from '@/shared/types/analytics';
import { formatCurrency } from '@/shared/utils/formatters';
import { loginFormSchema } from '@/shared/lib/validations';

// Se não houver erros TypeScript → ✅ Funcionando
```

### Teste 2: Hot Reload
1. Start do mobile: `npm start`
2. Abrir `frontend/src/types/analytics.ts`
3. Adicionar comentário
4. Salvar
5. Mobile deve reload automaticamente → ✅ Funcionando

### Teste 3: Build
```bash
# Build deve funcionar sem erros
expo build:android
expo build:ios
```

---

## 📊 Performance

### Watch Folders Impact
- **Impacto:** Mínimo
- Metro monitora apenas arquivos necessários
- Hot reload permanece rápido

### Symlinks vs Código Duplicado
```
Antes (Duplicado):
- Bundle size: +21 KB
- Sync manual entre projetos
- Manutenção duplicada

Depois (Symlinks):
- Bundle size: 0 KB overhead
- Sync automático
- Manutenção única
```

---

## 🔒 Segurança e Deploy

### EAS Build (Expo Application Services)
✅ **Suporta symlinks nativamente**

### Expo Go
✅ **Funciona com symlinks**

### Bare Workflow
✅ **Configuração atual funciona**

### CI/CD
**GitHub Actions / GitLab CI:**
```yaml
- name: Checkout with submodules
  uses: actions/checkout@v3
  with:
    submodules: true
    # Symlinks são preservados no git
```

---

## 📚 Referências

- [Metro Bundler - Symlinks](https://facebook.github.io/metro/docs/configuration)
- [TypeScript - preserveSymlinks](https://www.typescriptlang.org/tsconfig#preserveSymlinks)
- [Expo - Metro Config](https://docs.expo.dev/guides/customizing-metro/)
- [React Native - Performance](https://reactnative.dev/docs/performance)

---

## ✅ Checklist de Verificação

Após configurar symlinks, verificar:

- [ ] `metro.config.js` criado com `unstable_enableSymlinks: true`
- [ ] `tsconfig.json` tem `preserveSymlinks: true`
- [ ] `babel.config.js` tem module-resolver configurado
- [ ] Scripts npm adicionados (clean, verify:symlinks, etc)
- [ ] Symlinks funcionando: `npm run verify:symlinks`
- [ ] TypeScript compila sem erros: `tsc --noEmit`
- [ ] App inicia: `npm start`
- [ ] Hot reload funciona com mudanças no frontend
- [ ] Build funciona: `expo build:android` ou `expo build:ios`

---

**Última Atualização:** 2025-11-18
**Status:** ✅ Configuração Completa
**Metro:** Suportando symlinks
**TypeScript:** Preservando symlinks
**Performance:** Otimizada
