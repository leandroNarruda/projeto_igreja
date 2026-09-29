'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { PageTransition } from '@/components/layout/PageTransition'

type DiaStatus = 'concluido' | 'atual' | 'bloqueado'

interface DiaTrilha {
  nome: string
  status: DiaStatus
  ponto: {
    x: number
    y: number
  }
}

const diasSemana = [
  'Sábado',
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
]

const pontosTrilha = [
  { x: 180, y: 72 },
  { x: 264, y: 174 },
  { x: 96, y: 276 },
  { x: 264, y: 378 },
  { x: 96, y: 480 },
  { x: 264, y: 582 },
  { x: 176, y: 708 },
]

const segmentosTrilha = [
  'M 180 72 C 62 92 56 160 264 174',
  'M 264 174 C 326 178 326 264 96 276',
  'M 96 276 C 34 280 34 366 264 378',
  'M 264 378 C 326 382 326 468 96 480',
  'M 96 480 C 34 484 34 570 264 582',
  'M 264 582 C 338 594 330 694 176 708',
]

const getDiaAtualSemana = () => {
  return (new Date().getDay() + 1) % 7
}

export default function QuizTrilhaPage() {
  const router = useRouter()
  const diaAtualIndex = getDiaAtualSemana()

  const dias = useMemo<DiaTrilha[]>(() => {
    return diasSemana.map((nome, index) => ({
      nome,
      ponto: pontosTrilha[index],
      status:
        index < diaAtualIndex
          ? 'concluido'
          : index === diaAtualIndex
            ? 'atual'
            : 'bloqueado',
    }))
  }, [diaAtualIndex])

  const iniciarQuiz = () => {
    router.push('/quiz/responder')
  }

  const diaAtual = dias[diaAtualIndex]

  return (
    <PageTransition>
      <main className="min-h-[calc(100vh-8rem)] bg-bg-base">
        <section className="relative mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-4xl flex-col overflow-hidden px-4 pb-28 pt-5 sm:px-6 sm:py-8 lg:px-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,rgb(var(--color-primary)/0.18),transparent_34%),linear-gradient(180deg,rgb(var(--color-bg-deep)/0.2),rgb(var(--color-bg-base)))]" />

          <h1 className="relative z-10 mb-2 text-3xl font-bold leading-tight text-accent sm:mb-4 sm:text-4xl">
            Trilha da semana
          </h1>

          <div className="relative z-10 flex flex-1 items-center justify-center">
            <div className="relative aspect-[360/740] w-full max-w-[22.5rem] sm:max-w-[27rem]">
              <motion.svg
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.34 }}
                className="absolute inset-0 h-full w-full overflow-visible"
                viewBox="0 0 360 740"
                preserveAspectRatio="xMidYMid meet"
                role="img"
                aria-label="Trilha semanal de quizzes"
              >
                <defs>
                  <linearGradient
                    id="trilha-no-atual-gradiente"
                    x1="0"
                    x2="1"
                    y1="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="rgb(var(--color-accent))" />
                    <stop offset="48%" stopColor="rgb(var(--color-orange))" />
                    <stop
                      offset="100%"
                      stopColor="rgb(var(--color-primary-hover))"
                    />
                  </linearGradient>
                  <linearGradient
                    id="trilha-ativa-gradiente"
                    x1="0"
                    x2="360"
                    y1="0"
                    y2="740"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor="rgb(var(--color-accent))" />
                    <stop offset="50%" stopColor="rgb(var(--color-orange))" />
                    <stop
                      offset="100%"
                      stopColor="rgb(var(--color-primary-hover))"
                    />
                  </linearGradient>
                </defs>

                {segmentosTrilha.map((segmento, index) => {
                  const concluido = index < diaAtualIndex
                  const corSegmento = concluido
                    ? 'url(#trilha-ativa-gradiente)'
                    : 'rgb(var(--color-primary) / 0.28)'

                  return (
                    <g key={segmento}>
                      <path
                        d={segmento}
                        fill="none"
                        stroke="rgb(var(--color-primary) / 0.16)"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="18"
                      />
                      <path
                        d={segmento}
                        fill="none"
                        stroke="rgb(var(--color-bg-deep) / 0.96)"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="12"
                      />
                      <path
                        d={segmento}
                        fill="none"
                        stroke={corSegmento}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={concluido ? '7' : '6'}
                      />
                      <path
                        d={segmento}
                        fill="none"
                        stroke={
                          concluido
                            ? 'rgb(var(--color-bg-deep) / 0.62)'
                            : 'rgb(255 255 255 / 0.16)'
                        }
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        strokeDasharray="2 16"
                      />
                    </g>
                  )
                })}

                {dias.map((dia, index) => (
                  <DiaNodeSvg
                    key={dia.nome}
                    dia={dia}
                    index={index}
                    onStart={iniciarQuiz}
                  />
                ))}

                {diaAtual && (
                  <ComecarBubble ponto={diaAtual.ponto} onStart={iniciarQuiz} />
                )}
              </motion.svg>
            </div>
          </div>
        </section>
      </main>
    </PageTransition>
  )
}

