import React from 'react'
import { cn } from '@/lib/utils'

interface FormGroupProps {
  children: React.ReactNode
  className?: string
  title?: string
  description?: string
  layout?: 'vertical' | 'horizontal' | 'grid'
  columns?: 1 | 2 | 3 | 4
  spacing?: 'sm' | 'md' | 'lg'
}

export const FormGroup = React.forwardRef<HTMLDivElement, FormGroupProps>(
  ({ 
    children, 
    className, 
    title, 
    description, 
    layout = 'vertical',
    columns = 2,
    spacing = 'md',
    ...props 
  }, ref) => {
    const baseClasses = "space-y-4"
    
    const layoutClasses = {
      vertical: "space-y-4",
      horizontal: "flex flex-wrap gap-4",
      grid: `grid gap-4 grid-cols-1 md:grid-cols-${columns}`
    }
    
    const spacingClasses = {
      sm: "space-y-2",
      md: "space-y-4",
      lg: "space-y-6"
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          layoutClasses[layout],
          spacingClasses[spacing],
          className
        )}
        {...props}
      >
        {(title || description) && (
          <div className="space-y-1">
            {title && (
              <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            )}
            {description && (
              <p className="text-sm text-slate-600">{description}</p>
            )}
          </div>
        )}
        {children}
      </div>
    )
  }
)

FormGroup.displayName = 'FormGroup'
