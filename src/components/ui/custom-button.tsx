'use client'

import { forwardRef } from 'react'
import { Button as ShadcnButton } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface CustomButtonProps extends React.ComponentProps<'button'> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'primary' | 'neutral' | 'success'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
}

const CustomButton = forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ className, variant = 'default', size, asChild, ...props }, ref) => {
    const customVariants = {
      primary: 'bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700 text-white border-none shadow-sm',
      neutral: 'custom-neutral-button shadow-sm',
      success: 'bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-800 text-white border-none shadow-sm'
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
          size={size}
          asChild={asChild}
          {...props}
        />
      )
    }

    return (
      <ShadcnButton
        className={className}
        variant={variant as any}
        size={size}
        asChild={asChild}
        ref={ref}
        {...props}
      />
    )
  }
)

CustomButton.displayName = 'CustomButton'

export { CustomButton }