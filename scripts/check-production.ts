import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkProduction() {
  console.log('🔍 Verificando configuração de produção...\n')

  try {
    // 1. Verificar conexão com banco
    console.log('1️⃣ Verificando conexão com banco de dados...')
    await prisma.$connect()
    console.log('✅ Conexão com banco estabelecida\n')

    // 2. Verificar se as tabelas existem
    console.log('2️⃣ Verificando se as tabelas do quiz existem...')
    const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('Quiz', 'Pergunta', 'RespostaUsuario')
      ORDER BY table_name;
    `

    const requiredTables = ['Quiz', 'Pergunta', 'RespostaUsuario']
    const existingTables = tables.map(t => t.table_name)

    console.log(
      `   Tabelas encontradas: ${existingTables.join(', ') || 'Nenhuma'}`
    )

    const missingTables = requiredTables.filter(
      t => !existingTables.includes(t)
    )
    if (missingTables.length > 0) {
      console.log(`   ❌ Tabelas faltando: ${missingTables.join(', ')}`)
      console.log('   ⚠️  Você precisa rodar as migrations!')
      console.log('   Execute: npx prisma migrate deploy\n')
    } else {
      console.log('   ✅ Todas as tabelas necessárias existem\n')
    }

    // 3. Verificar usuários e seus roles
    console.log('3️⃣ Verificando usuários e roles...')
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    let admins: typeof users = []
    if (users.length === 0) {
      console.log('   ⚠️  Nenhum usuário encontrado no banco\n')
    } else {
      console.log(`   Total de usuários: ${users.length}`)
      console.log('\n   Usuários:')
      users.forEach((user, index) => {
        const isAdmin = user.role === 'ADMIN'
        const icon = isAdmin ? '👑' : '👤'
        const roleStatus = isAdmin ? '✅ ADMIN' : '❌ USER'
        console.log(`   ${index + 1}. ${icon} ${user.email} - ${roleStatus}`)
        console.log(`      Nome: ${user.name}`)
        if (isAdmin) {
          admins.push(user)
        }
      })
      console.log()

      if (admins.length === 0) {
        console.log('   ⚠️  NENHUM USUÁRIO É ADMIN!')
        console.log('   Para tornar um usuário admin, execute no banco:')
        console.log(
          "   UPDATE \"User\" SET role = 'ADMIN' WHERE email = 'seu-email@exemplo.com';\n"
        )
      } else {
        console.log(`   ✅ ${admins.length} usuário(s) admin encontrado(s)\n`)
      }
    }

    // 4. Verificar se há quizzes cadastrados
    console.log('4️⃣ Verificando quizzes cadastrados...')
    const quizzes = await prisma.quiz.findMany({
      include: {
        _count: {
          select: {
            perguntas: true,
          },
        },
      },
    })

    console.log(`   Total de quizzes: ${quizzes.length}`)
    if (quizzes.length > 0) {
      console.log('\n   Quizzes:')
      quizzes.forEach((quiz, index) => {
        const status = quiz.ativo ? '🟢 ATIVO' : '⚪ Inativo'
        console.log(`   ${index + 1}. ${status} - ${quiz.tema}`)
        console.log(`      Perguntas: ${quiz._count.perguntas}`)
        console.log(`      ID: ${quiz.id}`)
      })
    } else {
      console.log('   ⚠️  Nenhum quiz cadastrado ainda')
    }
    console.log()

    // 5. Resumo final
    console.log('📋 RESUMO:')
    console.log('─'.repeat(50))

    const allTablesExist = missingTables.length === 0
    const hasAdmins = admins.length > 0

    if (allTablesExist && hasAdmins) {
      console.log('✅ Tudo configurado corretamente!')
      console.log('   O sistema deve estar funcionando.')
    } else {
      console.log('❌ Problemas encontrados:')
      if (!allTablesExist) {
        console.log('   - Tabelas faltando (rode migrations)')
      }
      if (!hasAdmins) {
        console.log('   - Nenhum usuário admin (atualize role no banco)')
      }
    }
    console.log('─'.repeat(50))
  } catch (error) {
    console.error('❌ Erro ao verificar:', error)
    if (error instanceof Error) {
      console.error('   Mensagem:', error.message)
    }
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

checkProduction()
  .then(() => {
    console.log('\n✅ Verificação concluída!')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ Erro fatal:', error)
    process.exit(1)
  })
