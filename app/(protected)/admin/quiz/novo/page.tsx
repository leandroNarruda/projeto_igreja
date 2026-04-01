'use client'

import { useRouter } from 'next/navigation'
import { QuizForm } from '@/components/quiz/QuizForm'
import { Button } from '@/components/ui/Button'
import { PageTransition } from '@/components/layout/PageTransition'
import { useCriarQuiz } from '@/hooks/useQuiz'

export default function AdminQuizNovoPage() {
  const router = useRouter()
  const criarQuizMutation = useCriarQuiz()

  const handleCriarQuiz = async (data: {
    tema: string
    perguntas: Array<Record<string, unknown>>
  }) => {
    try {
      await criarQuizMutation.mutateAsync(data)
      router.push('/admin/quiz')
    } catch (error) {
      console.error('Erro ao criar quiz:', error)
      throw error
    }
  }

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-8rem)] bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => router.push('/admin/quiz')}
            >
              ← Voltar para Quizzes
            </Button>
          </div>

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Novo Quiz</h1>
            <p className="mt-1 text-sm text-gray-600">
              Preencha os dados para criar um novo quiz.
            </p>
          </div>

          <QuizForm
            onSubmit={handleCriarQuiz}
            onCancel={() => router.push('/admin/quiz')}
          />
        </div>
      </div>
    </PageTransition>
  )
}
