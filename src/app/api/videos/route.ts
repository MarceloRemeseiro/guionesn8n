import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parámetros de filtrado
    const hidePublished = searchParams.get('hidePublished') === 'true'
    const todayOnly = searchParams.get('todayOnly') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // Calcular offset para paginación
    const offset = (page - 1) * limit

    // Construir filtros donde
    const whereClause: any = {}

    // Filtro para ocultar publicados
    if (hidePublished) {
      whereClause.estado = {
        not: 'publicado'
      }
    }

    // Filtro para solo hoy
    if (todayOnly) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      whereClause.creadoEn = {
        gte: today,
        lt: tomorrow
      }
    }

    // Obtener total de videos con filtros
    const totalVideos = await prisma.video.count({
      where: whereClause
    })

    // Obtener videos con filtros, paginación y relaciones
    const videos = await prisma.video.findMany({
      where: whereClause,
      include: {
        prompt: true
      },
      orderBy: { creadoEn: 'desc' },
      skip: offset,
      take: limit
    })

    // Calcular información de paginación
    const totalPages = Math.ceil(totalVideos / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      videos,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalVideos,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage
      },
      filters: {
        hidePublished,
        todayOnly
      }
    })

  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}