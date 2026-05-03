'use client'

import { useRef, useState } from 'react'
import { Upload, CheckCircle, AlertCircle, FileJson } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { PageTransition } from '@/components/layout/PageTransition'

type ErroVersinho = {
  index: number
  erros: string[]
}

type ImportResult = {
  inseridos: number
  erros: ErroVersinho[]
}

export default function VersinhosAdminPage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [preview, setPreview] = useState<number | null>(null)
  const [rawData, setRawData] = useState<unknown[] | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [loading, setLoading] = useState(false)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setResult(null)
    setParseError(null)

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string)
        if (!Array.isArray(parsed)) {
          setParseError('O arquivo deve conter um array JSON de versinhos.')
          setRawData(null)
          setPreview(null)
          return
        }
        setRawData(parsed)
        setPreview(parsed.length)
        setParseError(null)
      } catch {
        setParseError('Arquivo inválido. Certifique-se de que é um JSON bem formatado.')
        setRawData(null)
        setPreview(null)
      }
    }
    reader.readAsText(file)
  }

  async function handleImport() {
    if (!rawData) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/versinhos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rawData),
      })
      const data = await res.json()
      if (!res.ok) {
        setParseError(data.error ?? 'Erro ao importar.')
      } else {
        setResult(data as ImportResult)
        setRawData(null)
        setPreview(null)
        setFileName(null)
        if (inputRef.current) inputRef.current.value = ''
      }
    } catch {
      setParseError('Erro de rede ao importar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-8rem)] bg-bg-base py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-accent mb-2">Versinhos</h1>
          <p className="text-lavender mb-8">
            Importe um arquivo JSON para popular o banco de versinhos bíblicos.
          </p>

          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold text-accent mb-4">Formato esperado</h2>
            <pre className="text-xs bg-bg-surface rounded p-3 overflow-x-auto text-lavender">
{`[
  {
    "verso": "João 3:16",
    "alternativaA": "Texto da alternativa A",
    "alternativaB": "Texto da alternativa B",
    "alternativaC": "Texto da alternativa C",
    "alternativaD": "Texto da alternativa D",
    "alternativaE": "Texto da alternativa E",
    "respostaCorreta": "A",
    "ranking": 1
  }
]`}
            </pre>
          </Card>

          <Card className="p-6">
            <label
              className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-primary/40 rounded-lg p-8 cursor-pointer hover:border-primary transition-colors"
              htmlFor="json-upload"
            >
              <FileJson className="w-10 h-10 text-primary" />
              <span className="text-accent font-medium">
                {fileName ? fileName : 'Selecionar arquivo JSON'}
              </span>
              <span className="text-xs text-lavender">Clique para escolher ou arraste o arquivo</span>
              <input
                ref={inputRef}
                id="json-upload"
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            {parseError && (
              <div className="mt-4 flex items-start gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{parseError}</span>
              </div>
            )}

            {preview !== null && !parseError && (
              <div className="mt-4 flex items-center gap-2 text-green-400 text-sm">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{preview} versinho(s) encontrado(s) no arquivo.</span>
              </div>
            )}

            <button
              onClick={handleImport}
              disabled={!rawData || loading}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-primary text-white font-semibold py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
            >
              <Upload className="w-4 h-4" />
              {loading ? 'Importando…' : 'Importar versinhos'}
            </button>
          </Card>

          {result && (
            <Card className="p-6 mt-6">
              <h2 className="text-lg font-semibold text-accent mb-3">Resultado da importação</h2>
              <div className="flex items-center gap-2 text-green-400 mb-3">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">{result.inseridos} versinho(s) inserido(s) com sucesso.</span>
              </div>
              {result.erros.length > 0 && (
                <div>
                  <p className="text-sm text-red-400 font-medium mb-2">
                    {result.erros.length} registro(s) com erro:
                  </p>
                  <ul className="space-y-1">
                    {result.erros.map((e) => (
                      <li key={e.index} className="text-xs text-lavender">
                        <span className="text-red-400 font-medium">Linha {e.index + 1}:</span>{' '}
                        {e.erros.join(', ')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
