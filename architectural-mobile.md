# Arquitetura MVVM - React Native Marketplace App

## 📋 Visão Geral

Aplicação mobile de marketplace desenvolvida com React Native seguindo o padrão **MVVM (Model-View-ViewModel)** e as boas práticas da Rocketseat. O projeto utiliza TypeScript e NativeWind para estilização, proporcionando maior segurança de tipos e melhor experiência de desenvolvimento.

## 🏗️ Estrutura de Diretórios

```
src/
├── app/                    # Telas da aplicação (Views)
│   ├── home/
│   │   ├── Home.view.tsx
│   │   ├── components/
│   │   │   ├── AppBottomSheet/
│   │   │   │   ├── index.tsx
│   │   │   │   └── styles.ts
│   │   │   ├── ProductList/
│   │   │   └── SearchBar/
│   │   └── hooks/
│   │       └── useDebounce.ts
│   │
│   ├── register/
│   │   ├── Register.view.tsx
│   │   ├── register.schema.ts
│   │   └── components/
│   │
│   ├── login/
│   │   ├── Login.view.tsx
│   │   ├── login.schema.ts
│   │   └── components/
│   │
│   ├── product-details/
│   │   ├── ProductDetails.view.tsx
│   │   └── components/
│   │
│   ├── cart/
│   │   ├── Cart.view.tsx
│   │   └── components/
│   │
│   └── profile/
│       ├── Profile.view.tsx
│       └── components/
│
├── viewModels/             # Lógica de negócio e estado (ViewModels)
│   ├── useRegister.viewModel.ts
│   ├── useLogin.viewModel.ts
│   ├── useHome.viewModel.ts
│   ├── useProductDetails.viewModel.ts
│   ├── useCart.viewModel.ts
│   └── useProfile.viewModel.ts
│
├── shared/                 # Recursos compartilhados
│   ├── components/         # Componentes reutilizáveis
│   │   ├── Button/
│   │   │   ├── index.tsx
│   │   │   └── types.ts
│   │   ├── Input/
│   │   ├── Card/
│   │   ├── Loading/
│   │   └── Header/
│   │
│   ├── hooks/              # Hooks customizados globais
│   │   ├── useAuth.ts
│   │   ├── useCart.ts
│   │   └── useDebounce.ts
│   │
│   ├── contexts/           # Contexts da API de Contexto
│   │   ├── AuthContext.tsx
│   │   └── CartContext.tsx
│   │
│   ├── services/           # Serviços e integrações
│   │   ├── api/
│   │   │   ├── index.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── products.service.ts
│   │   │   └── orders.service.ts
│   │   └── storage/
│   │       └── storage.service.ts
│   │
│   ├── models/             # Models (DTOs)
│   │   ├── User.model.ts
│   │   ├── Product.model.ts
│   │   ├── Order.model.ts
│   │   └── Cart.model.ts
│   │
│   ├── schemas/            # Schemas de validação compartilhados
│   │   ├── auth.schemas.ts
│   │   └── product.schemas.ts
│   │
│   ├── utils/              # Funções utilitárias
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   │
│   └── types/              # Tipos TypeScript globais
│       ├── navigation.d.ts
│       └── global.d.ts
│
├── assets/                 # Recursos estáticos
│   ├── images/
│   │   ├── logo.png
│   │   ├── placeholder.png
│   │   └── icons/
│   └── fonts/
│
├── styles/                 # Configurações de estilo
│   ├── theme.ts            # Tema NativeWind customizado
│   └── global.css          # Estilos globais Tailwind
│
├── routes/                 # Configuração de navegação
│   ├── app.routes.tsx
│   ├── auth.routes.tsx
│   └── index.tsx
│
└── App.tsx                 # Componente raiz
```

## 🎯 Padrão MVVM (Model-View-ViewModel)

### Separação de Responsabilidades

```
┌─────────────────────────────────────────────────────┐
│                      VIEW                            │
│  (React Components - Apresentação Visual)           │
│  - Register.view.tsx                                │
│  - Login.view.tsx                                   │
│  - Home.view.tsx                                    │
└─────────────────────────────────────────────────────┘
                         ↕️
┌─────────────────────────────────────────────────────┐
│                   VIEWMODEL                          │
│  (Hooks - Lógica de Negócio + Estado)              │
│  - useRegister.viewModel.ts                         │
│  - useLogin.viewModel.ts                            │
│  - useHome.viewModel.ts                             │
└─────────────────────────────────────────────────────┘
                         ↕️
┌─────────────────────────────────────────────────────┐
│                     MODEL                            │
│  (Dados + Services + Schemas)                       │
│  - User.model.ts                                    │
│  - auth.service.ts                                  │
│  - auth.schemas.ts                                  │
└─────────────────────────────────────────────────────┘
```

