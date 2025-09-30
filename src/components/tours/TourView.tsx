import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Tour } from '@/types/database.types'
import { Badge } from '@/components/ui/badge'

interface TourViewProps {
  tour: Tour | null
  onClose: () => void
}

export function TourView({ tour, onClose }: TourViewProps) {
  if (!tour) return null

  const statusVariant = (status: Tour['status']) => {
    switch (status) {
      case 'confirmed': return 'default'
      case 'planning': return 'secondary'
      case 'completed': return 'outline'
      case 'cancelled': return 'destructive'
      default: return 'secondary'
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {tour.tour_name}
            <Badge variant={statusVariant(tour.status)}>{tour.status}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <div className="text-sm text-slate-600">Tour Code</div>
            <div className="font-medium">{tour.tour_code}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-slate-600">Start Date</div>
              <div>{new Date(tour.start_date).toLocaleDateString()}</div>
            </div>
            <div>
              <div className="text-sm text-slate-600">End Date</div>
              <div>{new Date(tour.end_date).toLocaleDateString()}</div>
            </div>
          </div>
          {tour.tour_description && (
            <div>
              <div className="text-sm text-slate-600">Description</div>
              <div className="text-sm">{tour.tour_description}</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
