'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CustomButton } from '@/components/ui/custom-button'
import { AlertCircle } from 'lucide-react'

interface CleanupButtonProps {
  pendingCount: number
}

export default function CleanupButton({ pendingCount }: CleanupButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleCleanup = async () => {
    if (!confirm(`¿Eliminar ${pendingCount} videos de prueba/error?`)) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/cleanup-videos', {
        method: 'DELETE'
      })

      if (response.ok) {
        const data = await response.json()
        alert(`${data.deletedCount} videos eliminados`)
        router.refresh()
      } else {
        const data = await response.json()
        alert(`Error: ${data.error || 'No se pudieron eliminar'}`)
      }
    } catch (error) {
      console.error('Error limpiando:', error)
      alert('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <CustomButton
      size="sm"
      variant="neutral"
      onClick={handleCleanup}
      disabled={isLoading}
    >
      <AlertCircle className="w-4 h-4 mr-2" />
      {isLoading ? 'Limpiando...' : 'Limpiar Pruebas'}
    </CustomButton>
  )
}