## 📱 Exemplo Completo: Feature de Registro

### 1. View (Register.view.tsx)

```typescript
// src/app/register/Register.view.tsx
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRegisterViewModel } from '@/viewModels/useRegister.viewModel';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { Loading } from '@/shared/components/Loading';

export function RegisterView() {
  const {
    // Estado
    formData,
    errors,
    isLoading,
    
    // Ações
    handleChange,
    handleSubmit,
    navigateToLogin,
  } = useRegisterViewModel();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <ScrollView className="flex-1 bg-white px-6">
      <View className="flex-1 justify-center py-8">
        <Text className="text-3xl font-bold text-gray-900 mb-2">
          Criar conta
        </Text>
        <Text className="text-base text-gray-600 mb-8">
          Preencha os dados para se cadastrar
        </Text>

        <Input
          label="Nome completo"
          placeholder="Digite seu nome"
          value={formData.name}
          onChangeText={(value) => handleChange('name', value)}
          error={errors.name}
          className="mb-4"
        />

        <Input
          label="E-mail"
          placeholder="Digite seu e-mail"
          keyboardType="email-address"
          autoCapitalize="none"
          value={formData.email}
          onChangeText={(value) => handleChange('email', value)}
          error={errors.email}
          className="mb-4"
        />

        <Input
          label="Telefone"
          placeholder="(00) 00000-0000"
          keyboardType="phone-pad"
          value={formData.phone}
          onChangeText={(value) => handleChange('phone', value)}
          error={errors.phone}
          className="mb-4"
        />

        <Input
          label="Senha"
          placeholder="Digite sua senha"
          secureTextEntry
          value={formData.password}
          onChangeText={(value) => handleChange('password', value)}
          error={errors.password}
          className="mb-4"
        />

        <Input
          label="Confirmar senha"
          placeholder="Confirme sua senha"
          secureTextEntry
          value={formData.confirmPassword}
          onChangeText={(value) => handleChange('confirmPassword', value)}
          error={errors.confirmPassword}
          className="mb-6"
        />

        <Button
          title="Cadastrar"
          onPress={handleSubmit}
          loading={isLoading}
          className="mb-4"
        />

        <TouchableOpacity
          onPress={navigateToLogin}
          className="items-center"
        >
          <Text className="text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Text className="text-blue-600 font-semibold">
              Fazer login
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
```

### 2. Schema (register.schema.ts)

```typescript
// src/app/register/register.schema.ts
import * as yup from 'yup';

export const registerSchema = yup.object().shape({
  name: yup
    .string()
    .required('Nome é obrigatório')
    .min(3, 'Nome deve ter no mínimo 3 caracteres'),
  
  email: yup
    .string()
    .required('E-mail é obrigatório')
    .email('E-mail inválido'),
  
  phone: yup
    .string()
    .required('Telefone é obrigatório')
    .matches(
      /^\(\d{2}\) \d{5}-\d{4}$/,
      'Telefone inválido. Use o formato (00) 00000-0000'
    ),
  
  password: yup
    .string()
    .required('Senha é obrigatória')
    .min(6, 'Senha deve ter no mínimo 6 caracteres'),
  
  confirmPassword: yup
    .string()
    .required('Confirmação de senha é obrigatória')
    .oneOf([yup.ref('password')], 'As senhas não coincidem'),
});

export type RegisterFormData = yup.InferType<typeof registerSchema>;
```

### 3. ViewModel (useRegister.viewModel.ts)

