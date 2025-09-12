'use client'

import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ApprovalSuccessPage() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || 'Acción completada exitosamente'
  const isApproval = message.includes('aprobado')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950">
      <Card className="w-full max-w-md mx-4 backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-800/50 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
            isApproval 
              ? 'bg-green-600' 
              : 'bg-orange-600'
          }`}>
            {isApproval ? (
              <CheckCircle className="h-8 w-8 text-white" />
            ) : (
              <X className="h-8 w-8 text-white" />
            )}
          </div>
          <CardTitle className={`text-2xl font-bold ${
            isApproval ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
          }`}>
            {isApproval ? '✅ Aprobado' : '📝 Procesado'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-700 dark:text-gray-300 text-lg">
            {message}
          </p>
          
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {isApproval 
                ? '🎉 El contenido ha sido aprobado y está listo para la siguiente fase.'
                : '📋 La acción se ha procesado correctamente.'
              }
            </p>
          </div>

          <Button 
            onClick={() => window.close()} 
            variant="outline"
            className="w-full"
          >
            Cerrar ventana
          </Button>
          
          <p className="text-xs text-muted-foreground">
            Esta ventana se puede cerrar de forma segura.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}