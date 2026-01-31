# Explicação das Variáveis de Ambiente

Este documento explica para que serve cada variável de ambiente usada no projeto.

## 📋 Variáveis Necessárias

### 1. `NEXTAUTH_SECRET`

**O que é:**
Uma chave secreta usada pelo NextAuth.js para criptografar e assinar tokens JWT, cookies de sessão e outros dados sensíveis.

**Para que serve:**

- Criptografar tokens de autenticação
- Assinar cookies de sessão
- Garantir a segurança das sessões de usuário
- Prevenir falsificação de tokens

**Por que é importante:**
Sem essa chave, o NextAuth não consegue funcionar corretamente e as sessões não serão seguras. É uma variável **obrigatória** e **confidencial**.

**Como gerar:**

```bash
openssl rand -base64 32
```

**Exemplo:**

```env
NEXTAUTH_SECRET=abc123xyz789def456ghi012jkl345mno678pqr901stu234vwx567
```

**⚠️ IMPORTANTE:**

- Nunca compartilhe essa chave publicamente
- Use uma chave diferente para cada ambiente (desenvolvimento, produção)
- Se a chave for comprometida, todas as sessões precisam ser invalidadas

---

### 2. `NEXTAUTH_URL`

**O que é:**
A URL base da sua aplicação onde o NextAuth está rodando.

**Para que serve:**

- NextAuth precisa saber qual é a URL base para construir URLs de callback
- Usado para redirecionamentos após login/logout
- Necessário para funcionar corretamente em produção

**Valores comuns:**

**Desenvolvimento local:**

```env
NEXTAUTH_URL=http://localhost:3000
```

**Produção (exemplo):**

```env
NEXTAUTH_URL=https://seusite.com.br
```

**Por que é importante:**

- Sem essa variável, o NextAuth pode não conseguir redirecionar corretamente após autenticação
- Em produção, é essencial para que os callbacks funcionem

**⚠️ IMPORTANTE:**

- Em desenvolvimento, use `http://localhost:3000`
- Em produção, use a URL completa com `https://`
- Não inclua barra no final (`/`)

---

### 3. `DATABASE_URL`

**O que é:**
A string de conexão do banco de dados usada pelo Prisma.

**Para que serve:**

- O Prisma usa essa URL para se conectar ao banco de dados
- Define qual banco usar (SQLite, PostgreSQL, MySQL, etc.)
- Contém informações de autenticação e localização do banco

**Formato para SQLite (desenvolvimento):**

```env
DATABASE_URL="file:./dev.db"
```

Isso cria um arquivo `dev.db` na pasta `prisma/` do projeto.

**Outros formatos (exemplos):**

**PostgreSQL:**

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/nome_do_banco?schema=public"
```

**MySQL:**

```env
DATABASE_URL="mysql://usuario:senha@localhost:3306/nome_do_banco"
```

**MongoDB:**

```env
DATABASE_URL="mongodb+srv://usuario:senha@cluster.mongodb.net/nome_do_banco"
```

**Onde é usada:**

- No arquivo `prisma/schema.prisma` (linha 10):
  ```prisma
  datasource db {
    provider = "sqlite"
    url      = env("DATABASE_URL")
  }
  ```

**Por que é importante:**

- Sem essa variável, o Prisma não consegue se conectar ao banco
- É usada quando você roda `prisma migrate` ou `prisma generate`
- Define onde os dados serão armazenados

**⚠️ IMPORTANTE:**

- Para SQLite, o caminho é relativo à pasta do projeto
- Em produção, use um banco de dados real (PostgreSQL, MySQL, etc.)
- Nunca commite credenciais de banco de produção no Git

---

### 4. `BLOB_READ_WRITE_TOKEN`

**O que é:**
Token de leitura e escrita do Vercel Blob, usado para armazenar arquivos (ex.: fotos de perfil/avatar) no Blob store do projeto.

**Para que serve:**

- Fazer upload de avatares na página de perfil
- Remover avatares antigos ao trocar a foto
- A variável é criada **automaticamente** pela Vercel quando você cria um Blob store no projeto

**Como obter:**

1. No [Dashboard da Vercel](https://vercel.com), abra o projeto.
2. Vá em **Storage** (menu lateral) e crie um novo **Blob store** (ex.: nome "avatars").
3. Após criar, a Vercel adiciona a variável `BLOB_READ_WRITE_TOKEN` ao projeto.
4. **Em desenvolvimento local:** na raiz do projeto, rode `vercel env pull` (com o Vercel CLI linkado ao projeto) para baixar o `.env` com o token. Ou copie o valor na página do Blob store (Storage > seu store > configurações) e coloque em `.env` como `BLOB_READ_WRITE_TOKEN=...`.

**Exemplo:**

```env
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx...
```

**Por que é importante:**

- Sem essa variável, o upload de avatar na página de perfil não funciona (a API retornará erro ao tentar enviar a imagem ao Vercel Blob).

**⚠️ IMPORTANTE:**

- Essa variável é **opcional** se você não usar a funcionalidade de avatar. Se usar, configure o Blob store na Vercel e garanta o token em todos os ambientes (Production, Preview, Development) onde o upload for usado.

---

## 📝 Resumo Rápido

| Variável                | Obrigatória? | Uso                              | Exemplo                      |
| ----------------------- | ------------ | -------------------------------- | ---------------------------- |
| `NEXTAUTH_SECRET`       | ✅ Sim       | Criptografar tokens e sessões    | `openssl rand -base64 32`    |
| `NEXTAUTH_URL`          | ✅ Sim       | URL base da aplicação            | `http://localhost:3000`      |
| `DATABASE_URL`          | ✅ Sim       | Conexão com banco de dados       | `"file:./dev.db"`            |
| `BLOB_READ_WRITE_TOKEN` | ❌ Não\*     | Upload/delete de avatares (Blob) | (criado ao criar Blob store) |

---

## 🔒 Segurança

1. **Nunca commite o arquivo `.env` no Git** - ele está no `.gitignore`
2. **Use valores diferentes para cada ambiente** (dev, staging, produção)
3. **Gere uma nova `NEXTAUTH_SECRET` para produção**
4. **Em produção, use HTTPS** e configure `NEXTAUTH_URL` com `https://`

---

## 🚀 Próximos Passos

1. Copie `.env.example` para `.env`
2. Gere uma `NEXTAUTH_SECRET` única
3. Configure `NEXTAUTH_URL` para seu ambiente
4. Configure `DATABASE_URL` conforme seu banco de dados
