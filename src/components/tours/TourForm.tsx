import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { 
  Form, 
  FormSelect, 
  FormSheet
} from '@/components/ui/forms'
import { useCreateTour, useUpdateTour } from '@/hooks/useTours'
import type { Tour } from '@/types/database.types'
import { toast } from 'sonner'

const tourSchema = z.object({
  tour_code: z.string().min(1, 'Tour code is required'),
  tour_name: z.string().min(1, 'Tour name is required'),
  tour_description: z.string().optional(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  status: z.enum(['planning', 'confirmed', 'completed', 'cancelled']),
}).refine((data) => new Date(data.end_date) >= new Date(data.start_date), {
  message: 'End date must be after start date',
  path: ['end_date'],
})

type TourFormData = z.infer<typeof tourSchema>

interface TourFormProps {
  tour?: Tour | null
  onClose: () => void
}

export function TourForm({ tour, onClose }: TourFormProps) {
  const createTour = useCreateTour()
  const updateTour = useUpdateTour()

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<TourFormData>({
    resolver: zodResolver(tourSchema),
    defaultValues: {
      tour_code: tour?.tour_code || '',
      tour_name: tour?.tour_name || '',
      tour_description: tour?.tour_description || '',
      start_date: tour?.start_date || '',
      end_date: tour?.end_date || '',
      status: tour?.status || 'planning',
    },
  })

  const onSubmit = async (data: TourFormData) => {
    try {
      const payload = {
        ...data,
        tour_id: tour?.tour_id || crypto.randomUUID(),
        created_at: tour?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      if (tour) {
        await updateTour.mutateAsync(payload)
        toast.success('Tour updated successfully')
      } else {
        await createTour.mutateAsync(payload)
        toast.success('Tour created successfully')
      }

      onClose()
    } catch (e) {
      toast.error('Failed to save tour')
      console.error(e)
    }
  }

  const generateCode = () => {
    const name = (watch('tour_name') || '').trim()
    const start = watch('start_date')
    const year = start ? new Date(start).getFullYear() : new Date().getFullYear()
    if (!name) return
    const prefix = name.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 4)
    const code = `${prefix}-${year}-${Math.floor(100 + Math.random()*900)}`
    setValue('tour_code', code)
  }

  return (
    <FormSheet
      open={true}
      onOpenChange={onClose}
      title={tour ? 'Edit Tour' : 'Add New Tour'}
      description={tour ? 'Update tour information and dates' : 'Create a new tour with basic information'}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel={tour ? 'Update Tour' : 'Create Tour'}
      loading={createTour.isPending || updateTour.isPending}
      size="lg"
    >
      <Form variant="minimal" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tour_name">Tour Name *</Label>
              <Input id="tour_name" {...register('tour_name')} className={errors.tour_name ? 'border-red-500' : ''} />
              {errors.tour_name && <p className="text-red-500 text-sm mt-1">{errors.tour_name.message}</p>}
            </div>
            <div>
              <Label htmlFor="tour_code">Tour Code *</Label>
              <div className="flex gap-2">
                <Input id="tour_code" {...register('tour_code')} className={errors.tour_code ? 'border-red-500' : ''} />
                <Button type="button" variant="outline" onClick={generateCode}>Suggest</Button>
              </div>
              {errors.tour_code && <p className="text-red-500 text-sm mt-1">{errors.tour_code.message}</p>}
            </div>
            <div>
              <Label htmlFor="start_date">Start Date *</Label>
              <Input id="start_date" type="date" {...register('start_date')} className={errors.start_date ? 'border-red-500' : ''} />
              {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date.message}</p>}
            </div>
            <div>
              <Label htmlFor="end_date">End Date *</Label>
              <Input id="end_date" type="date" {...register('end_date')} className={errors.end_date ? 'border-red-500' : ''} />
              {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date.message}</p>}
            </div>
            <div>
              <Label>Status</Label>
              <FormSelect
                value={watch('status')}
                onChange={(e) => setValue('status', e.target.value as Tour['status'])}
                placeholder="Select status"
              >
                <option value="">Select status</option>
                <option value="planning">Planning</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </FormSelect>
            </div>
          </div>

          <div>
            <Label htmlFor="tour_description">Description</Label>
            <Textarea id="tour_description" rows={3} {...register('tour_description')} />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </Form>
    </FormSheet>
  )
}
