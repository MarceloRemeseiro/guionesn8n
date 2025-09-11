'use client'

import { CustomButton } from '@/components/ui/custom-button'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  onPageChange 
}: PaginationProps) {
  if (totalPages <= 1) return null

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const getVisiblePages = () => {
    const pages = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      }
    }

    return pages
  }

  const visiblePages = getVisiblePages()

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <CustomButton
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          variant="neutral"
          size="sm"
        >
          Anterior
        </CustomButton>
        <CustomButton
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          variant="neutral"
          size="sm"
        >
          Siguiente
        </CustomButton>
      </div>
      
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{startItem}</span> a{' '}
            <span className="font-medium">{endItem}</span> de{' '}
            <span className="font-medium">{totalItems}</span> videos
          </p>
        </div>
        
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <CustomButton
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              variant="neutral"
              size="sm"
              className="rounded-r-none"
            >
              <ChevronLeft className="h-4 w-4" />
            </CustomButton>
            
            {visiblePages.map((page, index) => (
              <div key={index}>
                {page === '...' ? (
                  <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300">
                    <MoreHorizontal className="h-4 w-4" />
                  </span>
                ) : (
                  <CustomButton
                    onClick={() => onPageChange(page as number)}
                    variant={currentPage === page ? "primary" : "neutral"}
                    size="sm"
                    className="rounded-none"
                  >
                    {page}
                  </CustomButton>
                )}
              </div>
            ))}
            
            <CustomButton
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              variant="neutral"
              size="sm"
              className="rounded-l-none"
            >
              <ChevronRight className="h-4 w-4" />
            </CustomButton>
          </nav>
        </div>
      </div>
    </div>
  )
}