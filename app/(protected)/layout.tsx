'use client'

import { useSession } from 'next-auth/react'
import { ReactNode } from 'react'
import { SocialNameModal } from '@/components/ui/SocialNameModal'

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { data: session, status, update } = useSession()

  const shouldShowSocialNameModal =
    status === 'authenticated' &&
    session?.user &&
    (!session.user.socialName || session.user.socialName.trim() === '')

  const handleSocialNameSuccess = () => {
    update()
  }

  return (
    <>
      {children}
      <SocialNameModal
        isOpen={!!shouldShowSocialNameModal}
        onClose={() => {}}
        onSuccess={handleSocialNameSuccess}
      />
    </>
  )
}
