import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Form, 
  FormField, 
  FormInput, 
  FormTextarea, 
  FormSelect, 
  FormButton, 
  FormGroup 
} from '@/components/ui/forms'
import { User, Mail, Phone, MapPin, Building, Star } from 'lucide-react'

const exampleSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  company: z.string().min(2, 'Company name is required'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  city: z.string().min(2, 'City is required'),
  country: z.string().min(2, 'Country is required'),
  rating: z.string().min(1, 'Rating is required'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})

type ExampleFormData = z.infer<typeof exampleSchema>

export const ExampleForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<ExampleFormData>({
    resolver: zodResolver(exampleSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      address: '',
      city: '',
      country: '',
      rating: '',
      description: '',
      website: ''
    }
  })

  const onSubmit = async (data: ExampleFormData) => {
    console.log('Form submitted:', data)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    alert('Form submitted successfully!')
    reset()
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Beautiful Form Components</h1>
        <p className="text-slate-600">A showcase of our reusable form components with consistent styling and validation.</p>
      </div>

      <Form variant="card" onSubmit={handleSubmit(onSubmit)}>
        <FormGroup title="Personal Information" description="Basic details about the contact">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Full Name"
              required
              error={errors.name?.message}
            >
              <FormInput
                {...register('name')}
                placeholder="Enter your full name"
                icon={<User className="w-4 h-4" />}
                error={!!errors.name}
              />
            </FormField>

            <FormField
              label="Email Address"
              required
              error={errors.email?.message}
            >
              <FormInput
                {...register('email')}
                type="email"
                placeholder="Enter your email"
                icon={<Mail className="w-4 h-4" />}
                error={!!errors.email}
              />
            </FormField>

            <FormField
              label="Phone Number"
              required
              error={errors.phone?.message}
            >
              <FormInput
                {...register('phone')}
                type="tel"
                placeholder="Enter your phone number"
                icon={<Phone className="w-4 h-4" />}
                error={!!errors.phone}
              />
            </FormField>

            <FormField
              label="Company"
              required
              error={errors.company?.message}
            >
              <FormInput
                {...register('company')}
                placeholder="Enter your company name"
                icon={<Building className="w-4 h-4" />}
                error={!!errors.company}
              />
            </FormField>
          </div>
        </FormGroup>

        <FormGroup title="Location Details" description="Where is this business located?">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Address"
              required
              error={errors.address?.message}
            >
              <FormInput
                {...register('address')}
                placeholder="Enter street address"
                icon={<MapPin className="w-4 h-4" />}
                error={!!errors.address}
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
                error={!!errors.city}
              />
            </FormField>

            <FormField
              label="Country"
              required
              error={errors.country?.message}
            >
              <FormSelect
                {...register('country')}
                placeholder="Select country"
                error={!!errors.country}
              >
                <option value="">Select a country</option>
                <option value="US">United States</option>
                <option value="UK">United Kingdom</option>
                <option value="CA">Canada</option>
                <option value="AU">Australia</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="IT">Italy</option>
                <option value="ES">Spain</option>
                <option value="NL">Netherlands</option>
                <option value="BE">Belgium</option>
              </FormSelect>
            </FormField>

            <FormField
              label="Website"
              description="Optional website URL"
              error={errors.website?.message}
            >
              <FormInput
                {...register('website')}
                type="url"
                placeholder="https://example.com"
                error={!!errors.website}
              />
            </FormField>
          </div>
        </FormGroup>

        <FormGroup title="Business Information" description="Tell us more about the business">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Star Rating"
              required
              error={errors.rating?.message}
            >
              <FormSelect
                {...register('rating')}
                placeholder="Select star rating"
                error={!!errors.rating}
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
              label="Description"
              required
              error={errors.description?.message}
              description="Provide a detailed description of the business"
            >
              <FormTextarea
                {...register('description')}
                placeholder="Describe the business, its services, and what makes it special..."
                rows={4}
                error={!!errors.description}
              />
            </FormField>
          </div>
        </FormGroup>

        <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
          <FormButton
            type="button"
            variant="outline"
            onClick={() => reset()}
            disabled={isSubmitting}
          >
            Reset Form
          </FormButton>
          <FormButton
            type="submit"
            loading={isSubmitting}
            icon={<Star className="w-4 h-4" />}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Form'}
          </FormButton>
        </div>
      </Form>
    </div>
  )
}
