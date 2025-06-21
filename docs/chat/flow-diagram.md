# Diagramas de Fluxo - Sistema de Chat

## Visão Geral

Este documento apresenta os diagramas de fluxo que ilustram o funcionamento completo do sistema de chat, desde a interface do usuário até as chamadas de API e tratamento de erros.

## 1. Fluxo Principal de Envio de Mensagem

```mermaid
graph TD
    A[Usuário digita mensagem] --> B[ChatInput captura evento]
    B --> C{Mensagem válida?}
    C -->|Não| D[Mostrar erro de validação]
    C -->|Sim| E[Criar mensagem temporária]
    E --> F[Adicionar à interface imediatamente]
    F --> G[Mostrar status 'sending']
    G --> H{Conversa ativa existe?}
    H -->|Não| I[Criar nova conversa]
    H -->|Sim| J[Usar conversa atual]
    I --> J
    J --> K[Chamar ChatService.sendChatMessage]
    K --> L[Salvar mensagem do usuário via API]
    L --> M[Processar com LLM via /llm/chat]
    M --> N[Salvar resposta do assistente]
    N --> O[Substituir mensagem temporária]
    O --> P[Adicionar resposta do assistente]
    P --> Q[Atualizar status para 'sent']
    Q --> R[Fim]
    
    K --> S{Erro na API?}
    S -->|Sim| T[Tentar fallback]
    T --> U{Fallback funciona?}
    U -->|Sim| O
    U -->|Não| V[Modo offline]
    V --> W[Criar resposta de erro]
    W --> X[Marcar mensagem como 'error']
    X --> R
    
    D --> R
```

## 2. Fluxo de Inicialização do Sistema

```mermaid
graph TD
    A[App inicia] --> B[Carregar contextos]
    B --> C[AppProvider]
    C --> D[ChatProvider]
    D --> E[useConversations hook]
    E --> F[Validar configuração]
    F --> G{Config válida?}
    G -->|Não| H[Mostrar erro de config]
    G -->|Sim| I[Inicializar ChatService]
    I --> J[Carregar conversas da API]
    J --> K{API disponível?}
    K -->|Não| L[Carregar conversas offline]
    K -->|Sim| M[Combinar dados API + offline]
    L --> N[Renderizar interface]
    M --> N
    N --> O[Sistema pronto]
    
    H --> P[Usar configuração padrão]
    P --> I
```

## 3. Fluxo de Carregamento de Conversa

```mermaid
graph TD
    A[Usuário seleciona conversa] --> B[setCurrentConversation]
    B --> C[Definir ID da conversa]
    C --> D[Carregar mensagens da API]
    D --> E{API disponível?}
    E -->|Não| F[Carregar apenas offline]
    E -->|Sim| G[Carregar mensagens offline]
    F --> H[Ordenar por timestamp]
    G --> I[Combinar API + offline]
    I --> J[Remover duplicatas]
    J --> H
    H --> K[Atualizar estado messages]
    K --> L[Renderizar mensagens]
    L --> M[Scroll para última mensagem]
    M --> N[Fim]
```

## 4. Fluxo de Tratamento de Erros

```mermaid
graph TD
    A[Erro ocorre] --> B{Tipo de erro?}
    B -->|React Error| C[Error Boundary captura]
    B -->|API Error| D[APIService trata]
    B -->|Hook Error| E[Hook trata com retry]
    B -->|Network Error| F[Fallback system]
    
    C --> G[Log do erro]
    D --> H{Status retryable?}
    E --> I{Tentativas < max?}
    F --> J[Tentar endpoints alternativos]
    
    G --> K[Mostrar fallback UI]
    H -->|Sim| L[Retry com backoff]
    H -->|Não| M[Mostrar erro específico]
    I -->|Sim| N[Retry operação]
    I -->|Não| O[Falha definitiva]
    J --> P{Algum funciona?}
    
    K --> Q[Opção de recuperação]
    L --> R[Nova tentativa]
    M --> S[Toast de erro]
    N --> T[Nova tentativa]
    O --> U[Log e notificação]
    P -->|Sim| V[Sucesso]
    P -->|Não| W[Modo offline]
    
    Q --> X[Fim]
    R --> X
    S --> X
    T --> X
    U --> X
    V --> X
    W --> X
```

## 5. Fluxo de Mapeamento de Modelos

