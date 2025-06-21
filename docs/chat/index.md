# Documentação do Sistema de Chat

## Visão Geral

Esta é a documentação completa do sistema de chat desenvolvido para o projeto. O sistema implementa uma interface conversacional moderna com múltiplos provedores de LLM (Large Language Models), incluindo OpenAI, Anthropic, Google e outros.

## 📚 Índice da Documentação

### 🏗️ Arquitetura e Estrutura
- **[README Principal](./README.md)** - Visão geral completa do sistema
- **[Arquitetura Técnica](./architecture.md)** - Detalhes da arquitetura em camadas
- **[Diagramas de Fluxo](./flow-diagram.md)** - Fluxogramas completos do sistema

### 🎨 Frontend e Interface
- **[Componentes Frontend](./frontend-components.md)** - Documentação dos componentes React
- **[Hooks e Estado](./hooks-state.md)** - Gerenciamento de estado e hooks customizados

### 🔧 Backend e Serviços
- **[Serviços Backend](./backend-services.md)** - ChatService, APIService e utilitários
- **[APIs e Endpoints](./api-endpoints.md)** - Documentação completa das APIs

### ⚙️ Configuração e Setup
- **[Setup e Configuração](./setup.md)** - Guia completo de instalação e configuração

### 🚨 Resolução de Problemas
- **[Troubleshooting](./troubleshooting.md)** - Problemas comuns e soluções
- **[Tratamento de Erros](./error-handling.md)** - Sistema robusto de tratamento de erros

## 🎯 Principais Funcionalidades

### ✅ Funcionalidades Implementadas

#### 🤖 **Integração com LLMs**
- ✅ OpenAI (GPT-4o, GPT-4o-mini)
- ✅ Anthropic (Claude 3.5 Sonnet, Claude 3 Opus)
- ✅ Google (Gemini Pro, Gemini Flash)
- ✅ Sistema de mapeamento de modelos automático
- ✅ Fallback entre provedores

#### 💬 **Interface de Chat**
- ✅ Interface moderna e responsiva
- ✅ Mensagens aparecem imediatamente
- ✅ Indicador de digitação do lado correto
- ✅ Status de mensagem (enviando, enviado, erro)
- ✅ Scroll automático para novas mensagens
- ✅ Avatares para usuário e assistente

#### 🗂️ **Gerenciamento de Conversas**
- ✅ Criação automática de conversas
- ✅ Lista de conversas na barra lateral
- ✅ Títulos baseados na primeira mensagem
- ✅ Persistência híbrida (API + localStorage)
- ✅ Carregamento de histórico completo

#### 🔄 **Sistema de Fallback**
- ✅ Múltiplos endpoints de API
- ✅ Modo offline funcional
- ✅ Retry automático com backoff exponencial
- ✅ Recuperação graceful de erros
- ✅ Sincronização quando volta online

#### 🛡️ **Tratamento de Erros**
- ✅ Error Boundaries React
- ✅ Tratamento em múltiplas camadas
- ✅ Notificações de erro inteligentes
- ✅ Logs detalhados para debug
- ✅ Sistema de monitoramento

#### 💾 **Persistência de Dados**
- ✅ Armazenamento híbrido (API + localStorage)
- ✅ Sincronização automática
- ✅ Backup offline das mensagens
- ✅ Recuperação de dados perdidos
- ✅ Limpeza automática de cache

## 🏛️ Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React/Next.js)                │
├─────────────────────────────────────────────────────────────┤
│  UI Components  │  Hooks & State  │  Context Providers      │
│  - ChatInterface│  - useConversations │  - ChatContext      │
│  - ChatInput    │  - useChat      │  - AppContext           │
│  - MessagesArea │  - Custom Hooks │  - AuthContext          │
├─────────────────────────────────────────────────────────────┤
│                    SERVICE LAYER                            │
│  - ChatService  │  - AI Utils     │  - API Service          │
│  - Model Mapper │  - JSON Parser  │  - Config Manager       │
├─────────────────────────────────────────────────────────────┤
│                    API LAYER                                │
│  - /conversations/  │  - /llm/chat    │  - Fallback APIs    │
│  - Error Handling   │  - Retry Logic  │  - Rate Limiting    │
├─────────────────────────────────────────────────────────────┤
│                  EXTERNAL SERVICES                          │
│  - OpenAI API      │  - Anthropic    │  - Google AI        │
│  - Meta Llama      │  - Mistral      │  - Cohere           │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Tecnologias Utilizadas

