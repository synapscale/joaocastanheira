# SynapScale Frontend - Padrões de Desenvolvimento

## 📋 Visão Geral

Este documento consolida os principais padrões de desenvolvimento utilizados no SynapScale Frontend, incluindo convenções de código, arquitetura de componentes, gerenciamento de estado e boas práticas.

## 🏗️ Arquitetura Geral

### Estrutura de Pastas
```
src/
├── app/                    # App Router (Next.js 15)
│   ├── (auth)/            # Grupos de rotas
│   ├── api/               # API Routes
│   └── globals.css        # Estilos globais
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes base
│   └── [feature]/        # Componentes por funcionalidade
├── context/              # Contextos React
├── hooks/                # Hooks customizados
├── lib/                  # Utilitários e configurações
├── types/                # Definições TypeScript
└── utils/                # Funções utilitárias
```

### Padrões de Nomenclatura
- **Arquivos**: kebab-case (`user-profile.tsx`)
- **Componentes**: PascalCase (`UserProfile`)
- **Hooks**: camelCase com prefixo "use" (`useUserProfile`)
- **Contextos**: PascalCase com sufixo "Context" (`UserContext`)
- **Tipos**: PascalCase (`UserProfile`, `ApiResponse<T>`)

## 🎨 Padrões de Componentes

### Estrutura Base de Componente
```typescript
// user-profile.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface UserProfileProps {
  user: User;
  className?: string;
  onEdit?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  user,
  className,
  onEdit
}) => {
  return (
    <div className={cn('user-profile', className)}>
      {/* Conteúdo do componente */}
    </div>
  );
};

UserProfile.displayName = 'UserProfile';
```

### Padrões de Props
```typescript
// Props base para todos os componentes
interface BaseProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

// Props para componentes com ações
interface ActionableProps extends BaseProps {
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

// Props para componentes de formulário
interface FormComponentProps<T> extends BaseProps {
  value: T;
  onChange: (value: T) => void;
  error?: string;
  required?: boolean;
}
```

### Compound Components
```typescript
// Padrão para componentes compostos
interface CardProps extends BaseProps {}
interface CardHeaderProps extends BaseProps {}
interface CardContentProps extends BaseProps {}

const Card: React.FC<CardProps> & {
  Header: React.FC<CardHeaderProps>;
  Content: React.FC<CardContentProps>;
} = ({ children, className }) => (
  <div className={cn('card', className)}>
    {children}
  </div>
);

Card.Header = ({ children, className }) => (
  <div className={cn('card-header', className)}>
    {children}
  </div>
);

Card.Content = ({ children, className }) => (
  <div className={cn('card-content', className)}>
    {children}
  </div>
);

// Uso:
// <Card>
//   <Card.Header>Título</Card.Header>
//   <Card.Content>Conteúdo</Card.Content>
// </Card>
```

## 🎣 Padrões de Hooks

### Hook Customizado Básico
```typescript
// use-user-profile.ts
interface UseUserProfileOptions {
  userId: string;
  autoRefresh?: boolean;
}

interface UseUserProfileReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  update: (data: Partial<User>) => Promise<void>;
}

export const useUserProfile = (
  options: UseUserProfileOptions
): UseUserProfileReturn => {
  const [state, setState] = useState({
    user: null,
    loading: true,
    error: null,
  });

  const refresh = useCallback(async () => {
    // Lógica de refresh
  }, [options.userId]);

  const update = useCallback(async (data: Partial<User>) => {
    // Lógica de update
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    ...state,
    refresh,
    update,
  };
};
```

### Hook com Context
```typescript
// use-auth.ts
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
};
```

## 🔄 Padrões de Estado

### Context Pattern
```typescript
// auth-context.tsx
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

interface AuthContextValue extends AuthState, AuthActions {}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
  });

  const actions = useMemo<AuthActions>(() => ({
    login: async (credentials) => {
      // Implementação
    },
    logout: () => {
      // Implementação
    },
    refresh: async () => {
      // Implementação
    },
  }), []);

  const value = useMemo(() => ({
    ...state,
    ...actions,
  }), [state, actions]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Async State Pattern
```typescript
// Padrão para estados assíncronos
interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

