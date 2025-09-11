import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id: videoId } = await params

    // Verificar que el video existe y está en estado de error
    const video = await prisma.video.findUnique({
      where: { id: videoId }
    })

    if (!video) {
      return NextResponse.json({ error: 'Video no encontrado' }, { status: 404 })
    }

    if (video.estado !== 'error') {
      return NextResponse.json({ 
        error: 'Solo se pueden reintentar videos en estado de error' 
      }, { status: 400 })
    }

    // Determinar a qué estado revertir el video según su contenido
    let nuevoEstado = 'borrador'
    
    // Si tiene contenido generado, es probable que el error fue en publicación
    if (video.titulo && video.guion && video.textoLinkedin) {
      nuevoEstado = 'borrador' // Permitir re-enviar para aprobación
    }

    // Actualizar el estado del video para permitir reintento
    await prisma.video.update({
      where: { id: videoId },
      data: { 
        estado: nuevoEstado
      }
    })

    // Log del reintento
    await prisma.workflowLog.create({
      data: {
        videoId,
        accion: 'video_retry_initiated',
        detalles: {
          estadoAnterior: 'error',
          nuevoEstado: nuevoEstado,
          reiniciadoPor: session.user?.email,
          fechaReintento: new Date().toISOString()
        }
      }
    })

    console.log(`🔄 Video ${videoId} marcado para reintento - nuevo estado: ${nuevoEstado}`)

    return NextResponse.json({ 
      success: true, 
      message: `Video marcado para reintento en estado ${nuevoEstado}`,
      nuevoEstado
    })

  } catch (error) {
    console.error('Error reintentando video:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}