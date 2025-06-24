# SynapScale Frontend - Arquitetura de Componentes

## 📁 Estrutura de Componentes

### Componentes de Nível Superior (Root)
Componentes principais localizados diretamente em `/components/`:

#### 🎨 Canvas e Workflow
- `canvas.tsx` - Componente principal do canvas
- `canvas-context-menu.tsx` - Menu contextual do canvas
- `canvas-controls.tsx` - Controles do canvas
- `canvas-grid.tsx` - Grid do canvas
- `canvas-quick-actions.tsx` - Ações rápidas do canvas
- `workflow-canvas.tsx` - Canvas específico para workflows
- `workflow-connection.tsx` - Conexões entre nós
- `workflow-editor.tsx` - Editor de workflows
- `workflow-header.tsx` - Cabeçalho do workflow
- `workflow-node.tsx` - Nós do workflow

#### 🔗 Conexões e Nós
- `connection-action-buttons.tsx` - Botões de ação para conexões
- `connection-actions.tsx` - Ações de conexões
- `connection-context-menu.tsx` - Menu contextual de conexões
- `connection-editor.tsx` - Editor de conexões
- `node-context-menu.tsx` - Menu contextual de nós
- `node-details-panel.tsx` - Painel de detalhes do nó
- `node-editor-dialog.tsx` - Dialog de edição de nós
- `node-panel.tsx` - Painel de nós
- `node-quick-actions.tsx` - Ações rápidas de nós

#### 🎮 Controles e Execução
- `execution-controls.tsx` - Controles de execução
- `executions-view.tsx` - Visualização de execuções
- `selection-box.tsx` - Caixa de seleção
- `mini-map.tsx` - Mini mapa do canvas

#### 🎨 Interface e Layout
- `client-layout.tsx` - Layout do cliente
- `layout-wrapper.tsx` - Wrapper de layout
- `sidebar.tsx` - Barra lateral principal
- `command-palette.tsx` - Paleta de comandos
- `keyboard-shortcuts.tsx` - Atalhos de teclado
- `tab-integration.tsx` - Integração de abas

#### 🎨 Tema e Personalização
- `theme-provider.tsx` - Provedor de tema
- `theme-selector.tsx` - Seletor de tema
- `theme-toggle.tsx` - Toggle de tema
- `adaptive-personalization.tsx` - Personalização adaptativa

#### 🔧 Integrações
- `multimodal-integration.tsx` - Integração multimodal
- `index.ts` - Arquivo de índice para exports

## 📂 Diretórios de Componentes Especializados

### `/admin/` - Administração
Componentes para área administrativa do sistema.

### `/agents/` - Agentes IA
Componentes relacionados à gestão e configuração de agentes de IA.

### `/analytics/` - Analytics
Componentes para dashboards, métricas e visualização de dados.

### `/auth/` - Autenticação
Componentes de login, registro, recuperação de senha e gestão de sessão.

### `/canvas/` - Canvas Avançado
Componentes específicos e avançados para o editor visual de workflows.

### `/chat/` - Chat
Componentes para interface de chat, mensagens e comunicação em tempo real.

### `/command/` - Comandos
Componentes relacionados à paleta de comandos e ações rápidas.

### `/component-selector/` - Seletor de Componentes
Componentes para seleção e configuração de elementos do workflow.

### `/docs/` - Documentação
Componentes para renderização e navegação da documentação.

### `/execution/` - Execução
Componentes para controle, monitoramento e visualização de execuções.

### `/form/` - Formulários
Componentes de formulários reutilizáveis e validação.

### `/keyboard-shortcuts/` - Atalhos
Componentes para gestão e exibição de atalhos de teclado.

### `/marketplace/` - Marketplace
Componentes para navegação, busca e gestão do marketplace de templates.

### `/node-creator/` - Criador de Nós
Componentes para criação e configuração de novos nós.

