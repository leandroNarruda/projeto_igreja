'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Flame, Leaf, ShieldCheck, Star, Trophy } from 'lucide-react'
import { PageTransition } from '@/components/layout/PageTransition'

type TrilhaQuiz = 'facil' | 'dificil'

export default function QuizTrilhaPage() {
  const router = useRouter()

  const iniciarQuiz = (trilha: TrilhaQuiz) => {
    router.push(`/quiz/responder?trilha=${trilha}`)
  }

  return (
    <PageTransition>
      <main className="min-h-[calc(100vh-8rem)] bg-bg-base">
        <section className="relative mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-3xl flex-col overflow-hidden px-4 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_74%_12%,rgb(var(--color-primary)/0.2),transparent_30%),linear-gradient(180deg,rgb(var(--color-bg-deep)/0.18),rgb(var(--color-bg-base))_42%)]" />

          <header className="relative z-10 mb-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => router.push('/home')}
              aria-label="Voltar"
              className="flex size-11 items-center justify-center rounded-full text-accent transition-colors hover:bg-primary/15 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <ArrowLeft className="size-6" aria-hidden />
            </button>

            <div className="min-w-0 text-center">
              <h1 className="truncate text-2xl font-black text-accent sm:text-3xl">
                Quiz da semana
              </h1>
              <p className="mt-0.5 text-xs font-bold uppercase tracking-wide text-lavender">
                Escolha sua trilha
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 text-lg font-black text-orange">
                <Flame className="size-7 fill-orange text-orange" aria-hidden />
                1
              </span>
            </div>
          </header>

          <div className="relative z-10 mb-7 rounded-lg bg-danger px-5 py-4 shadow-xl shadow-danger/20 sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-accent/75">
                  Semana atual
                </p>
                <h2 className="mt-1 text-2xl font-black leading-tight text-accent sm:text-3xl">
                  Escolha sua trilha e avance no desafio
                </h2>
              </div>
              <span className="rounded-lg border-2 border-accent px-2.5 py-1 text-sm font-black text-accent">
                LIVE
              </span>
            </div>
          </div>

          <div className="relative z-10 flex-1 overflow-hidden">
            <div className="pointer-events-none absolute left-1/2 top-8 h-full w-16 -translate-x-1/2 rounded-full bg-primary/10 blur-2xl" />
            <div className="pointer-events-none absolute left-[14%] top-48 text-primary/20">
              <ShieldCheck className="size-28" strokeWidth={1.2} />
            </div>
            <div className="pointer-events-none absolute right-[10%] top-[28rem] text-orange/20">
              <Trophy className="size-24" strokeWidth={1.2} />
            </div>

            <div className="relative mx-auto flex min-h-[20rem] w-full max-w-md items-center justify-center sm:min-h-[23rem]">
              <WeeklyQuizNode />
            </div>
          </div>

          <div className="relative z-10 border-t border-primary/20 bg-bg-base/95 px-0 py-4 shadow-2xl shadow-bg-deep backdrop-blur sm:rounded-lg sm:border sm:px-4">
            <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3">
              <TrilhaAction
                trilha="facil"
                label="Trilha fácil"
                icon={<Leaf className="size-5" aria-hidden />}
                onStart={iniciarQuiz}
              />
              <TrilhaAction
                trilha="dificil"
                label="Trilha difícil"
                icon={<Flame className="size-5" aria-hidden />}
                onStart={iniciarQuiz}
              />
            </div>
          </div>
        </section>
      </main>
    </PageTransition>
  )
}

function WeeklyQuizNode() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 18 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative flex flex-col items-center"
    >
      <span className="absolute size-52 rounded-full bg-danger/20 blur-3xl" />
      <span className="relative flex size-36 items-center justify-center rounded-full bg-danger text-accent shadow-2xl shadow-danger/30 ring-8 ring-danger/20 sm:size-44">
        <Star
          className="size-16 fill-accent text-accent sm:size-20"
          aria-hidden
        />
      </span>
      <span className="relative mt-5 rounded-full border border-primary/30 bg-bg-card px-5 py-2 text-sm font-black uppercase tracking-wide text-accent shadow-lg">
        Quiz semanal
      </span>
    </motion.div>
  )
}

function TrilhaAction({
  trilha,
  label,
  icon,
  onStart,
}: {
  trilha: TrilhaQuiz
  label: string
  icon: React.ReactNode
  onStart: (trilha: TrilhaQuiz) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onStart(trilha)}
      className="inline-flex min-h-14 items-center justify-center gap-2 rounded-lg bg-orange px-4 py-3 text-base font-black text-bg-deep shadow-lg shadow-orange/25 transition-all hover:-translate-y-0.5 hover:bg-orange/90 focus:outline-none focus:ring-4 focus:ring-orange/30"
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  )
}
