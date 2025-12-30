'use client'

import { RegisterForm } from '@/components/auth/RegisterForm'
import { PageTransition } from '@/components/layout/PageTransition'
import Image from 'next/image'

export default function CadastroPage() {
  return (
    <PageTransition>
      <div
        className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-0 px-4 sm:px-6 lg:px-8"
        style={{
          backgroundImage: 'url(/images/backgrounds/background_2.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'top',
        }}
      >
        <div>
          <Image
            src="/images/logos/logo_192.png"
            alt="Logo"
            width={170}
            height={100}
            className="object-contain"
            priority
          />
        </div>
        <RegisterForm />
      </div>
    </PageTransition>
  )
}
