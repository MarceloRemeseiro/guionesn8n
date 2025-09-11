import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const prompt = await prisma.prompt.findUnique({
      where: { id },
      include: {
        categoria: true,
        _count: {
          select: { videos: true }
        }
      }
    })

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ prompt })

  } catch (error) {
    console.error('Error al obtener prompt:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const { nombre, descripcion, categoriaId, contenidoPrompt, activo } = await request.json()

    if (!nombre || !categoriaId || !contenidoPrompt) {
      return NextResponse.json({ 
        error: 'Campos requeridos: nombre, categoriaId, contenidoPrompt' 
      }, { status: 400 })
    }

    const promptActualizado = await prisma.prompt.update({
      where: { id },
      data: {
        nombre,
        descripcion,
        categoriaId,
        contenidoPrompt,
        activo: activo !== undefined ? activo : true
      }
    })

    return NextResponse.json({ 
      success: true, 
      prompt: promptActualizado 
    })

  } catch (error) {
    console.error('Error al actualizar prompt:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    // Verificar si el prompt tiene videos asociados
    const videosCount = await prisma.video.count({
      where: { promptId: id }
    })

    if (videosCount > 0) {
      // Si tiene videos, solo marcarlo como inactivo
      const promptDesactivado = await prisma.prompt.update({
        where: { id },
        data: { activo: false }
      })
      
      return NextResponse.json({ 
        success: true, 
        message: 'Prompt desactivado (tiene videos asociados)',
        prompt: promptDesactivado 
      })
    } else {
      // Si no tiene videos, eliminarlo completamente
      await prisma.prompt.delete({
        where: { id }
      })
      
      return NextResponse.json({ 
        success: true, 
        message: 'Prompt eliminado completamente'
      })
    }

  } catch (error) {
    console.error('Error al eliminar prompt:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}