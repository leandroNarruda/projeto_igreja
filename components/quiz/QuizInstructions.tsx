'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface QuizInstructionsProps {
  tema: string
  totalPerguntas: number
  onStart: () => void
}

export const QuizInstructions: React.FC<QuizInstructionsProps> = ({
  tema,
  totalPerguntas,
  onStart,
}) => {
  return (
    <Card className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Quiz: {tema}
        </h2>
        <p className="text-gray-600">
          {totalPerguntas} {totalPerguntas === 1 ? 'pergunta' : 'perguntas'}
        </p>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Instruções:
        </h3>
        <ul className="space-y-3 text-left text-gray-700">
          <li className="flex items-start">
            <span className="mr-2">📝</span>
            <span>
              Você terá um tempo limitado para responder cada pergunta
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">⏱️</span>
            <span>
              Quando o tempo expirar, a próxima pergunta aparecerá
              automaticamente
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">🎲</span>
            <span>
              As perguntas aparecerão de forma aleatória
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">🚫</span>
            <span>
              Não será possível voltar para perguntas anteriores
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✅</span>
            <span>
              Escolha uma das 5 alternativas (A, B, C, D ou E) para cada
              pergunta
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">🎯</span>
            <span>
              Ao final, você verá seu resultado com acertos e erros
            </span>
          </li>
        </ul>
      </div>

      <div className="text-center">
        <Button
          variant="primary"
          onClick={onStart}
          className="px-8 py-3 text-lg"
        >
          Iniciar Quiz
        </Button>
      </div>
    </Card>
  )
}

