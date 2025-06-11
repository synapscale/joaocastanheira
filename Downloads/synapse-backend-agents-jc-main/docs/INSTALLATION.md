# 🚀 Guia Completo de Instalação - SynapScale Backend

## 🎯 Visão Geral

Este guia fornece instruções detalhadas para instalar e configurar o SynapScale Backend em diferentes ambientes. Escolha o método que melhor se adequa ao seu caso.

## 📋 Pré-requisitos

### 🖥️ **Sistema Operacional**
- ✅ Linux (Ubuntu 20.04+, CentOS 8+)
- ✅ macOS (Big Sur 11.0+)
- ✅ Windows 10/11 (com WSL2 recomendado)

### 🐍 **Python**
- ✅ Python 3.11+ (obrigatório)
- ✅ pip 23.0+
- ✅ venv ou conda

### 🗄️ **Banco de Dados**
- ✅ PostgreSQL 13+ (recomendado: 15+)
- ✅ Acesso de administrador para criar databases

### 🚀 **Cache**
- ✅ Redis 6+ (recomendado: 7+)
- ✅ Configurado para aceitar conexões locais

### 🛠️ **Ferramentas**
- ✅ Git 2.30+
- ✅ curl ou wget
- ✅ Editor de texto (VS Code, vim, nano)

## ⚡ Instalação Rápida (5 minutos)

### 1️⃣ **Clone e Configure**

```bash
# Clone o repositório
git clone https://github.com/synapscale/synapse-backend-agents-jc.git
cd synapse-backend-agents-jc

# Crie ambiente virtual
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# ou venv\Scripts\activate  # Windows

# Atualize pip e instale dependências
pip install --upgrade pip
pip install -r requirements.txt
```

### 2️⃣ **Configure Automaticamente**

```bash
# Execute o configurador automático
python generate_secure_keys.py

# O script criará:
# ✅ Arquivo .env com todas as variáveis
# ✅ Chaves criptográficas seguras
# ✅ Configurações otimizadas
```

### 3️⃣ **Prepare o Banco de Dados**

```bash
# Crie o banco PostgreSQL
createdb synapscale_db

# Ou usando SQL
psql -c "CREATE DATABASE synapscale_db;"
```

### 4️⃣ **Execute**

```bash
# Inicie o servidor
python -m uvicorn src.synapse.main:app --reload --host 0.0.0.0 --port 8000

# Ou use o script helper
./start_dev.sh
```

### 5️⃣ **Verifique**

```bash
# Teste a API
curl http://localhost:8000/health

# Acesse a documentação
open http://localhost:8000/docs
```

🎉 **Pronto!** Sua instalação está funcionando.

---

## 🔧 Instalação Detalhada

### 🐍 **1. Configurar Python**

#### Linux (Ubuntu/Debian)

```bash
# Atualize o sistema
sudo apt update && sudo apt upgrade -y

# Instale Python 3.11+
sudo apt install python3.11 python3.11-venv python3.11-dev python3-pip -y

# Verifique a versão
python3.11 --version
```

#### macOS

```bash
# Usando Homebrew
brew install python@3.11

# Ou usando pyenv
brew install pyenv
pyenv install 3.11.8
pyenv global 3.11.8
```

#### Windows

```powershell
# Baixe Python do site oficial: https://python.org
# Ou use winget
winget install Python.Python.3.11

# Verifique a instalação
python --version
```

### 🗄️ **2. Configurar PostgreSQL**

#### Linux (Ubuntu/Debian)

```bash
# Instale PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Configure o serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Crie usuário e banco
sudo -u postgres psql -c "CREATE USER synapscale WITH PASSWORD 'sua_senha_segura';"
sudo -u postgres psql -c "CREATE DATABASE synapscale_db OWNER synapscale;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE synapscale_db TO synapscale;"
```

#### macOS

```bash
# Usando Homebrew
brew install postgresql@15
brew services start postgresql@15

# Configure usuário e banco
createuser -s synapscale
createdb synapscale_db -O synapscale
```

#### Windows

```powershell
# Baixe e instale PostgreSQL do site oficial
# Ou use chocolatey
choco install postgresql

# Configure através do pgAdmin ou linha de comando
```

#### Docker (Todos OS)

```bash
# Execute PostgreSQL em container
docker run --name postgres-synapscale \
  -e POSTGRES_USER=synapscale \
  -e POSTGRES_PASSWORD=sua_senha_segura \
  -e POSTGRES_DB=synapscale_db \
  -p 5432:5432 \
  -d postgres:15

# Verifique se está rodando
docker ps
```

### 🚀 **3. Configurar Redis**

#### Linux (Ubuntu/Debian)

