# 🚀 COMO DESATIVAR MASCARAMENTO .ENV RAPIDAMENTE

## ⚡ Métodos Rápidos (escolha o que preferir):

### 1. 🎯 MAIS RÁPIDO - Scripts de Linha de Comando
```bash
# Desativar mascaramento
./disable_env_masking.sh

# Ativar mascaramento 
./enable_env_masking.sh
```
**Depois execute:** `Ctrl+Shift+P` > "Developer: Reload Window"

### 2. 🔧 Command Palette do VS Code
- `Ctrl+Shift+P`
- Digite: "Tasks: Run Task"
- Escolha: "Desativar mascaramento .env"
- Recarregue a janela

### 3. 🖥️ Ver .env no Terminal (sempre visível)
```bash
# Simples
cat .env

# Com numeração
python view_env_clear.py

# Só uma seção específica
python view_env_clear.py --section "SEGURANÇA"
```

### 4. ⌨️ Atalhos de Teclado (após configurar)
- `Ctrl+Shift+E` + `Ctrl+Shift+D` = Desativar mascaramento
- `Ctrl+Shift+E` + `Ctrl+Shift+E` = Ativar mascaramento

### 5. 🔄 Aliases para Terminal (mais conveniente)
```bash
# Carregar aliases
source env_aliases.sh

# Usar comandos
env-show    # Desativar mascaramento
env-hide    # Ativar mascaramento  
env-view    # Ver .env no terminal
env-pretty  # Ver com destaque
```

## 🎯 RECOMENDAÇÃO PARA USO DIÁRIO:

### Para DESENVOLVIMENTO (trabalho normal):
```bash
./disable_env_masking.sh
# Recarregar VS Code
```

### Para PRODUÇÃO/DEMOS (segurança):
```bash
./enable_env_masking.sh  
# Recarregar VS Code
```

## 🚨 IMPORTANTE:
- Sempre **recarregue a janela** do VS Code após mudanças
- Use `Ctrl+Shift+P` > "Developer: Reload Window"
- O mascaramento protege em screenshots e demos
- Para código de produção, mantenha SEMPRE ativado

## 📋 Status Atual:
✅ Mascaramento está **DESATIVADO**
✅ Scripts criados e funcionais
✅ Aliases configurados
✅ Visualizador de terminal disponível

Execute qualquer comando acima para alternar conforme necessário! 🚀
