import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { TourRoomInventoryWithDetails } from '@/types/database.types'
import { Calendar, MapPin, Bed, Users, AlertTriangle, CheckCircle } from 'lucide-react'

interface InventoryViewProps {
  inventory: TourRoomInventoryWithDetails | null
  onClose: () => void
}

export function InventoryView({ inventory, onClose }: InventoryViewProps) {
  if (!inventory) return null

  const getAvailabilityStatus = (available: number, allocated: number) => {
    const percentage = (available / allocated) * 100
    if (percentage < 20) return { color: 'destructive', icon: AlertTriangle, text: 'Critical', bg: 'bg-red-50' }
    if (percentage < 50) return { color: 'secondary', icon: AlertTriangle, text: 'Low', bg: 'bg-yellow-50' }
    return { color: 'default', icon: CheckCircle, text: 'Good', bg: 'bg-green-50' }
  }

  const status = getAvailabilityStatus(inventory.quantity_available, inventory.quantity_allocated)

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Inventory Details
            <Badge variant={status.color} className={status.bg}>
              <status.icon className="w-3 h-3 mr-1" />
              {status.text} Availability
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Tour</label>
                  <p className="text-lg font-semibold">
                    {inventory.tour?.tour_name || 'Unknown Tour'}
                  </p>
                  <p className="text-sm text-slate-600">
                    {inventory.tour?.tour_code}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Hotel</label>
                  <p className="text-lg font-semibold">
                    {inventory.hotel?.name || 'Unknown Hotel'}
                  </p>
                  <p className="text-sm text-slate-600">
                    {inventory.hotel?.city}, {inventory.hotel?.country}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <div>
                    <label className="text-sm font-medium text-slate-600">Check-in</label>
                    <p className="font-medium">{new Date(inventory.check_in_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <div>
                    <label className="text-sm font-medium text-slate-600">Check-out</label>
                    <p className="font-medium">{new Date(inventory.check_out_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Bed className="w-4 h-4 text-slate-500" />
                  <div>
                    <label className="text-sm font-medium text-slate-600">Nights</label>
                    <p className="font-medium">{inventory.number_of_nights}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Room Details */}
          <Card>
            <CardHeader>
              <CardTitle>Room Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Room Type</label>
                  <p className="text-lg font-semibold">{inventory.room_type_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Room Type ID</label>
                  <p className="font-medium">{inventory.room_type_id}</p>
                </div>
              </div>

              {inventory.hotel?.room_groups && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Room Details</label>
                  <div className="mt-2 space-y-2">
                    {inventory.hotel.room_groups
                      .filter(rg => rg.room_group_id.toString() === inventory.room_type_id)
                      .map((roomGroup) => (
                        <div key={roomGroup.room_group_id} className="p-3 bg-slate-50 rounded border">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="font-medium">{roomGroup.name}</p>
                              <p className="text-sm text-slate-600">
                                {roomGroup.name_struct.main_name} • {roomGroup.name_struct.bedding_type}
                              </p>
                            </div>
                            <div className="text-sm text-slate-600">
                              <p>Capacity: {roomGroup.rg_ext?.capacity || 'N/A'}</p>
                              <p>Quality: {roomGroup.rg_ext?.quality || 'N/A'}</p>
                              <p>Bedrooms: {roomGroup.rg_ext?.bedrooms || 'N/A'}</p>
                            </div>
                          </div>
                          
                          {roomGroup.room_amenities && roomGroup.room_amenities.length > 0 && (
                            <div className="mt-3">
                              <label className="text-sm font-medium text-slate-600">Amenities</label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {roomGroup.room_amenities.slice(0, 8).map((amenity) => (
                                  <Badge key={amenity} variant="secondary" className="text-xs">
                                    {amenity}
                                  </Badge>
                                ))}
                                {roomGroup.room_amenities.length > 8 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{roomGroup.room_amenities.length - 8} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Availability & Quantities */}
          <Card>
            <CardHeader>
              <CardTitle>Availability & Quantities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-slate-50 rounded border">
                  <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{inventory.quantity_allocated}</p>
                  <p className="text-sm text-slate-600">Total Allocated</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded border">
                  <p className="text-2xl font-bold text-green-600">{inventory.quantity_sold}</p>
                  <p className="text-sm text-slate-600">Sold</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded border">
                  <p className="text-2xl font-bold text-orange-600">{inventory.quantity_available}</p>
                  <p className="text-sm text-slate-600">Available</p>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Availability</span>
                  <span>{Math.round((inventory.quantity_available / inventory.quantity_allocated) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      status.color === 'destructive' ? 'bg-red-500' : 
                      status.color === 'secondary' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${(inventory.quantity_available / inventory.quantity_allocated) * 100}%` }}
                  />
                </div>
              </div>

              {inventory.quantity_available < 5 && (
                <Alert className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Low Availability Warning:</strong> Only {inventory.quantity_available} rooms remaining. Consider increasing allocation or monitoring closely.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Contract Information */}
          {inventory.contract_id && (
            <Card>
              <CardHeader>
                <CardTitle>Contract Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  This inventory is linked to contract: {inventory.contract_id}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Rates Information */}
          {inventory.rates && inventory.rates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Associated Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {inventory.rates.map((rate) => (
                    <div key={rate.rate_id} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <div>
                        <span className="font-medium capitalize">{rate.occupancy_type}</span>
                        <span className="text-sm text-slate-600 ml-2">
                          ({rate.number_of_guests} guests)
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">
                          {new Intl.NumberFormat('en-GB', {
                            style: 'currency',
                            currency: rate.rate_currency,
                          }).format(rate.rate_per_room_per_night)}
                        </span>
                        <span className="text-sm text-slate-600">/night</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
