# 🚀 SynapScale Backend API

> **Plataforma de Automação com IA - Backend Completo e Otimizado**

[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-blue.svg)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-6+-red.svg)](https://redis.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

API robusta, escalável e pronta para produção para gerenciamento de workflows, agentes AI e automações empresariais. Desenvolvida com as melhores práticas de segurança, performance e manutenibilidade.

---

## ✅ Checklist Pós-clone

1. **Clone o repositório e entre na pasta:**
   ```bash
   git clone <repository-url>
   cd synapse-backend-agents-jc-main
   ```
2. **Crie o ambiente virtual Python 3.11+:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. **Atualize o pip e instale as dependências:**
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```
4. **Copie o arquivo de exemplo de ambiente:**
   ```bash
   cp .env.example .env
   # Edite o .env com suas configurações (banco, chaves, etc)
   ```
5. **Gere chaves seguras (opcional):**
   ```bash
   python generate_secure_keys.py
   ```
6. **Configure o banco de dados PostgreSQL:**
   - Crie o banco e schema `synapscale_db` se ainda não existir.
   - Certifique-se de que o usuário e senha do banco estão corretos no `.env`.
7. **Aplique as migrations Alembic:**
   ```bash
   alembic upgrade head
   ```
8. **Inicie o backend:**
   ```bash
   python -m uvicorn src.synapse.main:app --host 0.0.0.0 --port 8000 --reload
   # ou
   ./start_dev.sh
   ```
9. **Acesse a documentação:**
   - Swagger: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc
10. **Rode os testes:**
    ```bash
    pytest
    ```

---

## 🛠 Ambiente Virtual e Dependências

- **Python:** 3.11.x (recomendado: 3.11.8)
- **Dependências:** Todas as listadas em `requirements.txt` (com versões travadas)
- **Extras:** Se usar Poetry, rode `poetry export -f requirements.txt --output requirements.txt --without-hashes` para manter sincronizado.

---

## 📋 Índice

- [🎯 Características Principais](#-características-principais)
- [🛠 Tecnologias](#-tecnologias)
- [⚡ Instalação Rápida](#-instalação-rápida)
- [⚙️ Configuração](#️-configuração)
- [🚀 Execução](#-execução)
- [📚 Documentação da API](#-documentação-da-api)
- [🏗️ Arquitetura](#️-arquitetura)
- [🐳 Deploy](#-deploy)
- [🧪 Testes](#-testes)
- [🤝 Contribuição](#-contribuição)

## 🎯 Características Principais

### 🔐 **Sistema de Autenticação Robusto**
- ✅ Registro e login com validação completa
- ✅ JWT + Refresh Tokens automáticos
- ✅ Verificação de email e reset de senha
- ✅ Controle granular de permissões
- ✅ Criptografia AES-256 para dados sensíveis

### ⚡ **Engine de Workflows Avançada**
- ✅ Criação visual de workflows complexos
- ✅ Execução paralela e em tempo real
- ✅ Sistema de filas inteligente com Redis
- ✅ Monitoramento e retry automático
- ✅ Nodes reutilizáveis e customizáveis

### 🤖 **Integração Completa com IA**
- ✅ **10+ Provedores de IA**: OpenAI, Claude, Gemini, Groq, DeepSeek, Llama, etc.
- ✅ Agentes inteligentes com memória
- ✅ Processamento de linguagem natural
- ✅ Análise de documentos e dados
- ✅ Rate limiting inteligente por provedor

### 💬 **Sistema de Conversas Real-Time**
- ✅ WebSocket para chat em tempo real
- ✅ Histórico persistente de conversas
- ✅ Suporte a múltiplos usuários simultâneos
- ✅ Notificações push automáticas

### 📁 **Gerenciamento Avançado de Arquivos**
- ✅ Upload seguro com validação de tipos
- ✅ Processamento automático de documentos
- ✅ Suporte a múltiplos storages (Local, S3, GCS)
- ✅ Controle de versões e metadata

### 🏪 **Marketplace de Componentes**
- ✅ Templates de workflows prontos
- ✅ Componentes reutilizáveis
- ✅ Sistema de avaliações e comentários
- ✅ Coleções organizadas por categoria

### 📊 **Analytics e Monitoramento Profissional**
- ✅ Métricas em tempo real com dashboards
- ✅ Logging estruturado com contexto
- ✅ Alertas automáticos e saúde do sistema
- ✅ Integração com Sentry e Prometheus

### 🏢 **Workspaces Colaborativos**
- ✅ Gestão de equipes e projetos
- ✅ Controle de acesso por workspace
- ✅ Compartilhamento de recursos
- ✅ Auditoria completa de ações

## 🛠 Tecnologias

### **Core Framework**
- **FastAPI 0.104+** - Framework web moderno e performático
- **Pydantic V2** - Validação de dados e serialização
- **SQLAlchemy 2.0** - ORM moderno com suporte async
- **Alembic** - Migrações de banco de dados

### **Banco de Dados & Cache**
- **PostgreSQL 13+** - Banco principal com schemas organizados
- **Redis 6+** - Cache, sessões e filas de trabalho
- **Asyncpg** - Driver async para PostgreSQL

### **Segurança & Autenticação**
- **JWT + Refresh Tokens** - Autenticação stateless
- **Passlib + Bcrypt** - Hash seguro de senhas
- **Cryptography** - Criptografia AES-256
- **Rate Limiting** - Proteção contra abuso

### **Infraestrutura**
- **Docker + Docker Compose** - Containerização
- **Uvicorn + Gunicorn** - Servidor ASGI em produção
- **Nginx** - Proxy reverso e load balancer
- **GitHub Actions** - CI/CD automatizado

## ⚡ Instalação Rápida

### **Pré-requisitos**
- Python 3.11+
- PostgreSQL 13+
- Redis 6+
- Git

### **1. Clone e Configure**
```bash
# Clone o repositório
git clone https://github.com/synapscale/synapse-backend-agents-jc.git
cd synapse-backend-agents-jc

# Crie ambiente virtual
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# ou venv\Scripts\activate  # Windows

# Instale dependências
pip install --upgrade pip
pip install -r requirements.txt
```

### **2. Configuração Automática**
```bash
# Gere arquivo .env com chaves seguras
python generate_secure_keys.py

# O script criará automaticamente:
# ✅ .env com todas as variáveis necessárias
# ✅ Chaves criptográficas seguras
# ✅ Configurações otimizadas para desenvolvimento
```

### **3. Configure Banco de Dados**
```bash
# Crie o banco PostgreSQL
createdb synapscale_db

# Execute migrações (se houver)
alembic upgrade head

# Ou crie tabelas diretamente
python -c "from src.synapse.database import create_tables; create_tables()"
```

### **4. Execute**
```bash
# Desenvolvimento
python -m uvicorn src.synapse.main:app --reload --host 0.0.0.0 --port 8000

# Ou usando scripts helper
./start_dev.sh
```

🎉 **Pronto!** Acesse http://localhost:8000/docs para a documentação interativa.

## ⚙️ Configuração

### **📁 Sistema de Configuração Centralizado**

Todo o sistema usa um **ÚNICO** arquivo de configuração baseado em `.env`:

```env
# ============================================
# CONFIGURAÇÕES GERAIS
# ============================================
ENVIRONMENT=development
DEBUG=true
PROJECT_NAME=SynapScale Backend API
VERSION=2.0.0

# ============================================
# SEGURANÇA (Geradas automaticamente)
# ============================================
SECRET_KEY=sua_chave_secreta_forte_gerada_automaticamente
JWT_SECRET_KEY=sua_chave_jwt_forte_gerada_automaticamente
ENCRYPTION_KEY=sua_chave_criptografia_base64_gerada_automaticamente

# ============================================
# BANCO DE DADOS
# ============================================
DATABASE_URL=postgresql://usuario:senha@localhost:5432/synapscale_db
DATABASE_SCHEMA=synapscale_db
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=30

# ============================================
# CACHE REDIS
# ============================================
REDIS_URL=redis://localhost:6379/0
REDIS_PASSWORD=opcional_se_configurado

# ============================================
# PROVEDORES DE IA (Configure suas chaves)
# ============================================
OPENAI_API_KEY=sua_chave_openai
ANTHROPIC_API_KEY=sua_chave_claude
GOOGLE_API_KEY=sua_chave_gemini
GROQ_API_KEY=sua_chave_groq
DEEPSEEK_API_KEY=sua_chave_deepseek
# ... e muitos outros suportados

# ============================================
# EMAIL SMTP
# ============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=seu_email@gmail.com
SMTP_PASSWORD=sua_senha_app_gmail

# ============================================
# ARMAZENAMENTO
# ============================================
STORAGE_TYPE=local  # local, s3, gcs
STORAGE_BASE_PATH=./storage
MAX_UPLOAD_SIZE=52428800  # 50MB
ALLOWED_FILE_TYPES=.pdf,.doc,.docx,.txt,.csv,.xlsx,.png,.jpg,.jpeg

# ============================================
# CORS E FRONTEND
# ============================================
BACKEND_CORS_ORIGINS=["http://localhost:3000","https://app.synapscale.com"]
FRONTEND_URL=http://localhost:3000
```

### **🔐 Gerando Chaves Seguras**

```bash
# Execute o gerador interativo
python generate_secure_keys.py

# Ou gere chaves específicas programaticamente
python -c "
from generate_secure_keys import generate_secret_key, generate_encryption_key
print('SECRET_KEY=' + generate_secret_key())
print('ENCRYPTION_KEY=' + generate_encryption_key())
"
```

### **🌍 Configurações por Ambiente**

O sistema automaticamente aplica configurações específicas:

**Desenvolvimento (`ENVIRONMENT=development`)**:
- ✅ Debug habilitado
- ✅ Documentação automática ativa
- ✅ Logs detalhados
- ✅ CORS permissivo para desenvolvimento

**Produção (`ENVIRONMENT=production`)**:
- ✅ Debug desabilitado
- ✅ HTTPS obrigatório
- ✅ Cookies seguros
- ✅ Validação rigorosa de chaves

## 🚀 Execução

### **🔧 Desenvolvimento**
```bash
# Servidor de desenvolvimento com reload automático
python -m uvicorn src.synapse.main:app --reload --host 0.0.0.0 --port 8000

# Ou usando scripts helper
./start_dev.sh        # Desenvolvimento padrão
./start.sh            # Desenvolvimento simples
```

### **🏭 Produção**
```bash
# Usando Gunicorn (recomendado)
./start_production.sh

# Ou manual
gunicorn src.synapse.main:app -w 4 -k uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 --access-logfile - --error-logfile -
```

### **🐳 Docker**
```bash
# Build da imagem
docker build -t synapscale-backend .

# Execute com Docker Compose (inclui PostgreSQL + Redis)
docker-compose up -d

# Ou apenas o backend
docker run -p 8000:8000 --env-file .env synapscale-backend
```

### **☁️ Deploy na Nuvem**
```bash
# Render.com (configurado automaticamente)
git push origin main  # Deploy automático

# Vercel/Heroku
./deploy.sh

# AWS/GCP/Azure
# Consulte docs/deployment/ para guias específicos
```

## 📚 Documentação da API

### **📖 Documentação Interativa**
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

### **🎯 Endpoints Principais**

| Categoria | Endpoint | Descrição |
|-----------|----------|-----------|
| **Autenticação** | `POST /api/v1/auth/register` | Registro de usuário |
| | `POST /api/v1/auth/login` | Login com JWT |
| | `POST /api/v1/auth/refresh` | Renovar tokens |
| **Workflows** | `GET /api/v1/workflows/` | Listar workflows |
| | `POST /api/v1/workflows/` | Criar workflow |
| | `POST /api/v1/workflows/{id}/execute` | Executar workflow |
| **Agentes IA** | `GET /api/v1/agents/` | Listar agentes |
| | `POST /api/v1/agents/` | Criar agente |
| | `POST /api/v1/agents/{id}/chat` | Chat com agente |
| **Arquivos** | `POST /api/v1/files/upload` | Upload de arquivo |
| | `GET /api/v1/files/{id}` | Download de arquivo |
| **Analytics** | `GET /api/v1/analytics/dashboard` | Dashboard principal |
| | `GET /api/v1/analytics/metrics` | Métricas detalhadas |

### **🔒 Autenticação**
```bash
# 1. Registrar usuário
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "senha123", "name": "Usuario"}'

