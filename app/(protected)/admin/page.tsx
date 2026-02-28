'use client'

import Link from 'next/link'
import { ClipboardList, Users } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { PageTransition } from '@/components/layout/PageTransition'

export default function AdminPage() {
  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-8rem)] bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Administração
          </h1>
          <div className="grid gap-6 sm:grid-cols-2">
            <Link href="/admin/quiz" className="block">
              <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                <div className="flex flex-col items-center text-center p-6">
                  <ClipboardList className="w-12 h-12 text-blue-600 mb-3" />
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">
                    Gerenciar quizzes
                  </h2>
                  <p className="text-sm text-gray-600">
                    Criar, editar e gerenciar quizzes e perguntas
                  </p>
                </div>
              </Card>
            </Link>
            <Link href="/admin/usuarios" className="block">
              <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                <div className="flex flex-col items-center text-center p-6">
                  <Users className="w-12 h-12 text-blue-600 mb-3" />
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">
                    Gerenciar usuários
                  </h2>
                  <p className="text-sm text-gray-600">
                    Listar e editar usuários da aplicação
                  </p>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
