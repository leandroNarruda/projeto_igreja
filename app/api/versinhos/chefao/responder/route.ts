import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { VERSINOS_POR_NIVEL } from '@/lib/versinhoNiveis'

export const dynamic = 'force-dynamic'

type AlternativaKey =
  | 'alternativaA'
  | 'alternativaB'
  | 'alternativaC'
  | 'alternativaD'
  | 'alternativaE'
const ALTERNATIVA_KEYS: AlternativaKey[] = [
  'alternativaA',
  'alternativaB',
  'alternativaC',
  'alternativaD',
  'alternativaE',
]

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userId = session.user.id
    const body = await request.json()
    const versinhoId: number = body?.versinhoId
    const resposta: string = body?.resposta

    if (
      typeof versinhoId !== 'number' ||
      typeof resposta !== 'string' ||
      !resposta.trim()
    ) {
      return NextResponse.json(
        { error: 'versinhoId e resposta são obrigatórios' },
        { status: 400 }
      )
    }

    const progresso = await prisma.versinhoProgresso.findUnique({
      where: { userId },
    })
    if (!progresso) {
      return NextResponse.json(
        { error: 'Progresso não encontrado' },
        { status: 404 }
      )
    }

    // Verifica que o versinho pertence ao lote do nível atual do usuário
    const skip = (progresso.nivel - 1) * VERSINOS_POR_NIVEL
    const versinhosDoNivel = await prisma.versinho.findMany({
      orderBy: { id: 'asc' },
      skip,
      take: VERSINOS_POR_NIVEL,
      select: { id: true },
    })
    const idsDoNivel = new Set(versinhosDoNivel.map(v => v.id))

    if (!idsDoNivel.has(versinhoId)) {
      return NextResponse.json(
        { error: 'Versinho não pertence ao nível atual' },
        { status: 400 }
      )
    }

    const versinho = await prisma.versinho.findUnique({
      where: { id: versinhoId },
      select: {
        respostaCorreta: true,
        alternativaA: true,
        alternativaB: true,
        alternativaC: true,
        alternativaD: true,
        alternativaE: true,
      },
    })

    if (!versinho) {
      return NextResponse.json(
        { error: 'Versinho não encontrado' },
        { status: 404 }
      )
    }

    const respostaCorretaTexto =
      versinho[`alternativa${versinho.respostaCorreta}` as AlternativaKey]

    // Verifica se a resposta do usuário bate com alguma alternativa e se é a correta
    const respostaNormalizada = resposta.trim()
    let alternativaEncontrada: string | null = null
    for (const key of ALTERNATIVA_KEYS) {
      if (versinho[key].trim() === respostaNormalizada) {
        alternativaEncontrada = key.replace('alternativa', '')
        break
      }
    }

    const correto =
      alternativaEncontrada !== null &&
      alternativaEncontrada === versinho.respostaCorreta

    return NextResponse.json({
      correto,
      respostaCorreta: respostaCorretaTexto,
    })
  } catch (error: any) {
    console.error('[versinhos/chefao/responder] erro:', error)
    return NextResponse.json(
      { error: 'Erro ao validar resposta do Chefão' },
      { status: 500 }
    )
  }
}
