# API - Visão Geral

Esta seção documenta todas as rotas de API do Projeto Igreja.

## Base URL

- **Desenvolvimento**: `http://localhost:3000/api`
- **Produção**: `https://seu-dominio.com/api`

## Autenticação

A maioria dos endpoints requer autenticação via NextAuth.js.

### Como a autenticação funciona

1. Usuário faz login via `/api/auth/callback/credentials`
2. NextAuth cria uma sessão e define cookie `next-auth.session-token`
3. Cookie é enviado automaticamente em todas as requisições subsequentes
4. Backend verifica a sessão usando `getServerSession()`

### Headers

Não é necessário enviar headers de autenticação manualmente. O cookie de sessão é gerenciado automaticamente pelo navegador.

## Domínios da API

### [Autenticação](./auth.md)
Rotas de registro e autenticação de usuários.

**Endpoints principais**:
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/register/igreja` - Registrar com igreja
- NextAuth endpoints (login, logout, session)

### [Quiz](./quiz.md)
Gerenciamento completo de quizzes e respostas.

**Endpoints principais**:
- `GET /api/quiz` - Listar quizzes (admin)
- `POST /api/quiz` - Criar quiz (admin)
- `GET /api/quiz/ativo` - Buscar quiz ativo
- `POST /api/quiz/resposta` - Enviar respostas
- `GET /api/quiz/{id}/perguntas` - Buscar perguntas
- `GET /api/quiz/{id}/resultado` - Ver resultado
- `GET /api/quiz/{id}/classificacao` - Ranking do quiz
- `GET /api/quiz/classificacao-geral` - Ranking geral

### [Usuário](./user.md)
Perfil e configurações do usuário.

**Endpoints principais**:
- `PATCH /api/user/me` - Atualizar nome social
- `POST /api/user/avatar` - Upload de avatar

## Padrões de Resposta

### Sucesso

```json
{
  "message": "Operação realizada com sucesso",
  "data": { ... }
}
```

Ou diretamente o objeto de dados:

```json
{
  "quiz": { ... },
  "perguntas": [ ... ]
}
```

### Erro

```json
{
  "error": "Mensagem de erro descritiva"
}
```

Opcionalmente com detalhes:

```json
{
  "error": "Erro ao processar",
  "detalhes": "Informações adicionais"
}
```

## Códigos de Status HTTP

| Código | Significado | Quando usar |
|--------|-------------|-------------|
| `200` | OK | Operação bem-sucedida (GET, PATCH, DELETE) |
| `201` | Created | Recurso criado com sucesso (POST) |
| `400` | Bad Request | Dados inválidos ou faltando |
| `401` | Unauthorized | Não autenticado (sem sessão) |
| `403` | Forbidden | Sem permissão (ex: não é admin) |
| `404` | Not Found | Recurso não encontrado |
| `500` | Internal Server Error | Erro do servidor |

## Controle de Acesso

### Rotas Públicas
- `POST /api/auth/register`
- `POST /api/auth/register/igreja`

### Rotas Autenticadas (USER ou ADMIN)
- `GET /api/quiz/ativo`
- `GET /api/quiz/{id}/perguntas`
- `POST /api/quiz/resposta`
- `GET /api/quiz/{id}/resultado`
- `GET /api/quiz/{id}/classificacao`
- `GET /api/quiz/classificacao-geral`
- `PATCH /api/user/me`
- `POST /api/user/avatar`

### Rotas de Admin (apenas ADMIN)
- `GET /api/quiz`
- `POST /api/quiz`
- `GET /api/quiz/{id}` (detalhes)
- `PATCH /api/quiz/{id}`
- `DELETE /api/quiz/{id}`

## Rate Limiting

Atualmente não há rate limiting implementado. Considere adicionar para produção.

## CORS

Por padrão, Next.js API Routes aceitam apenas requisições do mesmo domínio. Para habilitar CORS, configure headers personalizados nas rotas.

## Paginação

Atualmente não implementado. Endpoints que retornam listas trazem todos os registros.

**Endpoints que podem se beneficiar de paginação**:
- `GET /api/quiz` (lista de quizzes)
- `GET /api/quiz/{id}/classificacao` (ranking)

## Versionamento

Atualmente não há versionamento de API. Todas as rotas estão em `/api/*`.

Para futuras versões, considere:
- `/api/v1/*`
- `/api/v2/*`

## Exemplos de Uso

### Registrar Usuário

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "password": "senha123"
  }'
```

### Buscar Quiz Ativo (requer autenticação)

```bash
curl http://localhost:3000/api/quiz/ativo \
  -H "Cookie: next-auth.session-token=..."
```

### Enviar Respostas do Quiz

```bash
curl -X POST http://localhost:3000/api/quiz/resposta \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "quizId": 1,
    "respostas": {
      "1": "A",
      "2": "B",
      "3": null
    }
  }'
```

## Ferramentas Recomendadas

- **Postman** - Testar endpoints manualmente
- **Thunder Client** (VSCode) - Testar endpoints no editor
- **Insomnia** - Cliente REST alternativo

## Próximos Passos

- [ ] Implementar rate limiting
- [ ] Adicionar paginação em listagens
- [ ] Documentar com OpenAPI/Swagger
- [ ] Implementar versionamento de API
- [ ] Adicionar cache em endpoints frequentes
