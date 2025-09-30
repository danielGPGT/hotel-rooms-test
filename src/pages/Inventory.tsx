import { useState } from 'react'
import { Plus, Search, Filter, Edit, Trash2, Eye, Calendar, MapPin, Bed, DollarSign, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useInventory, useDeleteInventory } from '@/hooks/useInventory'
import { useRates, useDeleteRate } from '@/hooks/useRates'
import { InventoryForm } from '@/components/inventory/InventoryForm'
import { InventoryView } from '@/components/inventory/InventoryView'
import { RateForm } from '@/components/rates/RateForm'
import type { TourRoomInventoryWithDetails, RoomRateWithDetails } from '@/types/database.types'
import { toast } from 'sonner'

export function Inventory() {
  const { data: inventory, isLoading, error } = useInventory()
  const { data: rates } = useRates()
  const deleteInventory = useDeleteInventory()
  const deleteRate = useDeleteRate()
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showView, setShowView] = useState(false)
  const [showRateForm, setShowRateForm] = useState(false)
  const [editingInventory, setEditingInventory] = useState<TourRoomInventoryWithDetails | null>(null)
  const [viewingInventory, setViewingInventory] = useState<TourRoomInventoryWithDetails | null>(null)
  const [editingRate, setEditingRate] = useState<RoomRateWithDetails | null>(null)
  const [selectedInventoryId, setSelectedInventoryId] = useState<string | null>(null)
  const [expandedTours, setExpandedTours] = useState<Set<string>>(new Set())

  const filteredInventory = inventory?.filter(item => 
    item.hotel?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.room_type_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tour?.tour_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const getAvailabilityStatus = (available: number, allocated: number) => {
    const percentage = (available / allocated) * 100
    if (percentage < 20) return { color: 'destructive', text: 'Critical' }
    if (percentage < 50) return { color: 'secondary', text: 'Low' }
    return { color: 'default', text: 'Good' }
  }

  const handleEdit = (inventory: TourRoomInventoryWithDetails) => {
    setEditingInventory(inventory)
    setShowForm(true)
  }

  const handleView = (inventory: TourRoomInventoryWithDetails) => {
    setViewingInventory(inventory)
    setShowView(true)
  }

  const handleDelete = async (inventoryId: string) => {
    if (confirm('Are you sure you want to delete this inventory item?')) {
      try {
        await deleteInventory.mutateAsync(inventoryId)
        toast.success('Inventory deleted successfully')
      } catch (error) {
        toast.error('Failed to delete inventory')
        console.error(error)
      }
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingInventory(null)
  }

  const handleCloseView = () => {
    setShowView(false)
    setViewingInventory(null)
  }

  const handleAddRate = (inventoryId: string) => {
    setSelectedInventoryId(inventoryId)
    setEditingRate(null)
    setShowRateForm(true)
  }

  const handleEditRate = (rate: RoomRateWithDetails) => {
    setEditingRate(rate)
    setSelectedInventoryId(null)
    setShowRateForm(true)
  }

  const handleDeleteRate = async (rateId: string) => {
    if (confirm('Are you sure you want to delete this rate?')) {
      try {
        await deleteRate.mutateAsync(rateId)
        toast.success('Rate deleted successfully')
      } catch (error) {
        toast.error('Failed to delete rate')
        console.error(error)
      }
    }
  }

  const handleCloseRateForm = () => {
    setShowRateForm(false)
    setEditingRate(null)
    setSelectedInventoryId(null)
  }

  const formatCurrency = (amount: number, currency: string = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const getRatesForInventory = (inventoryId: string) => {
    return rates?.filter(rate => rate.inventory_id === inventoryId) || []
  }

  const toggleTourExpansion = (tourId: string) => {
    const newExpanded = new Set(expandedTours)
    if (newExpanded.has(tourId)) {
      newExpanded.delete(tourId)
    } else {
      newExpanded.add(tourId)
    }
    setExpandedTours(newExpanded)
  }

  // Group inventory by tour
  const groupedInventory = filteredInventory?.reduce((acc, item) => {
    const tourId = item.tour_id
    if (!acc[tourId]) {
      acc[tourId] = {
        tour: item.tour,
        items: []
      }
    }
    acc[tourId].items.push(item)
    return acc
  }, {} as Record<string, { tour: any; items: TourRoomInventoryWithDetails[] }>) || {}

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
        <p className="text-red-600">Error loading inventory: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Room Inventory</h1>
          <p className="text-slate-600">Manage room allocations for tours</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Inventory
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search inventory by hotel, room type, or tour..."
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

      {/* Inventory List */}
      {filteredInventory.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-slate-400 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {searchTerm ? 'No inventory found' : 'No inventory yet'}
            </h3>
            <p className="text-slate-600 mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Get started by adding your first inventory item'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Inventory
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedInventory).map(([tourId, group]) => (
            <Card key={tourId} className="overflow-hidden">
              <Collapsible 
                open={expandedTours.has(tourId)} 
                onOpenChange={() => toggleTourExpansion(tourId)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        <div>
                          <CardTitle className="text-lg">{group.tour?.tour_name || 'Unknown Tour'}</CardTitle>
                          <p className="text-slate-600">{group.tour?.tour_code}</p>
                          <p className="text-sm text-slate-500">
                            {new Date(group.tour?.start_date || '').toLocaleDateString()} - {new Date(group.tour?.end_date || '').toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {group.items.length} inventory items
                        </Badge>
                        <Button variant="ghost" size="sm">
                          {expandedTours.has(tourId) ? 'Collapse' : 'Expand'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="border-t">
                    {group.items.map((item) => {
                      const status = getAvailabilityStatus(item.quantity_available, item.quantity_allocated)
                      return (
                        <div key={item.inventory_id} className="p-4 border-b last:border-b-0 hover:bg-slate-50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <MapPin className="w-4 h-4 text-slate-500" />
                                <span className="font-medium">{item.hotel?.name || 'Unknown Hotel'}</span>
                                <Badge variant={status.color} className="text-xs">
                                  {status.text}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-slate-600">
                                <div className="flex items-center gap-1">
                                  <Bed className="w-4 h-4" />
                                  {item.room_type_name}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(item.check_in_date).toLocaleDateString()} - {new Date(item.check_out_date).toLocaleDateString()}
                                </div>
                                <div>
                                  {item.quantity_available} / {item.quantity_allocated} available • {item.number_of_nights} nights
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleView(item)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEdit(item)}
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDelete(item.inventory_id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                          
                          {/* Rates Section */}
                          <div className="mt-4 pt-4 border-t border-slate-200">
                            <div className="flex justify-between items-center mb-3">
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-slate-500" />
                                <span className="text-sm font-medium text-slate-700">Rates</span>
                                <Badge variant="outline" className="text-xs">
                                  {getRatesForInventory(item.inventory_id).length} rates
                                </Badge>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleAddRate(item.inventory_id)}
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add Rate
                              </Button>
                            </div>
                            
                            {getRatesForInventory(item.inventory_id).length > 0 ? (
                              <div className="grid gap-2">
                                {getRatesForInventory(item.inventory_id).map((rate) => (
                                  <div key={rate.rate_id} className="flex justify-between items-center p-2 bg-slate-50 rounded border">
                                    <div className="flex items-center gap-3">
                                      <div className="flex items-center gap-1">
                                        <Users className="w-3 h-3 text-slate-500" />
                                        <span className="text-sm font-medium capitalize">{rate.occupancy_type}</span>
                                      </div>
                                      <div className="text-sm text-slate-600">
                                        {rate.number_of_guests} guests
                                      </div>
                                      <div className="text-sm font-medium">
                                        {formatCurrency(rate.rate_per_room_per_night, rate.rate_currency)}/night
                                      </div>
                                      {rate.is_commissionable && (
                                        <Badge variant="secondary" className="text-xs">
                                          {rate.commission_percentage || 0}% commission
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex gap-1">
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => handleEditRate(rate)}
                                      >
                                        <Edit className="w-3 h-3" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => handleDeleteRate(rate.rate_id)}
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-4 text-slate-500">
                                <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No rates configured</p>
                                <p className="text-xs">Add rates to enable pricing for this inventory</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      )}

      {/* Inventory Form Modal */}
      {showForm && (
        <InventoryForm
          inventory={editingInventory}
          onClose={handleCloseForm}
        />
      )}

      {/* Inventory View Modal */}
      {showView && (
        <InventoryView
          inventory={viewingInventory}
          onClose={handleCloseView}
        />
      )}

      {/* Rate Form Modal */}
      {showRateForm && (
        <RateForm
          rate={editingRate}
          preselectedInventoryId={selectedInventoryId || undefined}
          onClose={handleCloseRateForm}
        />
      )}
    </div>
  )
}

export default Inventory
