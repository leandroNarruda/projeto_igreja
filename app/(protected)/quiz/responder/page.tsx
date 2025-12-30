'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { QuizInstructions } from '@/components/quiz/QuizInstructions'
import { QuizPlayer } from '@/components/quiz/QuizPlayer'
import { QuizResult } from '@/components/quiz/QuizResult'
import { Modal } from '@/components/ui/Modal'

interface QuizAtivo {
  id: number
  tema: string
  totalPerguntas: number
}

interface Pergunta {
  id: number
  enunciado: string
  alternativaA: string
  alternativaB: string
  alternativaC: string
  alternativaD: string
  alternativaE: string
  tempoSegundos: number
}

export default function ResponderQuizPage() {
  const router = useRouter()
  const [quizAtivo, setQuizAtivo] = useState<QuizAtivo | null>(null)
  const [loading, setLoading] = useState(true)
  const [mostrarInstrucoes, setMostrarInstrucoes] = useState(true)
  const [todasPerguntas, setTodasPerguntas] = useState<Pergunta[]>([])
  const [indicePerguntaAtual, setIndicePerguntaAtual] = useState(0)
  const [respostas, setRespostas] = useState<Record<number, string | null>>({})
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState<{
    total: number
    acertos: number
    erros: number
    nulos: number
    porcentagem: number
  } | null>(null)
  const [mostrarModalSaida, setMostrarModalSaida] = useState(false)
  const [quizEmAndamento, setQuizEmAndamento] = useState(false)
  const pendenteNavegacao = useRef<string | null>(null)

  const buscarQuizAtivo = useCallback(async () => {
    try {
      const response = await fetch('/api/quiz/ativo')
      const data = await response.json()

      if (!data.quiz) {
        alert('Não há quiz ativo no momento')
        router.push('/home')
        return
      }

      if (data.jaRespondeu) {
        router.push('/home')
        return
      }

      setQuizAtivo({
        id: data.quiz.id,
        tema: data.quiz.tema,
        totalPerguntas: data.quiz.totalPerguntas,
      })
    } catch (error) {
      console.error('Erro ao buscar quiz ativo:', error)
      alert('Erro ao carregar quiz')
      router.push('/home')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    buscarQuizAtivo()
  }, [buscarQuizAtivo])

  const iniciarQuiz = async () => {
    if (!quizAtivo) return

    try {
      setLoading(true)
      const response = await fetch(`/api/quiz/${quizAtivo.id}/perguntas`)
      const data = await response.json()

      if (data.error) {
        alert(data.error)
        router.push('/home')
        return
      }

      if (data.perguntas && data.perguntas.length > 0) {
        setTodasPerguntas(data.perguntas)
        setIndicePerguntaAtual(0)
        setRespostas({})
        setMostrarInstrucoes(false)
        setQuizEmAndamento(true)
      } else {
        alert('Não há perguntas disponíveis')
        router.push('/home')
      }
    } catch (error) {
      console.error('Erro ao buscar perguntas:', error)
      alert('Erro ao carregar perguntas')
      router.push('/home')
    } finally {
      setLoading(false)
    }
  }

  const handleResposta = (alternativa: string | null) => {
    const perguntaAtual = todasPerguntas[indicePerguntaAtual]
    if (!perguntaAtual) return

    // Salvar resposta no estado
    setRespostas(prev => ({
      ...prev,
      [perguntaAtual.id]: alternativa,
    }))

    // Avançar para próxima pergunta ou finalizar
    if (indicePerguntaAtual < todasPerguntas.length - 1) {
      setIndicePerguntaAtual(prev => prev + 1)
    } else {
      // Última pergunta, finalizar quiz
      finalizarQuiz(alternativa)
    }
  }

  const finalizarQuiz = async (ultimaResposta: string | null) => {
    if (!quizAtivo) return

    // Garantir que a última resposta está salva no estado (para consistência)
    const perguntaAtual = todasPerguntas[indicePerguntaAtual]
    if (perguntaAtual) {
      setRespostas(prev => ({
        ...prev,
        [perguntaAtual.id]: ultimaResposta,
      }))
    }

    // Aguardar um frame para garantir que o estado foi atualizado
    await new Promise(resolve => requestAnimationFrame(resolve))

    // Passar a última resposta diretamente para evitar race condition
    await enviarTodasRespostas(ultimaResposta)
  }

  const enviarTodasRespostas = async (
    ultimaResposta?: string | null
  ): Promise<boolean> => {
    if (!quizAtivo) return false

    try {
      setEnviando(true)

      // Preparar array de respostas
      const ultimaPerguntaId = todasPerguntas[todasPerguntas.length - 1]?.id

      const respostasArray = todasPerguntas.map(pergunta => {
        // Se for a última pergunta e ultimaResposta foi fornecida, usar ela (prioridade)
        if (pergunta.id === ultimaPerguntaId && ultimaResposta !== undefined) {
          return {
            perguntaId: pergunta.id,
            alternativaEscolhida: ultimaResposta,
          }
        }
        // Caso contrário, usar do estado
        const respostaDoEstado = respostas[pergunta.id]
        return {
          perguntaId: pergunta.id,
          alternativaEscolhida:
            respostaDoEstado !== undefined ? respostaDoEstado : null,
        }
      })

      const response = await fetch('/api/quiz/resposta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizId: quizAtivo.id,
          respostas: respostasArray,
        }),
      })

      const data = await response.json()

      if (data.error) {
        // Se o erro for "já respondeu", não mostrar alerta (pode ser que já tenha sido enviado)
        // Apenas logar para debug
        if (data.error.includes('já respondeu')) {
          console.log('Quiz já foi respondido anteriormente')
        } else {
          alert(data.error)
        }
        return false
      }

      if (data.resultado) {
        setResultado(data.resultado)
        setQuizEmAndamento(false)
        return true
      }

      return false
    } catch (error) {
      console.error('Erro ao enviar respostas:', error)
      alert('Erro ao enviar respostas')
      return false
    } finally {
      setEnviando(false)
    }
  }

  const handleSaidaQuiz = async () => {
    if (!quizAtivo || !quizEmAndamento) return

    // Fechar modal imediatamente
    setMostrarModalSaida(false)

    // Desativar proteção ANTES de enviar para evitar loops
    setQuizEmAndamento(false)

    // Limpar navegação pendente temporariamente
    const urlPendente = pendenteNavegacao.current
    pendenteNavegacao.current = null

    // Enviar respostas parciais (a função já prepara todas as perguntas com null para não respondidas)
    const sucesso = await enviarTodasRespostas()

    // Só navegar se o envio foi bem-sucedido
    // Se houver erro, o usuário já está livre para navegar (quizEmAndamento = false)
    if (sucesso && urlPendente) {
      router.push(urlPendente)
    } else if (urlPendente) {
      // Se houve erro mas há URL pendente, navegar mesmo assim (proteção já foi desativada)
      router.push(urlPendente)
    }
  }

  const interceptarNavegacao = useCallback(
    (url: string) => {
      if (!quizEmAndamento || resultado) return true

      // Mostrar modal e armazenar destino
      pendenteNavegacao.current = url
      setMostrarModalSaida(true)
      return false
    },
    [quizEmAndamento, resultado]
  )

  // Proteção contra saída durante o quiz
  useEffect(() => {
    if (!quizEmAndamento || resultado) return

    // Handler para beforeunload (fechar aba/janela)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Tentar enviar respostas parciais antes de sair
      if (quizAtivo && todasPerguntas.length > 0) {
        const respostasArray = todasPerguntas.map(pergunta => {
          const respostaDoEstado = respostas[pergunta.id]
          return {
            perguntaId: pergunta.id,
            alternativaEscolhida:
              respostaDoEstado !== undefined ? respostaDoEstado : null,
          }
        })

        // Usar sendBeacon para tentar enviar antes de sair
        const data = JSON.stringify({
          quizId: quizAtivo.id,
          respostas: respostasArray,
        })

        // Tentar enviar com fetch keepalive (mais confiável)
        fetch('/api/quiz/resposta', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: data,
          keepalive: true,
        }).catch(() => {
          // Se fetch falhar, tentar sendBeacon como fallback
          navigator.sendBeacon(
            '/api/quiz/resposta',
            new Blob([data], { type: 'application/json' })
          )
        })
      }

      // Navegadores modernos ignoram mensagens customizadas, mas ainda mostram o alerta padrão
      e.preventDefault()
      e.returnValue = ''
    }

    // Handler para popstate (botão voltar do navegador)
    const handlePopState = (e: PopStateEvent) => {
      if (quizEmAndamento && !resultado) {
        e.preventDefault()
        // Voltar para a mesma página
        window.history.pushState(null, '', window.location.href)
        setMostrarModalSaida(true)
      }
    }

    // Adicionar estado ao histórico para interceptar botão voltar
    window.history.pushState(null, '', window.location.href)

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [quizEmAndamento, resultado, quizAtivo, todasPerguntas, respostas])

  // Interceptar navegação do Next.js router
  useEffect(() => {
    if (!quizEmAndamento || resultado) return

    // Interceptar router.push diretamente
    const originalPush = router.push
    const interceptedPush = (url: string | URL) => {
      let urlString: string
      if (typeof url === 'string') {
        urlString = url
      } else {
        urlString = url.pathname
      }

      if (
        urlString &&
        urlString.startsWith('/') &&
        !urlString.includes('/quiz/responder')
      ) {
        interceptarNavegacao(urlString)
        return Promise.resolve(false)
      }
      return originalPush(url as string)
    }

    // Sobrescrever router.push
    ;(router as any).push = interceptedPush

    // Interceptar cliques em links e botões de navegação
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement

      // Verificar se é um link
      const link = target.closest('a[href]')
      if (link) {
        const href = link.getAttribute('href')
        if (
          href &&
          href.startsWith('/') &&
          !href.startsWith('/quiz/responder')
        ) {
          e.preventDefault()
          e.stopPropagation()
          interceptarNavegacao(href)
          return
        }
      }

      // Verificar se é um botão dentro do Footer
      const button = target.closest('button')
      if (button) {
        const footer = target.closest('footer')
        const nav = target.closest('nav')

        // Se está no Footer ou Navbar, interceptar TODOS os cliques
        if (footer || nav) {
          e.preventDefault()
          e.stopPropagation()
          e.stopImmediatePropagation()

          // Tentar extrair o path do contexto do botão
          // Verificar aria-label para identificar a rota
          const ariaLabel = button.getAttribute('aria-label')
          let path = ''

          if (ariaLabel === 'Home') path = '/home'
          else if (ariaLabel === 'Eventos') path = '/eventos'
          else if (ariaLabel === 'Quiz') path = '/quiz'
          else if (ariaLabel === 'Perfil') path = '/perfil'

          if (path) {
            interceptarNavegacao(path)
          } else {
            // Se não conseguir identificar, interceptar mesmo assim
            interceptarNavegacao('/')
          }
        }
      }
    }

    document.addEventListener('click', handleClick, true)

    return () => {
      document.removeEventListener('click', handleClick, true)
      // Restaurar router.push original
      ;(router as any).push = originalPush
    }
  }, [quizEmAndamento, resultado, interceptarNavegacao, router])

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Carregando...</div>
      </div>
    )
  }

  if (!quizAtivo) {
    return null
  }

  if (resultado) {
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-gray-50 flex items-center justify-center py-8">
        <div className="w-full px-4">
          <QuizResult
            total={resultado.total}
            acertos={resultado.acertos}
            erros={resultado.erros}
            porcentagem={resultado.porcentagem}
          />
          <div className="text-center mt-6">
            <button
              onClick={() => router.push('/home')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Voltar para Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (mostrarInstrucoes) {
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-gray-50 flex items-center justify-center py-8">
        <div className="w-full px-4">
          <QuizInstructions
            tema={quizAtivo.tema}
            totalPerguntas={quizAtivo.totalPerguntas}
            onStart={iniciarQuiz}
          />
        </div>
      </div>
    )
  }

  const perguntaAtual = todasPerguntas[indicePerguntaAtual]

  if (!perguntaAtual) {
    if (enviando) {
      return (
        <div className="min-h-[calc(100vh-8rem)] bg-gray-50 flex items-center justify-center">
          <div className="text-gray-600">Enviando respostas...</div>
        </div>
      )
    }
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Carregando pergunta...</div>
      </div>
    )
  }

  const progresso = ((indicePerguntaAtual + 1) / todasPerguntas.length) * 100

  return (
    <>
      <Modal
        isOpen={mostrarModalSaida}
        onClose={() => {
          setMostrarModalSaida(false)
          pendenteNavegacao.current = null
        }}
        onConfirm={handleSaidaQuiz}
        title="Atenção!"
        message="Se você sair agora, não poderá fazer este quiz novamente. Deseja realmente sair?"
        confirmText="Sair mesmo assim"
        cancelText="Cancelar"
      />
      <div className="min-h-[calc(100vh-8rem)] bg-gray-50 py-8">
        <div className="w-full px-4">
          <div className="max-w-3xl mx-auto mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">
                Pergunta {indicePerguntaAtual + 1} de {todasPerguntas.length}
              </span>
              <span className="text-sm text-gray-600">
                {Math.round(progresso)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progresso}%` }}
              />
            </div>
          </div>
          <QuizPlayer
            quizId={quizAtivo.id}
            pergunta={perguntaAtual}
            onAnswer={handleResposta}
          />
        </div>
      </div>
    </>
  )
}
