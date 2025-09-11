import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const N8N_WEBHOOK_URL = '' + (process.env.N8N_BASE_URL || '') + (process.env.N8N_WEBHOOK_SEND_APPROVAL || '')

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { videoId } = await request.json()
    console.log('🔄 ENVÍO A APROBACIÓN iniciado para video:', videoId)

    if (!videoId) {
      return NextResponse.json({ error: 'videoId es requerido' }, { status: 400 })
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

    // Verificar que el video esté en estado 'borrador'
    if (video.estado !== 'borrador') {
      return NextResponse.json({ 
        error: 'Solo se pueden enviar videos en estado borrador' 
      }, { status: 400 })
    }

    // Actualizar estado del video a 'esperando_aprobacion'
    await prisma.video.update({
      where: { id: videoId },
      data: { estado: 'esperando_aprobacion' }
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

    // Preparar datos completos para enviar a n8n
    const approvalPayload = {
      videoId: video.id,
      contenido: {
        titulo: video.titulo || '',
        tema: video.tema || '',
        guion: video.guion || '',
        textoLinkedin: video.textoLinkedin || '',
        tweet: video.tweet || '',
        descripcion: video.descripcion || ''
      },
      metadata: {
        promptUsado: video.prompt?.nombre || 'N/A',
        categoria: video.prompt?.categoria?.nombre || 'N/A',
        fechaCreacion: video.creadoEn,
        enviadorEmail: session.user?.email || 'usuario@streamingpro.com',
        fechaEnvio: new Date().toISOString(),
        estadoAnterior: video.estado
      },
      callbackUrl: `${process.env.NEXTAUTH_URL}/api/webhooks/approval-response`,
      // Información adicional para el email
      emailData: {
        remitente: session.user?.name || 'Usuario StreamingPro',
        remitenteEmail: session.user?.email || 'usuario@streamingpro.com',
        asunto: `Aprobación Requerida: ${video.titulo || 'Video sin título'}`,
        fechaEnvio: new Date().toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    }

    console.log('📤 Enviando a n8n para aprobación:')
    console.log('   🔗 Webhook:', N8N_WEBHOOK_URL)
    console.log('   🎥 Video ID:', video.id)
    console.log('   📝 Título:', video.titulo)
    console.log('   🎯 Tema:', video.tema)
    console.log('   📄 Guión (longitud):', video.guion?.length || 0, 'caracteres')
    console.log('   🔗 LinkedIn (longitud):', video.textoLinkedin?.length || 0, 'caracteres')
    console.log('   🐦 Tweet (longitud):', video.tweet?.length || 0, 'caracteres')
    console.log('   📖 Descripción (longitud):', video.descripcion?.length || 0, 'caracteres')
    console.log('   📧 Email destinatario:', session.user?.email)
    console.log('   🔄 Callback URL:', `${process.env.NEXTAUTH_URL}/api/webhooks/approval-response`)
    console.log('')
    console.log('📦 Payload completo:', JSON.stringify(approvalPayload, null, 2))

    // Enviar a n8n
    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(approvalPayload)
    })

    if (!n8nResponse.ok) {
      console.error('❌ Error en n8n:', n8nResponse.status, await n8nResponse.text())
      
      // Revertir el estado del video si falla
      await prisma.video.update({
        where: { id: videoId },
        data: { estado: 'borrador' }
      })
      
      throw new Error(`Error en n8n: ${n8nResponse.status}`)
    }

    console.log('✅ Enviado exitosamente a n8n para aprobación')

    // Log del envío
    await prisma.workflowLog.create({
      data: {
        videoId,
        accion: 'sent_for_approval',
        detalles: {
          n8nStatus: n8nResponse.status,
          enviadoEn: new Date().toISOString(),
          enviadorEmail: session.user?.email
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Video enviado para aprobación',
      videoId: video.id,
      status: 'esperando_aprobacion'
    })

  } catch (error) {
    console.error('❌ Error enviando para aprobación:', error)
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}