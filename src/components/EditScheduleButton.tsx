'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CustomButton } from '@/components/ui/custom-button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, Loader2, X, CalendarClock } from 'lucide-react'

interface EditScheduleButtonProps {
  videoId: string
  currentScheduledDate: string
  disabled?: boolean
}

export default function EditScheduleButton({ 
  videoId, 
  currentScheduledDate, 
  disabled = false 
}: EditScheduleButtonProps) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Convertir fecha actual a formato local para los inputs
  const currentDate = new Date(currentScheduledDate)
  const [newDate, setNewDate] = useState(
    currentDate.toISOString().split('T')[0]
  )
  const [newTime, setNewTime] = useState(
    currentDate.toTimeString().slice(0, 5)
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newDate || !newTime) {
      alert('Por favor, selecciona fecha y hora')
      return
    }

    const newScheduledDateTime = new Date(`${newDate}T${newTime}`)
    const now = new Date()
    
    if (newScheduledDateTime <= now) {
      alert('La nueva fecha debe ser en el futuro')
      return
    }

    if (!confirm(`¿Reprogramar para ${newScheduledDateTime.toLocaleString()}?`)) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/videos/${videoId}/reschedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scheduledDateTime: newScheduledDateTime.toISOString()
        }),
      })

      const data = await response.json()

      if (response.ok) {
        console.log('✅ Video reprogramado exitosamente')
        router.refresh()
        setIsModalOpen(false)
      } else {
        console.error('❌ Error reprogramando video:', data.error)
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('❌ Error reprogramando video:', error)
      alert('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <CustomButton
        size="sm"
        variant="neutral"
        onClick={() => setIsModalOpen(true)}
        disabled={disabled || isLoading}
      >
        <CalendarClock className="h-4 w-4 mr-2" />
        Editar Programación
      </CustomButton>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[400px] max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-800 text-black dark:text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Editar Programación
            </DialogTitle>
            <DialogDescription>
              Cambiar la fecha y hora programada para la publicación
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-4">
              <h4 className="font-medium text-card-foreground mb-2">
                📅 Programación actual:
              </h4>
              <p className="text-sm text-muted-foreground">
                {currentDate.toLocaleString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newDate">Nueva Fecha</Label>
                <Input
                  id="newDate"
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  disabled={isLoading}
                  required
                  className="bg-white dark:bg-slate-600 text-black dark:text-white border-gray-300 dark:border-slate-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newTime">Nueva Hora</Label>
                <Input
                  id="newTime"
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  disabled={isLoading}
                  required
                  className="bg-white dark:bg-slate-600 text-black dark:text-white border-gray-300 dark:border-slate-500"
                />
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
              <CustomButton 
                type="submit"
                variant="primary"
                disabled={isLoading || !newDate || !newTime}
                className="w-full sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Reprogramar
                  </>
                )}
              </CustomButton>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}