# Design System - Finance App Mobile

**Versão:** 1.0
**Data:** 2025-11-17
**Status:** ✅ Completo

---

## 📋 Sumário

1. [Visão Geral](#visão-geral)
2. [Sistema de Temas](#sistema-de-temas)
3. [Componentes](#componentes)
4. [Acessibilidade](#acessibilidade)
5. [Guia de Uso](#guia-de-uso)

---

## Visão Geral

O Design System do Finance App fornece componentes reutilizáveis, consistentes e acessíveis para construir interfaces mobile de alta qualidade.

### Características

- ✅ **11 componentes UI** prontos para uso
- ✅ **Tema claro/escuro** com persistência
- ✅ **Acessibilidade WCAG AA** (contraste 4.5:1)
- ✅ **TypeScript** para type-safety completo
- ✅ **NativeWind** para estilização
- ✅ **Lucide Icons** para ícones consistentes

---

## Sistema de Temas

### Configuração (theme.ts)

O sistema de temas suporta modo claro e escuro com cores, tipografia e espaçamentos predefinidos.

```typescript
import { colors, typography, spacing } from '@/config/theme';
```

### Hook useTheme

```typescript
import { useTheme } from '@/shared/hooks/useTheme';

function MyComponent() {
  const {
    colors,          // Cores do tema atual
    theme,           // Tema completo
    isDark,          // Se está no modo escuro
    toggleColorScheme, // Alterna entre claro/escuro
    setSystemTheme,  // Segue tema do sistema
  } = useTheme();

  return (
    <View style={{ backgroundColor: colors.background }}>
      {/* Conteúdo */}
    </View>
  );
}
```

### Cores

#### Primária
- **Primary:** `#5843BE` (roxo)
- **Secondary:** `#3B82F6` (azul)

#### Status
- **Success:** `#10B981` (verde)
- **Error:** `#EF4444` (vermelho)
- **Warning:** `#F59E0B` (amarelo)
- **Info:** `#3B82F6` (azul)

#### Neutros (adaptam ao tema)
- `colors.background`
- `colors.surface`
- `colors.text.primary`
- `colors.text.secondary`
- `colors.border`

---

## Componentes

### 1. Button

Botão acessível com 4 variantes, 3 tamanhos, loading state e ícones.

#### Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `title` | `string` | - | Texto do botão |
| `onPress` | `() => void` | - | Callback ao pressionar |
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost'` | `'primary'` | Variante visual |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamanho do botão |
| `loading` | `boolean` | `false` | Estado de carregamento |
| `disabled` | `boolean` | `false` | Desabilita o botão |
| `leftIcon` | `LucideIcon` | - | Ícone à esquerda |
| `rightIcon` | `LucideIcon` | - | Ícone à direita |

#### Exemplo

```typescript
import { Button } from '@/shared/components/ui/Button';
import { Plus, ArrowRight } from 'lucide-react-native';

<Button
  title="Adicionar"
  onPress={() => console.log('Clicado')}
  variant="primary"
  size="md"
  leftIcon={Plus}
/>

<Button
  title="Carregando..."
  onPress={() => {}}
  loading
/>

<Button
  title="Avançar"
  onPress={() => {}}
  variant="outline"
  rightIcon={ArrowRight}
/>
```

---

### 2. Input

Campo de texto com validação, ícones e password toggle.

#### Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `label` | `string` | - | Label do input |
| `error` | `string` | - | Mensagem de erro |
| `helperText` | `string` | - | Texto de ajuda |
| `leftIcon` | `LucideIcon` | - | Ícone à esquerda |
| `rightIcon` | `LucideIcon` | - | Ícone à direita |
| `required` | `boolean` | `false` | Campo obrigatório |
| `disabled` | `boolean` | `false` | Desabilita o input |

#### Exemplo

```typescript
import { Input } from '@/shared/components/ui/Input';
import { Mail, Lock } from 'lucide-react-native';

const [email, setEmail] = useState('');
const [password, setPassword] = useState('');

<Input
  label="E-mail"
  placeholder="Digite seu e-mail"
  value={email}
  onChangeText={setEmail}
  leftIcon={Mail}
  error={emailError}
  required
/>

<Input
  label="Senha"
  placeholder="Digite sua senha"
  value={password}
  onChangeText={setPassword}
  leftIcon={Lock}
  secureTextEntry
  required
/>
```

---

### 3. MoneyInput

Campo de entrada de valores monetários com formatação automática em BRL.

#### Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `value` | `number` | - | Valor em centavos |
| `onChangeValue` | `(value: number) => void` | - | Callback ao mudar |
| `currency` | `string` | `'BRL'` | Código da moeda |
| `locale` | `string` | `'pt-BR'` | Locale de formatação |

#### Exemplo

```typescript
import { MoneyInput } from '@/shared/components/ui/Input';

const [amount, setAmount] = useState(0); // Em centavos

<MoneyInput
  label="Valor"
  value={amount}
  onChangeValue={setAmount}
  required
/>
// Usuário digita "123,45" → value = 12345 (centavos)
```

---

### 4. Card

Container com sombras e suporte a pressable.

#### Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `children` | `ReactNode` | - | Conteúdo do card |
| `pressable` | `boolean` | `false` | Se é clicável |
| `onPress` | `() => void` | - | Callback ao pressionar |
| `shadow` | `'sm' \| 'md' \| 'lg' \| 'none'` | `'md'` | Variante de sombra |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Padding interno |

#### Exemplo

```typescript
import { Card } from '@/shared/components/ui/Card';

<Card shadow="md" padding="md">
  <Text>Conteúdo do card</Text>
</Card>

<Card
  pressable
  onPress={() => console.log('Card clicado')}
  shadow="lg"
>
  <Text>Card clicável</Text>
</Card>
```

---

### 5. Modal

Modal fullscreen com backdrop e botão de fechar.

#### Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `visible` | `boolean` | - | Se está visível |
| `onClose` | `() => void` | - | Callback ao fechar |
| `children` | `ReactNode` | - | Conteúdo do modal |
| `dismissable` | `boolean` | `true` | Fecha ao tocar no backdrop |
| `showCloseButton` | `boolean` | `true` | Mostra botão X |

#### Exemplo

```typescript
import { Modal } from '@/shared/components/ui/Modal';

const [visible, setVisible] = useState(false);

<Button title="Abrir Modal" onPress={() => setVisible(true)} />

<Modal
  visible={visible}
  onClose={() => setVisible(false)}
>
  <Text className="text-xl font-bold">Título do Modal</Text>
  <Text className="mt-2">Conteúdo do modal...</Text>
</Modal>
```

---

### 6. BottomSheet

BottomSheet com drag e animações suaves.

#### Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `children` | `ReactNode` | - | Conteúdo |
| `snapPoints` | `Array<string \| number>` | `['25%', '50%', '90%']` | Pontos de snap |
| `title` | `string` | - | Título |
| `enableBackdrop` | `boolean` | `true` | Mostrar backdrop |

#### Exemplo

```typescript
import { BottomSheet, type BottomSheetModal } from '@/shared/components/ui/BottomSheet';
import { useRef } from 'react';

const bottomSheetRef = useRef<BottomSheetModal>(null);

<Button
  title="Abrir BottomSheet"
  onPress={() => bottomSheetRef.current?.present()}
/>

<BottomSheet
  ref={bottomSheetRef}
  snapPoints={['50%', '90%']}
  title="Filtros"
>
  <Text>Conteúdo do BottomSheet...</Text>
</BottomSheet>
```

---

### 7. Select

Campo de seleção com modal picker.

#### Props

| Prop | Tipo | Descrição |
|------|------|-----------|
| `label` | `string` | Label |
| `value` | `string` | Valor selecionado |
| `options` | `SelectOption[]` | Opções disponíveis |
| `onValueChange` | `(value: string) => void` | Callback ao mudar |
| `placeholder` | `string` | Placeholder |
| `error` | `string` | Mensagem de erro |

#### Exemplo

```typescript
import { Select } from '@/shared/components/ui/Select';

const [category, setCategory] = useState('');

const categories = [
  { label: 'Alimentação', value: 'food' },
  { label: 'Transporte', value: 'transport' },
  { label: 'Lazer', value: 'leisure' },
];

<Select
  label="Categoria"
  value={category}
  options={categories}
  onValueChange={setCategory}
  placeholder="Selecione uma categoria"
/>
```

---

### 8. DatePicker

Seletor de data nativo para iOS e Android.

#### Props

| Prop | Tipo | Descrição |
|------|------|-----------|
| `label` | `string` | Label |
| `value` | `Date` | Data selecionada |
| `onChange` | `(date: Date) => void` | Callback ao mudar |
| `minimumDate` | `Date` | Data mínima |
| `maximumDate` | `Date` | Data máxima |
| `displayFormat` | `'dd/MM/yyyy' \| 'MM/dd/yyyy' \| 'yyyy-MM-dd'` | Formato de exibição |

#### Exemplo

```typescript
import { DatePicker } from '@/shared/components/ui/DatePicker';

const [date, setDate] = useState(new Date());

<DatePicker
  label="Data"
  value={date}
  onChange={setDate}
  displayFormat="dd/MM/yyyy"
/>
```

---

### 9. Alert

Mensagens de feedback com 4 variantes.

#### Props

| Prop | Tipo | Descrição |
|------|------|-----------|
| `variant` | `'success' \| 'error' \| 'warning' \| 'info'` | Variante |
| `title` | `string` | Título |
| `message` | `string` | Mensagem |

#### Exemplo

```typescript
import { Alert } from '@/shared/components/ui/Alert';

<Alert
  variant="success"
  title="Sucesso!"
  message="Transação criada com sucesso."
/>

<Alert
  variant="error"
  message="Erro ao processar a solicitação."
/>
```

---

### 10. Badge

Indicador visual pequeno com cores temáticas.

#### Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `label` | `string` | - | Texto |
| `variant` | `'default' \| 'success' \| 'error' \| 'warning' \| 'info'` | `'default'` | Variante de cor |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamanho |

#### Exemplo

```typescript
import { Badge } from '@/shared/components/ui/Badge';

<Badge label="Novo" variant="info" size="sm" />
<Badge label="Pago" variant="success" />
<Badge label="Pendente" variant="warning" />
```

---

### 11. Skeleton

Placeholder animado para carregamento.

#### Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `width` | `number \| string` | `'100%'` | Largura |
| `height` | `number` | `16` | Altura |
| `variant` | `'rect' \| 'circle' \| 'text'` | `'rect'` | Forma |

#### Exemplo

```typescript
import { Skeleton } from '@/shared/components/ui/Skeleton';

<Skeleton width="100%" height={40} variant="rect" />
<Skeleton width={50} height={50} variant="circle" />
<Skeleton width="80%" height={16} variant="text" />
```

---

### 12. EmptyState

Estado vazio com ícone, título e ação.

#### Props

| Prop | Tipo | Descrição |
|------|------|-----------|
| `icon` | `LucideIcon` | Ícone |
| `title` | `string` | Título |
| `description` | `string` | Descrição |
| `action` | `{ label, onPress, ...ButtonProps }` | Ação primária |

#### Exemplo

```typescript
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { Inbox } from 'lucide-react-native';

<EmptyState
  icon={Inbox}
  title="Nenhuma transação"
  description="Você ainda não tem transações registradas."
  action={{
    label: 'Adicionar primeira transação',
    onPress: () => navigate('NewTransaction'),
  }}
/>
```

---

### 13. FAB (Floating Action Button)

Botão flutuante de ação principal.

#### Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `onPress` | `() => void` | - | Callback |
| `icon` | `LucideIcon` | `Plus` | Ícone |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamanho |
| `position` | `'bottom-right' \| 'bottom-left' \| 'bottom-center'` | `'bottom-right'` | Posição |
| `offset` | `number` | `16` | Distância da borda |

#### Exemplo

```typescript
import { FAB } from '@/shared/components/ui/FAB';
import { Plus } from 'lucide-react-native';

<FAB
  onPress={() => navigate('NewTransaction')}
  icon={Plus}
  position="bottom-right"
/>
```

---

### 14. Screen

Wrapper de tela com SafeArea e header.

#### Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `children` | `ReactNode` | - | Conteúdo |
| `scrollable` | `boolean` | `true` | Ativa scroll |
| `showHeader` | `boolean` | `true` | Mostra header |
| `title` | `string` | - | Título do header |
| `showBackButton` | `boolean` | `false` | Botão voltar |
| `onBack` | `() => void` | - | Callback ao voltar |
| `headerRight` | `ReactNode` | - | Componente direita do header |

#### Exemplo

```typescript
import { Screen } from '@/shared/components/ui/Screen';

<Screen
  title="Transações"
  scrollable
>
  <Text>Conteúdo da tela...</Text>
</Screen>

<Screen
  title="Detalhes"
  showBackButton
  onBack={() => navigation.goBack()}
  headerRight={<Button title="Editar" variant="ghost" />}
>
  <Text>Detalhes...</Text>
</Screen>
```

---

## Acessibilidade

Todos os componentes seguem as diretrizes WCAG AA:

### Contraste
- ✅ **Mínimo 4.5:1** para texto normal
- ✅ **Mínimo 3:1** para texto grande (18pt+)

### Tamanhos de Toque
- ✅ **iOS:** 44x44 pixels mínimo
- ✅ **Android:** 48x48 pixels mínimo

### Screen Readers
- ✅ **VoiceOver** (iOS) suportado
- ✅ **TalkBack** (Android) suportado
- ✅ Labels semânticos em todos os elementos

### Propriedades de Acessibilidade

Todos os componentes incluem:
```typescript
accessible={true}
accessibilityLabel="Descrição"
accessibilityRole="button"
accessibilityHint="Ação ao interagir"
accessibilityState={{ disabled, selected }}
```

---

## Guia de Uso

### 1. Importação

```typescript
// Componentes individuais
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';

// Hook de tema
import { useTheme } from '@/shared/hooks/useTheme';

// Configurações
import { colors, typography } from '@/config/theme';
```

### 2. Composição de Telas

```typescript
import { Screen } from '@/shared/components/ui/Screen';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';

export function MyScreen() {
  return (
    <Screen title="Minha Tela" scrollable>
      <Card shadow="md" padding="md" className="m-4">
        <Text>Conteúdo do card</Text>
        <Button
          title="Ação"
          onPress={() => {}}
          className="mt-4"
        />
      </Card>
    </Screen>
  );
}
```

### 3. Formulários

```typescript
import { Screen } from '@/shared/components/ui/Screen';
import { Input, MoneyInput } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { DatePicker } from '@/shared/components/ui/DatePicker';
import { Button } from '@/shared/components/ui/Button';

export function FormScreen() {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date());

  return (
    <Screen title="Nova Transação" scrollable>
      <View className="p-4">
        <Input
          label="Descrição"
          value={description}
          onChangeText={setDescription}
          required
        />

        <MoneyInput
          label="Valor"
          value={amount}
          onChangeValue={setAmount}
          required
          containerClassName="mt-4"
        />

        <Select
          label="Categoria"
          value={category}
          options={categories}
          onValueChange={setCategory}
          containerClassName="mt-4"
        />

        <DatePicker
          label="Data"
          value={date}
          onChange={setDate}
          containerClassName="mt-4"
        />

        <Button
          title="Salvar"
          onPress={handleSubmit}
          className="mt-6"
        />
      </View>
    </Screen>
  );
}
```

---

## Recursos Adicionais

### Documentação de Referência
- [NativeWind](https://www.nativewind.dev/)
- [Lucide Icons](https://lucide.dev/)
- [React Native](https://reactnative.dev/)
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)

### Arquivos do Projeto
- `src/config/theme.ts` - Configuração de temas
- `src/shared/hooks/useTheme.ts` - Hook de tema
- `src/shared/components/ui/` - Componentes UI

---

**Desenvolvido com ❤️ para Finance App**
**Última atualização:** 2025-11-17
**Versão:** 1.0
