import React from 'react'
import { cn } from '@/lib/utils'

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'filled' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  error?: boolean
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'md', 
    icon, 
    iconPosition = 'left',
    error,
    ...props 
  }, ref) => {
    const baseClasses = "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    
    const variantClasses = {
      default: "border-slate-300 focus:border-blue-500 focus:ring-blue-500",
      filled: "border-transparent bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500",
      outline: "border-slate-300 bg-transparent focus:border-blue-500 focus:ring-blue-500"
    }
    
    const sizeClasses = {
      sm: "h-8 px-2 text-xs",
      md: "h-10 px-3 text-sm",
      lg: "h-12 px-4 text-base"
    }
    
    const errorClasses = error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
    
    const inputClasses = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      errorClasses,
      icon && iconPosition === 'left' && "pl-10",
      icon && iconPosition === 'right' && "pr-10",
      className
    )

    if (icon) {
      return (
        <div className="relative">
          {iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={inputClasses}
            {...props}
          />
          {iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          )}
        </div>
      )
    }

    return (
      <input
        ref={ref}
        className={inputClasses}
        {...props}
      />
    )
  }
)

FormInput.displayName = 'FormInput'
