# 🧠 Memory Bank - SynapScale Frontend

## 📋 Visão Geral

Este diretório contém a documentação consolidada e o "banco de memória" do projeto SynapScale Frontend. Aqui você encontrará informações detalhadas sobre a arquitetura, padrões de desenvolvimento, estrutura de componentes e todas as práticas utilizadas no projeto.

## 📚 Documentos Disponíveis

### 🏗️ [Project Overview](./project-overview.md)
**Visão geral completa do projeto**
- Informações básicas e propósito
- Stack tecnológico
- Estrutura de diretórios
- Funcionalidades principais
- Configuração e deploy
- Scripts e comandos disponíveis

### 🧩 [Components Architecture](./components-architecture.md)
**Arquitetura e organização de componentes**
- Estrutura de componentes por funcionalidade
- Padrões de nomenclatura e organização
- Hierarquia e composição
- Sistema de design
- Estratégias de teste

### 🔄 [Context State Management](./context-state-management.md)
**Gerenciamento de estado com Context API**
- Contextos disponíveis por domínio
- Arquitetura de providers
- Fluxo de dados e comunicação
- Hooks customizados para contextos
- Performance e otimização
- Sincronização com backend

### 🎣 [Hooks Custom Logic](./hooks-custom-logic.md)
**Hooks customizados e lógica reutilizável**
- Hooks por categoria funcional
- Padrões de arquitetura
- Hooks de performance e integração
- Hooks de interface e utilitários
- Estratégias de teste
- Boas práticas de desenvolvimento

### 🔧 [TypeScript Types System](./typescript-types-system.md)
**Sistema de tipos TypeScript**
- Estrutura de tipos por domínio
- Padrões de nomenclatura
- Tipos utilitários e condicionais
- Tipos para API e formulários
- Tipos para testes
- Boas práticas de tipagem

### 📐 [Development Patterns](./development-patterns.md)
**Padrões e convenções de desenvolvimento**
- Arquitetura geral e nomenclatura
- Padrões de componentes e hooks
- Gerenciamento de estado
- Estilização com Tailwind CSS
- Padrões de API e testes
- Segurança e performance
- Documentação de código

## 🎯 Como Usar Este Memory Bank

### Para Desenvolvedores Novos no Projeto
1. **Comece com** [Project Overview](./project-overview.md) para entender o contexto geral
2. **Continue com** [Development Patterns](./development-patterns.md) para conhecer as convenções
3. **Explore** os documentos específicos conforme a necessidade

### Para Desenvolvimento de Features
1. **Consulte** [Components Architecture](./components-architecture.md) para estruturar componentes
2. **Verifique** [Context State Management](./context-state-management.md) para gerenciar estado
3. **Use** [Hooks Custom Logic](./hooks-custom-logic.md) para lógica reutilizável
4. **Aplique** [TypeScript Types System](./typescript-types-system.md) para tipagem

### Para Manutenção e Refatoração
1. **Revise** [Development Patterns](./development-patterns.md) para manter consistência
2. **Atualize** a documentação conforme mudanças no código
3. **Mantenha** os padrões estabelecidos

## 🔄 Manutenção da Documentação

### Quando Atualizar
- **Novos componentes** → Atualizar [Components Architecture](./components-architecture.md)
- **Novos contextos** → Atualizar [Context State Management](./context-state-management.md)
- **Novos hooks** → Atualizar [Hooks Custom Logic](./hooks-custom-logic.md)
- **Novos tipos** → Atualizar [TypeScript Types System](./typescript-types-system.md)
- **Novos padrões** → Atualizar [Development Patterns](./development-patterns.md)
- **Mudanças estruturais** → Atualizar [Project Overview](./project-overview.md)

### Como Atualizar
1. **Identifique** o documento relevante
2. **Adicione** as novas informações mantendo o formato
3. **Atualize** a data de "Última atualização"
4. **Mantenha** a consistência com outros documentos

## 📖 Estrutura dos Documentos

Cada documento segue uma estrutura consistente:

```markdown
# Título do Documento

## 📋 Visão Geral
Descrição geral do conteúdo

## 🗂️ Seções Organizadas
Conteúdo organizado por categorias

## 🏗️ Exemplos Práticos
Códigos e exemplos de uso

## 📝 Boas Práticas
Recomendações e convenções

---
**Última atualização**: DD/MM/AAAA
**Versão do documento**: X.X.X
```

## 🎨 Convenções de Formatação

### Emojis para Seções
- 📋 Visão Geral
- 🗂️ Estrutura/Organização
- 🏗️ Arquitetura/Implementação
- 🎯 Detalhes Específicos
- 🔄 Fluxos/Processos
- 🚀 Performance/Otimização
- 🧪 Testes
- 🔒 Segurança
- 📝 Boas Práticas
- 🎨 Interface/Design

### Formatação de Código
- **Blocos de código** com syntax highlighting
- **Comentários explicativos** em português
- **Exemplos práticos** sempre que possível
- **Interfaces TypeScript** bem documentadas

### Links e Referências
- **Links internos** entre documentos do memory bank
- **Referências** a arquivos específicos do projeto
- **Exemplos** baseados no código real

## 🔍 Busca e Navegação

### Por Funcionalidade
- **Autenticação** → Context State Management, Development Patterns
- **Componentes UI** → Components Architecture, Development Patterns
- **Canvas/Editor** → Components Architecture, Hooks Custom Logic
- **Chat** → Context State Management, TypeScript Types System
- **Workflows** → TypeScript Types System, Development Patterns

### Por Tipo de Informação
- **Arquitetura** → Project Overview, Components Architecture
- **Estado** → Context State Management, Hooks Custom Logic
- **Tipos** → TypeScript Types System
- **Padrões** → Development Patterns
- **Performance** → Hooks Custom Logic, Development Patterns

## 📊 Métricas de Qualidade

### Documentação
- ✅ Todos os componentes principais documentados
- ✅ Todos os contextos mapeados
- ✅ Hooks customizados catalogados
- ✅ Tipos organizados por domínio
- ✅ Padrões de desenvolvimento estabelecidos

### Consistência
- ✅ Nomenclatura padronizada
- ✅ Estrutura de arquivos organizada
- ✅ Convenções de código definidas
- ✅ Padrões de teste estabelecidos

## 🚀 Próximos Passos

### Melhorias Planejadas
1. **Diagramas visuais** da arquitetura
2. **Exemplos interativos** de componentes
3. **Guias de migração** para atualizações
4. **Métricas de performance** documentadas

### Contribuições
- **Mantenha** a documentação atualizada
- **Adicione** exemplos práticos
- **Melhore** a clareza das explicações
- **Sugira** novos padrões quando necessário

---

**Criado em**: 24/06/2025
**Última atualização**: 24/06/2025
**Versão**: 1.0.0
**Mantenedor**: Equipe SynapScale Frontend
