import { useState, useEffect } from 'react'
import { Calculator, Plus, Trash2, Download, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTours } from '@/hooks/useTours'
import { useInventory } from '@/hooks/useInventory'
import { useRates } from '@/hooks/useRates'
import { convertToGBP, formatCurrency as formatCurrencyUtil } from '@/lib/currency'
import type { TourRoomInventoryWithDetails, RoomRateWithDetails, QuoteItem, PricingCalculation } from '@/types/database.types'

export function PricingSandbox() {
  const [selectedTourId, setSelectedTourId] = useState<string>('')
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([])
  const [convertedItems, setConvertedItems] = useState<QuoteItem[]>([])
  const [isConverting, setIsConverting] = useState(false)
  
  const { data: tours } = useTours()
  const { data: inventory } = useInventory(selectedTourId)
  const { data: rates } = useRates()

  const selectedTour = tours?.find(tour => tour.tour_id === selectedTourId)
  const availableTours = tours?.filter(tour => 
    tour.status === 'confirmed' || tour.status === 'planning'
  ) || []

  const formatCurrency = (amount: number, currency: string = 'GBP') => {
    return formatCurrencyUtil(amount, currency)
  }

  // Convert all quote items to GBP
  const convertAllToGBP = async () => {
    if (quoteItems.length === 0) return

    setIsConverting(true)
    try {
      console.log('Starting currency conversion for', quoteItems.length, 'items')
      const converted = await Promise.all(
        quoteItems.map(async (item) => {
          console.log('Converting item:', item.hotel_name, 'Rate:', item.tour_rate)
          // Get the original currency from the rate data
          const originalCurrency = rates?.find(rate => 
            rate.inventory_id === item.inventory_id && 
            rate.occupancy_type === item.occupancy_type
          )?.rate_currency || 'GBP'
          
          console.log('Original currency:', originalCurrency)
          const tourRateGBP = await convertToGBP(item.tour_rate, originalCurrency)
          const extraRateBeforeGBP = await convertToGBP(item.extra_rate_before, originalCurrency)
          const extraRateAfterGBP = await convertToGBP(item.extra_rate_after, originalCurrency)
          
          console.log('Converted rates:', { tourRateGBP, extraRateBeforeGBP, extraRateAfterGBP })
          console.log('Original taxes:', item.taxes)

          // Convert taxes to GBP (both percentage and fixed amounts)
          const convertedTaxes = await Promise.all(
            (item.taxes || []).map(async (tax) => {
              if (tax.tax_type === 'per_person_per_night') {
                // Convert fixed PPPN amounts using tax currency or original currency
                const taxCurrency = tax.tax_currency || originalCurrency
                const convertedRate = await convertToGBP(tax.tax_rate, taxCurrency)
                return {
                  ...tax,
                  tax_rate: convertedRate
                }
              }
              // Percentage taxes don't need conversion
              return tax
            })
          )

          // Convert rate components
          const convertedComponents = await Promise.all(
            (item.rate_components || []).map(async (component: any) => {
              const componentCurrency = component.currency || originalCurrency
              if (componentCurrency !== 'GBP') {
                // Convert to GBP if not already in GBP
                const convertedAmount = await convertToGBP(component.amount, componentCurrency)
                return {
                  ...component,
                  amount: convertedAmount,
                  currency: 'GBP'
                }
              }
              // Already in GBP or no conversion needed
              return component
            })
          )

          // Recalculate pricing with converted values
          const tourCost = tourRateGBP * item.number_of_nights
          const extraCost = (item.extra_nights_before * extraRateBeforeGBP) + (item.extra_nights_after * extraRateAfterGBP)
          
          // Calculate rate components
          let componentsTotal = 0
          const totalNights = item.number_of_nights + item.extra_nights_before + item.extra_nights_after
          
          convertedComponents.forEach((component: any) => {
            let componentCost = 0
            
            if (component.is_percentage) {
              // Percentage components apply to subtotal
              componentCost = (tourCost + extraCost) * (component.amount / 100)
            } else {
              // Fixed amount components
              switch (component.rate_type) {
                case 'fixed':
                  componentCost = component.amount
                  break
                case 'per_person_per_night':
                  componentCost = component.amount * item.number_of_guests * totalNights
                  break
                case 'per_room_per_night':
                  componentCost = component.amount * totalNights
                  break
                default:
                  componentCost = component.amount
              }
            }
            
            componentsTotal += componentCost
          })
          
          const subtotal = tourCost + extraCost + componentsTotal
          
          // Calculate taxes separately for base tour and extra nights
          let baseTourTaxes = 0
          let extraNightTaxes = 0
          
          convertedTaxes.forEach(tax => {
            if (tax.tax_type === 'percentage') {
              // Apply percentage tax to each component
              baseTourTaxes += tourCost * (tax.tax_rate / 100)
              extraNightTaxes += extraCost * (tax.tax_rate / 100)
            } else if (tax.tax_type === 'per_person_per_night') {
              // Apply PPPN tax to each component
              baseTourTaxes += tax.tax_rate * item.number_of_guests * item.number_of_nights
              extraNightTaxes += tax.tax_rate * item.number_of_guests * (item.extra_nights_before + item.extra_nights_after)
            }
          })
          
          // Calculate base tour total (base + components + taxes + markup)
          const baseTourTotal = tourCost + componentsTotal + baseTourTaxes
          const baseTourMarkup = baseTourTotal * ((item.base_markup_percentage || 0) / 100)
          const baseTourFinal = baseTourTotal + baseTourMarkup
          
          // Calculate extra night total (extra + taxes + markup) - NO COMPONENTS
          let extraNightFinal = 0
          let extraNightMarkup = 0
          if (item.extra_nights_before > 0 || item.extra_nights_after > 0) {
            const extraNightTotal = extraCost + extraNightTaxes
            extraNightMarkup = extraNightTotal * ((item.extra_night_markup_percentage || 0) / 100)
            extraNightFinal = extraNightTotal + extraNightMarkup
          }
          
          // Calculate final totals
          const totalMarkup = baseTourMarkup + extraNightMarkup
          const finalTotalPerRoom = baseTourFinal + extraNightFinal
          
          const grandTotal = finalTotalPerRoom * item.quantity

          console.log('Converted taxes:', convertedTaxes)
          console.log('Final calculations:', { tourCost, extraCost, subtotal, totalTaxes: baseTourTaxes + extraNightTaxes, totalMarkup, grandTotal })

          return {
            ...item,
            tour_rate: tourRateGBP,
            extra_rate_before: extraRateBeforeGBP,
            extra_rate_after: extraRateAfterGBP,
            taxes: convertedTaxes,
            rate_components: convertedComponents,
            pricing: {
              ...item.pricing,
              tourCost,
              extraCost,
              componentsTotal,
              subtotal,
              totalTaxes: baseTourTaxes + extraNightTaxes,
              totalMarkup,
              totalPerRoom: finalTotalPerRoom,
              grandTotal,
              baseMarkupAmount: baseTourMarkup,
              extraMarkupAmount: extraNightMarkup
            }
          }
        })
      )
      setConvertedItems(converted)
    } catch (error) {
      console.error('Currency conversion failed:', error)
    } finally {
      setIsConverting(false)
    }
  }

  // Test currency conversion
  const testCurrencyConversion = async () => {
    console.log('Testing currency conversion...')
    try {
      const eurToGbp = await convertToGBP(100, 'EUR')
      console.log('100 EUR =', eurToGbp, 'GBP')
      
      const usdToGbp = await convertToGBP(100, 'USD')
      console.log('100 USD =', usdToGbp, 'GBP')

      // Test tax conversion
      const cityTaxEUR = await convertToGBP(2.50, 'EUR')
      console.log('City Tax 2.50 EUR =', cityTaxEUR, 'GBP')
      
      const serviceFeeUSD = await convertToGBP(15.00, 'USD')
      console.log('Service Fee 15.00 USD =', serviceFeeUSD, 'GBP')
    } catch (error) {
      console.error('Currency conversion test failed:', error)
    }
  }

  // Auto-convert when quote items change
  useEffect(() => {
    if (quoteItems.length > 0) {
      convertAllToGBP()
    }
  }, [quoteItems])

  const calculatePricing = (
    tourNights: number,
    tourRate: number,
    extraNightsBefore: number = 0,
    extraNightsAfter: number = 0,
    extraRateBefore: number = 0,
    extraRateAfter: number = 0,
    taxes: any[] = [],
    numberOfGuests: number,
    quantity: number = 1,
    baseMarkupPercentage: number = 0,
    extraNightMarkupPercentage: number = 0,
    rateComponents: any[] = []
  ): PricingCalculation => {
    // Calculate base costs without markup first
    const tourCost = tourNights * tourRate
    const extraCost = (extraNightsBefore * extraRateBefore) + (extraNightsAfter * extraRateAfter)
    
    // Calculate rate components
    let componentsTotal = 0
    const totalNights = tourNights + extraNightsBefore + extraNightsAfter
    
    rateComponents.forEach(component => {
      let componentCost = 0
      
      if (component.is_percentage) {
        // Percentage components apply to subtotal
        componentCost = (tourCost + extraCost) * (component.amount / 100)
      } else {
        // Fixed amount components
        switch (component.rate_type) {
          case 'fixed':
            componentCost = component.amount
            break
          case 'per_person_per_night':
            componentCost = component.amount * numberOfGuests * totalNights
            break
          case 'per_room_per_night':
            componentCost = component.amount * totalNights
            break
          default:
            componentCost = component.amount
        }
      }
      
      componentsTotal += componentCost
    })
    const subtotal = tourCost + extraCost + componentsTotal
    
    let totalTaxes = 0
    taxes.forEach(tax => {
      if (tax.tax_type === 'percentage') {
        totalTaxes += subtotal * (tax.tax_rate / 100)
      } else if (tax.tax_type === 'per_person_per_night') {
        totalTaxes += tax.tax_rate * numberOfGuests * (tourNights + extraNightsBefore + extraNightsAfter)
      }
    })
    
    // const subtotalWithTaxes = subtotal + totalTaxes
    
    // Calculate taxes separately for base tour and extra nights
    let baseTourTaxes = 0
    let extraNightTaxes = 0
    
    taxes.forEach(tax => {
      if (tax.tax_type === 'percentage') {
        // Apply percentage tax to each component
        baseTourTaxes += tourCost * (tax.tax_rate / 100)
        extraNightTaxes += extraCost * (tax.tax_rate / 100)
      } else if (tax.tax_type === 'per_person_per_night') {
        // Apply PPPN tax to each component
        baseTourTaxes += tax.tax_rate * numberOfGuests * tourNights
        extraNightTaxes += tax.tax_rate * numberOfGuests * (extraNightsBefore + extraNightsAfter)
      }
    })
    
    // Calculate base tour total (base + components + taxes + markup)
    const baseTourTotal = tourCost + componentsTotal + baseTourTaxes
    const baseTourMarkup = baseTourTotal * (baseMarkupPercentage / 100)
    const baseTourFinal = baseTourTotal + baseTourMarkup
    
    // Calculate extra night total (extra + taxes + markup) - NO COMPONENTS
    let extraNightFinal = 0
    let extraNightMarkup = 0
    if (extraNightsBefore > 0 || extraNightsAfter > 0) {
      const extraNightTotal = extraCost + extraNightTaxes
      extraNightMarkup = extraNightTotal * (extraNightMarkupPercentage / 100)
      extraNightFinal = extraNightTotal + extraNightMarkup
    }
    
    // Calculate final totals
    const totalMarkup = baseTourMarkup + extraNightMarkup
    const finalTotalPerRoom = baseTourFinal + extraNightFinal
    
    // Debug logging
    console.log('Pricing calculation debug:', {
      baseTourTotal,
      baseTourMarkup,
      extraNightTotal: extraNightFinal > 0 ? extraCost + componentsTotal + totalTaxes : 0,
      extraNightMarkup,
      baseMarkupPercentage,
      extraNightMarkupPercentage,
      totalMarkup,
      finalTotalPerRoom
    })
    
    // finalTotalPerRoom is already calculated above
    const grandTotal = finalTotalPerRoom * quantity
    
    console.log('Final calculation debug:', {
      baseTourFinal,
      extraNightFinal,
      totalMarkup,
      finalTotalPerRoom,
      quantity,
      grandTotal
    })

    return {
      tourCost,
      extraCost,
      componentsTotal,
      subtotal,
      totalTaxes,
      totalPerRoom: finalTotalPerRoom,
      grandTotal,
      baseMarkupAmount: baseTourMarkup,
      extraMarkupAmount: extraNightMarkup,
      totalMarkup
    }
  }

  const addToQuote = (inventory: TourRoomInventoryWithDetails, rate: RoomRateWithDetails) => {
    const existingItem = quoteItems.find(item => 
      item.inventory_id === inventory.inventory_id && 
      item.occupancy_type === rate.occupancy_type
    )

    if (existingItem) {
      setQuoteItems(quoteItems.map(item => 
        item.inventory_id === inventory.inventory_id && item.occupancy_type === rate.occupancy_type
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      const newItem: QuoteItem = {
        inventory_id: inventory.inventory_id,
        hotel_name: inventory.hotel?.name || 'Unknown Hotel',
        room_type_name: inventory.room_type_name,
        occupancy_type: rate.occupancy_type,
        number_of_guests: rate.number_of_guests,
        check_in_date: inventory.check_in_date,
        check_out_date: inventory.check_out_date,
        number_of_nights: inventory.number_of_nights,
        quantity: 1,
        extra_nights_before: 0,
        extra_nights_after: 0,
        tour_rate: rate.rate_per_room_per_night,
        extra_rate_before: rate.extra_night_before_rate || rate.rate_per_room_per_night,
        extra_rate_after: rate.extra_night_after_rate || rate.rate_per_room_per_night,
        base_markup_percentage: rate.base_markup_percentage,
        extra_night_markup_percentage: rate.extra_night_markup_percentage,
        taxes: rate.taxes || [],
        rate_components: rate.rate_components || [],
        pricing: calculatePricing(
          inventory.number_of_nights,
          rate.rate_per_room_per_night,
          0, 0, 0, 0,
          rate.taxes || [],
          rate.number_of_guests,
          1,
          rate.base_markup_percentage || 0,
          rate.extra_night_markup_percentage || 0,
          rate.rate_components || []
        )
      }
      setQuoteItems([...quoteItems, newItem])
    }
  }

  const updateQuoteItem = (inventoryId: string, occupancyType: string, updates: Partial<QuoteItem>) => {
    setQuoteItems(quoteItems.map(item => {
      if (item.inventory_id === inventoryId && item.occupancy_type === occupancyType) {
        const updatedItem = { ...item, ...updates }
        // Get the rate data to access current rates and markup percentages
        const rateData = rates?.find(r => r.inventory_id === inventoryId && r.occupancy_type === occupancyType)
        
        // Use current extra rates from rate data, not stored rates
        const currentExtraRateBefore = rateData?.extra_night_before_rate || rateData?.rate_per_room_per_night || updatedItem.extra_rate_before
        const currentExtraRateAfter = rateData?.extra_night_after_rate || rateData?.rate_per_room_per_night || updatedItem.extra_rate_after
        
        updatedItem.pricing = calculatePricing(
          updatedItem.number_of_nights,
          updatedItem.tour_rate,
          updatedItem.extra_nights_before,
          updatedItem.extra_nights_after,
          currentExtraRateBefore,
          currentExtraRateAfter,
          updatedItem.taxes,
          updatedItem.number_of_guests,
          updatedItem.quantity,
          rateData?.base_markup_percentage || 0,
          rateData?.extra_night_markup_percentage || 0,
          rateData?.rate_components || []
        )
        return updatedItem
      }
      return item
    }))
  }

  const removeFromQuote = (inventoryId: string, occupancyType: string) => {
    setQuoteItems(quoteItems.filter(item => 
      !(item.inventory_id === inventoryId && item.occupancy_type === occupancyType)
    ))
  }

  const clearQuote = () => {
    setQuoteItems([])
    setConvertedItems([])
  }

  const displayItems = convertedItems.length > 0 ? convertedItems : quoteItems

  const getTotalRooms = () => {
    return displayItems.reduce((sum, item) => sum + item.quantity, 0)
  }

  const getTotalGuests = () => {
    return displayItems.reduce((sum, item) => sum + (item.number_of_guests * item.quantity), 0)
  }

  const getGrandTotal = () => {
    return displayItems.reduce((sum, item) => sum + item.pricing.grandTotal, 0)
  }

  const getRatesForInventory = (inventoryId: string) => {
    return rates?.filter(rate => rate.inventory_id === inventoryId) || []
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pricing Sandbox</h1>
          <p className="text-slate-600">Create customer quotes and manage pricing</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={testCurrencyConversion}
          >
            Test Conversion
          </Button>
          <Button 
            variant="outline" 
            onClick={convertAllToGBP} 
            disabled={quoteItems.length === 0 || isConverting}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isConverting ? 'animate-spin' : ''}`} />
            {isConverting ? 'Converting...' : 'Convert to GBP'}
          </Button>
          <Button variant="outline" onClick={clearQuote} disabled={quoteItems.length === 0}>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Quote
          </Button>
          <Button variant="outline" disabled={quoteItems.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Available Rooms (60%) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tour Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Select Tour</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedTourId} onValueChange={setSelectedTourId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a tour to view available rooms" />
                </SelectTrigger>
                <SelectContent>
                  {availableTours.map((tour) => (
                    <SelectItem key={tour.tour_id} value={tour.tour_id}>
                      {tour.tour_code} - {tour.tour_name} ({new Date(tour.start_date).toLocaleDateString()} - {new Date(tour.end_date).toLocaleDateString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Selected Tour Info */}
          {selectedTour && (
            <Card>
              <CardHeader>
                <CardTitle>Tour Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Tour Code</Label>
                    <p className="text-lg font-semibold">{selectedTour.tour_code}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Status</Label>
                    <Badge variant={selectedTour.status === 'confirmed' ? 'default' : 'secondary'}>
                      {selectedTour.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Start Date</Label>
                    <p>{new Date(selectedTour.start_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">End Date</Label>
                    <p>{new Date(selectedTour.end_date).toLocaleDateString()}</p>
                  </div>
                </div>
                {selectedTour.tour_description && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium text-slate-600">Description</Label>
                    <p className="text-slate-700">{selectedTour.tour_description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Available Rooms */}
          {inventory && inventory.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Available Rooms</h3>
              {inventory.map((item) => {
                const itemRates = getRatesForInventory(item.inventory_id)
                return (
                  <Card key={item.inventory_id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{item.hotel?.name}</CardTitle>
                      <p className="text-slate-600">
                        Check-in: {new Date(item.check_in_date).toLocaleDateString()} | 
                        Check-out: {new Date(item.check_out_date).toLocaleDateString()} | 
                        {item.number_of_nights} nights
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{item.room_type_name}</h4>
                            <p className="text-sm text-slate-600">
                              Available: {item.quantity_available}/{item.quantity_allocated}
                            </p>
                          </div>
                        </div>

                        {itemRates.map((rate) => (
                          <div key={rate.rate_id} className="flex justify-between items-center p-3 border rounded-lg">
                            <div>
                              <p className="font-medium capitalize">{rate.occupancy_type}</p>
                              <p className="text-sm text-slate-600">
                                {rate.number_of_guests} guests • {formatCurrency(rate.rate_per_room_per_night, rate.rate_currency)}/night
                              </p>
                            </div>
                            <Button 
                              size="sm" 
                              onClick={() => addToQuote(item, rate)}
                              disabled={item.quantity_available === 0}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add to Quote
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {selectedTourId && (!inventory || inventory.length === 0) && (
            <Card>
              <CardContent className="text-center py-12">
                <Calculator className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No rooms available</h3>
                <p className="text-slate-600">
                  This tour doesn't have any room inventory yet. Add inventory first to create quotes.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel - Quote Summary (40%) */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Quote Summary</CardTitle>
                  {convertedItems.length > 0 && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      All prices in GBP
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {displayItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Calculator className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No items in quote</h3>
                    <p className="text-slate-600">
                      Select a tour and add rooms to build your quote.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                     {displayItems.map((item) => (
                      <Card key={`${item.inventory_id}-${item.occupancy_type}`} className="p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{item.hotel_name}</h4>
                              <p className="text-sm text-slate-600">
                                {item.room_type_name} ({item.occupancy_type})
                              </p>
                              <p className="text-sm text-slate-600">
                                {new Date(item.check_in_date).toLocaleDateString()} - {new Date(item.check_out_date).toLocaleDateString()} • {item.number_of_nights} nights
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromQuote(item.inventory_id, item.occupancy_type)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Label className="text-sm">Quantity:</Label>
                              <Input
                                type="number"
                                min="1"
                                max="10"
                                value={item.quantity}
                                onChange={(e) => updateQuoteItem(item.inventory_id, item.occupancy_type, { 
                                  quantity: parseInt(e.target.value) || 1 
                                })}
                                className="w-16 h-8"
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <Label className="text-sm">Extra nights before:</Label>
                              <Input
                                type="number"
                                min="0"
                                value={item.extra_nights_before}
                                onChange={(e) => updateQuoteItem(item.inventory_id, item.occupancy_type, { 
                                  extra_nights_before: parseInt(e.target.value) || 0 
                                })}
                                className="w-16 h-8"
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <Label className="text-sm">Extra nights after:</Label>
                              <Input
                                type="number"
                                min="0"
                                value={item.extra_nights_after}
                                onChange={(e) => updateQuoteItem(item.inventory_id, item.occupancy_type, { 
                                  extra_nights_after: parseInt(e.target.value) || 0 
                                })}
                                className="w-16 h-8"
                              />
                            </div>
                          </div>

                           {/* Enhanced Pricing Breakdown */}
                           <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                             <div className="flex justify-between items-center border-b pb-2">
                               <h5 className="font-medium text-slate-900">Pricing Breakdown</h5>
                               {/* Show markup percentages if they exist */}
                               {((item.base_markup_percentage && item.base_markup_percentage > 0) || (item.extra_night_markup_percentage && item.extra_night_markup_percentage > 0)) && (
                                 <div className="text-xs text-green-600">
                                   {item.base_markup_percentage && item.base_markup_percentage > 0 && (
                                     <span>Base: {item.base_markup_percentage}%</span>
                                   )}
                                   {item.base_markup_percentage && item.base_markup_percentage > 0 && item.extra_night_markup_percentage && item.extra_night_markup_percentage > 0 && (
                                     <span> • </span>
                                   )}
                                   {item.extra_night_markup_percentage && item.extra_night_markup_percentage > 0 && (
                                     <span>Extra: {item.extra_night_markup_percentage}%</span>
                                   )}
                                 </div>
                               )}
                             </div>
                             
                             {/* Base Tour Cost */}
                             <div className="space-y-2">
                               <div className="flex justify-between items-center">
                                 <span className="text-sm font-medium text-slate-700">Tour Nights</span>
                                 <span className="text-sm font-medium">{formatCurrency(item.pricing.tourCost)}</span>
                               </div>
                               <div className="flex justify-between text-xs text-slate-500 pl-2">
                                 <span>{item.number_of_nights} nights × {formatCurrency(item.tour_rate)} per night</span>
                                 <span>{formatCurrency(item.tour_rate * item.number_of_nights)}</span>
                               </div>
                               <div className="flex justify-between text-xs text-slate-400 pl-2">
                                 <span>Rate type: Base tour rate</span>
                                 <span>{item.number_of_guests} guests</span>
                               </div>
                             </div>

                             {/* Extra Nights */}
                             {(item.extra_nights_before > 0 || item.extra_nights_after > 0) && (
                               <div className="space-y-2">
                                 <div className="flex justify-between items-center">
                                   <span className="text-sm font-medium text-slate-700">Extra Nights</span>
                                   <span className="text-sm font-medium">{formatCurrency(item.pricing.extraCost)}</span>
                                 </div>
                                 {item.extra_nights_before > 0 && (
                                   <div className="flex justify-between text-xs text-slate-500 pl-2">
                                     <span>Before tour: {item.extra_nights_before} × {formatCurrency(item.extra_rate_before)} per night</span>
                                     <span>{formatCurrency(item.extra_nights_before * item.extra_rate_before)}</span>
                                   </div>
                                 )}
                                 {item.extra_nights_after > 0 && (
                                   <div className="flex justify-between text-xs text-slate-500 pl-2">
                                     <span>After tour: {item.extra_nights_after} × {formatCurrency(item.extra_rate_after)} per night</span>
                                     <span>{formatCurrency(item.extra_nights_after * item.extra_rate_after)}</span>
                                   </div>
                                 )}
                                 <div className="flex justify-between text-xs text-slate-400 pl-2">
                                   <span>Rate type: Extra night rate</span>
                                   <span>Total extra nights: {item.extra_nights_before + item.extra_nights_after}</span>
                                 </div>
                               </div>
                             )}

                             {/* Components */}
                             {(() => {
                               const rateData = rates?.find(r => r.inventory_id === item.inventory_id && r.occupancy_type === item.occupancy_type)
                               const components = item.rate_components || rateData?.rate_components || []
                               if (components.length > 0) {
                                 return (
                                   <div className="space-y-2">
                                     <div className="flex justify-between items-center">
                                       <span className="text-sm font-medium text-amber-700">Rate Components</span>
                                       <span className="text-xs text-amber-600">{components.length} component{components.length !== 1 ? 's' : ''}</span>
                                     </div>
                                     {components.map((comp, idx) => (
                                       <div key={idx} className="space-y-1 pl-2">
                                         <div className="flex justify-between text-xs text-amber-600">
                                           <span>{comp.name}</span>
                                           <span>
                                             {comp.is_percentage ? `${comp.amount || 0}%` : formatCurrency(comp.amount || 0, comp.currency || 'GBP')}
                                           </span>
                                         </div>
                                         <div className="flex justify-between text-xs text-amber-500 pl-2">
                                           <span>Type: {comp.type} • {comp.is_percentage ? 'Percentage' : 'Fixed amount'} • {comp.rate_type || 'fixed'} • {comp.currency || 'GBP'}</span>
                                           <span>{comp.is_taxable ? 'Taxable' : 'Non-taxable'}</span>
                                         </div>
                                       </div>
                                     ))}
                                   </div>
                                 )
                               }
                               return null
                             })()}

                             {/* Components Total */}
                             {item.pricing.componentsTotal > 0 && (
                               <div className="flex justify-between items-center border-t pt-2">
                                 <span className="font-medium text-amber-700">Components Total</span>
                                 <span className="font-medium text-amber-700">{formatCurrency(item.pricing.componentsTotal)}</span>
                               </div>
                             )}

                            

                             {/* Subtotal */}
                             <div className="flex justify-between items-center border-t pt-2">
                               <span className="font-medium text-slate-800">Subtotal</span>
                               <span className="font-medium">{formatCurrency(item.pricing.subtotal)}</span>
                             </div>

                             {/* Taxes */}
                             {item.pricing.totalTaxes > 0 && (
                               <div className="space-y-2">
                                 <div className="flex justify-between items-center">
                                   <span className="text-sm font-medium text-slate-700">Taxes & Fees</span>
                                   <span className="text-sm font-medium">{formatCurrency(item.pricing.totalTaxes)}</span>
                                 </div>
                                 {item.taxes && item.taxes.length > 0 && (
                                   <div className="space-y-2">
                                     {item.taxes.map((tax, i) => {
                                       const totalNights = item.number_of_nights + item.extra_nights_before + item.extra_nights_after
                                       let taxAmount = 0
                                       let calculation = ''
                                       
                                       if (tax.tax_type === 'percentage') {
                                         taxAmount = item.pricing.subtotal * (tax.tax_rate / 100)
                                         calculation = `${tax.tax_rate}% of ${formatCurrency(item.pricing.subtotal)}`
                                       } else if (tax.tax_type === 'per_person_per_night') {
                                         taxAmount = tax.tax_rate * item.number_of_guests * totalNights
                                         calculation = `${formatCurrency(tax.tax_rate)} × ${item.number_of_guests} guests × ${totalNights} nights`
                                       }
                                       
                                       return (
                                         <div key={i} className="space-y-1 pl-2 border-l-2 border-slate-200">
                                           <div className="flex justify-between text-xs text-slate-600">
                                             <span className="font-medium">{tax.name}</span>
                                             <span className="font-medium">{formatCurrency(taxAmount)}</span>
                                           </div>
                                           <div className="flex justify-between text-xs text-slate-500">
                                             <span>Type: {tax.tax_type === 'percentage' ? 'Percentage' : 'Per Person Per Night (PPPN)'}</span>
                                             <span>Rate: {tax.tax_type === 'percentage' ? `${tax.tax_rate}%` : `${tax.tax_currency || 'GBP'} ${tax.tax_rate}`}</span>
                                           </div>
                                           <div className="text-xs text-slate-400 pl-1">
                                             Calculation: {calculation}
                                           </div>
                                           {tax.applies_to && tax.applies_to.length > 0 && (
                                             <div className="text-xs text-slate-400 pl-1">
                                               Applies to: {tax.applies_to.join(', ')}
                                             </div>
                                           )}
                                         </div>
                                       )
                                     })}
                                   </div>
                                 )}
                               </div>
                             )}

                              {/* Base Tour Calculation */}
                              <div className="space-y-2 bg-blue-50 rounded-lg p-3">
                               <div className="flex justify-between items-center">
                                 <span className="text-sm font-medium text-blue-800">Base Tour Calculation</span>
                                 <span className="text-sm font-medium text-blue-800">{formatCurrency(item.pricing.tourCost + item.pricing.componentsTotal)}</span>
                               </div>
                               <div className="flex justify-between text-xs text-blue-600 pl-2">
                                 <span>Base: {formatCurrency(item.pricing.tourCost)} + Components: {formatCurrency(item.pricing.componentsTotal)}</span>
                                 <span>{formatCurrency(item.pricing.tourCost + item.pricing.componentsTotal)}</span>
                               </div>
                               <div className="flex justify-between text-xs text-blue-500 pl-2">
                                 <span>+ Base taxes: {formatCurrency(item.pricing.totalTaxes * (item.pricing.tourCost / (item.pricing.tourCost + item.pricing.extraCost)))}</span>
                                 <span>{formatCurrency(item.pricing.totalTaxes * (item.pricing.tourCost / (item.pricing.tourCost + item.pricing.extraCost)))}</span>
                               </div>
                               <div className="flex justify-between text-xs text-blue-500 pl-2">
                                 <span>+ Base markup ({item.base_markup_percentage || 0}%): {formatCurrency(item.pricing.baseMarkupAmount || 0)}</span>
                                 <span>{formatCurrency(item.pricing.baseMarkupAmount || 0)}</span>
                               </div>
                               <div className="flex justify-between items-center border-t border-blue-200 pt-1">
                                 <span className="font-medium text-blue-800">Base Tour Total</span>
                                 <span className="font-medium text-blue-800">{formatCurrency(item.pricing.tourCost + item.pricing.componentsTotal + (item.pricing.totalTaxes * (item.pricing.tourCost / (item.pricing.tourCost + item.pricing.extraCost))) + (item.pricing.baseMarkupAmount || 0))}</span>
                               </div>
                             </div>

                             {/* Extra Night Calculation */}
                             {(item.extra_nights_before > 0 || item.extra_nights_after > 0) && (
                               <div className="space-y-2 bg-green-50 rounded-lg p-3">
                                 <div className="flex justify-between items-center">
                                   <span className="text-sm font-medium text-green-800">Extra Night Calculation</span>
                                   <span className="text-sm font-medium text-green-800">{formatCurrency(item.pricing.extraCost)}</span>
                                 </div>
                                 <div className="flex justify-between text-xs text-green-600 pl-2">
                                   <span>Extra night price: {formatCurrency(item.pricing.extraCost)}</span>
                                   <span>{formatCurrency(item.pricing.extraCost)}</span>
                                 </div>
                                 <div className="flex justify-between text-xs text-green-500 pl-2">
                                   <span>+ Extra taxes: {formatCurrency(item.pricing.totalTaxes * (item.pricing.extraCost / (item.pricing.tourCost + item.pricing.extraCost)))}</span>
                                   <span>{formatCurrency(item.pricing.totalTaxes * (item.pricing.extraCost / (item.pricing.tourCost + item.pricing.extraCost)))}</span>
                                 </div>
                                 <div className="flex justify-between text-xs text-green-500 pl-2">
                                   <span>+ Extra markup ({item.extra_night_markup_percentage || 0}%): {formatCurrency(item.pricing.extraMarkupAmount || 0)}</span>
                                   <span>{formatCurrency(item.pricing.extraMarkupAmount || 0)}</span>
                                 </div>
                                 <div className="flex justify-between items-center border-t border-green-200 pt-1">
                                   <span className="font-medium text-green-800">Extra Night Total</span>
                                   <span className="font-medium text-green-800">{formatCurrency(item.pricing.extraCost + (item.pricing.totalTaxes * (item.pricing.extraCost / (item.pricing.tourCost + item.pricing.extraCost))) + (item.pricing.extraMarkupAmount || 0))}</span>
                                 </div>
                               </div>
                             )}

                             {/* Markup - Applied Last 
                             {item.pricing.totalMarkup && item.pricing.totalMarkup > 0 && (
                               <div className="space-y-2 bg-green-50 rounded p-2">
                                 <div className="flex justify-between items-center">
                                   <span className="text-sm font-medium text-green-700">Markup (Applied Last)</span>
                                   <span className="text-sm font-medium text-green-700">{formatCurrency(item.pricing.totalMarkup)}</span>
                                 </div>
                                 <div className="space-y-1 pl-2">
                                   <div className="flex justify-between text-xs text-green-600">
                                     <span>
                                       {item.extra_nights_before > 0 || item.extra_nights_after > 0 
                                         ? `Extra night markup (${item.extra_night_markup_percentage || 0}%)`
                                         : `Base rate markup (${item.base_markup_percentage || 0}%)`
                                       }
                                     </span>
                                     <span>{formatCurrency(item.pricing.totalMarkup)}</span>
                                   </div>
                                   <div className="text-xs text-green-500 pl-1">
                                     Applied to: Total before markup ({formatCurrency(item.pricing.subtotal + item.pricing.totalTaxes)})
                                   </div>
                                 </div>
                                 <div className="text-xs text-green-500 pl-2 border-t border-green-200 pt-1">
                                   Note: Markup is applied after all taxes and fees
                                 </div>
                               </div>
                             )} */}

                             {/* Final Totals */}
                             <div className="space-y-2 border-t pt-3">
                               <div className="flex justify-between items-center">
                                 <span className="font-medium text-slate-700">Total before markup</span>
                                 <span className="font-medium text-slate-700">{formatCurrency(item.pricing.subtotal + item.pricing.totalTaxes)}</span>
                               </div>
                               {(item.pricing.totalMarkup || 0) > 0 && (
                                 <div className="flex justify-between items-center text-sm text-slate-600 pl-2">
                                   <span>
                                     + {item.extra_nights_before > 0 || item.extra_nights_after > 0 
                                       ? `Extra night markup (${item.extra_night_markup_percentage || 0}%)`
                                       : `Base rate markup (${item.base_markup_percentage || 0}%)`
                                     }
                                   </span>
                                   <span>{formatCurrency(item.pricing.totalMarkup || 0)}</span>
                                 </div>
                               )}
                               <div className="flex justify-between items-center">
                                 <span className="font-semibold text-slate-900">Total per room</span>
                                 <span className="font-semibold text-slate-900">{formatCurrency(item.pricing.totalPerRoom)}</span>
                               </div>
                               <div className="flex justify-between items-center">
                                 <span className="font-bold text-blue-600">× {item.quantity} rooms</span>
                                 <span className="font-bold text-blue-600">{formatCurrency(item.pricing.grandTotal)}</span>
                               </div>
                             </div>
                           </div>
                        </div>
                      </Card>
                    ))}

                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total rooms:</span>
                        <span className="font-medium">{getTotalRooms()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total guests:</span>
                        <span className="font-medium">{getTotalGuests()}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>Grand Total:</span>
                        <span className="text-blue-600">{formatCurrency(getGrandTotal())}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PricingSandbox