```typescript
// src/viewModels/useRegister.viewModel.ts
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import { registerSchema, type RegisterFormData } from '@/app/register/register.schema';
import { authService } from '@/shared/services/api/auth.service';
import { useAuth } from '@/shared/hooks/useAuth';

export function useRegisterViewModel() {
  const navigation = useNavigation();
  const { signIn } = useAuth();

  // Estado do formulário
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  // Estado de erros
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});

  // Estado de loading
  const [isLoading, setIsLoading] = useState(false);

  // Atualizar campo do formulário
  const handleChange = (field: keyof RegisterFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Limpar erro do campo ao digitar
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  // Validar formulário
  const validateForm = async (): Promise<boolean> => {
    try {
      await registerSchema.validate(formData, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const validationErrors: Partial<Record<keyof RegisterFormData, string>> = {};
        
        err.inner.forEach((error) => {
          if (error.path) {
            validationErrors[error.path as keyof RegisterFormData] = error.message;
          }
        });
        
        setErrors(validationErrors);
      }
      return false;
    }
  };

  // Submeter formulário
  const handleSubmit = async () => {
    // Validar formulário
    const isValid = await validateForm();
    if (!isValid) return;

    setIsLoading(true);

    try {
      // Registrar usuário
      await authService.register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      // Fazer login automaticamente após registro
      const { token, user } = await authService.login({
        email: formData.email,
        password: formData.password,
      });

      await signIn({ token, user });

      Alert.alert(
        'Sucesso!',
        'Sua conta foi criada com sucesso.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : 'Erro ao criar conta. Tente novamente.';
      
      Alert.alert('Erro', message);
    } finally {
      setIsLoading(false);
    }
  };

  // Navegar para login
  const navigateToLogin = () => {
    navigation.navigate('Login' as never);
  };

  return {
    // Estado
    formData,
    errors,
    isLoading,
    
    // Ações
    handleChange,
    handleSubmit,
    navigateToLogin,
  };
}
```

## 📱 Exemplo: Feature de Home com Debounce

### 1. View (Home.view.tsx)

```typescript
// src/app/home/Home.view.tsx
import React from 'react';
import { View, FlatList } from 'react-native';
import { useHomeViewModel } from '@/viewModels/useHome.viewModel';
import { Header } from '@/shared/components/Header';
import { SearchBar } from './components/SearchBar';
import { ProductCard } from '@/shared/components/ProductCard';
import { AppBottomSheet } from './components/AppBottomSheet';
import { Loading } from '@/shared/components/Loading';

export function HomeView() {
  const {
    // Estado
    products,
    searchQuery,
    isLoading,
    isRefreshing,
    bottomSheetRef,
    
    // Ações
    handleSearch,
    handleRefresh,
    handleProductPress,
    handleFilterPress,
  } = useHomeViewModel();

  return (
    <View className="flex-1 bg-gray-50">
      <Header title="Marketplace" />
      
      <SearchBar
        value={searchQuery}
        onChangeText={handleSearch}
        onFilterPress={handleFilterPress}
      />

      {isLoading && !isRefreshing ? (
        <Loading />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => handleProductPress(item.id)}
            />
          )}
          contentContainerClassName="p-4"
          onRefresh={handleRefresh}
          refreshing={isRefreshing}
          numColumns={2}
          columnWrapperClassName="gap-4"
        />
      )}

      <AppBottomSheet ref={bottomSheetRef} />
    </View>
  );
}
```

### 2. ViewModel (useHome.viewModel.ts)

```typescript
// src/viewModels/useHome.viewModel.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { productsService } from '@/shared/services/api/products.service';
import { useDebounce } from '@/shared/hooks/useDebounce';
import type { Product } from '@/shared/models/Product.model';

export function useHomeViewModel() {
  const navigation = useNavigation();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  // Estado
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Debounce na busca (500ms)
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Buscar produtos
  const fetchProducts = useCallback(async (search?: string) => {
    try {
      setIsLoading(true);
      const data = await productsService.getAll({ search });
      setProducts(data);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Efeito para buscar produtos quando o debounce mudar
  useEffect(() => {
    fetchProducts(debouncedSearchQuery);
  }, [debouncedSearchQuery, fetchProducts]);

  // Atualizar busca
  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  // Refresh manual
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchProducts(searchQuery);
    setIsRefreshing(false);
  };

  // Navegar para detalhes do produto
  const handleProductPress = (productId: string) => {
    navigation.navigate('ProductDetails' as never, { productId } as never);
  };

  // Abrir filtros (bottom sheet)
  const handleFilterPress = () => {
    bottomSheetRef.current?.present();
  };

  return {
    // Estado
    products,
    searchQuery,
    isLoading,
    isRefreshing,
    bottomSheetRef,
    
    // Ações
    handleSearch,
    handleRefresh,
    handleProductPress,
    handleFilterPress,
  };
}
```

### 3. Hook de Debounce (useDebounce.ts)

