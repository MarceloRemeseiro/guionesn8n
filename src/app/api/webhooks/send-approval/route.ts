import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { videoId } = await request.json()

    if (!videoId) {
      return NextResponse.json({ error: 'videoId es requerido' }, { status: 400 })
    }

    // Obtener el video con su contenido
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: { prompt: true }
    })

    if (!video) {
      return NextResponse.json({ error: 'Video no encontrado' }, { status: 404 })
    }

    // Actualizar estado
    await prisma.video.update({
      where: { id: videoId },
      data: { estado: 'esperando_aprobacion' }
    })

    // Preparar datos para n8n (envío de email)
    const n8nPayload = {
      videoId: video.id,
      titulo: video.titulo,
      tema: video.tema,
      guion: video.guion,
      textoLinkedin: video.textoLinkedin,
      tweet: video.tweet,
      descripcion: video.descripcion,
      approveUrl: `${process.env.NEXTAUTH_URL}/api/webhooks/approve-content?videoId=${videoId}&action=approve`,
      rejectUrl: `${process.env.NEXTAUTH_URL}/api/webhooks/approve-content?videoId=${videoId}&action=reject`
    }

    // Enviar a n8n para que envíe el email
    const n8nResponse = await fetch(`${process.env.N8N_BASE_URL}${process.env.N8N_WEBHOOK_SEND_APPROVAL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(n8nPayload)
    })

    if (!n8nResponse.ok) {
      throw new Error('Error al enviar email de aprobación')
    }

    // Log del workflow
    await prisma.workflowLog.create({
      data: {
        videoId,
        accion: 'approval_email_sent',
        detalles: { titulo: video.titulo }
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Email de aprobación enviado'
    })

  } catch (error) {
    console.error('Error en send-approval:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}