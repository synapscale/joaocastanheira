# Guia de Desenvolvimento do SynapScale Backend

## Visão Geral

Este guia fornece instruções detalhadas para desenvolvedores que desejam contribuir ou estender o backend do SynapScale. O projeto segue uma arquitetura modular baseada em FastAPI, com separação clara de responsabilidades e componentes desacoplados.

## Configuração do Ambiente de Desenvolvimento

### Pré-requisitos

- Python 3.11 ou superior
- Poetry (gerenciador de dependências)
- SQLite (para desenvolvimento local)

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/synapscale/synapse-backend-agents-jc.git
cd synapse-backend-agents-jc
```

2. Instale as dependências com Poetry:
```bash
poetry install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Edite o arquivo `.env` conforme necessário para seu ambiente local.

5. Execute as migrações do banco de dados:
```bash
poetry run alembic upgrade head
```

### Executando o Servidor de Desenvolvimento

```bash
poetry run uvicorn src.synapse.main:app --reload
```

O servidor estará disponível em `http://localhost:8000`.

## Estrutura do Projeto

```
synapse-backend/
├── alembic/                  # Migrações de banco de dados
├── docs/                     # Documentação
│   └── api/                  # Documentação da API
├── src/
│   └── synapse/              # Código-fonte principal
│       ├── api/              # Endpoints da API
│       │   └── v1/           # Versão 1 da API
│       ├── core/             # Componentes centrais
│       │   ├── auth/         # Autenticação e autorização
│       │   ├── security/     # Segurança e validação
│       │   └── storage/      # Gerenciamento de armazenamento
│       ├── db/               # Configuração de banco de dados
│       ├── middlewares/      # Middlewares da aplicação
│       ├── models/           # Modelos de dados
│       ├── schemas/          # Esquemas Pydantic
│       └── services/         # Lógica de negócios
├── tests/                    # Testes automatizados
│   ├── integration/          # Testes de integração
│   └── unit/                 # Testes unitários
├── utils/                    # Scripts utilitários
├── .env.example              # Exemplo de variáveis de ambiente
├── pyproject.toml            # Configuração do Poetry
└── README.md                 # Documentação principal
```

## Padrões de Desenvolvimento

### Estilo de Código

O projeto utiliza as seguintes ferramentas para garantir a qualidade e consistência do código:

- **Black**: Formatador automático de código
- **Flake8**: Linter para verificação de estilo
- **isort**: Organizador de imports
- **mypy**: Verificação de tipos estáticos

Para aplicar essas ferramentas ao código:

```bash
# Formatar código com Black
poetry run black src/ tests/

# Verificar estilo com Flake8
poetry run flake8 src/ tests/

# Organizar imports
poetry run isort src/ tests/

# Verificar tipos
poetry run mypy src/
```

### Convenções de Nomenclatura

- **Arquivos**: snake_case (ex: `file_service.py`)
- **Classes**: PascalCase (ex: `FileService`)
- **Funções/Métodos**: snake_case (ex: `upload_file`)
- **Variáveis**: snake_case (ex: `file_size`)
- **Constantes**: UPPER_SNAKE_CASE (ex: `MAX_FILE_SIZE`)

### Documentação de Código

- Utilize docstrings no estilo Google para documentar classes e funções
- Inclua tipos de parâmetros e retorno usando type hints
- Documente exceções que podem ser lançadas

Exemplo:
```python
def upload_file(file: UploadFile, category: str, user_id: int) -> FileUploadResponse:
    """Upload de arquivo para o sistema.
    
    Args:
        file: Arquivo a ser enviado
        category: Categoria do arquivo
        user_id: ID do usuário que está enviando o arquivo
        
    Returns:
        Resposta contendo informações do arquivo enviado
        
    Raises:
        HTTPException: Se a categoria for inválida ou o arquivo não puder ser processado
    """
    # Implementação
```

## Fluxo de Trabalho de Desenvolvimento

### Criação de Novos Endpoints

1. Defina os esquemas Pydantic em `schemas/`
2. Implemente a lógica de negócios em `services/`
3. Crie o endpoint na pasta `api/v1/endpoints/`
4. Registre o endpoint no router em `api/v1/router.py`
5. Adicione testes unitários e de integração

### Migrações de Banco de Dados

Para criar uma nova migração após alterar modelos:

```bash
poetry run alembic revision --autogenerate -m "descrição da migração"
```

Para aplicar migrações:

```bash
poetry run alembic upgrade head
```

## Testes

### Executando Testes

```bash
# Executar todos os testes
poetry run pytest

# Executar testes com cobertura
poetry run pytest --cov=src

# Executar testes específicos
poetry run pytest tests/unit/
poetry run pytest tests/integration/
```

### Escrevendo Testes

- **Testes Unitários**: Teste funções e métodos isoladamente
- **Testes de Integração**: Teste endpoints e fluxos completos

Utilize fixtures do pytest para configurar ambientes de teste e o cliente de teste do FastAPI para simular requisições HTTP.

## Implantação

### Preparação para Produção

1. Revise as configurações de segurança
2. Configure variáveis de ambiente para produção
3. Utilize um servidor WSGI como Gunicorn

### Docker

O projeto inclui um Dockerfile e docker-compose.yml para facilitar a implantação:

```bash
# Construir e iniciar os containers
docker-compose up -d

# Verificar logs
docker-compose logs -f
```

## Recursos Adicionais

- [Documentação do FastAPI](https://fastapi.tiangolo.com/)
- [Documentação do SQLAlchemy](https://docs.sqlalchemy.org/)
- [Documentação do Pydantic](https://docs.pydantic.dev/)
- [Documentação do Alembic](https://alembic.sqlalchemy.org/)
