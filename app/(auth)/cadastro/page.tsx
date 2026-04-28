'use client'

import { RegisterForm } from '@/components/auth/RegisterForm'
import { PageTransition } from '@/components/layout/PageTransition'
import Image from 'next/image'
import { AuthBackground } from '@/components/auth/AuthBackground'

export default function CadastroPage() {
  return (
    <PageTransition>
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-bg-base py-8 px-4 sm:px-6 lg:px-8">
        <AuthBackground />
        <div className="mb-4 drop-shadow-[0_0_30px_rgba(126,86,134,0.5)]">
          <Image
            src="/images/logos/logo-bom-de-licao-full.png"
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
