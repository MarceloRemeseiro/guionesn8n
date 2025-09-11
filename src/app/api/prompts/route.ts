import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { nombre, descripcion, categoriaId, contenidoPrompt } = await request.json()

    if (!nombre || !categoriaId || !contenidoPrompt) {
      return NextResponse.json({ 
        error: 'Campos requeridos: nombre, categoriaId, contenidoPrompt' 
      }, { status: 400 })
    }

    const nuevoPrompt = await prisma.prompt.create({
      data: {
        nombre,
        descripcion,
        categoriaId,
        contenidoPrompt,
        activo: true
      }
    })

    return NextResponse.json({ 
      success: true, 
      prompt: nuevoPrompt 
    })

  } catch (error) {
    console.error('Error al crear prompt:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const prompts = await prisma.prompt.findMany({
      where: { activo: true },
      orderBy: { creadoEn: 'desc' },
      include: {
        categoria: true,
        _count: {
          select: { videos: true }
        }
      }
    })

    return NextResponse.json({ prompts })

  } catch (error) {
    console.error('Error al obtener prompts:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}