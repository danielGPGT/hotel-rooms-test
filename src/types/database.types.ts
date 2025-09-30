export interface Hotel {
  id: string
  name: string
  address?: string
  city: string
  country: string
  latitude?: number
  longitude?: number
  star_rating?: number
  hotel_chain?: string
  kind?: string
  amenities?: string[]
  images?: string[]
  room_groups?: RoomGroup[]
  check_in_time?: string
  check_out_time?: string
  phone?: string
  email?: string
  contact_person?: string
  description?: Record<string, any>
  show_on_frontend: boolean
  is_closed: boolean
  notes?: string
  created_at: string
  updated_at: string
}

export interface RoomGroup {
  name: string
  images: string[]
  rg_ext: {
    sex: number
    club: number
    view: number
    class: number
    floor: number
    family: number
    balcony: number
    bedding: number
    quality: number
    bathroom: number
    bedrooms: number
    capacity: number
  }
  name_struct: {
    bathroom: string | null
    main_name: string
    bedding_type: string
  }
  room_group_id: number
  room_amenities: string[]
}

export interface HotelContract {
  contract_id: string
  hotel_id: string
  contract_reference_number?: string
  contract_status: 'draft' | 'active' | 'expired' | 'cancelled'
  terms?: ContractTerms
  contract_document_url?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface ContractTerms {
  contract_dates?: {
    start_date: string
    end_date: string
  }
  payment?: {
    deposit_percentage?: number
    deposit_amount?: number
    payment_terms?: string
    currency?: string
  }
  cancellation?: {
    policy_text?: string
    penalty_tiers?: Array<{
      days_before: number
      penalty_percentage: number
    }>
  }
  attrition?: {
    threshold_percentage?: number
    penalty_per_room?: number
  }
  cutoff_date?: string
  special_terms?: string[]
}

export interface Tour {
  tour_id: string
  tour_code: string
  tour_name: string
  tour_description?: string
  start_date: string
  end_date: string
  status: 'planning' | 'confirmed' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface TourRoomInventory {
  inventory_id: string
  tour_id: string
  hotel_id: string
  contract_id?: string
  check_in_date: string
  check_out_date: string
  number_of_nights: number
  room_type_id: string
  room_type_name: string
  quantity_allocated: number
  quantity_sold: number
  quantity_available: number
  created_at: string
  updated_at: string
}

export interface RoomRate {
  rate_id: string
  inventory_id: string
  occupancy_type: 'single' | 'double' | 'triple' | 'quad'
  number_of_guests: number
  rate_per_room_per_night: number
  rate_currency: string
  is_commissionable: boolean
  commission_percentage?: number
  base_markup_percentage?: number
  extra_night_markup_percentage?: number
  rate_components?: RateComponent[]
  extra_night_before_rate?: number
  extra_night_after_rate?: number
  taxes?: TaxRule[]
  notes?: string
  created_at: string
  updated_at: string
}

export interface RateComponent {
  type?: string
  name?: string
  amount?: number
  is_percentage: boolean
  is_taxable: boolean
  rate_type: 'fixed' | 'per_person_per_night' | 'per_room_per_night'
  currency?: string
}

export interface TaxRule {
  name: string
  tax_type: 'percentage' | 'per_person_per_night' | 'per_room_per_night' | 'fixed'
  tax_rate: number
  tax_currency?: string
  applies_to: string[]
}

// Extended types with relationships
export interface HotelWithContracts extends Hotel {
  contracts?: HotelContract[]
}

export interface TourWithInventory extends Tour {
  inventory?: TourRoomInventoryWithDetails[]
}

export interface TourRoomInventoryWithDetails extends TourRoomInventory {
  tour?: Tour
  hotel?: Hotel
  rates?: RoomRate[]
}

export interface RoomRateWithDetails extends RoomRate {
  inventory?: TourRoomInventoryWithDetails
}

// Pricing calculation types
export interface PricingCalculation {
  tourCost: number
  extraCost: number
  componentsTotal: number
  subtotal: number
  totalTaxes: number
  totalPerRoom: number
  grandTotal: number
  baseMarkupAmount?: number
  extraMarkupAmount?: number
  totalMarkup?: number
}

export interface QuoteItem {
  inventory_id: string
  hotel_name: string
  room_type_name: string
  occupancy_type: string
  number_of_guests: number
  check_in_date: string
  check_out_date: string
  number_of_nights: number
  quantity: number
  extra_nights_before: number
  extra_nights_after: number
  tour_rate: number
  extra_rate_before: number
  extra_rate_after: number
  base_markup_percentage?: number
  extra_night_markup_percentage?: number
  taxes: TaxRule[]
  rate_components?: RateComponent[]
  pricing: PricingCalculation
}
