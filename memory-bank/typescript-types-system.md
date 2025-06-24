# SynapScale Frontend - Sistema de Tipos TypeScript

## 📋 Visão Geral

O SynapScale Frontend utiliza um sistema robusto de tipos TypeScript para garantir type safety, melhor experiência de desenvolvimento e documentação viva do código. Os tipos estão organizados por domínio funcional.

## 🗂️ Estrutura de Tipos

### 🤖 Agentes e IA
- **`agent-types.ts`** - Tipos relacionados a agentes de IA, configurações e comportamentos

### 💬 Chat e Comunicação
- **`chat.ts`** - Tipos para sistema de chat, mensagens e conversas

### 🔧 Componentes e Nós
- **`component-params.ts`** - Parâmetros e configurações de componentes
- **`component-selector.ts`** - Tipos para seleção de componentes
- **`component-types.ts`** - Tipos gerais de componentes
- **`node-definition.ts`** - Definições de tipos de nós
- **`node-template.ts`** - Templates de nós pré-configurados

### 🛒 Marketplace
- **`marketplace.ts`** - Tipos do marketplace principal
- **`marketplace-template.ts`** - Templates disponíveis no marketplace

### 🔄 Workflows e Automação
- **`workflow.ts`** - Tipos de workflows, execuções e configurações
- **`plan-types.ts`** - Tipos para planos e estratégias de automação

### 🏢 Workspace e Organização
- **`workspace-types.ts`** - Tipos para workspaces, membros e permissões

### 🎛️ Variáveis e Configuração
- **`variable.ts`** - Tipos para variáveis do usuário e sistema
- **`custom-category.ts`** - Categorias personalizadas

### 🌐 Globais
- **`global.d.ts`** - Declarações de tipos globais e extensões

## 🏗️ Arquitetura de Tipos

### Padrões de Nomenclatura
```typescript
// Interfaces para entidades principais
interface User {
  id: string;
  email: string;
  // ...
}

// Types para variações e uniões
type UserRole = 'admin' | 'member' | 'viewer';
type UserStatus = 'active' | 'inactive' | 'pending';

// Enums para constantes
enum WorkflowStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed'
}

// Tipos utilitários
type CreateUserData = Omit<User, 'id' | 'createdAt'>;
type UpdateUserData = Partial<Pick<User, 'email' | 'firstName' | 'lastName'>>;
```

## 🎯 Tipos Detalhados por Domínio

### 🤖 Agent Types
```typescript
// agent-types.ts
interface Agent {
  id: string;
  name: string;
  description: string;
  model: AIModel;
  configuration: AgentConfiguration;
  capabilities: AgentCapability[];
  status: AgentStatus;
  createdAt: string;
  updatedAt: string;
}

interface AgentConfiguration {
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  tools: AgentTool[];
  memory: AgentMemory;
}

type AgentStatus = 'active' | 'inactive' | 'training' | 'error';
type AgentCapability = 'text-generation' | 'code-generation' | 'image-analysis' | 'function-calling';

interface AgentTool {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, any>;
}
```

### 💬 Chat Types
```typescript
// chat.ts
interface Conversation {
  id: string;
  title: string;
  participants: Participant[];
  messages: Message[];
  status: ConversationStatus;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: MessageContent;
  type: MessageType;
  timestamp: string;
  reactions: MessageReaction[];
  metadata?: MessageMetadata;
}

interface MessageContent {
  text?: string;
  attachments?: Attachment[];
  code?: CodeBlock;
  workflow?: WorkflowReference;
}

type MessageType = 'text' | 'system' | 'workflow' | 'code' | 'file';
type ConversationStatus = 'active' | 'archived' | 'deleted';
```

### 🔧 Component Types
```typescript
// component-types.ts
interface WorkflowComponent {
  id: string;
  type: ComponentType;
  name: string;
  description: string;
  category: ComponentCategory;
  parameters: ComponentParameter[];
  inputs: ComponentPort[];
  outputs: ComponentPort[];
  configuration: ComponentConfiguration;
}

interface ComponentParameter {
  name: string;
  type: ParameterType;
  required: boolean;
  defaultValue?: any;
  validation?: ValidationRule[];
  description: string;
}

type ComponentType = 'trigger' | 'action' | 'condition' | 'transformer' | 'integration';
type ParameterType = 'string' | 'number' | 'boolean' | 'array' | 'object' | 'file';
```

### 🔄 Workflow Types
```typescript
// workflow.ts
interface Workflow {
  id: string;
  name: string;
  description: string;
  version: string;
  status: WorkflowStatus;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  variables: WorkflowVariable[];
  triggers: WorkflowTrigger[];
  schedule?: WorkflowSchedule;
  metadata: WorkflowMetadata;
  createdAt: string;
  updatedAt: string;
}

interface WorkflowNode {
  id: string;
  type: string;
  position: NodePosition;
  data: NodeData;
  configuration: NodeConfiguration;
  status?: NodeStatus;
}

interface WorkflowConnection {
  id: string;
  sourceNodeId: string;
  sourcePortId: string;
  targetNodeId: string;
  targetPortId: string;
  conditions?: ConnectionCondition[];
}

type WorkflowStatus = 'draft' | 'active' | 'paused' | 'completed' | 'error';
type NodeStatus = 'pending' | 'running' | 'completed' | 'error' | 'skipped';
```

