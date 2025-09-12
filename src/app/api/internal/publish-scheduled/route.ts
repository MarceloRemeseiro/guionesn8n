import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const N8N_WEBHOOK_URL = `${process.env.N8N_BASE_URL}${process.env.N8N_WEBHOOK_PUBLISH_VIDEO}`

export async function POST(request: NextRequest) {
  try {
    const { videoId, videoUrl } = await request.json()
    
    console.log('🔍 Host:', request.headers.get('host'), 'User-Agent:', request.headers.get('user-agent'))

    console.log('🤖 PUBLICACIÓN PROGRAMADA INTERNA iniciada para video:', videoId)
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

    // Verificar que el video esté en estado 'programado'
    if (video.estado !== 'programado') {
      return NextResponse.json({ 
        error: `Video no está en estado programado. Estado actual: ${video.estado}` 
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
        usuarioPublicador: 'sistema-scheduler',
        fechaPublicacion: new Date().toISOString(),
        esPublicacionProgramada: true,
        fechaProgramadaOriginal: video.programadoPara
      },
      callbackUrl: `${process.env.NEXTAUTH_URL}/api/webhooks/publicacion-response`
    }

    console.log('📤 Enviando a n8n desde scheduler:')
    console.log('   🔗 Webhook:', N8N_WEBHOOK_URL)
    console.log('   🎥 Video ID:', video.id)
    console.log('   📝 Título:', video.titulo)
    console.log('   🔗 URL Video:', videoUrl)
    console.log('   🤖 Publicador: sistema-scheduler')
    console.log('   🎯 Configuración BLOTATO: Manejada por n8n')
    console.log('')
    console.log('📦 Payload simplificado:', JSON.stringify(publishPayload, null, 2))

    // Validar que el JSON sea válido antes de enviar
    let jsonBody: string
    try {
      jsonBody = JSON.stringify(publishPayload)
      // Verificar que se puede parsear de vuelta
      JSON.parse(jsonBody)
      console.log('✅ JSON válido, enviando a n8n...')
    } catch (jsonError) {
      console.error('❌ Error creando JSON válido:', jsonError)
      throw new Error(`JSON inválido: ${jsonError}`)
    }

    // Enviar a n8n
    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: jsonBody
    })

    if (!n8nResponse.ok) {
      console.error('❌ Error en n8n:', n8nResponse.status, await n8nResponse.text())
      
      // Revertir el estado del video si falla
      await prisma.video.update({
        where: { id: videoId },
        data: { 
          estado: 'programado',
          urlVideo: null,
          programadoPara: video.programadoPara,
          publicadoEn: null
        }
      })
      
      throw new Error(`Error en n8n: ${n8nResponse.status}`)
    }

    console.log('✅ Video programado enviado exitosamente a n8n para publicación')

    // Log de la publicación programada
    await prisma.workflowLog.create({
      data: {
        videoId,
        accion: 'scheduled_video_sent_for_publication',
        detalles: {
          videoUrl: videoUrl,
          n8nStatus: n8nResponse.status,
          enviadoEn: new Date().toISOString(),
          publicadorEmail: 'sistema-scheduler',
          plataformas: ['instagram', 'youtube', 'tiktok', 'twitter', 'linkedin'],
          esPublicacionProgramada: true,
          fechaProgramadaOriginal: video.programadoPara
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Video programado enviado para publicación en redes sociales',
      videoId: video.id,
      videoUrl: videoUrl,
      status: 'publicado',
      wasScheduled: true,
      plataformas: ['Instagram', 'YouTube', 'TikTok', 'Twitter/X', 'LinkedIn']
    })

  } catch (error) {
    console.error('❌ Error en publicación programada interna:', error)
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}