```typescript
// src/shared/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

## 📁 Estrutura por Feature

### Login Feature

```
src/app/login/
├── Login.view.tsx              # View (UI)
├── login.schema.ts             # Schema de validação
└── components/                 # Componentes específicos
    ├── SocialLoginButtons/
    └── ForgotPasswordLink/

src/viewModels/
└── useLogin.viewModel.ts       # ViewModel (lógica)
```

### Product Details Feature

```
src/app/product-details/
├── ProductDetails.view.tsx     # View
└── components/
    ├── ImageGallery/
    ├── ProductInfo/
    └── SellerCard/

src/viewModels/
└── useProductDetails.viewModel.ts  # ViewModel
```

### Cart Feature

```
src/app/cart/
├── Cart.view.tsx               # View
└── components/
    ├── CartItem/
    ├── CartSummary/
    └── EmptyCart/

src/viewModels/
└── useCart.viewModel.ts        # ViewModel
```

## 🔄 Fluxo de Dados no Padrão MVVM

### 1. Fluxo de Ação do Usuário

```
User Interaction (View)
    ↓
handleSubmit() chamado
    ↓
ViewModel valida dados
    ↓
ViewModel chama Service
    ↓
Service faz requisição API
    ↓
ViewModel atualiza estado
    ↓
View re-renderiza automaticamente
```

### 2. Exemplo Prático: Adicionar ao Carrinho

```typescript
// View
<Button onPress={() => handleAddToCart(product)} />
    ↓
// ViewModel
const handleAddToCart = async (product: Product) => {
  setIsLoading(true);
  
  try {
    // Lógica de negócio
    await cartService.addItem(product);
    
    // Atualizar contexto
    updateCart();
    
    // Feedback
    showSuccessToast('Produto adicionado ao carrinho');
  } catch (error) {
    showErrorToast('Erro ao adicionar produto');
  } finally {
    setIsLoading(false);
  }
};
```

## 🎨 Estilização com NativeWind

### Configuração (tailwind.config.js)

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5843BE',
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#5843BE',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
      },
      fontFamily: {
        regular: ['Roboto_400Regular'],
        medium: ['Roboto_500Medium'],
        bold: ['Roboto_700Bold'],
      },
    },
  },
  plugins: [],
};
```

### Uso nas Views

```typescript
// Ao invés de StyleSheet.create
<View className="flex-1 bg-white px-6 py-4">
  <Text className="text-2xl font-bold text-gray-900 mb-2">
    Título
  </Text>
  <Text className="text-base text-gray-600">
    Descrição
  </Text>
</View>

// Classes condicionais
<View className={`p-4 rounded-lg ${isActive ? 'bg-primary' : 'bg-gray-200'}`}>
  ...
</View>

// Com template literals
<TouchableOpacity 
  className={`
    py-3 px-6 rounded-lg
    ${disabled ? 'bg-gray-300' : 'bg-primary'}
    ${loading ? 'opacity-50' : 'opacity-100'}
  `}
>
  ...
</TouchableOpacity>
```

## 🧩 Models (DTOs)

### Estrutura de Models

```typescript
// src/shared/models/User.model.ts
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface UpdateUserDTO {
  name?: string;
  phone?: string;
  avatar?: string;
}

// src/shared/models/Product.model.ts
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: {
    id: string;
    name: string;
  };
  seller: {
    id: string;
    name: string;
    avatar: string;
  };
  stock: number;
  isNew: boolean;
  acceptTrade: boolean;
  paymentMethods: PaymentMethod[];
  createdAt: string;
}

export type PaymentMethod = 'pix' | 'card' | 'boleto' | 'cash' | 'deposit';

export interface CreateProductDTO {
  name: string;
  description: string;
  price: number;
  images: string[];
  categoryId: string;
  stock: number;
  isNew: boolean;
  acceptTrade: boolean;
  paymentMethods: PaymentMethod[];
}

// src/shared/models/Cart.model.ts
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemsCount: number;
}
```

## 🛠️ Services Layer

### Estrutura de Services

