'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/Card'

export default function DebugPage() {
  const { data: session } = useSession()
  const [middlewareInfo, setMiddlewareInfo] = useState<any>(null)
  const [apiInfo, setApiInfo] = useState<any>(null)

  useEffect(() => {
    // Buscar informações da API de quiz
    fetch('/api/quiz')
      .then(r => r.json())
      .then(data => {
        setApiInfo(data)
      })
      .catch(err => {
        setApiInfo({ error: err.message })
      })

    // Buscar informações do middleware
    fetch('/api/debug/middleware')
      .then(r => r.json())
      .then(data => {
        setMiddlewareInfo(data)
      })
      .catch(err => {
        setMiddlewareInfo({ error: err.message })
      })
  }, [])

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card className="mb-6">
          <h1 className="text-2xl font-bold mb-4">
            Debug - Informações da Sessão
          </h1>

          <div className="space-y-4">
            <div>
              <h2 className="font-semibold mb-2">Sessão (Client-side):</h2>
              <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>

            <div>
              <h2 className="font-semibold mb-2">Role:</h2>
              <p className="text-lg">
                <span className="font-bold">Role atual:</span>{' '}
                <span
                  className={
                    session?.user?.role === 'ADMIN'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }
                >
                  {session?.user?.role || 'N/A'}
                </span>
              </p>
              <p className="text-sm text-gray-600 mt-2">
                É Admin? {session?.user?.role === 'ADMIN' ? '✅ SIM' : '❌ NÃO'}
              </p>
            </div>

            <div>
              <h2 className="font-semibold mb-2">
                Informações do Middleware (Token JWT):
              </h2>
              <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(middlewareInfo, null, 2)}
              </pre>
            </div>

            <div>
              <h2 className="font-semibold mb-2">Resposta da API /api/quiz:</h2>
              <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(apiInfo, null, 2)}
              </pre>
            </div>

            <div>
              <h2 className="font-semibold mb-2">Cookies:</h2>
              <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                {typeof document !== 'undefined' ? document.cookie : 'N/A'}
              </pre>
            </div>

            <div>
              <h2 className="font-semibold mb-2">URL Atual:</h2>
              <p className="text-sm">
                {typeof window !== 'undefined' ? window.location.href : 'N/A'}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
