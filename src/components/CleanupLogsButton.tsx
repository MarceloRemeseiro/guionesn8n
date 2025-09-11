'use client'

import { useState } from 'react'
import { CustomButton } from '@/components/ui/custom-button'
import { Trash2, Loader2 } from 'lucide-react'

export default function CleanupLogsButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [lastResult, setLastResult] = useState<string | null>(null)

  const handleCleanup = async () => {
    if (!confirm('¿Limpiar logs huérfanos y antiguos? Esta acción no se puede deshacer.')) {
      return
    }

    setIsLoading(true)
    setLastResult(null)

    try {
      const response = await fetch('/api/admin/cleanup-logs', {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok) {
        setLastResult(
          `✅ Limpieza completada: ${data.stats.orphanLogsDeleted} huérfanos + ${data.stats.oldLogsDeleted} antiguos eliminados. ${data.stats.remainingLogs} logs restantes.`
        )
        console.log('🧹 Limpieza de logs exitosa:', data.stats)
      } else {
        setLastResult(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error en limpieza:', error)
      setLastResult('❌ Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <CustomButton
        size="sm"
        variant="destructive"
        onClick={handleCleanup}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Limpiando...
          </>
        ) : (
          <>
            <Trash2 className="h-4 w-4 mr-2" />
            Limpiar Logs
          </>
        )}
      </CustomButton>
      
      {lastResult && (
        <div className="text-xs text-muted-foreground max-w-xs">
          {lastResult}
        </div>
      )}
    </div>
  )
}