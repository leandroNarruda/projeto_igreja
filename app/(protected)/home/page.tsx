import { getServerSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/Card'

export default async function HomePage() {
  const session = await getServerSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <Card>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Bem-vindo, {session.user?.name || session.user?.email}!
          </h1>
          <p className="text-gray-600 mb-6">
            Você está autenticado e pode acessar esta página protegida.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="font-semibold text-blue-900 mb-2">
              Informações da Sessão:
            </h2>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                <strong>Email:</strong> {session.user?.email}
              </li>
              <li>
                <strong>Nome:</strong> {session.user?.name || 'Não informado'}
              </li>
              <li>
                <strong>ID:</strong> {session.user?.id}
              </li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  )
}

