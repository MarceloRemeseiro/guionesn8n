import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { videoId, urlYoutube, urlLinkedin, urlTwitter } = await request.json()

    if (!videoId) {
      return NextResponse.json({ error: 'videoId es requerido' }, { status: 400 })
    }

    // Actualizar el video con las URLs de publicación
    const videoActualizado = await prisma.video.update({
      where: { id: videoId },
      data: {
        urlYoutube,
        urlLinkedin,
        urlTwitter,
        estado: 'publicado',
        publicadoEn: new Date()
      }
    })

    // Log del workflow
    await prisma.workflowLog.create({
      data: {
        videoId,
        accion: 'video_published',
        detalles: { 
          urlYoutube, 
          urlLinkedin, 
          urlTwitter,
          publishedAt: new Date()
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      video: videoActualizado,
      message: 'Video publicado exitosamente en todas las redes sociales'
    })

  } catch (error) {
    console.error('Error en published:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}