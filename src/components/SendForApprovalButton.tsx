'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CustomButton } from '@/components/ui/custom-button'
import { Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface SendForApprovalButtonProps {
  videoId: string
  disabled?: boolean
}

export default function SendForApprovalButton({ videoId, disabled = false }: SendForApprovalButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSendForApproval = async () => {
    if (!confirm('¿Estás seguro de que quieres enviar este video para aprobación?')) {
      return
    }

    try {
      setIsLoading(true)
      setStatus('idle')

      console.log('📤 Enviando video para aprobación:', videoId)

      const response = await fetch('/api/webhooks/send-for-approval', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar para aprobación')
      }

      console.log('✅ Video enviado para aprobación exitosamente')
      setStatus('success')
      
      // Refrescar la página para mostrar el nuevo estado
      router.refresh()

      // Mostrar éxito por un momento
      setTimeout(() => {
        setStatus('idle')
      }, 2000)

    } catch (error) {
      console.error('❌ Error enviando para aprobación:', error)
      setStatus('error')
      alert('Error al enviar para aprobación: ' + (error instanceof Error ? error.message : 'Error desconocido'))

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
          Enviando...
        </>
      )
    }

    if (status === 'success') {
      return (
        <>
          <CheckCircle className="h-4 w-4 mr-2" />
          Enviado!
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
        <Send className="h-4 w-4 mr-2" />
        Enviar para Aprobación
      </>
    )
  }

  const getButtonVariant = () => {
    if (status === 'success') return 'success'
    if (status === 'error') return 'destructive'
    return 'primary'
  }

  return (
    <CustomButton
      size="sm"
      variant={getButtonVariant()}
      onClick={handleSendForApproval}
      disabled={disabled || isLoading}
    >
      {getButtonContent()}
    </CustomButton>
  )
}