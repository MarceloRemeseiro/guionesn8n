'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CustomButton } from '@/components/ui/custom-button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Save, X, Edit, Video, Share2, Twitter, Linkedin, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'

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

interface VideoContentModalProps {
  video: Video
  isOpen: boolean
  onClose: () => void
  readOnly?: boolean
}

export default function VideoContentModal({ video, isOpen, onClose, readOnly = false }: VideoContentModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    titulo: video.titulo || '',
    tema: video.tema || '',
    guion: video.guion || '',
    textoLinkedin: video.textoLinkedin || '',
    tweet: video.tweet || '',
    descripcion: video.descripcion || ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch(`/api/videos/${video.id}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar el video')
      }

      router.refresh()
      onClose()
    } catch (error) {
      console.error('Error:', error)
      alert('Error al actualizar el video')
    } finally {
      setIsLoading(false)
    }
  }

  const charCounts = {
    titulo: formData.titulo.length,
    tema: formData.tema.length,
    guion: formData.guion.length,
    textoLinkedin: formData.textoLinkedin.length,
    tweet: formData.tweet.length,
    descripcion: formData.descripcion.length
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-[90vw] !w-[90vw] !h-[80vh] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {readOnly ? (
              <>
                <Eye className="h-5 w-5" />
                Ver Contenido del Video
              </>
            ) : (
              <>
                <Edit className="h-5 w-5" />
                Editar Contenido del Video
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {readOnly ? 
              'Revisa todo el contenido del video aprobado' : 
              'Revisa y edita todo el contenido generado por la IA'
            }
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Contenido Principal
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Redes Sociales
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Vista Previa
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Información Principal</CardTitle>
                <CardDescription>
                  Título, tema y guión del video
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título ({charCounts.titulo} caracteres)</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={readOnly ? undefined : (e) => handleInputChange('titulo', e.target.value)}
                    placeholder="Título del video"
                    className="text-lg font-medium"
                    readOnly={readOnly}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tema">Tema ({charCounts.tema} caracteres)</Label>
                  <Input
                    id="tema"
                    value={formData.tema}
                    onChange={readOnly ? undefined : (e) => handleInputChange('tema', e.target.value)}
                    placeholder="Tema principal del video"
                    readOnly={readOnly}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="guion">Guión ({charCounts.guion} caracteres)</Label>
                  <Textarea
                    id="guion"
                    value={formData.guion}
                    onChange={readOnly ? undefined : (e) => handleInputChange('guion', e.target.value)}
                    placeholder="Guión completo del video"
                    rows={12}
                    className="resize-y"
                    readOnly={readOnly}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4 text-blue-600" />
                    LinkedIn
                  </CardTitle>
                  <CardDescription>
                    Texto para publicación en LinkedIn
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="textoLinkedin">
                      Texto LinkedIn ({charCounts.textoLinkedin} caracteres)
                    </Label>
                    <Textarea
                      id="textoLinkedin"
                      value={formData.textoLinkedin}
                      onChange={readOnly ? undefined : (e) => handleInputChange('textoLinkedin', e.target.value)}
                      placeholder="Texto para LinkedIn..."
                      rows={8}
                      className="resize-y"
                      readOnly={readOnly}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Twitter className="h-4 w-4 text-blue-400" />
                    Twitter/X
                  </CardTitle>
                  <CardDescription>
                    Tweet para publicación
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="tweet">
                      Tweet ({charCounts.tweet}/280 caracteres)
                    </Label>
                    <Textarea
                      id="tweet"
                      value={formData.tweet}
                      onChange={readOnly ? undefined : (e) => handleInputChange('tweet', e.target.value)}
                      placeholder="Tweet..."
                      rows={5}
                      maxLength={280}
                      className={`resize-y ${charCounts.tweet > 280 ? 'border-red-300' : ''}`}
                      readOnly={readOnly}
                    />
                    {charCounts.tweet > 280 && (
                      <p className="text-sm text-red-600">
                        El tweet excede el límite de 280 caracteres
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Descripción</CardTitle>
                <CardDescription>
                  Descripción general del contenido
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="descripcion">
                    Descripción ({charCounts.descripcion} caracteres)
                  </Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={readOnly ? undefined : (e) => handleInputChange('descripcion', e.target.value)}
                    placeholder="Descripción del video..."
                    rows={6}
                    className="resize-y"
                    readOnly={readOnly}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Vista Previa del Contenido</CardTitle>
                <CardDescription>
                  Así se verá el contenido final
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-bold text-lg mb-2">{formData.titulo || 'Sin título'}</h3>
                  <p className="text-muted-foreground mb-4">{formData.tema || 'Sin tema'}</p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Guión:</h4>
                    <p className="whitespace-pre-wrap text-sm">
                      {formData.guion || 'Sin guión'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-700 mb-2 flex items-center gap-2">
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </h4>
                    <p className="text-sm whitespace-pre-wrap">
                      {formData.textoLinkedin || 'Sin contenido para LinkedIn'}
                    </p>
                  </div>

                  <div className="border border-blue-100 rounded-lg p-4">
                    <h4 className="font-medium text-blue-500 mb-2 flex items-center gap-2">
                      <Twitter className="h-4 w-4" />
                      Twitter/X
                    </h4>
                    <p className="text-sm whitespace-pre-wrap">
                      {formData.tweet || 'Sin tweet'}
                    </p>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Descripción:</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {formData.descripcion || 'Sin descripción'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <CustomButton 
            variant="neutral" 
            onClick={onClose}
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-2" />
            {readOnly ? 'Cerrar' : 'Cancelar'}
          </CustomButton>
          {!readOnly && (
            <CustomButton 
              variant="primary" 
              onClick={handleSave}
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </CustomButton>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}