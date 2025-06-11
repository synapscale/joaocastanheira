#!/bin/bash
# Script para configurar o ambiente SEM mascaramento por padrão
# Executa automaticamente as configurações necessárias

echo "🔓 CONFIGURANDO AMBIENTE SEM MASCARAMENTO POR PADRÃO"
echo "=================================================="

# 1. Criar diretório .vscode se não existir
mkdir -p .vscode

# 2. Configurar VS Code para não mascarar por padrão
echo "📝 Configurando VS Code..."
cat > .vscode/settings.json << 'EOF'
{
  "files.associations": {
    "*.env": "plaintext",
    ".env": "plaintext",
    ".env.*": "plaintext"
  },
  "dotenv.enableAutocloaking": false,
  "env.enableCloaking": false,
  "irongeek.env.enableObfuscation": false,
  "dotenv.enableCodeActions": false,
  "editor.semanticHighlighting.enabled": false,
  "terminal.integrated.env.protection": false,
  "security.workspace.trust.enabled": false,
  "git.ignoreLimitWarning": true,
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/venv*/**": true,
    "**/.git/objects/**": true,
    "**/.git/subtree-cache/**": true,
    "**/dist/**": true
  }
}
EOF

# 3. Configurar variáveis de ambiente do shell
echo "🐚 Configurando variáveis de ambiente..."
export LOG_MASK_ENABLED=false
export ENV_MASK_ENABLED=false
export HISTCONTROL=""
unset HIST_IGNORE

# 4. Adicionar ao .bashrc se existir
if [ -f ~/.bashrc ]; then
    echo "📋 Adicionando configurações ao .bashrc..."
    
    # Remover configurações antigas se existirem
    sed -i '/# SynapScale - Mascaramento/,/# Fim SynapScale - Mascaramento/d' ~/.bashrc
    
    # Adicionar novas configurações
    cat >> ~/.bashrc << 'EOF'

# SynapScale - Mascaramento desativado por padrão
export LOG_MASK_ENABLED=false
export ENV_MASK_ENABLED=false
export HISTCONTROL=""
unset HIST_IGNORE

# Aliases para controle rápido
alias env-show='cd /workspaces/synapse-backend-agents-jc && ./disable_env_masking.sh'
alias env-hide='cd /workspaces/synapse-backend-agents-jc && ./enable_env_masking.sh'
alias env-view='cd /workspaces/synapse-backend-agents-jc && cat .env'
alias env-pretty='cd /workspaces/synapse-backend-agents-jc && python view_env_clear.py'
# Fim SynapScale - Mascaramento
EOF
fi

# 5. Criar arquivo de configuração permanente
echo "💾 Criando configuração permanente..."
cat > .env_no_mask_default << 'EOF'
# Arquivo de configuração para manter mascaramento desativado por padrão
# Este arquivo é usado pelos scripts de setup para configurar o ambiente

MASK_DISABLED_BY_DEFAULT=true
CREATED_AT=$(date)
WORKSPACE_PATH=/workspaces/synapse-backend-agents-jc
EOF

# 6. Modificar scripts existentes para respeitar a configuração padrão
echo "🔧 Modificando scripts existentes..."

# Atualizar setup_auto.sh para incluir desativação de mascaramento
if grep -q "disable_env_masking" setup_auto.sh; then
    echo "   setup_auto.sh já configurado"
else
    sed -i '/^echo "✅ Setup automático concluído!"/i \
# Desativar mascaramento por padrão\
echo "🔓 Desativando mascaramento de .env por padrão..."\
./disable_env_masking.sh > /dev/null 2>&1 || true' setup_auto.sh
fi

echo ""
echo "✅ CONFIGURAÇÃO CONCLUÍDA!"
echo ""
echo "🎯 CONFIGURAÇÕES APLICADAS:"
echo "   ✅ VS Code configurado para não mascarar .env"
echo "   ✅ Variáveis de ambiente configuradas"
echo "   ✅ Aliases criados no .bashrc"
echo "   ✅ Configuração permanente salva"
echo "   ✅ Scripts atualizados"
echo ""
echo "🔄 PRÓXIMOS PASSOS:"
echo "   1. Recarregue o VS Code: Ctrl+Shift+P > 'Developer: Reload Window'"
echo "   2. Reinicie o terminal ou execute: source ~/.bashrc"
echo ""
echo "📋 COMANDOS DISPONÍVEIS:"
echo "   env-show   - Desativar mascaramento"
echo "   env-hide   - Ativar mascaramento"
echo "   env-view   - Ver .env no terminal"
echo "   env-pretty - Ver .env com formatação"
echo ""
echo "🎉 Agora o mascaramento está DESATIVADO por padrão!"
