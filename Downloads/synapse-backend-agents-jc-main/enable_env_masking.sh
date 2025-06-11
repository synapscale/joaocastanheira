#!/bin/bash
# Script para ATIVAR o mascaramento de .env rapidamente

echo "🔒 ATIVANDO mascaramento de arquivos .env..."

# Configuração para ativar mascaramento
cat > .vscode/settings.json << 'EOF'
{
  "files.associations": {
    "*.env": "dotenv",
    ".env": "dotenv",
    ".env.*": "dotenv"
  },
  "dotenv.enableAutocloaking": true,
  "env.enableCloaking": true,
  "irongeek.env.enableObfuscation": true,
  "dotenv.enableCodeActions": true,
  "editor.semanticHighlighting.enabled": true
}
EOF

echo "✅ Mascaramento ATIVADO!"
echo "💡 Para desativar, execute: ./disable_env_masking.sh"
echo "🔄 Recarregue a janela do VS Code (Ctrl+Shift+P > 'Developer: Reload Window')"
