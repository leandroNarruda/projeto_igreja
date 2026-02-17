#!/usr/bin/env node
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { PrismaClient } from '@prisma/client'

function isValidDbUrl(val: string | undefined): boolean {
  return (
    !!val && (val.startsWith('postgres://') || val.startsWith('postgresql://'))
  )
}

// Carrega .env.mcp se as URLs não forem válidas (ex.: Cursor passa "${MCP_DATABASE_URL_LOCAL}")
function loadEnvMcp(): void {
  const cwd = process.cwd()
  const paths = [resolve(cwd, '.env.mcp'), resolve(cwd, '../.env.mcp')]
  for (const envPath of paths) {
    if (!existsSync(envPath)) continue
    try {
      const content = readFileSync(envPath, 'utf8')
      for (const line of content.split('\n')) {
        const match = line.match(
          /^\s*MCP_DATABASE_URL_(LOCAL|STAGING|PRODUCTION)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^#\s]+))/
        )
        if (match) {
          const key = `MCP_DATABASE_URL_${match[1]}`
          const value = (match[2] ?? match[3] ?? match[4] ?? '').trim()
          if (value && !isValidDbUrl(process.env[key])) process.env[key] = value
        }
      }
      break
    } catch {
      /* ignore */
    }
  }
}
loadEnvMcp()

// Serializa para JSON convertendo BigInt (ex.: COUNT do PostgreSQL) para number
function safeJsonStringify(obj: unknown, space?: number): string {
  return JSON.stringify(
    obj,
    (_, value) => (typeof value === 'bigint' ? Number(value) : value),
    space
  )
}

// Tipos para os ambientes
type Environment = 'local' | 'staging' | 'production'

interface DatabaseConfig {
  url: string
  timeout?: number
  maxRows?: number
}

// Configuração de ambientes
const environments: Record<Environment, DatabaseConfig> = {
  local: {
    url: process.env.MCP_DATABASE_URL_LOCAL || '',
    timeout: 30000,
    maxRows: 500,
  },
  staging: {
    url: process.env.MCP_DATABASE_URL_STAGING || '',
    timeout: 30000,
    maxRows: 500,
  },
  production: {
    url: process.env.MCP_DATABASE_URL_PRODUCTION || '',
    timeout: 10000,
    maxRows: 200,
  },
}

// Cache de clientes Prisma por ambiente
const prismaClients: Partial<Record<Environment, PrismaClient>> = {}

// Função para obter cliente Prisma do ambiente
function getPrismaClient(env: Environment): PrismaClient {
  const config = environments[env]

  if (!config.url) {
    throw new Error(
      `DATABASE_URL não configurado para ambiente: ${env}. Defina MCP_DATABASE_URL_${env.toUpperCase()}`
    )
  }

  if (!prismaClients[env]) {
    prismaClients[env] = new PrismaClient({
      datasources: {
        db: {
          url: config.url,
        },
      },
    })
  }

  return prismaClients[env]!
}

// Validação de SQL (apenas SELECT permitido)
function validateReadOnlySQL(sql: string): void {
  const trimmedSQL = sql.trim().toUpperCase()

  // Lista de comandos proibidos
  const blockedCommands = [
    'INSERT',
    'UPDATE',
    'DELETE',
    'DROP',
    'CREATE',
    'ALTER',
    'TRUNCATE',
    'GRANT',
    'REVOKE',
    'EXEC',
    'EXECUTE',
  ]

  // Verifica se começa com comando bloqueado
  for (const cmd of blockedCommands) {
    if (trimmedSQL.startsWith(cmd)) {
      throw new Error(
        `Comando ${cmd} não permitido. Apenas SELECT é aceito em db_query.`
      )
    }
  }

  // Verifica se é WITH seguido de SELECT (CTE permitido)
  if (trimmedSQL.startsWith('WITH')) {
    if (!trimmedSQL.includes('SELECT')) {
      throw new Error('CTE deve terminar com SELECT.')
    }
  } else if (!trimmedSQL.startsWith('SELECT')) {
    throw new Error('Apenas queries SELECT são permitidas.')
  }

  // Bloqueia múltiplas statements (detecta ; fora de strings)
  const statementCount = (sql.match(/;/g) || []).length
  if (
    statementCount > 1 ||
    (statementCount === 1 && !sql.trim().endsWith(';'))
  ) {
    throw new Error('Apenas uma query por vez é permitida.')
  }
}

