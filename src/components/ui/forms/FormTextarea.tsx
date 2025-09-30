import React from 'react'
import { cn } from '@/lib/utils'

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'filled' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  error?: boolean
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
}

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'md', 
    error,
    resize = 'vertical',
    ...props 
  }, ref) => {
    const baseClasses = "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    
    const variantClasses = {
      default: "border-slate-300 focus:border-blue-500 focus:ring-blue-500",
      filled: "border-transparent bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500",
      outline: "border-slate-300 bg-transparent focus:border-blue-500 focus:ring-blue-500"
    }
    
    const sizeClasses = {
      sm: "min-h-[60px] px-2 py-1 text-xs",
      md: "min-h-[80px] px-3 py-2 text-sm",
      lg: "min-h-[100px] px-4 py-3 text-base"
    }
    
    const resizeClasses = {
      none: "resize-none",
      vertical: "resize-y",
      horizontal: "resize-x",
      both: "resize"
    }
    
    const errorClasses = error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
    
    return (
      <textarea
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          resizeClasses[resize],
          errorClasses,
          className
        )}
        {...props}
      />
    )
  }
)

FormTextarea.displayName = 'FormTextarea'
