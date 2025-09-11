import * as cron from 'node-cron'
import { prisma } from '@/lib/prisma'

// Variable para controlar que solo se ejecute una instancia
let schedulerStarted = false

export function startScheduler() {
  if (schedulerStarted) {
    console.log('📅 Scheduler ya está ejecutándose')
    return
  }

  console.log('📅 Iniciando scheduler de videos programados...')
  schedulerStarted = true

  // Ejecutar cada minuto para verificar videos programados
  cron.schedule('* * * * *', async () => {
    try {
      await checkScheduledVideos()
    } catch (error) {
      console.error('❌ Error en scheduler:', error)
    }
  }, {
    scheduled: true,
    timezone: "America/Mexico_City" // Ajusta según tu zona horaria
  })

  console.log('✅ Scheduler iniciado - verificando cada minuto')
}

async function checkScheduledVideos() {
  const now = new Date()
  
  // Buscar videos programados que ya deberían publicarse
  const videosToPublish = await prisma.video.findMany({
    where: {
      estado: 'programado',
      programadoPara: {
        lte: now // Fecha programada <= ahora
      }
    },
    include: {
      prompt: true
    }
  })

  if (videosToPublish.length === 0) {
    // Solo mostrar log cada 10 minutos para no saturar
    if (now.getMinutes() % 10 === 0) {
      console.log('📅 Verificando videos programados... (ninguno pendiente)')
    }
    return
  }

  console.log(`🚀 Encontrados ${videosToPublish.length} videos programados para publicar`)

  for (const video of videosToPublish) {
    try {
      await publishScheduledVideo(video)
    } catch (error) {
      console.error(`❌ Error publicando video programado ${video.id}:`, error)
      
      // Marcar como error si falla la publicación
      await prisma.video.update({
        where: { id: video.id },
        data: { estado: 'error' }
      })

      // Log del error
      await prisma.workflowLog.create({
        data: {
          videoId: video.id,
          accion: 'scheduled_publication_failed',
          detalles: {
            error: error instanceof Error ? error.message : 'Error desconocido',
            fechaProgramada: video.programadoPara,
            intentoPublicacion: new Date().toISOString()
          }
        }
      })
    }
  }
}

async function publishScheduledVideo(video: any) {
  console.log(`📺 Publicando video programado: ${video.titulo || video.id}`)

  // Verificar que el video sigue en estado programado (evitar race conditions)
  const currentVideo = await prisma.video.findUnique({
    where: { id: video.id }
  })

  if (!currentVideo || currentVideo.estado !== 'programado') {
    console.log(`⚠️ Video ${video.id} ya no está en estado programado (${currentVideo?.estado}), saltando...`)
    return
  }

  if (!video.urlVideo) {
    throw new Error('Video no tiene URL para publicar')
  }

  // Obtener la URL base desde las variables de entorno o usar puerto por defecto
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001'
  
  // Llamar al endpoint INTERNO específico para publicaciones programadas (sin auth)
  const response = await fetch(`${baseUrl}/api/internal/publish-scheduled`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      videoId: video.id,
      videoUrl: video.urlVideo
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`Error en publicación: ${errorData.error || response.statusText}`)
  }

  const result = await response.json()
  console.log(`✅ Video ${video.id} enviado para publicación programada`)

  // Log de publicación programada exitosa
  await prisma.workflowLog.create({
    data: {
      videoId: video.id,
      accion: 'scheduled_publication_triggered',
      detalles: {
        fechaProgramada: video.programadoPara,
        fechaEjecucion: new Date().toISOString(),
        videoUrl: video.urlVideo,
        titulo: video.titulo
      }
    }
  })

  return result
}

export function stopScheduler() {
  if (schedulerStarted) {
    console.log('🛑 Deteniendo scheduler...')
    cron.destroy()
    schedulerStarted = false
  }
}