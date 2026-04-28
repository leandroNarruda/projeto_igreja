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
    if (porcentagem >= 80) return 'text-success'
    if (porcentagem >= 60) return 'text-orange'
    return 'text-danger'
  }

  const getMessage = () => {
    if (porcentagem >= 80) return 'Excelente! 🎉'
    if (porcentagem >= 60) return 'Bom trabalho! 👍'
    return 'Continue praticando! 💪'
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-accent mb-6">
          Resultado do Quiz
        </h2>

        <div className="mb-8">
          <div className={`text-6xl font-bold mb-2 ${getColorClass()}`}>
            {porcentagem}%
          </div>
          <p className="text-xl text-lavender">{getMessage()}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-primary/10 rounded-lg p-4">
            <div className="text-2xl font-bold text-accent">{total}</div>
            <div className="text-sm text-lavender">Total</div>
          </div>
          <div className="bg-success/10 rounded-lg p-4">
            <div className="text-2xl font-bold text-success">{acertos}</div>
            <div className="text-sm text-lavender">Acertos</div>
          </div>
          <div className="bg-danger/10 rounded-lg p-4">
            <div className="text-2xl font-bold text-danger">{erros}</div>
            <div className="text-sm text-lavender">Erros</div>
          </div>
        </div>

        <div className="w-full bg-primary/20 rounded-full h-4 mb-4">
          <div
            className={`h-4 rounded-full transition-all duration-500 ${
              porcentagem >= 80
                ? 'bg-success'
                : porcentagem >= 60
                  ? 'bg-orange'
                  : 'bg-danger'
            }`}
            style={{ width: `${porcentagem}%` }}
          />
        </div>
      </div>
    </Card>
  )
}
