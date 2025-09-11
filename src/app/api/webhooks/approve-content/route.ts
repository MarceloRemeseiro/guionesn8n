import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get('videoId')
    const action = searchParams.get('action')

    if (!videoId || !action) {
      return NextResponse.json({ error: 'Parámetros faltantes' }, { status: 400 })
    }

    if (action === 'approve') {
      // Aprobar el contenido
      await prisma.video.update({
        where: { id: videoId },
        data: { 
          estado: 'aprobado',
          aprobadoEn: new Date()
        }
      })

      // Log del workflow
      await prisma.workflowLog.create({
        data: {
          videoId,
          accion: 'content_approved',
          detalles: { approvedAt: new Date() }
        }
      })

      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/approval-success?message=Contenido aprobado exitosamente`
      )

    } else if (action === 'reject') {
      // Rechazar el contenido
      await prisma.video.update({
        where: { id: videoId },
        data: { estado: 'borrador' }
      })

      // Log del workflow
      await prisma.workflowLog.create({
        data: {
          videoId,
          accion: 'content_rejected',
          detalles: { rejectedAt: new Date() }
        }
      })

      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/approval-success?message=Contenido rechazado. Será devuelto para edición.`
      )
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })

  } catch (error) {
    console.error('Error en approve-content:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}