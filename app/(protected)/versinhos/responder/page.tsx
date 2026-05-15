'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, XCircle, Swords } from 'lucide-react'
import { QuizInstructions } from '@/components/quiz/QuizInstructions'
import { QuizPlayer } from '@/components/quiz/QuizPlayer'
import { QuizResult } from '@/components/quiz/QuizResult'
import { Loading } from '@/components/ui/Loading'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageTransition } from '@/components/layout/PageTransition'
import { useQuizUI } from '@/components/providers/QuizUIProvider'
import { ChefaoPlayer } from '@/components/versinhos/ChefaoPlayer'
import {
  useVersinhosQuiz,
  useResponderVersinhos,
  useChefao,
  VersinhoRespostaInput,
  GabaritoItem,
} from '@/hooks/useVersinhos'

const TEMPO_POR_PERGUNTA = 30

function ResultadoRevisao({
  acertosDaRodada,
  total,
  gabarito,
  onJogarNovamente,
  onVoltar,
}: {
  acertosDaRodada: number
  total: number
  gabarito: GabaritoItem[]
  onJogarNovamente: () => void
  onVoltar: () => void
}) {
  const porcentagem =
    total > 0 ? Math.round((acertosDaRodada / total) * 100) : 0
  const nota =
    porcentagem === 100
      ? {
          emoji: '🏆',
          label: 'Perfeito! Você domina esse lote!',
          cor: 'text-yellow-400',
        }
      : porcentagem >= 70
        ? { emoji: '⭐', label: 'Muito bem! Quase lá.', cor: 'text-green-400' }
        : porcentagem >= 40
          ? {
              emoji: '📖',
              label: 'Ainda precisa revisar um pouco.',
              cor: 'text-blue-400',
            }
          : {
              emoji: '💪',
              label: 'Continue estudando, você vai chegar lá!',
              cor: 'text-lavender',
            }

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-8rem)] bg-bg-base py-8">
        <div className="w-full px-4 max-w-2xl mx-auto">
          <Card className="text-center mb-6 py-6">
            <p className="text-5xl mb-3">{nota.emoji}</p>
            <h2 className="text-xl font-bold text-accent mb-1">
              Revisão concluída
            </h2>
            <p className={`text-sm font-medium mb-4 ${nota.cor}`}>
              {nota.label}
            </p>
            <p className="text-4xl font-black text-accent">{porcentagem}%</p>
            <p className="text-lavender text-sm mt-1">
              {acertosDaRodada} de {total} acertos
            </p>
          </Card>

          <div className="flex flex-col gap-3 mb-6">
            {gabarito.map((item, i) => (
              <div
                key={item.versinhoId}
                className={`flex gap-3 p-4 rounded-xl border ${
                  item.acertou
                    ? 'bg-success/5 border-success/30'
                    : 'bg-danger/5 border-danger/30'
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {item.acertou ? (
                    <CheckCircle2 className="size-5 text-success" />
                  ) : (
                    <XCircle className="size-5 text-danger" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-lavender mb-1 line-clamp-2">
                    <span className="font-semibold text-accent">{i + 1}.</span>{' '}
                    {item.verso}
                  </p>
                  <div className="flex flex-col gap-1 mt-1">
                    <span className="text-xs text-success font-semibold">
                      {item.respostaCorreta}) {item.textoRespostaCorreta}
                    </span>
                    {!item.acertou && (
                      <span className="text-xs text-danger font-semibold">
                        Sua resposta:{' '}
                        {item.respostaUsuario
                          ? `${item.respostaUsuario}) ${item.textoRespostaUsuario}`
                          : 'Sem resposta'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="primary" onClick={onJogarNovamente}>
              Tentar esse lote novamente
            </Button>
            <Button variant="secondary" onClick={onVoltar}>
              Voltar
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

// ─── Modo Chefão ─────────────────────────────────────────────────────────────

function ModoChefao({ onFim }: { onFim: () => void }) {
  const { data, isLoading } = useChefao(true)

  if (isLoading) return <Loading text="Preparando o Chefão…" />

  if (!data?.prontoParaChefao) {
    return (
      <PageTransition>
        <div className="min-h-[calc(100vh-8rem)] bg-bg-base flex items-center justify-center py-8">
          <Card className="max-w-sm mx-4 text-center">
            <p className="text-4xl mb-3">⚔️</p>
            <h2 className="text-xl font-bold text-accent mb-2">
              Chefão não disponível
            </h2>
            <p className="text-lavender text-sm mb-6">
              Complete os versinhos do nível atual para desafiar o Chefão.
            </p>
            <Button variant="primary" onClick={onFim}>
              Voltar
            </Button>
          </Card>
        </div>
      </PageTransition>
    )
  }

  return (
    <ChefaoPlayer
      versinhos={data.versinhos!}
      nivel={data.nivel}
      proximoNivel={data.proximoNivel!}
      nomeProximoNivel={data.nomeProximoNivel!}
      emojiProximoNivel={data.emojiProximoNivel!}
      gradientProximoNivel={data.gradientProximoNivel!}
      onFim={onFim}
    />
  )
}

// ─── Modo normal ─────────────────────────────────────────────────────────────

function ResponderVersinhosInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const loteParam = searchParams.get('lote')
  const modoChefao = searchParams.get('modo') === 'chefao'
  const loteIndex = loteParam !== null ? parseInt(loteParam, 10) : undefined
  const modoRevisao = loteIndex !== undefined

  const [iniciado, setIniciado] = useState(false)
  const { data, isLoading, isFetching, refetch } = useVersinhosQuiz(
    iniciado && !modoChefao,
    loteIndex
  )
  const responderMutation = useResponderVersinhos()

  const [indice, setIndice] = useState(0)
  const [respostas, setRespostas] = useState<VersinhoRespostaInput[]>([])
  const [resultado, setResultado] = useState<{
    acertosDaRodada: number
    acertosTotais: number
    avancouLote: boolean
    concluido: boolean
    total: number
    modoRevisao: boolean
    gabarito?: GabaritoItem[]
    prontoParaChefao?: boolean
    nivel?: number
  } | null>(null)

  const { setQuizEmAndamento } = useQuizUI()
  const versinhos = data?.versinhos ?? []

  useEffect(() => {
    const emAndamento = modoChefao || (iniciado && !resultado)
    setQuizEmAndamento(emAndamento)
    return () => setQuizEmAndamento(false)
  }, [iniciado, resultado, modoChefao, setQuizEmAndamento])

  // Modo Chefão direto via ?modo=chefao
  if (modoChefao) {
    return <ModoChefao onFim={() => router.push('/versinhos')} />
  }

  const iniciarQuiz = () => {
    setRespostas([])
    setIndice(0)
    setResultado(null)
    setIniciado(true)
  }

  const jogarNovamente = async () => {
    setRespostas([])
    setIndice(0)
    setResultado(null)
    await refetch()
  }

  const handleAnswer = async (alternativa: string | null) => {
    const versinho = versinhos[indice]
    if (!versinho) return

    const novasRespostas: VersinhoRespostaInput[] = [
      ...respostas,
      { versinhoId: versinho.id, alternativaEscolhida: alternativa },
    ]
    setRespostas(novasRespostas)

    if (indice < versinhos.length - 1) {
      setIndice(indice + 1)
      return
    }

    try {
      const res = await responderMutation.mutateAsync({
        respostas: novasRespostas,
        loteIndex,
      })
      setResultado({
        ...res,
        total: novasRespostas.length,
        avancouLote: res.avancouLote ?? false,
        concluido: res.concluido ?? false,
      })
    } catch (e: any) {
      alert(e?.message || 'Erro ao salvar respostas')
    }
  }

  if (!iniciado) {
    return (
      <PageTransition>
        <div className="min-h-[calc(100vh-8rem)] bg-bg-base flex items-center justify-center py-8">
          <div className="w-full px-4">
            <QuizInstructions
              titulo={
                modoRevisao
                  ? `Revisão — Lote ${loteIndex! + 1}`
                  : 'Quiz de versinhos bíblicos'
              }
              totalPerguntas={10}
              onStart={iniciarQuiz}
            />
          </div>
        </div>
      </PageTransition>
    )
  }

  if ((isLoading || isFetching) && versinhos.length === 0 && !resultado) {
    return <Loading text="Carregando versinhos..." />
  }

  if (resultado) {
    if (resultado.modoRevisao && resultado.gabarito) {
      return (
        <ResultadoRevisao
          acertosDaRodada={resultado.acertosDaRodada}
          total={resultado.total}
          gabarito={resultado.gabarito}
          onJogarNovamente={jogarNovamente}
          onVoltar={() => router.push('/versinhos')}
        />
      )
    }

    const erros = resultado.total - resultado.acertosDaRodada
    const porcentagem =
      resultado.total > 0
        ? Math.round((resultado.acertosDaRodada / resultado.total) * 100)
        : 0
    return (
      <PageTransition>
        <div className="min-h-[calc(100vh-8rem)] bg-bg-base py-8">
          <div className="w-full px-4">
            <QuizResult
              total={resultado.total}
              acertos={resultado.acertosDaRodada}
              erros={erros}
              porcentagem={porcentagem}
            />
            <div className="max-w-2xl mx-auto mt-6 text-center">
              <p className="text-lavender mb-6">
                Total de versinhos acertados:{' '}
                <span className="font-bold text-accent text-xl">
                  {resultado.acertosTotais}
                </span>
              </p>

              {/* Botão Chefão se disponível */}
              {resultado.prontoParaChefao && (
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-900/40 border border-red-500/40 text-red-300 text-xs font-semibold mb-3 animate-pulse">
                    <Swords className="size-3" />
                    Chefão desbloqueado!
                  </div>
                  <button
                    onClick={() =>
                      router.push('/versinhos/responder?modo=chefao')
                    }
                    className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-gradient-to-r from-red-700 via-red-600 to-orange-600 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.99] transition-all duration-200"
                  >
                    <Swords className="size-5" />
                    Enfrentar o Chefão agora
                  </button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="primary" onClick={jogarNovamente}>
                  Jogar novamente
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => router.push('/versinhos')}
                >
                  Voltar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    )
  }

  if (!modoRevisao && data?.concluido) {
    return (
      <PageTransition>
        <div className="min-h-[calc(100vh-8rem)] bg-bg-base flex items-center justify-center py-8">
          <div className="w-full px-4">
            <Card className="max-w-xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-accent mb-4">
                🎉 Parabéns!
              </h2>
              <p className="text-lavender mb-2">
                Você concluiu todos os versinhos disponíveis.
              </p>
              <p className="text-lavender mb-6">
                Total de acertos:{' '}
                <span className="font-bold text-accent">
                  {data.acertosTotais}
                </span>
              </p>
              <Button
                variant="primary"
                onClick={() => router.push('/versinhos')}
              >
                Voltar
              </Button>
            </Card>
          </div>
        </div>
      </PageTransition>
    )
  }

  const versinho = versinhos[indice]
  if (!versinho) {
    if (responderMutation.isPending) {
      return <Loading text="Enviando respostas..." />
    }
    return <Loading />
  }

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-8rem)] bg-bg-base py-8">
        <div className="w-full px-4">
          {modoRevisao && (
            <p className="text-center text-xs text-lavender mb-4 font-medium tracking-wide uppercase">
              Modo revisão — Lote {loteIndex! + 1}
            </p>
          )}
          <QuizPlayer
            quizId={0}
            pergunta={{
              id: versinho.id,
              enunciado: versinho.verso,
              alternativaA: versinho.alternativaA,
              alternativaB: versinho.alternativaB,
              alternativaC: versinho.alternativaC,
              alternativaD: versinho.alternativaD,
              alternativaE: versinho.alternativaE,
              tempoSegundos: TEMPO_POR_PERGUNTA,
            }}
            onAnswer={handleAnswer}
            autoAdvance
          />
          <div className="flex justify-center gap-2 mt-5">
            {versinhos.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  i < indice
                    ? 'w-2 h-2 bg-primary'
                    : i === indice
                      ? 'w-3 h-3 bg-primary scale-110'
                      : 'w-2 h-2 bg-primary/20'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

export default function ResponderVersinhosPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ResponderVersinhosInner />
    </Suspense>
  )
}
