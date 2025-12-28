# 🚀 Aplicar Migração de IDs em Produção

O login não funciona em produção porque a migração de IDs ainda não foi aplicada. O banco ainda tem IDs como `TEXT`, mas o código espera `number`.

## ⚠️ Problema

- **Local**: Migração aplicada ✅ - IDs são números
- **Produção**: Migração NÃO aplicada ❌ - IDs ainda são strings
- **Resultado**: Login falha porque há incompatibilidade de tipos

## ✅ Solução: Aplicar Migração em Produção

### Passo 1: Fazer Backup (IMPORTANTE!)

```bash
# Via Vercel CLI
vercel env pull .env.local
pg_dump "$(grep DATABASE_URL .env.local | cut -d '=' -f2-)" > backup_producao_$(date +%Y%m%d_%H%M%S).sql
```

Ou manualmente:

1. Acesse o dashboard da Vercel
2. Vá em **Storage** → Seu banco Postgres
3. Use a ferramenta de backup ou exporte via DBeaver

### Passo 2: Aplicar Migração

#### Opção A: Via Vercel CLI (Recomendado)

```bash
# 1. Instalar Vercel CLI (se não tiver)
npm i -g vercel

# 2. Fazer login
vercel login

# 3. Conectar ao projeto
vercel link

# 4. Puxar variáveis de ambiente
vercel env pull .env.local

# 5. Aplicar migração
npx prisma migrate deploy
```

#### Opção B: Via Terminal da Vercel

1. Acesse o dashboard da Vercel
2. Vá em seu projeto → **Settings** → **Functions**
3. Use o terminal integrado
4. Execute:
   ```bash
   npx prisma migrate deploy
   ```

### Passo 3: Verificar

Após aplicar a migração:

1. **Verificar no banco**:
   - IDs devem ser números (1, 2, 3...) em vez de strings
   - Todas as tabelas devem ter colunas `id` como `INTEGER`

2. **Testar login**:
   - Acesse a aplicação em produção
   - Tente fazer login
   - Deve funcionar agora!

## 🔍 Verificar Status da Migração

```bash
# Ver quais migrations foram aplicadas
npx prisma migrate status
```

Deve mostrar que `20251228143128_migrate_ids_to_int` foi aplicada.

## ⚠️ Importante

- **Faça backup antes** de aplicar a migração
- A migração **preserva todos os dados** existentes
- Usuários precisarão fazer login novamente após a migração
- Sessões ativas serão perdidas

## 🐛 Se Der Erro

### Erro: "Migration already applied"

- A migração já foi aplicada, mas pode haver problema de cache
- Tente: `npx prisma migrate resolve --applied 20251228143128_migrate_ids_to_int`

### Erro: "Cannot connect to database"

- Verifique se a `DATABASE_URL` está correta no `.env.local`
- Verifique se o banco está ativo no dashboard da Vercel

### Erro: "Type mismatch"

- Limpe o cache do Prisma: `rm -rf node_modules/.prisma`
- Regenere: `npx prisma generate`

## 📋 Checklist

- [ ] Backup do banco feito
- [ ] Vercel CLI instalado e logado
- [ ] Variáveis de ambiente puxadas (`vercel env pull`)
- [ ] Migração aplicada (`npx prisma migrate deploy`)
- [ ] Status verificado (`npx prisma migrate status`)
- [ ] Login testado em produção
