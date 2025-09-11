import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    console.log('🧹 Iniciando limpieza de logs...')

    // 1. Eliminar logs huérfanos (videos que ya no existen)
    const orphanLogs = await prisma.workflowLog.findMany({
      select: { videoId: true },
      distinct: ['videoId']
    })

    const existingVideos = await prisma.video.findMany({
      select: { id: true }
    })

    const existingVideoIds = new Set(existingVideos.map(v => v.id))
    const orphanVideoIds = orphanLogs
      .filter(log => !existingVideoIds.has(log.videoId))
      .map(log => log.videoId)

    if (orphanVideoIds.length > 0) {
      const deletedOrphans = await prisma.workflowLog.deleteMany({
        where: {
          videoId: { in: orphanVideoIds }
        }
      })
      console.log(`🗑️ Eliminados ${deletedOrphans.count} logs huérfanos`)
    }

    // 2. Eliminar logs antiguos (más de 30 días)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const deletedOld = await prisma.workflowLog.deleteMany({
      where: {
        creadoEn: { lt: thirtyDaysAgo }
      }
    })

    console.log(`📅 Eliminados ${deletedOld.count} logs antiguos (>30 días)`)

    // 3. Contar logs restantes
    const remainingLogs = await prisma.workflowLog.count()

    console.log('✅ Limpieza de logs completada')

    return NextResponse.json({
      success: true,
      message: 'Limpieza de logs completada',
      stats: {
        orphanLogsDeleted: orphanVideoIds.length,
        oldLogsDeleted: deletedOld.count,
        remainingLogs: remainingLogs
      }
    })

  } catch (error) {
    console.error('❌ Error en limpieza de logs:', error)
    return NextResponse.json(
      { 
        error: 'Error en la limpieza de logs',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}