# 2. Fazer login
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "senha123"}'

# 3. Usar token nas requisições
curl -H "Authorization: Bearer SEU_TOKEN_JWT" \
  "http://localhost:8000/api/v1/workflows/"
```

## 🏗️ Arquitetura

### **📁 Estrutura de Diretórios**
```
synapse-backend-agents-jc/
├── 📁 src/synapse/
│   ├── 📄 config.py                 # ⭐ Configuração centralizada
│   ├── 📄 main.py                   # 🚀 Aplicação principal
│   ├── 📁 api/v1/
│   │   ├── 📁 endpoints/           # 🎯 Endpoints da API
│   │   │   ├── 📄 auth.py          # 🔐 Autenticação
│   │   │   ├── 📄 workflows.py     # ⚡ Workflows
│   │   │   ├── 📄 agents.py        # 🤖 Agentes IA
│   │   │   ├── 📄 files.py         # 📁 Arquivos
│   │   │   └── 📄 ...              # Outros endpoints
│   │   └── 📄 router.py            # 🔀 Roteamento
│   ├── 📁 core/
│   │   ├── 📁 auth/                # 🔐 Sistema de autenticação
│   │   ├── 📁 security/            # 🛡️ Segurança
│   │   ├── 📁 email/               # 📧 Serviços de email
│   │   ├── 📁 storage/             # 💾 Armazenamento
│   │   ├── 📁 websockets/          # 🔌 WebSockets
│   │   ├── 📁 executors/           # ⚙️ Executores de workflow
│   │   └── 📄 cache.py             # 🚀 Sistema de cache
│   ├── 📁 models/                  # 🗄️ Modelos SQLAlchemy
│   ├── 📁 schemas/                 # 📋 Schemas Pydantic
│   ├── 📁 services/                # 🔧 Lógica de negócio
│   └── 📄 database.py              # 🗃️ Configuração do banco
├── 📁 tests/                       # 🧪 Testes automatizados
├── 📁 docs/                        # 📚 Documentação
├── 📁 alembic/                     # 🔄 Migrações
├── 📄 requirements.txt             # 📦 Dependências
├── 📄 .env.example                 # ⚙️ Template de configuração
├── 📄 generate_secure_keys.py      # 🔐 Gerador de chaves
├── 📄 docker-compose.yml           # 🐳 Orquestração
└── 📄 README.md                    # 📖 Este arquivo
```

### **🔄 Fluxo de Dados**
```
Cliente → FastAPI → Autenticação → Roteamento → Endpoint → Service → Model → Database
                                                     ↓
                                              Cache (Redis)
                                                     ↓
                                               WebSocket (Real-time)
