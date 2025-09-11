import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { videoId, urlHeygen } = await request.json()

    if (!videoId || !urlHeygen) {
      return NextResponse.json({ error: 'videoId y urlHeygen son requeridos' }, { status: 400 })
    }

    // Actualizar el video con la URL de HeyGen
    const videoActualizado = await prisma.video.update({
      where: { id: videoId },
      data: {
        urlHeygen,
        estado: 'video_agregado'
      }
    })

    // Log del workflow
    await prisma.workflowLog.create({
      data: {
        videoId,
        accion: 'heygen_video_added',
        detalles: { urlHeygen }
      }
    })

    return NextResponse.json({ 
      success: true, 
      video: videoActualizado,
      message: 'Video de HeyGen agregado exitosamente'
    })

  } catch (error) {
    console.error('Error en add-video:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}