```typescript
// src/shared/services/api/index.ts
import axios from 'axios';
import { storageService } from '../storage/storage.service';

const api = axios.create({
  baseURL: process.env.API_URL || 'http://localhost:3333',
  timeout: 10000,
});

// Interceptor de request
api.interceptors.request.use(
  async (config) => {
    const token = await storageService.getToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de response
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await storageService.clearAll();
      // Redirecionar para login
    }
    
    const message = error.response?.data?.message || 'Erro inesperado';
    return Promise.reject(new Error(message));
  }
);

export { api };

// src/shared/services/api/auth.service.ts
import { api } from './index';
import type { User, CreateUserDTO } from '@/shared/models/User.model';

interface LoginDTO {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

class AuthService {
  async register(data: CreateUserDTO): Promise<User> {
    const response = await api.post<User>('/auth/register', data);
    return response.data;
  }

  async login(data: LoginDTO): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  }

  async me(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  }

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, password: string): Promise<void> {
    await api.post('/auth/reset-password', { token, password });
  }
}

export const authService = new AuthService();

// src/shared/services/api/products.service.ts
import { api } from './index';
import type { Product, CreateProductDTO } from '@/shared/models/Product.model';

interface GetProductsParams {
  search?: string;
  category?: string;
  isNew?: boolean;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  page: number;
  totalPages: number;
  totalItems: number;
}

class ProductsService {
  async getAll(params?: GetProductsParams): Promise<Product[]> {
    const response = await api.get<Product[]>('/products', { params });
    return response.data;
  }

  async getPaginated(params?: GetProductsParams): Promise<PaginatedResponse<Product>> {
    const response = await api.get<PaginatedResponse<Product>>('/products/paginated', { params });
    return response.data;
  }

  async getById(id: string): Promise<Product> {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  }

  async create(data: CreateProductDTO): Promise<Product> {
    const response = await api.post<Product>('/products', data);
    return response.data;
  }

  async update(id: string, data: Partial<CreateProductDTO>): Promise<Product> {
    const response = await api.put<Product>(`/products/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  }

  async uploadImages(productId: string, images: File[]): Promise<string[]> {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images', image);
    });

    const response = await api.post<{ urls: string[] }>(
      `/products/${productId}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.urls;
  }
}

export const productsService = new ProductsService();
```

## 📦 Shared Components

### Estrutura de Componente Compartilhado

```typescript
// src/shared/components/Button/index.tsx
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import type { ButtonProps } from './types';

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  ...rest
}: ButtonProps) {
  const baseClasses = 'rounded-lg items-center justify-center';
  
  const variantClasses = {
    primary: 'bg-primary',
    secondary: 'bg-gray-200',
    outline: 'border-2 border-primary bg-transparent',
  };
  
  const sizeClasses = {
    sm: 'py-2 px-4',
    md: 'py-3 px-6',
    lg: 'py-4 px-8',
  };
  
  const textVariantClasses = {
    primary: 'text-white',
    secondary: 'text-gray-900',
    outline: 'text-primary',
  };
  
  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${isDisabled ? 'opacity-50' : 'opacity-100'}
        ${className}
      `}
      activeOpacity={0.7}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : '#5843BE'} />
      ) : (
        <Text
          className={`
            font-semibold
            ${textVariantClasses[variant]}
            ${textSizeClasses[size]}
          `}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

// src/shared/components/Button/types.ts
import type { TouchableOpacityProps } from 'react-native';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

// src/shared/components/Input/index.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import type { InputProps } from './types';

export function Input({
  label,
  error,
  secureTextEntry = false,
  className = '',
  containerClassName = '',
  ...rest
}: InputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  return (
    <View className={containerClassName}>
      {label && (
        <Text className="text-sm font-medium text-gray-700 mb-2">
          {label}
        </Text>
      )}
      
      <View className="relative">
        <TextInput
          className={`
            px-4 py-3 rounded-lg bg-gray-100 text-gray-900
            ${isFocused ? 'border-2 border-primary' : 'border border-transparent'}
            ${error ? 'border-2 border-red-500' : ''}
            ${secureTextEntry ? 'pr-12' : ''}
            ${className}
          `}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...rest}
        />
        
        {secureTextEntry && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            className="absolute right-4 top-3"
          >
            {isPasswordVisible ? (
              <EyeOff size={20} color="#9CA3AF" />
            ) : (
              <Eye size={20} color="#9CA3AF" />
            )}
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text className="text-sm text-red-500 mt-1">
          {error}
        </Text>
      )}
    </View>
  );
}

// src/shared/components/Input/types.ts
import type { TextInputProps } from 'react-native';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
}
```

## 🎯 Vantagens do Padrão MVVM

### ✅ Separação Clara de Responsabilidades

```typescript
// ❌ Sem MVVM - Tudo misturado na View
function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async () => {
    setLoading(true);
    // validação aqui
    // chamada API aqui
    // navegação aqui
    setLoading(false);
  };
  
  return (/* JSX com lógica misturada */);
}

