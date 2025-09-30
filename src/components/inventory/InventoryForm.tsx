import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { 
  Form, 
  FormField, 
  FormInput, 
  FormSelect, 
  FormSheet
} from '@/components/ui/forms'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useCreateInventory, useUpdateInventory } from '@/hooks/useInventory'
import { useTours } from '@/hooks/useTours'
import { useHotels } from '@/hooks/useHotels'
import { useContracts } from '@/hooks/useContracts'
import type { TourRoomInventory, Tour, Hotel } from '@/types/database.types'
import { toast } from 'sonner'
import { Calendar } from 'lucide-react'

const inventorySchema = z.object({
  tour_id: z.string().min(1, 'Tour is required'),
  hotel_id: z.string().min(1, 'Hotel is required'),
  check_in_date: z.string().min(1, 'Check-in date is required'),
  check_out_date: z.string().min(1, 'Check-out date is required'),
  room_type_id: z.string().min(1, 'Room type is required'),
  room_type_name: z.string().min(1, 'Room type name is required'),
  quantity_allocated: z.number().min(1, 'Quantity must be at least 1'),
  contract_id: z.string().optional(),
}).refine((data) => new Date(data.check_out_date) > new Date(data.check_in_date), {
  message: 'Check-out date must be after check-in date',
  path: ['check_out_date'],
})

type InventoryFormData = z.infer<typeof inventorySchema>

interface InventoryFormProps {
  inventory?: TourRoomInventory | null
  onClose: () => void
}

