import { supabase } from '@/lib/supabase'

// Mock data for hotels
const mockHotels = [
  {
    id: 'hotel-1',
    name: 'Grand Hotel Berlin',
    address: 'Unter den Linden 77, 10117 Berlin',
    city: 'Berlin',
    country: 'Germany',
    latitude: 52.5200,
    longitude: 13.4050,
    star_rating: 5,
    hotel_chain: 'Luxury Collection',
    kind: 'luxury',
    amenities: ['WiFi', 'Spa', 'Gym', 'Pool', 'Restaurant', 'Bar', 'Concierge'],
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'
    ],
    check_in_time: '15:00',
    check_out_time: '11:00',
    phone: '+49 30 12345678',
    email: 'info@grandhotelberlin.com',
    contact_person: 'Hans Mueller',
    description: {
      overview: 'Luxury hotel in the heart of Berlin',
      highlights: ['Historic building', 'Central location', 'Premium service']
    },
    show_on_frontend: true,
    is_closed: false,
    notes: 'Premium luxury hotel with excellent service',
    room_groups: [
      {
        name: 'Superior Double Room',
        images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600'],
        rg_ext: {
          sex: 0,
          club: 0,
          view: 1,
          class: 3,
          floor: 5,
          family: 0,
          balcony: 0,
          bedding: 2,
          quality: 4,
          bathroom: 1,
          bedrooms: 1,
          capacity: 2
        },
        name_struct: {
          bathroom: 'En-suite',
          main_name: 'Superior Double',
          bedding_type: 'King bed'
        },
        room_group_id: 1,
        room_amenities: ['WiFi', 'TV', 'Minibar', 'Safe', 'Air conditioning']
      },
      {
        name: 'Deluxe King Suite',
        images: ['https://images.unsplash.com/photo-1611892440501-80e6e7a3fdcf?w=600'],
        rg_ext: {
          sex: 0,
          club: 1,
          view: 2,
          class: 4,
          floor: 8,
          family: 0,
          balcony: 1,
          bedding: 5,
          quality: 5,
          bathroom: 2,
          bedrooms: 1,
          capacity: 2
        },
        name_struct: {
          bathroom: 'Marble bathroom',
          main_name: 'Deluxe King Suite',
          bedding_type: 'King bed'
        },
        room_group_id: 2,
        room_amenities: ['WiFi', 'TV', 'Minibar', 'Safe', 'Air conditioning', 'Balcony', 'Separate living area']
      }
    ]
  },
  {
    id: 'hotel-2',
    name: 'Hotel Paris Central',
    address: '123 Rue de Rivoli, 75001 Paris',
    city: 'Paris',
    country: 'France',
    latitude: 48.8566,
    longitude: 2.3522,
    star_rating: 4,
    hotel_chain: 'Independent',
    kind: 'boutique',
    amenities: ['WiFi', 'Restaurant', 'Bar', 'Concierge', 'Business Center'],
    images: [
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'
    ],
    check_in_time: '14:00',
    check_out_time: '12:00',
    phone: '+33 1 42 36 78 90',
    email: 'info@hotelpariscentral.com',
    contact_person: 'Marie Dubois',
    description: {
      overview: 'Charming boutique hotel in central Paris',
      highlights: ['Historic building', 'Art deco style', 'Personal service']
    },
    show_on_frontend: true,
    is_closed: false,
    notes: 'Boutique hotel with character',
    room_groups: [
      {
        name: 'Standard Twin Room',
        images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600'],
        rg_ext: {
          sex: 0,
          club: 0,
          view: 1,
          class: 2,
          floor: 3,
          family: 0,
          balcony: 0,
          bedding: 4,
          quality: 3,
          bathroom: 1,
          bedrooms: 1,
          capacity: 2
        },
        name_struct: {
          bathroom: 'En-suite',
          main_name: 'Standard Twin',
          bedding_type: 'Twin beds'
        },
        room_group_id: 3,
        room_amenities: ['WiFi', 'TV', 'Safe', 'Air conditioning']
      }
    ]
  },
  {
    id: 'hotel-3',
    name: 'Rome Imperial Hotel',
    address: 'Via del Corso 126, 00186 Rome',
    city: 'Rome',
    country: 'Italy',
    latitude: 41.9028,
    longitude: 12.4964,
    star_rating: 4,
    hotel_chain: 'Imperial Hotels',
    kind: 'business',
    amenities: ['WiFi', 'Gym', 'Restaurant', 'Bar', 'Business Center', 'Meeting Rooms'],
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'
    ],
    check_in_time: '15:00',
    check_out_time: '11:00',
    phone: '+39 06 12345678',
    email: 'info@romeimperial.com',
    contact_person: 'Giuseppe Rossi',
    description: {
      overview: 'Modern business hotel in central Rome',
      highlights: ['Business facilities', 'Central location', 'Modern amenities']
    },
    show_on_frontend: true,
    is_closed: false,
    notes: 'Business-focused hotel with modern amenities',
    room_groups: [
      {
        name: 'Executive Double',
        images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600'],
        rg_ext: {
          sex: 0,
          club: 0,
          view: 1,
          class: 3,
          floor: 6,
          family: 0,
          balcony: 0,
          bedding: 2,
          quality: 4,
          bathroom: 1,
          bedrooms: 1,
          capacity: 2
        },
        name_struct: {
          bathroom: 'En-suite',
          main_name: 'Executive Double',
          bedding_type: 'Double bed'
        },
        room_group_id: 4,
        room_amenities: ['WiFi', 'TV', 'Minibar', 'Safe', 'Air conditioning', 'Work desk']
      }
    ]
  }
]

