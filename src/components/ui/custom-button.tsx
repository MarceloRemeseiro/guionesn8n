'use client'

import { forwardRef } from 'react'
import { Button as ShadcnButton, ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface CustomButtonProps extends ButtonProps {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'primary' | 'neutral' | 'success'
}

const CustomButton = forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const customVariants = {
      primary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-none shadow-sm',
      neutral: 'custom-neutral-button shadow-sm',
      success: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-none shadow-sm'
    }

    if (variant === 'primary' || variant === 'neutral' || variant === 'success') {
      return (
        <ShadcnButton
          className={cn(
            customVariants[variant],
            className
          )}
          ref={ref}
          variant="outline" // Base variant para shadcn
          {...props}
        />
      )
    }

    return (
      <ShadcnButton
        className={className}
        variant={variant as any}
        ref={ref}
        {...props}
      />
    )
  }
)

CustomButton.displayName = 'CustomButton'

export { CustomButton }