import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Plus, Building, MapPin, Phone, Mail, Globe } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { 
  Form, 
  FormField, 
  FormInput, 
  FormTextarea, 
  FormSelect, 
  FormButton, 
  FormGroup,
  FormSheet
} from '@/components/ui/forms'
import { useCreateHotel, useUpdateHotel } from '@/hooks/useHotels'
import { RoomGroupsEditor } from './RoomGroupsEditor'
import type { Hotel, RoomGroup } from '@/types/database.types'
import { toast } from 'sonner'

const hotelSchema = z.object({
  name: z.string().min(1, 'Hotel name is required'),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  contact_person: z.string().optional(),
  star_rating: z.number().min(1).max(5).optional(),
  hotel_chain: z.string().optional(),
  kind: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  check_in_time: z.string().optional(),
  check_out_time: z.string().optional(),
  show_on_frontend: z.boolean(),
  is_closed: z.boolean(),
  notes: z.string().optional(),
})

type HotelFormData = z.infer<typeof hotelSchema>

interface HotelFormProps {
  hotel?: Hotel | null
  onClose: () => void
}

export function HotelForm({ hotel, onClose }: HotelFormProps) {
  const [roomGroups, setRoomGroups] = useState<RoomGroup[]>(
    hotel?.room_groups || []
  )
  const [amenities, setAmenities] = useState<string[]>(
    hotel?.amenities || []
  )
  const [newAmenity, setNewAmenity] = useState('')

  const createHotel = useCreateHotel()
  const updateHotel = useUpdateHotel()

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<HotelFormData>({
    resolver: zodResolver(hotelSchema),
    defaultValues: {
      name: hotel?.name || '',
      city: hotel?.city || '',
      country: hotel?.country || '',
      address: hotel?.address || '',
      phone: hotel?.phone || '',
      email: hotel?.email || '',
      contact_person: hotel?.contact_person || '',
      star_rating: hotel?.star_rating || undefined,
      hotel_chain: hotel?.hotel_chain || '',
      kind: hotel?.kind || '',
      latitude: hotel?.latitude || undefined,
      longitude: hotel?.longitude || undefined,
      check_in_time: hotel?.check_in_time || '',
      check_out_time: hotel?.check_out_time || '',
      show_on_frontend: hotel?.show_on_frontend ?? true,
      is_closed: hotel?.is_closed ?? false,
      notes: hotel?.notes || '',
    }
  })

  const onSubmit = async (data: HotelFormData) => {
    try {
      const hotelData = {
        ...data,
        id: hotel?.id || crypto.randomUUID(),
        amenities,
        room_groups: roomGroups,
        images: hotel?.images || [],
        description: hotel?.description || {},
        created_at: hotel?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      if (hotel) {
        await updateHotel.mutateAsync(hotelData)
        toast.success('Hotel updated successfully')
      } else {
        await createHotel.mutateAsync(hotelData)
        toast.success('Hotel created successfully')
      }
      
      onClose()
    } catch (error) {
      toast.error('Failed to save hotel')
      console.error(error)
    }
  }


  const addAmenity = () => {
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      setAmenities([...amenities, newAmenity.trim()])
      setNewAmenity('')
    }
  }

  const removeAmenity = (amenity: string) => {
    setAmenities(amenities.filter(a => a !== amenity))
  }

  return (
    <FormSheet
      open={true}
      onOpenChange={onClose}
      title={hotel ? 'Edit Hotel' : 'Add New Hotel'}
      description={hotel ? 'Update hotel information and settings' : 'Create a new hotel entry with all necessary details'}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel={hotel ? 'Update Hotel' : 'Create Hotel'}
      loading={createHotel.isPending || updateHotel.isPending}
      size="lg"
    >
      <Form variant="minimal" onSubmit={handleSubmit(onSubmit)}>
          {/* Basic Information */}
          <FormGroup 
            title="Basic Information" 
            description="Essential details about the hotel"
            layout="grid"
            columns={2}
          >
            <FormField
              label="Hotel Name"
              required
              error={errors.name?.message}
            >
              <FormInput
                {...register('name')}
                placeholder="Enter hotel name"
                icon={<Building className="w-4 h-4" />}
                error={!!errors.name}
              />
            </FormField>

            <FormField
              label="City"
              required
              error={errors.city?.message}
            >
              <FormInput
                {...register('city')}
                placeholder="Enter city"
                icon={<MapPin className="w-4 h-4" />}
                error={!!errors.city}
              />
            </FormField>

            <FormField
              label="Country"
              required
              error={errors.country?.message}
            >
              <FormInput
                {...register('country')}
                placeholder="Enter country"
                icon={<Globe className="w-4 h-4" />}
                error={!!errors.country}
              />
            </FormField>

            <FormField
              label="Address"
              description="Street address of the hotel"
            >
              <FormInput
                {...register('address')}
                placeholder="Enter street address"
                icon={<MapPin className="w-4 h-4" />}
              />
            </FormField>

            <FormField
              label="Phone Number"
              description="Contact phone number"
            >
              <FormInput
                {...register('phone')}
                type="tel"
                placeholder="Enter phone number"
                icon={<Phone className="w-4 h-4" />}
              />
            </FormField>

            <FormField
              label="Email Address"
              error={errors.email?.message}
            >
              <FormInput
                {...register('email')}
                type="email"
                placeholder="Enter email address"
                icon={<Mail className="w-4 h-4" />}
                error={!!errors.email}
              />
            </FormField>
          </FormGroup>

          {/* Hotel Details */}
          <FormGroup 
            title="Hotel Details" 
            description="Classification and type information"
            layout="grid"
            columns={3}
          >
            <FormField
              label="Star Rating"
              description="Official star rating"
            >
              <FormSelect
                value={watch('star_rating')?.toString() || ''}
                onChange={(e) => setValue('star_rating', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Select star rating"
              >
                <option value="">Select rating</option>
                <option value="1">⭐ 1 Star</option>
                <option value="2">⭐⭐ 2 Stars</option>
                <option value="3">⭐⭐⭐ 3 Stars</option>
                <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
              </FormSelect>
            </FormField>

            <FormField
              label="Hotel Chain"
              description="Brand or chain affiliation"
            >
              <FormInput
                {...register('hotel_chain')}
                placeholder="Enter hotel chain"
                icon={<Building className="w-4 h-4" />}
              />
            </FormField>

            <FormField
              label="Hotel Type"
              description="Type of accommodation"
            >
              <FormInput
                {...register('kind')}
                placeholder="e.g., Hotel, Resort, B&B"
                icon={<Building className="w-4 h-4" />}
              />
            </FormField>
          </FormGroup>

          {/* Location */}
          <FormGroup 
            title="Location Coordinates" 
            description="GPS coordinates for mapping"
            layout="grid"
            columns={2}
          >
            <FormField
              label="Latitude"
              description="North/South position"
            >
              <FormInput
                {...register('latitude', { valueAsNumber: true })}
                type="number"
                step="any"
                placeholder="e.g., 47.49747"
                icon={<MapPin className="w-4 h-4" />}
              />
            </FormField>

            <FormField
              label="Longitude"
              description="East/West position"
            >
              <FormInput
                {...register('longitude', { valueAsNumber: true })}
                type="number"
                step="any"
                placeholder="e.g., 19.07195"
                icon={<MapPin className="w-4 h-4" />}
              />
            </FormField>
          </FormGroup>

          {/* Room Groups */}
          <RoomGroupsEditor
            roomGroups={roomGroups}
            onChange={setRoomGroups}
          />

          {/* Amenities */}
          <FormGroup 
            title="Hotel Amenities" 
            description="Features and services available at the hotel"
          >
            <FormField
              label="Add Amenity"
              description="Type and press Enter to add amenities"
            >
              <div className="flex gap-2">
                <FormInput
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  placeholder="e.g., Swimming Pool, Gym, Spa"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                  icon={<Plus className="w-4 h-4" />}
                />
                <FormButton 
                  type="button" 
                  onClick={addAmenity}
                  variant="outline"
                  icon={<Plus className="w-4 h-4" />}
                >
                  Add
                </FormButton>
              </div>
            </FormField>
            
            {amenities.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {amenities.map((amenity) => (
                  <Badge key={amenity} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                    {amenity}
                    <button
                      type="button"
                      onClick={() => removeAmenity(amenity)}
                      className="ml-1 hover:text-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </FormGroup>

          {/* Settings */}
          <FormGroup 
            title="Hotel Settings" 
            description="Visibility and status options"
            layout="horizontal"
          >
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show_on_frontend"
                  checked={watch('show_on_frontend')}
                  onCheckedChange={(checked) => setValue('show_on_frontend', !!checked)}
                />
                <Label htmlFor="show_on_frontend">Show on frontend</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_closed"
                  checked={watch('is_closed')}
                  onCheckedChange={(checked) => setValue('is_closed', !!checked)}
                />
                <Label htmlFor="is_closed">Hotel is closed</Label>
              </div>
            </div>
          </FormGroup>

          {/* Notes */}
          <FormGroup title="Additional Notes" description="Any additional information about the hotel">
            <FormField
              label="Notes"
              description="Internal notes and comments"
            >
              <FormTextarea 
                {...register('notes')} 
                placeholder="Enter any additional notes about the hotel..."
                rows={4}
              />
            </FormField>
          </FormGroup>

        </Form>
    </FormSheet>
  )
}
