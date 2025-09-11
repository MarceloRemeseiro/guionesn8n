import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id: videoId } = await params

    // Verificar que el video existe y está programado
    const video = await prisma.video.findUnique({
      where: { id: videoId }
    })

    if (!video) {
      return NextResponse.json({ error: 'Video no encontrado' }, { status: 404 })
    }

    if (video.estado !== 'programado') {
      return NextResponse.json({ 
        error: 'El video no está programado' 
      }, { status: 400 })
    }

    // Cambiar estado a "aprobado" y limpiar fecha programada
    const updatedVideo = await prisma.video.update({
      where: { id: videoId },
      data: {
        estado: 'aprobado',
        programadoPara: null
      }
    })

    // Log de cancelación de programación
    await prisma.workflowLog.create({
      data: {
        videoId,
        accion: 'schedule_cancelled',
        detalles: {
          fechaProgramadaAnterior: video.programadoPara,
          canceladoPor: session.user?.email,
          estadoAnterior: 'programado'
        }
      }
    })

    console.log('❌ Programación cancelada para video:', videoId)

    return NextResponse.json({
      success: true,
      message: 'Programación cancelada exitosamente',
      video: updatedVideo
    })

  } catch (error) {
    console.error('❌ Error cancelando programación:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}