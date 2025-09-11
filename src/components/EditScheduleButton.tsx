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
        <DialogContent className="sm:max-w-[400px]">
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Programación actual:</strong><br />
                {currentDate.toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                />
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
              <CustomButton 
                type="submit"
                variant="primary"
                disabled={isLoading || !newDate || !newTime}
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