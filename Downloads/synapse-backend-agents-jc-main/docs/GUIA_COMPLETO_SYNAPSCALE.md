# SynapScale Backend - Guia Completo de Uso e Administração

> **Data**: 5 de Junho de 2025  
> **Versão**: 1.1.0  
> **Status**: ✅ Totalmente Funcional

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Requisitos e Instalação](#-requisitos-e-instalação)
3. [Estrutura do Projeto](#-estrutura-do-projeto)
4. [Configuração Inicial](#-configuração-inicial)
5. [Banco de Dados](#-banco-de-dados)
6. [Executando o Servidor](#-executando-o-servidor)
7. [API Endpoints](#-api-endpoints)
8. [Comandos Úteis](#-comandos-úteis)
9. [Testes e Validação](#-testes-e-validação)
10. [Troubleshooting](#-troubleshooting)
11. [Desenvolvimento](#-desenvolvimento)
12. [Deploy e Produção](#-deploy-e-produção)

---

## 🎯 Visão Geral

O **SynapScale Backend** é uma API REST moderna construída com FastAPI para gerenciamento de automações com IA. Oferece:

- ✅ Agentes de IA Múltiplos
- ✅ Workflows Visuais
- ✅ Autenticação JWT robusta
- ✅ Banco PostgreSQL com SQLAlchemy
- ✅ Gerenciamento de Arquivos
- ✅ WebSockets para comunicação em tempo real
- ✅ Analytics e monitoramento
- ✅ Arquitetura assíncrona

### 🏗️ Arquitetura

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend/     │───▶│   FastAPI        │───▶│   PostgreSQL    │
│   Client App    │    │   (Port 8000)    │    │   Database      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   File Storage   │
                       │   (Local Disk)   │
                       └──────────────────┘
```

---

## 🛠 Requisitos e Instalação

### Pré-requisitos

- **Python**: 3.11+ 
- **PostgreSQL**: 15+
- **Git**: Controle de versão

### 1. Verificar Versões

```bash
# Verificar Python
python --version
# Saída esperada: Python 3.11.x ou superior

# Verificar PostgreSQL (se instalado localmente)
psql --version
# Saída esperada: psql (PostgreSQL) 15.x
```

### 2. Clonar e Configurar Projeto

```bash
# Clonar o repositório
git clone <repository-url>
cd synapscale-backend

# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows

# Instalar dependências
pip install -r requirements.txt
```

### 3. Dependências Principais

```
# Principais dependências no requirements.txt
fastapi>=0.104.1,<0.116.0
uvicorn[standard]>=0.24.0,<0.35.0
pydantic>=2.5.0,<3.0.0
sqlalchemy>=2.0.0,<3.0.0
psycopg2-binary>=2.9.9,<3.0.0
pyjwt>=2.8.0,<3.0.0
python-jose[cryptography]==3.5.0
passlib[bcrypt]>=1.7.4,<2.0.0
```

---

## 📁 Estrutura do Projeto

```
synapscale-backend/
├── 📄 requirements.txt        # Dependências Python
├── 📄 .env                    # Variáveis ambiente
├── 📄 .env.example           # Exemplo de variáveis ambiente
├── 📄 setup.sh               # Script de configuração
├── 📄 start.sh               # Script de inicialização
├── 📄 start_dev.sh           # Script de inicialização (dev)
├── 📂 src/synapse/           # Código principal
│   ├── 📄 main.py            # Aplicação FastAPI
│   ├── 📄 config.py          # Configurações
│   ├── 📄 database.py        # Conexão com banco
│   ├── 📂 api/v1/            # Endpoints API
│   ├── 📂 models/            # Modelos SQLAlchemy
│   ├── 📂 schemas/           # Schemas Pydantic
│   ├── 📂 services/          # Lógica de negócio
│   ├── 📂 core/              # Autenticação e segurança
│   └── 📂 middlewares/       # Middlewares
├── 📂 docs/                  # Documentação
└── 📂 tests/                 # Testes
```

### Arquivos Principais

| Arquivo | Descrição | Função |
|---------|-----------|--------|
| main.py | Aplicação principal | Inicialização FastAPI, rotas, middlewares |
| config.py | Configurações | Settings Pydantic, variáveis ambiente |
| database.py | Conexão com banco | Configuração SQLAlchemy, sessão, engine |
| models/*.py | Modelos SQLAlchemy | Definição das tabelas |
| schemas/*.py | Schemas Pydantic | Validação de dados |

---

## ⚙️ Configuração Inicial

### 1. Arquivo de Ambiente (.env)

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar arquivo .env com suas configurações
# Exemplo de configuração:
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
DATABASE_SCHEMA=synapscale_db
SECRET_KEY=your-super-secret-key-change-in-production
JWT_SECRET_KEY=your-jwt-secret-key-change-in-production
```

### 2. Executar Script de Configuração

```bash
# Tornar script executável
chmod +x setup.sh

# Executar script de configuração
./setup.sh
```

---

## 🗄️ Banco de Dados

### 1. Conexão com PostgreSQL

O projeto usa SQLAlchemy para se conectar diretamente ao PostgreSQL. A conexão é configurada no arquivo `src/synapse/database.py`.

```python
# Exemplo de configuração no database.py
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from .config import settings

DATABASE_URL = settings.database_url
DATABASE_SCHEMA = settings.database_schema

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### 2. Verificação da Conexão

```bash
# Verificar conexão com o banco
python -c "
import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

database_url = os.getenv('DATABASE_URL')
schema = os.getenv('DATABASE_SCHEMA', 'synapscale_db')

if not database_url:
    print('❌ DATABASE_URL não configurada no arquivo .env')
    exit(1)

try:
    engine = create_engine(database_url)
    with engine.connect() as conn:
        result = conn.execute(text(f'SELECT 1'))
        print('✅ Conexão com o banco de dados estabelecida com sucesso!')
except Exception as e:
    print(f'❌ Erro ao conectar ao banco de dados: {e}')
    exit(1)
"
```

### 3. Comandos PostgreSQL Úteis

```bash
# Conectar ao banco (se instalado localmente)
psql -h localhost -U username -d database_name

# Ou conectar remotamente
psql "postgresql://username:password@hostname:port/database_name?sslmode=require"

# Dentro do PostgreSQL:
\l                       # Listar bancos de dados
\c database_name         # Conectar a um banco
\dt schema_name.*        # Listar tabelas de um schema
\d schema_name.table_name # Descrever tabela
\q                       # Sair

# Comandos SQL úteis:
SELECT * FROM schema_name.table_name LIMIT 10;
SELECT COUNT(*) FROM schema_name.table_name;
```

---

## 🚀 Executando o Servidor

### 1. Modo Desenvolvimento

```bash
# Tornar script executável
chmod +x start_dev.sh

# Iniciar servidor com reload automático
./start_dev.sh

# Ou manualmente
source venv/bin/activate
python -m uvicorn src.synapse.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Modo Produção

```bash
# Tornar script executável
chmod +x start.sh

# Iniciar servidor em modo produção
./start.sh

# Ou manualmente
source venv/bin/activate
python -m uvicorn src.synapse.main:app --host 0.0.0.0 --port 8000
```

### 3. Verificação do Servidor

```bash
# Verificar se servidor está rodando
curl -s http://localhost:8000/health
# Saída esperada: {"status":"healthy","service":"synapscale-backend",...}

# Verificar informações da API
curl -s http://localhost:8000/
# Saída esperada: 
# {
#   "message": "🚀 SynapScale Backend API",
#   "version": "1.0.0",
#   "status": "running",
#   ...
# }

# Verificar processo
ps aux | grep uvicorn
```

### 4. Logs e Monitoramento

```bash
# Ver logs em tempo real (se rodando em background)
tail -f server.log

# Verificar uso de recursos
htop

# Verificar portas em uso
netstat -tlnp | grep 8000
```

---

## 📡 API Endpoints

### Endpoints Disponíveis

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| `GET` | `/` | Informações da API | ❌ |
| `GET` | `/health` | Health check | ❌ |
| `GET` | `/docs` | Documentação Swagger | ❌ |
| `GET` | `/redoc` | Documentação ReDoc | ❌ |
| `POST` | `/api/v1/auth/register` | Registrar usuário | ❌ |
| `POST` | `/api/v1/auth/login` | Login | ❌ |
| `POST` | `/api/v1/auth/refresh` | Refresh token | ✅ |
| `POST` | `/api/v1/auth/logout` | Logout | ✅ |
| `GET` | `/api/v1/workflows` | Listar workflows | ✅ |
| `POST` | `/api/v1/workflows` | Criar workflow | ✅ |
| `GET` | `/api/v1/chat` | Histórico de chat | ✅ |

### 1. Testes sem Autenticação

```bash
# Health check
curl -X GET http://localhost:8000/health

# Informações da API
curl -X GET http://localhost:8000/

# Documentação OpenAPI
curl -X GET http://localhost:8000/openapi.json | jq '.info'
```

### 2. Testes com Autenticação

```bash
# Tentar acessar endpoint protegido sem token
curl -X GET http://localhost:8000/api/v1/workflows
# Saída esperada: {"detail":"Not authenticated"}

# Tentar com token inválido
curl -X GET http://localhost:8000/api/v1/workflows \
  -H "Authorization: Bearer fake_token"
# Saída esperada: {"detail":"Credenciais inválidas"}
```

### 3. Registro e Login

```bash
# Registrar usuário
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securepassword","name":"Test User"}'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securepassword"}'
# Guarde o token retornado para usar nas próximas requisições
```

### 4. Listar Workflows

```bash
# Listar workflows (com token válido)
curl -X GET http://localhost:8000/api/v1/workflows \
  -H "Authorization: Bearer YOUR_VALID_TOKEN"

# Listar com paginação
curl -X GET "http://localhost:8000/api/v1/workflows?page=1&size=10" \
  -H "Authorization: Bearer YOUR_VALID_TOKEN"
```

---

## 🔧 Comandos Úteis

### Gerenciamento do Servidor

```bash
# Iniciar servidor em background
nohup python -m uvicorn src.synapse.main:app --host 0.0.0.0 --port 8000 > server.log 2>&1 &
echo $! > server.pid

# Parar servidor
kill $(cat server.pid)

# Reiniciar servidor
kill $(cat server.pid) && sleep 2 && \
nohup python -m uvicorn src.synapse.main:app --host 0.0.0.0 --port 8000 > server.log 2>&1 &
echo $! > server.pid

# Ver status
if ps -p $(cat server.pid 2>/dev/null) > /dev/null 2>&1; then
  echo "✅ Servidor rodando (PID: $(cat server.pid))"
else
  echo "❌ Servidor parado"
fi
```

### Gerenciamento de Dependências

```bash
# Atualizar pip
pip install --upgrade pip

# Instalar dependências
pip install -r requirements.txt

# Adicionar nova dependência
pip install nome-da-biblioteca
pip freeze > requirements.txt

# Ver dependências instaladas
pip list
```

### Logs e Debugging

```bash
# Ver logs do servidor
tail -f server.log

# Ver logs com filtro
tail -f server.log | grep ERROR

# Verificar conexões
netstat -an | grep :8000

# Verificar uso de memória
ps aux | grep uvicorn | grep -v grep
```

---

## 🧪 Testes e Validação

### 1. Testes Automatizados

```bash
# Executar todos os testes
pytest tests/ -v

# Testes com coverage
pytest tests/ --cov=src --cov-report=html

# Testes específicos
pytest tests/unit/test_auth_service.py -v
pytest tests/integration/test_auth_endpoints.py -v
```

### 2. Validação da API

```bash
# Verificar health check
curl -s http://localhost:8000/health

# Verificar documentação
curl -s http://localhost:8000/docs

# Verificar status do banco de dados
curl -s http://localhost:8000/health | grep database
```

### 3. Teste de Performance

```bash
# Instalar Apache Bench (se não tiver)
sudo apt-get install apache2-utils

# Teste de carga no health endpoint
ab -n 1000 -c 10 http://localhost:8000/health

# Teste de carga na API
ab -n 100 -c 5 -H "Authorization: Bearer YOUR_VALID_TOKEN" http://localhost:8000/api/v1/workflows
```

---

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Servidor não inicia

```bash
# Verificar se porta está em uso
netstat -tlnp | grep 8000

# Matar processo na porta 8000
sudo fuser -k 8000/tcp

# Verificar dependências
pip check

# Verificar sintaxe Python
python -m py_compile src/synapse/main.py
```

#### 2. Erro de banco de dados

```bash
# Verificar variáveis de ambiente
cat .env | grep DATABASE

# Verificar conexão com o banco
python -c "
import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
database_url = os.getenv('DATABASE_URL')
try:
    engine = create_engine(database_url)
    with engine.connect() as conn:
        result = conn.execute(text('SELECT 1'))
        print('✅ Conexão com o banco de dados OK')
except Exception as e:
    print(f'❌ Erro ao conectar ao banco de dados: {e}')
"
```

#### 3. Erro de importação

```bash
# Verificar PYTHONPATH
echo $PYTHONPATH

# Testar importações
python -c "
import sys
sys.path.append('src')
from synapse.main import app
print('✅ Importações OK')
"

# Verificar estrutura de módulos
find src -name "__init__.py" | head -10
```

#### 4. Erro de autenticação

```bash
# Verificar configurações JWT
cat .env | grep JWT

# Testar geração de token
python -c "
import jwt
import datetime
secret = 'test_secret'
token = jwt.encode(
    {'sub': 'test', 'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=30)},
    secret,
    algorithm='HS256'
)
print(f'Token: {token}')
decoded = jwt.decode(token, secret, algorithms=['HS256'])
print(f'Decoded: {decoded}')
"
```

---

## 👨‍💻 Desenvolvimento

### 1. Setup Ambiente de Desenvolvimento

```bash
# Criar ambiente virtual
python -m venv venv
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Configurar pre-commit hooks (se disponível)
pre-commit install

# Configurar IDE (VS Code)
mkdir -p .vscode
cat > .vscode/settings.json << 'EOF'
{
    "python.defaultInterpreterPath": "./venv/bin/python",
    "python.linting.enabled": true,
    "python.linting.pylintEnabled": true,
    "python.formatting.provider": "black",
    "python.sortImports.args": ["--profile", "black"]
}
EOF
```

### 2. Estrutura para Novos Endpoints

```python
# Template para novo endpoint
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...dependencies import get_db, get_current_user
from ....models.user import User
from ....schemas.my_schema import MySchema, MySchemaCreate, MySchemaUpdate

router = APIRouter()

@router.get("/", response_model=list[MySchema])
def get_items(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all items."""
    # Implementação
    return []

@router.post("/", response_model=MySchema, status_code=status.HTTP_201_CREATED)
def create_item(
    item: MySchemaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create new item."""
    # Implementação
    return {}

@router.get("/{item_id}", response_model=MySchema)
def get_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get item by ID."""
    # Implementação
    return {}

@router.put("/{item_id}", response_model=MySchema)
def update_item(
    item_id: int,
    item: MySchemaUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update item."""
    # Implementação
    return {}

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete item."""
    # Implementação
    return None
```

---

## 🚀 Deploy e Produção

### 1. Preparação para Produção

```bash
# Configurar variáveis de ambiente para produção
cp .env.example .env.prod
# Editar .env.prod com valores de produção

# Verificar configurações
cat .env.prod | grep -v "^#" | grep -v "^$"
```

### 2. Deploy com Docker

```bash
# Construir imagem Docker
docker build -t synapscale-backend:latest .

# Executar container
docker run -d \
  --name synapscale-api \
  -p 8000:8000 \
  --env-file .env.prod \
  synapscale-backend:latest

# Verificar logs
docker logs -f synapscale-api
```

### 3. Deploy com Docker Compose

```yaml
# docker-compose.yml
version: '3'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    env_file:
      - .env.prod
    restart: always
    depends_on:
      - db
    networks:
      - synapscale-network

  db:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data/
    env_file:
      - .env.prod
    environment:
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_DB=${POSTGRES_DB}
    networks:
      - synapscale-network

networks:
  synapscale-network:

volumes:
  postgres_data:
```

```bash
# Iniciar com Docker Compose
docker-compose up -d

# Verificar status
docker-compose ps

# Verificar logs
docker-compose logs -f api
```

### 4. Monitoramento em Produção

```bash
# Monitorar logs
docker logs -f synapscale-api

# Monitorar recursos
docker stats synapscale-api

# Verificar status
curl -s http://localhost:8000/health
```

---

## 📝 Conclusão

Este guia fornece uma visão completa do SynapScale Backend, desde a instalação até o deploy em produção. Para questões específicas ou suporte adicional, consulte a documentação detalhada em `/docs` ou entre em contato com a equipe de desenvolvimento.

---

**Desenvolvido com ❤️ pela equipe SynapScale**

