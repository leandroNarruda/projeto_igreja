# Prisma MCP Server

Servidor MCP para consultar o banco de dados PostgreSQL via chat no Cursor.

## Setup Rápido

1. **Configurar variáveis de ambiente**:
   ```bash
   cp ../.env.mcp.example ../.env.mcp
   ```
   
   Edite `.env.mcp` e adicione a URL do banco local:
   ```env
   MCP_DATABASE_URL_LOCAL="postgresql://user:pass@localhost:5432/projeto_igreja"
   ```

2. **Reiniciar o Cursor** para carregar o servidor MCP

3. **Testar no chat**:
   ```
   Liste todas as tabelas do banco local
   ```

## Documentação Completa

Ver [`docs/mcp/prisma-mcp.md`](../docs/mcp/prisma-mcp.md) para:
- Guia completo de uso
- Todas as ferramentas disponíveis
- Exemplos práticos
- Troubleshooting

## Arquivos

- `prisma-mcp-server.ts` - Código do servidor MCP
- `VALIDATION_CHECKLIST.md` - Checklist de validação da implementação
- `README.md` - Este arquivo

## Ferramentas MCP

- **db_query** - Consultar dados (SELECT apenas)
- **db_generate_write_sql** - Gerar SQL de escrita sem executar
- **db_schema_inspect** - Inspecionar schema do banco

## Segurança

- ✅ Somente leitura (SELECT)
- ✅ Bloqueio de escrita/DDL
- ✅ SQL parametrizado
- ✅ Limites de linhas
- ✅ Multiambiente (local/staging/production)
