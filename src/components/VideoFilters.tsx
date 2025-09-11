'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CustomButton } from '@/components/ui/custom-button'
import { Badge } from '@/components/ui/badge'
import { Filter, Calendar, Eye, EyeOff } from 'lucide-react'

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
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Videos
            {totalVideos > 0 && (
              <Badge variant="secondary" className="ml-2">
                {totalVideos} video{totalVideos !== 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>
          {hasActiveFilters && (
            <CustomButton
              size="sm"
              variant="neutral"
              onClick={clearFilters}
            >
              Limpiar filtros
            </CustomButton>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          <CustomButton
            size="sm"
            variant={filters.hidePublished ? "primary" : "neutral"}
            onClick={toggleHidePublished}
          >
            {filters.hidePublished ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {filters.hidePublished ? 'Publicados ocultos' : 'Ocultar publicados'}
          </CustomButton>
          
          <CustomButton
            size="sm"
            variant={filters.todayOnly ? "primary" : "neutral"}
            onClick={toggleTodayOnly}
          >
            <Calendar className="h-4 w-4 mr-2" />
            {filters.todayOnly ? 'Solo de hoy' : 'Ver solo hoy'}
          </CustomButton>
        </div>
        
        {hasActiveFilters && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">Filtros activos:</span>
              {filters.hidePublished && (
                <Badge variant="secondary">Videos publicados ocultos</Badge>
              )}
              {filters.todayOnly && (
                <Badge variant="secondary">Solo videos de hoy</Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}