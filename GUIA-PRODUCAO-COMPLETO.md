# GUIA DE PRODUÇÃO COMPLETO - SYNAPSCALE

## 🚀 DEPLOY EM PRODUÇÃO - INSTRUÇÕES COMPLETAS

### 📋 PRÉ-REQUISITOS DE PRODUÇÃO

#### Backend
- **Python**: 3.11+
- **PostgreSQL**: 13+ (configurado e acessível)
- **Redis**: 6+ (opcional, para cache)
- **Docker**: 20+ (para containerização)
- **Memória**: Mínimo 2GB RAM
- **Disco**: Mínimo 10GB disponível

#### Frontend
- **Node.js**: 18+
- **npm/yarn/pnpm**: Versão mais recente
- **Docker**: 20+ (para containerização)
- **Memória**: Mínimo 1GB RAM
- **Disco**: Mínimo 5GB disponível

### 🔧 CONFIGURAÇÃO DE PRODUÇÃO

#### 1. Backend - Configuração
```bash
# 1. Clonar repositório
git clone <repository-url>
cd synapse-backend-agents-jc-main

# 2. Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou venv\Scripts\activate  # Windows

# 3. Instalar dependências
pip install -r requirements.txt

# 4. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com configurações de produção:
# - DATABASE_URL (PostgreSQL)
# - SECRET_KEY (gerar chave forte)
# - JWT_SECRET_KEY (gerar chave forte)
# - SMTP_* (configurações de email)
# - Chaves de API (OpenAI, etc.)

# 5. Executar migrações
python -m alembic upgrade head

# 6. Iniciar aplicação
uvicorn src.synapse.main:app --host 0.0.0.0 --port 8000
```

#### 2. Frontend - Configuração
```bash
# 1. Clonar repositório
git clone <repository-url>
cd joaocastanheira-main

# 2. Instalar dependências
npm install
# ou yarn install
# ou pnpm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local:
# - NEXT_PUBLIC_API_URL (URL do backend)
# - NEXT_PUBLIC_WS_URL (URL do WebSocket)

# 4. Build de produção
npm run build

# 5. Iniciar aplicação
npm start
```

### 🐳 DEPLOY COM DOCKER

#### Backend
```bash
# Build da imagem
docker build -t synapscale-backend .

# Executar container
docker run -d \
  --name synapscale-backend \
  -p 8000:8000 \
  -e DATABASE_URL="postgresql://..." \
  -e SECRET_KEY="..." \
  synapscale-backend
```

#### Frontend
```bash
# Build da imagem
docker build -t synapscale-frontend .

# Executar container
docker run -d \
  --name synapscale-frontend \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL="https://api.synapscale.com" \
  synapscale-frontend
```

#### Docker Compose (Recomendado)
```bash
# Backend
cd synapse-backend-agents-jc-main
docker-compose up -d

# Frontend (separadamente)
cd joaocastanheira-main
docker-compose up -d
```

### ☁️ DEPLOY EM CLOUD

#### Vercel (Frontend)
1. Conectar repositório no Vercel
2. Configurar variáveis de ambiente
3. Deploy automático via Git

#### Railway/Render (Backend)
1. Conectar repositório
2. Configurar PostgreSQL
3. Definir variáveis de ambiente
4. Deploy automático

#### AWS/GCP/Azure
1. Configurar instâncias
2. Instalar Docker
3. Configurar banco de dados
4. Deploy via containers

### 🔒 SEGURANÇA EM PRODUÇÃO

#### Configurações Obrigatórias
- **HTTPS**: Certificado SSL/TLS
- **Firewall**: Portas específicas apenas
- **Backup**: Banco de dados automatizado
- **Monitoramento**: Logs e métricas
- **Rate Limiting**: Proteção contra abuso
- **CORS**: URLs específicas apenas

#### Variáveis Críticas
```env
# Backend
DEBUG=false
ENVIRONMENT=production
SECRET_KEY=<chave-forte-32-chars>
JWT_SECRET_KEY=<chave-forte-32-chars>
DATABASE_URL=<postgresql-url>
BACKEND_CORS_ORIGINS=["https://app.synapscale.com"]

# Frontend
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_API_URL=https://api.synapscale.com
```

### 📊 MONITORAMENTO

#### Health Checks
- **Backend**: `GET /health`
- **Frontend**: Verificação de build
- **Database**: Conexão ativa
- **Redis**: Cache funcionando

#### Logs
- **Backend**: `logs/synapscale.log`
- **Frontend**: Console do navegador
- **Nginx**: Access/Error logs
- **Docker**: Container logs

### 🔄 BACKUP E RECOVERY

#### Banco de Dados
```bash
# Backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup_20241209.sql
```

#### Arquivos
```bash
# Backup uploads
tar -czf uploads_backup.tar.gz uploads/

# Backup logs
tar -czf logs_backup.tar.gz logs/
```

### 🚀 OTIMIZAÇÃO DE PERFORMANCE

#### Backend
- **Gunicorn**: Múltiplos workers
- **Redis**: Cache de sessões
- **PostgreSQL**: Índices otimizados
- **CDN**: Assets estáticos

#### Frontend
- **Next.js**: Build otimizado
- **CDN**: Distribuição global
- **Compression**: Gzip/Brotli
- **Caching**: Headers apropriados

### 📞 SUPORTE E TROUBLESHOOTING

#### Problemas Comuns
1. **Erro de conexão DB**: Verificar DATABASE_URL
2. **CORS Error**: Verificar BACKEND_CORS_ORIGINS
3. **Build Error**: Verificar dependências
4. **Auth Error**: Verificar JWT_SECRET_KEY

#### Comandos de Diagnóstico
```bash
# Backend
python diagnose_detailed.py

# Frontend
npm run build --verbose

# Docker
docker logs <container-name>
```

## ✅ CHECKLIST DE PRODUÇÃO

### Backend
- [ ] PostgreSQL configurado
- [ ] Variáveis de ambiente definidas
- [ ] Migrações executadas
- [ ] HTTPS configurado
- [ ] Backup automatizado
- [ ] Monitoramento ativo

### Frontend
- [ ] Build de produção criado
- [ ] Variáveis de ambiente definidas
- [ ] CDN configurado
- [ ] HTTPS configurado
- [ ] Analytics configurado
- [ ] SEO otimizado

### Infraestrutura
- [ ] Firewall configurado
- [ ] SSL/TLS ativo
- [ ] Backup automatizado
- [ ] Monitoramento ativo
- [ ] Logs centralizados
- [ ] Alertas configurados

## 🎉 CONCLUSÃO

Seguindo este guia, você terá uma instalação completa e segura do SynapScale em produção, com todas as melhores práticas implementadas.

