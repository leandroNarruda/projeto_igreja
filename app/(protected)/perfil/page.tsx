'use client'

import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useCallback } from 'react'
import { PageTransition } from '@/components/layout/PageTransition'
import { Camera, LogOut, RotateCw } from 'lucide-react'
import Cropper from 'react-easy-crop'
import type { Area, Point } from 'react-easy-crop'

function getInitials(name: string | null | undefined): string {
  if (!name || !name.trim()) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

async function createCroppedImage(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<File> {
  const image = await createImageElement(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  const maxSize = Math.max(image.width, image.height)
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2))

  canvas.width = safeArea
  canvas.height = safeArea

  ctx.translate(safeArea / 2, safeArea / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.translate(-safeArea / 2, -safeArea / 2)

  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  )

  const data = ctx.getImageData(0, 0, safeArea, safeArea)

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  )

  return new Promise(resolve => {
    canvas.toBlob(blob => {
      if (blob) {
        const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
        resolve(file)
      }
    }, 'image/jpeg')
  })
}

function createImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', error => reject(error))
    image.src = url
  })
}

export default function PerfilPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)

  // Estados do cropper
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const handleLogout = async () => {
    try {
      await signOut({
        redirect: false,
        callbackUrl: '/login',
      })
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      router.push('/login')
      router.refresh()
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setRotation(0)
    setCroppedAreaPixels(null)

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setIsEditorOpen(true)

    e.target.value = ''
  }

  const handleCancelEditor = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setRotation(0)
    setCroppedAreaPixels(null)
    setIsEditorOpen(false)
  }

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels)
    },
    []
  )

  const handleUpload = async () => {
    if (!previewUrl || !croppedAreaPixels) return

    setError(null)
    setUploading(true)

    try {
      const croppedFile = await createCroppedImage(
        previewUrl,
        croppedAreaPixels,
        rotation
      )

      const formData = new FormData()
      formData.append('avatar', croppedFile)

      const res = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data.error || 'Erro ao enviar foto. Tente novamente.')
        return
      }

      await update()
      handleCancelEditor()
    } catch {
      setError('Erro ao enviar foto. Tente novamente.')
    } finally {
      setUploading(false)
    }
  }

  if (status === 'loading' || !session) {
    return null
  }

  const initials = getInitials(session.user?.name)

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-8rem)] bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Perfil</h1>

            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  Informações Pessoais
                </h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {session.user?.image ? (
                        <img
                          src={session.user.image}
                          alt="Avatar"
                          className="h-24 w-24 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div
                          className="h-24 w-24 rounded-full bg-gray-200 border-2 border-gray-200 flex items-center justify-center text-2xl font-semibold text-gray-600"
                          aria-hidden
                        >
                          {initials}
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleAvatarChange}
                        disabled={uploading}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="absolute bottom-0 right-0 rounded-full bg-gray-800 text-white p-1.5 shadow hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Alterar foto"
                      >
                        <Camera className="h-4 w-4" />
                      </button>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Foto de perfil
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                      >
                        {uploading ? 'Enviando…' : 'Alterar foto'}
                      </button>
                    </div>
                  </div>
                  {error && (
                    <p className="text-sm text-red-600" role="alert">
                      {error}
                    </p>
                  )}
                </div>
                <div className="mt-4 space-y-2">
                  <div>
                    <span className="text-sm text-gray-600">Nome:</span>
                    <p className="text-gray-900 font-medium">
                      {session.user?.name}
                    </p>
                  </div>
                  {session.user?.socialName && (
                    <div>
                      <span className="text-sm text-gray-600">
                        Como quer ser chamado:
                      </span>
                      <p className="text-gray-900 font-medium">
                        {session.user.socialName}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-gray-600">Email:</span>
                    <p className="text-gray-900 font-medium">
                      {session.user?.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  Configurações
                </h2>
                <p className="text-gray-600 mb-4">
                  Em breve você poderá gerenciar suas configurações aqui.
                </p>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                >
                  <LogOut className="h-5 w-5" />
                  Sair da conta
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de edição de foto - Estilo WhatsApp */}
      {isEditorOpen && previewUrl && (
        <div className="fixed inset-0 z-[100] bg-black">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 px-4 py-3 bg-gradient-to-b from-black/60 to-transparent">
            <h3 className="text-white text-lg font-medium text-center">
              Mover e redimensionar
            </h3>
          </div>

          {/* Cropper Area */}
          <div className="absolute inset-0">
            <Cropper
              image={previewUrl}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          {/* Rotate Button */}
          <div className="absolute top-16 right-4 z-10">
            <button
              type="button"
              onClick={handleRotate}
              disabled={uploading}
              className="p-3 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors disabled:opacity-50"
              title="Girar 90°"
            >
              <RotateCw className="h-6 w-6" />
            </button>
          </div>

          {/* Zoom Slider */}
          <div className="absolute bottom-24 left-0 right-0 z-10 px-8">
            <div className="flex items-center gap-4 max-w-md mx-auto">
              <span className="text-white text-sm">-</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={e => setZoom(Number(e.target.value))}
                disabled={uploading}
                className="flex-1 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              />
              <span className="text-white text-sm">+</span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="absolute bottom-0 left-0 right-0 z-10 px-6 py-6 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
              <button
                type="button"
                onClick={handleCancelEditor}
                disabled={uploading}
                className="px-8 py-3 text-white font-semibold text-lg hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold text-lg rounded-lg transition-colors disabled:opacity-50 shadow-lg"
              >
                {uploading ? 'Enviando…' : 'Escolher'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  )
}