// ✅ Com MVVM - Responsabilidades separadas
function RegisterView() {
  const { formData, errors, handleSubmit } = useRegisterViewModel();
  
  return (/* JSX puro, apenas apresentação */);
}
```

### ✅ Testabilidade

```typescript
// ViewModel pode ser testado independentemente
describe('useRegisterViewModel', () => {
  it('should validate email correctly', () => {
    const { result } = renderHook(() => useRegisterViewModel());
    
    act(() => {
      result.current.handleChange('email', 'invalid-email');
    });
    
    expect(result.current.errors.email).toBeDefined();
  });
});
```

### ✅ Reutilização de Lógica

```typescript
// Mesma lógica pode ser usada em diferentes Views
function QuickRegisterModal() {
  const { handleSubmit, isLoading } = useRegisterViewModel();
  // UI diferente, mesma lógica
}
```

### ✅ Manutenção Facilitada

- Mudanças na UI não afetam a lógica
- Mudanças na lógica não afetam múltiplas Views
- Código mais organizado e fácil de entender

## 📊 Checklist de Implementação

### Para cada Feature:

- [ ] Criar View (.view.tsx) - apenas UI
- [ ] Criar Schema (.schema.ts) - validações
- [ ] Criar ViewModel (.viewModel.ts) - lógica
- [ ] Criar Models necessários
- [ ] Criar/atualizar Services
- [ ] Criar componentes específicos (se necessário)
- [ ] Adicionar testes unitários
- [ ] Adicionar navegação
- [ ] Testar fluxo completo

## 🚀 Exemplo de Navegação

```typescript
// src/routes/app.routes.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, ShoppingCart, User } from 'lucide-react-native';

import { HomeView } from '@/app/home/Home.view';
import { CartView } from '@/app/cart/Cart.view';
import { ProfileView } from '@/app/profile/Profile.view';

const Tab = createBottomTabNavigator();

export function AppRoutes() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#5843BE',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeView}
        options={{
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          tabBarLabel: 'Início',
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartView}
        options={{
          tabBarIcon: ({ color, size }) => <ShoppingCart size={size} color={color} />,
          tabBarLabel: 'Carrinho',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileView}
        options={{
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          tabBarLabel: 'Perfil',
        }}
      />
    </Tab.Navigator>
  );
}
```

## 📝 Convenções de Nomenclatura

### Arquivos

```
✅ Register.view.tsx          (View - PascalCase + .view)
✅ useRegister.viewModel.ts   (ViewModel - camelCase + use prefix)
✅ register.schema.ts         (Schema - camelCase + .schema)
✅ User.model.ts              (Model - PascalCase + .model)
✅ auth.service.ts            (Service - camelCase + .service)
```

### Componentes

```
✅ RegisterView               (Componente da View)
✅ useRegisterViewModel       (Hook do ViewModel)
✅ registerSchema             (Schema de validação)
```

## 🎓 Boas Práticas

### 1. Views Simples

```typescript
// ✅ View deve ser apenas apresentação
export function RegisterView() {
  const viewModel = useRegisterViewModel();
  return <UI usando viewModel />;
}

// ❌ Evitar lógica na View
export function RegisterView() {
  const [data, setData] = useState();
  // validações, calls API, etc
}
```

### 2. ViewModels Puros

```typescript
// ✅ ViewModel retorna apenas o necessário
export function useRegisterViewModel() {
  return {
    formData,
    handleSubmit,
    isLoading,
  };
}

// ❌ Evitar retornar componentes
export function useRegisterViewModel() {
  return {
    renderForm: () => <Form />, // ❌
  };
}
```

### 3. Schemas Reutilizáveis

```typescript
// ✅ Schema isolado e reutilizável
export const emailSchema = yup.string()
  .email('E-mail inválido')
  .required('E-mail é obrigatório');

export const loginSchema = yup.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = yup.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: confirmPasswordSchema,
});
```

## 📚 Referências

- [MVVM Pattern](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93viewmodel)
- [React Hooks](https://react.dev/reference/react)
- [React Navigation](https://reactnavigation.org/)
- [NativeWind](https://www.nativewind.dev/)
- [Yup Validation](https://github.com/jquense/yup)
- [Rocketseat](https://rocketseat.com.br/)

---

**Desenvolvido com ❤️ seguindo o padrão MVVM e boas práticas Rocketseat**