// Mock data for tours
const mockTours = [
  {
    tour_id: 'tour-1',
    tour_code: 'EUR-2025-SPRING-01',
    tour_name: 'European Spring Discovery',
    tour_description: 'A comprehensive 10-day tour through the heart of Europe, visiting Berlin, Paris, and Rome.',
    start_date: '2025-04-15',
    end_date: '2025-04-25',
    status: 'confirmed' as const
  },
  {
    tour_id: 'tour-2',
    tour_code: 'EUR-2025-SUMMER-01',
    tour_name: 'Summer European Grand Tour',
    tour_description: 'An extended 14-day summer tour covering major European capitals.',
    start_date: '2025-07-01',
    end_date: '2025-07-15',
    status: 'planning' as const
  },
  {
    tour_id: 'tour-3',
    tour_code: 'EUR-2025-FALL-01',
    tour_name: 'Autumn Cultural Journey',
    tour_description: 'A cultural exploration of European cities in autumn.',
    start_date: '2025-09-15',
    end_date: '2025-09-25',
    status: 'confirmed' as const
  }
]

// Mock data for contracts
const mockContracts = [
  {
    contract_id: 'contract-1',
    hotel_id: 'hotel-1',
    contract_reference_number: 'GHB-2025-001',
    contract_status: 'active' as const,
    terms: {
      contract_dates: {
        start_date: '2025-01-01',
        end_date: '2025-12-31'
      },
      payment: {
        deposit_percentage: 20,
        payment_terms: 'Net 30 days',
        currency: 'EUR'
      },
      cancellation: {
        policy_text: 'Free cancellation up to 48 hours before arrival',
        penalty_tiers: [
          { days_before: 7, penalty_percentage: 25 },
          { days_before: 3, penalty_percentage: 50 },
          { days_before: 1, penalty_percentage: 100 }
        ]
      },
      attrition: {
        threshold_percentage: 10,
        penalty_per_room: 50
      },
      cutoff_date: '2025-03-01',
      special_terms: ['Group rates available', 'Complimentary breakfast included']
    },
    contract_document_url: 'https://example.com/contracts/ghb-2025-001.pdf',
    notes: 'Premium contract with excellent terms'
  },
  {
    contract_id: 'contract-2',
    hotel_id: 'hotel-2',
    contract_reference_number: 'HPC-2025-002',
    contract_status: 'active' as const,
    terms: {
      contract_dates: {
        start_date: '2025-01-01',
        end_date: '2025-12-31'
      },
      payment: {
        deposit_percentage: 15,
        payment_terms: 'Net 15 days',
        currency: 'EUR'
      },
      cancellation: {
        policy_text: 'Free cancellation up to 24 hours before arrival',
        penalty_tiers: [
          { days_before: 3, penalty_percentage: 30 },
          { days_before: 1, penalty_percentage: 75 }
        ]
      },
      cutoff_date: '2025-02-15',
      special_terms: ['City tax included', 'WiFi included']
    },
    notes: 'Standard contract with good terms'
  }
]

// Mock data for inventory
const mockInventory = [
  {
    inventory_id: 'inv-1',
    tour_id: 'tour-1',
    hotel_id: 'hotel-1',
    contract_id: 'contract-1',
    check_in_date: '2025-04-15',
    check_out_date: '2025-04-18',
    number_of_nights: 3,
    room_type_id: '1',
    room_type_name: 'Superior Double Room',
    quantity_allocated: 40,
    quantity_sold: 15,
    quantity_available: 25
  },
  {
    inventory_id: 'inv-2',
    tour_id: 'tour-1',
    hotel_id: 'hotel-2',
    contract_id: 'contract-2',
    check_in_date: '2025-04-18',
    check_out_date: '2025-04-22',
    number_of_nights: 4,
    room_type_id: '3',
    room_type_name: 'Standard Twin Room',
    quantity_allocated: 30,
    quantity_sold: 12,
    quantity_available: 18
  },
  {
    inventory_id: 'inv-3',
    tour_id: 'tour-1',
    hotel_id: 'hotel-3',
    contract_id: null,
    check_in_date: '2025-04-22',
    check_out_date: '2025-04-25',
    number_of_nights: 3,
    room_type_id: '4',
    room_type_name: 'Executive Double',
    quantity_allocated: 25,
    quantity_sold: 8,
    quantity_available: 17
  }
]

