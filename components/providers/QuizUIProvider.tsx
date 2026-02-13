'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

interface QuizUIContextValue {
  quizEmAndamento: boolean
  setQuizEmAndamento: (value: boolean) => void
}

const QuizUIContext = createContext<QuizUIContextValue | null>(null)

export function QuizUIProvider({ children }: { children: ReactNode }) {
  const [quizEmAndamento, setQuizEmAndamento] = useState(false)
  return (
    <QuizUIContext.Provider value={{ quizEmAndamento, setQuizEmAndamento }}>
      {children}
    </QuizUIContext.Provider>
  )
}

export function useQuizUI() {
  const ctx = useContext(QuizUIContext)
  if (!ctx) {
    return {
      quizEmAndamento: false,
      setQuizEmAndamento: () => {},
    }
  }
  return ctx
}
