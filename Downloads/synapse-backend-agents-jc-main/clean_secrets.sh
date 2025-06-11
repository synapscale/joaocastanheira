#!/bin/bash

# Script para remover segredos do histórico do Git
# Substitui a senha sensível por placeholder em todo o histórico

echo "🔒 Removendo segredos do histórico do Git..."

# Fazer backup da branch atual
git branch backup-before-clean-$(date +%s)

# Usar git filter-branch para limpar os segredos
git filter-branch --force --env-filter '
    export GIT_COMMITTER_NAME="$GIT_AUTHOR_NAME"
    export GIT_COMMITTER_EMAIL="$GIT_AUTHOR_EMAIL"
    export GIT_COMMITTER_DATE="$GIT_AUTHOR_DATE"
' --tree-filter '
    # Limpar README.md
    if [ -f README.md ]; then
        sed -i "s/EXEMPLO_SENHA_REAL/YOUR_AIVEN_PASSWORD/g" README.md
        sed -i "s/doadmin:EXEMPLO_SENHA_REAL/YOUR_DB_USER:YOUR_AIVEN_PASSWORD/g" README.md
    fi
    
    # Limpar documentação
    if [ -f "docs/GUIA_COMPLETO_SYNAPSCALE.md" ]; then
        sed -i "s/EXEMPLO_SENHA_REAL/YOUR_AIVEN_PASSWORD/g" "docs/GUIA_COMPLETO_SYNAPSCALE.md"
        sed -i "s/doadmin:EXEMPLO_SENHA_REAL/YOUR_DB_USER:YOUR_AIVEN_PASSWORD/g" "docs/GUIA_COMPLETO_SYNAPSCALE.md"
    fi
    
    # Limpar database.py
    if [ -f src/synapse/database.py ]; then
        sed -i "s/EXEMPLO_SENHA_REAL/YOUR_AIVEN_PASSWORD/g" src/synapse/database.py
        sed -i "s/doadmin:EXEMPLO_SENHA_REAL/YOUR_DB_USER:YOUR_AIVEN_PASSWORD/g" src/synapse/database.py
        sed -i "s/db-banco-dados-automacoes-do-user-13851907-0\.e\.db\.ondigitalocean\.com/YOUR_DB_HOST/g" src/synapse/database.py
    fi
' --tag-name-filter cat -- --branches --tags

echo "✅ Segredos removidos do histórico!"
echo "🔄 Fazendo limpeza final..."

# Limpar referências antigas
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo "🎉 Limpeza concluída! Todos os segredos foram removidos do histórico."
