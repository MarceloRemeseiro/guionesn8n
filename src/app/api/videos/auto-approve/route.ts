import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { videoId } = await request.json()

    if (!videoId) {
      return NextResponse.json({ error: 'videoId es requerido' }, { status: 400 })
    }

    // Obtener el video
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: { prompt: true }
    })

    if (!video) {
      return NextResponse.json({ error: 'Video no encontrado' }, { status: 404 })
    }

    // Verificar que el video esté en estado borrador
    if (video.estado !== 'borrador') {
      return NextResponse.json({
        error: 'Solo se pueden aprobar videos en estado borrador'
      }, { status: 400 })
    }

    // Actualizar el estado del video a aprobado
    const updatedVideo = await prisma.video.update({
      where: { id: videoId },
      data: {
        estado: 'aprobado',
        aprobadoEn: new Date()
      },
      include: {
        prompt: true
      }
    })

    // Log del workflow
    await prisma.workflowLog.create({
      data: {
        videoId,
        accion: 'auto_approved',
        detalles: {
          titulo: video.titulo,
          usuarioAprobador: session.user.email,
          fechaAprobacion: new Date().toISOString()
        }
      }
    })

    return NextResponse.json({
      success: true,
      video: updatedVideo,
      message: 'Video aprobado automáticamente'
    })

  } catch (error) {
    console.error('Error en auto-approve:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}