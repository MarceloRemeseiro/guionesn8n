'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CustomButton } from '@/components/ui/custom-button'
import { Send, Loader2, CheckCircle, AlertCircle, Check } from 'lucide-react'

interface ApprovalButtonsProps {
  videoId: string
  disabled?: boolean
}

export default function ApprovalButtons({ videoId, disabled = false }: ApprovalButtonsProps) {
  const router = useRouter()
  const [isLoadingReview, setIsLoadingReview] = useState(false)
  const [isLoadingApprove, setIsLoadingApprove] = useState(false)
  const [reviewStatus, setReviewStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [approveStatus, setApproveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSendForReview = async () => {
    if (!confirm('¿Estás seguro de que quieres enviar este video para revisión?')) {
      return
    }

    try {
      setIsLoadingReview(true)
      setReviewStatus('idle')

      console.log('📤 Enviando video para revisión:', videoId)

      const response = await fetch('/api/webhooks/send-for-approval', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar para revisión')
      }

      console.log('✅ Video enviado para revisión exitosamente')
      setReviewStatus('success')

      router.refresh()

      setTimeout(() => {
        setReviewStatus('idle')
      }, 2000)

    } catch (error) {
      console.error('❌ Error enviando para revisión:', error)
      setReviewStatus('error')
      alert('Error al enviar para revisión: ' + (error instanceof Error ? error.message : 'Error desconocido'))

      setTimeout(() => {
        setReviewStatus('idle')
      }, 3000)
    } finally {
      setIsLoadingReview(false)
    }
  }

  const handleAutoApprove = async () => {
    if (!confirm('¿Estás seguro de que quieres aprobar este video automáticamente?')) {
      return
    }

    try {
      setIsLoadingApprove(true)
      setApproveStatus('idle')

      console.log('✅ Aprobando video automáticamente:', videoId)

      const response = await fetch('/api/videos/auto-approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al aprobar video')
      }

      console.log('✅ Video aprobado automáticamente')
      setApproveStatus('success')

      router.refresh()

      setTimeout(() => {
        setApproveStatus('idle')
      }, 2000)

    } catch (error) {
      console.error('❌ Error aprobando video:', error)
      setApproveStatus('error')
      alert('Error al aprobar video: ' + (error instanceof Error ? error.message : 'Error desconocido'))

      setTimeout(() => {
        setApproveStatus('idle')
      }, 3000)
    } finally {
      setIsLoadingApprove(false)
    }
  }

  const getReviewButtonContent = () => {
    if (isLoadingReview) {
      return (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Enviando...
        </>
      )
    }

    if (reviewStatus === 'success') {
      return (
        <>
          <CheckCircle className="h-4 w-4 mr-2" />
          Enviado!
        </>
      )
    }

    if (reviewStatus === 'error') {
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
        Enviar para Revisión
      </>
    )
  }

  const getApproveButtonContent = () => {
    if (isLoadingApprove) {
      return (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Aprobando...
        </>
      )
    }

    if (approveStatus === 'success') {
      return (
        <>
          <CheckCircle className="h-4 w-4 mr-2" />
          Aprobado!
        </>
      )
    }

    if (approveStatus === 'error') {
      return (
        <>
          <AlertCircle className="h-4 w-4 mr-2" />
          Error
        </>
      )
    }

    return (
      <>
        <Check className="h-4 w-4 mr-2" />
        Aprobar
      </>
    )
  }

  const getReviewButtonVariant = () => {
    if (reviewStatus === 'success') return 'success'
    if (reviewStatus === 'error') return 'destructive'
    return 'primary'
  }

  const getApproveButtonVariant = () => {
    if (approveStatus === 'success') return 'success'
    if (approveStatus === 'error') return 'destructive'
    return 'success'
  }

  return (
    <div className="flex gap-2">
      <CustomButton
        size="sm"
        variant={getReviewButtonVariant()}
        onClick={handleSendForReview}
        disabled={disabled || isLoadingReview || isLoadingApprove}
      >
        {getReviewButtonContent()}
      </CustomButton>

      <CustomButton
        size="sm"
        variant={getApproveButtonVariant()}
        onClick={handleAutoApprove}
        disabled={disabled || isLoadingReview || isLoadingApprove}
      >
        {getApproveButtonContent()}
      </CustomButton>
    </div>
  )
}