export function InventoryForm({ inventory, onClose }: InventoryFormProps) {
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null)
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null)
  const [availableRoomTypes, setAvailableRoomTypes] = useState<any[]>([])
  const [calculatedNights, setCalculatedNights] = useState(0)

  const { data: tours } = useTours()
  const { data: hotels } = useHotels()
  const { data: contracts } = useContracts()
  const createInventory = useCreateInventory()
  const updateInventory = useUpdateInventory()

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      tour_id: inventory?.tour_id || '',
      hotel_id: inventory?.hotel_id || '',
      check_in_date: inventory?.check_in_date || '',
      check_out_date: inventory?.check_out_date || '',
      room_type_id: inventory?.room_type_id || '',
      room_type_name: inventory?.room_type_name || '',
      quantity_allocated: inventory?.quantity_allocated || 1,
      contract_id: inventory?.contract_id || '',
    }
  })

  const watchedTourId = watch('tour_id')
  const watchedHotelId = watch('hotel_id')
  const watchedCheckIn = watch('check_in_date')
  const watchedCheckOut = watch('check_out_date')

  // Update selected tour when tour_id changes
  useEffect(() => {
    if (watchedTourId && tours) {
      const tour = tours.find(t => t.tour_id === watchedTourId)
      setSelectedTour(tour || null)
    }
  }, [watchedTourId, tours])

  // Update selected hotel when hotel_id changes
  useEffect(() => {
    if (watchedHotelId && hotels) {
      const hotel = hotels.find(h => h.id === watchedHotelId)
      setSelectedHotel(hotel || null)
      
      // Update available room types
      if (hotel?.room_groups) {
        setAvailableRoomTypes(hotel.room_groups)
      }
    }
  }, [watchedHotelId, hotels])

  // Calculate nights when dates change
  useEffect(() => {
    if (watchedCheckIn && watchedCheckOut) {
      const checkIn = new Date(watchedCheckIn)
      const checkOut = new Date(watchedCheckOut)
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
      setCalculatedNights(nights)
    }
  }, [watchedCheckIn, watchedCheckOut])

  const onSubmit = async (data: InventoryFormData) => {
    try {
      const payload = {
        ...data,
        contract_id: data.contract_id || undefined,
        inventory_id: inventory?.inventory_id || crypto.randomUUID(),
        created_at: inventory?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        quantity_sold: inventory?.quantity_sold || 0,
      }

      if (inventory) {
        await updateInventory.mutateAsync(payload)
        toast.success('Inventory updated successfully')
      } else {
        await createInventory.mutateAsync(payload)
        toast.success('Inventory created successfully')
      }
      
      onClose()
    } catch (error) {
      toast.error('Failed to save inventory')
      console.error(error)
    }
  }

  const handleRoomTypeChange = (roomTypeId: string) => {
    const roomType = availableRoomTypes.find(rt => rt.room_group_id.toString() === roomTypeId)
    if (roomType) {
      setValue('room_type_id', roomTypeId)
      setValue('room_type_name', roomType.name)
    }
  }


  const relevantContracts = contracts?.filter(c => c.hotel_id === watchedHotelId) || []

  return (
    <FormSheet
      open={true}
      onOpenChange={onClose}
      title={inventory ? 'Edit Inventory' : 'Add New Inventory'}
      description={inventory ? 'Update inventory allocation and details' : 'Create a new inventory allocation for a tour'}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel={inventory ? 'Update Inventory' : 'Create Inventory'}
      loading={createInventory.isPending || updateInventory.isPending}
      size="2xl"
    >
      <Form variant="minimal" onSubmit={handleSubmit(onSubmit)}>
          {/* Step 1: Tour Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                Select Tour
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <FormField
                  label="Tour"
                  required
                  error={errors.tour_id?.message}
                >
                  <FormSelect
                    value={watch('tour_id')}
                    onChange={(e) => setValue('tour_id', e.target.value)}
                    placeholder="Choose a tour"
                    error={!!errors.tour_id}
                  >
                    <option value="">Choose a tour</option>
                    {tours?.map((tour) => (
                      <option key={tour.tour_id} value={tour.tour_id}>
                        {tour.tour_code} - {tour.tour_name} ({new Date(tour.start_date).toLocaleDateString()} - {new Date(tour.end_date).toLocaleDateString()})
                      </option>
                    ))}
                  </FormSelect>
                </FormField>

                {selectedTour && (
                  <Alert>
                    <Calendar className="h-4 w-4" />
                    <AlertDescription>
                      <strong>{selectedTour.tour_name}</strong><br />
                      {new Date(selectedTour.start_date).toLocaleDateString()} - {new Date(selectedTour.end_date).toLocaleDateString()}
                      {selectedTour.tour_description && (
                        <><br />{selectedTour.tour_description}</>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Hotel Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                Select Hotel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <FormField
                  label="Hotel"
                  required
                  error={errors.hotel_id?.message}
                >
                  <FormSelect
                    value={watch('hotel_id')}
                    onChange={(e) => setValue('hotel_id', e.target.value)}
                    placeholder="Choose a hotel"
                    error={!!errors.hotel_id}
                  >
                    <option value="">Choose a hotel</option>
                    {hotels?.map((hotel) => (
                      <option key={hotel.id} value={hotel.id}>
                        {hotel.name} - {hotel.city}, {hotel.country}
                        {hotel.star_rating && ` (${hotel.star_rating}★)`}
                      </option>
                    ))}
                  </FormSelect>
                </FormField>

                {selectedHotel && (
                  <Alert>
                    <AlertDescription>
                      <strong>{selectedHotel.name}</strong><br />
                      {selectedHotel.city}, {selectedHotel.country}
                      {selectedHotel.star_rating && ` • ${selectedHotel.star_rating}★`}
                      {selectedHotel.hotel_chain && ` • ${selectedHotel.hotel_chain}`}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Room Type Selection */}
          {selectedHotel && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                  Select Room Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <FormField
                    label="Room Type"
                    required
                    error={errors.room_type_id?.message}
                  >
                    <FormSelect
                      value={watch('room_type_id')}
                      onChange={(e) => handleRoomTypeChange(e.target.value)}
                      placeholder="Choose a room type"
                      error={!!errors.room_type_id}
                    >
                      <option value="">Choose a room type</option>
                      {availableRoomTypes.map((roomType) => (
                        <option key={roomType.room_group_id} value={roomType.room_group_id.toString()}>
                          {roomType.name} (Capacity: {roomType.rg_ext?.capacity || 'N/A'})
                        </option>
                      ))}
                    </FormSelect>
                  </FormField>

                  {watch('room_type_name') && (
                    <Alert>
                      <AlertDescription>
                        <strong>Selected:</strong> {watch('room_type_name')}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Dates and Quantities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</span>
                Set Dates & Quantities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Check-in Date"
                  required
                  error={errors.check_in_date?.message}
                >
                  <FormInput
                    type="date"
                    {...register('check_in_date')}
                    error={!!errors.check_in_date}
                  />
                </FormField>

                <FormField
                  label="Check-out Date"
                  required
                  error={errors.check_out_date?.message}
                >
                  <FormInput
                    type="date"
                    {...register('check_out_date')}
                    error={!!errors.check_out_date}
                  />
                </FormField>

                <FormField
                  label="Quantity Allocated"
                  required
                  error={errors.quantity_allocated?.message}
                >
                  <FormInput
                    type="number"
                    min="1"
                    {...register('quantity_allocated', { valueAsNumber: true })}
                    error={!!errors.quantity_allocated}
                  />
                </FormField>

                <div>
                  <Label>Calculated Nights</Label>
                  <div className="flex items-center gap-2 p-2 bg-slate-50 rounded border">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span className="font-medium">{calculatedNights} nights</span>
                  </div>
                </div>
              </div>

              {calculatedNights > 0 && (
                <Alert className="mt-4">
                  <AlertDescription>
                    <strong>Booking Period:</strong> {calculatedNights} nights from {new Date(watchedCheckIn).toLocaleDateString()} to {new Date(watchedCheckOut).toLocaleDateString()}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Step 5: Contract (Optional) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">5</span>
                Link Contract (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                label="Contract"
                error={errors.contract_id?.message}
              >
                <FormSelect
                  value={watch('contract_id') || ''}
                  onChange={(e) => setValue('contract_id', e.target.value)}
                  placeholder="Choose a contract (optional)"
                  error={!!errors.contract_id}
                >
                  <option value="">Choose a contract (optional)</option>
                  {relevantContracts.map((contract) => (
                    <option key={contract.contract_id} value={contract.contract_id}>
                      {contract.contract_reference_number || 'No reference'} - {contract.contract_status}
                    </option>
                  ))}
                </FormSelect>
                {relevantContracts.length === 0 && (
                  <p className="text-sm text-slate-500 mt-1">No contracts available for this hotel</p>
                )}
              </FormField>
            </CardContent>
          </Card>

        </Form>
    </FormSheet>
  )
}
