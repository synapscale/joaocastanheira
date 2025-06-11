# Guia Detalhado de Instalação e Uso do Backend SynapScale

## Índice

1. [Introdução](#introdução)
2. [Pré-requisitos](#pré-requisitos)
3. [Instalação Local Passo a Passo](#instalação-local-passo-a-passo)
4. [Instalação com Docker Passo a Passo](#instalação-com-docker-passo-a-passo)
5. [Configuração Detalhada](#configuração-detalhada)
6. [Uso da API](#uso-da-api)
7. [Fluxos Principais](#fluxos-principais)
8. [Troubleshooting](#troubleshooting)
9. [Perguntas Frequentes](#perguntas-frequentes)

## Introdução

Este guia fornece instruções detalhadas para instalação, configuração e uso do backend SynapScale. O SynapScale é uma plataforma robusta para integração com múltiplos provedores de LLM (Large Language Models), projetada para oferecer uma infraestrutura escalável e segura para aplicações baseadas em IA.

## Pré-requisitos

Antes de iniciar a instalação, certifique-se de que seu sistema atende aos seguintes requisitos:

### Para Instalação Local

- **Python**: Versão 3.11 ou superior
  - Verifique sua versão com: `python --version`
  - Caso não tenha, instale em: [python.org](https://www.python.org/downloads/)

- **Poetry**: Gerenciador de dependências
  - Instale com: `curl -sSL https://install.python-poetry.org | python3 -`
  - Verifique a instalação com: `poetry --version`

- **PostgreSQL**: Versão 12 ou superior (opcional, pode usar SQLite para desenvolvimento)
  - Instale conforme seu sistema operacional: [postgresql.org/download](https://www.postgresql.org/download/)
  - Crie um banco de dados: `createdb synapse`

- **Redis**: Versão 6 ou superior (opcional, para rate limiting)
  - Instale conforme seu sistema operacional: [redis.io/download](https://redis.io/download/)

### Para Instalação com Docker

- **Docker**: Versão 20.10 ou superior
  - Instale em: [docs.docker.com/get-docker](https://docs.docker.com/get-docker/)
  - Verifique a instalação com: `docker --version`

- **Docker Compose**: Versão 2.0 ou superior
  - Instale em: [docs.docker.com/compose/install](https://docs.docker.com/compose/install/)
  - Verifique a instalação com: `docker-compose --version`

## Instalação Local Passo a Passo

Siga estas etapas para instalar o SynapScale localmente:

### 1. Extrair o Pacote

```bash
# Crie um diretório para o projeto
mkdir -p ~/projects
cd ~/projects

# Extraia o arquivo zip
unzip synapse-backend-final.zip -d synapse-backend
cd synapse-backend
```

### 2. Configurar o Ambiente Virtual

```bash
# Instalar dependências com Poetry
poetry install

# Ativar o ambiente virtual
poetry shell
```

### 3. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar o arquivo .env com seu editor preferido
nano .env
```

Edite as seguintes variáveis no arquivo `.env`:

- `ENVIRONMENT`: Defina como `development`, `testing` ou `production`
- `SECRET_KEY`: Gere uma chave segura com `openssl rand -hex 32`
- `DATABASE_URL`: Configure a URL do banco de dados
- `STORAGE_BASE_PATH`: Defina o caminho para armazenamento de arquivos

### 4. Inicializar o Banco de Dados

```bash
# Executar migrações
alembic upgrade head
```

### 5. Criar Diretórios de Armazenamento

```bash
# Criar diretórios para cada categoria de arquivo
mkdir -p storage/image storage/video storage/audio storage/document storage/archive
```

### 6. Iniciar a Aplicação

```bash
# Usando o script de inicialização
chmod +x scripts/start.sh
./scripts/start.sh

# OU manualmente
uvicorn src.synapse.main:app --host 0.0.0.0 --port 8000 --reload
```

### 7. Verificar a Instalação

Abra seu navegador e acesse:
- API: http://localhost:8000
- Documentação: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Instalação com Docker Passo a Passo

Siga estas etapas para instalar o SynapScale usando Docker:

### 1. Extrair o Pacote

```bash
# Crie um diretório para o projeto
mkdir -p ~/projects
cd ~/projects

# Extraia o arquivo zip
unzip synapse-backend-final.zip -d synapse-backend
cd synapse-backend
```

### 2. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar o arquivo .env com seu editor preferido
nano .env
```

Para Docker, certifique-se de configurar:
- `DATABASE_URL`: Deve ser `postgresql+asyncpg://postgres:postgres@db:5432/synapse`
- `REDIS_URL`: Deve ser `redis://redis:6379/0`

### 3. Construir e Iniciar os Contêineres

```bash
# Construir e iniciar em segundo plano
docker-compose up -d

# Verificar logs
docker-compose logs -f
```

### 4. Verificar a Instalação

Abra seu navegador e acesse:
- API: http://localhost:8000
- Documentação: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 5. Parar os Contêineres (quando necessário)

```bash
docker-compose down
```

## Configuração Detalhada

O arquivo `.env` contém todas as configurações do sistema. Abaixo está uma explicação detalhada de cada parâmetro:

### Configurações Gerais

| Parâmetro | Descrição | Exemplo | Obrigatório |
|-----------|-----------|---------|-------------|
| `ENVIRONMENT` | Ambiente de execução | `development`, `testing`, `production` | Sim |
| `PROJECT_NAME` | Nome do projeto | `SynapScale Backend` | Sim |
| `VERSION` | Versão da API | `1.0.0` | Sim |
| `API_V1_STR` | Prefixo da API v1 | `/api/v1` | Sim |

### Segurança

| Parâmetro | Descrição | Exemplo | Obrigatório |
|-----------|-----------|---------|-------------|
| `SECRET_KEY` | Chave para assinatura JWT | `openssl rand -hex 32` | Sim |
| `ALGORITHM` | Algoritmo para JWT | `HS256` | Sim |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Tempo de expiração do token | `30` | Sim |
| `BACKEND_CORS_ORIGINS` | Origens permitidas para CORS | `http://localhost,http://localhost:3000` | Não |

### Banco de Dados

| Parâmetro | Descrição | Exemplo | Obrigatório |
|-----------|-----------|---------|-------------|
| `DATABASE_URL` | URL de conexão com o banco | `sqlite+aiosqlite:///./synapse.db` | Sim |

### Redis (para Rate Limiting)

| Parâmetro | Descrição | Exemplo | Obrigatório |
|-----------|-----------|---------|-------------|
| `REDIS_URL` | URL de conexão com Redis | `redis://localhost:6379/0` | Não |
| `RATE_LIMIT_ENABLED` | Habilitar rate limiting | `true` | Não |
| `RATE_LIMIT_REQUESTS` | Número máximo de requisições | `100` | Não |
| `RATE_LIMIT_WINDOW` | Janela de tempo em segundos | `3600` | Não |

### Armazenamento

| Parâmetro | Descrição | Exemplo | Obrigatório |
|-----------|-----------|---------|-------------|
| `STORAGE_BASE_PATH` | Diretório base para armazenamento | `./storage` | Sim |
| `MAX_UPLOAD_SIZE` | Tamanho máximo de upload em bytes | `104857600` (100MB) | Sim |
| `ALLOWED_FILE_CATEGORIES` | Categorias permitidas | `image,video,audio,document,archive` | Sim |

### Logging

| Parâmetro | Descrição | Exemplo | Obrigatório |
|-----------|-----------|---------|-------------|
| `LOG_LEVEL` | Nível de logging | `INFO`, `DEBUG`, `WARNING`, `ERROR` | Sim |
| `LOG_FORMAT` | Formato de logs | `json`, `text` | Sim |

## Uso da API

### Autenticação

Todas as requisições (exceto health check) requerem autenticação via token JWT no header:

```
Authorization: Bearer <token>
```

Para obter um token (em ambiente de desenvolvimento), você pode usar o endpoint de login:

```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "test@example.com", "password": "password"}'
```

### Endpoints Principais

#### 1. Upload de Arquivo

**Requisição:**

```bash
curl -X POST "http://localhost:8000/api/v1/files/upload" \
  -H "Authorization: Bearer <token>" \
  -F "file=@/caminho/para/arquivo.pdf" \
  -F "category=document" \
  -F "tags=relatório,financeiro" \
  -F "description=Relatório financeiro anual" \
  -F "is_public=false"
```

**Resposta:**

```json
{
  "file_id": "123e4567-e89b-12d3-a456-426614174000",
  "message": "Arquivo enviado com sucesso"
}
```

#### 2. Listar Arquivos

**Requisição:**

```bash
curl -X GET "http://localhost:8000/api/v1/files?page=1&size=10&category=document" \
  -H "Authorization: Bearer <token>"
```

**Resposta:**

```json
{
  "items": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "user_id": "user_123",
      "filename": "documento.pdf",
      "category": "document",
      "mime_type": "application/pdf",
      "size": "1048576",
      "tags": ["relatório", "financeiro"],
      "description": "Relatório financeiro anual",
      "is_public": false,
      "status": "completed",
      "created_at": "2023-01-01T12:00:00",
      "updated_at": "2023-01-01T12:00:00"
    }
  ],
  "total": 1,
  "page": 1,
  "size": 10,
  "pages": 1
}
```

#### 3. Obter Informações do Arquivo

**Requisição:**

```bash
curl -X GET "http://localhost:8000/api/v1/files/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer <token>"
```

**Resposta:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "user_id": "user_123",
  "filename": "documento.pdf",
  "category": "document",
  "mime_type": "application/pdf",
  "size": "1048576",
  "tags": ["relatório", "financeiro"],
  "description": "Relatório financeiro anual",
  "is_public": false,
  "status": "completed",
  "created_at": "2023-01-01T12:00:00",
  "updated_at": "2023-01-01T12:00:00"
}
```

#### 4. Gerar URL de Download

**Requisição:**

```bash
curl -X GET "http://localhost:8000/api/v1/files/123e4567-e89b-12d3-a456-426614174000/download" \
  -H "Authorization: Bearer <token>"
```

**Resposta:**

```json
{
  "download_url": "http://localhost:8000/download/123e4567-e89b-12d3-a456-426614174000?token=abc123",
  "expires_at": "2023-01-01T13:00:00"
}
```

#### 5. Atualizar Informações do Arquivo

**Requisição:**

```bash
curl -X PATCH "http://localhost:8000/api/v1/files/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "tags": ["relatório", "financeiro", "2023"],
    "description": "Relatório financeiro anual atualizado",
    "is_public": true
  }'
```

**Resposta:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "user_id": "user_123",
  "filename": "documento.pdf",
  "category": "document",
  "mime_type": "application/pdf",
  "size": "1048576",
  "tags": ["relatório", "financeiro", "2023"],
  "description": "Relatório financeiro anual atualizado",
  "is_public": true,
  "status": "completed",
  "created_at": "2023-01-01T12:00:00",
  "updated_at": "2023-01-01T12:05:00"
}
```

#### 6. Remover Arquivo

**Requisição:**

```bash
curl -X DELETE "http://localhost:8000/api/v1/files/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer <token>"
```

**Resposta:**

Status 204 No Content

## Fluxos Principais

### Fluxo de Upload de Arquivo

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Cliente    │────▶│  Endpoint   │────▶│  Validação  │────▶│  Serviço    │
│             │     │  Upload     │     │  Segurança  │     │  Arquivo    │
└─────────────┘     └─────────────┘     └─────────────┘     └──────┬──────┘
                                                                   │
                                                                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Resposta   │◀────│  Banco de   │◀────│ Metadados   │◀────│ Armazenamento│
│  ao Cliente │     │  Dados      │     │ do Arquivo  │     │ do Arquivo  │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

1. O cliente envia uma requisição POST para `/api/v1/files/upload` com o arquivo e metadados
2. O endpoint valida os parâmetros de entrada usando schemas Pydantic
3. O serviço de arquivos valida a segurança do arquivo usando o SecurityValidator
4. O arquivo é armazenado usando o StorageManager
5. Os metadados são salvos no banco de dados
6. Uma resposta com o ID do arquivo é retornada ao cliente

### Fluxo de Download de Arquivo

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Cliente    │────▶│  Endpoint   │────▶│  Autenticação│────▶│  Serviço    │
│             │     │  Download   │     │  Autorização │     │  Arquivo    │
└─────────────┘     └─────────────┘     └─────────────┘     └──────┬──────┘
                                                                   │
                                                                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Resposta   │◀────│  URL de     │◀────│  Verificação │◀────│  Banco de   │
│  ao Cliente │     │  Download   │     │  Permissão   │     │  Dados      │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

1. O cliente envia uma requisição GET para `/api/v1/files/{file_id}/download`
2. O endpoint verifica a autenticação e autorização do usuário
3. O serviço de arquivos verifica se o arquivo existe e se o usuário tem permissão
4. O StorageManager gera uma URL temporária para download
5. A URL e a data de expiração são retornadas ao cliente

## Troubleshooting

### Problemas Comuns e Soluções

#### 1. Erro de Conexão com o Banco de Dados

**Problema:** A aplicação não consegue se conectar ao banco de dados.

**Solução:**
1. Verifique se o banco de dados está em execução:
   ```bash
   # Para PostgreSQL
   pg_isready -h localhost -p 5432
   
   # Para Docker
   docker-compose ps db
   ```

2. Verifique a URL de conexão no arquivo `.env`:
   ```
   DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/synapse
   ```

3. Certifique-se de que o banco de dados existe:
   ```bash
   psql -U postgres -c "CREATE DATABASE synapse;"
   ```

#### 2. Erro de Permissão no Armazenamento

**Problema:** Erros ao salvar ou acessar arquivos.

**Solução:**
1. Verifique se os diretórios de armazenamento existem:
   ```bash
   ls -la storage/
   ```

2. Corrija as permissões:
   ```bash
   chmod -R 755 storage/
   ```

3. Verifique o caminho configurado em `.env`:
   ```
   STORAGE_BASE_PATH=./storage
   ```

#### 3. Erro de Autenticação

**Problema:** Tokens JWT inválidos ou expirados.

**Solução:**
1. Verifique se a SECRET_KEY está configurada corretamente
2. Gere um novo token de autenticação
3. Verifique se o tempo de expiração não é muito curto:
   ```
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

#### 4. Problemas com Docker

**Problema:** Contêineres não iniciam ou falham.

**Solução:**
1. Verifique os logs:
   ```bash
   docker-compose logs -f
   ```

2. Reinicie os contêineres:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

3. Verifique se as portas não estão em uso:
   ```bash
   netstat -tuln | grep 8000
   netstat -tuln | grep 5432
   ```

## Perguntas Frequentes

### 1. Como alterar a porta da API?

Para alterar a porta da API, você pode:

- **Instalação Local**: Editar o comando de inicialização:
  ```bash
  uvicorn src.synapse.main:app --host 0.0.0.0 --port 9000 --reload
  ```

- **Docker**: Editar o arquivo `docker-compose.yml`:
  ```yaml
  services:
    api:
      ports:
        - "9000:8000"
  ```

### 2. Como configurar para produção?

Para configurar o ambiente de produção:

1. Defina `ENVIRONMENT=production` no arquivo `.env`
2. Gere uma SECRET_KEY forte: `openssl rand -hex 32`
3. Configure um banco de dados PostgreSQL dedicado
4. Configure CORS apenas para origens confiáveis
5. Desative o modo de reload: `uvicorn src.synapse.main:app --host 0.0.0.0 --port 8000`
6. Use um proxy reverso como Nginx ou Traefik

### 3. Como fazer backup dos dados?

Para fazer backup dos dados:

1. **Banco de Dados**:
   ```bash
   # PostgreSQL
   pg_dump -U postgres synapse > backup_$(date +%Y%m%d).sql
   
   # SQLite
   cp synapse.db synapse_backup_$(date +%Y%m%d).db
   ```

2. **Arquivos**:
   ```bash
   tar -czf storage_backup_$(date +%Y%m%d).tar.gz storage/
   ```

### 4. Como escalar a aplicação?

Para escalar a aplicação:

1. **Horizontalmente**: Use múltiplas instâncias atrás de um balanceador de carga
2. **Verticalmente**: Aumente os recursos dos servidores
3. **Banco de Dados**: Configure réplicas de leitura
4. **Armazenamento**: Migre para um serviço de armazenamento em nuvem (S3, Azure Blob, etc.)
5. **Cache**: Implemente Redis para caching de dados frequentemente acessados
