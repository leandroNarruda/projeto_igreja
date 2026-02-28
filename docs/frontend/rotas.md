# Frontend - Rotas e Páginas

Mapeamento completo de todas as rotas e páginas do frontend.

## Índice

- [Rotas Públicas](#rotas-públicas)
- [Rotas Protegidas (Usuário)](#rotas-protegidas-usuário)
- [Rotas de Admin](#rotas-de-admin)
- [Middleware de Proteção](#middleware-de-proteção)

---

## Rotas Públicas

Acessíveis sem autenticação. Se o usuário já estiver logado, é redirecionado para `/home`.

### `/` (Raiz)

**Arquivo**: `app/page.tsx`

**Objetivo**: Redireciona automaticamente para `/login`.

**Tipo de acesso**: Público

**Dados consumidos**: Nenhum

**Estado vazio/erro**: N/A (redireciona imediatamente)

---

### `/login`

**Arquivo**: `app/(auth)/login/page.tsx`

**Objetivo**: Página de login do sistema.

**Tipo de acesso**: Público (redireciona para `/home` se já autenticado)

**Componentes principais**:
- Formulário de login (email + senha)
- Link para `/cadastro`

**Dados consumidos**: Nenhum (API)

**Fluxo**:
1. Usuário insere email e senha
2. Frontend chama `signIn('credentials', { email, password })`
3. NextAuth autentica e cria sessão
4. Redireciona para `/home`

**Estado erro**:
- Credenciais inválidas: Exibe mensagem de erro

---

### `/cadastro`

**Arquivo**: `app/(auth)/cadastro/page.tsx`

**Objetivo**: Página de registro de novo usuário.

**Tipo de acesso**: Público (redireciona para `/home` se já autenticado)

**Componentes principais**:
- Formulário de registro (nome, email, senha, igreja opcional)
- Link para `/login`

**Dados consumidos**: 
- `POST /api/auth/register` ou `POST /api/auth/register/igreja`

**Fluxo**:
1. Usuário preenche formulário
2. Frontend envia dados para `/api/auth/register`
3. Se sucesso, redireciona para `/login`

**Estado erro**:
- Email já em uso: Exibe mensagem de erro
- Campos inválidos: Validação client-side

---

## Rotas Protegidas (Usuário)

Requerem autenticação. Se o usuário não estiver logado, redireciona para `/login`.

### `/home`

**Arquivo**: `app/(protected)/home/page.tsx`

**Objetivo**: Dashboard principal após login. Exibe quiz ativo, resultado ou classificação.

**Tipo de acesso**: Protegido (USER ou ADMIN)

**Componentes principais**:
- Botão "Responder Quiz da semana"
- `QuizResult` (se já respondeu)
- Classificação do quiz ativo
- Link para classificação geral
- `WelcomeModal` (modal de boas-vindas na primeira visita)

**Dados consumidos**:
- `GET /api/quiz/ativo` - Busca quiz ativo e verifica se já respondeu
- `GET /api/quiz/{id}/classificacao` - Ranking do quiz

**Fluxo**:
1. Carrega quiz ativo
2. Se já respondeu: Exibe resultado + classificação
3. Se não respondeu: Exibe botão para responder
4. Se não há quiz ativo: Exibe mensagem

**Estado vazio**:
- Sem quiz ativo: "Não há quiz ativo no momento. Aguarde..."

**Estado erro**:
- Erro ao carregar: Exibe mensagem de erro

---

### `/perfil`

**Arquivo**: `app/(protected)/perfil/page.tsx`

**Objetivo**: Visualizar e editar perfil do usuário.

**Tipo de acesso**: Protegido (USER ou ADMIN)

**Componentes principais**:
- Avatar do usuário (com upload)
- Informações pessoais (nome, email, nome social)
- Botão de logout

**Dados consumidos**:
- `POST /api/user/avatar` - Upload de avatar
- `PATCH /api/user/me` - Atualizar nome social (futuro)
- Session do NextAuth (dados do usuário)

**Fluxo**:
1. Exibe dados da sessão
2. Permite upload de avatar (click no ícone de câmera)
3. Botão "Sair da conta" faz logout

**Estado erro**:
- Erro no upload: Exibe mensagem de erro abaixo do avatar

---

### `/eventos`

**Arquivo**: `app/(protected)/eventos/page.tsx`

**Objetivo**: Exibir classificação geral de todos os quizzes e informações de eventos.

**Tipo de acesso**: Protegido (USER ou ADMIN)

**Componentes principais**:
- Seção de classificação geral (top 10)
- Informações sobre o evento

**Dados consumidos**:
- `GET /api/quiz/classificacao-geral` - Ranking geral

**Fluxo**:
1. Carrega classificação geral
2. Exibe top 10 usuários com total de acertos e média de porcentagem
3. Destaca posição do usuário atual

**Estado vazio**:
- Nenhum quiz respondido ainda: Mensagem "Nenhum resultado ainda"

**Estado erro**:
- Erro ao carregar: Exibe mensagem de erro

---

### `/quiz/responder`

**Arquivo**: `app/(protected)/quiz/responder/page.tsx`

**Objetivo**: Página para responder o quiz ativo.

**Tipo de acesso**: Protegido (USER ou ADMIN)

**Componentes principais**:
- Instruções antes de iniciar
- Perguntas com timer
- Feedback após resposta
- Resultado final

**Dados consumidos**:
- `GET /api/quiz/ativo` - Verifica quiz ativo e se já respondeu
- `GET /api/quiz/{id}/perguntas` - Busca perguntas
- `POST /api/quiz/resposta` - Envia respostas

**Fluxo**:
1. Verifica se há quiz ativo e se usuário já respondeu
2. Se já respondeu: Exibe resultado
3. Se não respondeu: Exibe instruções
4. Usuário clica "Iniciar"
5. Para cada pergunta:
   - Exibe enunciado + alternativas + timer
   - Usuário seleciona resposta
   - Feedback visual (verde = certo, vermelho = errado)
   - Avança para próxima
6. Ao finalizar: Envia todas as respostas para API
7. Exibe resultado (acertos, erros, porcentagem)

**Estado vazio**:
- Sem quiz ativo: Redireciona para `/home` com mensagem

**Estado erro**:
- Já respondeu: Exibe resultado (não permite responder novamente)
- Erro ao carregar: Redireciona para `/home`

---

## Rotas de Admin

Requerem autenticação + role `ADMIN`. Se o usuário não for admin, redireciona para `/home`. O link "Admin" no footer leva a `/admin` (dashboard). A rota `/quiz` (sem `/quiz/responder`) redireciona para `/admin/quiz` quando o usuário é admin.

### `/admin`

**Arquivo**: `app/(protected)/admin/page.tsx`

**Objetivo**: Dashboard do administrador com duas opções: gerenciar quizzes ou gerenciar usuários.

**Tipo de acesso**: Protegido (ADMIN)

**Componentes principais**:
- Dois cards/links: "Gerenciar quizzes" → `/admin/quiz`, "Gerenciar usuários" → `/admin/usuarios`

**Dados consumidos**: Nenhum (apenas navegação)

**Fluxo**: Admin escolhe uma das opções e navega para a sub-rota correspondente.

---

### `/admin/quiz`

**Arquivo**: `app/(protected)/admin/quiz/page.tsx`

**Objetivo**: Gerenciar quizzes (criar, editar, deletar, adicionar perguntas).

**Tipo de acesso**: Protegido (ADMIN)

**Componentes principais**:
- `QuizForm` - Formulário para criar quiz
- `QuizList` - Lista de quizzes com ações
- Botão para adicionar perguntas
- Link "Voltar ao painel" para `/admin`

**Dados consumidos**:
- `GET /api/quiz` - Lista todos os quizzes
- `POST /api/quiz` - Criar quiz
- `PUT /api/quiz/{id}` - Atualizar quiz (ativar/desativar)
- `DELETE /api/quiz/{id}` - Deletar quiz
- `GET /api/quiz/{id}/perguntas?admin=true` - Listar perguntas (admin)

**Fluxo**:
1. Exibe lista de quizzes
2. Admin pode: criar novo quiz, ativar/desativar, deletar, adicionar perguntas
3. Ao clicar "Adicionar perguntas": estado interno mostra formulário e lista de perguntas (mesmo arquivo)

**Estado vazio**: Sem quizzes: "Nenhum quiz cadastrado. Crie o primeiro!"

**Estado erro**: Acesso negado → redireciona para `/home`; erro ao carregar → alerta

---

### `/admin/quiz` (Adicionar Perguntas)

**Arquivo**: `app/(protected)/admin/quiz/page.tsx` (estado: `quizSelecionado !== null`)

**Objetivo**: Adicionar perguntas a um quiz específico.

**Tipo de acesso**: Protegido (ADMIN)

**Dados consumidos**: `POST /api/quiz/{id}/perguntas`, `GET /api/quiz/{id}/perguntas?admin=true`

**Fluxo**: Botão "Voltar" retorna à lista de quizzes (mesma página, estado diferente).

---

### `/admin/usuarios`

**Arquivo**: `app/(protected)/admin/usuarios/page.tsx`

**Objetivo**: Listar usuários da aplicação com paginação e link para edição.

**Tipo de acesso**: Protegido (ADMIN)

**Dados consumidos**: `GET /api/admin/users?page=1&limit=20`

**Componentes principais**: Tabela com nome, e-mail, igreja, perfil (role) e botão "Editar" por linha.

**Fluxo**: Admin vê a lista; ao clicar "Editar", navega para `/admin/usuarios/[id]`.

---

### `/admin/usuarios/[id]`

**Arquivo**: `app/(protected)/admin/usuarios/[id]/page.tsx`

**Objetivo**: Editar um usuário (nome, e-mail, nome social, igreja, senha).

**Tipo de acesso**: Protegido (ADMIN)

**Dados consumidos**:
- `GET /api/admin/users/[id]` - Carregar dados do usuário
- `PATCH /api/admin/users/[id]` - Salvar alterações

**Fluxo**: Formulário com campos editáveis; senha opcional ("Deixar em branco para não alterar"). Botões Salvar e Cancelar (volta para `/admin/usuarios`).

---

## Middleware de Proteção

**Arquivo**: `middleware.ts`

### Rotas Monitoradas

```typescript
export const config = {
  matcher: [
    '/home/:path*',
    '/admin/:path*',
    '/quiz/:path*',
    '/login',
    '/cadastro',
  ],
}
```

### Regras de Redirecionamento

| Rota | Condição | Redirecionamento |
|------|----------|------------------|
| `/login`, `/cadastro` | Usuário autenticado | → `/home` |
| `/home` | Usuário não autenticado | → `/login?callbackUrl=/home` |
| `/quiz` ou `/quiz/` | Usuário é ADMIN | → `/admin/quiz` |
| `/quiz` (exceto `/quiz/responder`) | Usuário não autenticado | → `/login?callbackUrl=/quiz` |
| `/quiz` (exceto `/quiz/responder`) | Usuário não é ADMIN | → `/home` |
| `/quiz/responder` | Usuário não autenticado | → `/login?callbackUrl=/quiz/responder` |
| `/admin/*` | Usuário não autenticado | → `/login?callbackUrl=/admin/...` |
| `/admin/*` | Usuário não é ADMIN | → `/home` |

---

## Navegação

### Navbar (Rotas Protegidas)

**Arquivo**: `app/(protected)/layout.tsx`

Links disponíveis (footer):
- **Home** → `/home`
- **Eventos** → `/eventos`
- **Perfil** → `/perfil`
- **Admin** (se admin) → `/admin`

Botão de logout no menu dropdown do perfil.

---

## Fluxo de Navegação do Usuário

### Primeiro Acesso

```mermaid
graph TD
    A[Acessa /] --> B[Redireciona para /login]
    B --> C[Clica em Cadastrar]
    C --> D[/cadastro]
    D --> E[Preenche formulário]
    E --> F{Válido?}
    F -->|Não| E
    F -->|Sim| G[Conta criada]
    G --> B
    B --> H[Faz login]
    H --> I[/home]
```

### Usuário Logado

```mermaid
graph TD
    A[/home] --> B{Quiz ativo?}
    B -->|Sim| C{Já respondeu?}
    B -->|Não| D[Aguarda novo quiz]
    C -->|Não| E[Clica Responder]
    C -->|Sim| F[Vê resultado]
    E --> G[/quiz/responder]
    G --> H[Responde perguntas]
    H --> I[Vê resultado]
    F --> J[Vê classificação]
    I --> J
    J --> K[/eventos - Ver ranking geral]
```

### Admin

```mermaid
graph TD
    A[/home] --> B[/quiz]
    B --> C[Cria quiz]
    C --> D[Adiciona perguntas]
    D --> E{Todas adicionadas?}
    E -->|Não| D
    E -->|Sim| F[Ativa quiz]
    F --> G[/home]
    G --> H[Usuários respondem]
    H --> I[Admin vê resultados]
```

---

## Resumo de Integrações API por Página

| Página | APIs Consumidas |
|--------|-----------------|
| `/` | Nenhuma (redireciona) |
| `/login` | NextAuth (signIn) |
| `/cadastro` | `POST /api/auth/register` |
| `/home` | `GET /api/quiz/ativo`, `GET /api/quiz/{id}/classificacao` |
| `/perfil` | `POST /api/user/avatar`, Session |
| `/eventos` | `GET /api/quiz/classificacao-geral` |
| `/quiz/responder` | `GET /api/quiz/ativo`, `GET /api/quiz/{id}/perguntas`, `POST /api/quiz/resposta` |
| `/quiz` (admin) | `GET /api/quiz`, `POST /api/quiz`, `PUT /api/quiz/{id}`, `DELETE /api/quiz/{id}`, `POST /api/quiz/{id}/perguntas`, `GET /api/quiz/{id}/perguntas?admin=true` |

---

## Componentes Compartilhados Entre Páginas

| Componente | Usado em |
|------------|----------|
| `Navbar` | Todas as rotas protegidas |
| `PageTransition` | Todas as páginas |
| `Loading` | Todas as páginas (estado de loading) |
| `WelcomeModal` | `/home` |
| `QuizResult` | `/home`, `/quiz/responder` |

---

## Próximas Melhorias

- [ ] Adicionar breadcrumbs de navegação
- [ ] Implementar histórico de quizzes respondidos
- [ ] Página de estatísticas pessoais
- [ ] Modo escuro (dark mode)
- [ ] Página 404 customizada
- [ ] Página de erro (error.tsx)
- [ ] Loading skeletons ao invés de spinner
