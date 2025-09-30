import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { 
  FormField, 
  FormSelect, 
  FormSheet
} from '@/components/ui/forms'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { useCreateRate, useUpdateRate } from '@/hooks/useRates'
import { useInventory } from '@/hooks/useInventory'
import type { RoomRate, RoomRateWithDetails } from '@/types/database.types'
import { toast } from 'sonner'
import { Plus, Trash2, Calendar, Check, ChevronRight, ChevronLeft, Building, Receipt as ReceiptIcon, FileText } from 'lucide-react'

const rateComponentSchema = z.object({
  type: z.string().optional(),
  name: z.string().optional(),
  amount: z.number().min(0).optional(),
  is_percentage: z.boolean().default(false),
  is_taxable: z.boolean().default(true),
  rate_type: z.enum(['fixed', 'per_person_per_night', 'per_room_per_night']).default('fixed'),
  currency: z.string().optional(),
}).refine(
  (data) => {
    // If any field is provided, all required fields must be valid
    if (data.name || data.type || data.amount !== undefined) {
      return data.name && data.name.trim().length > 0 && 
             data.type && data.type.trim().length > 0 &&
             data.amount !== undefined && data.amount >= 0
    }
    return true // Allow completely empty objects
  },
  {
    message: "If adding a rate component, name, type, and amount are required"
  }
)

const taxRuleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  tax_type: z.enum(['percentage', 'per_person_per_night', 'per_room_per_night', 'fixed']),
  tax_rate: z.number().min(0),
  tax_currency: z.string().optional(),
  applies_to: z.array(z.string()).default([]),
}).refine(
  (data) => data.tax_type !== 'percentage' || (data.tax_rate >= 0 && data.tax_rate <= 100),
  {
    message: 'Percentage tax must be between 0 and 100',
    path: ['tax_rate']
  }
)

const rateSchema = z.object({
  rate_id: z.string().optional(),
  inventory_id: z.string().min(1, 'Inventory is required'),
  occupancy_type: z.enum(['single', 'double', 'triple', 'quad']),
  number_of_guests: z.number().int().min(1).max(8),
  rate_per_room_per_night: z.number().min(0),
  rate_currency: z.string().min(1),
  is_commissionable: z.boolean().default(false),
  commission_percentage: z.number().optional().nullable(),
  base_markup_percentage: z.number().optional().nullable(),
  extra_night_markup_percentage: z.number().optional().nullable(),
  rate_components: z.array(rateComponentSchema).optional().default([]),
  extra_night_before_rate: z.number().optional().nullable(),
  extra_night_after_rate: z.number().optional().nullable(),
  taxes: z.array(taxRuleSchema).optional().default([]),
  notes: z.string().optional().nullable(),
})

type RateFormData = z.infer<typeof rateSchema>

interface RateFormProps {
  rate?: RoomRateWithDetails
  preselectedInventoryId?: string
  onClose: () => void
}

