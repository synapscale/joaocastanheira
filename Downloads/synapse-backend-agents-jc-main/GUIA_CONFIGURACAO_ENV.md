# 🔧 Guia de Configuração do Arquivo .env

## 📖 Visão Geral

O arquivo `.env` é o coração da configuração do SynapScale Backend. Este guia explica todas as variáveis disponíveis e como configurá-las corretamente.

## 🚀 Configuração Rápida

### 1. Copiar o arquivo de exemplo
```bash
cp .env.example .env
```

### 2. Gerar chaves seguras
```bash
python generate_secure_keys.py
```

### 3. Configurar banco de dados PostgreSQL
```bash
# Instalar PostgreSQL se necessário
sudo apt-get install postgresql postgresql-contrib

# Criar banco e usuário
sudo -u postgres psql
CREATE DATABASE synapscale_db;
CREATE USER synapscale_user WITH PASSWORD 'sua_senha_forte';
GRANT ALL PRIVILEGES ON DATABASE synapscale_db TO synapscale_user;
\q
```

### 4. Atualizar DATABASE_URL no .env
```env
DATABASE_URL=postgresql://synapscale_user:sua_senha_forte@localhost:5432/synapscale_db
```

## 📝 Configurações Detalhadas

### 🔒 Configurações de Segurança

| Variável | Descrição | Como Gerar | Obrigatório |
|----------|-----------|------------|-------------|
| `SECRET_KEY` | Chave secreta para JWT | `python generate_secure_keys.py` | ✅ Sim |
| `JWT_SECRET_KEY` | Chave para assinatura JWT | `python generate_secure_keys.py` | ✅ Sim |
| `ENCRYPTION_KEY` | Chave para criptografia | `python generate_secure_keys.py` | ✅ Sim |

**⚠️ IMPORTANTE:** Nunca use chaves padrão em produção!

### 🗄️ Configurações de Banco de Dados

| Variável | Descrição | Exemplo | Obrigatório |
|----------|-----------|---------|-------------|
| `DATABASE_URL` | URL de conexão PostgreSQL | `postgresql://user:pass@host:5432/db` | ✅ Sim |
| `DATABASE_SCHEMA` | Schema do banco | `synapscale_db` | ✅ Sim |
| `DATABASE_POOL_SIZE` | Tamanho do pool de conexões | `20` | ❌ Não |

### 🤖 Configurações de IA/LLM

Configure apenas os provedores que você pretende usar:

#### OpenAI
```env
OPENAI_API_KEY=sk-sua-chave-aqui
OPENAI_ORG_ID=org-sua-organizacao  # Opcional
```

#### Anthropic (Claude)
```env
ANTHROPIC_API_KEY=sk-ant-sua-chave-aqui
CLAUDE_API_KEY=sk-ant-sua-chave-aqui  # Alias para compatibilidade
```

#### Google (Gemini)
```env
GOOGLE_API_KEY=sua-chave-google-aqui
GEMINI_API_KEY=sua-chave-gemini-aqui  # Alias para compatibilidade
```

#### Outros Provedores
```env
GROK_API_KEY=sua-chave-grok-aqui
DEEPSEEK_API_KEY=sua-chave-deepseek-aqui
MISTRAL_API_KEY=sua-chave-mistral-aqui
HUGGINGFACE_API_KEY=sua-chave-huggingface-aqui
```

### 📧 Configurações de Email