// Função para gerar SQL parametrizado
function generateWriteSQL(params: {
  operation: 'insert' | 'update' | 'delete'
  table: string
  data?: Record<string, any>
  where?: Record<string, any>
  returning?: string[]
}): { sql: string; params: any[] } {
  const { operation, table, data, where, returning } = params
  const queryParams: any[] = []
  let paramIndex = 1

  if (operation === 'insert') {
    if (!data || Object.keys(data).length === 0) {
      throw new Error('INSERT requer campo "data" com valores.')
    }

    const columns = Object.keys(data)
    const placeholders = columns.map(() => `$${paramIndex++}`)
    queryParams.push(...Object.values(data))

    let sql = `INSERT INTO "${table}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${placeholders.join(', ')})`

    if (returning && returning.length > 0) {
      sql += ` RETURNING ${returning.map(r => `"${r}"`).join(', ')}`
    }

    return { sql: sql + ';', params: queryParams }
  }

  if (operation === 'update') {
    if (!data || Object.keys(data).length === 0) {
      throw new Error('UPDATE requer campo "data" com valores.')
    }
    if (!where || Object.keys(where).length === 0) {
      throw new Error(
        'UPDATE requer campo "where" para evitar atualização em massa.'
      )
    }

    const setClauses = Object.keys(data).map(key => {
      queryParams.push(data[key])
      return `"${key}" = $${paramIndex++}`
    })

    const whereClauses = Object.keys(where).map(key => {
      queryParams.push(where[key])
      return `"${key}" = $${paramIndex++}`
    })

    let sql = `UPDATE "${table}" SET ${setClauses.join(', ')} WHERE ${whereClauses.join(' AND ')}`

    if (returning && returning.length > 0) {
      sql += ` RETURNING ${returning.map(r => `"${r}"`).join(', ')}`
    }

    return { sql: sql + ';', params: queryParams }
  }

  if (operation === 'delete') {
    if (!where || Object.keys(where).length === 0) {
      throw new Error(
        'DELETE requer campo "where" para evitar exclusão em massa.'
      )
    }

    const whereClauses = Object.keys(where).map(key => {
      queryParams.push(where[key])
      return `"${key}" = $${paramIndex++}`
    })

    let sql = `DELETE FROM "${table}" WHERE ${whereClauses.join(' AND ')}`

    if (returning && returning.length > 0) {
      sql += ` RETURNING ${returning.map(r => `"${r}"`).join(', ')}`
    }

    return { sql: sql + ';', params: queryParams }
  }

  throw new Error(`Operação inválida: ${operation}`)
}

// Criar servidor MCP
const server = new Server(
  {
    name: 'prisma-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
)

// Listar ferramentas disponíveis
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'db_query',
        description:
          'Executa uma query SELECT no banco de dados (somente leitura). Suporta CTEs que terminem em SELECT.',
        inputSchema: {
          type: 'object',
          properties: {
            env: {
              type: 'string',
              enum: ['local', 'staging', 'production'],
              description: 'Ambiente do banco de dados',
              default: 'local',
            },
            sql: {
              type: 'string',
              description: 'Query SQL SELECT a executar',
            },
            params: {
              type: 'array',
              description: 'Parâmetros para query parametrizada ($1, $2, ...)',
              items: {},
              default: [],
            },
            limit: {
              type: 'number',
              description: 'Limite de linhas a retornar',
            },
          },
          required: ['sql'],
        },
      },
      {
        name: 'db_generate_write_sql',
        description:
          'Gera SQL parametrizado para INSERT/UPDATE/DELETE sem executar. Útil para revisar antes de executar manualmente.',
        inputSchema: {
          type: 'object',
          properties: {
            env: {
              type: 'string',
              enum: ['local', 'staging', 'production'],
              description:
                'Ambiente alvo (apenas para referência, não executa)',
              default: 'local',
            },
            operation: {
              type: 'string',
              enum: ['insert', 'update', 'delete'],
              description: 'Tipo de operação',
            },
            table: {
              type: 'string',
              description: 'Nome da tabela',
            },
            data: {
              type: 'object',
              description: 'Dados para INSERT ou UPDATE (objeto chave-valor)',
            },
            where: {
              type: 'object',
              description:
                'Condições WHERE para UPDATE ou DELETE (objeto chave-valor)',
            },
            returning: {
              type: 'array',
              description: 'Colunas a retornar após a operação (RETURNING)',
              items: { type: 'string' },
            },
          },
          required: ['operation', 'table'],
        },
      },
      {
        name: 'db_schema_inspect',
        description:
          'Inspeciona o schema do banco de dados, retornando tabelas, colunas, tipos e chaves.',
        inputSchema: {
          type: 'object',
          properties: {
            env: {
              type: 'string',
              enum: ['local', 'staging', 'production'],
              description: 'Ambiente do banco de dados',
              default: 'local',
            },
            schema: {
              type: 'string',
              description: 'Schema a inspecionar (padrão: public)',
              default: 'public',
            },
          },
        },
      },
    ],
  }
})

