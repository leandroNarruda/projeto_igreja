# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

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

| Modelo                | Descrição                                                                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `User`                | Usuário com `role: Role` (USER, ADMIN, MODERATOR)                                                                  |
| `Quiz`                | Quiz semanal com campo `ativo: Boolean` (só um pode estar ativo)                                                   |
| `Pergunta`            | Pergunta do quiz: 5 alternativas A–E + `respostaCorreta` + `justificativa` + `tempoSegundos`                       |
| `RespostaUsuario`     | Resposta do usuário a uma pergunta de um quiz específico                                                           |
| `ResultadoQuiz`       | Resultado consolidado: acertos, erros, nulos, porcentagem                                                          |
| `Versinho`            | Versinho bíblico: `verso` (texto), 5 alternativas A–E no formato `"Livro Cap:Verso"`, `respostaCorreta`, `ranking` |
| `VersinhoProgresso`   | Progresso do quiz de versinhos: 1 linha por usuário — `acertos Int`, `nivel Int @default(1)`                       |
| `WebPushSubscription` | Endpoint + chaves p256dh/auth para Web Push                                                                        |

## Quiz de Versinhos

Fluxo paralelo ao quiz semanal, com persistência enxuta em `VersinhoProgresso` (`acertos`, `nivel`).

### Constantes centrais (`lib/versinhoNiveis.ts`)

- `VERSINOS_POR_NIVEL = 20` — versinhos necessários para desbloquear o Chefão de cada nível
- `getNivelInfo(nivel)` — retorna `{ titulo, emoji, gradient }` para os 11 níveis (1 Semente → 11 Lenda Bíblica)
- `isNivelMaximo(nivel)` — true se nivel >= 11

### Lotes e progressão normal

- **Lote**: 10 versinhos por rodada, ordenados por `Versinho.id ASC`.
- **Janela atual** (server-side): `base = floor(acertos / 10) * 10`. O lote é `findMany({ orderBy: { id: 'asc' }, skip: base, take: 10 })`.
- **Avanço**: `novoAcertos = max(acertos, base + acertosDaRodada)`. Não regride. Retorna também `prontoParaChefao` e `nivel`.
- **`prontoParaChefao`**: `acertos >= nivel * 20 && !isNivelMaximo(nivel)` — calculado no `POST /api/versinhos/responder` e no `GET /api/versinhos/chefao`.

### Modo Chefão (`/versinhos/responder?modo=chefao`)

O Chefão é desbloqueado quando o usuário completa 20 versinhos de um nível sem ainda ter avançado de nível. Enquanto `prontoParaChefao = true`, o botão "Tentar novo recorde" é ocultado — o usuário **precisa** vencer o Chefão para avançar.

**Mecânica:**

- 20 versinhos do nível atual apresentados um por um (sem alternativas de texto)
- 3 vidas (❤️❤️❤️) — perde uma a cada erro ou tempo esgotado
- Timer de 30s por questão (baseado em `Date.now()`, imune a throttling de aba)
- Sair da aba durante `'respondendo'` = derrota imediata (`visibilitychange`)
- Clicar "Desistir" volta para `/versinhos` sem penalidade de API

**Interface de resposta (3 selects encadeados):**

- Livro → todos os 66 livros bíblicos em português (`lib/bibliaData.ts`)
- Capítulo → filtrado dinamicamente pelo livro selecionado
- Versículo → filtrado dinamicamente pelo capítulo selecionado
- Concatenação enviada ao back: `"${livro} ${capitulo}:${verso}"` ex: `"João 3:16"`

**Validação no back (`POST /api/versinhos/chefao/responder`):**

- Compara a string concatenada contra cada alternativa A–E do versinho
- Verifica se a alternativa encontrada é a `respostaCorreta`
- **Importante**: as alternativas na tabela `Versinho` devem estar no formato `"Livro Cap:Verso"` para o Chefão funcionar. Versinhos com alternativas de texto não são compatíveis com o Chefão.

**Resultado:**

- Aprovado (terminou os 20 com ≥ 1 vida) → `POST /api/versinhos/chefao/concluir { aprovado: true }` → `nivel++` no banco → animação de confetti + nível conquistado (`NivelConquistadoModal`)
- Reprovado (perdeu as 3 vidas) → `POST /api/versinhos/chefao/concluir { aprovado: false }` → animação de derrota (`ChefaoDerrota`) → pode tentar novamente sem perder progresso

### Refazer Chefões anteriores (`/versinhos/responder?modo=chefao&nivel=N`)

Após subir de nível, o usuário pode refazer Chefões de qualquer nível abaixo do atual (`1 ≤ N < user.nivel`). A mecânica é idêntica (20 versinhos, 3 vidas, 30s), mas:

- **Não altera o progresso**: `acertos` e `nivel` no banco permanecem inalterados, vença ou perca.
- **Validação server-side**: `GET/POST` rejeitam `nivel >= user.nivel` ou `nivel < 1` com 400.
- **Vitória**: renderiza um modal simples ("Você venceu de novo!") em vez do `NivelConquistadoModal`. Sem confetti.
- **Entrada na UI**: dentro do `EscolherModoModal` há uma nova seção "Refazer Chefões anteriores" listando níveis 1 até `nivelAtual - 1` com `getNivelInfo(n)`.

