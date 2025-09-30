import { useState } from 'react'
import { Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useContracts, useDeleteContract } from '@/hooks/useContracts'
import { ContractForm } from '@/components/contracts/ContractForm'
import { ContractView } from '@/components/contracts/ContractView'
import type { HotelContract } from '@/types/database.types'
import { toast } from 'sonner'

export function Contracts() {
  const { data: contracts, isLoading, error } = useContracts()
  const deleteContract = useDeleteContract()
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showView, setShowView] = useState(false)
  const [editingContract, setEditingContract] = useState<HotelContract | null>(null)
  const [viewingContract, setViewingContract] = useState<HotelContract | null>(null)

  const filteredContracts = contracts?.filter(contract => 
    contract.contract_reference_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.hotel?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'draft': return 'secondary'
      case 'expired': return 'destructive'
      case 'cancelled': return 'destructive'
      default: return 'secondary'
    }
  }

  const handleEdit = (contract: HotelContract) => {
    setEditingContract(contract)
    setShowForm(true)
  }

  const handleDelete = async (contractId: string) => {
    if (confirm('Are you sure you want to delete this contract?')) {
      try {
        await deleteContract.mutateAsync(contractId)
        toast.success('Contract deleted successfully')
      } catch (error) {
        toast.error('Failed to delete contract')
        console.error(error)
      }
    }
  }

  const handleView = (contract: HotelContract) => {
    setViewingContract(contract)
    setShowView(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingContract(null)
  }

  const handleCloseView = () => {
    setShowView(false)
    setViewingContract(null)
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
        <p className="text-red-600">Error loading contracts: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contracts</h1>
          <p className="text-slate-600">Manage hotel contracts and terms</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Contract
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search contracts by reference or hotel..."
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

      {/* Contracts List */}
      {filteredContracts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-slate-400 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {searchTerm ? 'No contracts found' : 'No contracts yet'}
            </h3>
            <p className="text-slate-600 mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Get started by adding your first contract'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Contract
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredContracts.map((contract) => (
            <Card key={contract.contract_id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {contract.hotel?.name || 'Unknown Hotel'}
                    </CardTitle>
                    <p className="text-slate-600">
                      {contract.contract_reference_number || 'No reference number'}
                    </p>
                  </div>
                  <Badge variant={getStatusColor(contract.contract_status)}>
                    {contract.contract_status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-slate-600">
                    <p>Created: {new Date(contract.created_at).toLocaleDateString()}</p>
                    {contract.hotel && (
                      <p>Hotel: {contract.hotel.city}, {contract.hotel.country}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(contract)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleView(contract)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(contract.contract_id)}
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

      {/* Contract Form Modal */}
      {showForm && (
        <ContractForm
          contract={editingContract}
          onClose={handleCloseForm}
        />
      )}

      {/* Contract View Modal */}
      {showView && (
        <ContractView
          contract={viewingContract}
          onClose={handleCloseView}
        />
      )}
    </div>
  )
}

export default Contracts
