'use client'

import { LoginForm } from '@/components/auth/LoginForm'
import Image from 'next/image'
import { PageTransition } from '@/components/layout/PageTransition'
import { AuthBackground } from '@/components/auth/AuthBackground'

export default function LoginPage() {
  return (
    <PageTransition>
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-bg-base py-12 px-4 sm:px-6 lg:px-8">
        <AuthBackground />
        <div className="mb-8 drop-shadow-[0_0_30px_rgba(126,86,134,0.5)]">
          <Image
            src="/images/logos/logo-bom-de-licao-full.png"
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
