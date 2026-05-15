'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronRight, Swords } from 'lucide-react'
import {
  LIVROS_BIBLIA,
  getCapitulosPorLivro,
  getVersosPorCapitulo,
} from '@/lib/bibliaData'
import {
  useResponderChefao,
  useConcluirChefao,
  type VersinhoQuestao,
} from '@/hooks/useVersinhos'
import { NivelConquistadoModal } from './NivelConquistadoModal'
import { ChefaoDerrota } from './ChefaoDerrota'
import { SeletorModal } from './SeletorModal'

const TOTAL_VIDAS = 3
const TEMPO_POR_QUESTAO = 30

interface Props {
  versinhos: VersinhoQuestao[]
  nivel: number
  proximoNivel: number
  nomeProximoNivel: string
  emojiProximoNivel: string
  gradientProximoNivel: string
  onFim: () => void
}

type Fase = 'respondendo' | 'aguardando' | 'feedback' | 'vitoria' | 'derrota'

interface FeedbackItem {
  correto: boolean
  respostaCorreta: string
  respostaUsuario: string
  tempoEsgotado?: boolean
}

export function ChefaoPlayer({
  versinhos,
  nivel,
  proximoNivel,
  nomeProximoNivel,
  emojiProximoNivel,
  gradientProximoNivel,
  onFim,
}: Props) {
  const [fase, setFase] = useState<Fase>('respondendo')
  const [atual, setAtual] = useState(0)
  const [vidas, setVidas] = useState(TOTAL_VIDAS)
  const [livro, setLivro] = useState('')
  const [capitulo, setCapitulo] = useState('')
  const [verso, setVerso] = useState('')
  const [feedback, setFeedback] = useState<FeedbackItem | null>(null)
  const [animando, setAnimando] = useState(false)
  const [tempoRestante, setTempoRestante] = useState(TEMPO_POR_QUESTAO)
  const [seletorAberto, setSeletorAberto] = useState<
    'livro' | 'capitulo' | 'verso' | null
  >(null)

  const responderMutation = useResponderChefao()
  const concluirMutation = useConcluirChefao()

  // Refs para acesso sem re-render nos listeners de timer/visibilidade
  const faseRef = useRef(fase)
  const vidasRef = useRef(vidas)
  const atualRef = useRef(atual)
  const startTimeRef = useRef(Date.now())
  const concluindoRef = useRef(false)
  faseRef.current = fase
  vidasRef.current = vidas
  atualRef.current = atual

  const versinho = versinhos[atual]
  const totalVersinhos = versinhos.length

  const maxCapitulos = livro ? getCapitulosPorLivro(livro) : 0
  const maxVersos =
    livro && capitulo ? getVersosPorCapitulo(livro, parseInt(capitulo)) : 0

  // Registra derrota e muda para tela de derrota (evita chamadas duplas)
  const registrarDerrota = useCallback(async () => {
    if (concluindoRef.current) return
    concluindoRef.current = true
    try {
      await concluirMutation.mutateAsync({ aprovado: false })
    } finally {
      setFase('derrota')
    }
  }, [concluirMutation])

  // Reset ao mudar de questão
  useEffect(() => {
    setLivro('')
    setCapitulo('')
    setVerso('')
    setFeedback(null)
    setTempoRestante(TEMPO_POR_QUESTAO)
    startTimeRef.current = Date.now()
  }, [atual])

  useEffect(() => {
    setCapitulo('')
    setVerso('')
  }, [livro])

  useEffect(() => {
    setVerso('')
  }, [capitulo])

  // Timer baseado em Date.now() — imune ao throttling de aba em segundo plano
  useEffect(() => {
    if (fase !== 'respondendo') return

    const tick = () => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
      const restante = Math.max(0, TEMPO_POR_QUESTAO - elapsed)
      setTempoRestante(restante)

      if (restante <= 0) {
        // Tempo esgotado: conta como erro
        const novasVidas = vidasRef.current - 1
        setVidas(novasVidas)
        setFeedback({
          correto: false,
          respostaCorreta: '',
          respostaUsuario: '',
          tempoEsgotado: true,
        })
        setFase('feedback')

        if (novasVidas === 0) {
          setTimeout(() => registrarDerrota(), 2200)
        }
      }
    }

    const timer = setInterval(tick, 250)
    return () => clearInterval(timer)
  }, [fase, registrarDerrota])

  // Abandono: sair da aba/tela enquanto respondendo = derrota imediata
  useEffect(() => {
    if (fase !== 'respondendo') return

    const handleVisibility = () => {
      if (document.hidden && faseRef.current === 'respondendo') {
        registrarDerrota()
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () =>
      document.removeEventListener('visibilitychange', handleVisibility)
  }, [fase, registrarDerrota])

  const podeConfirmar = livro && capitulo && verso && fase === 'respondendo'

  async function handleConfirmar() {
    if (!podeConfirmar || responderMutation.isPending) return

    // Congela o timer imediatamente — antes de aguardar a API
    setFase('aguardando')

    const respostaUsuario = `${livro} ${capitulo}:${verso}`

    try {
      const resultado = await responderMutation.mutateAsync({
        versinhoId: versinho.id,
        resposta: respostaUsuario,
      })

      const novasVidas = resultado.correto ? vidas : vidas - 1

      setFeedback({
        correto: resultado.correto,
        respostaCorreta: resultado.respostaCorreta,
        respostaUsuario,
      })
      setFase('feedback')

      if (!resultado.correto) {
        setVidas(novasVidas)
        if (novasVidas === 0) {
          setTimeout(() => registrarDerrota(), 2200)
          return
        }
      }
    } catch {
      // erro silencioso — botão volta ao estado normal
    }
  }

  async function handleProximo() {
    const proximoIdx = atual + 1

    if (proximoIdx >= totalVersinhos) {
      setAnimando(true)
      try {
        await concluirMutation.mutateAsync({ aprovado: true })
        setFase('vitoria')
      } catch {
        setAnimando(false)
      }
      return
    }

    setAnimando(true)
    setTimeout(() => {
      setAtual(proximoIdx)
      setFase('respondendo')
      setAnimando(false)
    }, 200)
  }

  function handleTentarNovamente() {
    concluindoRef.current = false
    setFase('respondendo')
    setAtual(0)
    setVidas(TOTAL_VIDAS)
    setFeedback(null)
    setAnimando(false)
    setTempoRestante(TEMPO_POR_QUESTAO)
  }

  const porcentagemTempo = (tempoRestante / TEMPO_POR_QUESTAO) * 100
  const corTempo =
    porcentagemTempo > 50
      ? 'bg-green-500'
      : porcentagemTempo > 20
        ? 'bg-yellow-500'
        : 'bg-red-500'

  return (
    <>
      <div className="flex flex-col min-h-screen bg-bg-base">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-bg-base/95 backdrop-blur border-b border-primary/10 px-4 py-3">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Swords className="size-5 text-red-400" />
              <span className="font-bold text-accent text-sm">
                Chefão · Nível {nivel}
              </span>
            </div>

            {/* Vidas */}
            <div className="flex gap-1">
              {Array.from({ length: TOTAL_VIDAS }).map((_, i) => (
                <span
                  key={i}
                  className={`text-xl transition-all duration-300 ${i < vidas ? 'opacity-100' : 'opacity-20 grayscale'}`}
                  style={
                    i === vidas &&
                    fase === 'feedback' &&
                    feedback &&
                    !feedback.correto
                      ? { animation: 'chefao-vida-perdida 0.4s ease-out' }
                      : undefined
                  }
                >
                  ❤️
                </span>
              ))}
            </div>

            {/* Progresso */}
            <span className="text-xs text-lavender font-mono">
              {atual + 1}/{totalVersinhos}
            </span>
          </div>

          {/* Barra de progresso de questões */}
          <div className="max-w-lg mx-auto mt-2">
            <div className="h-1.5 bg-bg-deep rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 via-orange-400 to-yellow-400 rounded-full transition-all duration-500"
                style={{
                  width: `${((atual + (fase === 'feedback' ? 1 : 0)) / totalVersinhos) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 flex flex-col items-center justify-start px-4 py-8">
          <div
            className={`w-full max-w-lg transition-all duration-200 ${animando ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}
          >
            {/* Timer */}
            <div className="mb-10">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-lavender uppercase tracking-wider">
                  Tempo restante
                </span>
                <span
                  className={`text-sm font-bold tabular-nums ${tempoRestante <= 10 ? 'text-danger' : 'text-accent'}`}
                >
                  {fase === 'respondendo' ? `${tempoRestante}s` : '—'}
                </span>
              </div>
              <div className="w-full bg-bg-deep rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${fase === 'respondendo' ? corTempo : 'bg-bg-deep'}`}
                  style={{
                    width: `${fase === 'respondendo' ? porcentagemTempo : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Card do versinho */}
            <div className="relative mb-6 p-6 rounded-2xl bg-gradient-to-br from-gray-900 via-red-950/30 to-gray-900 border border-red-800/40 shadow-2xl">
              <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-red-700 text-white text-xs font-bold shadow">
                ⚔️ Identifique este versinho
              </div>
              <p className="text-white/90 text-base leading-relaxed mt-2 italic text-center">
                &ldquo;{versinho.verso}&rdquo;
              </p>
            </div>

            {/* Seletores */}
            <div className="flex flex-col gap-3 mb-6">
              <SeletorModal
                label="Livro"
                placeholder="Selecione o livro…"
                value={livro}
                options={[...LIVROS_BIBLIA]}
                disabled={fase !== 'respondendo'}
                isOpen={seletorAberto === 'livro'}
                onOpen={() => setSeletorAberto('livro')}
                onClose={() => setSeletorAberto(null)}
                onChange={v => {
                  setLivro(v)
                }}
              />
              <SeletorModal
                label="Capítulo"
                placeholder="Selecione o capítulo…"
                value={capitulo}
                options={Array.from({ length: maxCapitulos }, (_, i) =>
                  String(i + 1)
                )}
                disabled={!livro || fase !== 'respondendo'}
                isOpen={seletorAberto === 'capitulo'}
                onOpen={() => setSeletorAberto('capitulo')}
                onClose={() => setSeletorAberto(null)}
                onChange={v => {
                  setCapitulo(v)
                }}
              />
              <SeletorModal
                label="Versículo"
                placeholder="Selecione o versículo…"
                value={verso}
                options={Array.from({ length: maxVersos }, (_, i) =>
                  String(i + 1)
                )}
                disabled={!capitulo || fase !== 'respondendo'}
                isOpen={seletorAberto === 'verso'}
                onOpen={() => setSeletorAberto('verso')}
                onClose={() => setSeletorAberto(null)}
                onChange={v => {
                  setVerso(v)
                }}
              />
            </div>

            {/* Feedback */}
            {fase === 'feedback' && feedback && (
              <div
                className={`mb-4 p-4 rounded-xl border text-sm font-medium flex flex-col gap-1 transition-all duration-300 ${
                  feedback.correto
                    ? 'bg-success/10 border-success/40 text-success'
                    : 'bg-danger/10 border-danger/40 text-danger'
                }`}
              >
                <span className="text-base font-bold">
                  {feedback.correto
                    ? '✅ Correto!'
                    : feedback.tempoEsgotado
                      ? '⏰ Tempo esgotado!'
                      : '❌ Errado!'}
                </span>
                {!feedback.correto && !feedback.tempoEsgotado && (
                  <>
                    <span className="text-white/60 text-xs">
                      Sua resposta:{' '}
                      <span className="text-danger font-semibold">
                        {feedback.respostaUsuario}
                      </span>
                    </span>
                    <span className="text-white/60 text-xs">
                      Resposta correta:{' '}
                      <span className="text-success font-semibold">
                        {feedback.respostaCorreta}
                      </span>
                    </span>
                  </>
                )}
                {feedback.tempoEsgotado && feedback.respostaCorreta && (
                  <span className="text-white/60 text-xs">
                    Era:{' '}
                    <span className="text-success font-semibold">
                      {feedback.respostaCorreta}
                    </span>
                  </span>
                )}
              </div>
            )}

            {/* Botão confirmar */}
            {(fase === 'respondendo' || fase === 'aguardando') && (
              <button
                onClick={handleConfirmar}
                disabled={!podeConfirmar}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold text-base shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 flex items-center justify-center gap-2"
              >
                {fase === 'aguardando' ? (
                  <span className="animate-spin text-xl">⏳</span>
                ) : (
                  <>
                    Confirmar resposta
                    <ChevronRight className="size-5" />
                  </>
                )}
              </button>
            )}

            {/* Botão próximo (após feedback com vidas restantes) */}
            {fase === 'feedback' && feedback && vidas > 0 && (
              <button
                onClick={handleProximo}
                disabled={concluirMutation.isPending}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold text-base shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {atual + 1 >= totalVersinhos ? (
                  concluirMutation.isPending ? (
                    <span className="animate-spin text-xl">⏳</span>
                  ) : (
                    '🏆 Concluir Chefão'
                  )
                ) : (
                  <>
                    Próximo
                    <ChevronRight className="size-5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Desistir — sempre visível */}
        <div className="px-4 pb-6 max-w-lg mx-auto w-full">
          <button
            onClick={onFim}
            className="w-full py-3 rounded-xl border border-red-800/40 text-red-400 text-sm font-semibold hover:bg-red-900/20 active:bg-red-900/30 transition-all duration-200"
          >
            Desistir
          </button>
        </div>
      </div>

      {fase === 'vitoria' && (
        <NivelConquistadoModal
          isOpen
          nivel={proximoNivel}
          nomeNivel={nomeProximoNivel}
          emojiNivel={emojiProximoNivel}
          gradient={gradientProximoNivel}
          onContinuar={onFim}
        />
      )}

      {fase === 'derrota' && (
        <ChefaoDerrota
          nivel={nivel}
          onTentarNovamente={handleTentarNovamente}
        />
      )}

      <style>{`
        @keyframes chefao-vida-perdida {
          0%   { transform: scale(1); }
          30%  { transform: scale(1.4); }
          60%  { transform: scale(0.8); }
          100% { transform: scale(1); }
        }
      `}</style>
    </>
  )
}
