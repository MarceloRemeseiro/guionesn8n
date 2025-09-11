'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CustomButton } from '@/components/ui/custom-button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Plus } from 'lucide-react'
import { CategoriaData } from '@/types'

const formSchema = z.object({
  nombre: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  descripcion: z.string().optional(),
  categoriaId: z.string().min(1, {
    message: "Selecciona una categoría.",
  }),
  contenidoPrompt: z.string().min(10, {
    message: "El prompt debe tener al menos 10 caracteres.",
  }),
})

export default function AddPromptDialog() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [categorias, setCategorias] = useState<CategoriaData[]>([])
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      descripcion: "",
      categoriaId: "",
      contenidoPrompt: "",
    },
  })

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await fetch('/api/categorias')
        const data = await response.json()
        if (response.ok) {
          setCategorias(data.categorias)
        }
      } catch (error) {
        console.error('Error fetching categorias:', error)
      }
    }

    if (open) {
      fetchCategorias()
    }
  }, [open])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        setOpen(false)
        form.reset()
        router.refresh()
      } else {
        console.error('Error al crear el prompt')
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <CustomButton variant="primary">
          <Plus className="mr-2 h-4 w-4" />
          Crear Prompt
        </CustomButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Prompt</DialogTitle>
          <DialogDescription>
            Crea una nueva plantilla de prompt para generar contenido de video.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-2">
          <Form {...form}>
            <div className="space-y-4">
              <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Prompt</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Tutorial Técnico - Streaming" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Input placeholder="Breve descripción del prompt..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoriaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categorias.map((categoria) => (
                        <SelectItem key={categoria.id} value={categoria.id}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: categoria.color || '#6B7280' }}
                            />
                            <span className="capitalize">{categoria.nombre}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contenidoPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contenido del Prompt</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Escribe aquí el prompt completo que se enviará a la IA..."
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Este es el texto que se enviará a la IA para generar el contenido del video.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>
          </Form>
        </div>
        <DialogFooter className="mt-4">
          <CustomButton 
            type="button" 
            variant="neutral" 
            onClick={() => setOpen(false)}
          >
            Cancelar
          </CustomButton>
          <CustomButton 
            type="submit" 
            variant="primary"
            disabled={isLoading}
            onClick={form.handleSubmit(onSubmit)}
          >
            {isLoading ? 'Creando...' : 'Crear Prompt'}
          </CustomButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}