import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { promptId } = await request.json()

    if (!promptId) {
      return NextResponse.json({ error: 'promptId es requerido' }, { status: 400 })
    }

    // Obtener el prompt completo con categoría
    const prompt = await prisma.prompt.findUnique({
      where: { id: promptId },
      include: { categoria: true }
    })

    if (!prompt || !prompt.activo) {
      return NextResponse.json({ error: 'Prompt no encontrado o inactivo' }, { status: 404 })
    }

    // Obtener los últimos 30 temas de videos (no solo los que tienen tema, sino los más recientes)
    const ultimosVideos = await prisma.video.findMany({
      where: {
        tema: { not: null } // Solo videos que tengan tema definido
      },
      select: {
        tema: true,
        titulo: true,
        creadoEn: true
      },
      orderBy: {
        creadoEn: 'desc'
      },
      take: 30
    })

    // Extraer solo los temas (sin duplicados)
    const ultimosTemasUnicos = [...new Set(
      ultimosVideos
        .map(video => video.tema)
        .filter((tema): tema is string => tema !== null)
    )]

    // Crear un nuevo video en estado "esperando_ia"
    const nuevoVideo = await prisma.video.create({
      data: {
        promptId: promptId,
        estado: 'esperando_ia',
        titulo: 'Generando contenido...'
      }
    })

    // Preparar datos para n8n con la nueva estructura
    const n8nPayload = {
      videoId: nuevoVideo.id,
      prompt: {
        id: prompt.id,
        nombre: prompt.nombre,
        descripcion: prompt.descripcion,
        contenido: prompt.contenidoPrompt,
        categoria: prompt.categoria ? {
          nombre: prompt.categoria.nombre,
          color: prompt.categoria.color
        } : null
      },
      ultimosTemasPublicados: ultimosTemasUnicos,
      totalTemasAnteriores: ultimosTemasUnicos.length,
      timestamp: new Date().toISOString(),
      callbackUrl: `${process.env.NEXTAUTH_URL}/api/webhooks/content-generated`
    }

    // Enviar a n8n
    const n8nUrl = `${process.env.N8N_BASE_URL}${process.env.N8N_WEBHOOK_GENERATE_CONTENT}`
    console.log('Enviando a n8n URL:', n8nUrl)
    console.log('Payload enviado:', JSON.stringify(n8nPayload, null, 2))

    const n8nResponse = await fetch(n8nUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(n8nPayload)
    })

    console.log('Respuesta de n8n - Status:', n8nResponse.status)
    const responseText = await n8nResponse.text()
    console.log('Respuesta de n8n - Body:', responseText)

    if (!n8nResponse.ok) {
      throw new Error(`Error al comunicarse con n8n: ${n8nResponse.status} - ${responseText}`)
    }

    // Log del workflow
    await prisma.workflowLog.create({
      data: {
        videoId: nuevoVideo.id,
        accion: 'content_generation_requested',
        detalles: { 
          promptId, 
          promptNombre: prompt.nombre,
          temasAnterioresCount: ultimosTemasUnicos.length,
          n8nPayload 
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      videoId: nuevoVideo.id,
      message: 'Generación de contenido iniciada',
      temasEnviados: ultimosTemasUnicos.length
    })

  } catch (error) {
    console.error('Error en generate-content:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}