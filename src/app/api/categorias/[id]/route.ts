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
    const categoria = await prisma.categoria.findUnique({
      where: { id },
      include: {
        _count: {
          select: { prompts: true }
        }
      }
    })

    if (!categoria) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ categoria })

  } catch (error) {
    console.error('Error al obtener categoría:', error)
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
    const { nombre, color, activa } = await request.json()

    if (!nombre) {
      return NextResponse.json({ 
        error: 'El nombre es requerido' 
      }, { status: 400 })
    }

    // Verificar si ya existe otra categoría con ese nombre
    const existingCategoria = await prisma.categoria.findFirst({
      where: { 
        nombre: nombre.toLowerCase(),
        id: { not: id }
      }
    })

    if (existingCategoria) {
      return NextResponse.json({ 
        error: 'Ya existe otra categoría con ese nombre' 
      }, { status: 409 })
    }

    const categoriaActualizada = await prisma.categoria.update({
      where: { id },
      data: {
        nombre: nombre.toLowerCase(),
        color: color || '#6B7280',
        activa: activa !== undefined ? activa : true
      }
    })

    return NextResponse.json({ 
      success: true, 
      categoria: categoriaActualizada 
    })

  } catch (error) {
    console.error('Error al actualizar categoría:', error)
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
    
    // Verificar si la categoría tiene prompts asociados
    const promptsCount = await prisma.prompt.count({
      where: { categoriaId: id }
    })

    if (promptsCount > 0) {
      // Si tiene prompts, solo marcarla como inactiva
      const categoriaDesactivada = await prisma.categoria.update({
        where: { id },
        data: { activa: false }
      })
      
      return NextResponse.json({ 
        success: true, 
        message: 'Categoría desactivada (tiene prompts asociados)',
        categoria: categoriaDesactivada 
      })
    } else {
      // Si no tiene prompts, eliminarla completamente
      await prisma.categoria.delete({
        where: { id }
      })
      
      return NextResponse.json({ 
        success: true, 
        message: 'Categoría eliminada completamente'
      })
    }

  } catch (error) {
    console.error('Error al eliminar categoría:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}