import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const categorias = await prisma.categoria.findMany({
      where: { activa: true },
      orderBy: { nombre: 'asc' },
      include: {
        _count: {
          select: { prompts: true }
        }
      }
    })

    return NextResponse.json({ categorias })

  } catch (error) {
    console.error('Error al obtener categorías:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { nombre, color } = await request.json()

    if (!nombre) {
      return NextResponse.json({ 
        error: 'El nombre es requerido' 
      }, { status: 400 })
    }

    // Verificar si ya existe una categoría con ese nombre
    const existingCategoria = await prisma.categoria.findUnique({
      where: { nombre: nombre.toLowerCase() }
    })

    if (existingCategoria) {
      return NextResponse.json({ 
        error: 'Ya existe una categoría con ese nombre' 
      }, { status: 409 })
    }

    const nuevaCategoria = await prisma.categoria.create({
      data: {
        nombre: nombre.toLowerCase(),
        color: color || '#6B7280'
      }
    })

    return NextResponse.json({ 
      success: true, 
      categoria: nuevaCategoria 
    })

  } catch (error) {
    console.error('Error al crear categoría:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}