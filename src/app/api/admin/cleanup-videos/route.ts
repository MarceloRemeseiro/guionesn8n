import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Eliminar videos cancelables (esperando_ia, procesando_ia, error, borrador, esperando_aprobacion, aprobado)
    const deletedVideos = await prisma.video.deleteMany({
      where: {
        estado: {
          in: ['esperando_ia', 'procesando_ia', 'error', 'borrador', 'esperando_aprobacion', 'aprobado']
        }
      }
    })

    // También eliminar logs relacionados
    await prisma.workflowLog.deleteMany({
      where: {
        accion: {
          in: ['content_generation_requested', 'content_generation_failed']
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      deletedCount: deletedVideos.count,
      message: `${deletedVideos.count} videos cancelables eliminados`
    })

  } catch (error) {
    console.error('Error en cleanup:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}