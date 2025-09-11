'use client'

import { useState } from 'react'
import { CustomButton } from '@/components/ui/custom-button'
import VideoContentModal from '@/components/VideoContentModal'
import { Eye } from 'lucide-react'

interface Video {
  id: string
  titulo: string | null
  tema: string | null
  guion: string | null
  textoLinkedin: string | null
  tweet: string | null
  descripcion: string | null
  estado: string
}

interface ViewContentButtonProps {
  video: Video
  readOnly?: boolean
}

export default function ViewContentButton({ video, readOnly = false }: ViewContentButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <CustomButton 
        size="sm" 
        variant="neutral"
        onClick={() => setIsModalOpen(true)}
      >
        <Eye className="h-4 w-4 mr-2" />
        Ver Contenido
      </CustomButton>
      
      <VideoContentModal
        video={video}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        readOnly={readOnly}
      />
    </>
  )
}