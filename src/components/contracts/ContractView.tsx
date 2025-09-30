import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { HotelContract } from '@/types/database.types'

interface ContractViewProps {
  contract: HotelContract | null
  onClose: () => void
}

export function ContractView({ contract, onClose }: ContractViewProps) {
  if (!contract) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'draft': return 'secondary'
      case 'expired': return 'destructive'
      case 'cancelled': return 'destructive'
      default: return 'secondary'
    }
  }

  const formatCurrency = (amount: number, currency: string = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Contract Details
            <Badge variant={getStatusColor(contract.contract_status)}>
              {contract.contract_status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Hotel</label>
                  <p className="text-lg font-semibold">
                    {contract.hotel?.name || 'Unknown Hotel'}
                  </p>
                  <p className="text-sm text-slate-600">
                    {contract.hotel?.city}, {contract.hotel?.country}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Reference Number</label>
                  <p className="text-lg font-semibold">
                    {contract.contract_reference_number || 'No reference'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Created</label>
                  <p>{new Date(contract.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Last Updated</label>
                  <p>{new Date(contract.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
              {contract.contract_document_url && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Document</label>
                  <a 
                    href={contract.contract_document_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View Contract Document
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contract Terms */}
          {contract.terms && (
            <Card>
              <CardHeader>
                <CardTitle>Contract Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Contract Dates */}
                {contract.terms.contract_dates && (
                  <div>
                    <h4 className="font-medium mb-2">Contract Dates</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-slate-600">Start Date</label>
                        <p>{contract.terms.contract_dates.start_date || 'Not set'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-slate-600">End Date</label>
                        <p>{contract.terms.contract_dates.end_date || 'Not set'}</p>
                      </div>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Payment Terms */}
                {contract.terms.payment && (
                  <div>
                    <h4 className="font-medium mb-2">Payment Terms</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {contract.terms.payment.deposit_percentage && (
                        <div>
                          <label className="text-sm text-slate-600">Deposit Percentage</label>
                          <p>{contract.terms.payment.deposit_percentage}%</p>
                        </div>
                      )}
                      {contract.terms.payment.deposit_amount && (
                        <div>
                          <label className="text-sm text-slate-600">Deposit Amount</label>
                          <p>{formatCurrency(contract.terms.payment.deposit_amount, contract.terms.payment.currency)}</p>
                        </div>
                      )}
                      {contract.terms.payment.currency && (
                        <div>
                          <label className="text-sm text-slate-600">Currency</label>
                          <p>{contract.terms.payment.currency}</p>
                        </div>
                      )}
                    </div>
                    {contract.terms.payment.payment_terms && (
                      <div className="mt-4">
                        <label className="text-sm text-slate-600">Payment Terms</label>
                        <p className="text-sm">{contract.terms.payment.payment_terms}</p>
                      </div>
                    )}
                  </div>
                )}

                <Separator />

                {/* Cancellation Policy */}
                {contract.terms.cancellation && (
                  <div>
                    <h4 className="font-medium mb-2">Cancellation Policy</h4>
                    {contract.terms.cancellation.policy_text && (
                      <div className="mb-4">
                        <label className="text-sm text-slate-600">Policy</label>
                        <p className="text-sm">{contract.terms.cancellation.policy_text}</p>
                      </div>
                    )}
                    {contract.terms.cancellation.penalty_tiers && contract.terms.cancellation.penalty_tiers.length > 0 && (
                      <div>
                        <label className="text-sm text-slate-600">Penalty Tiers</label>
                        <div className="space-y-2 mt-2">
                          {contract.terms.cancellation.penalty_tiers.map((tier, index) => (
                            <div key={index} className="flex gap-4 text-sm">
                              <span>{tier.days_before} days before:</span>
                              <span className="font-medium">{tier.penalty_percentage}% penalty</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <Separator />

                {/* Attrition */}
                {contract.terms.attrition && (
                  <div>
                    <h4 className="font-medium mb-2">Attrition</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {contract.terms.attrition.threshold_percentage && (
                        <div>
                          <label className="text-sm text-slate-600">Threshold</label>
                          <p>{contract.terms.attrition.threshold_percentage}%</p>
                        </div>
                      )}
                      {contract.terms.attrition.penalty_per_room && (
                        <div>
                          <label className="text-sm text-slate-600">Penalty per Room</label>
                          <p>{formatCurrency(contract.terms.attrition.penalty_per_room)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Special Terms */}
                {contract.terms.cutoff_date && (
                  <div>
                    <h4 className="font-medium mb-2">Cutoff Date</h4>
                    <p>{contract.terms.cutoff_date}</p>
                  </div>
                )}

                {contract.terms.special_terms && contract.terms.special_terms.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Special Terms</h4>
                    <ul className="space-y-1">
                      {contract.terms.special_terms.map((term, index) => (
                        <li key={index} className="text-sm">• {term}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {contract.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{contract.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
