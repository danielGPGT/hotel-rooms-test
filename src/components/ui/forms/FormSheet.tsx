import React from 'react'
import { cn } from '@/lib/utils'
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter 
} from '@/components/ui/sheet'
import { FormButton } from './FormButton'
import { Save, ArrowLeft } from 'lucide-react'

interface FormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  onSubmit?: () => void
  onCancel?: () => void
  submitLabel?: string
  cancelLabel?: string
  loading?: boolean
  disabled?: boolean
  side?: 'left' | 'right' | 'top' | 'bottom'
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  showFooter?: boolean
  className?: string
}

export const FormSheet = React.forwardRef<HTMLDivElement, FormSheetProps>(
  ({ 
    open, 
    onOpenChange, 
    title, 
    description, 
    children, 
    onSubmit,
    onCancel,
    submitLabel = 'Save',
    cancelLabel = 'Cancel',
    loading = false,
    disabled = false,
    side = 'right',
    size = 'lg',
    showFooter = true,
    className,
    ...props 
  }, ref) => {
    const sizeClasses = {
      sm: '!w-[500px] !max-w-[500px]',
      md: '!w-[600px] !max-w-[600px]',
      lg: '!w-[800px] !max-w-[800px]',
      xl: '!w-[1000px] !max-w-[1000px]',
      '2xl': '!w-[1200px] !max-w-[1200px]',
      '3xl': '!w-[1400px] !max-w-[1400px]'
    }

    const handleCancel = () => {
      if (onCancel) {
        onCancel()
      } else {
        onOpenChange(false)
      }
    }

    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent 
          ref={ref}
          side={side}
          className={cn(
            sizeClasses[size],
            'flex flex-col',
            className
          )}
          {...props}
        >
          <SheetHeader className="flex-shrink-0 px-6 pt-6 pb-4">
            <SheetTitle className="text-xl font-semibold text-slate-900">
              {title}
            </SheetTitle>
            {description && (
              <SheetDescription className="text-slate-600">
                {description}
              </SheetDescription>
            )}
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="max-w-none">
              {children}
            </div>
          </div>

          {showFooter && (
            <SheetFooter className="flex-shrink-0 border-t border-slate-200 pt-4 px-6 pb-6">
              <div className="flex justify-end space-x-3 w-full">
                <FormButton
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                  icon={<ArrowLeft className="w-4 h-4" />}
                >
                  {cancelLabel}
                </FormButton>
                {onSubmit && (
                  <FormButton
                    type="button"
                    onClick={onSubmit}
                    loading={loading}
                    disabled={disabled}
                    icon={<Save className="w-4 h-4" />}
                  >
                    {submitLabel}
                  </FormButton>
                )}
              </div>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
    )
  }
)

FormSheet.displayName = 'FormSheet'
