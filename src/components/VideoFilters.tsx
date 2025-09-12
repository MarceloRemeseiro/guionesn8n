'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CustomButton } from '@/components/ui/custom-button'
import { Badge } from '@/components/ui/badge'
import { Video, Calendar, Eye, EyeOff } from 'lucide-react'

interface VideoFiltersProps {
  onFiltersChange: (filters: VideoFilters) => void
  totalVideos: number
  currentFilters: VideoFilters
}

export interface VideoFilters {
  hidePublished: boolean
  todayOnly: boolean
  page: number
}

export default function VideoFilters({ onFiltersChange, totalVideos, currentFilters }: VideoFiltersProps) {
  const [filters, setFilters] = useState<VideoFilters>(currentFilters)

  const handleFilterChange = (newFilters: Partial<VideoFilters>) => {
    const updatedFilters = { 
      ...filters, 
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 1 // Reset to page 1 when changing filters
    }
    setFilters(updatedFilters)
    onFiltersChange(updatedFilters)
  }

  const toggleHidePublished = () => {
    handleFilterChange({ hidePublished: !filters.hidePublished })
  }

  const toggleTodayOnly = () => {
    handleFilterChange({ todayOnly: !filters.todayOnly })
  }

  const clearFilters = () => {
    const defaultFilters = { hidePublished: false, todayOnly: false, page: 1 }
    setFilters(defaultFilters)
    onFiltersChange(defaultFilters)
  }

  const hasActiveFilters = filters.hidePublished || filters.todayOnly

  return (
    <Card className="mb-4 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600">
      <CardContent className="py-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {totalVideos > 0 && (
              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                <Video className="h-4 w-4" />
                <span className="font-medium">{totalVideos}</span>
                <span>video{totalVideos !== 1 ? 's' : ''}</span>
              </div>
            )}
            
            <div className="flex gap-2">
              <CustomButton
                size="sm"
                variant={filters.hidePublished ? "primary" : "neutral"}
                onClick={toggleHidePublished}
              >
                {filters.hidePublished ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {filters.hidePublished ? 'Mostrando sin publicados' : 'Ocultar publicados'}
              </CustomButton>
              
              <CustomButton
                size="sm"
                variant={filters.todayOnly ? "primary" : "neutral"}
                onClick={toggleTodayOnly}
              >
                <Calendar className="h-4 w-4 mr-2" />
                {filters.todayOnly ? 'Solo videos de hoy' : 'Ver solo hoy'}
              </CustomButton>
            </div>
          </div>
          
          {hasActiveFilters && (
            <CustomButton
              size="sm"
              variant="neutral"
              onClick={clearFilters}
            >
              Ver todos
            </CustomButton>
          )}
        </div>
      </CardContent>
    </Card>
  )
}