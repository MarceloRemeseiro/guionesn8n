'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CustomButton } from '@/components/ui/custom-button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Loader2, FileText } from 'lucide-react'
import { PromptData } from '@/types'

interface PromptSelectorProps {
  prompts: PromptData[]
}

export default function PromptSelector({ prompts }: PromptSelectorProps) {
  const [selectedPromptId, setSelectedPromptId] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCreatingDraft, setIsCreatingDraft] = useState(false)
  const router = useRouter()

  const selectedPrompt = prompts.find(p => p.id === selectedPromptId)

  const handleGenerate = async () => {
    if (!selectedPromptId) return

    setIsGenerating(true)
    try {
      const response = await fetch('/api/webhooks/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promptId: selectedPromptId
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.refresh()
      } else {
        console.error('Error al generar contenido:', data.error)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCreateDraft = async () => {
    setIsCreatingDraft(true)
    try {
      const response = await fetch('/api/videos/create-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promptId: selectedPromptId || null
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.refresh()
      } else {
        console.error('Error al crear borrador:', data.error)
        alert('Error al crear borrador: ' + data.error)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al crear borrador')
    } finally {
      setIsCreatingDraft(false)
    }
  }

  return (
    <Card className="bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <Sparkles className="h-5 w-5" />
          Generar Nuevo Contenido
        </CardTitle>
        <CardDescription>
          Selecciona un prompt para generar contenido automáticamente con IA
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Seleccionar Prompt</label>
          <Select onValueChange={setSelectedPromptId} value={selectedPromptId}>
            <SelectTrigger className="bg-white dark:bg-gray-800">
              <SelectValue placeholder="Elige una plantilla de prompt..." />
            </SelectTrigger>
            <SelectContent>
              {prompts.map((prompt) => (
                <SelectItem key={prompt.id} value={prompt.id}>
                  <div className="flex items-center gap-2">
                    <span>{prompt.nombre}</span>
                    {prompt.categoria && (
                      <Badge variant="secondary" className="text-xs flex items-center gap-1">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: prompt.categoria.color || '#6B7280' }}
                        />
                        <span className="capitalize">{prompt.categoria.nombre}</span>
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedPrompt && (
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
            <h4 className="font-medium mb-2">{selectedPrompt.nombre}</h4>
            {selectedPrompt.descripcion && (
              <p className="text-sm text-muted-foreground mb-2">
                {selectedPrompt.descripcion}
              </p>
            )}
            {selectedPrompt.categoria && (
              <Badge variant="outline" className="mb-3 flex items-center gap-1 w-fit">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: selectedPrompt.categoria.color || '#6B7280' }}
                />
                <span className="capitalize">{selectedPrompt.categoria.nombre}</span>
              </Badge>
            )}
            <div className="text-sm text-muted-foreground max-h-32 overflow-y-auto">
              <strong>Preview del prompt:</strong>
              <p className="mt-1 whitespace-pre-wrap">
                {selectedPrompt.contenidoPrompt.slice(0, 200)}...
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <CustomButton
            onClick={handleCreateDraft}
            disabled={isCreatingDraft || isGenerating}
            variant="neutral"
            size="lg"
            className="flex-1"
          >
            {isCreatingDraft ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando borrador...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Crear Borrador Vacío
              </>
            )}
          </CustomButton>

          <CustomButton
            onClick={handleGenerate}
            disabled={!selectedPromptId || isGenerating || isCreatingDraft}
            variant="primary"
            size="lg"
            className="flex-1"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando contenido...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generar con IA
              </>
            )}
          </CustomButton>
        </div>

        {(isGenerating || isCreatingDraft) && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {isGenerating
                ? '⏳ Esto puede tomar unos minutos mientras la IA procesa tu solicitud...'
                : '📝 Creando borrador vacío para edición manual...'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}