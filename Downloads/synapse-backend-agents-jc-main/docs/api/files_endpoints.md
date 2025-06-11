# Documentação da API de Arquivos

## Visão Geral

A API de Arquivos do SynapScale permite o gerenciamento completo de arquivos na plataforma, incluindo upload, download, listagem e exclusão de arquivos.

## Endpoints

### Upload de Arquivo

**Método HTTP e URL**
- **Método**: POST
- **Path**: `/api/v1/files/upload`
- **Exemplo de URL**: `https://api.synapscale.com/api/v1/files/upload`

**Autenticação e Autorização**
- **Tipo**: Bearer Token JWT
- **Headers Obrigatórios**: 
  - `Authorization: Bearer {token}`
  - `Content-Type: multipart/form-data`

**Parâmetros de Entrada**
- **Form Params**:
  - `category` (string, obrigatório): Categoria do arquivo. Valores aceitos definidos em `FILE_CATEGORIES`.
  - `file` (file, obrigatório): Arquivo a ser enviado.

**Exemplo de Requisição**
```bash
curl -X POST \
  https://api.synapscale.com/api/v1/files/upload \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: multipart/form-data' \
  -F 'category=document' \
  -F 'file=@/path/to/file.pdf'
```

**Resposta da API**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "filename": "550e8400-e29b-41d4-a716-446655440000.pdf",
  "original_filename": "file.pdf",
  "content_type": "application/pdf",
  "file_size": 12345,
  "file_hash": "a1b2c3d4e5f6...",
  "created_at": "2025-05-27T14:30:00Z",
  "download_url": "/api/v1/files/550e8400-e29b-41d4-a716-446655440000/download"
}
```

**Tratamento de Erros**
- **400 Bad Request**: Categoria inválida ou arquivo não fornecido
- **401 Unauthorized**: Token de autenticação ausente ou inválido
- **413 Payload Too Large**: Arquivo excede o tamanho máximo permitido
- **415 Unsupported Media Type**: Tipo de arquivo não suportado
- **429 Too Many Requests**: Limite de requisições excedido

**Observações Técnicas**
- O tamanho máximo de arquivo é definido nas configurações do servidor
- Os arquivos são validados quanto ao tipo MIME e extensão
- Um hash único é gerado para cada arquivo para evitar duplicações

### Listar Arquivos

**Método HTTP e URL**
- **Método**: GET
- **Path**: `/api/v1/files/`
- **Exemplo de URL**: `https://api.synapscale.com/api/v1/files/?page=1&size=10&category=document`

**Autenticação e Autorização**
- **Tipo**: Bearer Token JWT
- **Headers Obrigatórios**: 
  - `Authorization: Bearer {token}`

**Parâmetros de Entrada**
- **Query Params**:
  - `page` (integer, opcional): Número da página, padrão: 1
  - `size` (integer, opcional): Tamanho da página, padrão: 10, máximo: 100
  - `category` (string, opcional): Filtrar por categoria

**Exemplo de Requisição**
```bash
curl -X GET \
  'https://api.synapscale.com/api/v1/files/?page=1&size=10&category=document' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

**Resposta da API**
```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "filename": "550e8400-e29b-41d4-a716-446655440000.pdf",
      "original_filename": "file.pdf",
      "content_type": "application/pdf",
      "file_size": 12345,
      "created_at": "2025-05-27T14:30:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "size": 10,
  "pages": 1
}
```

**Tratamento de Erros**
- **401 Unauthorized**: Token de autenticação ausente ou inválido
- **400 Bad Request**: Parâmetros de paginação inválidos

**Observações Técnicas**
- A resposta é paginada para melhor performance
- O filtro por categoria é opcional e case-sensitive

### Obter Informações de Arquivo

**Método HTTP e URL**
- **Método**: GET
- **Path**: `/api/v1/files/{file_id}`
- **Exemplo de URL**: `https://api.synapscale.com/api/v1/files/550e8400-e29b-41d4-a716-446655440000`

**Autenticação e Autorização**
- **Tipo**: Bearer Token JWT
- **Headers Obrigatórios**: 
  - `Authorization: Bearer {token}`

**Parâmetros de Entrada**
- **Path Params**:
  - `file_id` (UUID, obrigatório): ID do arquivo

**Exemplo de Requisição**
```bash
curl -X GET \
  https://api.synapscale.com/api/v1/files/550e8400-e29b-41d4-a716-446655440000 \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

**Resposta da API**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "filename": "550e8400-e29b-41d4-a716-446655440000.pdf",
  "original_filename": "file.pdf",
  "content_type": "application/pdf",
  "file_size": 12345,
  "file_hash": "a1b2c3d4e5f6...",
  "created_at": "2025-05-27T14:30:00Z",
  "updated_at": "2025-05-27T14:30:00Z",
  "description": null,
  "tags": [],
  "is_public": "false"
}
```

**Tratamento de Erros**
- **401 Unauthorized**: Token de autenticação ausente ou inválido
- **403 Forbidden**: Usuário não tem permissão para acessar este arquivo
- **404 Not Found**: Arquivo não encontrado

### Download de Arquivo

**Método HTTP e URL**
- **Método**: GET
- **Path**: `/api/v1/files/{file_id}/download`
- **Exemplo de URL**: `https://api.synapscale.com/api/v1/files/550e8400-e29b-41d4-a716-446655440000/download`

**Autenticação e Autorização**
- **Tipo**: Bearer Token JWT
- **Headers Obrigatórios**: 
  - `Authorization: Bearer {token}`

**Parâmetros de Entrada**
- **Path Params**:
  - `file_id` (UUID, obrigatório): ID do arquivo

**Exemplo de Requisição**
```bash
curl -X GET \
  https://api.synapscale.com/api/v1/files/550e8400-e29b-41d4-a716-446655440000/download \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

**Resposta da API**
- Conteúdo binário do arquivo com os headers apropriados:
  - `Content-Type`: Tipo MIME do arquivo
  - `Content-Disposition`: `attachment; filename="original_filename.ext"`

**Tratamento de Erros**
- **401 Unauthorized**: Token de autenticação ausente ou inválido
- **403 Forbidden**: Usuário não tem permissão para acessar este arquivo
- **404 Not Found**: Arquivo não encontrado

**Observações Técnicas**
- O endpoint retorna o arquivo binário diretamente, não um JSON
- O header Content-Disposition garante que o navegador trate como download

### Deletar Arquivo

**Método HTTP e URL**
- **Método**: DELETE
- **Path**: `/api/v1/files/{file_id}`
- **Exemplo de URL**: `https://api.synapscale.com/api/v1/files/550e8400-e29b-41d4-a716-446655440000`

**Autenticação e Autorização**
- **Tipo**: Bearer Token JWT
- **Headers Obrigatórios**: 
  - `Authorization: Bearer {token}`

**Parâmetros de Entrada**
- **Path Params**:
  - `file_id` (UUID, obrigatório): ID do arquivo

**Exemplo de Requisição**
```bash
curl -X DELETE \
  https://api.synapscale.com/api/v1/files/550e8400-e29b-41d4-a716-446655440000 \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

**Resposta da API**
```json
{
  "message": "Arquivo deletado com sucesso"
}
```

**Tratamento de Erros**
- **401 Unauthorized**: Token de autenticação ausente ou inválido
- **403 Forbidden**: Usuário não tem permissão para deletar este arquivo
- **404 Not Found**: Arquivo não encontrado

**Observações Técnicas**
- A operação de exclusão é permanente e não pode ser desfeita
- O arquivo é removido tanto do banco de dados quanto do armazenamento físico
