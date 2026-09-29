import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/permissions'

type BibliaInput = {
  enunciado: string
  alternativaA: string
  alternativaB: string
  alternativaC: string
  alternativaD: string
  alternativaE: string
  respostaCorreta: string
  ranking?: number
}

const RESPOSTAS_VALIDAS = ['A', 'B', 'C', 'D', 'E']

function validarPergunta(v: BibliaInput, index: number) {
  const erros: string[] = []
  const campos: (keyof BibliaInput)[] = [
    'enunciado',
    'alternativaA',
    'alternativaB',
    'alternativaC',
    'alternativaD',
    'alternativaE',
    'respostaCorreta',
  ]

  for (const campo of campos) {
    if (!v[campo] || typeof v[campo] !== 'string' || v[campo].trim() === '') {
      erros.push(`campo "${campo}" ausente ou vazio`)
    }
  }

  if (
    v.respostaCorreta &&
    !RESPOSTAS_VALIDAS.includes(v.respostaCorreta.toUpperCase())
  ) {
    erros.push('respostaCorreta deve ser A, B, C, D ou E')
  }

  if (
    v.ranking !== undefined &&
    (!Number.isInteger(v.ranking) || v.ranking < 0)
  ) {
    erros.push('ranking deve ser um número inteiro não negativo')
  }

  return erros.length > 0 ? { index, erros } : null
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  let dados: unknown
  try {
    dados = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  if (!Array.isArray(dados)) {
    return NextResponse.json(
      { error: 'O JSON deve ser um array de perguntas da Bíblia' },
      { status: 400 }
    )
  }

  const erros: { index: number; erros: string[] }[] = []
  const validos: BibliaInput[] = []

  for (let i = 0; i < dados.length; i++) {
    const erro = validarPergunta(dados[i] as BibliaInput, i)
    if (erro) {
      erros.push(erro)
    } else {
      validos.push(dados[i] as BibliaInput)
    }
  }

  if (validos.length === 0) {
    return NextResponse.json(
      { error: 'Nenhuma pergunta válida encontrada', erros },
      { status: 400 }
    )
  }

  const { count } = await prisma.biblia.createMany({
    data: validos.map(v => ({
      enunciado: v.enunciado.trim(),
      alternativaA: v.alternativaA.trim(),
      alternativaB: v.alternativaB.trim(),
      alternativaC: v.alternativaC.trim(),
      alternativaD: v.alternativaD.trim(),
      alternativaE: v.alternativaE.trim(),
      respostaCorreta: v.respostaCorreta.trim().toUpperCase(),
      ranking: v.ranking ?? 0,
    })),
    skipDuplicates: true,
  })

  return NextResponse.json({ inseridos: count, erros })
}

export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = 20

  const [total, perguntas] = await Promise.all([
    prisma.biblia.count(),
    prisma.biblia.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return NextResponse.json({
    perguntas,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  })
}
