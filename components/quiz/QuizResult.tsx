'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'

interface QuizResultProps {
  total: number
  acertos: number
  erros: number
  porcentagem: number
}

export const QuizResult: React.FC<QuizResultProps> = ({
  total,
  acertos,
  erros,
  porcentagem,
}) => {
  const getColorClass = () => {
    if (porcentagem >= 80) return 'text-green-600'
    if (porcentagem >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getMessage = () => {
    if (porcentagem >= 80) return 'Excelente! 🎉'
    if (porcentagem >= 60) return 'Bom trabalho! 👍'
    return 'Continue praticando! 💪'
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Resultado do Quiz
        </h2>

        <div className="mb-8">
          <div className={`text-6xl font-bold mb-2 ${getColorClass()}`}>
            {porcentagem}%
          </div>
          <p className="text-xl text-gray-600">{getMessage()}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{acertos}</div>
            <div className="text-sm text-gray-600">Acertos</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-600">{erros}</div>
            <div className="text-sm text-gray-600">Erros</div>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <div
            className={`h-4 rounded-full transition-all duration-500 ${
              porcentagem >= 80
                ? 'bg-green-600'
                : porcentagem >= 60
                  ? 'bg-yellow-600'
                  : 'bg-red-600'
            }`}
            style={{ width: `${porcentagem}%` }}
          />
        </div>
      </div>
    </Card>
  )
}
