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
npm run format && npm run lint  # verificação pré-commit sem derrubar o servidor
npm run prisma:migrate    # prisma migrate dev (interativo, precisa de terminal)
npm run prisma:migrate:deploy  # prisma migrate deploy (CI/produção)
npm run prisma:generate   # gera Prisma Client após alterar schema
npm run prisma:studio     # Prisma Studio
```

> **IMPORTANTE**: Nunca rodar `npm run build` durante o desenvolvimento — isso sobrescreve o `.next/` e derruba o `npm run dev` em andamento. Para validar o código, usar apenas `npm run format && npm run lint`.

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
│   ├── home/             # Página principal do usuário (quiz semanal)
│   ├── eventos/          # Apresentação dos eventos (acordeões)
│   └── versinhos/        # Quiz de versinhos + ranking
│       └── responder/    # Player do quiz de versinhos
└── api/
    ├── auth/             # NextAuth + registro
    ├── quiz/             # CRUD de quizzes e perguntas, ranking (quiz semanal)
    ├── versinhos/        # quiz (lote), responder, classificacao
    ├── admin/            # users, versinhos (requerem isAdmin())
    ├── push/             # Web Push subscribe/unsubscribe/send
    ├── realtime/         # Token Ably
    └── user/             # Perfil e avatar
```

## Proteção de rotas

O `middleware.ts` protege todas as rotas em `/home`, `/admin`, `/quiz`, `/versinhos`:

- `/login`, `/cadastro` → redireciona para `/home` se já autenticado
- `/home/*` e `/versinhos/*` → redireciona para `/login` se não autenticado
- `/admin/*` e `/quiz/*` (exceto `/quiz/responder`) → exige `token.role === 'ADMIN'`, redireciona para `/home` se não for admin
- `/quiz` e `/quiz/` → redireciona para `/admin/quiz`

## Auth

- `lib/auth.ts` — configuração NextAuth: hash bcryptjs, callbacks JWT (injeta `id` e `role` no token), callback session (injeta `socialName` e `image` buscando do banco a cada request)
- `lib/permissions.ts` — helpers server-side: `isAdmin()`, `hasRole()`, `hasAnyRole()`; usados nas API routes para autorizar ações
- `hooks/usePermissions.ts` — versão client-side via `useSession`

## Banco de dados — modelos principais

| Modelo                | Descrição                                                                                    |
| --------------------- | -------------------------------------------------------------------------------------------- |
| `User`                | Usuário com `role: Role` (USER, ADMIN, MODERATOR)                                            |
| `Quiz`                | Quiz semanal com campo `ativo: Boolean` (só um pode estar ativo)                             |
| `Pergunta`            | Pergunta do quiz: 5 alternativas A–E + `respostaCorreta` + `justificativa` + `tempoSegundos` |
| `RespostaUsuario`     | Resposta do usuário a uma pergunta de um quiz específico                                     |
| `ResultadoQuiz`       | Resultado consolidado: acertos, erros, nulos, porcentagem                                    |
| `Versinho`            | Versinho bíblico para quiz: 5 alternativas, `respostaCorreta`, `ranking` (popularidade)      |
| `VersinhoProgresso`   | Progresso enxuto do quiz de versinhos: 1 linha por usuário (`userId @unique`, `acertos Int`) |
| `WebPushSubscription` | Endpoint + chaves p256dh/auth para Web Push                                                  |

## Quiz de Versinhos

Fluxo paralelo ao quiz semanal, mas com persistência muito mais enxuta — em vez de gravar resposta por resposta, armazena apenas um contador acumulado de acertos por usuário em `VersinhoProgresso`.

- **Lote**: 10 versinhos por rodada, ordenados por `Versinho.id ASC` (do mais fácil ao mais difícil).
- **Janela atual** (server-side): `base = floor(acertos / 10) * 10`. O lote enviado é `findMany({ orderBy: { id: 'asc' }, skip: base, take: 10 })`.
- **Avanço**: ao responder, `novoAcertos = max(acertos, base + acertosDaRodada)`. Só avança o lote ao gabaritar (10/10). Se acertou menos, fica no mesmo lote, mas registra o melhor desempenho até então (sem regredir).

### Endpoints

