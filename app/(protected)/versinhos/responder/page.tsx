'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QuizInstructions } from '@/components/quiz/QuizInstructions'
import { QuizPlayer } from '@/components/quiz/QuizPlayer'
import { QuizResult } from '@/components/quiz/QuizResult'
import { Loading } from '@/components/ui/Loading'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageTransition } from '@/components/layout/PageTransition'
import {
  useVersinhosQuiz,
  useResponderVersinhos,
  VersinhoRespostaInput,
} from '@/hooks/useVersinhos'

const TEMPO_POR_PERGUNTA = 30

export default function ResponderVersinhosPage() {
  const router = useRouter()
  const [iniciado, setIniciado] = useState(false)
  const { data, isLoading, isFetching, refetch } = useVersinhosQuiz(iniciado)
  const responderMutation = useResponderVersinhos()

  const [indice, setIndice] = useState(0)
  const [respostas, setRespostas] = useState<VersinhoRespostaInput[]>([])
  const [resultado, setResultado] = useState<{
    acertosDaRodada: number
    acertosTotais: number
    avancouLote: boolean
    concluido: boolean
    total: number
  } | null>(null)

  const versinhos = data?.versinhos ?? []

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
      const res = await responderMutation.mutateAsync(novasRespostas)
      setResultado({ ...res, total: novasRespostas.length })
    } catch (e: any) {
      alert(e?.message || 'Erro ao salvar respostas')
    }
  }

  // Tela de instruções
  if (!iniciado) {
    return (
      <PageTransition>
        <div className="min-h-[calc(100vh-8rem)] bg-bg-base flex items-center justify-center py-8">
          <div className="w-full px-4">
            <QuizInstructions
              titulo="Quiz de versinhos bíblicos"
              totalPerguntas={10}
              onStart={iniciarQuiz}
            />
          </div>
        </div>
      </PageTransition>
    )
  }

  // Carregando lote
  if ((isLoading || isFetching) && versinhos.length === 0 && !resultado) {
    return <Loading text="Carregando versinhos..." />
  }

  // Tela de resultado
  if (resultado) {
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

  // Concluiu todos os versinhos
  if (data?.concluido) {
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

  // Player
  const versinho = versinhos[indice]
  if (!versinho) {
    if (responderMutation.isPending) {
      return <Loading text="Enviando respostas..." />
    }
    return <Loading />
  }

  const progresso = ((indice + 1) / versinhos.length) * 100

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-8rem)] bg-bg-base py-8">
        <div className="w-full px-4">
          <div className="max-w-3xl mx-auto mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-lavender">
                Pergunta {indice + 1} de {versinhos.length}
              </span>
              <span className="text-sm text-lavender">
                {Math.round(progresso)}%
              </span>
            </div>
            <div className="w-full bg-primary/20 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progresso}%` }}
              />
            </div>
          </div>
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
        </div>
      </div>
    </PageTransition>
  )
}
