'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CustomButton } from '@/components/ui/custom-button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Loader2 } from 'lucide-react'
import { PromptData } from '@/types'

interface PromptSelectorProps {
  prompts: PromptData[]
}

export default function PromptSelector({ prompts }: PromptSelectorProps) {
  const [selectedPromptId, setSelectedPromptId] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
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

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 dark:from-blue-950/30 dark:to-purple-950/30 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
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

        <CustomButton 
          onClick={handleGenerate}
          disabled={!selectedPromptId || isGenerating}
          variant="primary"
          size="lg"
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generando contenido...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generar Contenido
            </>
          )}
        </CustomButton>

        {isGenerating && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              ⏳ Esto puede tomar unos minutos mientras la IA procesa tu solicitud...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}