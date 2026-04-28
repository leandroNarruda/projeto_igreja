'use client'

import React, { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface QuizFormProps {
  onSubmit: (data: {
    tema: string
    perguntas: Array<Record<string, unknown>>
  }) => Promise<void>
  onCancel?: () => void
}

export const QuizForm: React.FC<QuizFormProps> = ({ onSubmit, onCancel }) => {
  const [tema, setTema] = useState('')
  const [perguntasJson, setPerguntasJson] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!tema.trim()) {
      setError('Tema é obrigatório')
      return
    }

    let perguntas: Array<Record<string, unknown>> = []

    if (perguntasJson.trim()) {
      try {
        const parsed = JSON.parse(perguntasJson)
        if (!Array.isArray(parsed)) {
          setError('O JSON deve estar no formato de array de perguntas')
          return
        }
        perguntas = parsed as Array<Record<string, unknown>>
      } catch {
        setError('JSON inválido. Verifique a estrutura e tente novamente')
        return
      }
    }

    setLoading(true)
    try {
      await onSubmit({ tema: tema.trim(), perguntas })
      setTema('')
      setPerguntasJson('')
    } catch (err) {
      setError('Erro ao criar quiz')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <h3 className="text-xl font-bold text-accent mb-4">Criar Novo Quiz</h3>
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
        <div className="mb-4">
          <label
            htmlFor="perguntas-json"
            className="block text-sm font-medium text-lavender mb-1"
          >
            Perguntas em JSON (opcional)
          </label>
          <textarea
            id="perguntas-json"
            value={perguntasJson}
            onChange={e => setPerguntasJson(e.target.value)}
            placeholder='Cole aqui um array JSON de perguntas: [{"enunciado":"...","alternativaA":"...","alternativaB":"...","alternativaC":"...","alternativaD":"...","alternativaE":"...","respostaCorreta":"A","justificativa":"...","tempoSegundos":30}]'
            disabled={loading}
            rows={10}
            className="w-full rounded-md border border-primary/35 px-3 py-2 text-sm text-accent placeholder:text-lavender/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-primary/10 disabled:cursor-not-allowed"
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
