import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { isAdmin } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface PerguntaData {
  enunciado: string
  alternativaA: string
  alternativaB: string
  alternativaC: string
  alternativaD: string
  alternativaE: string
  respostaCorreta: string
  justificativa: string
  tempoSegundos: number | string
}

interface ValidacaoResultado {
  valida: boolean
  erros: string[]
}

// Função auxiliar para validar uma única pergunta
function validarPergunta(
  pergunta: PerguntaData,
  index?: number
): ValidacaoResultado {
  const erros: string[] = []
  const prefixo = index !== undefined ? `Pergunta ${index + 1}: ` : ''

  if (!pergunta.enunciado || pergunta.enunciado.trim() === '') {
    erros.push(`${prefixo}Enunciado é obrigatório`)
  }

  if (
    !pergunta.alternativaA ||
    !pergunta.alternativaB ||
    !pergunta.alternativaC ||
    !pergunta.alternativaD ||
    !pergunta.alternativaE
  ) {
    erros.push(`${prefixo}Todas as 5 alternativas são obrigatórias`)
  }

  if (
    !pergunta.respostaCorreta ||
    !['A', 'B', 'C', 'D', 'E'].includes(pergunta.respostaCorreta)
  ) {
    erros.push(`${prefixo}Resposta correta deve ser A, B, C, D ou E`)
  }

  if (!pergunta.justificativa || pergunta.justificativa.trim() === '') {
    erros.push(`${prefixo}Justificativa é obrigatória`)
  }

  if (!pergunta.tempoSegundos || Number(pergunta.tempoSegundos) < 1) {
    erros.push(`${prefixo}Tempo em segundos deve ser maior que 0`)
  }

  return {
    valida: erros.length === 0,
    erros,
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const isUserAdmin = await isAdmin()
    if (!isUserAdmin) {
      return NextResponse.json(
        {
          error: 'Acesso negado. Apenas administradores podem criar perguntas.',
        },
        { status: 403 }
      )
    }

    const quizId = parseInt(params.id, 10)
    if (isNaN(quizId)) {
      return NextResponse.json(
        { error: 'ID do quiz inválido' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Detectar se é array ou objeto único
    const isArray = Array.isArray(body)
    const perguntasParaProcessar: PerguntaData[] = isArray ? body : [body]

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

    // Validar todas as perguntas antes de criar qualquer uma
    const errosValidacao: string[] = []
    perguntasParaProcessar.forEach((pergunta, index) => {
      const validacao = validarPergunta(pergunta, isArray ? index : undefined)
      if (!validacao.valida) {
        errosValidacao.push(...validacao.erros)
      }
    })

    if (errosValidacao.length > 0) {
      return NextResponse.json(
        {
          error: 'Erros de validação',
          detalhes: errosValidacao,
        },
        { status: 400 }
      )
    }

    // Criar todas as perguntas em uma transação
    const perguntasCriadas = await prisma.$transaction(
      perguntasParaProcessar.map(pergunta =>
        prisma.pergunta.create({
          data: {
            quizId,
            enunciado: pergunta.enunciado.trim(),
            alternativaA: pergunta.alternativaA.trim(),
            alternativaB: pergunta.alternativaB.trim(),
            alternativaC: pergunta.alternativaC.trim(),
            alternativaD: pergunta.alternativaD.trim(),
            alternativaE: pergunta.alternativaE.trim(),
            respostaCorreta: pergunta.respostaCorreta,
            justificativa: pergunta.justificativa.trim(),
            tempoSegundos: parseInt(String(pergunta.tempoSegundos)),
          },
        })
      )
    )

    // Retornar resposta no formato apropriado
    if (isArray) {
      return NextResponse.json(
        {
          message: `${perguntasCriadas.length} pergunta(s) criada(s) com sucesso`,
          perguntas: perguntasCriadas,
          total: perguntasCriadas.length,
        },
        { status: 201 }
      )
    } else {
      return NextResponse.json(
        {
          message: 'Pergunta criada com sucesso',
          pergunta: perguntasCriadas[0],
        },
        { status: 201 }
      )
    }
  } catch (error: unknown) {
    console.error('Erro ao criar pergunta(s):', error)
    const message =
      error instanceof Error ? error.message : 'Erro ao criar pergunta(s)'
    return NextResponse.json(
      {
        error: 'Erro ao criar pergunta(s)',
        detalhes: process.env.NODE_ENV === 'development' ? message : undefined,
      },
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
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const quizId = parseInt(params.id, 10)
    if (isNaN(quizId)) {
      return NextResponse.json(
        { error: 'ID do quiz inválido' },
        { status: 400 }
      )
    }

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

    // Verificar se o usuário já tem resultado para este quiz
    const resultadoExistente = await prisma.resultadoQuiz.findUnique({
      where: {
        userId_quizId: {
          userId: session.user.id,
          quizId,
        },
      },
    })

    if (resultadoExistente) {
      return NextResponse.json(
        { error: 'Você já respondeu este quiz' },
        { status: 400 }
      )
    }

    // Buscar todas as perguntas do quiz
    const todasPerguntas = await prisma.pergunta.findMany({
      where: { quizId },
    })

    if (todasPerguntas.length === 0) {
      return NextResponse.json(
        { error: 'Quiz não possui perguntas' },
        { status: 400 }
      )
    }

    // Embaralhar aleatoriamente
    const perguntasEmbaralhadas = [...todasPerguntas].sort(
      () => Math.random() - 0.5
    )

    // Retornar todas as perguntas embaralhadas (com respostaCorreta para feedback visual)
    return NextResponse.json({
      perguntas: perguntasEmbaralhadas.map(p => ({
        id: p.id,
        enunciado: p.enunciado,
        alternativaA: p.alternativaA,
        alternativaB: p.alternativaB,
        alternativaC: p.alternativaC,
        alternativaD: p.alternativaD,
        alternativaE: p.alternativaE,
        tempoSegundos: p.tempoSegundos,
        respostaCorreta: p.respostaCorreta,
        justificativa: p.justificativa,
      })),
    })
  } catch (error: any) {
    console.error('Erro ao listar perguntas:', error)

    // Se o erro for relacionado ao Prisma Client não ter o modelo ResultadoQuiz
    if (error?.message?.includes('resultadoQuiz') || error?.code === 'P2001') {
      return NextResponse.json(
        {
          error:
            'Prisma Client precisa ser regenerado. Execute: npx prisma generate',
          detalhes: error.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        error: 'Erro ao listar perguntas',
        detalhes: error?.message || 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
