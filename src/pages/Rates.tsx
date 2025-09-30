import { useState } from 'react'
import { Plus, Search, Filter, Edit, Eye, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRates, useDeleteRate } from '@/hooks/useRates'
import { RateForm } from '@/components/rates/RateForm'
import { RateView } from '@/components/rates/RateView'
import type { RoomRateWithDetails } from '@/types/database.types'

export function Rates() {
  const { data: rates, isLoading, error } = useRates()
  const deleteRate = useDeleteRate()
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showView, setShowView] = useState(false)
  const [editingRate, setEditingRate] = useState<RoomRateWithDetails | null>(null)
  const [viewingRate, setViewingRate] = useState<RoomRateWithDetails | null>(null)

  const filteredRates = rates?.filter(rate => 
    rate.inventory?.hotel?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rate.inventory?.room_type_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rate.inventory?.tour?.tour_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const handleEdit = (rate: RoomRateWithDetails) => {
    setEditingRate(rate)
    setShowForm(true)
  }

  const handleView = (rate: RoomRateWithDetails) => {
    setViewingRate(rate)
    setShowView(true)
  }

  const handleDelete = async (rateId: string) => {
    if (confirm('Are you sure you want to delete this rate?')) {
      try {
        await deleteRate.mutateAsync(rateId)
      } catch (e) {
        // no-op, react-query will surface errors
      }
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingRate(null)
  }

  const handleCloseView = () => {
    setShowView(false)
    setViewingRate(null)
  }

  const formatCurrency = (amount: number, currency: string = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
          <div className="h-10 w-32 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading rates: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Room Rates</h1>
          <p className="text-slate-600">Manage pricing for room inventory</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Rate
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search rates by hotel, room type, or tour..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Rates List */}
      {filteredRates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-slate-400 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {searchTerm ? 'No rates found' : 'No rates yet'}
            </h3>
            <p className="text-slate-600 mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Get started by adding your first rate'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Rate
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredRates.map((rate) => (
            <Card key={rate.rate_id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {rate.inventory?.hotel?.name || 'Unknown Hotel'}
                    </CardTitle>
                    <p className="text-slate-600">
                      {rate.inventory?.room_type_name || 'Unknown Room'} • {rate.inventory?.tour?.tour_name || 'Unknown Tour'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      {rate.occupancy_type}
                    </Badge>
                    {rate.is_commissionable && (
                      <Badge variant="secondary">
                        Commissionable
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-slate-600">
                    <p>
                      {rate.number_of_guests} guests • {formatCurrency(rate.rate_per_room_per_night, rate.rate_currency)}/night
                    </p>
                    {rate.commission_percentage && (
                      <p>Commission: {rate.commission_percentage}%</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleView(rate)}>
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(rate)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(rate.rate_id)} className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <RateForm rate={editingRate} onClose={handleCloseForm} />
      )}

      {showView && (
        <RateView rate={viewingRate} onClose={handleCloseView} />
      )}
    </div>
  )
}

export default Rates
