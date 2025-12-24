import { getServerSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const session = await getServerSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="h-[calc(100vh-4rem)] bg-gray-50 flex items-center justify-center">
      <div className="max-w-7xl w-full px-4 sm:px-6 lg:px-8 flex justify-center">
        <button
          className="
            relative overflow-hidden
            px-12 py-6
            text-2xl md:text-3xl font-bold text-white
            bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600
            rounded-xl shadow-2xl
            transform transition-all duration-300
            hover:scale-105 hover:shadow-3xl
            animate-pulse
            hover:animate-none
            focus:outline-none focus:ring-4 focus:ring-purple-300 focus:ring-offset-2
          "
        >
          <span className="relative z-10">Responder Quiz da semana</span>
          <div
            className="absolute inset-0 rounded-xl shimmer-effect"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
            }}
          />
        </button>
      </div>
    </div>
  )
}

