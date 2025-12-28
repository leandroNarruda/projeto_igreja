'use client'

import React, { useState, useEffect } from 'react'
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

  useEffect(() => {
    setTempoRestante(pergunta.tempoSegundos)
    setAlternativaSelecionada(null)
    setRespondida(false)
  }, [pergunta.id, pergunta.tempoSegundos])

  useEffect(() => {
    if (tempoRestante <= 0) {
      if (!respondida) {
        setRespondida(true)
        onAnswer(null) // Resposta vazia quando tempo expira
      }
      return
    }

    const timer = setInterval(() => {
      setTempoRestante(prev => {
        if (prev <= 1) {
          if (!respondida) {
            setRespondida(true)
            onAnswer(null)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [tempoRestante, respondida, onAnswer])

  const handleAlternativaChange = (alternativa: string) => {
    if (respondida) return

    setAlternativaSelecionada(alternativa)
    setRespondida(true)
    onAnswer(alternativa)
  }

  const alternativas = [
    { letra: 'A', texto: pergunta.alternativaA },
    { letra: 'B', texto: pergunta.alternativaB },
    { letra: 'C', texto: pergunta.alternativaC },
    { letra: 'D', texto: pergunta.alternativaD },
    { letra: 'E', texto: pergunta.alternativaE },
  ]

  const porcentagemTempo = (tempoRestante / pergunta.tempoSegundos) * 100
  const corTempo =
    porcentagemTempo > 50
      ? 'bg-green-500'
      : porcentagemTempo > 25
        ? 'bg-yellow-500'
        : 'bg-red-500'

  return (
    <Card className="max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-700">
            Tempo restante
          </h3>
          <span
            className={`text-2xl font-bold ${
              tempoRestante <= 10 ? 'text-red-600' : 'text-gray-900'
            }`}
          >
            {tempoRestante}s
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${corTempo}`}
            style={{ width: `${porcentagemTempo}%` }}
          />
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {pergunta.enunciado}
        </h2>

        <div className="space-y-3">
          {alternativas.map(alt => (
            <label
              key={alt.letra}
              className={`
                flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all
                ${
                  alternativaSelecionada === alt.letra
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }
                ${respondida ? 'opacity-60 cursor-not-allowed' : ''}
              `}
            >
              <input
                type="radio"
                name="alternativa"
                value={alt.letra}
                checked={alternativaSelecionada === alt.letra}
                onChange={() => handleAlternativaChange(alt.letra)}
                disabled={respondida}
                className="mr-4 w-5 h-5 text-blue-600 focus:ring-blue-500"
              />
              <span className="font-semibold text-gray-900 mr-3">
                {alt.letra})
              </span>
              <span className="text-gray-700">{alt.texto}</span>
            </label>
          ))}
        </div>
      </div>
    </Card>
  )
}
