# 🧪 GUIA DE TESTE - SISTEMA DE PLANOS E HIERARQUIAS

## 🎯 **COMO TESTAR TODAS AS FUNCIONALIDADES**

### **1. Acesse a Aplicação**
```
http://localhost:3001/team
```

### **2. Teste a Página Team - Aba "Visão Geral"**

✅ **Verificações:**
- [ ] Página carrega sem erros
- [ ] Mostra plano atual (Free por padrão)
- [ ] Exibe estatísticas em tempo real
- [ ] Barras de progresso funcionando
- [ ] Botão "Upgrade" visível (se Free)

✅ **Dados Esperados:**
- Workspaces: Número real dos seus workspaces
- Membros: Contagem real de membros
- Storage: Uso real calculado
- API Calls: 150 (mockado)

### **3. Teste a Aba "Workspaces"**

✅ **Verificações:**
- [ ] Carrega dashboard de workspaces existente
- [ ] Mostra workspaces reais da API
- [ ] Navegação funcional

### **4. Teste a Aba "Membros"**

✅ **Verificações:**
- [ ] Mostra você como membro Owner
- [ ] Botão "Convidar Membro" presente
- [ ] Status "Ativo" exibido

### **5. Teste a Aba "Permissões"**

✅ **Verificações:**
- [ ] Lista recursos básicos e avançados
- [ ] Badges "Disponível" para recursos do plano atual
- [ ] Badges "Upgrade" para recursos bloqueados
- [ ] Banner de upgrade (se Free)

### **6. Teste Sistema de Upgrade**

✅ **Passos:**
1. Vá para aba "Permissões"
2. Clique em "Ver Planos" (se Free)
3. Ou abra DevTools e execute:
   ```javascript
   localStorage.setItem('synapscale_current_plan', 'pro')
   location.reload()
   ```

✅ **Resultado Esperado:**
- [ ] Plano muda para "Pro"
- [ ] Recursos avançados ficam "Disponível"
- [ ] Limites aumentam
- [ ] Feedback visual de upgrade

### **7. Teste a Aba "Admin" (Se for Admin)**

✅ **Verificações:**
- [ ] Aba "Admin" aparece se email for admin@synapscale.com
- [ ] Interface de gestão de planos carregada
- [ ] 3 abas: Planos, Clientes, Analytics

✅ **Teste Criação de Plano:**
1. Clique "Novo Plano"
2. Preencha formulário
3. Clique "Criar Plano"
4. Veja feedback detalhado

### **8. Teste de Permissões Dinâmicas**

✅ **Teste com Diferentes Planos:**

**Free Plan:**
```javascript
localStorage.setItem('synapscale_current_plan', 'free')
location.reload()
```
- [ ] Workspace: 1 de 1 (100%)
- [ ] Recursos avançados bloqueados
- [ ] Botão upgrade visível

**Pro Plan:**
```javascript
localStorage.setItem('synapscale_current_plan', 'pro')
location.reload()
```
- [ ] Workspace: X de 5
- [ ] Recursos avançados disponíveis
- [ ] Sem SSO

**Enterprise Plan:**
```javascript
localStorage.setItem('synapscale_current_plan', 'enterprise')
location.reload()
```
- [ ] Todos recursos ilimitados (∞)
- [ ] SSO disponível
- [ ] Todos recursos desbloqueados

### **9. Teste de Dados Reais**

✅ **Verificações:**
- [ ] Estatísticas mudam baseado em workspaces reais
- [ ] Contadores são precisos
- [ ] Não há dados hardcoded

### **10. Teste de Estados de Loading/Error**

✅ **Simular Erro de API:**
1. Desconecte internet
2. Recarregue página
3. Veja tratamento de erro

✅ **Resultado Esperado:**
- [ ] Mensagem de erro clara
- [ ] Fallback para dados vazios
- [ ] Interface não quebra

## 🎮 **COMANDOS DE TESTE RÁPIDO**

