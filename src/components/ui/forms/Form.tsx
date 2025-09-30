import React from 'react'
import { cn } from '@/lib/utils'

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'card' | 'minimal'
  size?: 'sm' | 'md' | 'lg'
}

export const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ children, className, variant = 'default', size = 'md', ...props }, ref) => {
    const baseClasses = "space-y-6"
    
    const variantClasses = {
      default: "p-6 bg-white rounded-lg border border-slate-200",
      card: "p-8 bg-white rounded-xl border border-slate-200 shadow-sm",
      minimal: "space-y-4"
    }
    
    const sizeClasses = {
      sm: "space-y-4",
      md: "space-y-6", 
      lg: "space-y-8"
    }

    return (
      <form
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </form>
    )
  }
)

Form.displayName = 'Form'
