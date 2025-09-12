import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 CALLBACK RECIBIDO - Headers:', Object.fromEntries(request.headers.entries()))
    console.log('🔔 CALLBACK RECIBIDO - URL:', request.url)
    
    const payload = await request.json()
    console.log('🔔 CALLBACK RECIBIDO - Payload:', JSON.stringify(payload, null, 2))

    // Manejar diferentes formatos de entrada
    const videoId = payload.videoId || payload.body?.videoId
    const success = payload.success !== false // default true
    const content = payload.content || payload
    const error = payload.error
    const metadata = payload.metadata || {}

    console.log('🔍 Datos extraídos:', { videoId, success, content: !!content })

    if (!videoId) {
      console.error('❌ VideoId no encontrado en payload')
      return NextResponse.json({ error: 'videoId es requerido' }, { status: 400 })
    }

    if (!success) {
      // Manejo de error: actualizar video con estado de error
      const videoConError = await prisma.video.update({
        where: { id: videoId },
        data: {
          estado: 'error',
          titulo: 'Error al generar contenido'
        }
      })

      // Log del error
      await prisma.workflowLog.create({
        data: {
          videoId,
          accion: 'content_generation_failed',
          detalles: { 
            error: error || 'Error desconocido',
            metadata: metadata || {}
          }
        }
      })

      return NextResponse.json({ 
        success: false, 
        message: 'Error procesado',
        video: videoConError
      })
    }

    // Manejo de éxito: actualizar video con contenido generado
    const { titulo, tema, guion, textoLinkedin, tweet, descripcion } = content || {}

    if (!titulo || !tema || !guion) {
      throw new Error('Contenido generado incompleto')
    }

    const videoActualizado = await prisma.video.update({
      where: { id: videoId },
      data: {
        titulo,
        tema,
        guion,
        textoLinkedin: textoLinkedin || '',
        tweet: tweet || '',
        descripcion: descripcion || '',
        estado: 'borrador' // Listo para revisar y editar
      }
    })

    // Log del éxito
    await prisma.workflowLog.create({
      data: {
        videoId,
        accion: 'content_generated_success',
        detalles: { 
          titulo, 
          tema,
          promptUsed: metadata?.promptUsed || '',
          temasEvitados: metadata?.temasEvitados || [],
          totalTemasAnteriores: metadata?.totalTemasAnteriores || 0
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      video: videoActualizado,
      message: 'Contenido generado exitosamente'
    })

  } catch (error) {
    console.error('Error en content-generated:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}