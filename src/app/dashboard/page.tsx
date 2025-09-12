import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import AddPromptDialog from '@/components/AddPromptDialog'
import PromptSelector from '@/components/PromptSelector'
import Navigation from '@/components/Navigation'
import VideosList from '@/components/VideosList'
import { Video, Clock, CheckCircle, Share2, Eye, Send, Play, Loader2, AlertCircle } from 'lucide-react'

async function getPrompts() {
  return await prisma.prompt.findMany({
    where: { activo: true },
    orderBy: { creadoEn: 'desc' },
    include: {
      categoria: true
    }
  })
}

async function getVideos() {
  return await prisma.video.findMany({
    include: {
      prompt: true
    },
    orderBy: { creadoEn: 'desc' },
    take: 10
  })
}

async function getVideoStats() {
  const total = await prisma.video.count()
  const enProceso = await prisma.video.count({
    where: {
      estado: {
        not: 'publicado'
      }
    }
  })
  const programados = await prisma.video.count({
    where: {
      estado: 'programado'
    }
  })
  const publicados = await prisma.video.count({
    where: {
      estado: 'publicado'
    }
  })
  
  return { total, enProceso, programados, publicados }
}

function getEstadoBadgeVariant(estado: string) {
  switch (estado) {
    case 'esperando_ia':
      return 'secondary'
    case 'procesando_ia':
      return 'default'
    case 'borrador':
      return 'secondary'
    case 'esperando_aprobacion':
      return 'default'
    case 'aprobado':
      return 'outline'
    case 'publicado':
      return 'default'
    case 'programado':
      return 'outline'
    case 'error':
      return 'destructive'
    default:
      return 'secondary'
  }
}

function getEstadoIcon(estado: string) {
  switch (estado) {
    case 'esperando_ia':
      return Clock
    case 'procesando_ia':
      return Loader2
    case 'borrador':
      return Eye
    case 'esperando_aprobacion':
      return Send
    case 'aprobado':
      return CheckCircle
    case 'publicado':
      return Share2
    case 'programado':
      return Clock
    case 'error':
      return AlertCircle
    default:
      return Clock
  }
}

function getEstadoColor(estado: string) {
  switch (estado) {
    case 'esperando_ia':
      return 'text-orange-600 bg-orange-50 border-orange-200'
    case 'procesando_ia':
      return 'text-blue-600 bg-blue-50 border-blue-200'
    case 'borrador':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'esperando_aprobacion':
      return 'text-blue-600 bg-blue-50 border-blue-200'
    case 'aprobado':
      return 'text-green-600 bg-green-50 border-green-200'
    case 'publicado':
      return 'text-emerald-600 bg-emerald-50 border-emerald-200'
    case 'programado':
      return 'text-indigo-600 bg-indigo-50 border-indigo-200'
    case 'error':
      return 'text-red-600 bg-red-50 border-red-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

function getEstadoTexto(estado: string) {
  switch (estado) {
    case 'esperando_ia':
      return 'Esperando IA'
    case 'procesando_ia':
      return 'Procesando IA'
    case 'borrador':
      return 'Borrador'
    case 'esperando_aprobacion':
      return 'Esperando Aprobación'
    case 'aprobado':
      return 'Aprobado'
    case 'publicado':
      return 'Publicado'
    case 'programado':
      return 'Programado'
    case 'error':
      return 'Error'
    default:
      return estado
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  const prompts = await getPrompts()
  const videoStats = await getVideoStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950">
      {/* Header */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                StreamingPro
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Video Creator Dashboard
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Navigation />
              <div className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center text-white text-xs font-medium">
                {session.user?.name?.[0] || 'U'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 dark:from-slate-700/50 dark:to-slate-600/50 dark:border-slate-600">
            <CardContent className="py-1 px-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Total Prompts</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{prompts.length}</p>
                </div>
                <Video className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 dark:from-slate-700/50 dark:to-slate-600/50 dark:border-slate-600">
            <CardContent className="py-1 px-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">Videos en Proceso</p>
                  <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                    {videoStats.enProceso}
                  </p>
                </div>
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 dark:from-slate-700/50 dark:to-slate-600/50 dark:border-slate-600">
            <CardContent className="py-1 px-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-600 dark:text-indigo-400 text-sm font-medium">Videos Programados</p>
                  <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                    {videoStats.programados}
                  </p>
                </div>
                <Clock className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:from-slate-700/50 dark:to-slate-600/50 dark:border-slate-600">
            <CardContent className="py-1 px-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 dark:text-green-400 text-sm font-medium">Videos Publicados</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {videoStats.publicados}
                  </p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Prompt Selector */}
            <PromptSelector prompts={prompts} />

            {/* Prompts Management */}
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-gray-200 dark:border-slate-600">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Gestión de Prompts
                </CardTitle>
                <CardDescription>
                  Administra tus plantillas de contenido
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <AddPromptDialog />
                  <div className="text-sm text-muted-foreground">
                    <p>📝 {prompts.length} prompts disponibles</p>
                    <p>🎯 {prompts.filter(p => p.categoria?.nombre === 'broadcast').length} de broadcast</p>
                    <p>📡 {prompts.filter(p => p.categoria?.nombre === 'streaming').length} de streaming</p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right Column - Videos */}
          <div className="lg:col-span-2">
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-gray-200 dark:border-slate-600">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Videos en Proceso
                </CardTitle>
                <CardDescription>
                  Gestiona el flujo de trabajo de tus videos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VideosList />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