function DiaNodeSvg({
  dia,
  index,
  onStart,
}: {
  dia: DiaTrilha
  index: number
  onStart: () => void
}) {
  const isAtual = dia.status === 'atual'
  const isConcluido = dia.status === 'concluido'
  const isBloqueado = dia.status === 'bloqueado'
  const raio = 36
  const fill = isAtual
    ? 'url(#trilha-no-atual-gradiente)'
    : isConcluido
      ? 'rgb(var(--color-bg-deep))'
      : 'rgb(var(--color-bg-card))'
  const stroke = isAtual
    ? 'rgb(var(--color-accent) / 0.9)'
    : isConcluido
      ? 'rgb(var(--color-orange) / 0.72)'
      : 'rgb(var(--color-primary) / 0.38)'
  const textFill = isAtual
    ? 'rgb(var(--color-bg-deep))'
    : isConcluido
      ? 'rgb(var(--color-orange))'
      : 'rgb(var(--color-lavender) / 0.58)'

  return (
    <motion.g
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      className={isAtual ? 'cursor-pointer' : ''}
      role={isAtual ? 'button' : 'img'}
      tabIndex={isAtual ? 0 : undefined}
      aria-label={`${dia.nome}: ${
        isAtual
          ? 'quiz disponível'
          : isConcluido
            ? 'quiz concluído'
            : 'quiz bloqueado'
      }`}
      onClick={isAtual ? onStart : undefined}
      onKeyDown={event => {
        if (!isAtual) return
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onStart()
        }
      }}
    >
      {isAtual && (
        <circle
          cx={dia.ponto.x}
          cy={dia.ponto.y}
          r="52"
          fill="rgb(var(--color-orange) / 0.14)"
        />
      )}
      <circle
        cx={dia.ponto.x}
        cy={dia.ponto.y}
        r={raio + 2}
        fill="rgb(var(--color-bg-base))"
      />
      <circle
        cx={dia.ponto.x}
        cy={dia.ponto.y}
        r={raio + 7}
        fill="none"
        stroke={
          isAtual
            ? 'rgb(var(--color-orange) / 0.2)'
            : 'rgb(var(--color-primary) / 0.12)'
        }
        strokeWidth="2"
      />
      <circle
        cx={dia.ponto.x}
        cy={dia.ponto.y}
        r={raio}
        fill={fill}
        stroke={stroke}
        strokeWidth={isAtual ? 4 : 3}
        opacity={isBloqueado ? 0.92 : 1}
      />
      <circle
        cx={dia.ponto.x}
        cy={dia.ponto.y}
        r={raio - 12}
        fill="none"
        stroke={
          isBloqueado
            ? 'rgb(var(--color-primary) / 0.18)'
            : 'rgb(255 255 255 / 0.14)'
        }
        strokeWidth="1"
      />
      <text
        x={dia.ponto.x}
        y={dia.ponto.y + 5}
        textAnchor="middle"
        className="select-none text-sm font-black sm:text-base"
        fill={textFill}
      >
        {dia.nome}
      </text>
    </motion.g>
  )
}

function ComecarBubble({
  ponto,
  onStart,
}: {
  ponto: DiaTrilha['ponto']
  onStart: () => void
}) {
  return (
    <motion.g
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.18, duration: 0.24 }}
      className="cursor-pointer"
      role="button"
      tabIndex={0}
      aria-label="Começar quiz de hoje"
      onClick={onStart}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onStart()
        }
      }}
    >
      <g transform={`translate(${ponto.x - 67} ${ponto.y - 98})`}>
        <rect
          width="134"
          height="38"
          rx="8"
          fill="rgb(var(--color-bg-card))"
          stroke="url(#trilha-ativa-gradiente)"
          strokeWidth="1.5"
        />
        <path
          d="M 60 37 L 74 37 L 67 47 Z"
          fill="rgb(var(--color-bg-card))"
          stroke="url(#trilha-ativa-gradiente)"
          strokeWidth="1.5"
        />
        <path d="M 24 12 L 24 26 L 36 19 Z" fill="rgb(var(--color-orange))" />
        <text
          x="47"
          y="24"
          className="select-none text-sm font-black uppercase"
          fill="rgb(var(--color-accent))"
        >
          Começar
        </text>
      </g>
    </motion.g>
  )
}