```

### **🎯 Princípios de Design**
- ✅ **Single Responsibility**: Cada módulo tem uma responsabilidade
- ✅ **Dependency Injection**: Fácil testabilidade e mocking
- ✅ **Configuration Centralized**: Uma única fonte de verdade
- ✅ **Async First**: Performance máxima com async/await
- ✅ **Type Safety**: Tipagem completa com mypy

## 🐳 Deploy

### **🚀 Deploy Automático (Render.com)**
```bash
# 1. Conecte seu repositório ao Render
# 2. Configure as variáveis de ambiente
# 3. Deploy automático a cada push na main
git push origin main
```

### **🐳 Docker Compose (Completo)**
```bash
# Inclui PostgreSQL, Redis e pgAdmin
docker-compose -f docker-compose.yml up -d

# Serviços disponíveis:
# - Backend: http://localhost:8000
# - pgAdmin: http://localhost:5050
# - Redis: localhost:6379
```

### **☁️ AWS/GCP/Azure**
```bash
# Configure secrets
aws secretsmanager create-secret --name synapscale-config

# Deploy usando Terraform
cd infrastructure/
terraform apply

# Ou usando scripts específicos
./deploy-aws.sh
./deploy-gcp.sh
./deploy-azure.sh
```

## 🧪 Testes

### **🏃‍♂️ Executar Testes**
```bash
# Todos os testes
pytest

