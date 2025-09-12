'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface UsePollingOptions {
  interval?: number // milliseconds
  enabled?: boolean
}

export function usePolling(options: UsePollingOptions = {}) {
  const { interval = 5000, enabled = true } = options
  const router = useRouter()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!enabled) return

    const poll = () => {
      router.refresh()
    }

    // Start polling
    intervalRef.current = setInterval(poll, interval)

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [router, interval, enabled])

  // Manual refresh function
  const refresh = () => {
    router.refresh()
  }

  // Stop polling function
  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  return { refresh, stop }
}