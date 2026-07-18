'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  ListChecks,
  MessageCircle,
  Share2,
  X,
} from 'lucide-react'

interface QuizResultProps {
  total: number
  acertos: number
  erros: number
  porcentagem: number
  showShareToast?: boolean
}

const QUIZ_SHARE_URL =
  'https://projeto-igreja-git-main-leandroarrudas-projects.vercel.app/'

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ')
  let line = ''
  let currentY = y

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, currentY)
      line = word
      currentY += lineHeight
    } else {
      line = testLine
    }
  }

  ctx.fillText(line, x, currentY)
}

function getCssRgb(variableName: string, fallback: string) {
  if (typeof window === 'undefined') return fallback

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim()

  return value ? `rgb(${value})` : fallback
}

function isMobileShareTarget() {
  if (typeof navigator === 'undefined') return false

  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

export const QuizResult: React.FC<QuizResultProps> = ({
  total,
  acertos,
  erros,
  porcentagem,
  showShareToast = false,
}) => {
  const { data: session } = useSession()
  const [isSharing, setIsSharing] = useState(false)
  const [shareToastOpen, setShareToastOpen] = useState(false)
  const [shareToastVisible, setShareToastVisible] = useState(false)
  const [shareFallbackMessage, setShareFallbackMessage] = useState<
    string | null
  >(null)
  const isHigh = porcentagem >= 80
  const isMid = porcentagem >= 60 && porcentagem < 80

  const gradient = isHigh
    ? 'from-emerald-400 via-teal-400 to-cyan-500'
    : isMid
      ? 'from-amber-400 via-orange-400 to-pink-500'
      : 'from-rose-400 via-fuchsia-500 to-indigo-500'

  const barGradient = isHigh
    ? 'from-emerald-400 to-cyan-500'
    : isMid
      ? 'from-amber-400 to-pink-500'
      : 'from-rose-400 to-fuchsia-500'

  const message = isHigh
    ? 'Excelente! 🎉'
    : isMid
      ? 'Bom trabalho! 👍'
      : 'Continue praticando! 💪'

  const playerName =
    session?.user?.socialName || session?.user?.name || 'Alguém da igreja'

  useEffect(() => {
    if (!showShareToast) return

    setShareToastOpen(true)
    const frameId = requestAnimationFrame(() => setShareToastVisible(true))

    return () => cancelAnimationFrame(frameId)
  }, [showShareToast])

  async function createResultImage() {
    const canvas = document.createElement('canvas')
    canvas.width = 1080
    canvas.height = 1350

    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    const bgBase = getCssRgb('--color-bg-base', '#120a14')
    const bgCard = getCssRgb('--color-bg-card', '#1a0d22')
    const accent = getCssRgb('--color-accent', '#e8f9a2')
    const lavender = getCssRgb('--color-lavender', '#a5aad9')
    const primary = getCssRgb('--color-primary', '#7e5686')
    const success = getCssRgb('--color-success', '#4ade80')
    const danger = getCssRgb('--color-danger', '#ba3c3d')

    const background = ctx.createLinearGradient(0, 0, 1080, 1350)
    background.addColorStop(0, bgBase)
    background.addColorStop(0.48, bgCard)
    background.addColorStop(1, '#24122f')
    ctx.fillStyle = background
    ctx.fillRect(0, 0, 1080, 1350)

    ctx.globalAlpha = 0.28
    ctx.fillStyle = primary
    ctx.beginPath()
    ctx.arc(900, 90, 260, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = success
    ctx.beginPath()
    ctx.arc(120, 1220, 300, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1

    drawRoundedRect(ctx, 70, 80, 940, 1190, 52)
    const cardGradient = ctx.createLinearGradient(70, 80, 1010, 1270)
    cardGradient.addColorStop(0, 'rgba(255,255,255,0.12)')
    cardGradient.addColorStop(1, 'rgba(255,255,255,0.04)')
    ctx.fillStyle = cardGradient
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.20)'
    ctx.lineWidth = 3
    ctx.stroke()

    ctx.fillStyle = accent
    ctx.font = '800 44px Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('BOM DE LICAO', 540, 175)

    ctx.fillStyle = lavender
    ctx.font = '700 30px Arial, sans-serif'
    ctx.fillText('QUIZ DA SEMANA', 540, 225)

    ctx.fillStyle = 'rgba(255,255,255,0.10)'
    drawRoundedRect(ctx, 150, 300, 780, 390, 44)
    ctx.fill()

    const scoreGradient = ctx.createLinearGradient(240, 360, 840, 640)
    scoreGradient.addColorStop(0, isHigh ? success : isMid ? '#f8a13f' : danger)
    scoreGradient.addColorStop(
      1,
      isHigh ? '#22d3ee' : isMid ? '#ec4899' : '#a855f7'
    )
    ctx.fillStyle = scoreGradient
    ctx.font = '900 210px Arial, sans-serif'
    ctx.fillText(`${porcentagem}%`, 540, 555)

    ctx.fillStyle = accent
    ctx.font = '800 40px Arial, sans-serif'
    drawWrappedText(
      ctx,
      message.replace(/[🎉👍💪]/g, '').trim(),
      540,
      635,
      700,
      48
    )

    const statY = 760
    const stats = [
      { label: 'TOTAL', value: total, color: lavender },
      { label: 'ACERTOS', value: acertos, color: success },
      { label: 'ERROS', value: erros, color: danger },
    ]

    stats.forEach((stat, index) => {
      const x = 130 + index * 275
      drawRoundedRect(ctx, x, statY, 245, 160, 30)
      ctx.fillStyle = 'rgba(255,255,255,0.09)'
      ctx.fill()
      ctx.fillStyle = stat.color
      ctx.font = '900 58px Arial, sans-serif'
      ctx.fillText(String(stat.value), x + 122.5, statY + 76)
      ctx.fillStyle = lavender
      ctx.font = '800 24px Arial, sans-serif'
      ctx.fillText(stat.label, x + 122.5, statY + 118)
    })

    ctx.fillStyle = accent
    ctx.font = '900 40px Arial, sans-serif'
    drawWrappedText(ctx, `Resultado de ${playerName}`, 540, 1000, 700, 50)

    ctx.fillStyle = success
    ctx.font = '900 30px Arial, sans-serif'
    ctx.fillText('Faça o quiz da semana você também', 540, 1128)

    ctx.fillStyle = lavender
    ctx.font = '700 24px Arial, sans-serif'
    ctx.fillText(QUIZ_SHARE_URL.replace(/^https?:\/\//, ''), 540, 1178)

    return new Promise<Blob | null>(resolve => {
      canvas.toBlob(blob => resolve(blob), 'image/png', 0.95)
    })
  }

  function downloadImage(blob: Blob) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'resultado-quiz-bom-de-licao.png'
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  async function handleShareImage() {
    setIsSharing(true)
    setShareFallbackMessage(null)

    try {
      const blob = await createResultImage()
      if (!blob) return

      const file = new File([blob], 'resultado-quiz-bom-de-licao.png', {
        type: 'image/png',
      })

      if (isMobileShareTarget() && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
        })
        closeShareToast()
        return
      }

      downloadImage(blob)
      setShareFallbackMessage(
        'Arte baixada. Agora anexe a imagem no WhatsApp Web.'
      )
      closeShareToast()
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        setShareFallbackMessage(
          'Não consegui preparar a arte. Tente de novo em instantes.'
        )
      }
    } finally {
      setIsSharing(false)
    }
  }

  function closeShareToast() {
    setShareToastVisible(false)
    window.setTimeout(() => setShareToastOpen(false), 200)
  }

  const shareButton = (
    <button
      type="button"
      onClick={handleShareImage}
      disabled={isSharing}
      className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-success px-4 py-2 text-sm font-black text-bg-deep shadow-md shadow-success/20 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-success focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70"
    >
      <MessageCircle className="size-4" />
      {isSharing ? 'Preparando...' : 'Compartilhar resultado'}
    </button>
  )

  return (
    <div className="max-w-2xl mx-auto">
      {shareToastOpen && (
        <div
          className={`fixed left-1/2 top-20 z-[80] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 transition-all duration-300 ease-out ${
            shareToastVisible
              ? 'translate-y-0 opacity-100'
              : '-translate-y-8 opacity-0'
          }`}
        >
          <div className="relative overflow-hidden rounded-xl border border-success/35 bg-bg-card p-4 pr-11 text-left shadow-2xl shadow-black/35 ring-1 ring-white/10">
            <button
              type="button"
              onClick={closeShareToast}
              aria-label="Fechar"
              className="absolute right-3 top-3 rounded-full p-1 text-lavender transition hover:bg-white/10 hover:text-accent focus:outline-none focus:ring-2 focus:ring-success"
            >
              <X className="size-4" />
            </button>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-success/15 p-2 text-success">
                <Share2 className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-accent">
                  Compartilhe seu resultado
                </p>
                <p className="mt-1 text-xs font-medium leading-relaxed text-lavender">
                  Convide seus amigos para tentar bater seus {porcentagem}%.
                </p>
                <button
                  type="button"
                  onClick={handleShareImage}
                  disabled={isSharing}
                  className="mt-3 inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-success px-4 py-2 text-sm font-black text-bg-deep shadow-md shadow-success/20 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-success disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <MessageCircle className="size-4" />
                  {isSharing ? 'Preparando...' : 'Compartilhar agora'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} p-1 shadow-2xl`}
      >
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-10 w-56 h-56 bg-white/10 rounded-full blur-3xl" />

        <div className="relative rounded-[1.4rem] bg-white/95 backdrop-blur p-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-fuchsia-100 to-indigo-100 text-indigo-700 text-sm font-semibold mb-4">
            <Sparkles className="size-4" />
            Resultado do Quiz
          </div>

          <div
            className={`text-7xl md:text-8xl font-black mb-2 bg-gradient-to-br ${gradient} bg-clip-text text-transparent leading-none tracking-tight`}
          >
            {porcentagem}%
          </div>
          <p className="text-lg font-semibold text-slate-700 mb-8">{message}</p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 p-4 shadow-sm">
              <ListChecks className="size-5 text-slate-600 mx-auto mb-1" />
              <div className="text-3xl font-black text-slate-800">{total}</div>
              <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mt-1">
                Total
              </div>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100 border border-emerald-200 p-4 shadow-sm">
              <CheckCircle2 className="size-5 text-emerald-600 mx-auto mb-1" />
              <div className="text-3xl font-black text-emerald-700">
                {acertos}
              </div>
              <div className="text-xs uppercase tracking-wider font-semibold text-emerald-700/70 mt-1">
                Acertos
              </div>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-pink-100 border border-rose-200 p-4 shadow-sm">
              <XCircle className="size-5 text-rose-600 mx-auto mb-1" />
              <div className="text-3xl font-black text-rose-700">{erros}</div>
              <div className="text-xs uppercase tracking-wider font-semibold text-rose-700/70 mt-1">
                Erros
              </div>
            </div>
          </div>

          <div className="relative w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${barGradient} transition-all duration-700 shadow-[0_0_12px_rgba(0,0,0,0.15)]`}
              style={{ width: `${porcentagem}%` }}
            />
          </div>

          <div className="mt-6 flex flex-col items-center gap-2">
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                <Share2 className="size-3.5" />
                Desafie seus amigos
              </span>
              {shareButton}
            </div>
            {shareFallbackMessage && (
              <p className="text-xs font-semibold text-success">
                {shareFallbackMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
