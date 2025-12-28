'use client'

import React, { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'

interface PerguntaFormProps {
  quizId: number
  onSubmit: (data: {
    enunciado: string
    alternativaA: string
    alternativaB: string
    alternativaC: string
    alternativaD: string
    alternativaE: string
    respostaCorreta: string
    tempoSegundos: number
  }) => Promise<void>
  onCancel?: () => void
}

export const PerguntaForm: React.FC<PerguntaFormProps> = ({
  quizId,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    enunciado: '',
    alternativaA: '',
    alternativaB: '',
    alternativaC: '',
    alternativaD: '',
    alternativaE: '',
    respostaCorreta: '',
    tempoSegundos: 30,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.enunciado.trim()) {
      setError('Enunciado é obrigatório')
      return
    }

    if (
      !formData.alternativaA.trim() ||
      !formData.alternativaB.trim() ||
      !formData.alternativaC.trim() ||
      !formData.alternativaD.trim() ||
      !formData.alternativaE.trim()
    ) {
      setError('Todas as 5 alternativas são obrigatórias')
      return
    }

    if (!['A', 'B', 'C', 'D', 'E'].includes(formData.respostaCorreta)) {
      setError('Selecione a resposta correta')
      return
    }

    if (formData.tempoSegundos < 1) {
      setError('Tempo deve ser maior que 0')
      return
    }

    setLoading(true)
    try {
      await onSubmit(formData)
      setFormData({
        enunciado: '',
        alternativaA: '',
        alternativaB: '',
        alternativaC: '',
        alternativaD: '',
        alternativaE: '',
        respostaCorreta: '',
        tempoSegundos: 30,
      })
      setError('')
    } catch (err) {
      setError('Erro ao criar pergunta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        Adicionar Pergunta
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <Input
            label="Enunciado da Pergunta"
            value={formData.enunciado}
            onChange={e =>
              setFormData({ ...formData, enunciado: e.target.value })
            }
            placeholder="Digite a pergunta aqui..."
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input
            label="Alternativa A"
            value={formData.alternativaA}
            onChange={e =>
              setFormData({ ...formData, alternativaA: e.target.value })
            }
            placeholder="Alternativa A"
            disabled={loading}
          />
          <Input
            label="Alternativa B"
            value={formData.alternativaB}
            onChange={e =>
              setFormData({ ...formData, alternativaB: e.target.value })
            }
            placeholder="Alternativa B"
            disabled={loading}
          />
          <Input
            label="Alternativa C"
            value={formData.alternativaC}
            onChange={e =>
              setFormData({ ...formData, alternativaC: e.target.value })
            }
            placeholder="Alternativa C"
            disabled={loading}
          />
          <Input
            label="Alternativa D"
            value={formData.alternativaD}
            onChange={e =>
              setFormData({ ...formData, alternativaD: e.target.value })
            }
            placeholder="Alternativa D"
            disabled={loading}
          />
          <Input
            label="Alternativa E"
            value={formData.alternativaE}
            onChange={e =>
              setFormData({ ...formData, alternativaE: e.target.value })
            }
            placeholder="Alternativa E"
            disabled={loading}
          />
        </div>

        <div className="mb-4">
          <Select
            label="Resposta Correta"
            value={formData.respostaCorreta}
            onChange={e =>
              setFormData({ ...formData, respostaCorreta: e.target.value })
            }
            options={[
              { value: 'A', label: 'A' },
              { value: 'B', label: 'B' },
              { value: 'C', label: 'C' },
              { value: 'D', label: 'D' },
              { value: 'E', label: 'E' },
            ]}
            placeholder="Selecione..."
            disabled={loading}
          />
        </div>

        <div className="mb-4">
          <Input
            label="Tempo para responder (segundos)"
            type="number"
            min="1"
            value={formData.tempoSegundos}
            onChange={e =>
              setFormData({
                ...formData,
                tempoSegundos: parseInt(e.target.value) || 30,
              })
            }
            disabled={loading}
          />
        </div>

        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

        <div className="flex gap-2">
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Adicionando...' : 'Adicionar Pergunta'}
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
