import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Plus, Trash2, Eye, EyeOff } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Form, 
  FormField, 
  FormInput, 
  FormTextarea, 
  FormSelect, 
  FormGroup,
  FormSheet
} from '@/components/ui/forms'
import { useCreateContract, useUpdateContract } from '@/hooks/useContracts'
import { useHotels } from '@/hooks/useHotels'
import type { HotelContract, ContractTerms } from '@/types/database.types'
import { toast } from 'sonner'

const contractSchema = z.object({
  hotel_id: z.string().min(1, 'Hotel is required'),
  contract_reference_number: z.string().optional(),
  contract_status: z.enum(['draft', 'active', 'expired', 'cancelled']),
  contract_document_url: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
})

type ContractFormData = z.infer<typeof contractSchema>

interface ContractFormProps {
  contract?: HotelContract | null
  onClose: () => void
}

export function ContractForm({ contract, onClose }: ContractFormProps) {
  const [terms, setTerms] = useState<ContractTerms>(
    contract?.terms || {
      contract_dates: { start_date: '', end_date: '' },
      payment: { deposit_percentage: 0, deposit_amount: 0, payment_terms: '', currency: 'GBP' },
      cancellation: { policy_text: '', penalty_tiers: [] },
      attrition: { threshold_percentage: 0, penalty_per_room: 0 },
      cutoff_date: '',
      special_terms: []
    }
  )
  const [showJsonView, setShowJsonView] = useState(false)
  const [newSpecialTerm, setNewSpecialTerm] = useState('')

  const { data: hotels } = useHotels()
  const createContract = useCreateContract()
  const updateContract = useUpdateContract()

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      hotel_id: contract?.hotel_id || '',
      contract_reference_number: contract?.contract_reference_number || '',
      contract_status: contract?.contract_status || 'draft',
      contract_document_url: contract?.contract_document_url || '',
      notes: contract?.notes || '',
    }
  })

  const onSubmit = async (data: ContractFormData) => {
    try {
      const contractData = {
        ...data,
        contract_id: contract?.contract_id || crypto.randomUUID(),
        terms,
        created_at: contract?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      if (contract) {
        await updateContract.mutateAsync(contractData)
        toast.success('Contract updated successfully')
      } else {
        await createContract.mutateAsync(contractData)
        toast.success('Contract created successfully')
      }
      
      onClose()
    } catch (error) {
      toast.error('Failed to save contract')
      console.error(error)
    }
  }

  const updateTerms = (field: keyof ContractTerms, value: any) => {
    setTerms(prev => ({ ...prev, [field]: value }))
  }

  const addPenaltyTier = () => {
    const newTiers = [...(terms.cancellation?.penalty_tiers || []), { days_before: 0, penalty_percentage: 0 }]
    updateTerms('cancellation', { ...terms.cancellation, penalty_tiers: newTiers })
  }

  const updatePenaltyTier = (index: number, field: 'days_before' | 'penalty_percentage', value: number) => {
    const newTiers = [...(terms.cancellation?.penalty_tiers || [])]
    newTiers[index] = { ...newTiers[index], [field]: value }
    updateTerms('cancellation', { ...terms.cancellation, penalty_tiers: newTiers })
  }

  const removePenaltyTier = (index: number) => {
    const newTiers = (terms.cancellation?.penalty_tiers || []).filter((_, i) => i !== index)
    updateTerms('cancellation', { ...terms.cancellation, penalty_tiers: newTiers })
  }

  const addSpecialTerm = () => {
    if (newSpecialTerm.trim()) {
      const newTerms = [...(terms.special_terms || []), newSpecialTerm.trim()]
      updateTerms('special_terms', newTerms)
      setNewSpecialTerm('')
    }
  }

  const removeSpecialTerm = (index: number) => {
    const newTerms = (terms.special_terms || []).filter((_, i) => i !== index)
    updateTerms('special_terms', newTerms)
  }

  return (
    <FormSheet
      open={true}
      onOpenChange={onClose}
      title={contract ? 'Edit Contract' : 'Add New Contract'}
      description={contract ? 'Update contract terms and conditions' : 'Create a new hotel contract with terms and conditions'}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel={contract ? 'Update Contract' : 'Create Contract'}
      loading={createContract.isPending || updateContract.isPending}
      size="lg"
    >
      <Form variant="minimal" onSubmit={handleSubmit(onSubmit)}>
          {/* Basic Information */}
          <FormGroup 
            title="Contract Information" 
            description="Basic contract details and hotel selection"
            layout="grid"
            columns={2}
          >
            <FormField
              label="Hotel"
              required
              error={errors.hotel_id?.message}
            >
              <FormSelect
                value={watch('hotel_id')}
                onChange={(e) => setValue('hotel_id', e.target.value)}
                placeholder="Select a hotel"
                error={!!errors.hotel_id}
              >
                <option value="">Select a hotel</option>
                {hotels?.map((hotel) => (
                  <option key={hotel.id} value={hotel.id}>
                    {hotel.name} - {hotel.city}, {hotel.country}
                  </option>
                ))}
              </FormSelect>
            </FormField>

            <FormField
              label="Reference Number"
              description="Unique contract reference"
            >
              <FormInput
                {...register('contract_reference_number')}
                placeholder="e.g., CONTRACT-2025-001"
              />
            </FormField>

            <FormField
              label="Status"
              description="Current contract status"
            >
              <FormSelect
                value={watch('contract_status')}
                onChange={(e) => setValue('contract_status', e.target.value as any)}
                placeholder="Select status"
              >
                <option value="">Select status</option>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </FormSelect>
            </FormField>

            <FormField
              label="Document URL"
              description="Link to contract document"
              error={errors.contract_document_url?.message}
            >
              <FormInput
                {...register('contract_document_url')}
                type="url"
                placeholder="https://example.com/contract.pdf"
                error={!!errors.contract_document_url}
              />
            </FormField>
          </FormGroup>

          {/* Contract Terms */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <Label className="text-lg font-medium">Contract Terms</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowJsonView(!showJsonView)}
                >
                  {showJsonView ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
                  {showJsonView ? 'Form View' : 'JSON View'}
                </Button>
              </div>
            </div>

            {showJsonView ? (
              <Card>
                <CardHeader>
                  <CardTitle>JSON Editor</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={JSON.stringify(terms, null, 2)}
                    onChange={(e) => {
                      try {
                        setTerms(JSON.parse(e.target.value))
                      } catch (error) {
                        // Invalid JSON, don't update
                      }
                    }}
                    rows={20}
                    className="font-mono text-sm"
                  />
                </CardContent>
              </Card>
            ) : (
              <Tabs defaultValue="dates" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="dates">Dates</TabsTrigger>
                  <TabsTrigger value="payment">Payment</TabsTrigger>
                  <TabsTrigger value="cancellation">Cancellation</TabsTrigger>
                  <TabsTrigger value="attrition">Attrition</TabsTrigger>
                  <TabsTrigger value="special">Special</TabsTrigger>
                </TabsList>

                <TabsContent value="dates" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={terms.contract_dates?.start_date || ''}
                        onChange={(e) => updateTerms('contract_dates', { ...terms.contract_dates, start_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={terms.contract_dates?.end_date || ''}
                        onChange={(e) => updateTerms('contract_dates', { ...terms.contract_dates, end_date: e.target.value })}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="payment" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Deposit Percentage</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={terms.payment?.deposit_percentage || 0}
                        onChange={(e) => updateTerms('payment', { ...terms.payment, deposit_percentage: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label>Deposit Amount</Label>
                      <Input
                        type="number"
                        min="0"
                        value={terms.payment?.deposit_amount || 0}
                        onChange={(e) => updateTerms('payment', { ...terms.payment, deposit_amount: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label>Currency</Label>
                      <FormSelect
                        value={terms.payment?.currency || 'GBP'}
                        onChange={(e) => updateTerms('payment', { ...terms.payment, currency: e.target.value })}
                        placeholder="Select currency"
                      >
                        <option value="GBP">GBP</option>
                        <option value="EUR">EUR</option>
                        <option value="USD">USD</option>
                      </FormSelect>
                    </div>
                  </div>
                  <div>
                    <Label>Payment Terms</Label>
                    <Textarea
                      value={terms.payment?.payment_terms || ''}
                      onChange={(e) => updateTerms('payment', { ...terms.payment, payment_terms: e.target.value })}
                      placeholder="e.g., Payment due 30 days before arrival"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="cancellation" className="space-y-4">
                  <div>
                    <Label>Cancellation Policy</Label>
                    <Textarea
                      value={terms.cancellation?.policy_text || ''}
                      onChange={(e) => updateTerms('cancellation', { ...terms.cancellation, policy_text: e.target.value })}
                      placeholder="Describe the cancellation policy..."
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label>Penalty Tiers</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addPenaltyTier}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Tier
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {(terms.cancellation?.penalty_tiers || []).map((tier, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <Input
                            type="number"
                            placeholder="Days before"
                            value={tier.days_before}
                            onChange={(e) => updatePenaltyTier(index, 'days_before', parseInt(e.target.value) || 0)}
                            className="w-32"
                          />
                          <Input
                            type="number"
                            placeholder="Penalty %"
                            value={tier.penalty_percentage}
                            onChange={(e) => updatePenaltyTier(index, 'penalty_percentage', parseFloat(e.target.value) || 0)}
                            className="w-32"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePenaltyTier(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="attrition" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Threshold Percentage</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={terms.attrition?.threshold_percentage || 0}
                        onChange={(e) => updateTerms('attrition', { ...terms.attrition, threshold_percentage: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label>Penalty per Room</Label>
                      <Input
                        type="number"
                        min="0"
                        value={terms.attrition?.penalty_per_room || 0}
                        onChange={(e) => updateTerms('attrition', { ...terms.attrition, penalty_per_room: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="special" className="space-y-4">
                  <div>
                    <Label>Cutoff Date</Label>
                    <Input
                      type="date"
                      value={terms.cutoff_date || ''}
                      onChange={(e) => updateTerms('cutoff_date', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={newSpecialTerm}
                        onChange={(e) => setNewSpecialTerm(e.target.value)}
                        placeholder="Add special term"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialTerm())}
                      />
                      <Button type="button" onClick={addSpecialTerm}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {(terms.special_terms || []).map((term, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Badge variant="secondary" className="flex items-center gap-1">
                            {term}
                            <button
                              type="button"
                              onClick={() => removeSpecialTerm(index)}
                              className="ml-1 hover:text-red-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>

          {/* Notes */}
          <FormGroup title="Additional Notes" description="Any additional information about the contract">
            <FormField
              label="Notes"
              description="Internal notes and comments"
            >
              <FormTextarea 
                {...register('notes')} 
                placeholder="Enter any additional notes about the contract..."
                rows={3}
              />
            </FormField>
          </FormGroup>

        </Form>
    </FormSheet>
  )
}