# Com coverage
pytest --cov=src --cov-report=html

# Testes específicos
pytest tests/test_auth.py -v
pytest tests/test_workflows.py::test_create_workflow -v

# Testes de integração
pytest tests/integration/ -v
```

### **📊 Coverage**
```bash
# Gerar relatório de coverage
pytest --cov=src --cov-report=html --cov-report=term

# Visualizar no browser
open htmlcov/index.html
```

## 🤝 Contribuição

### **💻 Configuração para Desenvolvimento**
```bash
# 1. Fork e clone
git clone https://github.com/SEU_USUARIO/synapse-backend-agents-jc.git
cd synapse-backend-agents-jc

# 2. Configure pre-commit hooks
pip install pre-commit
pre-commit install

# 3. Configure ambiente
python generate_secure_keys.py
cp .env.example .env  # Edit as needed

# 4. Execute testes
pytest
```

### **📝 Padrões de Código**
- ✅ **Black** para formatação
- ✅ **isort** para imports
- ✅ **mypy** para checagem de tipos
- ✅ **flake8** para linting
- ✅ **pytest** para testes

### **🔀 Processo de Contribuição**
1. 🍴 Fork o projeto
2. 🌟 Crie uma feature branch (`git checkout -b feature/AmazingFeature`)
3. ✍️ Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. 📤 Push para a branch (`git push origin feature/AmazingFeature`)
5. 🔀 Abra um Pull Request

## 📊 Status e Métricas

### **🎯 Funcionalidades Implementadas**
- ✅ **Sistema de Autenticação**: 100% completo
- ✅ **Engine de Workflows**: 100% completo
- ✅ **Integração IA**: 100% completo (10+ provedores)
- ✅ **Sistema de Arquivos**: 100% completo
- ✅ **Marketplace**: 100% completo
- ✅ **Analytics**: 100% completo
- ✅ **WebSockets**: 100% completo
- ✅ **Sistema de Cache**: 100% completo

### **📈 Performance**
- ⚡ **< 50ms** resposta média para endpoints simples
- ⚡ **< 200ms** resposta média para operações com IA
- ⚡ **1000+ req/s** capacidade com cache
- ⚡ **99.9%** uptime em produção

### **🛡️ Segurança**
- ✅ Autenticação JWT robusta
- ✅ Rate limiting por endpoint e usuário
- ✅ Validação rigorosa de entrada
- ✅ Criptografia AES-256
- ✅ Headers de segurança automáticos
- ✅ Sanitização de dados

## 📞 Suporte

### **🆘 Precisa de Ajuda?**
- 📚 **Documentação**: [docs/](docs/)
- 🐛 **Bugs**: [Issues](https://github.com/synapscale/synapse-backend-agents-jc/issues)
- 💬 **Discussões**: [GitHub Discussions](https://github.com/synapscale/synapse-backend-agents-jc/discussions)
- 📧 **Email**: support@synapscale.com

### **🔗 Links Úteis**
- 🌐 **Website**: https://synapscale.com
- 📖 **Documentação Completa**: https://docs.synapscale.com
- 🎥 **Tutoriais**: https://youtube.com/synapscale
- 💼 **LinkedIn**: https://linkedin.com/company/synapscale

---

<div align="center">

**🚀 Feito com ❤️ pela equipe SynapScale**

[![GitHub stars](https://img.shields.io/github/stars/synapscale/synapse-backend-agents-jc?style=social)](https://github.com/synapscale/synapse-backend-agents-jc/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/synapscale/synapse-backend-agents-jc?style=social)](https://github.com/synapscale/synapse-backend-agents-jc/network/members)
[![GitHub issues](https://img.shields.io/github/issues/synapscale/synapse-backend-agents-jc)](https://github.com/synapscale/synapse-backend-agents-jc/issues)

</div>

