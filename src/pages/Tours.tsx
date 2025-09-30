import { useState } from 'react'
import { Plus, Search, Filter, Edit, Eye, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTours, useDeleteTour } from '@/hooks/useTours'
import { TourForm } from '@/components/tours/TourForm'
import { TourView } from '@/components/tours/TourView'
import type { Tour } from '@/types/database.types'
import { toast } from 'sonner'

export function Tours() {
  const { data: tours, isLoading, error } = useTours()
  const deleteTour = useDeleteTour()
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showView, setShowView] = useState(false)
  const [editingTour, setEditingTour] = useState<Tour | null>(null)
  const [viewingTour, setViewingTour] = useState<Tour | null>(null)

  const filteredTours = tours?.filter(tour => 
    tour.tour_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tour.tour_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default'
      case 'planning': return 'secondary'
      case 'completed': return 'outline'
      case 'cancelled': return 'destructive'
      default: return 'secondary'
    }
  }

  const handleEdit = (tour: Tour) => {
    setEditingTour(tour)
    setShowForm(true)
  }

  const handleView = (tour: Tour) => {
    setViewingTour(tour)
    setShowView(true)
  }

  const handleDelete = async (tour_id: string) => {
    if (!confirm('Delete this tour?')) return
    try {
      await deleteTour.mutateAsync(tour_id)
      toast.success('Tour deleted')
    } catch (e) {
      toast.error('Failed to delete tour')
      console.error(e)
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingTour(null)
  }

  const handleCloseView = () => {
    setShowView(false)
    setViewingTour(null)
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
        <p className="text-red-600">Error loading tours: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tours</h1>
          <p className="text-slate-600">Manage your tour programs</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Tour
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search tours by code or name..."
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

      {/* Tours List */}
      {filteredTours.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-slate-400 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {searchTerm ? 'No tours found' : 'No tours yet'}
            </h3>
            <p className="text-slate-600 mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Get started by adding your first tour'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Tour
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredTours.map((tour) => (
            <Card key={tour.tour_id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{tour.tour_name}</CardTitle>
                    <p className="text-slate-600">{tour.tour_code}</p>
                  </div>
                  <Badge variant={getStatusColor(tour.status)}>
                    {tour.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-slate-600">
                    <p>
                      {new Date(tour.start_date).toLocaleDateString()} - {new Date(tour.end_date).toLocaleDateString()}
                    </p>
                    {tour.tour_description && (
                      <p className="mt-1">{tour.tour_description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(tour)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleView(tour)}>
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(tour.tour_id)}
                      className="text-red-600 hover:text-red-700"
                    >
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

      {/* Tour Form */}
      {showForm && (
        <TourForm tour={editingTour} onClose={handleCloseForm} />
      )}

      {/* Tour View */}
      {showView && (
        <TourView tour={viewingTour} onClose={handleCloseView} />
      )}
    </div>
  )
}

export default Tours