// Handler para executar ferramentas
server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: toolArgs } = request.params
  const args = toolArgs || {}

  try {
    if (name === 'db_query') {
      const env = (args.env as Environment) || 'local'
      const sql = args.sql as string
      const params = (args.params as any[]) || []
      const userLimit = args.limit as number | undefined

      const config = environments[env]
      const maxRows = config.maxRows || 200
      const limit = userLimit ? Math.min(userLimit, maxRows) : maxRows

      // Validação de segurança
      validateReadOnlySQL(sql)

      const prisma = getPrismaClient(env)

      const startTime = Date.now()

      // Executa query raw
      const rows = await prisma.$queryRawUnsafe(sql, ...params)

      const duration = Date.now() - startTime
      const rowCount = Array.isArray(rows) ? rows.length : 0

      // Limita resultados
      const limitedRows = Array.isArray(rows) ? rows.slice(0, limit) : rows

      // Log estruturado
      console.error(
        JSON.stringify({
          tool: 'db_query',
          env,
          duration,
          rowCount,
          limited: rowCount > limit,
        })
      )

      return {
        content: [
          {
            type: 'text',
            text: safeJsonStringify(
              {
                rows: limitedRows,
                rowCount,
                duration,
                limited: rowCount > limit,
                env,
              },
              2
            ),
          },
        ],
      }
    }

    if (name === 'db_generate_write_sql') {
      const env = (args.env as Environment) || 'local'
      const operation = args.operation as 'insert' | 'update' | 'delete'
      const table = args.table as string
      const data = args.data as Record<string, any> | undefined
      const where = args.where as Record<string, any> | undefined
      const returning = args.returning as string[] | undefined

      const { sql, params } = generateWriteSQL({
        operation,
        table,
        data,
        where,
        returning,
      })

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                sql,
                params,
                env,
                warning:
                  'Este SQL NÃO foi executado. Revise antes de executar manualmente.',
                howToExecute:
                  'Use psql, Prisma Studio, ou db_query se for um SELECT.',
              },
              null,
              2
            ),
          },
        ],
      }
    }

    if (name === 'db_schema_inspect') {
      const env = (args.env as Environment) || 'local'
      const schema = (args.schema as string) || 'public'

      const prisma = getPrismaClient(env)

      // Query para obter informações das tabelas
      const tables = await prisma.$queryRawUnsafe<any[]>(`
        SELECT
          table_name,
          (
            SELECT json_agg(
              json_build_object(
                'column_name', column_name,
                'data_type', data_type,
                'is_nullable', is_nullable,
                'column_default', column_default
              )
            )
            FROM information_schema.columns
            WHERE table_schema = '${schema}'
              AND table_name = t.table_name
          ) as columns
        FROM information_schema.tables t
        WHERE table_schema = '${schema}'
          AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                schema,
                env,
                tables,
                tableCount: tables.length,
              },
              null,
              2
            ),
          },
        ],
      }
    }

    throw new Error(`Ferramenta desconhecida: ${name}`)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              error: errorMessage,
              tool: name,
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    }
  }
})

// Iniciar servidor
async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)

  console.error('Prisma MCP Server iniciado')
}

main().catch(error => {
  console.error('Erro ao iniciar servidor:', error)
  process.exit(1)
})
