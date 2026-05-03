# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

- **Framework**: Next.js 14 App Router, TypeScript strict mode
- **Database**: PostgreSQL via Prisma ORM v5 (`prisma/schema.prisma`)
- **Auth**: NextAuth.js v4 — JWT strategy, `CredentialsProvider` only (no OAuth)
- **Styling**: Tailwind CSS com design tokens via CSS variables (ver seção Cores abaixo)
- **Data fetching**: TanStack React Query v5 (todos os hooks em `hooks/`)
- **Realtime**: Ably v2 (ranking ao vivo)
- **Push notifications**: Web Push com VAPID + ServiceWorker
- **File storage**: Vercel Blob (apenas avatares)

## Comandos

```bash
npm run dev               # servidor local
npm run build             # prisma generate + next build
npm run lint              # ESLint
npm run format            # Prettier
npm run prisma:migrate    # prisma migrate dev (interativo, precisa de terminal)
npm run prisma:migrate:deploy  # prisma migrate deploy (CI/produção)
npm run prisma:generate   # gera Prisma Client após alterar schema
npm run prisma:studio     # Prisma Studio
```

> **Variáveis de ambiente**: definidas em `.env.local` (não commitado). Variáveis obrigatórias: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`. Opcionais: `BLOB_READ_WRITE_TOKEN`, `ABLY_API_KEY`, `VAPID_*`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`.

> **Migrations em ambiente não-interativo**: `prisma migrate dev` falha fora do terminal. Nesses casos, crie o arquivo SQL em `prisma/migrations/<timestamp>_<name>/migration.sql` e aplique com `prisma migrate deploy`. Sempre rode `prisma generate` depois.

## Arquitetura de rotas

```
app/
├── (auth)/               # Páginas públicas: /login, /cadastro
├── (protected)/          # Requer autenticação (verificado no middleware)
│   ├── admin/            # Requer role ADMIN
│   │   ├── layout.tsx    # Exibe "Voltar ao painel" em sub-rotas
│   │   ├── page.tsx      # Dashboard com cards de navegação
│   │   ├── quiz/         # Gerenciamento de quizzes
│   │   ├── usuarios/     # Gerenciamento de usuários
│   │   └── versinhos/    # Import de versinhos bíblicos (JSON upload)
│   └── home/             # Página principal do usuário
└── api/
    ├── auth/             # NextAuth + registro
    ├── quiz/             # CRUD de quizzes e perguntas, ranking
    ├── admin/            # users, versinhos (requerem isAdmin())
    ├── push/             # Web Push subscribe/unsubscribe/send
    ├── realtime/         # Token Ably
    └── user/             # Perfil e avatar
```

## Proteção de rotas

O `middleware.ts` protege todas as rotas em `/home`, `/admin`, `/quiz`:

- `/login`, `/cadastro` → redireciona para `/home` se já autenticado
- `/home/*` → redireciona para `/login` se não autenticado
- `/admin/*` e `/quiz/*` (exceto `/quiz/responder`) → exige `token.role === 'ADMIN'`, redireciona para `/home` se não for admin
- `/quiz` e `/quiz/` → redireciona para `/admin/quiz`

## Auth

- `lib/auth.ts` — configuração NextAuth: hash bcryptjs, callbacks JWT (injeta `id` e `role` no token), callback session (injeta `socialName` e `image` buscando do banco a cada request)
- `lib/permissions.ts` — helpers server-side: `isAdmin()`, `hasRole()`, `hasAnyRole()`; usados nas API routes para autorizar ações
- `hooks/usePermissions.ts` — versão client-side via `useSession`

## Banco de dados — modelos principais

| Modelo | Descrição |
|--------|-----------|
| `User` | Usuário com `role: Role` (USER, ADMIN, MODERATOR) |
| `Quiz` | Quiz semanal com campo `ativo: Boolean` (só um pode estar ativo) |
| `Pergunta` | Pergunta do quiz: 5 alternativas A–E + `respostaCorreta` + `justificativa` + `tempoSegundos` |
| `RespostaUsuario` | Resposta do usuário a uma pergunta de um quiz específico |
| `ResultadoQuiz` | Resultado consolidado: acertos, erros, nulos, porcentagem |
| `Versinho` | Versinho bíblico para quiz: 5 alternativas, `respostaCorreta`, `ranking` (popularidade) |
| `WebPushSubscription` | Endpoint + chaves p256dh/auth para Web Push |

## Padrões de código

**API routes**: verificar permissão no topo com `isAdmin()` ou `getServerSession`. Retornar `NextResponse.json({ error })` com status adequado.

**Hooks**: todos os hooks de dados ficam em `hooks/`. Usar React Query para queries e mutations. Mutations devem invalidar as queries afetadas via `queryClient.invalidateQueries`.

**Componentes UI base**: `Card`, `Button`, `Input`, `Select`, `Modal` em `components/ui/`. Usar esses antes de criar novos.

**Formulários com JSON bulk**: padrão estabelecido em `components/quiz/QuizForm.tsx` (textarea) e `app/(protected)/admin/versinhos/page.tsx` (file input + FileReader).

## Cores (design tokens)

Usar sempre as classes Tailwind mapeadas para CSS variables — nunca hardcode hex:

| Classe | Uso |
|--------|-----|
| `bg-bg-base` | Fundo principal da página |
| `bg-bg-card` / `bg-bg-deep` | Fundo de cards e seções profundas |
| `text-accent` | Títulos e textos de destaque |
| `text-lavender` | Textos secundários, labels, links |
| `text-primary` / `bg-primary` | Cor principal da marca (botões, ícones) |
| `text-danger` / `bg-danger` | Erros e ações destrutivas |
| `text-success` / `bg-success` | Feedbacks positivos |

## Realtime (Ably)

- **Server-side** (`lib/realtime/publish.ts`): `publishRankingUpdated(quizId)` publica nos canais `quiz:{id}:classificacao` e `quiz:classificacao-geral`
- **Client-side** (`hooks/useRankingRealtime.ts`): subscreve nesses canais e atualiza o cache do React Query ao receber `ranking_updated`
- Token de autenticação Ably gerado em `GET /api/realtime/token`

## Push Notifications

- `lib/push/webPush.ts`: `sendPushToUsers(payload, userIds?, excludeUserIds?)` — envia em bulk; remove automaticamente subscriptions inválidas (404/410)
- `hooks/usePushNotifications.ts` — gerencia estado da subscription no cliente (estados: `loading | unsupported | denied | prompt | subscribed | unsubscribed`)
