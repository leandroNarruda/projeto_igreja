# Documentação - Projeto Igreja

Bem-vindo à documentação técnica do Projeto Igreja, uma plataforma completa para gestão de quizzes e eventos religiosos.

## Índice

### 📐 [Arquitetura](./arquitetura.md)
Visão geral da arquitetura do sistema, fluxos principais e estrutura de camadas.

### 🔌 API (Backend)
- [Visão Geral das APIs](./api/README.md)
- [Autenticação](./api/auth.md) - Registro, login e gestão de sessões
- [Quiz](./api/quiz.md) - Gerenciamento e resposta de quizzes
- [Usuário](./api/user.md) - Perfil e configurações do usuário
- [Admin](./api/admin.md) - APIs de administração (listar e editar usuários)

### 🎨 Frontend
- [Visão Geral do Frontend](./frontend/README.md)
- [Rotas e Páginas](./frontend/rotas.md) - Mapeamento de todas as rotas

### 🔧 Ferramentas de Desenvolvimento
- [Prisma MCP Server](./mcp/prisma-mcp.md) - Consultar banco de dados via chat no Cursor

## Navegação Rápida

| Seção | Descrição |
|-------|-----------|
| **Setup** | Veja o [README principal](../README.md) para instruções de instalação |
| **Modelo de Dados** | Consulte [arquitetura.md](./arquitetura.md#modelo-de-dados) |
| **Autenticação** | Veja [api/auth.md](./api/auth.md) e [arquitetura.md](./arquitetura.md#autenticação) |
| **Rotas Protegidas** | Consulte [frontend/rotas.md](./frontend/rotas.md#rotas-protegidas) |

## Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Autenticação**: NextAuth.js v4
- **Banco de Dados**: PostgreSQL + Prisma ORM
- **Estilização**: Tailwind CSS
- **Animações**: Framer Motion

## Estrutura da Documentação

```
docs/
├── README.md              # Este arquivo (índice)
├── arquitetura.md         # Arquitetura e fluxos
├── api/
│   ├── README.md          # Visão geral das APIs
│   ├── admin.md           # Endpoints de administração (admin)
│   ├── auth.md            # Endpoints de autenticação
│   ├── quiz.md            # Endpoints de quiz
│   └── user.md            # Endpoints de usuário
└── frontend/
    ├── README.md          # Visão geral do frontend
    └── rotas.md           # Mapeamento de rotas
```

## Convenções

### Códigos de Status HTTP
- `200 OK` - Requisição bem-sucedida
- `201 Created` - Recurso criado com sucesso
- `400 Bad Request` - Dados inválidos ou faltando
- `401 Unauthorized` - Não autenticado
- `403 Forbidden` - Sem permissão (ex: não é admin)
- `500 Internal Server Error` - Erro do servidor

### Tipos de Usuário
- `USER` - Usuário padrão (pode responder quizzes)
- `ADMIN` - Administrador (pode criar e gerenciar quizzes)
- `MODERATOR` - Moderador (futuro)

## Contribuindo com a Documentação

Ao adicionar novos recursos:
1. Documente os endpoints em `api/[domínio].md`
2. Adicione rotas de páginas em `frontend/rotas.md`
3. Atualize diagramas em `arquitetura.md` se necessário
4. Mantenha o padrão de templates documentado
