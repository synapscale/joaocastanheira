# Arquitetura do Backend SynapScale

## Visão Geral

O backend SynapScale foi projetado seguindo princípios de arquitetura moderna, com foco em modularidade, escalabilidade, segurança e manutenibilidade. Este documento descreve a arquitetura de alto nível, os componentes principais e os fluxos de dados.

## Princípios Arquiteturais

- **Separação de Responsabilidades**: Cada componente tem uma função específica e bem definida
- **Modularidade**: Componentes são independentes e podem ser testados isoladamente
- **Escalabilidade**: Arquitetura preparada para crescimento horizontal e vertical
- **Segurança por Design**: Segurança incorporada em todos os níveis da aplicação
- **Observabilidade**: Logging e monitoramento integrados para facilitar diagnósticos

## Componentes Principais

### 1. API Layer

A camada de API é responsável por receber e responder às requisições HTTP, utilizando FastAPI para definir endpoints, validar entradas e gerar documentação OpenAPI.

**Componentes:**
- Roteadores de API
- Middlewares (CORS, Rate Limiting, Logging)
- Documentação OpenAPI/Swagger

### 2. Service Layer

A camada de serviço contém a lógica de negócio da aplicação, implementando as operações principais e orquestrando os componentes de nível inferior.

**Componentes:**
- FileService: Gerencia operações de arquivos (upload, download, listagem, remoção)
- Serviços futuros para outras funcionalidades

### 3. Core Layer

A camada core contém componentes fundamentais utilizados por toda a aplicação.

**Componentes:**
- Auth: Autenticação e autorização
- Security: Validação e segurança de arquivos
- Storage: Gerenciamento de armazenamento

### 4. Data Layer

A camada de dados gerencia a persistência e acesso a dados.

**Componentes:**
- Models: Modelos SQLAlchemy para o banco de dados
- Schemas: Schemas Pydantic para validação e serialização
- Database: Configuração e sessões do banco de dados

## Fluxos Principais

### Fluxo de Upload de Arquivo

1. O cliente envia uma requisição POST para `/api/v1/files/upload` com o arquivo e metadados
2. O middleware de rate limiting verifica se o cliente excedeu o limite de requisições
3. O endpoint valida os parâmetros de entrada usando schemas Pydantic
4. O serviço de arquivos valida a segurança do arquivo usando o SecurityValidator
5. O arquivo é armazenado usando o StorageManager
6. Os metadados são salvos no banco de dados
7. Uma resposta com o ID do arquivo é retornada ao cliente

### Fluxo de Download de Arquivo

1. O cliente envia uma requisição GET para `/api/v1/files/{file_id}/download`
2. O endpoint verifica a autenticação e autorização do usuário
3. O serviço de arquivos verifica se o arquivo existe e se o usuário tem permissão
4. O StorageManager gera uma URL temporária para download
5. A URL e a data de expiração são retornadas ao cliente

### Fluxo de Listagem de Arquivos

1. O cliente envia uma requisição GET para `/api/v1/files` com parâmetros de paginação
2. O endpoint verifica a autenticação do usuário
3. O serviço de arquivos consulta o banco de dados para obter os arquivos do usuário
4. Os resultados são paginados e convertidos para o formato de resposta
5. A lista de arquivos e informações de paginação são retornadas ao cliente

## Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                        API Layer                            │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Endpoints  │  │ Middlewares │  │ OpenAPI/Swagger Doc │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Service Layer                          │
│                                                             │
│  ┌─────────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │  File Service   │  │ Future Svc1 │  │  Future Svc2    │  │
│  └─────────────────┘  └─────────────┘  └─────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       Core Layer                            │
│                                                             │
│  ┌─────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │    Auth     │  │    Security     │  │     Storage     │  │
│  └─────────────┘  └─────────────────┘  └─────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                            │
│                                                             │
│  ┌─────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Models    │  │     Schemas     │  │    Database     │  │
│  └─────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Considerações de Segurança

- **Autenticação**: JWT com chaves seguras e rotação periódica
- **Autorização**: Verificação de propriedade e permissões em cada operação
- **Validação de Arquivos**: Detecção de tipos perigosos e executáveis disfarçados
- **Rate Limiting**: Proteção contra abusos e ataques de força bruta
- **CORS**: Configuração restritiva baseada no ambiente

## Considerações de Escalabilidade

- **Banco de Dados**: Operações assíncronas para melhor performance
- **Armazenamento**: Interface abstrata permitindo múltiplos provedores
- **Processamento**: Preparado para implementação de filas e workers assíncronos
- **API**: Versionamento embutido na estrutura para evolução sem quebras

## Próximos Passos

- Implementação de adaptadores para armazenamento em nuvem (S3, Azure, GCP)
- Sistema de processamento assíncrono para arquivos grandes
- Implementação de cache para melhorar performance
- Expansão para outros serviços além de uploads