```mermaid
graph TD
    A[Modelo selecionado no frontend] --> B[mapToApiModelName]
    B --> C{Modelo mapeado?}
    C -->|Sim| D[Usar nome da API]
    C -->|Não| E[Usar nome original]
    D --> F[getProviderFromModel]
    E --> F
    F --> G[Determinar provedor]
    G --> H[Validar configuração]
    H --> I{Chave API disponível?}
    I -->|Sim| J[Usar chave do usuário]
    I -->|Não| K[Usar chave do sistema]
    J --> L[Fazer chamada LLM]
    K --> L
    L --> M{Sucesso?}
    M -->|Sim| N[Retornar resposta]
    M -->|Não| O[Tentar outro provedor]
    O --> P[Fallback ou erro]
    N --> Q[Fim]
    P --> Q
```

## 6. Fluxo de Persistência Híbrida

```mermaid
graph TD
    A[Dados precisam ser salvos] --> B{Tipo de dados?}
    B -->|Conversa| C[Salvar na API]
    B -->|Mensagem usuário| D[Salvar na API]
    B -->|Mensagem assistente| E[Salvar no localStorage]
    
    C --> F{API disponível?}
    D --> G{API disponível?}
    E --> H[localStorage.setItem]
    
    F -->|Sim| I[POST /conversations/]
    F -->|Não| J[Salvar offline]
    G -->|Sim| K[POST /conversations/{id}/messages/]
    G -->|Não| L[Salvar offline]
    
    I --> M[Salvar backup offline]
    J --> N[Adicionar à fila de sync]
    K --> O[Salvar backup offline]
    L --> P[Adicionar à fila de sync]
    H --> Q[Dados salvos localmente]
    
    M --> R[Dados sincronizados]
    N --> S[Aguardar conexão]
    O --> R
    P --> S
    Q --> T[Fim]
    R --> T
    S --> U[Tentar sync quando online]
    U --> T
```

## 7. Fluxo de Interface do Usuário

```mermaid
graph TD
    A[ChatInterface renderiza] --> B[Carregar conversas]
    B --> C[Renderizar lista lateral]
    C --> D{Conversa selecionada?}
    D -->|Não| E[Mostrar tela inicial]
    D -->|Sim| F[Carregar mensagens]
    
    E --> G[Aguardar primeira mensagem]
    F --> H[Renderizar MessagesArea]
    
    G --> I[Usuário digita]
    H --> J[Renderizar cada mensagem]
    
    I --> K[ChatInput ativo]
    J --> L{Tipo de mensagem?}
    
    K --> M[Validar entrada]
    L -->|Usuário| N[UserMessage component]
    L -->|Assistente| O[AssistantMessage component]
    L -->|Sistema| P[SystemMessage component]
    
    M --> Q{Válida?}
    N --> R[Avatar + conteúdo à direita]
    O --> S[Avatar + conteúdo à esquerda]
    P --> T[Mensagem centralizada]
    
    Q -->|Sim| U[Enviar mensagem]
    Q -->|Não| V[Mostrar erro]
    
    U --> W[Mostrar TypingIndicator]
    W --> X[Aguardar resposta]
    X --> Y[Atualizar interface]
    Y --> Z[Scroll automático]
    
    R --> AA[Fim]
    S --> AA
    T --> AA
    V --> AA
    Z --> AA
```

## 8. Fluxo de Fallback e Recuperação

```mermaid
graph TD
    A[Operação falha] --> B[Identificar tipo de falha]
    B --> C{Falha de rede?}
    C -->|Sim| D[Verificar conectividade]
    C -->|Não| E{Falha de API?}
    
    D --> F{Online?}
    E --> G{Status HTTP?}
    
    F -->|Não| H[Modo offline]
    F -->|Sim| I[Tentar endpoint alternativo]
    
    G --> J{4xx?}
    G --> K{5xx?}
    G --> L{Timeout?}
    
    H --> M[Usar dados locais]
    I --> N{Sucesso?}
    
    J -->|400| O[Erro de validação]
    J -->|401| P[Erro de auth]
    J -->|404| Q[Endpoint não encontrado]
    J -->|422| R[Dados inválidos]
    
    K -->|500| S[Erro do servidor]
    K -->|502/503| T[Serviço indisponível]
    
    L --> U[Aumentar timeout]
    
    M --> V[Notificar modo offline]
    N -->|Sim| W[Operação concluída]
    N -->|Não| X[Próximo fallback]
    
    O --> Y[Corrigir dados]
    P --> Z[Renovar token]
    Q --> AA[Usar endpoint alternativo]
    R --> BB[Validar entrada]
    S --> CC[Tentar novamente]
    T --> DD[Aguardar e retry]
    U --> EE[Nova tentativa]
    
    V --> FF[Agendar sync]
    W --> GG[Fim - Sucesso]
    X --> HH[Verificar mais fallbacks]
    
    Y --> II[Tentar novamente]
    Z --> II
    AA --> II
    BB --> II
    CC --> II
    DD --> II
    EE --> II
    
    FF --> JJ[Fim - Offline]
    HH --> KK{Mais fallbacks?}
    
    KK -->|Sim| LL[Próximo fallback]
    KK -->|Não| MM[Falha definitiva]
    
    LL --> NN[Executar fallback]
    MM --> OO[Log e notificação]
    
    NN --> PP[Fim]
    OO --> PP
    II --> PP
    GG --> PP
    JJ --> PP
```

