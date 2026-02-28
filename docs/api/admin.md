# API - Administração (Admin)

Endpoints restritos a usuários com role `ADMIN`. Usados para gerenciar usuários da aplicação.

## Endpoints

### 1. Listar usuários

Lista todos os usuários com paginação.

**Endpoint**: `GET /api/admin/users`

**Autenticação**: ✅ Requerida (ADMIN)

#### Query params

| Parâmetro | Tipo   | Default | Descrição        |
|-----------|--------|---------|------------------|
| `page`    | number | 1       | Página atual     |
| `limit`   | number | 20      | Itens por página (máx. 50) |

#### Respostas

**200 OK**

```json
{
  "users": [
    {
      "id": 1,
      "name": "João Silva",
      "email": "joao@example.com",
      "social_name": "João",
      "igreja": "Igreja Central",
      "role": "USER",
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

**403 Forbidden** - Não é admin

```json
{
  "error": "Acesso negado. Apenas administradores podem listar usuários."
}
```

**500 Internal Server Error**

```json
{
  "error": "Erro ao listar usuários"
}
```

#### Observações

- O campo `password` nunca é retornado.
- Usuários ordenados por `createdAt` descendente.

---

### 2. Obter um usuário

Retorna um usuário por ID para edição.

**Endpoint**: `GET /api/admin/users/[id]`

**Autenticação**: ✅ Requerida (ADMIN)

#### Respostas

**200 OK**

```json
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@example.com",
  "social_name": "João",
  "igreja": "Igreja Central",
  "role": "USER",
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```

**400 Bad Request** - ID inválido

```json
{
  "error": "ID de usuário inválido"
}
```

**404 Not Found**

```json
{
  "error": "Usuário não encontrado"
}
```

**403 Forbidden**

```json
{
  "error": "Acesso negado. Apenas administradores podem visualizar usuários."
}
```

---

### 3. Atualizar usuário

Atualiza nome, e-mail, nome social, igreja e/ou senha de um usuário.

**Endpoint**: `PATCH /api/admin/users/[id]`

**Autenticação**: ✅ Requerida (ADMIN)

#### Request body

Todos os campos são opcionais. Envie apenas os que deseja alterar.

```json
{
  "name": "string",
  "email": "string",
  "social_name": "string | null",
  "igreja": "string | null",
  "password": "string"
}
```

| Campo        | Regras                                                                 |
|--------------|------------------------------------------------------------------------|
| `name`       | Obrigatório se enviado; não pode ser vazio                             |
| `email`      | Obrigatório se enviado; não pode ser vazio; deve ser único (exceto o próprio usuário) |
| `social_name`| Opcional; string ou `null` para limpar                                 |
| `igreja`     | Opcional; string ou `null` para limpar                                 |
| `password`   | Opcional; se enviado e não vazio, será hasheado (bcrypt) e atualizado; em branco = não altera |

#### Respostas

**200 OK** - Retorna o usuário atualizado (sem senha)

```json
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@example.com",
  "social_name": "João",
  "igreja": "Igreja Central",
  "role": "USER",
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```

**400 Bad Request** - Validação

Exemplos:

```json
{ "error": "Nome não pode ser vazio" }
{ "error": "E-mail não pode ser vazio" }
{ "error": "E-mail já está em uso" }
{ "error": "Nenhum campo para atualizar" }
```

**403 Forbidden**

```json
{
  "error": "Acesso negado. Apenas administradores podem atualizar usuários."
}
```

**500 Internal Server Error**

```json
{
  "error": "Erro ao atualizar usuário"
}
```

---

### 4. Excluir usuário

Exclui um usuário permanentemente. O administrador não pode excluir a própria conta.

**Endpoint**: `DELETE /api/admin/users/[id]`

**Autenticação**: ✅ Requerida (ADMIN)

#### Respostas

**200 OK**

```json
{
  "message": "Usuário excluído com sucesso"
}
```

**400 Bad Request** - Tentativa de excluir a própria conta

```json
{
  "error": "Você não pode excluir sua própria conta."
}
```

**404 Not Found**

```json
{
  "error": "Usuário não encontrado"
}
```

**403 Forbidden**

```json
{
  "error": "Acesso negado. Apenas administradores podem excluir usuários."
}
```

**500 Internal Server Error**

```json
{
  "error": "Erro ao excluir usuário"
}
```

#### Observações

- As relações do usuário (contas, sessões, respostas, resultados, etc.) são removidas em cascata.
- O admin logado não pode excluir a si mesmo; a API retorna 400 nesse caso.

---

## Fluxo de uso (Frontend)

1. **Listagem**: `GET /api/admin/users?page=1&limit=20` na página `/admin/usuarios`.
2. **Edição**: Ao clicar em "Editar", navegar para `/admin/usuarios/[id]` e carregar `GET /api/admin/users/[id]`.
3. **Salvar**: No submit do formulário, enviar `PATCH /api/admin/users/[id]` com os campos alterados (senha em branco = não alterar).
4. **Excluir**: Na listagem, botão "Excluir" abre modal de confirmação; ao confirmar, enviar `DELETE /api/admin/users/[id]`.
