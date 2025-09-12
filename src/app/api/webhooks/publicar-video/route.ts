import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const N8N_WEBHOOK_URL = `${process.env.N8N_BASE_URL}${process.env.N8N_WEBHOOK_PUBLISH_VIDEO}`

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { videoId, videoUrl, isScheduled } = await request.json()
    console.log(`🚀 PUBLICACIÓN DE VIDEO ${isScheduled ? '(PROGRAMADA)' : '(INMEDIATA)'} iniciada para video:`, videoId)
    console.log('🔗 URL del video:', videoUrl)

    if (!videoId || !videoUrl) {
      return NextResponse.json({ 
        error: 'videoId y videoUrl son requeridos' 
      }, { status: 400 })
    }


    // Buscar el video con su contenido completo
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        prompt: {
          include: {
            categoria: true
          }
        }
      }
    })

    if (!video) {
      return NextResponse.json({ error: 'Video no encontrado' }, { status: 404 })
    }

    // Verificar que el video esté en estado válido para publicar
    const validStates = ['aprobado', 'programado']
    if (!validStates.includes(video.estado)) {
      return NextResponse.json({ 
        error: `Solo se pueden publicar videos aprobados o programados. Estado actual: ${video.estado}` 
      }, { status: 400 })
    }

    // Marcar video como publicado inmediatamente
    await prisma.video.update({
      where: { id: videoId },
      data: { 
        estado: 'publicado',
        urlVideo: videoUrl,
        programadoPara: null,
        publicadoEn: new Date()
      }
    })

    // Limpiar y validar contenido antes de enviar a n8n
    const cleanString = (str: string | null) => {
      if (!str) return ''
      return str
        .replace(/[\r\n\t]+/g, ' ')    // Reemplazar saltos de línea y tabs con espacios
        .replace(/\s+/g, ' ')          // Múltiples espacios → un espacio
        .replace(/"/g, '\\"')          // Escapar comillas dobles
        .replace(/\\/g, '\\\\')        // Escapar backslashes
        .replace(/[\x00-\x1F\x7F]/g, '') // Remover caracteres de control
        .trim()
    }

    // Preparar payload simplificado para n8n (configuración BLOTATO está en n8n)
    const publishPayload = {
      videoId: video.id,
      videoUrl: videoUrl,
      contenido: {
        titulo: cleanString(video.titulo),
        tema: cleanString(video.tema),
        guion: cleanString(video.guion),
        descripcion: cleanString(video.descripcion),
        tweet: cleanString(video.tweet),
        textoLinkedin: cleanString(video.textoLinkedin)
      },
      metadata: {
        promptUsado: video.prompt?.nombre || 'N/A',
        categoria: video.prompt?.categoria?.nombre || 'N/A',
        fechaCreacion: video.creadoEn,
        usuarioPublicador: session.user?.email || 'usuario@streamingpro.com',
        fechaPublicacion: new Date().toISOString(),
        esPublicacionProgramada: !!isScheduled,
        fechaProgramadaOriginal: video.programadoPara
      },
      callbackUrl: `${process.env.NEXTAUTH_URL}/api/webhooks/publicacion-response`
    }

    console.log('📤 Enviando a n8n para publicación en BLOTATO:')
    console.log('   🔗 Webhook:', N8N_WEBHOOK_URL)
    console.log('   🎥 Video ID:', video.id)
    console.log('   📝 Título:', video.titulo)
    console.log('   🔗 URL Video:', videoUrl)
    console.log('   📧 Usuario:', session.user?.email)
    console.log('   🎯 Plataformas: Instagram, YouTube, TikTok, Twitter/X, LinkedIn')
    console.log('')
    console.log('📦 Payload completo:', JSON.stringify(publishPayload, null, 2))

    // Enviar a n8n
    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(publishPayload)
    })

    if (!n8nResponse.ok) {
      console.error('❌ Error en n8n:', n8nResponse.status, await n8nResponse.text())
      
      // Revertir el estado del video si falla
      await prisma.video.update({
        where: { id: videoId },
        data: { 
          estado: video.estado === 'programado' ? 'programado' : 'aprobado',
          urlVideo: null,
          programadoPara: video.programadoPara,
          publicadoEn: null
        }
      })
      
      throw new Error(`Error en n8n: ${n8nResponse.status}`)
    }

    console.log('✅ Enviado exitosamente a n8n para publicación')

    // Log de la publicación
    await prisma.workflowLog.create({
      data: {
        videoId,
        accion: isScheduled ? 'scheduled_video_sent_for_publication' : 'video_sent_for_publication',
        detalles: {
          videoUrl: videoUrl,
          n8nStatus: n8nResponse.status,
          enviadoEn: new Date().toISOString(),
          publicadorEmail: session.user?.email,
          plataformas: ['instagram', 'youtube', 'tiktok', 'twitter', 'linkedin'],
          esPublicacionProgramada: !!isScheduled,
          fechaProgramadaOriginal: video.programadoPara
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: isScheduled ? 'Video programado enviado para publicación en redes sociales' : 'Video enviado para publicación en redes sociales',
      videoId: video.id,
      videoUrl: videoUrl,
      status: 'publicado',
      wasScheduled: !!isScheduled,
      plataformas: ['Instagram', 'YouTube', 'TikTok', 'Twitter/X', 'LinkedIn']
    })

  } catch (error) {
    console.error('❌ Error enviando video para publicación:', error)
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}