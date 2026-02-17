# Prisma MCP Server - Guia de Uso

Servidor MCP (Model Context Protocol) para consultar e gerar SQL do banco de dados PostgreSQL via chat no Cursor.

## Características

- **Somente leitura**: Executa apenas queries `SELECT` no banco
- **Multiambiente**: Suporta `local`, `staging` e `production`
- **Geração de SQL**: Gera SQL parametrizado para `INSERT/UPDATE/DELETE` sem executar
- **Inspeção de schema**: Lista tabelas, colunas e tipos
- **Seguro**: Bloqueios contra escrita acidental, múltiplas queries e SQL injection

## Instalação e Configuração

### 1. Variáveis de Ambiente

Copie o arquivo de exemplo:

```bash
cp .env.mcp.example .env.mcp
```

Edite `.env.mcp` e configure as URLs de cada ambiente:

```env
MCP_DATABASE_URL_LOCAL="postgresql://user:pass@localhost:5432/projeto_igreja"
MCP_DATABASE_URL_STAGING="postgresql://..."
MCP_DATABASE_URL_PRODUCTION="postgresql://..."
```

**Importante**:
- Use usuários de banco com **permissões somente leitura** para maior segurança
- Para produção, considere um usuário ainda mais restrito
- O arquivo `.env.mcp` já está no `.gitignore`

### 2. Reiniciar o Cursor

Após configurar as variáveis de ambiente, **reinicie o Cursor** para carregar o servidor MCP.

O servidor será iniciado automaticamente quando você usar as ferramentas MCP no chat.

### 3. Verificar se está funcionando

No chat do Cursor, você pode testar:

```
Liste todas as tabelas do banco local
```

Ou:

```
Mostre os 5 usuários mais recentes
```

Se o MCP estiver funcionando, ele usará a ferramenta `db_query` ou `db_schema_inspect`.

## Ferramentas Disponíveis

### 1. `db_query` - Consultar Dados

Executa queries `SELECT` no banco de dados.

**Parâmetros**:
- `env`: Ambiente (`local`, `staging`, `production`) - padrão: `local`
- `sql`: Query SQL SELECT
- `params`: Array de parâmetros para query parametrizada (opcional)
- `limit`: Limite de linhas (opcional, máximo: 500 para local/staging, 200 para production)

**Exemplo via prompt**:

```
Busque os 10 quizzes mais recentes no ambiente local
```

```
Conte quantos usuários existem em produção
```

```
Mostre as perguntas do quiz com id 5
```

**Regras de segurança**:
- Apenas `SELECT` é permitido (incluindo CTEs que terminem em SELECT)
- Comandos bloqueados: `INSERT`, `UPDATE`, `DELETE`, `DROP`, `CREATE`, `ALTER`, `TRUNCATE`, `GRANT`, `REVOKE`
- Apenas uma query por vez (sem `;` no meio)
- Limite de linhas retornadas para evitar sobrecarga

### 2. `db_generate_write_sql` - Gerar SQL de Escrita

Gera SQL parametrizado para operações de escrita **sem executar**.

**Parâmetros**:
- `env`: Ambiente de referência (`local`, `staging`, `production`)
- `operation`: Tipo de operação (`insert`, `update`, `delete`)
- `table`: Nome da tabela
- `data`: Dados para INSERT ou UPDATE (objeto chave-valor)
- `where`: Condições WHERE para UPDATE ou DELETE (objeto chave-valor)
- `returning`: Colunas a retornar (array de strings) - opcional

**Exemplo via prompt**:

```
Gere um SQL para inserir um novo usuário com nome "João Silva" e email "joao@exemplo.com"
```

```
Gere SQL para atualizar o quiz com id=1, definindo ativo=true
```

```
Gere SQL para deletar a pergunta com id=10
```

**Saída**:
```json
{
  "sql": "INSERT INTO \"User\" (\"name\", \"email\") VALUES ($1, $2) RETURNING \"id\";",
  "params": ["João Silva", "joao@exemplo.com"],
  "warning": "Este SQL NÃO foi executado. Revise antes de executar manualmente."
}
```

**Regras de segurança**:
- **Nunca executa** o SQL gerado
- UPDATE e DELETE exigem `where` (evita operações em massa acidentais)
- SQL é parametrizado (proteção contra SQL injection)

### 3. `db_schema_inspect` - Inspecionar Schema

Retorna informações sobre tabelas, colunas, tipos e constraints do banco.

**Parâmetros**:
- `env`: Ambiente (`local`, `staging`, `production`) - padrão: `local`
- `schema`: Schema do banco (padrão: `public`)

**Exemplo via prompt**:

```
Liste todas as tabelas do banco local
```

```
Mostre a estrutura da tabela User
```

```
Quais colunas a tabela Quiz possui?
```

