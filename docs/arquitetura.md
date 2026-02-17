# Arquitetura do Sistema

## Visão Geral

O Projeto Igreja é uma aplicação full-stack monolítica construída com Next.js 14, utilizando o App Router para renderização server-side e API Routes para o backend.

## Diagrama de Arquitetura

```mermaid
graph TB
    subgraph Cliente
        Browser[Navegador]
    end
    
    subgraph NextJS[Next.js Application]
        subgraph AppRouter[App Router]
            AuthPages[Páginas Auth<br/>login, cadastro]
            ProtectedPages[Páginas Protegidas<br/>home, quiz, perfil, eventos]
        end
        
        subgraph APIRoutes[API Routes]
            AuthAPI[/api/auth]
            QuizAPI[/api/quiz]
            UserAPI[/api/user]
        end
        
        Middleware[Middleware<br/>Proteção de Rotas]
    end
    
    subgraph Auth[NextAuth.js]
        AuthConfig[Configuração]
        JWT[JWT Strategy]
        Session[Gerenciamento de Sessão]
    end
    
    subgraph Database[PostgreSQL]
        PrismaORM[Prisma ORM]
        Tables[Tabelas:<br/>User, Quiz, Pergunta,<br/>RespostaUsuario, ResultadoQuiz]
    end
    
    Browser --> Middleware
    Middleware --> AuthPages
    Middleware --> ProtectedPages
    ProtectedPages --> APIRoutes
    APIRoutes --> Auth
    Auth --> PrismaORM
    PrismaORM --> Tables
```

## Camadas da Aplicação

### 1. Frontend (App Router)

**Localização**: `app/`

Estrutura baseada em grupos de rotas:
- `(auth)/` - Páginas públicas de autenticação
- `(protected)/` - Páginas que requerem login

**Responsabilidades**:
- Renderização de páginas (SSR/CSR)
- Gerenciamento de estado do cliente
- Formulários e validações
- Consumo de APIs internas

### 2. Backend (API Routes)

**Localização**: `app/api/`

Endpoints REST organizados por domínio:
- `/api/auth/*` - Autenticação e registro
- `/api/quiz/*` - CRUD de quizzes e perguntas
- `/api/user/*` - Perfil e configurações

**Responsabilidades**:
- Lógica de negócio
- Validação de dados
- Comunicação com banco de dados
- Controle de acesso

### 3. Autenticação (NextAuth.js)

**Localização**: `lib/auth.ts`

**Fluxo de Autenticação**:

```mermaid
sequenceDiagram
    participant User
    participant LoginPage
    participant NextAuth
    participant Prisma
    participant Database
    
    User->>LoginPage: Insere email e senha
    LoginPage->>NextAuth: Envia credenciais
    NextAuth->>Prisma: Busca usuário por email
    Prisma->>Database: SELECT * FROM User WHERE email=?
    Database-->>Prisma: Dados do usuário
    Prisma-->>NextAuth: User com password hash
    NextAuth->>NextAuth: bcrypt.compare(senha, hash)
    alt Senha válida
        NextAuth->>NextAuth: Gera JWT token
        NextAuth-->>LoginPage: Session criada
        LoginPage-->>User: Redireciona para /home
    else Senha inválida
        NextAuth-->>LoginPage: Erro de autenticação
        LoginPage-->>User: Mensagem de erro
    end
```

**Características**:
- Strategy: JWT (stateless)
- Provider: Credentials (email + senha)
- Senha: Hash bcrypt (salt rounds: 10)
- Session: Cookie HTTP-only

### 4. Middleware de Proteção

**Localização**: `middleware.ts`

**Responsabilidades**:
- Verificar autenticação antes de acessar rotas protegidas
- Redirecionar usuários não autenticados para `/login`
- Redirecionar usuários autenticados que acessam `/login` para `/home`
- Controlar acesso de admin a rotas de gerenciamento de quiz

**Rotas Monitoradas**:
- `/home/*` - Requer autenticação
- `/admin/*` - Requer autenticação + role ADMIN
- `/quiz/*` - Requer autenticação + role ADMIN (exceto `/quiz/responder`)
- `/quiz/responder` - Requer apenas autenticação
- `/login`, `/cadastro` - Redireciona se já autenticado

### 5. Banco de Dados (Prisma + PostgreSQL)

**Localização**: `prisma/schema.prisma`

**ORM**: Prisma Client
**Database**: PostgreSQL

## Modelo de Dados

```mermaid
erDiagram
    User ||--o{ RespostaUsuario : responde
    User ||--o{ ResultadoQuiz : possui
    Quiz ||--o{ Pergunta : contem
    Quiz ||--o{ RespostaUsuario : recebe
    Quiz ||--o{ ResultadoQuiz : gera
    Pergunta ||--o{ RespostaUsuario : recebe
    
    User {
        int id PK
        string name
        string social_name
        string email UK
        string password
        enum role
        string igreja
        string avatar_url
        datetime createdAt
        datetime updatedAt
    }
    
    Quiz {
        int id PK
        string tema
        boolean ativo
        datetime createdAt
        datetime updatedAt
    }
    
    Pergunta {
        int id PK
        int quizId FK
        string enunciado
        string alternativaA
        string alternativaB
        string alternativaC
        string alternativaD
        string alternativaE
        string respostaCorreta
        string justificativa
        int tempoSegundos
    }
    
    RespostaUsuario {
        int id PK
        int userId FK
        int quizId FK
        int perguntaId FK
        string alternativaEscolhida
        datetime createdAt
    }
    
    ResultadoQuiz {
        int id PK
        int userId FK
        int quizId FK
        int acertos
        int erros
        int nulos
        int total
        int porcentagem
        datetime createdAt
    }
```

