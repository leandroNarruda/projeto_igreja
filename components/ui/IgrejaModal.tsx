'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './Button'
import { Input } from './Input'

interface IgrejaModalProps {
  isOpen: boolean
  onConfirm: (igreja: string) => void
  onClose: () => void
  loading?: boolean
}

export const IgrejaModal: React.FC<IgrejaModalProps> = ({
  isOpen,
  onConfirm,
  onClose,
  loading = false,
}) => {
  const [igrejaSelecionada, setIgrejaSelecionada] = useState<
    'Santa Tereza' | 'Outra' | null
  >(null)
  const [outraIgreja, setOutraIgreja] = useState('')
  const [error, setError] = useState('')

  // Resetar estados quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      setIgrejaSelecionada(null)
      setOutraIgreja('')
      setError('')
    }
  }, [isOpen])

  // Prevenir scroll do body quando modal estiver aberto
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

  // Fechar modal com ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleEscape)
    }

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  const handleConfirm = () => {
    setError('')

    if (!igrejaSelecionada) {
      setError('Por favor, selecione uma opção')
      return
    }

    if (igrejaSelecionada === 'Outra' && !outraIgreja.trim()) {
      setError('Por favor, informe o nome da igreja')
      return
    }

    const igrejaFinal =
      igrejaSelecionada === 'Santa Tereza' ? 'Santa Tereza' : outraIgreja.trim()

    onConfirm(igrejaFinal)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                A qual igreja você pertence?
              </h2>

              <div className="space-y-3 mb-4">
                <label
                  className={`
                    flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all
                    ${
                      igrejaSelecionada === 'Santa Tereza'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }
                    ${loading ? 'opacity-60 cursor-not-allowed' : ''}
                  `}
                >
                  <input
                    type="radio"
                    name="igreja"
                    value="Santa Tereza"
                    checked={igrejaSelecionada === 'Santa Tereza'}
                    onChange={() => setIgrejaSelecionada('Santa Tereza')}
                    disabled={loading}
                    className="mr-4 w-5 h-5 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 font-medium">
                    Santa Tereza
                  </span>
                </label>

                <label
                  className={`
                    flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all
                    ${
                      igrejaSelecionada === 'Outra'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }
                    ${loading ? 'opacity-60 cursor-not-allowed' : ''}
                  `}
                >
                  <input
                    type="radio"
                    name="igreja"
                    value="Outra"
                    checked={igrejaSelecionada === 'Outra'}
                    onChange={() => setIgrejaSelecionada('Outra')}
                    disabled={loading}
                    className="mr-4 w-5 h-5 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 font-medium">Outra</span>
                </label>
              </div>

              {igrejaSelecionada === 'Outra' && (
                <div className="mb-4">
                  <Input
                    label="Nome da igreja"
                    type="text"
                    value={outraIgreja}
                    onChange={e => setOutraIgreja(e.target.value)}
                    placeholder="Digite o nome da igreja"
                    disabled={loading}
                    error={error && !outraIgreja.trim() ? error : undefined}
                  />
                </div>
              )}

              {error && igrejaSelecionada !== 'Outra' && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={onClose} disabled={loading}>
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={handleConfirm}
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Confirmar'}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
