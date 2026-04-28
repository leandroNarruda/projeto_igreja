'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'

interface Pergunta {
  id: number
  enunciado: string
  alternativaA: string
  alternativaB: string
  alternativaC: string
  alternativaD: string
  alternativaE: string
  tempoSegundos: number
  respostaCorreta?: string
  justificativa?: string
}

interface QuizPlayerProps {
  quizId: number
  pergunta: Pergunta
  onAnswer: (alternativa: string | null) => void
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({
  quizId,
  pergunta,
  onAnswer,
}) => {
  const [tempoRestante, setTempoRestante] = useState(pergunta.tempoSegundos)
  const [alternativaSelecionada, setAlternativaSelecionada] = useState<
    string | null
  >(null)
  const [respondida, setRespondida] = useState(false)
  const [tempoAvançar, setTempoAvançar] = useState(15)
  const [avancou, setAvancou] = useState(false)

  useEffect(() => {
    setTempoRestante(pergunta.tempoSegundos)
    setAlternativaSelecionada(null)
    setRespondida(false)
    setTempoAvançar(15)
    setAvancou(false)

    // Remove o foco de qualquer elemento ativo
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
  }, [pergunta.id, pergunta.tempoSegundos])

  // Timer: para quando respondida; ao zerar só marca respondida (não avança)
  useEffect(() => {
    if (respondida) return

    if (tempoRestante <= 0) {
      setRespondida(true)
      return
    }

    const timer = setInterval(() => {
      setTempoRestante(prev => {
        if (prev <= 1) {
          setRespondida(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [tempoRestante, respondida])

  const handleAlternativaChange = (alternativa: string) => {
    if (respondida) return
    setAlternativaSelecionada(alternativa)
    setRespondida(true)
  }

  const handleAvançar = () => {
    if (avancou) return
    setAvancou(true)
    onAnswer(alternativaSelecionada ?? null)
  }

  // Contagem regressiva de 15s no botão Avançar; ao zerar, avança sozinho
  useEffect(() => {
    if (!respondida || avancou) return
    if (tempoAvançar <= 0) {
      setAvancou(true)
      onAnswer(alternativaSelecionada ?? null)
      return
    }
    const t = setInterval(() => {
      setTempoAvançar(prev => prev - 1)
    }, 1000)
    return () => clearInterval(t)
  }, [respondida, tempoAvançar, avancou, alternativaSelecionada, onAnswer])

  const alternativas = [
    { letra: 'A', texto: pergunta.alternativaA },
    { letra: 'B', texto: pergunta.alternativaB },
    { letra: 'C', texto: pergunta.alternativaC },
    { letra: 'D', texto: pergunta.alternativaD },
    { letra: 'E', texto: pergunta.alternativaE },
  ]

  const showFeedback =
    respondida &&
    pergunta.respostaCorreta != null &&
    pergunta.respostaCorreta !== ''

  const porcentagemTempo = (tempoRestante / pergunta.tempoSegundos) * 100
  const corTempo =
    porcentagemTempo > 50
      ? 'bg-green-500'
      : porcentagemTempo > 25
        ? 'bg-yellow-500'
        : 'bg-red-500'

  const variants = {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -100, opacity: 0 },
  }

  const transition = {
    duration: 0.5,
    ease: 'easeInOut',
  }

  return (
    <Card className="max-w-3xl mx-auto overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={pergunta.id}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={transition}
          onAnimationComplete={() => {
            // Rola a tela para o topo após a animação de entrada terminar
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        >
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-lavender">
                Tempo restante
              </h3>
              <span
                className={`text-2xl font-bold ${
                  tempoRestante <= 10 ? 'text-danger' : 'text-accent'
                }`}
              >
                {tempoRestante}s
              </span>
            </div>
            <div className="w-full bg-primary/20 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${corTempo}`}
                style={{ width: `${porcentagemTempo}%` }}
              />
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-accent mb-6">
              {pergunta.enunciado}
            </h2>

            <div className="space-y-3">
              {alternativas.map(alt => {
                const isSelected = alternativaSelecionada === alt.letra
                const isCorrect = alt.letra === pergunta.respostaCorreta
                const isCorrectAnswer = showFeedback && isCorrect
                const isWrongChoice = showFeedback && isSelected && !isCorrect

                let borderBgClasses =
                  'border-primary/30 hover:border-primary/60 hover:bg-primary/5'
                if (!showFeedback) {
                  if (isSelected)
                    borderBgClasses = 'border-primary bg-primary/10'
                } else {
                  if (isCorrectAnswer)
                    borderBgClasses = 'border-success bg-success/10'
                  else if (isWrongChoice)
                    borderBgClasses = 'border-danger bg-danger/10'
                }

                return (
                  <label
                    key={alt.letra}
                    className={`
                      flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all
                      ${borderBgClasses}
                      ${respondida ? 'cursor-not-allowed' : ''}
                      ${respondida && !showFeedback ? 'opacity-60' : ''}
                    `}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="alternativa"
                        value={alt.letra}
                        checked={isSelected}
                        onChange={() => handleAlternativaChange(alt.letra)}
                        disabled={respondida}
                        className="mr-4 w-5 h-5 text-primary focus:ring-primary"
                      />
                      <span className="font-semibold text-accent mr-3">
                        {alt.letra})
                      </span>
                      <span className="text-lavender flex-1">{alt.texto}</span>
                      {showFeedback && isCorrectAnswer && (
                        <Check
                          className="flex-shrink-0 w-6 h-6 text-success"
                          aria-hidden
                        />
                      )}
                      {showFeedback && isWrongChoice && (
                        <X
                          className="flex-shrink-0 w-6 h-6 text-danger"
                          aria-hidden
                        />
                      )}
                    </div>
                    {showFeedback &&
                      isCorrectAnswer &&
                      pergunta.justificativa?.trim() && (
                        <p className="mt-2 ml-9 text-sm text-success font-bold">
                          {pergunta.justificativa.trim()}
                        </p>
                      )}
                  </label>
                )
              })}
            </div>

            {respondida && !avancou && (
              <div
                className="fixed top-12 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2"
                aria-live="polite"
              >
                <button
                  type="button"
                  onClick={handleAvançar}
                  className="relative inline-flex items-center justify-center gap-2 w-52 px-8 py-4 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 overflow-hidden bg-primary/20 text-accent shadow-lg shadow-primary/25 transition-shadow hover:shadow-primary/40"
                >
                  {/* Background inteiro que esvazia com o tempo */}
                  <span
                    className="absolute inset-0 bg-primary transition-[width] duration-1000 ease-linear"
                    style={{ width: `${(tempoAvançar / 15) * 100}%` }}
                    aria-hidden
                  />
                  <span className="relative z-10 font-semibold text-accent">
                    Próximo {tempoAvançar > 0 && `(${tempoAvançar}s)`}
                  </span>
                  <ChevronRight
                    className="w-5 h-5 relative z-10 text-accent"
                    aria-hidden
                  />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </Card>
  )
}
