import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { RoomRateWithDetails } from '@/types/database.types'

interface RateViewProps {
  rate: RoomRateWithDetails | null
  onClose: () => void
}

export function RateView({ rate, onClose }: RateViewProps) {
  if (!rate) return null

  const formatCurrency = (amount: number, currency: string = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rate Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-slate-700">
                <p className="font-medium">{rate.inventory?.hotel?.name || 'Unknown Hotel'}</p>
                <p>{rate.inventory?.room_type_name || 'Unknown Room'}</p>
                <p>{rate.inventory?.tour?.tour_name || 'Unknown Tour'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Occupancy</span>
                <span className="font-medium capitalize">{rate.occupancy_type}</span>
              </div>
              <div className="flex justify-between">
                <span>Guests</span>
                <span className="font-medium">{rate.number_of_guests}</span>
              </div>
              <div className="flex justify-between">
                <span>Rate per room/night</span>
                <span className="font-medium">{formatCurrency(rate.rate_per_room_per_night, rate.rate_currency)}</span>
              </div>
              <div className="flex justify-between">
                <span>Commissionable</span>
                <span className="font-medium">{rate.is_commissionable ? 'Yes' : 'No'}</span>
              </div>
              {rate.is_commissionable && (
                <div className="flex justify-between">
                  <span>Commission %</span>
                  <span className="font-medium">{rate.commission_percentage ?? 0}%</span>
                </div>
              )}
              {rate.base_markup_percentage && (
                <div className="flex justify-between">
                  <span>Base Rate Markup</span>
                  <span className="font-medium">{rate.base_markup_percentage}%</span>
                </div>
              )}
              {rate.extra_night_markup_percentage && (
                <div className="flex justify-between">
                  <span>Extra Night Markup</span>
                  <span className="font-medium">{rate.extra_night_markup_percentage}%</span>
                </div>
              )}
              {rate.extra_night_before_rate && (
                <div className="flex justify-between">
                  <span>Extra Night Before Rate</span>
                  <span className="font-medium">{formatCurrency(rate.extra_night_before_rate, rate.rate_currency)}/night</span>
                </div>
              )}
              {rate.extra_night_after_rate && (
                <div className="flex justify-between">
                  <span>Extra Night After Rate</span>
                  <span className="font-medium">{formatCurrency(rate.extra_night_after_rate, rate.rate_currency)}/night</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}


