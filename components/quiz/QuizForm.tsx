'use client'

import React, { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface QuizFormProps {
  onSubmit: (tema: string) => Promise<void>
  onCancel?: () => void
}

export const QuizForm: React.FC<QuizFormProps> = ({ onSubmit, onCancel }) => {
  const [tema, setTema] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!tema.trim()) {
      setError('Tema é obrigatório')
      return
    }

    setLoading(true)
    try {
      await onSubmit(tema.trim())
      setTema('')
    } catch (err) {
      setError('Erro ao criar quiz')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <h3 className="text-xl font-bold text-gray-900 mb-4">Criar Novo Quiz</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <Input
            label="Tema do Quiz"
            value={tema}
            onChange={e => setTema(e.target.value)}
            placeholder="Ex: Conhecimentos Bíblicos"
            error={error}
            disabled={loading}
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Criando...' : 'Criar Quiz'}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </Card>
  )
}