### Endpoints

- `GET /api/versinhos/quiz` — retorna lote atual sem `respostaCorreta`. Aceita `?lote=N` (revisão). Resposta: `loteIndex`, `loteAtual`, `modoRevisao`, `concluido`.
- `POST /api/versinhos/responder` — calcula acertos server-side. Modo normal: atualiza `VersinhoProgresso`, retorna `avancouLote`, `concluido`, `prontoParaChefao`, `nivel`. Modo revisão: retorna `gabarito` detalhado.
- `GET /api/versinhos/classificacao` — top 10 por `acertos DESC`, retorna `nivel` do banco.
- `GET /api/versinhos/chefao` — verifica `prontoParaChefao`, retorna os 20 versinhos do nível sem `respostaCorreta` + dados do próximo nível. Aceita `?nivel=N` opcional para refazer um Chefão anterior (`1 ≤ N < user.nivel`); nesse caso retorna `modoRevisao: true` e ignora `prontoParaChefao`.
- `POST /api/versinhos/chefao/responder` — valida uma resposta individual do Chefão. Body: `{ versinhoId, resposta, nivel? }`. Se `nivel` ausente, usa o nível atual; se presente, valida que `versinhoId` pertence à faixa daquele nível.
- `POST /api/versinhos/chefao/concluir` — finaliza o Chefão. Body: `{ aprovado, nivel? }`. Se `nivel` ausente ou `nivel === user.nivel`: comportamento normal (incrementa se aprovado). Se `nivel < user.nivel`: modo revisão, **não** altera o banco e retorna `modoRevisao: true`.

### Front

- **`app/(protected)/versinhos/page.tsx`**: chama `useChefao(true)` ao montar. Se `prontoParaChefao`, exibe botão vermelho pulsante "⚔️ Enfrentar o Chefão!" acima do botão principal. Passa `nivelAtual` (do `chefaoData?.nivel`) para o `EscolherModoModal`.
- **`components/versinhos/EscolherModoModal.tsx`**: recebe `prontoParaChefao` e `nivelAtual` como props. Quando `prontoParaChefao = true`, exibe botão do Chefão no topo e **oculta** "Tentar novo recorde". Tem três telas: `'escolha' | 'lotes' | 'chefoes'`. A tela `'chefoes'` lista níveis 1 até `nivelAtual - 1` para refazer Chefões anteriores (desabilitada se `nivelAtual === 1`).
- **`app/(protected)/versinhos/responder/page.tsx`**: lê `?modo=chefao`, `?lote=N` e `?nivel=N`. Controla `quizEmAndamento` (oculta navbar/footer) para ambos os modos. Após lote normal com `prontoParaChefao = true`, exibe botão "Enfrentar o Chefão agora". **Importante**: o `ModoChefao` interno trava os dados iniciais do Chefão num `snapshot` — uma vez que o player começa, ele não é desmontado mesmo se o refetch do `useChefao` retornar `prontoParaChefao: false` (que acontece logo após subir de nível). Sem esse snapshot, o `NivelConquistadoModal` sumia em fração de segundo, substituído pelo card "Chefão não disponível".
- **`components/versinhos/ChefaoPlayer.tsx`**: player principal do Chefão. Estados internos: `'respondendo' | 'aguardando' | 'feedback' | 'vitoria' | 'derrota'`. O estado `'aguardando'` congela o timer enquanto a API responde. Aceita prop `modoRevisao?: boolean` — quando true, passa `nivel` (atual do player) para os endpoints e renderiza um modal simples de vitória em vez do `NivelConquistadoModal`.
- **`components/versinhos/NivelConquistadoModal.tsx`**: animação de vitória com confetti CSS puro (40 partículas), entrada em cascata do card de nível. Usado apenas no modo normal (subida de nível real).
- **`components/versinhos/ChefaoDerrota.tsx`**: animação de derrota com ondas de choque e coração partido. Usado em ambos os modos (normal e revisão).
- **`components/versinhos/RankingCard.tsx`**: usa `item.nivel` vindo do banco (não calcula por acertos). Progresso de nível: `acertosNoNivel = acertos - (nivel - 1) * 20`.
- **`hooks/useVersinhos.ts`**: `useChefao(enabled, nivel?)`, `useResponderChefao()` (mutation aceita `{ versinhoId, resposta, nivel? }`), `useConcluirChefao()` (mutation aceita `{ aprovado, nivel? }`). O queryKey do `useChefao` é `['versinhos', 'chefao', nivel ?? 'atual']`, permitindo cache separado por nível revisitado. `ClassificacaoVersinhosItem` inclui campo `nivel`.
- **`lib/bibliaData.ts`**: 66 livros, capítulos por livro, versos por capítulo. `getCapitulosPorLivro(livro)`, `getVersosPorCapitulo(livro, capitulo)`.

### Migração aplicada

```sql
-- 20260515000000_add_nivel_versinho_progresso
ALTER TABLE "VersinhoProgresso" ADD COLUMN "nivel" INTEGER NOT NULL DEFAULT 1;
```

Para resetar progresso de todos os usuários:

```sql
UPDATE "VersinhoProgresso" SET acertos = 0, nivel = 1;
```

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