Para envio de notificações e recuperação de senha:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=seu-email@gmail.com
SMTP_PASSWORD=sua-senha-app-gmail  # Use App Password, não sua senha normal
SMTP_FROM_EMAIL=noreply@synapscale.com
SMTP_FROM_NAME=SynapScale
SMTP_USE_TLS=true
```

**💡 Dica:** Para Gmail, gere uma "Senha de App" nas configurações de segurança.

### 🌐 Configurações de CORS

Para desenvolvimento local:
```env
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost:3001"]
FRONTEND_URL=http://localhost:3000
```

Para produção:
```env
BACKEND_CORS_ORIGINS=["https://seu-dominio.com","https://app.seu-dominio.com"]
FRONTEND_URL=https://app.seu-dominio.com
```

### 📁 Configurações de Armazenamento

#### Armazenamento Local (Padrão)
```env
STORAGE_TYPE=local
STORAGE_BASE_PATH=./storage
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE=52428800  # 50MB
```

#### Amazon S3
```env
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=sua-access-key
AWS_SECRET_ACCESS_KEY=sua-secret-key
AWS_BUCKET_NAME=seu-bucket
AWS_REGION=us-east-1
```

#### Google Cloud Storage
```env
STORAGE_TYPE=gcs
GCS_BUCKET_NAME=seu-bucket-gcs
GCS_CREDENTIALS_PATH=/caminho/para/credentials.json
```

### ⚡ Configurações de Performance

```env
# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_DEFAULT=100/minute
RATE_LIMIT_LLM_GENERATE=20/minute

# Cache
CACHE_TTL_DEFAULT=300  # 5 minutos
CACHE_TTL_USER_DATA=900  # 15 minutos

# WebSocket
WEBSOCKET_ENABLED=true
WS_MAX_CONNECTIONS_PER_USER=5
```

### 📊 Configurações de Monitoramento

```env
# Logs
LOG_LEVEL=INFO  # DEBUG, INFO, WARNING, ERROR
LOG_FORMAT=json
LOG_FILE=logs/synapscale.log

# Sentry (para produção)
SENTRY_DSN=https://sua-url-sentry.ingest.sentry.io/projeto

# Métricas
ENABLE_METRICS=true
PROMETHEUS_ENABLED=false  # Para produção avançada
```

## 🌍 Configurações por Ambiente

### 🔧 Desenvolvimento
```env
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=DEBUG
DATABASE_ECHO=true
RELOAD_ON_CHANGE=true
SHOW_DOCS=true
```

### 🧪 Teste
```env
ENVIRONMENT=testing
DEBUG=false
LOG_LEVEL=WARNING
DATABASE_ECHO=false
RATE_LIMIT_ENABLED=false  # Facilita testes
```

### 🚀 Produção
```env
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=WARNING
DATABASE_ECHO=false
SECURE_COOKIES=true
ENABLE_HTTPS_REDIRECT=true
BACKUP_ENABLED=true
```

## 🔍 Validação de Configuração

### Verificar se tudo está configurado:
```bash
# Testar configuração
python -c "from src.synapse.config import settings; print('✅ Configuração válida!')"

# Executar diagnóstico
python simple_diagnose.py

# Scan de segurança
./security_scan.sh
```

### Executar testes:
```bash
# Teste básico
python -m pytest tests/ -v

# Teste de conectividade
python test_setup.sh
```

## ⚠️ Segurança e Boas Práticas

### ✅ Faça
- ✅ Use `python generate_secure_keys.py` para chaves
- ✅ Configure CORS corretamente para produção
- ✅ Use HTTPS em produção
- ✅ Mantenha o `.env` fora do git
- ✅ Use senhas de app para SMTP
- ✅ Configure rate limiting adequadamente

### ❌ Não Faça
- ❌ Commitar o arquivo `.env` no git
- ❌ Usar chaves padrão em produção
- ❌ Expor APIs desnecessárias
- ❌ Usar DEBUG=true em produção
- ❌ Deixar CORS muito permissivo
- ❌ Usar senhas fracas

## 🆘 Solução de Problemas

### Erro de conexão com banco
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Testar conexão
psql -h localhost -U synapscale_user -d synapscale_db
```

### Erro de importação de módulos
```bash
# Verificar PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# Reinstalar dependências
pip install -r requirements.txt
```

### Problemas com uploads
```bash
# Verificar permissões das pastas
chmod 755 storage/ uploads/
mkdir -p storage/{archive,audio,csv,document,image,temp,uploads,video}
```

## 📞 Suporte

Para mais ajuda:
- 📖 Consulte a documentação completa em `docs/`
- 🐛 Reporte bugs no GitHub
- 💬 Entre em contato com o suporte

---

**Desenvolvido por José - um desenvolvedor Full Stack**
