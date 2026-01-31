'use client'

import Image from 'next/image'

interface LoadingProps {
  text?: string
  fullScreen?: boolean
}

export const Loading = ({ text, fullScreen = true }: LoadingProps) => {
  const containerClasses = fullScreen
    ? 'min-h-[calc(100vh-8rem)] bg-gray-50 flex items-center justify-center'
    : 'flex items-center justify-center py-8'

  // Criar 12 bolinhas posicionadas em círculo (arredondado para evitar mismatch servidor/cliente)
  const round2 = (n: number) => Math.round(n * 100) / 100
  const dots = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 360) / 12
    const radius = 80 // Distância do centro
    const x = round2(Math.cos((angle * Math.PI) / 180) * radius)
    const y = round2(Math.sin((angle * Math.PI) / 180) * radius)

    return {
      id: i,
      x,
      y,
      className: `loading-dot loading-dot-${i}`,
    }
  })

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative w-48 h-48 flex items-center justify-center">
          {/* Círculo girando ao redor */}
          <div className="absolute inset-0 animate-orbit">
            <svg
              className="w-full h-full"
              viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.6"
              />
              <defs>
                <linearGradient
                  id="gradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
                  <stop offset="50%" stopColor="#8b5cf6" stopOpacity="1" />
                  <stop offset="100%" stopColor="#ec4899" stopOpacity="1" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Bolinhas animadas */}
          {dots.map(dot => (
            <div
              key={dot.id}
              className={`absolute ${dot.className}`}
              style={{
                left: `calc(50% + ${dot.x}px)`,
                top: `calc(50% + ${dot.y}px)`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-lg" />
            </div>
          ))}

          {/* Logo centralizada e estática */}
          <div className="relative z-10">
            <Image
              src="/images/logos/logo_192.png"
              alt="Logo"
              width={120}
              height={120}
              className="w-24 h-24"
            />
          </div>
        </div>
        {text && <p className="text-gray-600 text-lg font-medium">{text}</p>}
      </div>
    </div>
  )
}
