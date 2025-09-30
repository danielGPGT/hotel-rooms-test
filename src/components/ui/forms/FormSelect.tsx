import React from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  variant?: 'default' | 'filled' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  error?: boolean
  placeholder?: string
  children: React.ReactNode
}

export const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'md', 
    error,
    placeholder,
    children,
    ...props 
  }, ref) => {
    const baseClasses = "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer"
    
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
    
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            baseClasses,
            variantClasses[variant],
            sizeClasses[size],
            errorClasses,
            "pr-10",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
    )
  }
)

FormSelect.displayName = 'FormSelect'
