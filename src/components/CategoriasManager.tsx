'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CustomButton } from '@/components/ui/custom-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Trash2, Palette } from 'lucide-react'
import { CategoriaData } from '@/types'
import AddCategoriaDialog from './AddCategoriaDialog'

interface CategoriasManagerProps {
  categorias: (CategoriaData & { _count?: { prompts: number } })[]
}

export default function CategoriasManager({ categorias }: CategoriasManagerProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoriaToDelete, setCategoriaToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!categoriaToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/categorias/${categoriaToDelete}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        setDeleteDialogOpen(false)
        setCategoriaToDelete(null)
        router.refresh()
      } else {
        console.error('Error al eliminar categoría:', data.error)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const confirmDelete = (categoriaId: string) => {
    setCategoriaToDelete(categoriaId)
    setDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Categorías</h2>
          <p className="text-muted-foreground">
            Organiza tus prompts por categorías
          </p>
        </div>
        <AddCategoriaDialog />
      </div>

      <div className="grid gap-4">
        {categorias.map((categoria) => (
          <Card key={categoria.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1 flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: categoria.color || '#6B7280' }}
                  />
                  <div>
                    <CardTitle className="text-lg capitalize">{categoria.nombre}</CardTitle>
                    <CardDescription>
                      Creado: {new Date(categoria.creadoEn).toLocaleDateString('es-ES')}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Palette className="h-3 w-3" />
                    {categoria._count?.prompts || 0} prompts
                  </Badge>
                  {!categoria.activa && (
                    <Badge variant="secondary">Inactiva</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <CustomButton
                  size="sm"
                  variant="destructive"
                  onClick={() => confirmDelete(categoria.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {!categoria._count || categoria._count.prompts === 0 ? 'Eliminar' : 'Desactivar'}
                </CustomButton>
              </div>
            </CardContent>
          </Card>
        ))}

        {categorias.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Palette className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No hay categorías disponibles
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Crea tu primera categoría para organizar tus prompts
              </p>
              <AddCategoriaDialog />
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
              Esta acción no se puede deshacer. La categoría será eliminada permanentemente o desactivada si tiene prompts asociados.
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