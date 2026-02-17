# Frontend - Visão Geral

Documentação da arquitetura e estrutura do frontend do Projeto Igreja.

## Tecnologias

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Animações**: Framer Motion
- **Gerenciamento de Estado**: React Query (@tanstack/react-query)
- **Autenticação**: NextAuth.js (client-side hooks)

## Estrutura de Pastas

```
app/
├── (auth)/              # Grupo de rotas públicas
│   ├── login/           # Página de login
│   └── cadastro/        # Página de registro
├── (protected)/         # Grupo de rotas protegidas
│   ├── home/            # Dashboard principal
│   ├── perfil/          # Perfil do usuário
│   ├── eventos/         # Classificação geral e eventos
│   ├── quiz/            # Gerenciamento de quizzes (admin)
│   │   └── responder/   # Responder quiz ativo
│   └── layout.tsx       # Layout com navbar
├── api/                 # API Routes (backend)
├── layout.tsx           # Layout raiz
└── page.tsx             # Página inicial (redireciona)

components/
├── auth/                # Componentes de autenticação
├── quiz/                # Componentes de quiz
├── ui/                  # Componentes base (Button, Card, etc)
└── layout/              # Componentes de layout (Navbar, etc)

hooks/
└── useQuiz.ts           # React Query hooks para quiz

lib/
├── auth.ts              # Configuração NextAuth (servidor)
└── prisma.ts            # Cliente Prisma
```

## Grupos de Rotas (Route Groups)

### (auth) - Rotas Públicas

Páginas acessíveis sem autenticação:
- `/login`
- `/cadastro`

**Comportamento**: Se o usuário já estiver autenticado, o middleware redireciona para `/home`.

### (protected) - Rotas Protegidas

Páginas que requerem autenticação:
- `/home` - Dashboard principal
- `/perfil` - Perfil do usuário
- `/eventos` - Classificação geral
- `/quiz` - Gerenciamento (apenas admin)
- `/quiz/responder` - Responder quiz ativo

**Comportamento**: Se o usuário não estiver autenticado, o middleware redireciona para `/login`.

## Layout Hierarchy

```
app/layout.tsx (raiz)
├── Providers (SessionProvider, QueryClientProvider)
├── Configuração de fonte
└── Metadata

app/(protected)/layout.tsx
├── Verificação de sessão
├── Navbar
└── Children (páginas protegidas)
```

## Autenticação Client-Side

### Hooks do NextAuth

```typescript
import { useSession, signIn, signOut } from 'next-auth/react'

// Obter sessão atual
const { data: session, status } = useSession()

// Login
await signIn('credentials', { email, password, redirect: false })

// Logout
await signOut({ callbackUrl: '/login' })
```

### Estados de Sessão

| Status | Significado | UI |
|--------|-------------|-----|
| `loading` | Carregando sessão | Exibir loading |
| `authenticated` | Usuário autenticado | Exibir conteúdo |
| `unauthenticated` | Não autenticado | Redirecionar para login |

## React Query (TanStack Query)

### Configuração

```typescript
// app/layout.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
})
```

### Hooks Customizados

**Localização**: `hooks/useQuiz.ts`

Queries (GET):
- `useQuizAtivo()` - Busca quiz ativo
- `useQuizzes()` - Lista todos os quizzes (admin)
- `usePerguntas(quizId, admin)` - Busca perguntas
- `useClassificacaoQuiz(quizId)` - Ranking de um quiz
- `useClassificacaoGeral()` - Ranking geral

Mutations (POST/PUT/DELETE):
- `useCriarQuiz()` - Criar novo quiz
- `useAtualizarQuiz()` - Atualizar quiz
- `useDeletarQuiz()` - Deletar quiz
- `useCriarPergunta()` - Criar pergunta
- `useEnviarRespostas()` - Enviar respostas do quiz

### Exemplo de Uso

```typescript
import { useQuizAtivo } from '@/hooks/useQuiz'

function Component() {
  const { data, isLoading, isError, error } = useQuizAtivo()

  if (isLoading) return <Loading />
  if (isError) return <Error message={error.message} />

  return <div>{data.quiz.tema}</div>
}
```

## Componentes Principais

### UI Base

**Localização**: `components/ui/`

- `Button` - Botão com variantes (primary, outline)
- `Card` - Container com sombra e padding
- `Input` - Input estilizado
- `Loading` - Spinner de carregamento
- `WelcomeModal` - Modal de boas-vindas

### Quiz

**Localização**: `components/quiz/`

- `QuizForm` - Formulário para criar quiz
- `QuizList` - Lista de quizzes (admin)
- `PerguntaForm` - Formulário para criar pergunta
- `QuizResult` - Exibição de resultado

### Layout

**Localização**: `components/layout/`

- `Navbar` - Barra de navegação com menu
- `PageTransition` - Animação de transição de páginas (Framer Motion)

## Animações (Framer Motion)

### PageTransition

Wrapper para animar entrada/saída de páginas:

```typescript
import { PageTransition } from '@/components/layout/PageTransition'

export default function Page() {
  return (
    <PageTransition>
      {/* Conteúdo da página */}
    </PageTransition>
  )
}
```

### Animações Customizadas

Exemplo de card animado:

```typescript
import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
>
  {/* Conteúdo */}
</motion.div>
```

## Estilização (Tailwind CSS)

### Configuração

**Arquivo**: `tailwind.config.js`

Classes customizadas e temas configurados para o projeto.

### Padrões de Estilo

**Containers**:
```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
```

**Cards**:
```tsx
<div className="bg-white rounded-lg shadow-md p-6">
```

**Botões Primários**:
```tsx
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
```

## Validação e Feedback

### Formulários

- Validação client-side com HTML5 (`required`, `type="email"`)
- Feedback de erro via estado local
- Loading states durante submissão

### Mensagens ao Usuário

- `alert()` para erros simples
- Componentes de modal para feedback complexo
- Toast notifications (futuro)

## Roteamento

### Navegação Programática

```typescript
import { useRouter } from 'next/navigation'

const router = useRouter()

// Navegar
router.push('/home')

// Atualizar dados da página atual
router.refresh()
```

### Links

```typescript
import Link from 'next/link'

<Link href="/perfil" className="...">
  Perfil
</Link>
```

## Gerenciamento de Estado

### Estado Local (useState)

Para estado de UI temporário (modais, formulários, loading).

### React Query

Para dados do servidor (cache automático, sincronização).

### Session (NextAuth)

Para dados do usuário autenticado.

## Performance

### Otimizações Implementadas

- **Lazy Loading**: Componentes carregados sob demanda
- **React Query Cache**: Reduz chamadas à API
- **SSR**: Renderização no servidor para SEO
- **Tailwind JIT**: CSS otimizado

### Imagens

```typescript
import Image from 'next/image'

<Image
  src={avatarUrl}
  alt="Avatar"
  width={256}
  height={256}
  className="rounded-full"
/>
```

## Acessibilidade

### Boas Práticas

- Uso de atributos `aria-*` onde necessário
- Navegação por teclado funcional
- Contraste de cores adequado
- Textos alternativos em imagens

## Próximos Passos

- [ ] Implementar toast notifications
- [ ] Adicionar validação de formulários com Zod
- [ ] Melhorar acessibilidade (ARIA labels)
- [ ] Implementar skeleton loaders
- [ ] Adicionar testes (Jest + React Testing Library)
- [ ] Implementar PWA (Progressive Web App)
