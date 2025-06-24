# 🚀 Scripts Directory - Development Workflow

Este diretório contém os arquivos essenciais para o **fluxo de desenvolvimento estruturado** usando Task Master.

## 📋 Fluxo Obrigatório

Antes de iniciar QUALQUER nova implementação, siga estes passos:

### 1️⃣ Criar PRD (Product Requirements Document)
```bash
# Copie o template e renomeie para PRD.txt
cp scripts/PRD-TEMPLATE.txt scripts/PRD.txt

# Edite o PRD.txt preenchendo todos os requisitos
```

### 2️⃣ Gerar Tarefas do PRD
```bash
# Parse o PRD para gerar tarefas estruturadas
task-master parse-prd scripts/PRD.txt --research --num-tasks=10
```

### 3️⃣ Analisar Complexidade
```bash
# Analise a complexidade das tarefas
task-master analyze-complexity --research --threshold=6
```

### 4️⃣ Expandir Tarefas
```bash
# Expanda todas as tarefas baseado na análise
task-master expand --all --research --force
```

### 5️⃣ Começar Implementação
```bash
# Obtenha a próxima tarefa para trabalhar
task-master next
```

## 📁 Arquivos

### `PRD-TEMPLATE.txt`
Template completo para criar PRDs estruturados. Inclui:
- ✅ Problem Statement
- ✅ Technical Requirements (Frontend, Backend, Integration)
- ✅ Acceptance Criteria
- ✅ Implementation Constraints
- ✅ Architecture Notes
- ✅ Risk Assessment
- ✅ Success Metrics

### `PRD.txt` (a ser criado)
Seu PRD atual para a implementação em andamento.

## 🎯 Exemplo de Uso

```bash
# 1. Copiar template
cp scripts/PRD-TEMPLATE.txt scripts/PRD.txt

# 2. Editar PRD.txt com os requisitos específicos
# [edite o arquivo preenchendo todos os campos]

# 3. Executar workflow completo
task-master parse-prd scripts/PRD.txt --research --num-tasks=10
task-master analyze-complexity --research --threshold=6
task-master expand --all --research --force
task-master next

# 4. Durante desenvolvimento
task-master set-status --id=5.1 --status=done
task-master update-subtask --id=5.2 --prompt="Implementado com sucesso"
task-master next
```

## 🚫 Não Faça

- ❌ Nunca inicie desenvolvimento sem criar PRD primeiro
- ❌ Não pule a análise de complexidade
- ❌ Não trabalhe sem estrutura de tarefas
- ❌ Não ignore as dependências entre tarefas

## ✅ Benefícios

- 📋 **Requisitos Completos**: Nada é esquecido
- 🏗️ **Estrutura Clara**: Tarefas bem organizadas
- 📊 **Complexidade Otimizada**: Tarefas do tamanho certo
- 🔍 **Research-Backed**: Melhores práticas atuais
- 📈 **Progresso Rastreável**: Histórico completo

---

**Regra Relacionada**: Ver [development-workflow.mdc](mdc:.cursor/rules/development-workflow.mdc) para detalhes completos. 