# Projeto Igreja - Next.js com Autenticação

Projeto Next.js com sistema de autenticação usando NextAuth.js, Prisma e Tailwind CSS.

## 🚀 Tecnologias

- **Next.js 14+** (App Router)
- **NextAuth.js v5** - Autenticação
- **Prisma** - ORM para banco de dados
- **PostgreSQL** - Banco de dados
- **Tailwind CSS** - Estilização
- **TypeScript** - Tipagem estática

## 📋 Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn

## 🔧 Instalação

1. Instale as dependências:

```bash
npm install
```

2. Configure as variáveis de ambiente:

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure:

```env
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL="postgresql://usuario:senha@localhost:5432/projeto_igreja?schema=public"
```

**Nota:** Para desenvolvimento local, você pode usar Docker:

```bash
docker run --name postgres-igreja \
  -e POSTGRES_PASSWORD=senha123 \
  -e POSTGRES_DB=projeto_igreja \
  -p 5432:5432 \
  -d postgres:15
```

Ou use um serviço gratuito como [Supabase](https://supabase.com) ou [Neon](https://neon.tech).

Para gerar o `NEXTAUTH_SECRET`, você pode usar:

```bash
openssl rand -base64 32
```

3. Configure o banco de dados:

```bash
# Gerar o cliente Prisma
npm run prisma:generate

# Criar as migrations
npm run prisma:migrate
```

4. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

## 📁 Estrutura do Projeto

```
projeto_igreja/
├── app/
│   ├── (auth)/          # Rotas públicas (login, cadastro)
│   ├── (protected)/     # Rotas protegidas (home)
│   ├── api/             # API routes
│   └── layout.tsx       # Layout principal
├── components/
│   ├── ui/              # Componentes base (Button, Input, Card)
│   ├── auth/            # Formulários de autenticação
│   └── layout/          # Componentes de layout (Navbar)
├── lib/
│   ├── auth.ts          # Configuração NextAuth
│   └── prisma.ts        # Cliente Prisma
├── prisma/
│   └── schema.prisma    # Schema do banco de dados
└── middleware.ts        # Middleware de proteção de rotas
```

## 📚 Documentação

Este README contém informações básicas de setup. Para documentação completa:

**[📖 Acessar Documentação Completa →](./docs/README.md)**

### Principais Seções

- **[Arquitetura](./docs/arquitetura.md)** - Visão geral do sistema, fluxos e modelo de dados
- **[API - Backend](./docs/api/README.md)** - Documentação de todos os endpoints
  - [Autenticação](./docs/api/auth.md)
  - [Quiz](./docs/api/quiz.md)
  - [Usuário](./docs/api/user.md)
- **[Frontend](./docs/frontend/README.md)** - Estrutura e componentes do frontend
  - [Rotas e Páginas](./docs/frontend/rotas.md)

## 🔐 Rotas

### Rotas Públicas (Não Autenticadas)

- `/login` - Página de login
- `/cadastro` - Página de registro

### Rotas Protegidas (Usuário Autenticado)

- `/home` - Dashboard principal
- `/perfil` - Perfil do usuário
- `/eventos` - Classificação geral do evento
- `/quiz/responder` - Responder quiz ativo

### Rotas de Admin

- `/quiz` - Gerenciamento de quizzes (criar, editar, adicionar perguntas)

## 🛠️ Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter
- `npm run prisma:generate` - Gera o cliente Prisma
- `npm run prisma:migrate` - Executa as migrations (desenvolvimento)
- `npm run prisma:migrate:deploy` - Executa as migrations (produção)
- `npm run prisma:studio` - Abre o Prisma Studio

## 📝 Funcionalidades

### Autenticação e Perfil
- ✅ Cadastro de usuários com email e senha
- ✅ Login com sessão JWT persistente
- ✅ Proteção de rotas com middleware NextAuth
- ✅ Upload de avatar de perfil
- ✅ Nome social customizável
- ✅ Logout

### Sistema de Quiz
- ✅ Gerenciamento de quizzes (admin)
- ✅ Quiz de múltipla escolha (5 alternativas)
- ✅ Timer por pergunta
- ✅ Feedback visual de acertos/erros
- ✅ Cálculo automático de resultado
- ✅ Classificação por quiz e geral
- ✅ Apenas um quiz ativo por vez

### Interface
- ✅ Design responsivo com Tailwind CSS
- ✅ Animações com Framer Motion
- ✅ Componentes reutilizáveis
- ✅ Loading states e error handling
- ✅ Modal de boas-vindas

## 🔒 Segurança

- Senhas são hasheadas com bcryptjs
- Rotas protegidas verificadas no servidor e cliente
- Tokens JWT para sessões
- Validação de formulários

## 🚀 Deploy

Para fazer deploy, consulte o arquivo [MIGRACAO_POSTGRESQL.md](./MIGRACAO_POSTGRESQL.md) para instruções detalhadas.

### Opções de Deploy Recomendadas:

- **Vercel** (recomendado) - Integração nativa com Next.js
- **Railway** - Suporta PostgreSQL nativamente
- **Render** - Deploy simples com PostgreSQL

### Banco de Dados em Produção:

- **Vercel Postgres** - Integrado com Vercel
- **Supabase** - PostgreSQL gratuito
- **Neon** - PostgreSQL serverless
- **Railway** - PostgreSQL incluso

## 📄 Licença

Este projeto é privado.
