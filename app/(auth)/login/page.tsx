'use client'

import { LoginForm } from '@/components/auth/LoginForm'
import Image from 'next/image'
import { PageTransition } from '@/components/layout/PageTransition'

export default function LoginPage() {
  return (
    <PageTransition>
      <div
        className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
        style={{
          backgroundImage: 'url(/images/backgrounds/background_1.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="mb-8">
          <Image
            src="/images/logos/logo_512.png"
            alt="Logo"
            width={200}
            height={200}
            className="object-contain"
            priority
          />
        </div>
        <LoginForm />
      </div>
    </PageTransition>
  )
}
