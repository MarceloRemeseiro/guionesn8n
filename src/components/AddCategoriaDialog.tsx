'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CustomButton } from '@/components/ui/custom-button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Plus, Loader2 } from 'lucide-react'

const formSchema = z.object({
  nombre: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, {
    message: "Debe ser un color hexadecimal válido (ej: #3B82F6).",
  }),
})

export default function AddCategoriaDialog() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      color: "#6B7280",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const response = await fetch('/api/categorias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (response.ok) {
        setOpen(false)
        form.reset()
        router.refresh()
      } else {
        console.error('Error al crear categoría:', data.error)
        // Aquí podrías mostrar un toast con el error
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const coloresPredefnidos = [
    '#3B82F6', // blue
    '#8B5CF6', // violet
    '#10B981', // emerald
    '#F59E0B', // amber
    '#EF4444', // red
    '#6366F1', // indigo
    '#EC4899', // pink
    '#14B8A6', // teal
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <CustomButton size="sm" variant="primary">
          <Plus className="mr-2 h-4 w-4" />
          Nueva Categoría
        </CustomButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Crear Nueva Categoría</DialogTitle>
          <DialogDescription>
            Crea una nueva categoría para organizar tus prompts.
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
                    <FormLabel>Nombre de la Categoría</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Tutoriales, Noticias, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color de la Categoría</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Input 
                          placeholder="#6B7280" 
                          {...field} 
                          className="font-mono"
                        />
                        <div className="flex flex-wrap gap-2">
                          {coloresPredefnidos.map((color) => (
                            <button
                              key={color}
                              type="button"
                              className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-gray-500 transition-colors"
                              style={{ backgroundColor: color }}
                              onClick={() => form.setValue('color', color)}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    </FormControl>
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
            variant="success"
            disabled={isLoading}
            onClick={form.handleSubmit(onSubmit)}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              'Crear Categoría'
            )}
          </CustomButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}