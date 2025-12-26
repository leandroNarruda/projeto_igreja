import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { isAdmin } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const isUserAdmin = await isAdmin()
    if (!isUserAdmin) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem criar perguntas.' },
        { status: 403 }
      )
    }

    const quizId = params.id
    const body = await request.json()
    const {
      enunciado,
      alternativaA,
      alternativaB,
      alternativaC,
      alternativaD,
      alternativaE,
      respostaCorreta,
      tempoSegundos,
    } = body

    // Validações
    if (!enunciado || enunciado.trim() === '') {
      return NextResponse.json(
        { error: 'Enunciado é obrigatório' },
        { status: 400 }
      )
    }

    if (
      !alternativaA ||
      !alternativaB ||
      !alternativaC ||
      !alternativaD ||
      !alternativaE
    ) {
      return NextResponse.json(
        { error: 'Todas as 5 alternativas são obrigatórias' },
        { status: 400 }
      )
    }

    if (
      !respostaCorreta ||
      !['A', 'B', 'C', 'D', 'E'].includes(respostaCorreta)
    ) {
      return NextResponse.json(
        { error: 'Resposta correta deve ser A, B, C, D ou E' },
        { status: 400 }
      )
    }

    if (!tempoSegundos || tempoSegundos < 1) {
      return NextResponse.json(
        { error: 'Tempo em segundos deve ser maior que 0' },
        { status: 400 }
      )
    }

    // Verificar se o quiz existe
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
    })

    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz não encontrado' },
        { status: 404 }
      )
    }

    const pergunta = await prisma.pergunta.create({
      data: {
        quizId,
        enunciado: enunciado.trim(),
        alternativaA: alternativaA.trim(),
        alternativaB: alternativaB.trim(),
        alternativaC: alternativaC.trim(),
        alternativaD: alternativaD.trim(),
        alternativaE: alternativaE.trim(),
        respostaCorreta,
        tempoSegundos: parseInt(tempoSegundos),
      },
    })

    return NextResponse.json(
      { message: 'Pergunta criada com sucesso', pergunta },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao criar pergunta:', error)
    return NextResponse.json(
      { error: 'Erro ao criar pergunta' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const quizId = params.id
    const isUserAdmin = await isAdmin()

    // Verificar se é uma requisição de gerenciamento (admin listando todas as perguntas)
    const url = new URL(request.url)
    const isAdminRequest = url.searchParams.get('admin') === 'true'

    // Se for admin e for requisição de gerenciamento, retorna todas as perguntas ordenadas
    if (isUserAdmin && isAdminRequest) {
      const perguntas = await prisma.pergunta.findMany({
        where: { quizId },
        orderBy: {
          createdAt: 'asc',
        },
      })

      return NextResponse.json({ perguntas })
    }

    // Para todos os usuários (incluindo admin respondendo quiz), retorna próxima pergunta não respondida aleatória
    const todasPerguntas = await prisma.pergunta.findMany({
      where: { quizId },
    })

    // Buscar perguntas já respondidas pelo usuário
    const respostasUsuario = await prisma.respostaUsuario.findMany({
      where: {
        userId: session.user.id,
        quizId,
      },
      select: {
        perguntaId: true,
      },
    })

    const perguntasRespondidasIds = new Set(
      respostasUsuario.map((r) => r.perguntaId)
    )

    // Filtrar perguntas não respondidas
    const perguntasNaoRespondidas = todasPerguntas.filter(
      (p) => !perguntasRespondidasIds.has(p.id)
    )

    // Embaralhar aleatoriamente
    const perguntasAleatorias = perguntasNaoRespondidas.sort(
      () => Math.random() - 0.5
    )

    // Retornar apenas a primeira pergunta não respondida (aleatória)
    const proximaPergunta = perguntasAleatorias[0] || null

    if (!proximaPergunta) {
      return NextResponse.json(
        { pergunta: null, fimDoQuiz: true },
        { status: 200 }
      )
    }

    return NextResponse.json({
      pergunta: {
        id: proximaPergunta.id,
        enunciado: proximaPergunta.enunciado,
        alternativaA: proximaPergunta.alternativaA,
        alternativaB: proximaPergunta.alternativaB,
        alternativaC: proximaPergunta.alternativaC,
        alternativaD: proximaPergunta.alternativaD,
        alternativaE: proximaPergunta.alternativaE,
        tempoSegundos: proximaPergunta.tempoSegundos,
      },
      fimDoQuiz: false,
    })
  } catch (error) {
    console.error('Erro ao listar perguntas:', error)
    return NextResponse.json(
      { error: 'Erro ao listar perguntas' },
      { status: 500 }
    )
  }
}
