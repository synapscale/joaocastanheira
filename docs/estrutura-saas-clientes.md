# 📌 Estrutura de Hierarquias e Permissões no SaaS: Planos, Workspaces e Usuários

## ✅ 1. Níveis de Hierarquia (Quem gerencia o quê)

### **1.1. Primeiro Nível - Administração do SaaS (Donos do SaaS)**

* São os **administradores da plataforma SaaS** (ex: você e sua equipe).
* Função principal: **Criar, configurar e gerenciar os planos comerciais do SaaS**.
* Cada plano define:

  * Limite de workspaces
  * Limite de usuários por workspace
  * Funcionalidades disponíveis (ex: "pode exportar relatórios", "pode adicionar integrações", etc)
  * Limites de uso (ex: número de requisições, armazenamento etc)
  * Preço, ciclo de cobrança (ex: mensal, anual)
* Exemplo de planos:

  * **Free**
  * **Basic**
  * **Pro**
  * **Enterprise**

---

### **1.2. Segundo Nível - Clientes do SaaS (Usuários pagantes)**

* Cada cliente do SaaS é um **"admin de conta"**.
* Eles são os responsáveis por gerenciar o seu próprio ambiente, o qual chamaremos de **Workspace**.
* Eles podem:

  * **Criar outros usuários** dentro do seu workspace
  * **Gerenciar permissões desses usuários** (de acordo com o plano que eles compraram)
  * **Criar múltiplos workspaces**, se o plano permitir

---

## ✅ 2. Estrutura de Workspaces

### **2.1. Criação Automática do Workspace Padrão**

* Regra obrigatória:

  * Sempre que um novo usuário cliente criar uma conta no SaaS → **um Workspace individual e exclusivo é criado automaticamente para ele**.
  * Esse workspace é o **"Default Workspace"** ou **"Workspace da Conta"**.
  * Ele será o **admin principal** desse workspace.

### **2.2. Workspaces Adicionais (Se o plano permitir)**

* Clientes com planos superiores podem criar **vários workspaces adicionais**.
* Exemplo:

  * **Plano Basic:** Apenas o workspace padrão.
  * **Plano Pro:** Até 5 workspaces.
  * **Plano Enterprise:** Workspaces ilimitados.

---

## ✅ 3. Estrutura de Permissões dentro do Workspace (RBAC - Role-Based Access Control)

### **3.1. Funções padrão de usuários dentro de um Workspace**

Cada usuário dentro de um workspace pode ter funções como:

* **Admin:** Tem acesso total dentro do Workspace (incluindo gerenciamento de membros)
* **Editor:** Pode criar, editar e excluir recursos, mas não gerencia membros
* **Viewer:** Apenas visualiza os recursos
* **Custom Role (Opcional, dependendo do plano):** Roles personalizadas com permissões granularizadas

> Obs: O **Admin da Conta (dono do workspace padrão)** sempre será Admin nesse workspace, com todas as permissões máximas liberadas pelo plano dele.

---

## ✅ 4. Estrutura de Plano → Permissões → Recursos Disponíveis

### Exemplo de como o back-end pode controlar isso:

| Plano      | Workspaces | Membros por Workspace | Permissões Avançadas | Funcionalidades Extras       |
| ---------- | ---------- | --------------------- | -------------------- | ---------------------------- |
| Free       | 1          | 3                     | Básicas              | Nenhuma extra                |
| Basic      | 1          | 10                    | Moderadas            | Exportação de dados          |
| Pro        | 5          | 50                    | Avançadas            | Integrações + Webhooks       |
| Enterprise | Ilimitado  | Ilimitado             | Total                | API, SSO, Prioridade Suporte |

---

## ✅ 5. Estrutura Back-end (Banco de Dados + API)

### **Tabelas Principais (Modelo Relacional)**

* **Users**
* **Plans**
* **Workspaces**
* **Workspace\_Members**
* **Roles**
* **Permissions**
* **PlanFeatures (definição de quais recursos cada plano habilita)**

### **Eventos Automáticos no Back-end**

| Ação                          | Resultado Automático                          |
| ----------------------------- | --------------------------------------------- |
| Novo usuário cria conta       | Criação automática do Workspace padrão        |
| Upgrade de plano              | Alteração de limites e permissões disponíveis |
| Adição de membro ao workspace | Check se o limite de usuários já foi atingido |
| Criação de novo workspace     | Check se o plano permite múltiplos workspaces |

---

## ✅ 6. Estrutura Front-end (Fluxos de UI/UX necessários)

### Para os Admins do SaaS (Donos da Plataforma):

* Painel de gestão de Planos
* Interface de gestão de clientes
* Painel de cobrança / billing

### Para os Clientes do SaaS:

* Tela de gerenciamento de Workspaces
* Tela de gestão de membros dentro de cada Workspace
* Tela de gerenciamento de plano (visualizar plano atual, fazer upgrade, etc)
* Tela de permissões por usuário
* Tela de recursos disponíveis com base no plano

---

## ✅ 7. Resumo Visual da Hierarquia (SaaS Owners → Clientes → Membros dos Workspaces)

```
[Donos do SaaS (Plan Admins)]
        ↓
[Planos criados para venda]
        ↓
[Clientes SaaS (Cada cliente tem pelo menos 1 workspace)]
        ↓
[Usuários / Membros dentro dos workspaces]
```

---