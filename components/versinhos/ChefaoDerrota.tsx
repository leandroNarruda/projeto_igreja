'use client'

import { useEffect, useState } from 'react'
import { RotateCcw } from 'lucide-react'

interface Props {
  nivel: number
  onTentarNovamente: () => void
}

export function ChefaoDerrota({ nivel, onTentarNovamente }: Props) {
  const [visivel, setVisivel] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const t = setTimeout(() => setVisivel(true), 50)
    return () => {
      document.body.style.overflow = ''
      clearTimeout(t)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden">
      <div
        className={`absolute inset-0 bg-black/85 backdrop-blur-sm transition-opacity duration-500 ${visivel ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Ondas de choque */}
      {visivel && (
        <>
          <span className="absolute size-32 rounded-full border-2 border-red-500/40 animate-ping" />
          <span
            className="absolute size-48 rounded-full border border-red-500/20 animate-ping"
            style={{ animationDelay: '0.3s' }}
          />
        </>
      )}

      <div
        className={`relative z-10 flex flex-col items-center gap-6 p-10 rounded-3xl shadow-2xl max-w-sm w-full mx-4 bg-gradient-to-br from-gray-900 via-red-950 to-gray-900 border border-red-800/60 text-white transition-all duration-700 ${visivel ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
      >
        {/* Coração partido */}
        <div
          className={`text-6xl transition-all duration-700 delay-200 ${visivel ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
          style={{
            animation: visivel ? 'derrota-shake 0.6s 0.3s ease-out' : 'none',
          }}
        >
          💔
        </div>

        <div
          className={`flex flex-col items-center gap-2 text-center transition-all duration-700 delay-400 ${visivel ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-red-400">
            O Chefão venceu desta vez…
          </p>
          <p className="text-2xl font-bold text-white">Nível {nivel}</p>
          <p className="text-white/70 text-sm leading-relaxed mt-1">
            Seus versinhos estão salvos. Estude mais e tente de novo — você
            consegue!
          </p>
        </div>

        {/* 3 corações perdidos */}
        <div
          className={`flex gap-2 transition-all duration-700 delay-500 ${visivel ? 'opacity-100' : 'opacity-0'}`}
        >
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="text-2xl grayscale opacity-40"
              style={{
                animation: visivel
                  ? `derrota-heart-drop 0.4s ${0.6 + i * 0.15}s ease-out backwards`
                  : 'none',
              }}
            >
              🖤
            </span>
          ))}
        </div>

        <button
          onClick={onTentarNovamente}
          className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-red-700 hover:bg-red-600 active:bg-red-800 font-bold text-white text-base shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] delay-700 ${visivel ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <RotateCcw className="size-4" />
          Tentar novamente
        </button>
      </div>

      <style>{`
        @keyframes derrota-shake {
          0%   { transform: rotate(0deg) scale(1); }
          20%  { transform: rotate(-15deg) scale(1.2); }
          40%  { transform: rotate(15deg) scale(1.1); }
          60%  { transform: rotate(-8deg) scale(1.05); }
          80%  { transform: rotate(5deg) scale(1.02); }
          100% { transform: rotate(0deg) scale(1); }
        }
        @keyframes derrota-heart-drop {
          0%   { transform: translateY(-20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
