#!/bin/bash
# Script para DESATIVAR o mascaramento de .env rapidamente

echo "🔓 DESATIVANDO mascaramento de arquivos .env..."

# Backup das configurações atuais
cp .vscode/settings.json .vscode/settings.json.backup

# Configuração para desativar mascaramento
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
  "editor.semanticHighlighting.enabled": false
}
EOF

echo "✅ Mascaramento DESATIVADO!"
echo "💡 Para reativar, execute: ./enable_env_masking.sh"
echo "🔄 Recarregue a janela do VS Code (Ctrl+Shift+P > 'Developer: Reload Window')"
