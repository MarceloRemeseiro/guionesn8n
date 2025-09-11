'use client'

import { usePolling } from '@/hooks/usePolling'

interface DashboardPollingProps {
  hasPendingVideos: boolean
}

export default function DashboardPolling({ hasPendingVideos }: DashboardPollingProps) {
  // Solo hacer polling si hay videos pendientes
  usePolling({
    interval: 3000, // Cada 3 segundos
    enabled: hasPendingVideos
  })

  // Este componente no renderiza nada visible
  return null
}