// Mock data for rates
const mockRates = [
  {
    rate_id: 'rate-1',
    inventory_id: 'inv-1',
    occupancy_type: 'double' as const,
    number_of_guests: 2,
    rate_per_room_per_night: 180.00,
    rate_currency: 'EUR',
    is_commissionable: true,
    commission_percentage: 10,
    rate_components: [
      {
        type: 'service_fee',
        name: 'Service Charge',
        amount: 5.00,
        is_percentage: false,
        is_taxable: true
      },
      {
        type: 'resort_fee',
        name: 'Resort Fee',
        amount: 15.00,
        is_percentage: false,
        is_taxable: true
      }
    ],
    extra_night_rates: {
      before: { nights: '1-2', rate: 160.00 },
      after: { nights: '1-2', rate: 160.00 },
      weekend: { nights: 'weekend', rate: 200.00 }
    },
    taxes: [
      {
        name: 'VAT',
        tax_type: 'percentage' as const,
        tax_rate: 19.0,
        applies_to: ['room_rate', 'components']
      },
      {
        name: 'City Tax',
        tax_type: 'per_person_per_night' as const,
        tax_rate: 2.50,
        applies_to: ['room_rate']
      }
    ],
    notes: 'Standard double occupancy rate'
  },
  {
    rate_id: 'rate-2',
    inventory_id: 'inv-1',
    occupancy_type: 'single' as const,
    number_of_guests: 1,
    rate_per_room_per_night: 150.00,
    rate_currency: 'EUR',
    is_commissionable: true,
    commission_percentage: 8,
    rate_components: [
      {
        type: 'service_fee',
        name: 'Service Charge',
        amount: 5.00,
        is_percentage: false,
        is_taxable: true
      }
    ],
    extra_night_rates: {
      before: { nights: '1-2', rate: 130.00 },
      after: { nights: '1-2', rate: 130.00 },
      weekend: { nights: 'weekend', rate: 170.00 }
    },
    taxes: [
      {
        name: 'VAT',
        tax_type: 'percentage' as const,
        tax_rate: 19.0,
        applies_to: ['room_rate', 'components']
      },
      {
        name: 'City Tax',
        tax_type: 'per_person_per_night' as const,
        tax_rate: 2.50,
        applies_to: ['room_rate']
      }
    ],
    notes: 'Single occupancy rate'
  },
  {
    rate_id: 'rate-3',
    inventory_id: 'inv-2',
    occupancy_type: 'double' as const,
    number_of_guests: 2,
    rate_per_room_per_night: 120.00,
    rate_currency: 'EUR',
    is_commissionable: true,
    commission_percentage: 12,
    rate_components: [],
    extra_night_rates: {
      before: { nights: '1-2', rate: 100.00 },
      after: { nights: '1-2', rate: 100.00 },
      weekend: { nights: 'weekend', rate: 140.00 }
    },
    taxes: [
      {
        name: 'VAT',
        tax_type: 'percentage' as const,
        tax_rate: 20.0,
        applies_to: ['room_rate']
      }
    ],
    notes: 'Standard twin room rate'
  }
]

export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...')

    // Insert hotels
    console.log('📝 Inserting hotels...')
    const { error: hotelsError } = await supabase
      .from('hotels')
      .upsert(mockHotels, { onConflict: 'id' })

    if (hotelsError) {
      console.error('❌ Error inserting hotels:', hotelsError)
      return
    }
    console.log('✅ Hotels inserted successfully')

    // Insert tours
    console.log('📝 Inserting tours...')
    const { error: toursError } = await supabase
      .from('tours')
      .upsert(mockTours, { onConflict: 'tour_id' })

    if (toursError) {
      console.error('❌ Error inserting tours:', toursError)
      return
    }
    console.log('✅ Tours inserted successfully')

    // Insert contracts
    console.log('📝 Inserting contracts...')
    const { error: contractsError } = await supabase
      .from('hotel_contracts')
      .upsert(mockContracts, { onConflict: 'contract_id' })

    if (contractsError) {
      console.error('❌ Error inserting contracts:', contractsError)
      return
    }
    console.log('✅ Contracts inserted successfully')

    // Insert inventory
    console.log('📝 Inserting inventory...')
    const { error: inventoryError } = await supabase
      .from('tour_room_inventory')
      .upsert(mockInventory, { onConflict: 'inventory_id' })

    if (inventoryError) {
      console.error('❌ Error inserting inventory:', inventoryError)
      return
    }
    console.log('✅ Inventory inserted successfully')

    // Insert rates
    console.log('📝 Inserting rates...')
    const { error: ratesError } = await supabase
      .from('room_rates')
      .upsert(mockRates, { onConflict: 'rate_id' })

    if (ratesError) {
      console.error('❌ Error inserting rates:', ratesError)
      return
    }
    console.log('✅ Rates inserted successfully')

    console.log('🎉 Database seeding completed successfully!')
    console.log(`
📊 Summary:
- ${mockHotels.length} hotels
- ${mockTours.length} tours  
- ${mockContracts.length} contracts
- ${mockInventory.length} inventory items
- ${mockRates.length} rates
    `)

  } catch (error) {
    console.error('❌ Error during database seeding:', error)
  }
}

// Run the seeding function if this file is executed directly
if (import.meta.env.DEV) {
  seedDatabase()
}
