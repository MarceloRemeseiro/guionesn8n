'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CustomButton } from '@/components/ui/custom-button'
import { CalendarX, Loader2 } from 'lucide-react'

interface CancelScheduleButtonProps {
  videoId: string
  disabled?: boolean
}

export default function CancelScheduleButton({ videoId, disabled = false }: CancelScheduleButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleCancelSchedule = async () => {
    if (!confirm('¿Cancelar la programación de este video? Volverá al estado "Aprobado".')) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/videos/${videoId}/cancel-schedule`, {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok) {
        console.log('✅ Programación cancelada exitosamente')
        router.refresh()
      } else {
        console.error('❌ Error cancelando programación:', data.error)
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('❌ Error cancelando programación:', error)
      alert('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <CustomButton
      size="sm"
      variant="destructive"
      onClick={handleCancelSchedule}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Cancelando...
        </>
      ) : (
        <>
          <CalendarX className="h-4 w-4 mr-2" />
          Cancelar Programación
        </>
      )}
    </CustomButton>
  )
}