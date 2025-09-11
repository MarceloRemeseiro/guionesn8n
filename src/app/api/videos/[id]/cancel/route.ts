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

    // Verificar que el video existe y está en estado cancelable
    const video = await prisma.video.findUnique({
      where: { id: videoId }
    })

    if (!video) {
      return NextResponse.json({ error: 'Video no encontrado' }, { status: 404 })
    }

    const cancelableStates = ['esperando_ia', 'procesando_ia', 'error', 'borrador', 'esperando_aprobacion', 'aprobado', 'publicado', 'programado']
    if (!cancelableStates.includes(video.estado)) {
      return NextResponse.json({ 
        error: 'El video no puede ser cancelado en su estado actual' 
      }, { status: 400 })
    }

    // Eliminar logs del workflow antes de eliminar el video
    await prisma.workflowLog.deleteMany({
      where: { videoId }
    })

    // Eliminar el video
    await prisma.video.delete({
      where: { id: videoId }
    })

    console.log('🧹 Logs del workflow eliminados para video cancelado:', videoId)

    return NextResponse.json({ 
      success: true, 
      message: 'Video cancelado y eliminado'
    })

  } catch (error) {
    console.error('Error cancelando video:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}