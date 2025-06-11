# 🚀 Deploy no Render.com

## 📋 Pré-requisitos
- Conta no [Render.com](https://render.com)
- Repositório Git (GitHub, GitLab, etc.)
- Banco PostgreSQL configurado

## 🔧 Configuração Passo a Passo

### 1. **Preparar Repositório**
```bash
# Fazer push do código para seu repositório Git
git add .
git commit -m "Deploy para Render"
git push origin main
```

### 2. **Criar Web Service no Render**
1. Acesse [Render Dashboard](https://dashboard.render.com)
2. Clique em "New +" → "Web Service"
3. Conecte seu repositório Git
4. Configure:
   - **Name**: `synapscale-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `./start_render.sh`

### 3. **Configurar Variáveis de Ambiente**
No dashboard do Render, adicione:

```env
# Banco de Dados
DATABASE_URL=postgresql://user:password@host:port/database

# Segurança
SECRET_KEY=sua-chave-secreta-forte-32-chars
JWT_SECRET_KEY=sua-chave-jwt-forte-32-chars
ENCRYPTION_KEY=sua-chave-criptografia-base64

# API
ENVIRONMENT=production
DEBUG=false
API_V1_STR=/api/v1
PROJECT_NAME=SynapScale Backend API

# CORS (substitua pela URL do seu frontend)
BACKEND_CORS_ORIGINS=["https://seu-frontend.vercel.app"]

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=sua-senha-app

# OpenAI (opcional)
OPENAI_API_KEY=sua-chave-openai
```

### 4. **Configurar Banco PostgreSQL**
1. No Render, crie um PostgreSQL database
2. Copie a URL de conexão
3. Cole na variável `DATABASE_URL`

### 5. **Deploy**
1. Clique em "Create Web Service"
2. Aguarde o build e deploy
3. Acesse a URL fornecida pelo Render

## 🔍 Verificação

### Health Check
```bash
curl https://seu-app.onrender.com/health
```

### Documentação da API
```
https://seu-app.onrender.com/docs
```

## 🐛 Troubleshooting

### Build Falha
- Verifique `requirements.txt`
- Confirme Python 3.11 compatibilidade

### Start Falha
- Verifique variáveis de ambiente
- Confirme `DATABASE_URL`
- Veja logs no dashboard

### Banco de Dados
- Confirme conexão PostgreSQL
- Verifique migrações aplicadas

## 📊 Monitoramento
- **Logs**: Dashboard do Render
- **Métricas**: Render Analytics
- **Health**: `/health` endpoint

## 🔄 Atualizações
O deploy é automático a cada push para a branch principal.

