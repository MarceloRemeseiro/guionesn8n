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
    const { scheduledDateTime } = await request.json()

    if (!scheduledDateTime) {
      return NextResponse.json({ 
        error: 'scheduledDateTime es requerido' 
      }, { status: 400 })
    }

    // Validar que la fecha programada sea en el futuro
    const newScheduledDate = new Date(scheduledDateTime)
    const now = new Date()
    
    if (newScheduledDate <= now) {
      return NextResponse.json({ 
        error: 'La nueva fecha programada debe ser en el futuro' 
      }, { status: 400 })
    }

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

    // Actualizar fecha programada
    const updatedVideo = await prisma.video.update({
      where: { id: videoId },
      data: {
        programadoPara: newScheduledDate
      }
    })

    // Log de reprogramación
    await prisma.workflowLog.create({
      data: {
        videoId,
        accion: 'video_rescheduled',
        detalles: {
          fechaProgramadaAnterior: video.programadoPara,
          nuevaFechaProgramada: scheduledDateTime,
          reprogramadoPor: session.user?.email
        }
      }
    })

    console.log('📅 Video reprogramado exitosamente:', {
      videoId,
      oldDate: video.programadoPara,
      newDate: scheduledDateTime
    })

    return NextResponse.json({
      success: true,
      message: 'Video reprogramado exitosamente',
      video: updatedVideo,
      newScheduledFor: newScheduledDate.toISOString()
    })

  } catch (error) {
    console.error('❌ Error reprogramando video:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}