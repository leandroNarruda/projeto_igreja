'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface SocialNameModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const SocialNameModal: React.FC<SocialNameModalProps> = ({
  isOpen,
  onSuccess,
}) => {
  const [socialName, setSocialName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const trimmed = socialName.trim()
    if (trimmed === '') {
      setError('Digite como você quer ser chamado.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/user/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ social_name: trimmed }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Erro ao salvar. Tente novamente.')
        setLoading(false)
        return
      }
      onSuccess()
    } catch {
      setError('Erro ao salvar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-75 z-[9999]"
            aria-hidden
          />
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full relative overflow-hidden"
              onClick={e => e.stopPropagation()}
              role="dialog"
              aria-labelledby="social-name-title"
              aria-modal="true"
            >
              <form onSubmit={handleSubmit} className="p-6">
                <h2
                  id="social-name-title"
                  className="text-2xl font-bold text-gray-900 mb-2 text-center"
                >
                  Como você quer ser chamado?
                </h2>
                <p className="text-gray-600 mb-6 text-center">
                  Digite o nome que preferir para aparecer na aplicação.
                </p>
                <div className="mb-4">
                  <Input
                    label="Nome social"
                    type="text"
                    value={socialName}
                    onChange={e => setSocialName(e.target.value)}
                    placeholder="Ex.: Maria, João"
                    disabled={loading}
                    autoFocus
                    maxLength={100}
                  />
                </div>
                {error && (
                  <p className="text-red-600 text-sm mb-4 text-center">
                    {error}
                  </p>
                )}
                <Button
                  type="submit"
                  className="w-full py-2.5"
                  disabled={loading || socialName.trim() === ''}
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </Button>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
