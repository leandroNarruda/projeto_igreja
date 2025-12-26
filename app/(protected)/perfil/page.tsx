import { getServerSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function PerfilPage() {
  const session = await getServerSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Perfil</h1>

          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Informações Pessoais
              </h2>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-600">Nome:</span>
                  <p className="text-gray-900 font-medium">
                    {session.user?.name}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Email:</span>
                  <p className="text-gray-900 font-medium">
                    {session.user?.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Configurações
              </h2>
              <p className="text-gray-600">
                Em breve você poderá gerenciar suas configurações aqui.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
