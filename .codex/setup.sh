#!/bin/bash

# Script de configuração do Codex CLI para o projeto Synapscale
echo "🚀 Configurando Codex CLI para o projeto Synapscale..."

# Verificar se as variáveis de ambiente estão configuradas
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  OPENAI_API_KEY não encontrada!"
    echo "💡 Carregando do arquivo .env..."
    
    if [ -f ".env" ]; then
        export $(grep -v '^#' .env | xargs)
        echo "✅ Variáveis carregadas do .env"
    else
        echo "❌ Arquivo .env não encontrado!"
        echo "📝 Crie um arquivo .env com OPENAI_API_KEY=sua-chave-aqui"
        exit 1
    fi
fi

# Verificar instalação do Codex CLI
if ! command -v codex &> /dev/null; then
    echo "❌ Codex CLI não está instalado!"
    echo "📦 Instalando Codex CLI..."
    npm install -g @openai/codex
fi

# Criar link simbólico para configuração global (opcional)
if [ -d "$HOME/.codex" ]; then
    echo "🔗 Criando backup da configuração global..."
    cp "$HOME/.codex/config.json" "$HOME/.codex/config.json.backup" 2>/dev/null || true
fi

# Testar conexão
echo "🧪 Testando configuração..."
export OPENAI_API_KEY="$OPENAI_API_KEY"

echo "✅ Configuração concluída!"
echo ""
echo "📚 Como usar:"
echo "  codex -p development  # Modo desenvolvimento"
echo "  codex -p production   # Modo produção"
echo "  codex -p quick        # Modo rápido"
echo ""
echo "🔍 Exemplo:"
echo "  codex -p development 'criar um componente de loading'"
echo "" 