**Saída**:
```json
{
  "schema": "public",
  "env": "local",
  "tables": [
    {
      "table_name": "User",
      "columns": [
        {
          "column_name": "id",
          "data_type": "integer",
          "is_nullable": "NO",
          "column_default": "nextval('User_id_seq'::regclass)"
        },
        ...
      ]
    }
  ],
  "tableCount": 7
}
```

## Exemplos de Uso

### Consultas Simples

**Contar registros**:
```
Quantos usuários existem no banco local?
```

**Listar com filtro**:
```
Mostre os 5 quizzes ativos
```

**Joins**:
```
Liste as perguntas do quiz "Novo Testamento" com suas alternativas
```

### Consultas com Parâmetros

**Buscar por ID**:
```
Mostre os dados do usuário com id 10
```

**Buscar por condição**:
```
Liste todos os resultados do usuário com email "maria@exemplo.com"
```

### Geração de SQL de Escrita

**INSERT**:
```
Gere SQL para inserir um quiz com tema "Antigo Testamento"
```

**UPDATE**:
```
Gere SQL para ativar o quiz com id 5
```

**DELETE**:
```
Gere SQL para deletar o resultado de quiz do usuário 10 no quiz 5
```

### Inspeção de Schema

**Listar tabelas**:
```
Quais são todas as tabelas do banco?
```

**Ver estrutura**:
```
Mostre as colunas da tabela RespostaUsuario
```

## Ambientes

### Local (Desenvolvimento)
- Timeout: 30 segundos
- Limite de linhas: 500
- Use para desenvolvimento e testes

### Staging (Homologação)
- Timeout: 30 segundos
- Limite de linhas: 500
- Use para validar queries antes de produção

### Production (Produção)
- Timeout: 10 segundos
- Limite de linhas: 200
- **Use com extremo cuidado**
- Considere usar usuário com permissões ainda mais restritas

## Segurança e Boas Práticas

### ✅ O que PODE fazer

- Consultar dados com `SELECT`
- Usar `JOIN`, `WHERE`, `GROUP BY`, `ORDER BY`, `LIMIT`
- CTEs (Common Table Expressions) que terminem em `SELECT`
- Gerar SQL de escrita para revisão manual
- Inspecionar schema e metadados

### ❌ O que NÃO PODE fazer

- Executar `INSERT`, `UPDATE`, `DELETE` via `db_query`
- Executar DDL (`CREATE`, `ALTER`, `DROP`)
- Múltiplas queries em uma chamada
- Queries sem limite em produção (aplicado automaticamente)

### Recomendações

1. **Sempre especifique o ambiente** quando usar produção
2. **Revise SQL gerado** antes de executar manualmente
3. **Use `LIMIT`** em queries que podem retornar muitos dados
4. **Teste em local** antes de rodar em staging/production
5. **Use usuários de banco com permissões mínimas**

## Logs e Debugging

O servidor MCP loga informações estruturadas no stderr:

```json
{
  "tool": "db_query",
  "env": "local",
  "duration": 45,
  "rowCount": 150,
  "limited": false
}
```

Para ver logs durante desenvolvimento:
1. Abra o DevTools do Cursor (Help → Toggle Developer Tools)
2. Vá na aba Console
3. Logs do MCP aparecem com prefixo `[prisma-db]`

## Troubleshooting

### Erro: "DATABASE_URL não configurado"

**Causa**: Variável de ambiente não definida

**Solução**:
1. Verifique se `.env.mcp` existe
2. Confirme que a variável `MCP_DATABASE_URL_<ENV>` está preenchida
3. Reinicie o Cursor

### Erro: "Comando INSERT não permitido"

**Causa**: Tentativa de executar escrita via `db_query`

**Solução**: Use `db_generate_write_sql` para gerar o SQL, depois execute manualmente via:
- Prisma Studio
- psql
- Cliente SQL de sua preferência

### Erro: "Apenas uma query por vez"

**Causa**: SQL contém múltiplas statements (`;` no meio)

**Solução**: Divida em múltiplas chamadas ou remova statements adicionais

### MCP não aparece no Cursor

**Soluções**:
1. Verifique se `.cursor/mcp.json` existe
2. Reinicie completamente o Cursor
3. Verifique se `npm run mcp:dev` funciona manualmente
4. Veja logs no DevTools do Cursor

## Limitações Conhecidas

- Não suporta transações (cada query é independente)
- Não executa procedures/functions do PostgreSQL
- Limite de linhas aplicado após execução (não usa `LIMIT` SQL)
- Não suporta streaming de resultados grandes

## Próximas Melhorias

- [ ] Suporte a explain plan de queries
- [ ] Cache de resultados de schema
- [ ] Métricas de uso por ambiente
- [ ] Dry-run de SQL gerado com validação
- [ ] Export de resultados em CSV/JSON

## Referências

- [Model Context Protocol](https://modelcontextprotocol.io)
- [Cursor MCP Documentation](https://docs.cursor.com/context/mcp)
- [Prisma Documentation](https://www.prisma.io/docs)
