# Aliases rápidos para controlar mascaramento .env
# Adicione estas linhas ao seu ~/.bashrc ou execute diretamente

# Desativar mascaramento .env
alias env-show='cd /workspaces/synapse-backend-agents-jc && ./disable_env_masking.sh'

# Ativar mascaramento .env  
alias env-hide='cd /workspaces/synapse-backend-agents-jc && ./enable_env_masking.sh'

# Ver .env sem mascaramento no terminal
alias env-view='cd /workspaces/synapse-backend-agents-jc && cat .env'

# Ver .env com destaque de sintaxe
alias env-pretty='cd /workspaces/synapse-backend-agents-jc && bat .env --language dotenv 2>/dev/null || cat .env'

echo "✅ Aliases configurados!"
echo "Use:"
echo "  env-show  - Desativar mascaramento"
echo "  env-hide  - Ativar mascaramento"
echo "  env-view  - Ver .env no terminal"
echo "  env-pretty - Ver .env com destaque"
