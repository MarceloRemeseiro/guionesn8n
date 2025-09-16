import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { promptId } = await request.json()

    let prompt = null
    if (promptId) {
      // Verificar que el prompt existe solo si se proporciona
      prompt = await prisma.prompt.findUnique({
        where: { id: promptId }
      })

      if (!prompt) {
        return NextResponse.json({ error: 'Prompt no encontrado' }, { status: 404 })
      }
    }

    // Obtener el usuario
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Crear el video borrador vacío
    const video = await prisma.video.create({
      data: {
        titulo: 'Borrador sin título',
        guion: '',
        descripcion: '',
        textoLinkedin: '',
        tweet: '',
        estado: 'borrador',
        promptId: promptId
      },
      include: {
        prompt: true
      }
    })

    // Log del workflow
    await prisma.workflowLog.create({
      data: {
        videoId: video.id,
        accion: 'draft_created_manual',
        detalles: {
          promptUsado: prompt?.nombre || 'Sin prompt',
          usuarioCreador: user.email
        }
      }
    })

    return NextResponse.json({
      success: true,
      video,
      message: 'Borrador creado exitosamente'
    })

  } catch (error) {
    console.error('Error creando borrador:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}