# 🔓 MASCARAMENTO DESATIVADO POR PADRÃO

## ✅ CONFIGURAÇÕES APLICADAS:

### 📁 VS Code Settings (`.vscode/settings.json`):
- `*.env` arquivos tratados como texto simples
- `dotenv.enableAutocloaking`: false
- `env.enableCloaking`: false
- `irongeek.env.enableObfuscation`: false
- `terminal.integrated.env.protection`: false

### 🐚 Variáveis de Ambiente:
- `LOG_MASK_ENABLED=false`
- `ENV_MASK_ENABLED=false`
- `HISTCONTROL=""` (histórico não filtrado)

### ⚡ Aliases Disponíveis:
```bash
env-show    # Desativar mascaramento
env-hide    # Ativar mascaramento  
env-view    # Ver .env no terminal
env-pretty  # Ver .env com formatação
```

### 🔧 Scripts Modificados:
- `setup_auto.sh` - Inclui desativação automática
- `setup_no_mask_default.sh` - Script principal de configuração

## 🎯 COMO USAR:

### Para MANTER sem mascaramento (padrão atual):
```bash
# Nada é necessário - já está configurado!
# Os arquivos .env são exibidos normalmente
```

### Para ATIVAR mascaramento temporariamente:
```bash
./enable_env_masking.sh
# Recarregar VS Code: Ctrl+Shift+P > 'Developer: Reload Window'
```

### Para VOLTAR ao padrão (sem mascaramento):
```bash
./disable_env_masking.sh
# Recarregar VS Code: Ctrl+Shift+P > 'Developer: Reload Window'
```

## 🚀 CONFIGURAÇÃO AUTOMÁTICA:

Novos desenvolvedores podem executar:
```bash
./setup_no_mask_default.sh
```

Ou usar o setup completo (que já inclui):
```bash
./setup_auto.sh
```

## 📋 STATUS ATUAL:
✅ **Mascaramento DESATIVADO por padrão**
✅ Arquivos .env visíveis no VS Code
✅ Valores de variáveis não ocultados
✅ Terminal sem proteções extras
✅ Configuração persistente aplicada

---
*Configurado em: $(date)*
*Workspace: /workspaces/synapse-backend-agents-jc*