### `/node-definition/` - Definição de Nós
Componentes para definição e configuração de tipos de nós.

### `/node-editor/` - Editor de Nós
Componentes avançados para edição detalhada de nós.

### `/onboarding/` - Onboarding
Componentes para processo de introdução e tutorial de novos usuários.

### `/sidebar/` - Barra Lateral
Componentes específicos da barra lateral e navegação.

### `/team/` - Equipes
Componentes para gestão de equipes, membros e colaboração.
- Inclui componentes como `team-workspace-selector.tsx` e `enhanced-members-tab.tsx`

### `/templates/` - Templates
Componentes para gestão e utilização de templates de workflows.

### `/theme/` - Tema
Componentes avançados para personalização de tema e aparência.

### `/ui/` - Componentes UI Base
Componentes fundamentais baseados em Radix UI:
- Botões, inputs, dialogs, tooltips
- Componentes de layout
- Elementos de navegação
- Componentes de feedback

### `/variables/` - Variáveis
Componentes para gestão de variáveis do usuário e do sistema.

### `/workflow/` - Workflow Avançado
Componentes específicos para funcionalidades avançadas de workflows.

### `/workflow-connection/` - Conexões de Workflow
Componentes especializados para gestão de conexões entre nós.

### `/workflow-node/` - Nós de Workflow
Componentes especializados para diferentes tipos de nós de workflow.

### `/workspaces/` - Workspaces
Componentes para gestão de workspaces e ambientes de trabalho.

## 🏗️ Padrões de Arquitetura

### Hierarquia de Componentes
1. **Componentes de Layout** - Estrutura geral da aplicação
2. **Componentes de Feature** - Funcionalidades específicas
3. **Componentes UI Base** - Elementos reutilizáveis
4. **Componentes de Integração** - Conectores e wrappers

### Convenções de Nomenclatura
- **Kebab-case** para nomes de arquivos
- **PascalCase** para nomes de componentes
- **Sufixos descritivos** (Dialog, Panel, Editor, etc.)

### Organização por Funcionalidade
- Cada diretório representa uma área funcional
- Componentes relacionados agrupados
- Separação clara entre UI base e lógica de negócio

### Padrões de Composição
- **Compound Components** para componentes complexos
- **Render Props** para lógica reutilizável
- **Custom Hooks** para estado e efeitos
- **Context API** para estado global

## 🔄 Fluxo de Dados

### Estado Local
- React useState para estado simples
- useReducer para estado complexo
- Custom hooks para lógica reutilizável

### Estado Global
- Context API para dados compartilhados
- Contextos específicos por funcionalidade
- Providers organizados hierarquicamente

### Comunicação entre Componentes
- Props para comunicação pai-filho
- Callbacks para comunicação filho-pai
- Context para comunicação entre componentes distantes
- Custom events para casos específicos

## 🎨 Sistema de Design

### Componentes Base (UI)
- Baseados em Radix UI
- Estilizados com Tailwind CSS
- Variantes usando class-variance-authority
- Temas consistentes

### Componentes Compostos
- Combinação de componentes base
- Lógica de negócio integrada
- APIs consistentes
- Documentação inline

## 🧪 Estratégia de Testes

### Testes de Componentes
- Testing Library para testes de comportamento
- Jest para testes unitários
- Mocks para dependências externas
- Snapshots para regressão visual

### Organização de Testes
- Testes próximos aos componentes
- Utilitários de teste compartilhados
- Setup comum em jest.setup.js
- Coverage configurado

## 📝 Documentação

### Documentação de Componentes
- JSDoc para documentação inline
- Storybook para documentação visual (futuro)
- Exemplos de uso
- Props e APIs documentadas

### Guias de Desenvolvimento
- Padrões de criação de componentes
- Convenções de estilo
- Boas práticas de performance
- Guidelines de acessibilidade

---

**Última atualização**: 24/06/2025
**Versão do documento**: 1.0.0
