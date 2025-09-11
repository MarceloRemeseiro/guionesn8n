import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 RESPUESTA DE APROBACIÓN RECIBIDA - Headers:', Object.fromEntries(request.headers.entries()))
    console.log('🔔 RESPUESTA DE APROBACIÓN RECIBIDA - URL:', request.url)
    
    const payload = await request.json()
    console.log('🔔 RESPUESTA DE APROBACIÓN RECIBIDA - Payload:', JSON.stringify(payload, null, 2))

    // Extraer datos del payload (manejar diferentes formatos)
    let videoId = payload.videoId || payload.body?.videoId
    let aprobado = payload.aprobado !== false && payload.approved !== false // default true si no se especifica
    let comentarios = payload.comentarios || payload.comments || payload.feedback || ''
    let aprobadoPor = payload.aprobadoPor || payload.approvedBy || 'reviewer@streamingpro.com'
    let fechaRespuesta = payload.fechaRespuesta || new Date().toISOString()

    console.log('🔍 Datos extraídos de aprobación:', { 
      videoId, 
      aprobado, 
      comentarios: !!comentarios,
      aprobadoPor 
    })

    if (!videoId) {
      console.error('❌ VideoId no encontrado en payload de aprobación')
      return NextResponse.json({ error: 'videoId es requerido' }, { status: 400 })
    }

    // Verificar que el video existe y está en estado correcto
    const video = await prisma.video.findUnique({
      where: { id: videoId }
    })

    if (!video) {
      console.error('❌ Video no encontrado:', videoId)
      return NextResponse.json({ error: 'Video no encontrado' }, { status: 404 })
    }

    if (video.estado !== 'esperando_aprobacion') {
      console.warn('⚠️ Video no está en estado de esperando aprobación:', video.estado)
      // Continuamos el procesamiento pero logeamos la advertencia
    }

    if (aprobado) {
      // APROBADO: Actualizar video a estado 'aprobado'
      const videoActualizado = await prisma.video.update({
        where: { id: videoId },
        data: {
          estado: 'aprobado',
          // Guardar información de aprobación en campos adicionales si están disponibles
          // Podrías agregar campos como fechaAprobacion, aprobadoPor, etc.
        }
      })

      // Log de aprobación exitosa
      await prisma.workflowLog.create({
        data: {
          videoId,
          accion: 'content_approved',
          detalles: {
            aprobadoPor,
            fechaAprobacion: fechaRespuesta,
            comentarios: comentarios || 'Sin comentarios',
            estadoAnterior: video.estado
          }
        }
      })

      console.log('✅ Video aprobado exitosamente:', videoId)

      return NextResponse.json({
        success: true,
        message: 'Video aprobado exitosamente',
        video: videoActualizado,
        status: 'aprobado'
      })

    } else {
      // RECHAZADO: Actualizar video de vuelta a 'borrador' para revisión
      const videoActualizado = await prisma.video.update({
        where: { id: videoId },
        data: {
          estado: 'borrador' // Vuelve a borrador para que pueda ser editado y reenviado
        }
      })

      // Log de rechazo
      await prisma.workflowLog.create({
        data: {
          videoId,
          accion: 'content_rejected',
          detalles: {
            rechazadoPor: aprobadoPor,
            fechaRechazo: fechaRespuesta,
            comentarios: comentarios || 'Sin comentarios de rechazo',
            estadoAnterior: video.estado,
            razon: 'Contenido requiere modificaciones'
          }
        }
      })

      console.log('❌ Video rechazado:', videoId, 'Comentarios:', comentarios)

      return NextResponse.json({
        success: true,
        message: 'Video rechazado, vuelve a estado borrador',
        video: videoActualizado,
        status: 'borrador',
        feedback: comentarios
      })
    }

  } catch (error) {
    console.error('❌ Error procesando respuesta de aprobación:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}