### 🏢 Workspace Types
```typescript
// workspace-types.ts
interface Workspace {
  id: string;
  name: string;
  description: string;
  slug: string;
  ownerId: string;
  members: WorkspaceMember[];
  settings: WorkspaceSettings;
  plan: WorkspacePlan;
  usage: WorkspaceUsage;
  createdAt: string;
  updatedAt: string;
}

interface WorkspaceMember {
  id: string;
  userId: string;
  workspaceId: string;
  role: WorkspaceRole;
  permissions: Permission[];
  invitedAt: string;
  joinedAt?: string;
  status: MemberStatus;
}

type WorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer';
type MemberStatus = 'active' | 'invited' | 'suspended';

interface Permission {
  resource: PermissionResource;
  actions: PermissionAction[];
}

type PermissionResource = 'workflow' | 'agent' | 'workspace' | 'member';
type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'execute';
```

### 🛒 Marketplace Types
```typescript
// marketplace.ts
interface MarketplaceTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  tags: string[];
  author: TemplateAuthor;
  version: string;
  rating: TemplateRating;
  downloads: number;
  price: TemplatePrice;
  screenshots: string[];
  workflow: WorkflowTemplate;
  requirements: TemplateRequirement[];
  createdAt: string;
  updatedAt: string;
}

interface TemplateRating {
  average: number;
  count: number;
  distribution: Record<number, number>;
}

type TemplateCategory = 'automation' | 'integration' | 'ai' | 'data' | 'communication';
type TemplatePriceType = 'free' | 'paid' | 'subscription';
```

## 🔧 Tipos Utilitários

### Tipos de Resposta da API
```typescript
// Padrão para respostas da API
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: ApiError[];
}

interface ApiError {
  field?: string;
  code: string;
  message: string;
}

// Tipos para paginação
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### Tipos de Formulário
```typescript
// Tipos para formulários
interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Tipos para validação
interface ValidationRule {
  type: ValidationType;
  value?: any;
  message: string;
}

type ValidationType = 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
```

### Tipos de Estado
```typescript
// Estados assíncronos
interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Estados de UI
interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  language: string;
  notifications: Notification[];
}
```

## 🎨 Tipos de Interface

### Tipos de Componentes
```typescript
// Props de componentes
interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

interface ButtonProps extends BaseComponentProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

// Tipos para refs
interface ComponentRef {
  focus: () => void;
  blur: () => void;
  getValue: () => any;
  setValue: (value: any) => void;
}
```

### Tipos de Eventos
```typescript
// Eventos customizados
interface WorkflowEvent {
  type: WorkflowEventType;
  workflowId: string;
  nodeId?: string;
  data?: any;
  timestamp: string;
}

type WorkflowEventType = 'started' | 'completed' | 'failed' | 'paused' | 'resumed';

// Handlers de eventos
type EventHandler<T = any> = (event: T) => void;
type AsyncEventHandler<T = any> = (event: T) => Promise<void>;
```

## 🔄 Tipos Condicionais e Avançados

### Tipos Condicionais
```typescript
// Tipos condicionais baseados em propriedades
type NodeWithData<T extends WorkflowNode> = T extends { type: 'trigger' }
  ? T & { triggerData: TriggerData }
  : T extends { type: 'action' }
  ? T & { actionData: ActionData }
  : T;

// Tipos para diferentes estados
type WorkflowInState<S extends WorkflowStatus> = S extends 'active'
  ? ActiveWorkflow
  : S extends 'draft'
  ? DraftWorkflow
  : Workflow;
```

### Tipos Mapeados
```typescript
// Criar tipos opcionais
type PartialWorkflow = Partial<Workflow>;

// Criar tipos obrigatórios
type RequiredWorkflowData = Required<Pick<Workflow, 'name' | 'description'>>;

// Mapear tipos
type WorkflowKeys = keyof Workflow;
type WorkflowStringFields = {
  [K in keyof Workflow]: Workflow[K] extends string ? K : never;
}[keyof Workflow];
```

## 🧪 Tipos para Testes

### Tipos de Mock
```typescript
// Tipos para mocks
type MockedFunction<T extends (...args: any[]) => any> = jest.MockedFunction<T>;

interface MockedComponent<P = {}> {
  (props: P): JSX.Element;
  mockImplementation: (impl: (props: P) => JSX.Element) => void;
}

// Tipos para dados de teste
interface TestWorkflow extends Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'> {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

## 📝 Boas Práticas

### Organização de Tipos
1. **Separação por Domínio** - Agrupar tipos relacionados
2. **Nomenclatura Consistente** - Seguir convenções claras
3. **Documentação** - Comentários JSDoc quando necessário
4. **Reutilização** - Evitar duplicação de tipos

### Definição de Tipos
1. **Interfaces vs Types** - Usar interfaces para objetos, types para uniões
2. **Generics** - Usar para flexibilidade e reutilização
3. **Strict Mode** - Configurar TypeScript no modo estrito
4. **Utility Types** - Aproveitar tipos utilitários do TypeScript

### Validação e Segurança
1. **Runtime Validation** - Validar dados em runtime com Zod
2. **Type Guards** - Criar guards para verificação de tipos
3. **Branded Types** - Usar para IDs e valores específicos
4. **Discriminated Unions** - Para tipos com variações

---

**Última atualização**: 24/06/2025
**Versão do documento**: 1.0.0