### Frontend
- **React 18** - Biblioteca de interface
- **Next.js 15.3.2** - Framework React
- **TypeScript 5** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Radix UI** - Componentes de base
- **Lucide React** - Ícones

### Estado e Dados
- **React Hooks** - Gerenciamento de estado
- **Context API** - Estado global
- **localStorage** - Persistência offline
- **Custom Hooks** - Lógica reutilizável

### APIs e Comunicação
- **Fetch API** - Requisições HTTP
- **WebSocket** - Comunicação em tempo real (futuro)
- **REST APIs** - Comunicação com backend
- **JSON** - Formato de dados

## 🚀 Como Começar

### 1. Leitura Recomendada
1. **[README Principal](./README.md)** - Entenda o sistema completo
2. **[Setup e Configuração](./setup.md)** - Configure seu ambiente
3. **[Arquitetura](./architecture.md)** - Compreenda a estrutura

### 2. Para Desenvolvedores Frontend
- **[Componentes Frontend](./frontend-components.md)**
- **[Hooks e Estado](./hooks-state.md)**
- **[Tratamento de Erros](./error-handling.md)**

### 3. Para Desenvolvedores Backend
- **[Serviços Backend](./backend-services.md)**
- **[APIs e Endpoints](./api-endpoints.md)**
- **[Diagramas de Fluxo](./flow-diagram.md)**

### 4. Para Resolução de Problemas
- **[Troubleshooting](./troubleshooting.md)**
- **[Tratamento de Erros](./error-handling.md)**

## 📋 Status do Projeto

### ✅ Problemas Resolvidos
- [x] Erro `chatgpt-4o` não encontrado → **Sistema de mapeamento implementado**
- [x] Duplicação de mensagens → **Mensagem temporária com substituição**
- [x] Mensagens não aparecem imediatamente → **Exibição imediata**
- [x] Indicador de digitação no lado errado → **Posicionamento correto**
- [x] Perda de contexto → **Sistema híbrido de persistência**
- [x] Criação automática de conversas → **Criação sob demanda**
- [x] Mensagens do assistente não salvam → **Fallback localStorage**
- [x] Erros de API diversos → **Sistema robusto de fallback**

### 🎯 Funcionalidades Principais
- [x] **Chat funcional** com múltiplos LLMs
- [x] **Interface moderna** e responsiva
- [x] **Persistência robusta** online/offline
- [x] **Tratamento de erros** em múltiplas camadas
- [x] **Sistema de fallback** automático
- [x] **Sincronização** automática de dados

## 🤝 Contribuindo

### Para Contribuir com a Documentação
1. Identifique seções que precisam de atualização
2. Mantenha o padrão de formatação
3. Inclua exemplos de código quando relevante
4. Atualize os diagramas se necessário

### Para Reportar Problemas
1. Consulte primeiro o **[Troubleshooting](./troubleshooting.md)**
2. Verifique os logs de erro
3. Inclua informações de contexto
4. Descreva os passos para reproduzir

## 📞 Suporte

### Recursos de Ajuda
- **Documentação**: Consulte os arquivos desta pasta
- **Logs**: Verifique o console do navegador
- **Debug**: Use as ferramentas de desenvolvimento
- **Health Check**: Execute os scripts de diagnóstico

### Informações Técnicas
- **Versão do Sistema**: 1.0.0
- **Última Atualização**: 2024-01-XX
- **Compatibilidade**: Next.js 15+, React 18+
- **Navegadores**: Chrome 90+, Firefox 88+, Safari 14+

---

*Esta documentação é mantida atualizada conforme o desenvolvimento do sistema. Para dúvidas ou sugestões, consulte os arquivos específicos ou entre em contato com a equipe de desenvolvimento.* 