- `GET /api/versinhos/quiz` — retorna o lote atual sem `respostaCorreta`. Aceita `?lote=N` para retornar um lote anterior (modo revisão); valida que `N < loteAtual` do usuário. Resposta inclui `loteIndex`, `loteAtual`, `modoRevisao`.
- `POST /api/versinhos/responder` — valida o set de IDs, calcula acertos server-side. Aceita `loteIndex` opcional no body:
  - **Modo normal**: atualiza `VersinhoProgresso`, retorna `acertosDaRodada`, `acertosTotais`, `avancouLote`, `concluido`.
  - **Modo revisão** (`loteIndex < loteAtual`): **não atualiza progresso**, retorna `gabarito` com texto de cada alternativa correta e errada (`textoRespostaCorreta`, `textoRespostaUsuario`).
- `GET /api/versinhos/classificacao` — top 10 por `acertos DESC`, desempate por `updatedAt ASC`.

### Front

- **`app/(protected)/versinhos/page.tsx`**: botão principal abre `EscolherModoModal` em vez de navegar diretamente.
- **`components/versinhos/EscolherModoModal.tsx`**: modal com duas telas — "Tentar novo recorde" (navega para `/versinhos/responder`) e "Revisar lotes anteriores" (lista lotes já concluídos; bloqueado se nenhum foi completado ainda).
- **`app/(protected)/versinhos/responder/page.tsx`**: lê `?lote=N` da URL para entrar em modo revisão. Em modo revisão exibe `ResultadoRevisao` com gabarito detalhado (ícone ✅/❌ por questão, texto da alternativa correta em verde, texto da errada em vermelho). Usa `Suspense` para suportar `useSearchParams`.
- **`hooks/useVersinhos.ts`**: `useVersinhosQuiz(enabled, loteIndex?)` passa `?lote=N` quando fornecido. `useResponderVersinhos()` recebe `{ respostas, loteIndex? }`.
- **Progressão no player**: bolinhas abaixo do card (10 pontos — preenchido = respondido, maior = atual, vazio = pendente). Animação entre perguntas: fade + 8px vertical, 200ms.
- Card flipável de ranking em `components/versinhos/RankingCard.tsx` (níveis com gradiente e progresso por nível).

## Padrões de código

**API routes**: verificar permissão no topo com `isAdmin()` ou `getServerSession`. Retornar `NextResponse.json({ error })` com status adequado.

**Hooks**: todos os hooks de dados ficam em `hooks/`. Usar React Query para queries e mutations. Mutations devem invalidar as queries afetadas via `queryClient.invalidateQueries`.

**Componentes UI base**: `Card`, `Button`, `Input`, `Select`, `Modal` em `components/ui/`. Usar esses antes de criar novos.

**Formulários com JSON bulk**: padrão estabelecido em `components/quiz/QuizForm.tsx` (textarea) e `app/(protected)/admin/versinhos/page.tsx` (file input + FileReader).

## Cores (design tokens)

Usar sempre as classes Tailwind mapeadas para CSS variables — nunca hardcode hex:

| Classe                        | Uso                                     |
| ----------------------------- | --------------------------------------- |
| `bg-bg-base`                  | Fundo principal da página               |
| `bg-bg-card` / `bg-bg-deep`   | Fundo de cards e seções profundas       |
| `text-accent`                 | Títulos e textos de destaque            |
| `text-lavender`               | Textos secundários, labels, links       |
| `text-primary` / `bg-primary` | Cor principal da marca (botões, ícones) |
| `text-danger` / `bg-danger`   | Erros e ações destrutivas               |
| `text-success` / `bg-success` | Feedbacks positivos                     |

## Realtime (Ably)

- **Server-side** (`lib/realtime/publish.ts`): `publishRankingUpdated(quizId)` publica nos canais `quiz:{id}:classificacao` e `quiz:classificacao-geral`
- **Client-side** (`hooks/useRankingRealtime.ts`): subscreve nesses canais e atualiza o cache do React Query ao receber `ranking_updated`
- Token de autenticação Ably gerado em `GET /api/realtime/token`

## Push Notifications

- `lib/push/webPush.ts`: `sendPushToUsers(payload, userIds?, excludeUserIds?)` — envia em bulk; remove automaticamente subscriptions inválidas (404/410)
- `hooks/usePushNotifications.ts` — gerencia estado da subscription no cliente (estados: `loading | unsupported | denied | prompt | subscribed | unsubscribed`)
