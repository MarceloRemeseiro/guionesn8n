'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CustomButton } from '@/components/ui/custom-button'
import { Badge } from '@/components/ui/badge'
import VideoFilters, { VideoFilters as VideoFiltersType } from '@/components/VideoFilters'
import Pagination from '@/components/Pagination'
import CancelVideoButton from '@/components/CancelVideoButton'
import ViewContentButton from '@/components/ViewContentButton'
import SendForApprovalButton from '@/components/SendForApprovalButton'
import AddVideoLinkButton from '@/components/AddVideoLinkButton'
import PublishVideoButton from '@/components/PublishVideoButton'
import CancelScheduleButton from '@/components/CancelScheduleButton'
import EditScheduleButton from '@/components/EditScheduleButton'
import { Video, Clock, CheckCircle, Upload, Share2, Eye, Send, Play, Loader2, AlertCircle, Calendar } from 'lucide-react'

interface VideoData {
  id: string
  titulo: string | null
  tema?: string | null
  guion?: string | null
  textoLinkedin?: string | null
  tweet?: string | null
  descripcion?: string | null
  estado: string
  urlVideo?: string | null
  urlHeygen?: string | null
  urlYoutube?: string | null
  urlLinkedin?: string | null
  urlTwitter?: string | null
  creadoEn: string
  aprobadoEn?: string | null
  publicadoEn?: string | null
  programadoPara?: string | null
  prompt?: {
    id: string
    nombre: string
  } | null
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface VideosResponse {
  videos: VideoData[]
  pagination: PaginationInfo
  filters: VideoFiltersType
}

export default function VideosList() {
  const [videos, setVideos] = useState<VideoData[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false
  })
  const [filters, setFilters] = useState<VideoFiltersType>({
    hidePublished: false,
    todayOnly: false,
    page: 1
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchVideos = async (newFilters: VideoFiltersType, silent = false) => {
    try {
      if (!silent) {
        setLoading(true)
        setError(null)
      }

      const params = new URLSearchParams({
        hidePublished: String(newFilters.hidePublished),
        todayOnly: String(newFilters.todayOnly),
        page: String(newFilters.page),
        limit: '10'
      })

      const response = await fetch(`/api/videos?${params}`)
      if (!response.ok) {
        throw new Error('Error al cargar videos')
      }

      const data: VideosResponse = await response.json()
      setVideos(data.videos)
      setPagination(data.pagination)
      setFilters(newFilters)
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      }
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchVideos(filters)
  }, [])

  // Polling automático SIEMPRE activo en el dashboard
  useEffect(() => {
    console.log('📱 Iniciando polling continuo cada 5 segundos...')
    const interval = setInterval(() => {
      console.log('🔄 Actualizando videos silenciosamente...')
      fetchVideos(filters, true) // true = modo silencioso (sin spinner)
    }, 5000) // Cada 5 segundos

    return () => {
      console.log('📱 Deteniendo polling al salir del dashboard')
      clearInterval(interval)
    }
  }, [filters]) // Solo depende de filters, no de videos

  const handleFiltersChange = (newFilters: VideoFiltersType) => {
    fetchVideos(newFilters)
  }

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page }
    fetchVideos(newFilters)
  }

  // Funciones para obtener estilos y estados
  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'esperando_ia':
      case 'procesando_ia':
        return 'secondary'
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

  const getEstadoIcon = (estado: string) => {
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
        return Calendar
      case 'error':
        return AlertCircle
      default:
        return Clock
    }
  }

  const getEstadoIconColor = (estado: string) => {
    switch (estado) {
      case 'esperando_ia':
        return 'text-orange-600'
      case 'procesando_ia':
        return 'text-blue-600'
      case 'borrador':
        return 'text-yellow-600'
      case 'esperando_aprobacion':
        return 'text-blue-600'
      case 'aprobado':
        return 'text-green-600'
      case 'publicado':
        return 'text-emerald-600'
      case 'programado':
        return 'text-indigo-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getEstadoTexto = (estado: string) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Cargando videos...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-600">{error}</p>
        <CustomButton 
          variant="neutral" 
          onClick={() => fetchVideos(filters)}
          className="mt-2"
        >
          Reintentar
        </CustomButton>
      </div>
    )
  }

  return (
    <div>
      <VideoFilters
        currentFilters={filters}
        totalVideos={pagination.totalItems}
        onFiltersChange={handleFiltersChange}
      />

      {videos.length === 0 ? (
        <Card className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600">
          <CardContent className="py-8 text-center">
            <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">
              {filters.hidePublished || filters.todayOnly 
                ? 'No hay videos que coincidan con los filtros aplicados'
                : 'No hay videos aún. ¡Crea tu primer video seleccionando un prompt!'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6">
            {videos.map((video) => {
              const EstadoIcon = getEstadoIcon(video.estado)
              return (
                <Card key={video.id} className="relative bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {video.titulo || video.tema || 'Sin título'}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {video.prompt?.nombre && (
                            <span className="text-blue-600">
                              Prompt: {video.prompt.nombre}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <EstadoIcon className={`h-4 w-4 ${getEstadoIconColor(video.estado)}`} />
                        <Badge variant={getEstadoBadgeVariant(video.estado)}>
                          {getEstadoTexto(video.estado)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex flex-col gap-4">
                      {video.tema && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                          <strong>Tema:</strong> {video.tema}
                        </p>
                      )}

                      {/* Botones según el estado */}
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          {(video.estado === 'esperando_ia' || video.estado === 'procesando_ia') && (
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-2 text-sm text-orange-600">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>
                                  {video.estado === 'esperando_ia' 
                                    ? 'Enviado a IA, esperando respuesta...' 
                                    : 'IA generando contenido...'}
                                </span>
                              </div>
                              <CancelVideoButton videoId={video.id} />
                            </div>
                          )}
                          
                          {video.estado === 'borrador' && (
                            <div className="flex items-center justify-between w-full">
                              <div className="flex gap-2">
                                <ViewContentButton video={video} />
                                <SendForApprovalButton videoId={video.id} />
                              </div>
                              <CancelVideoButton videoId={video.id} />
                            </div>
                          )}
                          
                          {video.estado === 'esperando_aprobacion' && (
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-2 text-sm text-blue-600">
                                <Send className="h-4 w-4 animate-pulse" />
                                <span>Esperando respuesta de aprobación...</span>
                              </div>
                              <CancelVideoButton videoId={video.id} />
                            </div>
                          )}
                          
                          {video.estado === 'aprobado' && (
                            <div className="flex items-center justify-between w-full">
                              <div className="flex gap-2">
                                <ViewContentButton video={video} readOnly={true} />
                                <AddVideoLinkButton videoId={video.id} />
                              </div>
                              <CancelVideoButton videoId={video.id} />
                            </div>
                          )}
                          
                          {video.estado === 'programado' && video.programadoPara && (
                            <div className="flex flex-col gap-3">
                              <div className="flex items-center gap-2 text-sm text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  <strong>Programado para:</strong> {' '}
                                  {new Date(video.programadoPara).toLocaleString('es-ES', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center justify-between w-full">
                                <div className="flex gap-2">
                                  <ViewContentButton video={video} readOnly={true} />
                                  <EditScheduleButton 
                                    videoId={video.id} 
                                    currentScheduledDate={video.programadoPara}
                                  />
                                </div>
                                <CancelScheduleButton videoId={video.id} />
                              </div>
                            </div>
                          )}
                          
                          {video.estado === 'publicado' && (
                            <div className="flex items-center justify-between w-full">
                              <div className="flex gap-2">
                                <ViewContentButton video={video} readOnly={true} />
                                {video.urlYoutube && (
                                  <CustomButton size="sm" variant="neutral" asChild>
                                    <a href={video.urlYoutube} target="_blank" rel="noopener noreferrer">
                                      YouTube
                                    </a>
                                  </CustomButton>
                                )}
                                {video.urlLinkedin && (
                                  <CustomButton size="sm" variant="neutral" asChild>
                                    <a href={video.urlLinkedin} target="_blank" rel="noopener noreferrer">
                                      LinkedIn
                                    </a>
                                  </CustomButton>
                                )}
                                {video.urlTwitter && (
                                  <CustomButton size="sm" variant="neutral" asChild>
                                    <a href={video.urlTwitter} target="_blank" rel="noopener noreferrer">
                                      Twitter
                                    </a>
                                  </CustomButton>
                                )}
                              </div>
                              <CancelVideoButton 
                                videoId={video.id} 
                                buttonText="Eliminar"
                                loadingText="Eliminando..."
                                confirmMessage="¿Eliminar este video publicado? Esta acción no se puede deshacer."
                              />
                            </div>
                          )}
                          
                          {video.estado === 'error' && (
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                                <AlertCircle className="h-4 w-4" />
                                <span>
                                  <strong>Error en procesamiento:</strong> Este video falló durante el procesamiento o publicación.
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <ViewContentButton video={video} readOnly={true} />
                                <CustomButton
                                  size="sm"
                                  variant="outline"
                                  onClick={async () => {
                                    try {
                                      const response = await fetch(`/api/videos/${video.id}/retry`, {
                                        method: 'POST'
                                      })
                                      if (response.ok) {
                                        // La página se actualizará automáticamente por el polling
                                      }
                                    } catch (error) {
                                      console.error('Error reintentando video:', error)
                                    }
                                  }}
                                >
                                  Reintentar
                                </CustomButton>
                                <CancelVideoButton 
                                  videoId={video.id} 
                                  buttonText="Eliminar"
                                  loadingText="Eliminando..."
                                  confirmMessage="¿Eliminar este video con error? Esta acción no se puede deshacer."
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Timeline indicator */}
                      <div className="mt-4 text-xs text-muted-foreground">
                        Creado: {new Date(video.creadoEn).toLocaleDateString('es-ES')}
                        {video.aprobadoEn && (
                          <span className="ml-4">
                            Aprobado: {new Date(video.aprobadoEn).toLocaleDateString('es-ES')}
                          </span>
                        )}
                        {video.programadoPara && (
                          <span className="ml-4">
                            Programado: {new Date(video.programadoPara).toLocaleDateString('es-ES')}
                          </span>
                        )}
                        {video.publicadoEn && (
                          <span className="ml-4">
                            Publicado: {new Date(video.publicadoEn).toLocaleDateString('es-ES')}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  )
}