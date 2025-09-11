import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id: videoId } = await params
    const body = await request.json()

    const { titulo, tema, guion, textoLinkedin, tweet, descripcion } = body

    // Verificar que el video existe
    const video = await prisma.video.findUnique({
      where: { id: videoId }
    })

    if (!video) {
      return NextResponse.json({ error: 'Video no encontrado' }, { status: 404 })
    }

    // Actualizar el video
    const videoActualizado = await prisma.video.update({
      where: { id: videoId },
      data: {
        titulo: titulo || null,
        tema: tema || null,
        guion: guion || null,
        textoLinkedin: textoLinkedin || null,
        tweet: tweet || null,
        descripcion: descripcion || null,
        // Mantener el estado actual
      }
    })

    // Log de la actualización
    await prisma.workflowLog.create({
      data: {
        videoId,
        accion: 'content_updated',
        detalles: {
          titulo: !!titulo,
          tema: !!tema,
          guion: !!guion,
          textoLinkedin: !!textoLinkedin,
          tweet: !!tweet,
          descripcion: !!descripcion,
          updatedAt: new Date().toISOString()
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      video: videoActualizado,
      message: 'Contenido actualizado exitosamente'
    })

  } catch (error) {
    console.error('Error actualizando contenido:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}