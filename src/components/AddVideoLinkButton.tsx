'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CustomButton } from '@/components/ui/custom-button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, Loader2, CheckCircle, AlertCircle, Link, X, Calendar, Clock, Video } from 'lucide-react'
import { transformHeyGenUrlToMp4 } from '@/lib/utils'

interface AddVideoLinkButtonProps {
  videoId: string
  disabled?: boolean
}

type VideoInputType = 'url' | 'heygen'

export default function AddVideoLinkButton({ videoId, disabled = false }: AddVideoLinkButtonProps) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')
  const [inputType, setInputType] = useState<VideoInputType>('url')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')

  const handlePublishNow = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!videoUrl.trim()) {
      alert('Por favor, ingresa el contenido del video')
      return
    }

    // Validación según el tipo de input
    if (inputType === 'url') {
      try {
        new URL(videoUrl)
      } catch {
        alert('Por favor, ingresa una URL válida')
        return
      }
    } else {
      const heygenPattern = /<a href="https:\/\/app\.heygen\.com\/share\/[^"]+">[\s\S]*<\/a>/
      if (!heygenPattern.test(videoUrl.trim())) {
        alert('Por favor, pega el código HTML completo de HeyGen')
        return
      }
    }

    if (!confirm('¿Estás seguro de que quieres publicar este video AHORA en todas las redes sociales?')) {
      return
    }

    await publishVideo(false)
  }

  const handleSchedulePublication = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!videoUrl.trim()) {
      alert('Por favor, ingresa el contenido del video')
      return
    }

    if (!scheduledDate || !scheduledTime) {
      alert('Por favor, selecciona la fecha y hora para la publicación')
      return
    }

    // Validación según el tipo de input
    if (inputType === 'url') {
      try {
        new URL(videoUrl)
      } catch {
        alert('Por favor, ingresa una URL válida')
        return
      }
    } else {
      const heygenPattern = /<a href="https:\/\/app\.heygen\.com\/share\/[^"]+">[\s\S]*<\/a>/
      if (!heygenPattern.test(videoUrl.trim())) {
        alert('Por favor, pega el código HTML completo de HeyGen')
        return
      }
    }

    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`)
    const now = new Date()

    if (scheduledDateTime <= now) {
      alert('La fecha y hora programada debe ser en el futuro')
      return
    }

    if (!confirm(`¿Estás seguro de que quieres programar este video para ${scheduledDateTime.toLocaleString()}?`)) {
      return
    }

    await publishVideo(true, scheduledDateTime)
  }

  const publishVideo = async (isScheduled: boolean, scheduledDateTime?: Date) => {

    try {
      setIsLoading(true)
      setStatus('idle')

      // Procesar URL según el tipo
      let finalVideoUrl = videoUrl.trim()
      if (inputType === 'heygen') {
        const mp4Url = transformHeyGenUrlToMp4(videoUrl.trim())
        if (mp4Url) {
          finalVideoUrl = mp4Url
        } else {
          throw new Error('No se pudo procesar el HTML de HeyGen')
        }
      }

      if (isScheduled && scheduledDateTime) {
        console.log('📅 Programando video para:', scheduledDateTime, videoId, finalVideoUrl)

        const response = await fetch('/api/videos/schedule', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            videoId,
            videoUrl: finalVideoUrl,
            scheduledDateTime: scheduledDateTime.toISOString()
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Error al programar video')
        }

        console.log('✅ Video programado exitosamente')
      } else {
        console.log('🚀 Enviando video para publicación inmediata:', videoId, finalVideoUrl)

        const response = await fetch('/api/webhooks/publicar-video', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            videoId,
            videoUrl: finalVideoUrl
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Error al publicar video')
        }

        console.log('✅ Video enviado para publicación exitosamente')
      }

      setStatus('success')

      // Refrescar la página para mostrar el nuevo estado
      router.refresh()

      // Cerrar modal después de un momento
      setTimeout(() => {
        setIsModalOpen(false)
        setVideoUrl('')
        setScheduledDate('')
        setScheduledTime('')
        setStatus('idle')
        setInputType('url')
      }, 2000)

    } catch (error) {
      console.error('❌ Error procesando video:', error)
      setStatus('error')
      alert('Error al procesar video: ' + (error instanceof Error ? error.message : 'Error desconocido'))

      // Reset estado después de un momento
      setTimeout(() => {
        setStatus('idle')
      }, 3000)
    } finally {
      setIsLoading(false)
    }
  }

  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Publicando...
        </>
      )
    }

    if (status === 'success') {
      return (
        <>
          <CheckCircle className="h-4 w-4 mr-2" />
          Publicado!
        </>
      )
    }

    if (status === 'error') {
      return (
        <>
          <AlertCircle className="h-4 w-4 mr-2" />
          Error
        </>
      )
    }

    return (
      <>
        <Upload className="h-4 w-4 mr-2" />
        Agregar Video
      </>
    )
  }

  const getButtonVariant = () => {
    if (status === 'success') return 'success'
    if (status === 'error') return 'destructive'
    return 'primary'
  }

  return (
    <>
      <CustomButton
        size="sm"
        variant={getButtonVariant()}
        onClick={() => setIsModalOpen(true)}
        disabled={disabled || isLoading}
      >
        {getButtonContent()}
      </CustomButton>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-800 text-black dark:text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Agregar Video
            </DialogTitle>
            <DialogDescription>
              Selecciona el tipo de video y elige si publicarlo ahora o programarlo para más tarde
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-3">
                <Label>Tipo de video</Label>
                <div className="flex gap-2">
                  <CustomButton
                    type="button"
                    variant={inputType === 'url' ? 'primary' : 'neutral'}
                    size="sm"
                    onClick={() => { setInputType('url'); setVideoUrl('') }}
                    disabled={isLoading}
                  >
                    <Link className="h-4 w-4 mr-2" />
                    URL Normal
                  </CustomButton>
                  <CustomButton
                    type="button"
                    variant={inputType === 'heygen' ? 'primary' : 'neutral'}
                    size="sm"
                    onClick={() => { setInputType('heygen'); setVideoUrl('') }}
                    disabled={isLoading}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    HeyGen HTML
                  </CustomButton>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="videoUrl">
                  {inputType === 'url' ? 'URL del Video' : 'Código HTML de HeyGen'}
                </Label>
                {inputType === 'url' ? (
                  <Input
                    id="videoUrl"
                    type="url"
                    placeholder="https://ejemplo.com/video.mp4"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full bg-white dark:bg-slate-600 text-black dark:text-white border-gray-300 dark:border-slate-500"
                    required
                    disabled={isLoading}
                  />
                ) : (
                  <textarea
                    id="videoUrl"
                    placeholder='<a href="https://app.heygen.com/share/..."><p>...</p><img src="..." /></a>'
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full min-h-[100px] p-3 bg-white dark:bg-slate-600 text-black dark:text-white border border-gray-300 dark:border-slate-500 rounded-md resize-y font-mono text-sm"
                    required
                    disabled={isLoading}
                  />
                )}
                <p className="text-sm text-muted-foreground">
                  {inputType === 'url'
                    ? 'URL de YouTube, Vimeo, Google Drive, Dropbox, etc.'
                    : 'Pega aquí el código HTML completo que obtienes de HeyGen'}
                </p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <h4 className="font-medium text-card-foreground mb-2">
                📱 Redes sociales donde se publicará:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                  Instagram (Reel)
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  YouTube
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  TikTok
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Twitter/X
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-700 rounded-full"></div>
                  LinkedIn
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h4 className="font-medium mb-4 text-foreground">Programar publicación (opcional)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduledDate">Fecha</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    disabled={isLoading}
                    className="bg-white dark:bg-slate-600 text-black dark:text-white border-gray-300 dark:border-slate-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduledTime">Hora</Label>
                  <Input
                    id="scheduledTime"
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    disabled={isLoading}
                    className="bg-white dark:bg-slate-600 text-black dark:text-white border-gray-300 dark:border-slate-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <CustomButton
                type="button"
                variant="neutral"
                onClick={() => setIsModalOpen(false)}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </CustomButton>

              {scheduledDate && scheduledTime && (
                <CustomButton
                  type="button"
                  variant="primary"
                  onClick={handleSchedulePublication}
                  disabled={isLoading || !videoUrl.trim()}
                  className="w-full sm:w-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Programando...
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4 mr-2" />
                      Programar Publicación
                    </>
                  )}
                </CustomButton>
              )}

              <CustomButton
                type="button"
                variant="success"
                onClick={handlePublishNow}
                disabled={isLoading || !videoUrl.trim()}
                className="w-full sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Publicando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Publicar Ahora
                  </>
                )}
              </CustomButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}