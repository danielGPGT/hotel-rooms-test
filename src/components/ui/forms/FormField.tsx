import React from 'react'
import { cn } from '@/lib/utils'

interface FormFieldProps {
  children: React.ReactNode
  className?: string
  label?: string
  description?: string
  error?: string
  required?: boolean
  layout?: 'vertical' | 'horizontal'
}

export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ children, className, label, description, error, required, layout = 'vertical', ...props }, ref) => {
    const isHorizontal = layout === 'horizontal'
    
    return (
      <div
        ref={ref}
        className={cn(
          "space-y-2",
          isHorizontal && "flex items-start space-x-4 space-y-0",
          className
        )}
        {...props}
      >
        {label && (
          <div className={cn(
            "space-y-1",
            isHorizontal && "w-48 flex-shrink-0 pt-2"
          )}>
            <label className={cn(
              "text-sm font-medium text-slate-700",
              required && "after:content-['*'] after:ml-1 after:text-red-500",
              error && "text-red-700"
            )}>
              {label}
            </label>
            {description && (
              <p className="text-xs text-slate-500">{description}</p>
            )}
          </div>
        )}
        
        <div className={cn(
          "space-y-1",
          isHorizontal && "flex-1"
        )}>
          {children}
          {error && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          )}
        </div>
      </div>
    )
  }
)

FormField.displayName = 'FormField'