## 9. Fluxo de Sincronização Online/Offline

```mermaid
graph TD
    A[Sistema detecta mudança de conectividade] --> B{Ficou online?}
    B -->|Sim| C[Processar fila offline]
    B -->|Não| D[Ativar modo offline]
    
    C --> E[Carregar fila do localStorage]
    D --> F[Salvar operações localmente]
    
    E --> G{Fila vazia?}
    F --> H[Notificar usuário]
    
    G -->|Sim| I[Nada a sincronizar]
    G -->|Não| J[Para cada item na fila]
    
    I --> K[Fim]
    J --> L[Tentar operação]
    
    L --> M{Sucesso?}
    M -->|Sim| N[Remover da fila]
    M -->|Não| O[Incrementar tentativas]
    
    N --> P[Próximo item]
    O --> Q{Tentativas < max?}
    
    Q -->|Sim| R[Manter na fila]
    Q -->|Não| S[Remover da fila]
    
    P --> T{Mais itens?}
    R --> T
    S --> U[Log falha permanente]
    
    T -->|Sim| J
    T -->|Não| V[Sincronização completa]
    
    H --> W[Fim]
    U --> X[Fim]
    V --> Y[Notificar sucesso]
    Y --> Z[Fim]
    
    K --> AA[Fim]
    W --> AA
    X --> AA
    Z --> AA
```

## 10. Fluxo de Validação e Sanitização

```mermaid
graph TD
    A[Entrada do usuário] --> B[Validação básica]
    B --> C{Comprimento válido?}
    C -->|Não| D[Erro: muito longo/curto]
    C -->|Sim| E[Sanitização]
    
    E --> F[Remover scripts]
    F --> G[Escapar HTML]
    G --> H[Normalizar espaços]
    H --> I[Validação de conteúdo]
    
    I --> J{Conteúdo apropriado?}
    J -->|Não| K[Erro: conteúdo inadequado]
    J -->|Sim| L[Validação de anexos]
    
    L --> M{Tem anexos?}
    M -->|Não| N[Prosseguir]
    M -->|Sim| O[Validar tipo de arquivo]
    
    O --> P{Tipo permitido?}
    P -->|Não| Q[Erro: tipo não suportado]
    P -->|Sim| R[Validar tamanho]
    
    R --> S{Tamanho válido?}
    S -->|Não| T[Erro: arquivo muito grande]
    S -->|Sim| U[Scan de segurança]
    
    U --> V{Seguro?}
    V -->|Não| W[Erro: arquivo perigoso]
    V -->|Sim| N
    
    N --> X[Dados validados]
    
    D --> Y[Mostrar erro]
    K --> Y
    Q --> Y
    T --> Y
    W --> Y
    
    X --> Z[Prosseguir com envio]
    Y --> AA[Fim - Erro]
    Z --> BB[Fim - Sucesso]
```

## Legenda dos Diagramas

### Símbolos Utilizados
- **Retângulo**: Processo ou ação
- **Losango**: Decisão ou condição
- **Círculo**: Início ou fim
- **Hexágono**: Preparação ou configuração
- **Paralelogramo**: Entrada ou saída de dados

### Cores e Significados
- **Verde**: Fluxo de sucesso
- **Vermelho**: Fluxo de erro
- **Azul**: Processo normal
- **Amarelo**: Decisão ou validação
- **Roxo**: Fallback ou recuperação

### Convenções
- Setas sólidas: Fluxo principal
- Setas tracejadas: Fluxo alternativo
- Texto em negrito: Componentes principais
- Texto em itálico: Estados ou condições
``` 