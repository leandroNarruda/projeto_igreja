# Guia de Migração: SQLite → PostgreSQL

Este guia explica como migrar o projeto de SQLite para PostgreSQL.

## 📋 Pré-requisitos

1. Ter PostgreSQL instalado localmente OU
2. Ter uma conta em um serviço de banco de dados (Vercel Postgres, Supabase, Neon, etc.)

## 🔧 Passo a Passo

### 1. Escolher um Banco de Dados PostgreSQL

#### Opção A: PostgreSQL Local (Docker)
```bash
docker run --name postgres-igreja \
  -e POSTGRES_PASSWORD=senha123 \
  -e POSTGRES_DB=projeto_igreja \
  -p 5432:5432 \
  -d postgres:15
```

#### Opção B: Vercel Postgres
1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Vá em "Storage" → "Create Database" → "Postgres"
3. Copie a connection string

#### Opção C: Supabase (Gratuito)
1. Acesse [Supabase](https://supabase.com)
2. Crie um novo projeto
3. Vá em "Settings" → "Database"
4. Copie a connection string (URI)

#### Opção D: Neon (Gratuito)
1. Acesse [Neon](https://neon.tech)
2. Crie um novo projeto
3. Copie a connection string

### 2. Configurar DATABASE_URL

Adicione a connection string no arquivo `.env`:

```env
DATABASE_URL="postgresql://usuario:senha@host:5432/nome_banco?schema=public"
```

**Exemplos:**

**Local (Docker):**
```env
DATABASE_URL="postgresql://postgres:senha123@localhost:5432/projeto_igreja?schema=public"
```

**Vercel Postgres:**
```env
DATABASE_URL="postgresql://default:senha@xxxxx.vercel-storage.com:5432/verceldb?sslmode=require"
```

**Supabase:**
```env
DATABASE_URL="postgresql://postgres:senha@db.xxxxx.supabase.co:5432/postgres"
```

**Neon:**
```env
DATABASE_URL="postgresql://usuario:senha@ep-xxxxx.us-east-2.aws.neon.tech/database?sslmode=require"
```

### 3. Gerar Cliente Prisma

```bash
npm run prisma:generate
```

### 4. Criar Migration Inicial

```bash
npm run prisma:migrate
```

Isso criará as tabelas no PostgreSQL baseadas no schema.

### 5. (Opcional) Migrar Dados do SQLite

Se você já tem dados no SQLite e quer migrá-los:

```bash
# 1. Exportar dados do SQLite
npx prisma db pull --schema=./prisma/schema.sqlite

# 2. Importar para PostgreSQL
npx prisma db push
```

**Nota:** Para migração de dados, você pode precisar de um script customizado.

### 6. Verificar se Funcionou

```bash
# Abrir Prisma Studio
npm run prisma:studio
```

Verifique se as tabelas foram criadas corretamente.

## 🚀 Para Produção (Vercel)

### 1. Configurar Vercel Postgres

1. No dashboard da Vercel, vá em "Storage"
2. Crie um banco "Postgres"
3. Copie a connection string

### 2. Adicionar Variáveis de Ambiente

No dashboard da Vercel, adicione:

- `DATABASE_URL` - Connection string do Vercel Postgres
- `NEXTAUTH_SECRET` - Sua chave secreta
- `NEXTAUTH_URL` - URL da sua aplicação (ex: `https://seu-app.vercel.app`)

### 3. Deploy

O Vercel automaticamente:
1. Roda `postinstall` (que executa `prisma generate`)
2. Roda `build` (que gera o Prisma e faz build do Next.js)

### 4. Rodar Migrations em Produção

Após o primeiro deploy, você precisa rodar as migrations:

```bash
# Via Vercel CLI
vercel env pull
npx prisma migrate deploy

# Ou via terminal do Vercel
vercel exec prisma migrate deploy
```

## ⚠️ Diferenças SQLite vs PostgreSQL

### Tipos de Dados
- SQLite: `TEXT`, `INTEGER`, `REAL`, `BLOB`
- PostgreSQL: `VARCHAR`, `INTEGER`, `DECIMAL`, `BYTEA`, etc.

### Funcionalidades
- PostgreSQL suporta mais tipos de dados
- PostgreSQL tem melhor performance para múltiplos usuários
- PostgreSQL suporta transações mais complexas

### Limitações Removidas
- ✅ Sem limite de tamanho de string
- ✅ Melhor suporte a índices
- ✅ Suporte a JSON nativo
- ✅ Melhor para produção

## 🔍 Troubleshooting

### Erro: "relation does not exist"
- Certifique-se de que as migrations foram executadas
- Verifique se a `DATABASE_URL` está correta

### Erro: "connection refused"
- Verifique se o PostgreSQL está rodando
- Verifique se a porta está correta (5432)
- Verifique firewall/security groups

### Erro: "password authentication failed"
- Verifique usuário e senha no `DATABASE_URL`
- Verifique permissões do usuário no PostgreSQL

## 📚 Recursos

- [Prisma com PostgreSQL](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Supabase Docs](https://supabase.com/docs)
- [Neon Docs](https://neon.tech/docs)

