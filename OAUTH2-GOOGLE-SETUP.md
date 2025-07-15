# 🔐 Configuração Login with Google para Gemini CLI

## 🎉 **SOLUÇÃO FINAL - FUNCIONANDO PERFEITAMENTE!** ✅

### **Problema Identificado:**
O Gemini CLI não estava carregando as variáveis de ambiente do arquivo `.env` automaticamente, resultando no erro:
```
API Error 403: Gemini for Google Cloud API has not been used in project gemini-cli-project
```

### **✅ Solução Implementada:**
**Script Wrapper** que carrega todas as variáveis do `.env` ANTES de executar o Gemini CLI.

## 🚀 Como Usar (Método Correto)

### **1. Execute o Gemini CLI com o wrapper:**
```bash
./gemini-wrapper.sh
```

### **2. Verificação das Variáveis:**
O script mostra:
```
🔧 Carregando variáveis de ambiente do .env...
✅ Variáveis carregadas do .env
🔍 GOOGLE_CLOUD_PROJECT: 356212146550
🚀 Iniciando Gemini CLI com variáveis carregadas...
```

### **3. Resultado:**
- ✅ **GOOGLE_CLOUD_PROJECT**: Carregado corretamente (`356212146550`)
- ✅ **Autenticação**: oauth-personal funcionando
- ✅ **Servidores MCP**: 6 servidores carregados
- ✅ **API**: Sem erros 403

## 🔧 Configuração Técnica

### **Arquivo `.env` (raiz do projeto):**
```bash
GOOGLE_CLOUD_PROJECT=356212146550
# ... outras variáveis
```

### **Arquivo `.gemini/settings.json`:**
```json
{
  "selectedAuthType": "oauth-personal",
  "theme": "GitHub Light",
  "mcpServers": {
    "github": { ... },
    "filesystem": { ... }
  }
}
```

## 💡 Dicas Importantes

### **✅ DO:**
- Use sempre `./gemini-wrapper.sh` em vez de `gemini`
- Mantenha o `GOOGLE_CLOUD_PROJECT` no `.env` da raiz
- Não altere o `selectedAuthType` (está correto)

### **❌ DON'T:**
- Não execute `gemini` diretamente (não carrega variáveis)
- Não mude o tipo de autenticação
- Não coloque variáveis em `.gemini/.env` (use a raiz)

## 🎯 Próximos Passos

### **1. Criar Alias (Opcional):**
```bash
# Adicionar ao ~/.zshrc ou ~/.bashrc
alias gemini="./gemini-wrapper.sh"
```

### **2. Testar Conexão com APIs:**
```bash
./gemini-wrapper.sh -p "teste rápido de conexão"
```

### **3. Usar com Servidores MCP:**
```bash
./gemini-wrapper.sh
# Dentro do CLI: usar ferramentas MCP como apidof-mcp-server
```

## 🔍 Diagnóstico

### **Verificar se está funcionando:**
```bash
./gemini-wrapper.sh --help
```

**Saída esperada:**
```
🔧 Carregando variáveis de ambiente do .env...
✅ Variáveis carregadas do .env
🔍 GOOGLE_CLOUD_PROJECT: 356212146550
🚀 Iniciando Gemini CLI com variáveis carregadas...
```

## 🎉 Resumo da Solução

1. **✅ Problema**: Gemini CLI não carregava `GOOGLE_CLOUD_PROJECT` do `.env`
2. **✅ Solução**: Script wrapper `gemini-wrapper.sh` carrega variáveis antes
3. **✅ Resultado**: Autenticação oauth-personal funcionando perfeitamente
4. **✅ Benefício**: Acesso completo à API Google Cloud com projeto correto

---

**🔥 IMPORTANTE**: Use sempre `./gemini-wrapper.sh` em vez de `gemini` diretamente! 