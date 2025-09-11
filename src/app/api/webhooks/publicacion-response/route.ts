import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 RESPUESTA DE PUBLICACIÓN RECIBIDA - Headers:', Object.fromEntries(request.headers.entries()))
    console.log('🔔 RESPUESTA DE PUBLICACIÓN RECIBIDA - URL:', request.url)
    
    const payload = await request.json()
    console.log('🔔 RESPUESTA DE PUBLICACIÓN RECIBIDA - Payload:', JSON.stringify(payload, null, 2))

    // Extraer datos del payload
    let videoId = payload.videoId || payload.body?.videoId
    let success = payload.success !== false && payload.publicacionExitosa !== false
    let videoUrl = payload.videoUrl || payload.body?.videoUrl
    let plataformas = payload.plataformas || {}
    let fechaPublicacion = payload.fechaPublicacion || new Date().toISOString()

    console.log('🔍 Datos extraídos de publicación:', { 
      videoId, 
      success, 
      videoUrl: !!videoUrl,
      plataformas 
    })

    if (!videoId) {
      console.error('❌ VideoId no encontrado en payload de publicación')
      return NextResponse.json({ error: 'videoId es requerido' }, { status: 400 })
    }

    // Verificar que el video existe
    const video = await prisma.video.findUnique({
      where: { id: videoId }
    })

    if (!video) {
      console.error('❌ Video no encontrado:', videoId)
      return NextResponse.json({ error: 'Video no encontrado' }, { status: 404 })
    }

    if (success) {
      // ÉXITO: Actualizar video a estado 'publicado'
      const videoActualizado = await prisma.video.update({
        where: { id: videoId },
        data: {
          estado: 'publicado',
          publicadoEn: new Date(fechaPublicacion),
          // Actualizar URLs de las plataformas si están disponibles
          urlYoutube: plataformas.youtube ? videoUrl : video.urlYoutube,
          urlLinkedin: plataformas.linkedin ? videoUrl : video.urlLinkedin,
          urlTwitter: plataformas.twitter ? videoUrl : video.urlTwitter,
        }
      })

      // Log de publicación exitosa
      await prisma.workflowLog.create({
        data: {
          videoId,
          accion: 'video_published_successfully',
          detalles: {
            fechaPublicacion,
            videoUrl,
            plataformasExitosas: plataformas,
            estadoAnterior: video.estado,
            publicacionCompleta: true
          }
        }
      })

      // Limpiar logs del workflow ya que el video se publicó exitosamente
      await prisma.workflowLog.deleteMany({
        where: { videoId }
      })

      console.log('✅ Video publicado exitosamente en todas las redes sociales:', videoId)
      console.log('🧹 Logs del workflow eliminados para:', videoId)

      return NextResponse.json({
        success: true,
        message: 'Video publicado exitosamente en todas las redes sociales',
        video: videoActualizado,
        status: 'publicado',
        plataformas: plataformas
      })

    } else {
      // ERROR: Revertir a estado anterior para poder reintentar
      console.log('❌ Error en publicación, manteniendo estado para reintento:', videoId)

      // Log de error en publicación
      await prisma.workflowLog.create({
        data: {
          videoId,
          accion: 'video_publication_failed',
          detalles: {
            error: payload.error || 'Error desconocido en publicación',
            fechaIntento: fechaPublicacion,
            plataformasIntentadas: plataformas,
            estadoAnterior: video.estado,
            videoUrl: videoUrl
          }
        }
      })

      return NextResponse.json({
        success: false,
        message: 'Error en la publicación, video mantiene estado para reintento',
        videoId: videoId,
        status: 'error'
      })
    }

  } catch (error) {
    console.error('❌ Error procesando respuesta de publicación:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}