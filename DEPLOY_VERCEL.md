# 🚀 Guia de Deploy na Vercel

Este guia explica passo a passo como fazer deploy do projeto na Vercel.

## 📋 Pré-requisitos

1. Conta na [Vercel](https://vercel.com) (gratuita)
2. Conta no [GitHub](https://github.com), [GitLab](https://gitlab.com) ou [Bitbucket](https://bitbucket.org)
3. Projeto funcionando localmente

## 🔧 Passo a Passo

### 1. Inicializar Git (se ainda não tiver)

```bash
# Na raiz do projeto
git init
git add .
git commit -m "Initial commit - Projeto Igreja com NextAuth e PostgreSQL"
```

### 2. Criar Repositório no GitHub

1. Acesse [GitHub](https://github.com)
2. Clique em "New repository"
3. Nome: `projeto-igreja` (ou o nome que preferir)
4. **NÃO** marque "Initialize with README"
5. Clique em "Create repository"

### 3. Conectar Repositório Local ao GitHub

```bash
# Substitua SEU_USUARIO pelo seu usuário do GitHub
git remote add origin https://github.com/SEU_USUARIO/projeto-igreja.git
git branch -M main
git push -u origin main
```

### 4. Criar Banco de Dados na Vercel

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Vá em **"Storage"** (menu lateral)
3. Clique em **"Create Database"**
4. Selecione **"Postgres"**
5. Escolha um nome (ex: `projeto-igreja-db`)
6. Escolha a região mais próxima
7. Clique em **"Create"**

### 5. Copiar Connection String

1. No dashboard do banco criado, vá em **"Settings"**
2. Na seção **"Connection String"**, copie a string
3. Ela será algo como:
   ```
   postgres://default:xxxxx@xxxxx.vercel-storage.com:5432/verceldb
   ```

### 6. Fazer Deploy na Vercel

#### Opção A: Via Dashboard (Recomendado)

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Clique em **"Add New..."** → **"Project"**
3. Importe o repositório do GitHub
4. Configure o projeto:
   - **Framework Preset:** Next.js (detectado automaticamente)
   - **Root Directory:** `./` (raiz)
   - **Build Command:** `npm run build` (já configurado)
   - **Install Command:** `npm install` (já configurado)

#### Opção B: Via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel

# Para produção
vercel --prod
```

### 7. Configurar Variáveis de Ambiente

No dashboard da Vercel, vá em **Settings** → **Environment Variables** e adicione:

#### Variáveis Obrigatórias:

1. **`DATABASE_URL`**
   - Value: A connection string do Vercel Postgres que você copiou
   - Environments: Production, Preview, Development

2. **`NEXTAUTH_SECRET`**
   - Value: Gere uma nova chave (diferente da local):
     ```bash
     openssl rand -base64 32
     ```
   - Environments: Production, Preview, Development

3. **`NEXTAUTH_URL`**
   - Value: A URL da sua aplicação (ex: `https://seu-projeto.vercel.app`)
   - Environments: Production, Preview, Development

### 8. Rodar Migrations em Produção

Após o primeiro deploy, você precisa criar as tabelas no banco:

#### Opção A: Via Vercel CLI

```bash
# Instalar Vercel CLI (se ainda não tiver)
npm i -g vercel

# Fazer login
vercel login

# Conectar ao projeto
vercel link

# Rodar migrations
npx prisma migrate deploy
```

#### Opção B: Via Terminal do Vercel

1. No dashboard da Vercel, vá em **Settings** → **Functions**
2. Use o terminal integrado ou
3. Configure um script de build que rode as migrations automaticamente

### 9. Verificar Deploy

1. Acesse a URL fornecida pela Vercel (ex: `https://seu-projeto.vercel.app`)
2. Teste:
   - Acessar `/cadastro` e criar um usuário
   - Fazer login em `/login`
   - Acessar `/home` (deve estar protegido)

## 🔍 Troubleshooting

### Erro: "Can't reach database server"

- Verifique se a `DATABASE_URL` está correta
- Verifique se o banco está ativo no dashboard da Vercel
- Certifique-se de que a connection string inclui `?sslmode=require`

### Erro: "Prisma Client not generated"

- O script `postinstall` no `package.json` deve gerar automaticamente
- Verifique se está rodando: `npm run postinstall`

### Erro: "Migrations not found"

- Certifique-se de que a pasta `prisma/migrations` está commitada no Git
- Rode `npx prisma migrate deploy` após o deploy

### Erro: "NEXTAUTH_SECRET not set"

- Verifique se a variável está configurada no dashboard da Vercel
- Certifique-se de que está em todos os ambientes (Production, Preview, Development)

## 📝 Checklist Final

- [ ] Repositório criado no GitHub
- [ ] Código commitado e enviado para o GitHub
- [ ] Banco Vercel Postgres criado
- [ ] Connection string copiada
- [ ] Projeto importado na Vercel
- [ ] Variáveis de ambiente configuradas:
  - [ ] `DATABASE_URL`
  - [ ] `NEXTAUTH_SECRET`
  - [ ] `NEXTAUTH_URL`
- [ ] Deploy realizado
- [ ] Migrations rodadas em produção
- [ ] Aplicação testada e funcionando

## 🎉 Pronto!

Sua aplicação está no ar! A Vercel fará deploy automático sempre que você fizer push para o repositório.

## 🔄 Deploy Automático

A partir de agora, sempre que você fizer:

```bash
git add .
git commit -m "Sua mensagem"
git push
```

A Vercel automaticamente fará um novo deploy!

## 📚 Recursos

- [Documentação Vercel](https://vercel.com/docs)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Next.js na Vercel](https://vercel.com/docs/frameworks/nextjs)