const useAsyncState = <T>(
  asyncFn: () => Promise<T>,
  deps: React.DependencyList = []
) => {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    const execute = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const data = await asyncFn();
        if (!cancelled) {
          setState({ data, loading: false, error: null });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    };

    execute();

    return () => {
      cancelled = true;
    };
  }, deps);

  return state;
};
```

## 🎨 Padrões de Estilização

### Tailwind CSS com CVA
```typescript
// button.tsx
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline text-primary',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
```

### Responsive Design
```typescript
// Padrão para componentes responsivos
const ResponsiveComponent: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  return (
    <div className={cn(
      'grid gap-4',
      isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-3'
    )}>
      {/* Conteúdo */}
    </div>
  );
};
```

## 🔧 Padrões de API

### API Client Pattern
```typescript
// api-client.ts
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint);
  }

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Outros métodos...
}
```

### React Query Pattern
```typescript
// use-users.ts
export const useUsers = (params?: UserQueryParams) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => apiClient.get<User[]>('/users', { params }),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData: CreateUserData) => 
      apiClient.post<User>('/users', userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
```

## 🧪 Padrões de Testes

### Component Testing
```typescript
// user-profile.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { UserProfile } from './user-profile';

const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
};

describe('UserProfile', () => {
  it('renders user information', () => {
    render(<UserProfile user={mockUser} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = jest.fn();
    render(<UserProfile user={mockUser} onEdit={onEdit} />);
    
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    
    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});
```

### Hook Testing
```typescript
// use-user-profile.test.ts
import { renderHook, act } from '@testing-library/react';
import { useUserProfile } from './use-user-profile';

describe('useUserProfile', () => {
  it('loads user profile on mount', async () => {
    const { result } = renderHook(() => 
      useUserProfile({ userId: '1' })
    );

    expect(result.current.loading).toBe(true);

    await act(async () => {
      // Aguardar carregamento
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toBeDefined();
  });
});
```

## 🔒 Padrões de Segurança

### Input Validation
```typescript
// validation.ts
import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  age: z.number().min(18, 'Deve ser maior de idade'),
});

export type UserFormData = z.infer<typeof userSchema>;

// Uso em componente
const UserForm: React.FC = () => {
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  // ...
};
```

### Authentication Guards
```typescript
// auth-guard.tsx
interface AuthGuardProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  fallback?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requiredPermissions = [],
  fallback = <div>Acesso negado</div>,
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredPermissions.length > 0) {
    const hasPermission = requiredPermissions.every(permission =>
      user?.permissions.includes(permission)
    );

    if (!hasPermission) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};
```

## 📝 Padrões de Documentação

### Component Documentation
```typescript
/**
 * UserProfile component displays user information and provides edit functionality.
 * 
 * @example
 * ```tsx
 * <UserProfile 
 *   user={user} 
 *   onEdit={() => setEditMode(true)} 
 * />
 * ```
 */
interface UserProfileProps {
  /** User object containing profile information */
  user: User;
  /** Optional CSS class name */
  className?: string;
  /** Callback function called when edit button is clicked */
  onEdit?: () => void;
}
```

### Hook Documentation
```typescript
/**
 * Custom hook for managing user profile data.
 * 
 * @param options - Configuration options
 * @returns Object containing user data, loading state, and actions
 * 
 * @example
 * ```tsx
 * const { user, loading, refresh } = useUserProfile({ userId: '1' });
 * ```
 */
export const useUserProfile = (options: UseUserProfileOptions) => {
  // Implementation
};
```

## 🚀 Padrões de Performance

### Memoization
```typescript
// Memoização de componentes
const ExpensiveComponent = React.memo<Props>(({ data, onAction }) => {
  const processedData = useMemo(() => {
    return data.map(item => processItem(item));
  }, [data]);

  const handleAction = useCallback((id: string) => {
    onAction(id);
  }, [onAction]);

  return (
    <div>
      {processedData.map(item => (
        <Item key={item.id} data={item} onAction={handleAction} />
      ))}
    </div>
  );
});
```

### Lazy Loading
```typescript
// Lazy loading de componentes
const LazyComponent = React.lazy(() => import('./heavy-component'));

const App: React.FC = () => (
  <Suspense fallback={<div>Carregando...</div>}>
    <LazyComponent />
  </Suspense>
);
```

---

**Última atualização**: 24/06/2025
**Versão do documento**: 1.0.0
