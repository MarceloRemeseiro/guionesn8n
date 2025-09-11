'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CustomButton } from '@/components/ui/custom-button'
import { Share2 } from 'lucide-react'

interface PublishVideoButtonProps {
  videoId: string
}

export default function PublishVideoButton({ videoId }: PublishVideoButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handlePublish = async () => {
    if (!confirm('¿Publicar este video en todas las redes sociales?')) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/webhooks/publicar-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ videoId })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          alert('Video enviado para publicación en todas las redes sociales')
          router.refresh()
        } else {
          alert(`Error: ${data.message || 'No se pudo publicar'}`)
        }
      } else {
        const data = await response.json()
        alert(`Error: ${data.error || 'No se pudo publicar'}`)
      }
    } catch (error) {
      console.error('Error publicando:', error)
      alert('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <CustomButton
      size="sm"
      variant="primary"
      onClick={handlePublish}
      disabled={isLoading}
    >
      <Share2 className="h-4 w-4 mr-2" />
      {isLoading ? 'Publicando...' : 'Publicar'}
    </CustomButton>
  )
}