### Entidades Principais

#### User
Armazena dados de autenticação e perfil.
- **Roles**: `USER`, `ADMIN`, `MODERATOR`
- **Campos opcionais**: `social_name`, `igreja`, `avatar_url`

#### Quiz
Representa um conjunto de perguntas sobre um tema.
- **Status**: `ativo` (apenas 1 pode estar ativo por vez)

#### Pergunta
Questão de múltipla escolha (5 alternativas: A-E).
- **Tempo**: Limite em segundos para resposta
- **Justificativa**: Explicação da resposta correta

#### RespostaUsuario
Registro de cada resposta individual.
- **Constraint**: Um usuário só pode responder cada pergunta uma vez
- **Null**: `alternativaEscolhida` pode ser null (não respondeu a tempo)

#### ResultadoQuiz
Resumo consolidado das respostas de um usuário em um quiz.
- **Calculado**: Após envio de todas as respostas
- **Usado para**: Rankings e estatísticas

## Fluxo Principal: Responder Quiz

```mermaid
sequenceDiagram
    participant U as Usuário
    participant P as Página /quiz/responder
    participant API as API Quiz
    participant DB as Database
    
    U->>P: Acessa página
    P->>API: GET /api/quiz/ativo
    API->>DB: Busca quiz ativo
    DB-->>API: Quiz + verifica se já respondeu
    API-->>P: Quiz data + jaRespondeu
    
    alt Já respondeu
        P-->>U: Exibe resultado
    else Novo quiz
        P-->>U: Exibe instruções
        U->>P: Clica "Iniciar"
        P->>API: GET /api/quiz/{id}/perguntas
        API->>DB: Busca perguntas do quiz
        DB-->>API: Lista de perguntas
        API-->>P: Perguntas (sem respostaCorreta)
        
        loop Para cada pergunta
            P-->>U: Exibe pergunta + timer
            U->>P: Seleciona alternativa
            P->>P: Armazena resposta localmente
        end
        
        P->>API: POST /api/quiz/resposta
        Note over P,API: Envia todas as respostas
        API->>DB: Salva RespostaUsuario
        API->>DB: Calcula ResultadoQuiz
        DB-->>API: Resultado salvo
        API-->>P: Resultado (acertos, erros, etc)
        P-->>U: Exibe feedback
    end
```

## Fluxo de Autenticação e Autorização

### Registro de Novo Usuário

1. Usuário acessa `/cadastro`
2. Preenche: nome, email, senha
3. Frontend POST para `/api/auth/register`
4. Backend valida dados e verifica duplicidade de email
5. Senha é hasheada com bcrypt
6. Usuário criado com role `USER`
7. Retorna sucesso (usuário deve fazer login)

### Login

1. Usuário acessa `/login`
2. Preenche: email, senha
3. Frontend chama `signIn()` do NextAuth
4. NextAuth executa `authorize()` callback
5. Busca usuário por email
6. Compara senha com hash armazenado
7. Se válido, cria JWT token com id e role
8. Cookie de sessão é definido
9. Redireciona para `/home`

### Verificação de Sessão

Em rotas protegidas:
1. Middleware verifica cookie de sessão
2. Se não existe, redireciona para `/login`
3. Se existe, decodifica JWT
4. Para rotas admin, verifica `role === 'ADMIN'`
5. Se não autorizado, redireciona para `/home`

## Segurança

### Autenticação
- ✅ Senhas hasheadas com bcrypt (10 rounds)
- ✅ JWT tokens assinados (NEXTAUTH_SECRET)
- ✅ Cookies HTTP-only (proteção contra XSS)
- ✅ Validação de sessão no servidor

### Autorização
- ✅ Middleware verifica autenticação antes de renderizar
- ✅ APIs verificam sessão em cada request
- ✅ Controle de acesso baseado em roles (RBAC)
- ✅ Validação de ownership (usuário só acessa seus dados)

### Validação de Dados
- ✅ Validação no frontend (UX)
- ✅ Validação no backend (segurança)
- ✅ Prisma schema constraints (integridade)

## Performance

### Otimizações Implementadas
- Server-Side Rendering (SSR) para SEO
- API Routes com `dynamic = 'force-dynamic'` onde necessário
- Índices no banco de dados (userId, quizId, ativo)
- Prisma connection pooling

### Pontos de Atenção
- Quiz ativo: Cache pode ser implementado (atualmente força dynamic)
- Avatar upload: Usa Vercel Blob Storage
- Rankings: Query otimizada com índice em `acertos`

## Variáveis de Ambiente

```env
# Autenticação
NEXTAUTH_SECRET=<secret-gerado>
NEXTAUTH_URL=http://localhost:3000

# Banco de Dados
DATABASE_URL=postgresql://user:pass@host:5432/db

# Upload de Arquivos (opcional)
BLOB_READ_WRITE_TOKEN=<vercel-blob-token>
```

## Deployment

A aplicação é otimizada para deploy na Vercel:
- Build automático via Git
- Migrações Prisma no build (`prisma generate`)
- Variáveis de ambiente no painel Vercel
- PostgreSQL via Vercel Postgres, Supabase ou Neon

Ver [README principal](../README.md#deploy) para detalhes.
