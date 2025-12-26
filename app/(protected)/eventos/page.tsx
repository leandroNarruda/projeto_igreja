import { getServerSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function EventosPage() {
  const session = await getServerSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Eventos
          </h1>
          <p className="text-gray-600 mb-6">
            Aqui você encontrará todos os eventos da igreja.
          </p>

          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Evento em Breve
              </h2>
              <p className="text-gray-600">
                Em breve você poderá ver e gerenciar os eventos aqui.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

