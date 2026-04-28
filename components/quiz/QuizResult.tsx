'use client'

import React from 'react'
import { CheckCircle2, XCircle, Sparkles, ListChecks } from 'lucide-react'

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
  const isHigh = porcentagem >= 80
  const isMid = porcentagem >= 60 && porcentagem < 80

  const gradient = isHigh
    ? 'from-emerald-400 via-teal-400 to-cyan-500'
    : isMid
      ? 'from-amber-400 via-orange-400 to-pink-500'
      : 'from-rose-400 via-fuchsia-500 to-indigo-500'

  const barGradient = isHigh
    ? 'from-emerald-400 to-cyan-500'
    : isMid
      ? 'from-amber-400 to-pink-500'
      : 'from-rose-400 to-fuchsia-500'

  const message = isHigh
    ? 'Excelente! 🎉'
    : isMid
      ? 'Bom trabalho! 👍'
      : 'Continue praticando! 💪'

  return (
    <div className="max-w-2xl mx-auto">
      <div
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} p-1 shadow-2xl`}
      >
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-10 w-56 h-56 bg-white/10 rounded-full blur-3xl" />

        <div className="relative rounded-[1.4rem] bg-white/95 backdrop-blur p-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-fuchsia-100 to-indigo-100 text-indigo-700 text-sm font-semibold mb-4">
            <Sparkles className="size-4" />
            Resultado do Quiz
          </div>

          <div
            className={`text-7xl md:text-8xl font-black mb-2 bg-gradient-to-br ${gradient} bg-clip-text text-transparent leading-none tracking-tight`}
          >
            {porcentagem}%
          </div>
          <p className="text-lg font-semibold text-slate-700 mb-8">{message}</p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 p-4 shadow-sm">
              <ListChecks className="size-5 text-slate-600 mx-auto mb-1" />
              <div className="text-3xl font-black text-slate-800">{total}</div>
              <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mt-1">
                Total
              </div>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100 border border-emerald-200 p-4 shadow-sm">
              <CheckCircle2 className="size-5 text-emerald-600 mx-auto mb-1" />
              <div className="text-3xl font-black text-emerald-700">
                {acertos}
              </div>
              <div className="text-xs uppercase tracking-wider font-semibold text-emerald-700/70 mt-1">
                Acertos
              </div>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-pink-100 border border-rose-200 p-4 shadow-sm">
              <XCircle className="size-5 text-rose-600 mx-auto mb-1" />
              <div className="text-3xl font-black text-rose-700">{erros}</div>
              <div className="text-xs uppercase tracking-wider font-semibold text-rose-700/70 mt-1">
                Erros
              </div>
            </div>
          </div>

          <div className="relative w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${barGradient} transition-all duration-700 shadow-[0_0_12px_rgba(0,0,0,0.15)]`}
              style={{ width: `${porcentagem}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
