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

export async function POST(request: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const isUserAdmin = await isAdmin()
    if (!isUserAdmin) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem criar quizzes.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { tema, perguntas } = body

    if (!tema || tema.trim() === '') {
      return NextResponse.json({ error: 'Tema é obrigatório' }, { status: 400 })
    }

    if (perguntas !== undefined && !Array.isArray(perguntas)) {
      return NextResponse.json(
        { error: 'O campo perguntas deve ser um array' },
        { status: 400 }
      )
    }

    const perguntasParaProcessar: PerguntaData[] = Array.isArray(perguntas)
      ? perguntas
      : []

    const errosValidacao: string[] = []
    perguntasParaProcessar.forEach((pergunta, index) => {
      const validacao = validarPergunta(pergunta, index)
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

    const result = await prisma.$transaction(async tx => {
      const quiz = await tx.quiz.create({
        data: {
          tema: tema.trim(),
          ativo: false,
        },
      })

      if (perguntasParaProcessar.length > 0) {
        await tx.pergunta.createMany({
          data: perguntasParaProcessar.map(pergunta => ({
            quizId: quiz.id,
            enunciado: pergunta.enunciado.trim(),
            alternativaA: pergunta.alternativaA.trim(),
            alternativaB: pergunta.alternativaB.trim(),
            alternativaC: pergunta.alternativaC.trim(),
            alternativaD: pergunta.alternativaD.trim(),
            alternativaE: pergunta.alternativaE.trim(),
            respostaCorreta: pergunta.respostaCorreta,
            justificativa: pergunta.justificativa.trim(),
            tempoSegundos: parseInt(String(pergunta.tempoSegundos), 10),
          })),
        })
      }

      return {
        quiz,
        totalPerguntasCriadas: perguntasParaProcessar.length,
      }
    })

    return NextResponse.json(
      {
        message: 'Quiz criado com sucesso',
        quiz: result.quiz,
        totalPerguntasCriadas: result.totalPerguntasCriadas,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao criar quiz:', error)
    return NextResponse.json({ error: 'Erro ao criar quiz' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const isUserAdmin = await isAdmin()
    if (!isUserAdmin) {
      return NextResponse.json(
        {
          error: 'Acesso negado. Apenas administradores podem listar quizzes.',
        },
        { status: 403 }
      )
    }

    const quizzes = await prisma.quiz.findMany({
      include: {
        _count: {
          select: {
            perguntas: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ quizzes })
  } catch (error) {
    console.error('Erro ao listar quizzes:', error)
    return NextResponse.json(
      { error: 'Erro ao listar quizzes' },
      { status: 500 }
    )
  }
}
