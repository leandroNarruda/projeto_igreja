# 🚀 Como Rodar Migrations no Banco da Vercel

O erro ao criar usuário acontece porque as tabelas ainda não foram criadas no banco de dados da Vercel.

## ⚠️ Problema

Quando você tenta criar um usuário, o Prisma tenta inserir dados na tabela `User`, mas essa tabela não existe ainda no banco da Vercel.

## ✅ Solução: Rodar Migrations em Produção

### Opção 1: Via Vercel CLI (Recomendado)

1. **Instalar Vercel CLI** (se ainda não tiver):
   ```bash
   npm i -g vercel
   ```

2. **Fazer login na Vercel**:
   ```bash
   vercel login
   ```

3. **Conectar ao projeto**:
   ```bash
   cd /Users/inteli/Documents/projeto_igreja
   vercel link
   ```
   - Escolha o projeto correto quando perguntado

4. **Puxar variáveis de ambiente**:
   ```bash
   vercel env pull .env.local
   ```
   Isso cria um arquivo `.env.local` com as variáveis da Vercel.

5. **Rodar migrations**:
   ```bash
   npx prisma migrate deploy
   ```

   Isso vai:
   - Conectar ao banco da Vercel usando a `DATABASE_URL` do `.env.local`
   - Criar todas as tabelas necessárias
   - Aplicar todas as migrations

### Opção 2: Via Terminal da Vercel (Alternativa)

1. Acesse o dashboard da Vercel
2. Vá em seu projeto
3. Vá em **Settings** → **Functions**
4. Use o terminal integrado ou SSH
5. Execute:
   ```bash
   npx prisma migrate deploy
   ```

### Opção 3: Via Script de Build (Automático)

Você pode adicionar um script que roda migrations automaticamente no build. Mas isso pode ser lento.

## 🔍 Verificar se Funcionou

Após rodar as migrations, você pode verificar:

1. **No DBeaver** (se conectado ao banco da Vercel):
   - Deve ver as tabelas: `User`, `Account`, `Session`, `VerificationToken`, `_prisma_migrations`

2. **Testar criar usuário**:
   - Acesse `/cadastro` na sua aplicação
   - Tente criar um usuário
   - Deve funcionar agora!

## 📋 Checklist

- [ ] Vercel CLI instalado
- [ ] Login feito (`vercel login`)
- [ ] Projeto conectado (`vercel link`)
- [ ] Variáveis de ambiente puxadas (`vercel env pull`)
- [ ] Migrations rodadas (`npx prisma migrate deploy`)
- [ ] Tabelas criadas (verificar no DBeaver ou testar criar usuário)

## ⚠️ Importante

- **Nunca** use `prisma migrate dev` em produção - use sempre `prisma migrate deploy`
- As migrations devem estar commitadas no Git antes de rodar
- Certifique-se de que a `DATABASE_URL` está correta nas variáveis de ambiente da Vercel

## 🐛 Se Ainda Der Erro

1. **Verifique a DATABASE_URL**:
   - No dashboard da Vercel, vá em Settings → Environment Variables
   - Confirme que `DATABASE_URL` está configurada
   - Use a connection string direta (não a `PRISMA_DATABASE_URL`)

2. **Verifique se as migrations estão no Git**:
   ```bash
   git ls-files prisma/migrations
   ```
   Deve listar os arquivos de migration

3. **Verifique os logs**:
   - No dashboard da Vercel, veja os logs do deploy
   - Procure por erros relacionados ao Prisma

## 📚 Comandos Úteis

```bash
# Ver status das migrations
npx prisma migrate status

# Ver estrutura do banco
npx prisma db pull

# Abrir Prisma Studio (para visualizar dados)
npx prisma studio
```

