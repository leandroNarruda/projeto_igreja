'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface Quiz {
  id: string
  tema: string
  ativo: boolean
  createdAt: string
  _count: {
    perguntas: number
  }
}

interface QuizListProps {
  quizzes: Quiz[]
  onAtivar: (id: string) => void
  onDesativar: (id: string) => void
  onDeletar: (id: string) => void
  onAdicionarPerguntas: (id: string) => void
}

export const QuizList: React.FC<QuizListProps> = ({
  quizzes,
  onAtivar,
  onDesativar,
  onDeletar,
  onAdicionarPerguntas,
}) => {
  return (
    <div className="space-y-4">
      {quizzes.length === 0 ? (
        <Card>
          <p className="text-gray-600 text-center py-8">
            Nenhum quiz cadastrado ainda.
          </p>
        </Card>
      ) : (
        quizzes.map(quiz => (
          <Card key={quiz.id}>
            <div className="flex  flex-col gap-4">
              {quiz.ativo && (
                <div className="flex-1 w-full text-right">
                  <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded">
                    ATIVO
                  </span>
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-900">{quiz.tema}</h3>
              <div className="flex w-full justify-between align-center">
                <p className="text-gray-600">
                  {quiz._count.perguntas}{' '}
                  {quiz._count.perguntas === 1 ? 'pergunta' : 'perguntas'}
                </p>
                <p className="text-sm text-gray-500">
                  Criado em:{' '}
                  {new Date(quiz.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="flex w-full justify-between align-center flex-col gap-2 ">
                {quiz.ativo ? (
                  <Button
                    variant="outline"
                    onClick={() => onDesativar(quiz.id)}
                    className="text-sm"
                  >
                    Desativar
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={() => onAtivar(quiz.id)}
                    className="text-sm"
                  >
                    Ativar
                  </Button>
                )}
                <Button
                  variant="secondary"
                  onClick={() => onAdicionarPerguntas(quiz.id)}
                  className="text-sm"
                >
                  Gerenciar Perguntas
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onDeletar(quiz.id)}
                  className="text-sm text-red-600 hover:bg-red-50"
                >
                  Deletar
                </Button>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  )
}
