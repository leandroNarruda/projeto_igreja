import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const TAMANHO_LOTE = 10
const ALTERNATIVAS_VALIDAS = new Set(['A', 'B', 'C', 'D', 'E'])

interface RespostaInput {
  versinhoId: number
  alternativaEscolhida: string | null
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userId = session.user.id
    const body = await request.json()
    const respostas: RespostaInput[] = body?.respostas

    if (!Array.isArray(respostas) || respostas.length === 0) {
      return NextResponse.json(
        { error: 'respostas (array) é obrigatório' },
        { status: 400 }
      )
    }

    for (const r of respostas) {
      if (typeof r?.versinhoId !== 'number') {
        return NextResponse.json(
          { error: 'versinhoId inválido' },
          { status: 400 }
        )
      }
      if (
        r.alternativaEscolhida !== null &&
        !ALTERNATIVAS_VALIDAS.has(r.alternativaEscolhida)
      ) {
        return NextResponse.json(
          { error: 'alternativaEscolhida inválida' },
          { status: 400 }
        )
      }
    }

    const progresso = await prisma.versinhoProgresso.upsert({
      where: { userId },
      update: {},
      create: { userId },
    })

    const base = Math.floor(progresso.acertos / TAMANHO_LOTE) * TAMANHO_LOTE

    const versinhosLote = await prisma.versinho.findMany({
      orderBy: { id: 'asc' },
      skip: base,
      take: TAMANHO_LOTE,
      select: { id: true, respostaCorreta: true },
    })

    if (versinhosLote.length === 0) {
      return NextResponse.json(
        { error: 'Não há mais versinhos disponíveis' },
        { status: 400 }
      )
    }

    const idsEsperados = new Set(versinhosLote.map(v => v.id))
    const idsRecebidos = new Set(respostas.map(r => r.versinhoId))

    if (
      idsEsperados.size !== idsRecebidos.size ||
      [...idsEsperados].some(id => !idsRecebidos.has(id))
    ) {
      return NextResponse.json(
        { error: 'As respostas não correspondem ao lote atual' },
        { status: 400 }
      )
    }

    const gabarito = new Map(versinhosLote.map(v => [v.id, v.respostaCorreta]))
    let acertosDaRodada = 0
    for (const r of respostas) {
      if (
        r.alternativaEscolhida &&
        r.alternativaEscolhida === gabarito.get(r.versinhoId)
      ) {
        acertosDaRodada++
      }
    }

    const novoAcertos = Math.max(progresso.acertos, base + acertosDaRodada)
    const avancouLote =
      Math.floor(novoAcertos / TAMANHO_LOTE) >
      Math.floor(progresso.acertos / TAMANHO_LOTE)

    if (novoAcertos !== progresso.acertos) {
      await prisma.versinhoProgresso.update({
        where: { userId },
        data: { acertos: novoAcertos },
      })
    }

    const totalVersinhos = await prisma.versinho.count()
    const concluido =
      Math.floor(novoAcertos / TAMANHO_LOTE) * TAMANHO_LOTE >= totalVersinhos

    return NextResponse.json({
      acertosDaRodada,
      acertosTotais: novoAcertos,
      avancouLote,
      concluido,
    })
  } catch (error: any) {
    console.error('[versinhos/responder] erro:', error)
    return NextResponse.json(
      { error: 'Erro ao salvar respostas' },
      { status: 500 }
    )
  }
}
