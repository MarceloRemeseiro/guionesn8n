'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CustomButton } from '@/components/ui/custom-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Edit, Trash2, Copy, Video } from 'lucide-react'
import { PromptData } from '@/types'
import AddPromptDialog from './AddPromptDialog'
import EditPromptDialog from './EditPromptDialog'

interface PromptsManagerProps {
  prompts: (PromptData & { _count?: { videos: number } })[]
}

export default function PromptsManager({ prompts }: PromptsManagerProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [promptToDelete, setPromptToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!promptToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/prompts/${promptToDelete}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        setDeleteDialogOpen(false)
        setPromptToDelete(null)
        router.refresh()
      } else {
        console.error('Error al eliminar prompt:', data.error)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const confirmDelete = (promptId: string) => {
    setPromptToDelete(promptId)
    setDeleteDialogOpen(true)
  }

  const duplicatePrompt = async (prompt: PromptData) => {
    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: `${prompt.nombre} (Copia)`,
          descripcion: prompt.descripcion,
          categoria: prompt.categoria,
          contenidoPrompt: prompt.contenidoPrompt,
        }),
      })

      if (response.ok) {
        router.refresh()
      } else {
        console.error('Error al duplicar prompt')
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Prompts</h2>
          <p className="text-muted-foreground">
            Administra tus plantillas de contenido
          </p>
        </div>
        <AddPromptDialog />
      </div>

      <div className="grid gap-4">
        {prompts.map((prompt) => (
          <Card key={prompt.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{prompt.nombre}</CardTitle>
                  {prompt.descripcion && (
                    <CardDescription>{prompt.descripcion}</CardDescription>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {prompt.categoria && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: prompt.categoria.color || '#6B7280' }}
                      />
                      <span className="capitalize">{prompt.categoria.nombre}</span>
                    </Badge>
                  )}
                  {prompt._count && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Video className="h-3 w-3" />
                      {prompt._count.videos}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Preview del prompt */}
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <p className="text-sm text-muted-foreground font-medium mb-1">
                    Vista previa:
                  </p>
                  <p className="text-sm line-clamp-3">
                    {prompt.contenidoPrompt.slice(0, 150)}...
                  </p>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-wrap gap-2">
                  <EditPromptDialog prompt={prompt}>
                    <CustomButton size="sm" variant="neutral">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </CustomButton>
                  </EditPromptDialog>

                  <CustomButton
                    size="sm"
                    variant="neutral"
                    onClick={() => duplicatePrompt(prompt)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicar
                  </CustomButton>

                  <CustomButton
                    size="sm"
                    variant="destructive"
                    onClick={() => confirmDelete(prompt.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {!prompt._count || prompt._count.videos === 0 ? 'Eliminar' : 'Desactivar'}
                  </CustomButton>
                </div>

                {/* Info adicional */}
                <div className="text-xs text-muted-foreground">
                  Creado: {new Date(prompt.creadoEn).toLocaleDateString('es-ES')}
                  {prompt._count && prompt._count.videos > 0 && (
                    <span className="ml-4">
                      • {prompt._count.videos} video{prompt._count.videos !== 1 ? 's' : ''} generado{prompt._count.videos !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {prompts.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No hay prompts disponibles
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Crea tu primer prompt para comenzar a generar contenido
              </p>
              <AddPromptDialog />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog de confirmación de eliminación */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Confirmar eliminación?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. El prompt será eliminado permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <CustomButton
              variant="neutral"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancelar
            </CustomButton>
            <CustomButton
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </CustomButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}