```bash
# Instale Redis
sudo apt install redis-server -y

# Configure e inicie
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Teste a conexão
redis-cli ping
```

#### macOS

```bash
# Usando Homebrew
brew install redis
brew services start redis

# Teste a conexão
redis-cli ping
```

#### Windows

```powershell
# Use WSL2 ou Docker
# Ou baixe Redis para Windows (não oficialmente suportado)
```

#### Docker (Todos OS)

```bash
# Execute Redis em container
docker run --name redis-synapscale \
  -p 6379:6379 \
  -d redis:7-alpine

# Teste a conexão
docker exec redis-synapscale redis-cli ping
```

### 📦 **4. Configurar Projeto**

#### Clone e Ambiente Virtual

```bash
# Clone o repositório
git clone https://github.com/synapscale/synapse-backend-agents-jc.git
cd synapse-backend-agents-jc

# Crie ambiente virtual
python3 -m venv venv

# Ative o ambiente
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Atualize pip
pip install --upgrade pip setuptools wheel
```

#### Instalar Dependências

```bash
# Instale todas as dependências
pip install -r requirements.txt

# Ou instale por categoria
pip install fastapi[all] sqlalchemy[asyncio] redis pydantic-settings

# Verifique as instalações
pip list | grep -E "(fastapi|sqlalchemy|redis|pydantic)"
```

### ⚙️ **5. Configuração Detalhada**

#### Gerar Configurações

```bash
# Execute o gerador automático
python generate_secure_keys.py

# Ou configure manualmente
cp .env.example .env
nano .env  # Edite as configurações
```

#### Configuração Manual do .env

```env
# Configurações básicas
ENVIRONMENT=development
DEBUG=true
PROJECT_NAME=SynapScale Backend API

# Banco de dados
DATABASE_URL=postgresql://synapscale:sua_senha@localhost:5432/synapscale_db
DATABASE_SCHEMA=synapscale_db

# Redis
REDIS_URL=redis://localhost:6379/0

# Chaves de segurança (gerar com o script)
SECRET_KEY=sua_chave_secreta_gerada
JWT_SECRET_KEY=sua_chave_jwt_gerada
ENCRYPTION_KEY=sua_chave_criptografia_gerada

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
```

#### Validar Configuração

```bash
# Teste a configuração
python -c "from src.synapse.config import settings; print('✅ Config OK')"

# Teste conexão com banco
python -c "
from src.synapse.core.database_new import test_database_connection
print('✅ DB OK' if test_database_connection() else '❌ DB ERROR')
"

# Teste Redis
python -c "
import redis
r = redis.from_url('redis://localhost:6379/0')
print('✅ Redis OK' if r.ping() else '❌ Redis ERROR')
"
```

### 🗃️ **6. Inicializar Banco de Dados**

#### Criar Tabelas

```bash
# Execute migrações (se existirem)
alembic upgrade head

# Ou crie tabelas diretamente
python -c "
from src.synapse.database import Base, engine
Base.metadata.create_all(bind=engine)
print('✅ Tabelas criadas')
"

# Ou use o script helper
python init_database.py
```

#### Verificar Estrutura

```bash
# Conecte ao banco e verifique
psql postgresql://synapscale:sua_senha@localhost:5432/synapscale_db

# Liste tabelas
\dt

# Veja estrutura de uma tabela
\d users
```

### 🚀 **7. Executar Aplicação**

#### Desenvolvimento

```bash
# Servidor com reload automático
python -m uvicorn src.synapse.main:app --reload --host 0.0.0.0 --port 8000

# Ou use o script helper
chmod +x start_dev.sh
./start_dev.sh

# Ou usando make (se disponível)
make run-dev
```

#### Produção

```bash
# Usando Gunicorn
gunicorn src.synapse.main:app \
  -w 4 \
  -k uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --access-logfile - \
  --error-logfile -

# Ou use o script helper
./start_production.sh
```

### ✅ **8. Verificação e Testes**

#### Verificar Saúde da API

```bash
# Health check
curl http://localhost:8000/health

# Resposta esperada:
# {"status": "healthy", "timestamp": "2024-..."}
```

#### Testar Endpoints

```bash
# Documentação interativa
curl http://localhost:8000/docs

# Endpoint de informações
curl http://localhost:8000/api/v1/info

# Teste de autenticação
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123", "name": "Test User"}'
```

#### Executar Testes

```bash
# Execute todos os testes
pytest

# Testes com coverage
pytest --cov=src --cov-report=html

# Testes específicos
pytest tests/test_auth.py -v
```

---

## 🐳 Instalação com Docker

### Docker Compose (Recomendado)

