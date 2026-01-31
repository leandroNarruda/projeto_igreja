import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { put, del } from '@vercel/blob'
import sharp from 'sharp'

const MAX_FILE_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const AVATAR_SIZE = 256

export async function POST(request: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('avatar') ?? formData.get('file')

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado. Use o campo "avatar" ou "file".' },
        { status: 400 }
      )
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: 'Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.',
        },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Tamanho máximo: 5 MB.' },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const inputBuffer = Buffer.from(arrayBuffer)

    const processedBuffer = await sharp(inputBuffer)
      .resize(AVATAR_SIZE, AVATAR_SIZE, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toBuffer()

    const pathname = `avatars/${session.user.id}-${Date.now()}.jpg`
    const blob = await put(pathname, processedBuffer, {
      access: 'public',
      addRandomSuffix: true,
      contentType: 'image/jpeg',
    })

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { avatar_url: true },
    })

    if (
      currentUser?.avatar_url &&
      currentUser.avatar_url.includes('blob.vercel-storage.com')
    ) {
      try {
        await del(currentUser.avatar_url)
      } catch (delError) {
        console.warn('[API] Erro ao remover avatar antigo do Blob:', delError)
      }
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar_url: blob.url },
    })

    return NextResponse.json({ avatarUrl: blob.url }, { status: 200 })
  } catch (error) {
    console.error('[API] Erro ao fazer upload do avatar:', error)
    return NextResponse.json(
      { error: 'Erro ao fazer upload do avatar. Tente novamente.' },
      { status: 500 }
    )
  }
}
