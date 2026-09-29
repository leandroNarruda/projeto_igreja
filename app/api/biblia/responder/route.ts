import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BIBLIAS_POR_NIVEL, getTotalBibliaNiveis } from '@/lib/bibliaNiveis'

export const dynamic = 'force-dynamic'

const TAMANHO_LOTE = 10
const ALTERNATIVAS_VALIDAS = new Set(['A', 'B', 'C', 'D', 'E'])

interface RespostaInput {
  bibliaId: number
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
    const loteIndexParam: number | undefined = body?.loteIndex

    if (!Array.isArray(respostas) || respostas.length === 0) {
      return NextResponse.json(
        { error: 'respostas (array) é obrigatório' },
        { status: 400 }
      )
    }

    for (const r of respostas) {
      if (typeof r?.bibliaId !== 'number') {
        return NextResponse.json(
          { error: 'bibliaId inválido' },
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

    const progresso = await prisma.bibliaProgresso.upsert({
      where: { userId },
      update: {},
      create: { userId },
      select: { acertos: true, nivel: true },
    })

    const loteAtual = Math.floor(progresso.acertos / TAMANHO_LOTE)
    const modoRevisao =
      typeof loteIndexParam === 'number' && loteIndexParam < loteAtual

    const base = modoRevisao
      ? loteIndexParam! * TAMANHO_LOTE
      : loteAtual * TAMANHO_LOTE

    const perguntasLote = await prisma.biblia.findMany({
      orderBy: { id: 'asc' },
      skip: base,
      take: TAMANHO_LOTE,
      select: {
        id: true,
        enunciado: true,
        respostaCorreta: true,
        alternativaA: true,
        alternativaB: true,
        alternativaC: true,
        alternativaD: true,
        alternativaE: true,
      },
    })

    if (perguntasLote.length === 0) {
      return NextResponse.json(
        { error: 'Não há mais perguntas disponíveis' },
        { status: 400 }
      )
    }

    const idsEsperados = new Set(perguntasLote.map(p => p.id))
    const idsRecebidos = new Set(respostas.map(r => r.bibliaId))

    if (
      idsEsperados.size !== idsRecebidos.size ||
      [...idsEsperados].some(id => !idsRecebidos.has(id))
    ) {
      return NextResponse.json(
        { error: 'As respostas não correspondem ao lote' },
        { status: 400 }
      )
    }

    const gabaritoMap = new Map(
      perguntasLote.map(p => [p.id, p.respostaCorreta])
    )
    let acertosDaRodada = 0
    for (const r of respostas) {
      if (
        r.alternativaEscolhida &&
        r.alternativaEscolhida === gabaritoMap.get(r.bibliaId)
      ) {
        acertosDaRodada++
      }
    }

    if (modoRevisao) {
      const gabaritoDetalhado = perguntasLote.map(p => {
        const altMap: Record<string, string> = {
          A: p.alternativaA,
          B: p.alternativaB,
          C: p.alternativaC,
          D: p.alternativaD,
          E: p.alternativaE,
        }
        const respostaUsuario =
          respostas.find(r => r.bibliaId === p.id)?.alternativaEscolhida ?? null
        return {
          bibliaId: p.id,
          enunciado: p.enunciado,
          respostaCorreta: p.respostaCorreta,
          textoRespostaCorreta: altMap[p.respostaCorreta] ?? '',
          respostaUsuario,
          textoRespostaUsuario: respostaUsuario
            ? (altMap[respostaUsuario] ?? '')
            : null,
          acertou: respostaUsuario === p.respostaCorreta,
        }
      })

      return NextResponse.json({
        modoRevisao: true,
        acertosDaRodada,
        acertosTotais: progresso.acertos,
        gabarito: gabaritoDetalhado,
      })
    }

    const novoAcertos = Math.max(progresso.acertos, base + acertosDaRodada)
    const novoNivel = Math.min(
      getTotalBibliaNiveis(),
      Math.max(1, Math.floor(novoAcertos / BIBLIAS_POR_NIVEL) + 1)
    )
    const avancouLote =
      Math.floor(novoAcertos / TAMANHO_LOTE) >
      Math.floor(progresso.acertos / TAMANHO_LOTE)

    if (novoAcertos !== progresso.acertos || novoNivel !== progresso.nivel) {
      await prisma.bibliaProgresso.update({
        where: { userId },
        data: { acertos: novoAcertos, nivel: novoNivel },
      })
    }

    const totalPerguntas = await prisma.biblia.count()
    const concluido =
      Math.floor(novoAcertos / TAMANHO_LOTE) * TAMANHO_LOTE >= totalPerguntas

    return NextResponse.json({
      modoRevisao: false,
      acertosDaRodada,
      acertosTotais: novoAcertos,
      avancouLote,
      concluido,
      nivel: novoNivel,
    })
  } catch (error: any) {
    console.error('[biblia/responder] erro:', error)
    return NextResponse.json(
      { error: 'Erro ao salvar respostas' },
      { status: 500 }
    )
  }
}
