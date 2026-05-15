'use client'

import { useEffect, useState } from 'react'

interface Props {
  isOpen: boolean
  nivel: number
  nomeNivel: string
  emojiNivel: string
  gradient: string
  onContinuar: () => void
}

interface Particula {
  id: number
  x: number
  delay: number
  duration: number
  color: string
  size: number
}

const CORES = [
  'bg-yellow-300',
  'bg-amber-400',
  'bg-pink-400',
  'bg-purple-400',
  'bg-blue-400',
  'bg-green-400',
  'bg-red-400',
  'bg-cyan-400',
]

function gerarParticulas(n: number): Particula[] {
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 1.2,
    duration: 1.8 + Math.random() * 1.4,
    color: CORES[Math.floor(Math.random() * CORES.length)],
    size: 6 + Math.floor(Math.random() * 8),
  }))
}

export function NivelConquistadoModal({
  isOpen,
  nivel,
  nomeNivel,
  emojiNivel,
  gradient,
  onContinuar,
}: Props) {
  const [particulas] = useState<Particula[]>(() => gerarParticulas(40))
  const [visivel, setVisivel] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      const t = setTimeout(() => setVisivel(true), 50)
      return () => clearTimeout(t)
    } else {
      document.body.style.overflow = ''
      setVisivel(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden">
      {/* Fundo escuro */}
      <div
        className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-500 ${visivel ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Partículas de confetti */}
      {particulas.map(p => (
        <span
          key={p.id}
          className={`absolute top-0 rounded-sm ${p.color} opacity-0`}
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            animation: `chefao-confetti ${p.duration}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}

      {/* Card central */}
      <div
        className={`relative z-10 flex flex-col items-center gap-6 p-10 rounded-3xl shadow-2xl max-w-sm w-full mx-4 bg-gradient-to-br ${gradient} text-white transition-all duration-700 ${visivel ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
      >
        {/* Brilho de fundo */}
        <div className="absolute inset-0 rounded-3xl bg-white/10 pointer-events-none" />

        {/* Emoji com pulso */}
        <div
          className={`text-7xl drop-shadow-lg transition-all duration-700 delay-300 ${visivel ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}
          style={{
            animation: visivel ? 'chefao-pulse 1s 0.8s ease-out' : 'none',
          }}
        >
          {emojiNivel}
        </div>

        <div
          className={`flex flex-col items-center gap-2 transition-all duration-700 delay-500 ${visivel ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-white/70">
            Nível conquistado!
          </p>
          <p className="text-4xl font-extrabold text-white drop-shadow">
            Nível {nivel}
          </p>
          <p className="text-2xl font-bold text-white/90">{nomeNivel}</p>
        </div>

        <p
          className={`text-center text-white/80 text-sm leading-relaxed transition-all duration-700 delay-700 ${visivel ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          Você venceu o Chefão e avançou de nível! Continue crescendo no
          conhecimento da Palavra.
        </p>

        <button
          onClick={onContinuar}
          className={`w-full py-3 px-6 rounded-xl bg-white/20 hover:bg-white/30 active:bg-white/10 border border-white/30 font-bold text-white text-lg shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] delay-1000 ${visivel ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          Continuar 🙌
        </button>
      </div>

      <style>{`
        @keyframes chefao-confetti {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes chefao-pulse {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.3); }
          70%  { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
