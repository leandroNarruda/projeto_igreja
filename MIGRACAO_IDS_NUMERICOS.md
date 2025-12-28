# Migração de IDs para Números Sequenciais

Esta migração converte todos os IDs de `TEXT` (cuid) para `INTEGER` (números sequenciais), **preservando todos os dados existentes**.

## ⚠️ IMPORTANTE: Faça Backup Antes!

Antes de executar a migração, faça backup do seu banco de dados:

```bash
# Exemplo para PostgreSQL
pg_dump -h seu_host -U seu_usuario -d nome_do_banco > backup_antes_migracao.sql
```

## Como Executar a Migração

### Opção 1: Usando Prisma Migrate (Recomendado)

```bash
# Aplicar a migração
npx prisma migrate deploy
```

### Opção 2: Executar SQL Manualmente

Se preferir executar manualmente, você pode copiar o conteúdo do arquivo:
`prisma/migrations/20251228143128_migrate_ids_to_int/migration.sql`

E executá-lo diretamente no seu banco de dados.

## O que a Migração Faz

1. **Preserva todos os dados**: Cria mapeamentos temporários para converter IDs antigos em novos
2. **Atribui IDs numéricos sequenciais**: Mantém a ordem de criação dos registros
3. **Atualiza todas as relações**: Foreign keys são atualizadas corretamente
4. **Configura autoincrement**: Sequences são configuradas para continuar a partir do maior ID existente
5. **Mantém integridade**: Todas as constraints são recriadas

## Após a Migração

1. **Regenere o Prisma Client**:

   ```bash
   npx prisma generate
   ```

2. **Verifique se tudo está funcionando**:
   - Teste login/cadastro de usuários
   - Teste criação de quizzes
   - Teste criação de perguntas
   - Teste respostas de quiz

## Rollback (Se Algo Der Errado)

Se precisar reverter a migração, restaure o backup:

```bash
# Restaurar backup
psql -h seu_host -U seu_usuario -d nome_do_banco < backup_antes_migracao.sql
```

## Notas

- Os IDs antigos (strings como `cmjq04t550000s29bt44bas6j`) serão substituídos por números (1, 2, 3...)
- A ordem dos IDs segue a ordem de criação (`createdAt`)
- Todas as relações entre tabelas são preservadas
- Sessões ativas podem ser perdidas (usuários precisarão fazer login novamente)
