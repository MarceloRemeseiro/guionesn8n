import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import PromptsManager from '@/components/PromptsManager'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Video, Library, TrendingUp, Clock } from 'lucide-react'

async function getPromptsWithStats() {
  return await prisma.prompt.findMany({
    where: { activo: true },
    orderBy: { creadoEn: 'desc' },
    include: {
      categoria: true,
      _count: {
        select: { videos: true }
      }
    }
  })
}

async function getPromptsStats() {
  const totalPrompts = await prisma.prompt.count({ where: { activo: true } })
  const totalVideos = await prisma.video.count()
  const promptsUsados = await prisma.prompt.count({
    where: {
      activo: true,
      videos: {
        some: {}
      }
    }
  })
  
  const promptsRecientes = await prisma.prompt.count({
    where: {
      activo: true,
      creadoEn: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Última semana
      }
    }
  })

  return {
    totalPrompts,
    totalVideos,
    promptsUsados,
    promptsRecientes
  }
}

export default async function PromptsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  const [prompts, stats] = await Promise.all([
    getPromptsWithStats(),
    getPromptsStats()
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950">
      {/* Header */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Gestión de Prompts
              </h1>
              <p className="text-lg text-muted-foreground mt-1">
                Administra tus plantillas de contenido
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Navigation />
              <Badge variant="outline" className="px-3 py-1">
                <Library className="w-4 h-4 mr-2" />
                {stats.totalPrompts} prompts
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 dark:from-blue-950/50 dark:to-blue-900/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Total Prompts</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalPrompts}</p>
                </div>
                <Library className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:from-green-950/50 dark:to-green-900/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 dark:text-green-400 text-sm font-medium">Prompts Usados</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.promptsUsados}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 dark:from-purple-950/50 dark:to-purple-900/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Videos Generados</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.totalVideos}</p>
                </div>
                <Video className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 dark:from-yellow-950/50 dark:to-yellow-900/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">Esta Semana</p>
                  <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{stats.promptsRecientes}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gestión de Prompts */}
        <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <PromptsManager prompts={prompts} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}