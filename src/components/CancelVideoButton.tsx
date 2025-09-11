'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CustomButton } from '@/components/ui/custom-button'
import { AlertCircle } from 'lucide-react'

interface CancelVideoButtonProps {
  videoId: string
  buttonText?: string
  loadingText?: string
  confirmMessage?: string
}

export default function CancelVideoButton({ 
  videoId, 
  buttonText = 'Cancelar',
  loadingText = 'Cancelando...',
  confirmMessage = '¿Cancelar este proceso de generación?'
}: CancelVideoButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleCancel = async () => {
    if (!confirm(confirmMessage)) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/videos/${videoId}/cancel`, {
        method: 'POST'
      })

      if (response.ok) {
        router.refresh()
      } else {
        const data = await response.json()
        alert(`Error: ${data.error || 'No se pudo cancelar'}`)
      }
    } catch (error) {
      console.error('Error cancelando:', error)
      alert('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <CustomButton
      size="sm"
      variant="destructive"
      onClick={handleCancel}
      disabled={isLoading}
    >
      <AlertCircle className="h-4 w-4 mr-2" />
      {isLoading ? loadingText : buttonText}
    </CustomButton>
  )
}