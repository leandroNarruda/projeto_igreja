import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/permissions'

type VersinhoInput = {
  verso: string
  alternativaA: string
  alternativaB: string
  alternativaC: string
  alternativaD: string
  alternativaE: string
  respostaCorreta: string
}

const RESPOSTAS_VALIDAS = ['A', 'B', 'C', 'D', 'E']

function validarVersinho(v: VersinhoInput, index: number) {
  const erros: string[] = []
  const campos: (keyof VersinhoInput)[] = [
    'verso',
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
  if (v.respostaCorreta && !RESPOSTAS_VALIDAS.includes(v.respostaCorreta.toUpperCase())) {
    erros.push(`respostaCorreta deve ser A, B, C, D ou E`)
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
    return NextResponse.json({ error: 'O JSON deve ser um array de versinhos' }, { status: 400 })
  }

  const erros: { index: number; erros: string[] }[] = []
  const validos: VersinhoInput[] = []

  for (let i = 0; i < dados.length; i++) {
    const erro = validarVersinho(dados[i] as VersinhoInput, i)
    if (erro) {
      erros.push(erro)
    } else {
      validos.push(dados[i] as VersinhoInput)
    }
  }

  if (validos.length === 0) {
    return NextResponse.json({ error: 'Nenhum versinho válido encontrado', erros }, { status: 400 })
  }

  const { count } = await prisma.versinho.createMany({
    data: validos.map((v) => ({
      verso: v.verso.trim(),
      alternativaA: v.alternativaA.trim(),
      alternativaB: v.alternativaB.trim(),
      alternativaC: v.alternativaC.trim(),
      alternativaD: v.alternativaD.trim(),
      alternativaE: v.alternativaE.trim(),
      respostaCorreta: v.respostaCorreta.trim().toUpperCase(),
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

  const [total, versinhos] = await Promise.all([
    prisma.versinho.count(),
    prisma.versinho.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return NextResponse.json({ versinhos, total, page, totalPages: Math.ceil(total / limit) })
}