### **Mudar Planos:**
```javascript
// Free
localStorage.setItem('synapscale_current_plan', 'free')

// Pro  
localStorage.setItem('synapscale_current_plan', 'pro')

// Enterprise
localStorage.setItem('synapscale_current_plan', 'enterprise')

// Recarregar
location.reload()
```

### **Simular Admin:**
```javascript
// No console, temporariamente
Object.defineProperty(window, 'user', {
  value: { email: 'admin@synapscale.com', role: 'admin' }
})
```

### **Verificar Permissões:**
```javascript
// No console
console.log('Pode criar workspace:', hasPermission('workspace.create'))
console.log('Pode usar SSO:', hasPermission('sso.use'))
```

## ✅ **CHECKLIST FINAL**

### **Funcionalidades Básicas:**
- [ ] Página /team carrega sem erros
- [ ] 5 abas funcionais
- [ ] Dados reais integrados
- [ ] Sistema de permissões visual

### **Sistema de Planos:**
- [ ] 3 planos implementados
- [ ] Upgrade funcional
- [ ] Limites dinâmicos
- [ ] Feedback visual

### **Componente Admin:**
- [ ] Interface completa
- [ ] CRUD de planos (simulado)
- [ ] Analytics funcionais
- [ ] Feedback detalhado

### **Integração com APIs:**
- [ ] getWorkspaces() funcionando
- [ ] Estatísticas calculadas
- [ ] Tratamento de erros
- [ ] Estados de loading

### **UX/UI:**
- [ ] Interface profissional
- [ ] Navegação fluida
- [ ] Feedback visual
- [ ] Estados de loading/error

## 🎉 **RESULTADO ESPERADO**

Após todos os testes, você deve ter:

✅ **Sistema 100% funcional** de planos e hierarquias  
✅ **Interface profissional** e intuitiva  
✅ **Dados reais** integrados com APIs existentes  
✅ **Permissões dinâmicas** baseadas em planos  
✅ **Feedback visual** em todas as ações  

---

**Status:** ✅ PRONTO PARA PRODUÇÃO (Frontend)  
**Próximo:** Implementar APIs backend para substituir simulações 

# 🧪 TESTE DE FUNCIONALIDADES - Sistema de Workspace Individual Automático

## 🎯 **PROBLEMA IDENTIFICADO E SOLUÇÃO**

### **Situação**
O usuário relatou que na página `/team` aparecem **0 workspaces**, mesmo com o sistema de criação automática implementado.

### **Ferramentas de Debug Implementadas**
Adicionei **3 botões de debug** na página `/team` para investigar e resolver o problema:

#### **1. 🔧 Testar API**
- **Função**: Testa conectividade e carregamento direto
- **O que faz**:
  - Verifica estado da autenticação
  - Testa conectividade com a API
  - Carrega workspaces diretamente da API
  - Obtém dados do usuário atual
- **Logs**: Todos os resultados aparecem no console do navegador

#### **2. 🏗️ Criar Workspace**
- **Função**: Cria workspace manualmente
- **O que faz**:
  - Obtém dados do usuário atual
  - Cria workspace com nome personalizado
  - Recarrega lista de workspaces
- **Resultado**: Workspace deve aparecer imediatamente na interface

#### **3. 🔄 Inicializar**
- **Função**: Força inicialização dos dados do usuário
- **O que faz**:
  - Executa `apiService.initializeUserData()` manualmente
  - Verifica se há workspaces e cria um se necessário
  - Notifica mudanças para atualizar interface

## 🔍 **COMO TESTAR**

### **Passo 1: Acessar a Página**
1. Faça login no sistema
2. Acesse `/team`
3. Abra o **Console do Navegador** (F12 → Console)