export function RateForm({ rate, preselectedInventoryId, onClose }: RateFormProps) {
  const createRate = useCreateRate()
  const updateRate = useUpdateRate()
  const { data: inventory } = useInventory()
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const { register, handleSubmit, formState: { errors }, setValue, watch, control } = useForm<RateFormData>({
    resolver: zodResolver(rateSchema) as any,
    mode: 'onChange',
    defaultValues: {
      rate_id: rate?.rate_id,
      inventory_id: rate?.inventory_id || preselectedInventoryId || '',
      occupancy_type: rate?.occupancy_type || 'double',
      number_of_guests: rate?.number_of_guests ?? 2,
      rate_per_room_per_night: rate?.rate_per_room_per_night ?? 0,
      rate_currency: rate?.rate_currency || 'GBP',
      is_commissionable: rate?.is_commissionable ?? false,
      commission_percentage: rate?.commission_percentage ?? undefined,
      base_markup_percentage: rate?.base_markup_percentage ?? undefined,
      extra_night_markup_percentage: rate?.extra_night_markup_percentage ?? undefined,
      rate_components: rate?.rate_components || [],
      extra_night_before_rate: rate?.extra_night_before_rate ?? undefined,
      extra_night_after_rate: rate?.extra_night_after_rate ?? undefined,
      taxes: rate?.taxes || [],
      notes: rate?.notes || '',
    }
  })

  const { fields: componentFields, append: appendComponent, remove: removeComponent } = useFieldArray({
    control,
    name: 'rate_components'
  })

  const { fields: taxFields, append: appendTax, remove: removeTax } = useFieldArray({
    control,
    name: 'taxes'
  })

  // Step navigation functions
  const nextStep = () => {
    if (currentStep < 5) {
      setCompletedSteps(prev => [...prev.filter(s => s !== currentStep), currentStep])
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const goToStep = (step: number) => {
    if (step <= currentStep || completedSteps.includes(step)) {
      setCurrentStep(step)
    }
  }

  const isStepCompleted = (step: number) => completedSteps.includes(step)
  const isStepAccessible = (step: number) => step <= currentStep || completedSteps.includes(step)

  // Step definitions
  const steps = [
    {
      id: 1,
      title: 'Basic Information',
      icon: Building,
      description: 'Hotel, room type, and base rate'
    },
    {
      id: 2,
      title: 'Extra Night Rates',
      icon: Calendar,
      description: 'Before and after tour rates'
    },
    {
      id: 3,
      title: 'Rate Components',
      icon: ReceiptIcon,
      description: 'Service fees, breakfast, etc.'
    },
    {
      id: 4,
      title: 'Taxes & Fees',
      icon: FileText,
      description: 'Tax rules and fees'
    },
    {
      id: 5,
      title: 'Review & Confirm',
      icon: Check,
      description: 'Review and save rate'
    }
  ]


  // Progress sidebar component
  const ProgressSidebar = () => (
    <div className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col min-h-0">
      <div className="p-6 space-y-6 flex-shrink-0">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Rate Configuration</h3>
          <Progress value={(currentStep / 5) * 100} className="h-2" />
          <p className="text-sm text-slate-600 mt-2">Step {currentStep} of 5</p>
        </div>

        <div className="space-y-3">
          {steps.map((step) => {
            const Icon = step.icon
            const isCompleted = isStepCompleted(step.id)
            const isCurrent = currentStep === step.id
            const isAccessible = isStepAccessible(step.id)
            
            return (
              <button
                key={step.id}
                onClick={() => goToStep(step.id)}
                disabled={!isAccessible}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  isCurrent 
                    ? 'border-blue-500 bg-blue-50 text-blue-900' 
                    : isCompleted 
                      ? 'border-green-500 bg-green-50 text-green-900' 
                      : isAccessible
                        ? 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        : 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isCompleted 
                      ? 'bg-green-500 text-white' 
                      : isCurrent 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-slate-200 text-slate-500'
                  }`}>
                    {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-medium">{step.title}</p>
                    <p className="text-xs opacity-75">{step.description}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Summary of current inputs - scrollable */}
      <div className="flex-1 overflow-y-auto p-6 pt-0">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h4 className="font-medium text-slate-900 mb-3">Current Configuration</h4>
          <div className="space-y-2 text-sm">
            <div className="text-slate-500 text-xs">
              Configuration will update when you change steps
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  useEffect(() => {
    if (preselectedInventoryId && !rate) {
      setValue('inventory_id', preselectedInventoryId)
    }
  }, [preselectedInventoryId, rate, setValue])

  const onSubmit = async (data: RateFormData) => {
    console.log('Form submitted with data:', data)
    console.log('Form errors:', errors)
    console.log('Is creating new rate:', !rate)
    
    try {
      const timestamp = new Date().toISOString()
      
      // Clean up NaN values and filter out empty rate components
      const cleanData = {
        ...data,
        commission_percentage: isNaN(data.commission_percentage as any) ? undefined : data.commission_percentage,
        base_markup_percentage: isNaN(data.base_markup_percentage as any) ? undefined : data.base_markup_percentage,
        extra_night_markup_percentage: isNaN(data.extra_night_markup_percentage as any) ? undefined : data.extra_night_markup_percentage,
        extra_night_before_rate: isNaN(data.extra_night_before_rate as any) ? undefined : data.extra_night_before_rate,
        extra_night_after_rate: isNaN(data.extra_night_after_rate as any) ? undefined : data.extra_night_after_rate,
        rate_components: (data.rate_components || []).filter(comp => 
          comp.name && comp.name.trim().length > 0 && 
          comp.type && comp.type.trim().length > 0 &&
          comp.amount !== undefined && comp.amount >= 0
        ),
      }
      
      const rateData: RoomRate = {
        rate_id: rate?.rate_id || crypto.randomUUID(),
        inventory_id: cleanData.inventory_id,
        occupancy_type: cleanData.occupancy_type,
        number_of_guests: cleanData.number_of_guests,
        rate_per_room_per_night: cleanData.rate_per_room_per_night,
        rate_currency: cleanData.rate_currency,
        is_commissionable: cleanData.is_commissionable,
        commission_percentage: cleanData.is_commissionable ? (cleanData.commission_percentage ?? 0) : undefined,
        base_markup_percentage: cleanData.base_markup_percentage ?? undefined,
        extra_night_markup_percentage: cleanData.extra_night_markup_percentage ?? undefined,
        rate_components: cleanData.rate_components || [],
        extra_night_before_rate: cleanData.extra_night_before_rate ?? undefined,
        extra_night_after_rate: cleanData.extra_night_after_rate ?? undefined,
        taxes: cleanData.taxes || [],
        notes: cleanData.notes || undefined,
        created_at: rate?.created_at || timestamp,
        updated_at: timestamp,
      }

      console.log('Rate data to submit:', rateData)

      if (rate) {
        console.log('Updating existing rate...')
        await updateRate.mutateAsync(rateData)
        toast.success('Rate updated successfully')
      } else {
        console.log('Creating new rate...')
        await createRate.mutateAsync(rateData)
        toast.success('Rate created successfully')
      }
      onClose()
    } catch (err) {
      console.error('Error saving rate:', err)
      toast.error('Failed to save rate')
    }
  }

  // Step content components
  const BasicInfoStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Hotel & Room"
          required
          error={errors.inventory_id?.message}
        >
          <FormSelect
            value={watch('inventory_id')}
            onChange={(e) => setValue('inventory_id', e.target.value)}
            placeholder="Select hotel and room"
            error={!!errors.inventory_id}
          >
            <option value="">Select hotel and room</option>
            {inventory?.map((item) => (
              <option key={item.inventory_id} value={item.inventory_id}>
                {item.hotel?.name} - {item.room_type_name}
              </option>
            ))}
          </FormSelect>
        </FormField>

        <FormField
          label="Occupancy Type"
          required
          error={errors.occupancy_type?.message}
        >
          <FormSelect
            value={watch('occupancy_type')}
            onChange={(e) => setValue('occupancy_type', e.target.value as RateFormData['occupancy_type'])}
            placeholder="Select occupancy"
            error={!!errors.occupancy_type}
          >
            <option value="">Select occupancy</option>
            <option value="single">Single</option>
            <option value="double">Double</option>
            <option value="triple">Triple</option>
            <option value="quad">Quad</option>
          </FormSelect>
        </FormField>

        <div>
          <Label htmlFor="number_of_guests">Number of Guests *</Label>
          <Input
            id="number_of_guests"
            type="number"
            min={1}
            max={8}
            {...register('number_of_guests', { valueAsNumber: true })}
            className={errors.number_of_guests ? 'border-red-500' : ''}
          />
          {errors.number_of_guests && (
            <p className="text-red-500 text-sm mt-1">{errors.number_of_guests.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="rate_per_room_per_night">Rate per room/night *</Label>
          <Input
            id="rate_per_room_per_night"
            type="number"
            step="0.01"
            min={0}
            {...register('rate_per_room_per_night', { valueAsNumber: true })}
            className={errors.rate_per_room_per_night ? 'border-red-500' : ''}
          />
          {errors.rate_per_room_per_night && (
            <p className="text-red-500 text-sm mt-1">{errors.rate_per_room_per_night.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="rate_currency">Currency *</Label>
          <Select
            value={watch('rate_currency')}
            onValueChange={(v) => setValue('rate_currency', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GBP">GBP (£)</SelectItem>
              <SelectItem value="EUR">EUR (€)</SelectItem>
              <SelectItem value="USD">USD ($)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_commissionable"
            checked={watch('is_commissionable')}
            onCheckedChange={(checked) => setValue('is_commissionable', checked as boolean)}
          />
          <Label htmlFor="is_commissionable">This rate is commissionable</Label>
        </div>

        {watch('is_commissionable') && (
        <div>
          <Label htmlFor="commission_percentage">Commission Percentage</Label>
          <Input
            id="commission_percentage"
            type="number"
            step="0.01"
            min={0}
            max={100}
            {...register('commission_percentage', { valueAsNumber: true })}
            placeholder="0.00"
          />
        </div>
        )}
      </div>
    </div>
  )

  const ExtraRatesStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="extra_night_before_rate">Before Tour Rate (per night)</Label>
          <Input
            id="extra_night_before_rate"
            type="number"
            step="0.01"
            min={0}
            placeholder="0.00"
            {...register('extra_night_before_rate', { valueAsNumber: true })}
          />
        </div>

        <div>
          <Label htmlFor="extra_night_after_rate">After Tour Rate (per night)</Label>
          <Input
            id="extra_night_after_rate"
            type="number"
            step="0.01"
            min={0}
            placeholder="0.00"
            {...register('extra_night_after_rate', { valueAsNumber: true })}
          />
        </div>

        <div>
          <Label htmlFor="base_markup_percentage">Base Rate Markup %</Label>
          <Input
            id="base_markup_percentage"
            type="number"
            step="0.01"
            min={0}
            max={100}
            {...register('base_markup_percentage', { valueAsNumber: true })}
            placeholder="0.00"
          />
        </div>

        <div>
          <Label htmlFor="extra_night_markup_percentage">Extra Night Markup %</Label>
          <Input
            id="extra_night_markup_percentage"
            type="number"
            step="0.01"
            min={0}
            max={100}
            {...register('extra_night_markup_percentage', { valueAsNumber: true })}
            placeholder="0.00"
          />
        </div>
      </div>
    </div>
  )

  const ComponentsStep = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Rate Components</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => appendComponent({ type: 'breakfast', name: 'Breakfast', amount: 0, is_percentage: false, is_taxable: true, rate_type: 'fixed', currency: 'GBP' })}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Component
        </Button>
      </div>

      {componentFields.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <ReceiptIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No components added yet</p>
          <p className="text-sm">Add service fees, breakfast, or other components</p>
        </div>
      ) : (
        <div className="space-y-4">
          {componentFields.map((field, index) => (
            <Card key={field.id}>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Component Type</Label>
                    <Input
                      {...register(`rate_components.${index}.type`)}
                      placeholder="e.g., service_fee, breakfast"
                    />
                  </div>
                  <div>
                    <Label>Component Name</Label>
                    <Input
                      {...register(`rate_components.${index}.name`)}
                      placeholder="e.g., Service Charge"
                    />
                  </div>
                  <div>
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register(`rate_components.${index}.amount`, { valueAsNumber: true })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>Rate Type</Label>
                    <Select
                      value={watch(`rate_components.${index}.rate_type`)}
                      onValueChange={(value) => setValue(`rate_components.${index}.rate_type`, value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select rate type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                        <SelectItem value="per_person_per_night">Per Person Per Night (PPPN)</SelectItem>
                        <SelectItem value="per_room_per_night">Per Room Per Night</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Currency</Label>
                    <Select
                      value={watch(`rate_components.${index}.currency`) || 'GBP'}
                      onValueChange={(value) => setValue(`rate_components.${index}.currency`, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="CAD">CAD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        {...register(`rate_components.${index}.is_percentage`)}
                      />
                      <Label>Percentage</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        {...register(`rate_components.${index}.is_taxable`)}
                      />
                      <Label>Taxable</Label>
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeComponent(index)}
                  className="mt-4 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )

  const TaxesStep = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Taxes & Fees</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => appendTax({ name: '', tax_type: 'percentage', tax_rate: 0, applies_to: [] })}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Tax
        </Button>
      </div>

      {taxFields.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No taxes configured</p>
          <p className="text-sm">Add VAT, city taxes, or other fees</p>
        </div>
      ) : (
        <div className="space-y-4">
          {taxFields.map((field, index) => (
            <Card key={field.id}>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Tax Name</Label>
                    <Input
                      {...register(`taxes.${index}.name`)}
                      placeholder="e.g., VAT, City Tax"
                    />
                  </div>
                  <div>
                    <Label>Tax Type</Label>
                    <Select
                      value={watch(`taxes.${index}.tax_type`)}
                      onValueChange={(v) => setValue(`taxes.${index}.tax_type`, v as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="per_person_per_night">Per Person Per Night</SelectItem>
                        <SelectItem value="per_room_per_night">Per Room Per Night</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Tax Rate</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register(`taxes.${index}.tax_rate`, { valueAsNumber: true })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>Tax Currency</Label>
                    <Select
                      value={watch(`taxes.${index}.tax_currency`) || 'same'}
                      onValueChange={(v) => setValue(`taxes.${index}.tax_currency`, v === 'same' ? undefined : v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="same">Same as rate currency</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="CHF">CHF (CHF)</SelectItem>
                        <SelectItem value="CAD">CAD (C$)</SelectItem>
                        <SelectItem value="AUD">AUD (A$)</SelectItem>
                        <SelectItem value="JPY">JPY (¥)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-500 mt-1">
                      Currency applies to Fixed and PPPN taxes
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeTax(index)}
                  className="mt-4 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )

  const ReviewStep = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Review Rate Configuration</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-600">Hotel:</span>
              <span className="font-medium">
                {inventory?.find(inv => inv.inventory_id === watch('inventory_id'))?.hotel?.name || 'Not selected'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Room:</span>
              <span className="font-medium capitalize">{watch('occupancy_type')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Guests:</span>
              <span className="font-medium">{watch('number_of_guests')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Base Rate:</span>
              <span className="font-medium">£{watch('rate_per_room_per_night')}/night</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Currency:</span>
              <span className="font-medium">{watch('rate_currency')}</span>
            </div>
            {watch('is_commissionable') && (
              <div className="flex justify-between">
                <span className="text-slate-600">Commission:</span>
                <span className="font-medium">{watch('commission_percentage')}%</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Extra Night Rates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-600">Before Tour:</span>
              <span className="font-medium">£{watch('extra_night_before_rate') || '0'}/night</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">After Tour:</span>
              <span className="font-medium">£{watch('extra_night_after_rate') || '0'}/night</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Base Markup:</span>
              <span className="font-medium">{watch('base_markup_percentage') || '0'}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Extra Markup:</span>
              <span className="font-medium">{watch('extra_night_markup_percentage') || '0'}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {watch('rate_components') && watch('rate_components').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rate Components</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {watch('rate_components').map((component, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-slate-600">{component.name}</span>
                  <span className="font-medium">
                    {component.is_percentage ? `${component.amount}%` : `£${component.amount}`}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {watch('taxes') && watch('taxes').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Taxes & Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {watch('taxes').map((tax, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-slate-600">{tax.name}</span>
                  <span className="font-medium">
                    {tax.tax_type === 'percentage' && `${tax.tax_rate}%`}
                    {tax.tax_type === 'per_person_per_night' && `${tax.tax_currency || watch('rate_currency')} ${tax.tax_rate} PPPN`}
                    {tax.tax_type === 'per_room_per_night' && `${tax.tax_currency || watch('rate_currency')} ${tax.tax_rate} PRPN`}
                    {tax.tax_type === 'fixed' && `${tax.tax_currency || watch('rate_currency')} ${tax.tax_rate} Fixed`}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const StepContent = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep />
      case 2:
        return <ExtraRatesStep />
      case 3:
        return <ComponentsStep />
      case 4:
        return <TaxesStep />
      case 5:
        return <ReviewStep />
      default:
        return <BasicInfoStep />
    }
  }

  return (
    <FormSheet
      open={true}
      onOpenChange={onClose}
      title={rate ? 'Edit Rate' : 'Add New Rate'}
      description={rate ? 'Update rate details and pricing' : 'Create a new rate for inventory allocation'}
      onSubmit={() => {
        const form = document.querySelector('form')
        if (form) {
          form.requestSubmit()
        }
      }}
      submitLabel={rate ? 'Update Rate' : 'Create Rate'}
      loading={createRate.isPending || updateRate.isPending}
      size="3xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex h-full">
        <div className="hidden lg:block w-80 flex-shrink-0">
          <ProgressSidebar />
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-6 min-h-0">
            <div className="max-w-4xl">
              <StepContent />
            </div>
          </div>
          <div className="border-t border-slate-200 p-6 flex-shrink-0">
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                {currentStep !== 5 && (
                  <Button type="button" onClick={nextStep} className="flex items-center gap-2">
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </FormSheet>
  )
}