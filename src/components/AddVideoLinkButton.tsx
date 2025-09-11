'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CustomButton } from '@/components/ui/custom-button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, Loader2, CheckCircle, AlertCircle, Link, X, Calendar, Clock } from 'lucide-react'

interface AddVideoLinkButtonProps {
  videoId: string
  disabled?: boolean
}

export default function AddVideoLinkButton({ videoId, disabled = false }: AddVideoLinkButtonProps) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')

  const handlePublishNow = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!videoUrl.trim()) {
      alert('Por favor, ingresa la URL del video')
      return
    }

    // Validación básica de URL
    try {
      new URL(videoUrl)
    } catch {
      alert('Por favor, ingresa una URL válida')
      return
    }

    if (!confirm('¿Estás seguro de que quieres publicar este video AHORA en todas las redes sociales?')) {
      return
    }

    await publishVideo(false)
  }

  const handleSchedulePublication = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!videoUrl.trim()) {
      alert('Por favor, ingresa la URL del video')
      return
    }

    if (!scheduledDate || !scheduledTime) {
      alert('Por favor, selecciona la fecha y hora para la publicación')
      return
    }

    // Validación básica de URL
    try {
      new URL(videoUrl)
    } catch {
      alert('Por favor, ingresa una URL válida')
      return
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

      if (isScheduled && scheduledDateTime) {
        console.log('📅 Programando video para:', scheduledDateTime, videoId, videoUrl)
        
        const response = await fetch('/api/videos/schedule', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            videoId, 
            videoUrl: videoUrl.trim(),
            scheduledDateTime: scheduledDateTime.toISOString()
          }),
        })
        
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Error al programar video')
        }

        console.log('✅ Video programado exitosamente')
      } else {
        console.log('🚀 Enviando video para publicación inmediata:', videoId, videoUrl)

        const response = await fetch('/api/webhooks/publicar-video', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            videoId, 
            videoUrl: videoUrl.trim()
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
        Agregar Link de Video
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              Agregar Link del Video
            </DialogTitle>
            <DialogDescription>
              Ingresa la URL del video y elige si publicarlo ahora o programarlo para más tarde
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="videoUrl">URL del Video</Label>
              <Input
                id="videoUrl"
                type="url"
                placeholder="https://ejemplo.com/video.mp4"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full"
                required
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground">
                Puede ser una URL de YouTube, Vimeo, Google Drive, Dropbox, etc.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">
                📱 Redes sociales donde se publicará:
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
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

            <div className="border-t pt-4">
              <h4 className="font-medium mb-4">Programar publicación (opcional)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduledDate">Fecha</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    disabled={isLoading}
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
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <CustomButton 
                type="button"
                variant="neutral" 
                onClick={() => setIsModalOpen(false)}
                disabled={isLoading}
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