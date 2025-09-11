import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { videoId } = await request.json()

    if (!videoId) {
      return NextResponse.json({ error: 'videoId es requerido' }, { status: 400 })
    }

    // Obtener el video completo
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: { prompt: true }
    })

    if (!video) {
      return NextResponse.json({ error: 'Video no encontrado' }, { status: 404 })
    }

    if (!video.urlHeygen) {
      return NextResponse.json({ error: 'Video de HeyGen no disponible' }, { status: 400 })
    }

    // Preparar datos para n8n (publicación en redes sociales)
    const n8nPayload = {
      videoId: video.id,
      titulo: video.titulo,
      descripcion: video.descripcion,
      textoLinkedin: video.textoLinkedin,
      tweet: video.tweet,
      urlHeygen: video.urlHeygen,
      webhookUrl: `${process.env.NEXTAUTH_URL}/api/webhooks/published`
    }

    // Enviar a n8n para publicar en redes sociales
    const n8nResponse = await fetch(`${process.env.N8N_BASE_URL}${process.env.N8N_WEBHOOK_PUBLISH_VIDEO}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(n8nPayload)
    })

    if (!n8nResponse.ok) {
      throw new Error('Error al publicar en redes sociales')
    }

    // Log del workflow
    await prisma.workflowLog.create({
      data: {
        videoId,
        accion: 'publish_requested',
        detalles: { titulo: video.titulo }
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Publicación iniciada en redes sociales'
    })

  } catch (error) {
    console.error('Error en publish-video:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}