import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { videoId, videoUrl, scheduledDateTime } = await request.json()

    if (!videoId || !videoUrl || !scheduledDateTime) {
      return NextResponse.json({ 
        error: 'videoId, videoUrl y scheduledDateTime son requeridos' 
      }, { status: 400 })
    }

    // Validar que la fecha programada sea en el futuro
    const scheduledDate = new Date(scheduledDateTime)
    const now = new Date()
    
    if (scheduledDate <= now) {
      return NextResponse.json({ 
        error: 'La fecha programada debe ser en el futuro' 
      }, { status: 400 })
    }

    // Verificar que el video existe
    const video = await prisma.video.findUnique({
      where: { id: videoId }
    })

    if (!video) {
      return NextResponse.json({ error: 'Video no encontrado' }, { status: 404 })
    }

    // Verificar que el video está en estado apropiado para programar
    const programmableStates = ['aprobado', 'borrador']
    if (!programmableStates.includes(video.estado)) {
      return NextResponse.json({ 
        error: 'El video no puede ser programado en su estado actual' 
      }, { status: 400 })
    }

    // Actualizar video a estado "programado"
    const updatedVideo = await prisma.video.update({
      where: { id: videoId },
      data: {
        estado: 'programado',
        urlVideo: videoUrl,
        programadoPara: scheduledDate
      }
    })

    // Log de programación
    await prisma.workflowLog.create({
      data: {
        videoId,
        accion: 'video_scheduled',
        detalles: {
          scheduledDateTime: scheduledDateTime,
          videoUrl: videoUrl,
          estadoAnterior: video.estado,
          programadoPor: session.user?.email
        }
      }
    })

    console.log('📅 Video programado exitosamente:', {
      videoId,
      scheduledDateTime,
      videoUrl: !!videoUrl
    })

    // Aquí podrías agregar lógica para enviar la programación a n8n
    // Por ejemplo, crear un scheduled job o webhook delayed
    
    return NextResponse.json({
      success: true,
      message: 'Video programado exitosamente',
      video: updatedVideo,
      scheduledFor: scheduledDate.toISOString()
    })

  } catch (error) {
    console.error('❌ Error programando video:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}