```bash
# Clone o repositório
git clone https://github.com/synapscale/synapse-backend-agents-jc.git
cd synapse-backend-agents-jc

# Configure as variáveis
python generate_secure_keys.py

# Execute com Docker Compose
docker-compose up -d

# Verifique os containers
docker-compose ps

# Acesse a aplicação
curl http://localhost:8000/health
```

### Docker Manual

```bash
# Build da imagem
docker build -t synapscale-backend .

# Execute container com dependências externas
docker run --name synapscale-backend \
  --env-file .env \
  -p 8000:8000 \
  -d synapscale-backend

# Verifique logs
docker logs synapscale-backend
```

---

## 🔧 Instalação para Desenvolvimento

### Configuração Completa

```bash
# Clone com submódulos (se houver)
git clone --recursive https://github.com/synapscale/synapse-backend-agents-jc.git
cd synapse-backend-agents-jc

# Configure ambiente de desenvolvimento
python3 -m venv venv
source venv/bin/activate

# Instale dependências de desenvolvimento
pip install -r requirements.txt
pip install -r requirements-dev.txt  # Se existir

# Configure hooks de pré-commit
pre-commit install

# Configure IDE (VS Code)
cp .vscode/settings.json.example .vscode/settings.json
```

### Ferramentas de Desenvolvimento

```bash
# Instale ferramentas úteis
pip install black isort mypy flake8 pytest-cov

# Configure formatação automática
black src/ tests/
isort src/ tests/

# Execute checagem de tipos
mypy src/

# Execute linting
flake8 src/
```

---

## 🌐 Instalação para Produção

### Preparação do Servidor

```bash
# Atualize o sistema
sudo apt update && sudo apt upgrade -y

# Instale dependências do sistema
sudo apt install nginx postgresql redis-server supervisor -y

# Configure firewall
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 22
sudo ufw enable
```

### Deploy com Supervisor

```bash
# Configure supervisor
sudo tee /etc/supervisor/conf.d/synapscale.conf << EOF
[program:synapscale]
command=/path/to/venv/bin/gunicorn src.synapse.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 127.0.0.1:8000
directory=/path/to/synapse-backend-agents-jc
user=www-data
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/synapscale.log
EOF

# Recarregue e inicie
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start synapscale
```

### Configure Nginx

```bash
# Configure proxy reverso
sudo tee /etc/nginx/sites-available/synapscale << EOF
server {
    listen 80;
    server_name api.synapscale.com;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location /ws/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

# Ative o site
sudo ln -s /etc/nginx/sites-available/synapscale /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🐛 Troubleshooting

### Problemas Comuns

#### 1. Erro de Dependências

```bash
# Atualize pip
pip install --upgrade pip

# Limpe cache
pip cache purge

# Reinstale dependências
pip uninstall -r requirements.txt -y
pip install -r requirements.txt
```

#### 2. Erro de Conexão com Banco

```bash
# Verifique se PostgreSQL está rodando
sudo systemctl status postgresql

# Teste conexão manual
psql postgresql://synapscale:senha@localhost:5432/synapscale_db

# Verifique logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

#### 3. Erro de Conexão com Redis

```bash
# Verifique se Redis está rodando
sudo systemctl status redis-server

# Teste conexão
redis-cli ping

# Verifique configuração
redis-cli config get "*"
```

#### 4. Problemas de Permissão

```bash
# Ajuste permissões
sudo chown -R $USER:$USER .
chmod +x *.sh

# Para arquivos de log
sudo mkdir -p /var/log/synapscale
sudo chown $USER:$USER /var/log/synapscale
```

### Logs e Debugging

```bash
# Logs da aplicação
tail -f logs/synapscale.log

# Logs do sistema
sudo journalctl -u synapscale -f

# Debug mode
DEBUG=true python -m uvicorn src.synapse.main:app --reload

# Verificar configuração
python view_env_clear.py
```

---

## 📚 Próximos Passos

Após a instalação bem-sucedida:

1. 📖 **Leia a documentação**: [docs/](./README.md)
2. ⚙️ **Configure integrações**: [CONFIGURATION.md](./CONFIGURATION.md)
3. 🔒 **Configure segurança**: [SECURITY.md](./SECURITY.md)
4. 🚀 **Deploy produção**: [DEPLOYMENT.md](./DEPLOYMENT.md)
5. 🧪 **Execute testes**: `pytest`

---

✅ **Instalação completa e funcional!**

Para suporte, consulte:
- 📚 [Documentação completa](./README.md)
- 🐛 [Issues no GitHub](https://github.com/synapscale/synapse-backend-agents-jc/issues)
- 💬 [Discussões](https://github.com/synapscale/synapse-backend-agents-jc/discussions) 