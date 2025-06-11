#!/bin/bash
# Desativa todas as proteções de mascaramento

# Remove configurações de mascaramento do VS Code
if [ -f .vscode/settings.json ]; then
    sed -i 's/"terminal.integrated.env.protection": true/"terminal.integrated.env.protection": false/g' .vscode/settings.json
    sed -i 's/"security.workspace.trust.enabled": true/"security.workspace.trust.enabled": false/g' .vscode/settings.json
fi

# Desativa proteções do shell
unset HIST_IGNORE
export HISTCONTROL=""

# Remove mascaramento de arquivos de log
export LOG_MASK_ENABLED=false
export ENV_MASK_ENABLED=false

echo "Mascaramento desativado com força!"
