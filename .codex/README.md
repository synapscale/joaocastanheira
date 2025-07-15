# Codex CLI - Configuração do Projeto Synapscale

## 🚀 **Configuração Rápida**

```bash
# 1. Executar configuração automática
./.codex/setup.sh

# 2. Testar funcionamento
codex -p development "hello world"
```

## 📁 **Estrutura de Arquivos**

```
.codex/
├── config.json          # Configuração básica (JSON)
├── config.toml          # Configuração completa (TOML)
├── instructions.md      # Contexto do projeto
├── setup.sh            # Script de configuração
└── README.md           # Esta documentação
```

## ⚙️ **Perfis de Configuração**

### 🔧 **Development** (Recomendado)
```bash
codex -p development "criar componente de loading"
```
- **Modelo**: GPT-4
- **Aprovação**: Somente em falhas
- **Permissões**: Leitura/escrita no projeto

### 🏭 **Production** (Seguro)
```bash
codex -p production "revisar código de segurança"
```
- **Modelo**: GPT-4
- **Aprovação**: Para comandos não-seguros
- **Permissões**: Somente leitura

### ⚡ **Quick** (Rápido)
```bash
codex -p quick "explicar este código"
```
- **Modelo**: GPT-4o-mini (mais rápido/barato)
- **Aprovação**: Nunca
- **Permissões**: Leitura/escrita básica

## 💡 **Exemplos de Uso**

### Desenvolvimento de Componentes
```bash
# Criar novo componente
codex -p development "criar um componente Modal usando shadcn/ui"

# Refatorar componente existente
codex -p development "refatorar o componente Button para TypeScript"

# Adicionar testes
codex -p development "adicionar testes para o componente UserCard"
```

### Trabalho com APIs
```bash
# Criar serviço de API
codex -p development "criar serviço para gerenciar usuários usando ApiService"

# Debug de problemas
codex -p development "investigar erro de CORS na chamada de API"
```

### Melhorias de Código
```bash
# Otimização
codex -p production "otimizar performance do componente Canvas"

# Code review
codex -p production "revisar segurança do hook useAuth"
```

### Consultas Rápidas
```bash
# Explicações
codex -p quick "explicar como funciona o useContext neste projeto"

# Documentação
codex -p quick "gerar documentação para a função validateEmail"
```

## 🔑 **Configuração de API Keys**

### OpenAI (Principal)
```bash
# No arquivo .env
OPENAI_API_KEY=sk-proj-...
```

### Vercel v0 (Opcional)
```bash
# No arquivo .env
V0_API_KEY=your-v0-key-here
```

## 🛡️ **Segurança e Permissões**

### Permissões Configuradas
- ✅ **Leitura** do diretório do projeto
- ✅ **Escrita** no diretório do projeto
- ✅ **Acesso** a pasta temporária do usuário
- ❌ **Bloqueado** acesso a sistema global

### Comandos Seguros (Auto-aprovados)
- `ls`, `cat`, `grep`, `find`
- `npm run`, `yarn`, `pnpm`
- `git status`, `git diff`, `git log`

### Comandos que Precisam de Aprovação
- Instalação de pacotes
- Modificação de arquivos de configuração
- Comandos de sistema

## 🐛 **Resolução de Problemas**

### Erro: "stream disconnected"
```bash
# Verificar API key
echo $OPENAI_API_KEY

# Recarregar configuração
./.codex/setup.sh

# Testar com modelo mais simples
codex -p quick "test"
```

### Erro: "command not found"
```bash
# Reinstalar Codex CLI
npm install -g @openai/codex

# Verificar instalação
which codex
codex --version
```

### Erro: "permission denied"
```bash
# Verificar permissões do script
chmod +x .codex/setup.sh

# Executar novamente
./.codex/setup.sh
```

## 📚 **Comandos Úteis**

```bash
# Usar diferentes modelos
codex -m gpt-4 "prompt here"
codex -m gpt-4o-mini "prompt here"

# Modo interativo
codex -p development

# Modo não-interativo
codex -p development "prompt" --exec

# Com arquivos específicos
codex -i ./screenshot.png "explicar esta interface"

# Configuração manual
codex -c model="gpt-4" -c ask_for_approval="never"
```

## 🔗 **Links Úteis**

- [Documentação Oficial](https://vercel.com/docs/v0/codex)
- [NPM Package](https://www.npmjs.com/package/@openai/codex)
- [OpenAI API](https://platform.openai.com/docs)

## 🎯 **Próximos Passos**

1. Execute `./.codex/setup.sh` para configurar
2. Teste com `codex -p development "hello world"`
3. Explore os perfis diferentes conforme sua necessidade
4. Integre o Codex CLI no seu workflow de desenvolvimento

---

**💡 Dica**: Use o perfil `development` para a maioria das tarefas e `quick` para consultas rápidas! 