# TODO Backend - Endpoints para Página Settings

## Endpoint Necessário para Implementação

### PUT /api/v1/auth/profile

**Descrição**: Atualizar informações do perfil do usuário autenticado

**Headers**:
- `Authorization: Bearer {token}` (obrigatório)
- `Content-Type: application/json`

**Request Body**:
```json
{
  "full_name": "string (opcional)",
  "email": "string (opcional)",
  "bio": "string (opcional)"
}
```

**Response** (200 - Success):
```json
{
  "id": "string",
  "email": "string",
  "username": "string",
  "full_name": "string",
  "bio": "string",
  "avatar_url": "string",
  "is_active": boolean,
  "is_verified": boolean,
  "created_at": "string",
  "updated_at": "string"
}
```

**Status Codes**:
- `200`: Perfil atualizado com sucesso
- `401`: Token inválido ou não fornecido
- `422`: Dados de validação inválidos
- `400`: Erro nos dados enviados

**Validações**:
- Email deve ser válido (se fornecido)
- Full_name deve ter pelo menos 2 caracteres (se fornecido)
- Bio deve ter no máximo 500 caracteres (se fornecido)

## Endpoints Já Implementados e Funcionando

✅ **GET /api/v1/auth/me** - Obter dados do usuário (funcionando)
✅ **POST /api/v1/auth/change-password** - Alterar senha (funcionando)

## Status Atual

- **Carregamento de dados do usuário**: ✅ Funcionando
- **Alteração de senha**: ✅ Funcionando
- **Atualização de perfil**: ⏳ Aguardando implementação do endpoint
- **Configurações da aplicação**: ✅ Funcionando (localStorage)

## Observações

1. A página settings está preparada para usar o novo endpoint quando estiver disponível
2. Atualmente, a atualização de perfil é feita apenas localmente como fallback
3. Todos os outros endpoints estão funcionando corretamente
4. A autenticação está integrada e funcionando com o sistema de tokens existente 