### **Passo 2: Testar API**
1. Clique no botão **🔧 Testar API**
2. Observe os logs no console:
   ```
   🔧 DEBUG: Testando carregamento manual de workspaces...
   🔧 DEBUG: Estado atual: {...}
   🔧 DEBUG: Testando conectividade...
   🔧 DEBUG: Conectividade: {...}
   🔧 DEBUG: Carregando workspaces diretamente...
   🔧 DEBUG: Resultado direto da API: [...]
   🔧 DEBUG: Usuário atual: {...}
   ```

### **Passo 3: Análise dos Resultados**

#### **Se `Resultado direto da API: []` (array vazio)**
- ✅ **API funcionando**, mas usuário não tem workspaces
- ➡️ **Próximo passo**: Clique **🔄 Inicializar**

#### **Se `Resultado direto da API: [...]` (com dados)**
- ✅ **API funcionando** e workspaces existem
- ❌ **Problema**: Interface não está atualizando
- ➡️ **Próximo passo**: Verificar WorkspaceContext

#### **Se erro na API**
- ❌ **Problema de conectividade** ou **autenticação**
- ➡️ **Verificar**: Token de acesso, URL da API

### **Passo 4: Forçar Inicialização**
1. Clique no botão **🔄 Inicializar**
2. Observe os logs:
   ```
   🔄 DEBUG: Forçando inicialização de dados do usuário...
   🔄 Inicializando dados do usuário...
   📋 Workspaces encontrados: 0
   🏗️ Criando workspace padrão...
   ✅ Workspace padrão criado com sucesso
   🔔 Notificando mudanças de workspace para 1 listeners
   ✅ Inicialização forçada concluída
   ```

### **Passo 5: Criar Workspace Manual (se necessário)**
1. Clique no botão **🏗️ Criar Workspace**
2. Observe os logs:
   ```
   🏗️ DEBUG: Criando workspace manualmente...
   ✅ Workspace criado: {...}
   📋 Workspaces após criação: [...]
   ```

## 🔧 **DIAGNÓSTICO DE PROBLEMAS**

### **Problema 1: API não responde**
**Sintomas**: Erro de conectividade
**Causa**: URL da API incorreta ou servidor offline
**Solução**: Verificar `.env` e status do servidor

### **Problema 2: Token inválido**
**Sintomas**: Erro 401 Unauthorized
**Causa**: Token expirado ou inválido
**Solução**: Fazer logout e login novamente

### **Problema 3: Workspaces não aparecem na interface**
**Sintomas**: API retorna dados, mas interface mostra 0
**Causa**: WorkspaceContext não está atualizando
**Solução**: Verificar callbacks e notificações

### **Problema 4: Workspace criado mas não aparece**
**Sintomas**: Criação bem-sucedida, mas interface não atualiza
**Causa**: Sistema de notificação não está funcionando
**Solução**: Recarregar página ou verificar listeners

## 📊 **RESULTADOS ESPERADOS**

### **Após Teste Bem-Sucedido**
1. ✅ API responde corretamente
2. ✅ Usuário atual é carregado
3. ✅ Workspace é criado automaticamente
4. ✅ Interface mostra workspace(s) na página `/team`
5. ✅ Contador de workspaces > 0
6. ✅ WorkspaceSelector no sidebar mostra workspace

### **Logs de Sucesso Completo**
```
🔄 Inicializando dados do usuário...
📋 Workspaces encontrados: 0
🏗️ Criando workspace padrão...
✅ Workspace padrão criado com sucesso
🔔 Notificando mudanças de workspace para 1 listeners
🔄 WorkspaceContext: Recebida notificação de mudança de workspace
🔄 Recarregando workspaces após notificação...
📋 Workspaces carregados: 1
✅ Workspace definido como atual
```

## 🚀 **PRÓXIMOS PASSOS**

Após os testes, com base nos resultados:
1. **Se funcionou**: Remover botões de debug
2. **Se não funcionou**: Analisar logs específicos e corrigir
3. **Documentar**: Resultado final e lições aprendidas

---

**📝 Nota**: Todos os botões de debug são temporários e serão removidos após a correção do problema. 