import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config()
// Check for environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials!')
  console.log(`
Please set up your environment variables:

1. Create a .env file in the project root
2. Add your Supabase credentials:
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key

3. Or set them directly in the script below
  `)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
  },
  {
    id: 'novotel_budapest_centrum',
    name: 'Mövenpick Hotel Budapest Centre',
    address: 'Rákóczi út 43-45, Budapest',
    city: 'Budapest',
    country: 'HU',
    region_id: '715',
    latitude: 47.49747,
    longitude: 19.07195,
    amenities: [
      'Shopping on site', 'Computer', 'Air conditioning', '24-hour reception', 'Elevator/lift',
      'Currency exchange', 'Smoke-free property', 'Heating', 'Security guard', 'Newspapers',
      'Ticket assistance', 'Gift shop', 'Express check-in/check-out', 'All Spaces Non-Smoking (public and private)',
      'Electric car charging', 'Non-smoking rooms', 'Soundproof rooms', 'Room service',
      'Family room', 'VIP room amenities', 'Smoke Detector', 'Cable TV', 'Minibar', 'Hairdryer',
      'Flat-screen TV', 'Shower/Bathtub', 'Toiletries', 'Accessibility features', 'Wheelchair Accessible',
      'Wheelchair access to restaurant', 'Ironing', 'Luggage storage', 'Laundry', 'Safe-deposit box',
      'Concierge services', 'Dry-cleaning', 'Shoe shine', 'Telephone', 'Bar', 'Diet menu (on request)',
      'Breakfast', 'Buffet breakfast', 'Breakfast in the room', 'Cafe', 'Restaurant',
      'Bottled water (at extra charge)', 'Kettle', 'Free Wi-Fi', 'Shuttle', 'Airport transportation',
      'Transfer services', 'German', 'English', 'Italian', 'French', 'Multi-language staff',
      'Tour assistance', 'Parking', 'Parking nearby', 'Garage', 'Spa tub', 'Business center',
      'Fax machine', 'Meeting and presentation facilities', 'Conference Hall', 'Fitness facilities',
      'Gym', 'Doctor', 'Massage', 'Sauna', 'First Aid Kit', 'Playroom', 'Babysitting and childcare',
      'Children\'s playground', 'Pets allowed', 'Temperature control for staff',
      'Personal protection equipment for staff', 'Extra decontamination measures',
      'Temperature control for guests', 'Contactless check-in and/or check-out',
      'Additional measures against COVID-19'
    ],
    star_rating: 4,
    hotel_chain: 'Novotel',
    kind: 'Hotel',
    images: [
      'https://cdn.worldota.net/t/{size}/ostrovok/50/cc/50cc52114065714debe175d8c7061e25042fb41b.JPEG',
      'https://cdn.worldota.net/t/{size}/ostrovok/6b/7e/6b7ee337b5443f03703a868050aae023c900340f.JPEG',
      'https://cdn.worldota.net/t/{size}/ostrovok/7c/76/7c76b25747de3bbe322abee06b88c3b20dcbafac.JPEG'
    ],
    is_closed: false,
    updated_at: '2025-08-21 10:44:59.913+01',
    hid: '7498572',
    check_in_time: '15:00:00',
    check_out_time: '12:00:00',
    phone: '+36307427587',
    email: 'h3560@accor.com',
    description: [
      {
        title: 'Location',
        paragraphs: [
          'Good choice if you\'re looking forward to taking some rest at the hotel as much as to walking around the city. Mövenpick Hotel Budapest Centre is located in Budapest. This hotel is located minutes away from the city center. You can take a walk and explore the neighbourhood area of the hotel — Blaha Lujza tér, Dohany Street Synagogue and Hungarian National Museum.'
        ]
      },
      {
        title: 'At the hotel',
        paragraphs: [
          'Spend an evening in a nice atmosphere of the bar. You can stop by the restaurant. If you can\'t live without coffee, drop by the cafe. Free Wi-Fi on the territory will help you to stay on-line.',
          'If you travel by car, you can park in a parking zone. If you travel by car, there\'s a paid parking zone at the hotel. Also, the following services are available for guests at the hotel: a massage room, a sauna and a doctor. Guests who love doing sports will be able to enjoy a fitness center and a gym.',
          'For business meetings, there is a business center and event facilities. There are playrooms for children at the hotel. They will be having so much fun that you might have to spend the evening with adults. To book an excursion, consult the tour assistance desk of the hotel. You won\'t have to leave your pet at home as they are allowed.',
          'The staff of the hotel will order a transfer for you. Accessible for guests with disabilities: the elevator helps them to go to the highest floors. Additional services that the hotel offers to its guests: a laundry, dry cleaning, ironing, press, a safe-deposit box and a concierge. The staff of the hotel speaks English, Italian, German and French.'
        ]
      },
      {
        title: 'Room amenities',
        paragraphs: [
          'Guests will find the following in the room: a TV and a mini-bar. The room equipment depends on its category.'
        ]
      }
    ],
    show_on_frontend: true,
    room_groups: [
      {
        name: 'Standard Triple room',
        images: [
          'https://cdn.worldota.net/t/{size}/content/c6/8d/c68d8c564c4c21247fde0d18d98cb83a56b19ab1.jpeg',
          'https://cdn.worldota.net/t/{size}/content/zz/5f/ad5fe7e4fc11b349912c7bc7aa630dc97916879f.jpeg'
        ],
        rg_ext: {
          sex: 0, club: 0, view: 0, class: 3, floor: 0, family: 0, balcony: 0,
          bedding: 0, quality: 2, bathroom: 2, bedrooms: 0, capacity: 3
        },
        name_struct: {
          bathroom: null,
          main_name: 'Standard Triple room',
          bedding_type: null
        },
        room_group_id: 21541428,
        room_amenities: [
          'air-conditioning', 'blackout-blinds', 'coffee', 'desk', 'hairdryer', 'iron',
          'mini-bar', 'pets-allowed', 'private-bathroom', 'safe', 'soundproofing',
          'tea', 'tea-or-coffee', 'telephone', 'toiletries', 'tv', 'water', 'wi-fi'
        ]
      },
      {
        name: 'Standard Double room full double bed',
        images: [
          'https://cdn.worldota.net/t/{size}/content/c9/58/c958468d1e75e6735b6062d34a99aba660a1d2ea.jpeg',
          'https://cdn.worldota.net/t/{size}/content/f6/c8/f6c82373d2f6a3aa34c3b1dff73136e2f1fed0b2.jpeg'
        ],
        rg_ext: {
          sex: 0, club: 0, view: 0, class: 3, floor: 0, family: 0, balcony: 0,
          bedding: 3, quality: 2, bathroom: 2, bedrooms: 0, capacity: 2
        },
        name_struct: {
          bathroom: null,
          main_name: 'Standard Double room',
          bedding_type: 'full double bed'
        },
        room_group_id: 90,
        room_amenities: [
          'air-conditioning', 'blackout-blinds', 'desk', 'hairdryer', 'heating', 'iron',
          'mini-bar', 'pets-allowed', 'private-bathroom', 'safe', 'shower', 'soundproofing',
          'tea', 'tea-or-coffee', 'telephone', 'toiletries', 'tv', 'water', 'wi-fi'
        ]
      },
      {
        name: 'Superior Double room full double bed',
        images: [
          'https://cdn.worldota.net/t/{size}/content/60/6b/606b2084adf41ce10da11cb3c94ad501af751541.JPEG',
          'https://cdn.worldota.net/t/{size}/content/0e/84/0e8428e035cb5941ca1f6ec94e48f0cb421ab937.JPEG'
        ],
        rg_ext: {
          sex: 0, club: 0, view: 0, class: 3, floor: 0, family: 0, balcony: 0,
          bedding: 3, quality: 5, bathroom: 2, bedrooms: 0, capacity: 2
        },
        name_struct: {
          bathroom: null,
          main_name: 'Superior Double room',
          bedding_type: 'full double bed'
        },
        room_group_id: 123,
        room_amenities: [
          'air-conditioning', 'blackout-blinds', 'desk', 'hairdryer', 'hypoallergenic',
          'iron', 'mini-bar', 'private-bathroom', 'safe', 'soundproofing', 'tea',
          'telephone', 'toiletries', 'towels', 'tv', 'wardrobe', 'water', 'wi-fi'
        ]
      }
    ]
  }
]

// Mock data for tours
const mockTours = [
  {
    tour_id: '550e8400-e29b-41d4-a716-446655440001',
    tour_code: 'EUR-2025-SPRING-01',
    tour_name: 'European Spring Discovery',
    tour_description: 'A comprehensive 10-day tour through the heart of Europe, visiting Berlin, Paris, and Rome.',
    start_date: '2025-04-15',
    end_date: '2025-04-25',
    status: 'confirmed'
  },
  {
    tour_id: '550e8400-e29b-41d4-a716-446655440002',
    tour_code: 'EUR-2025-SUMMER-01',
    tour_name: 'Summer European Grand Tour',
    tour_description: 'An extended 14-day summer tour covering major European capitals.',
    start_date: '2025-07-01',
    end_date: '2025-07-15',
    status: 'planning'
  },
  {
    tour_id: '550e8400-e29b-41d4-a716-446655440003',
    tour_code: 'EUR-2025-FALL-01',
    tour_name: 'Autumn Cultural Journey',
    tour_description: 'A cultural exploration of European cities in autumn.',
    start_date: '2025-09-15',
    end_date: '2025-09-25',
    status: 'confirmed'
  }
]

// Mock data for contracts
const mockContracts = [
  {
    contract_id: '550e8400-e29b-41d4-a716-446655440010',
    hotel_id: 'hotel-1',
    contract_reference_number: 'GHB-2025-001',
    contract_status: 'active',
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
    contract_id: '550e8400-e29b-41d4-a716-446655440011',
    hotel_id: 'hotel-2',
    contract_reference_number: 'HPC-2025-002',
    contract_status: 'active',
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
    inventory_id: '550e8400-e29b-41d4-a716-446655440020',
    tour_id: '550e8400-e29b-41d4-a716-446655440001',
    hotel_id: 'hotel-1',
    contract_id: '550e8400-e29b-41d4-a716-446655440010',
    check_in_date: '2025-04-15',
    check_out_date: '2025-04-18',
    room_type_id: '1',
    room_type_name: 'Superior Double Room',
    quantity_allocated: 40,
    quantity_sold: 15
  },
  {
    inventory_id: '550e8400-e29b-41d4-a716-446655440021',
    tour_id: '550e8400-e29b-41d4-a716-446655440001',
    hotel_id: 'hotel-2',
    contract_id: '550e8400-e29b-41d4-a716-446655440011',
    check_in_date: '2025-04-18',
    check_out_date: '2025-04-22',
    room_type_id: '3',
    room_type_name: 'Standard Twin Room',
    quantity_allocated: 30,
    quantity_sold: 12
  },
  {
    inventory_id: '550e8400-e29b-41d4-a716-446655440022',
    tour_id: '550e8400-e29b-41d4-a716-446655440001',
    hotel_id: 'hotel-3',
    contract_id: null,
    check_in_date: '2025-04-22',
    check_out_date: '2025-04-25',
    room_type_id: '4',
    room_type_name: 'Executive Double',
    quantity_allocated: 25,
    quantity_sold: 8
  }
]

// Mock data for rates
const mockRates = [
  {
    rate_id: '550e8400-e29b-41d4-a716-446655440030',
    inventory_id: '550e8400-e29b-41d4-a716-446655440020',
    occupancy_type: 'double',
    number_of_guests: 2,
    rate_per_room_per_night: 180.00,
    rate_currency: 'EUR',
    is_commissionable: true,
    commission_percentage: 10,
    base_markup_percentage: 15.00,
    extra_night_markup_percentage: 20.00,
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
    extra_night_before_rate: 160.00,
    extra_night_after_rate: 180.00,
    taxes: [
      {
        name: 'VAT',
        tax_type: 'percentage',
        tax_rate: 19.0,
        applies_to: ['room_rate', 'components']
      },
      {
        name: 'City Tax',
        tax_type: 'per_person_per_night',
        tax_rate: 2.50,
        applies_to: ['room_rate']
      }
    ],
    notes: 'Standard double occupancy rate'
  },
  {
    rate_id: '550e8400-e29b-41d4-a716-446655440031',
    inventory_id: '550e8400-e29b-41d4-a716-446655440020',
    occupancy_type: 'single',
    number_of_guests: 1,
    rate_per_room_per_night: 150.00,
    rate_currency: 'EUR',
    is_commissionable: true,
    commission_percentage: 8,
    base_markup_percentage: 12.00,
    extra_night_markup_percentage: 18.00,
    rate_components: [
      {
        type: 'service_fee',
        name: 'Service Charge',
        amount: 5.00,
        is_percentage: false,
        is_taxable: true
      }
    ],
    extra_night_before_rate: 130.00,
    extra_night_after_rate: 150.00,
    taxes: [
      {
        name: 'VAT',
        tax_type: 'percentage',
        tax_rate: 19.0,
        applies_to: ['room_rate', 'components']
      },
      {
        name: 'City Tax',
        tax_type: 'per_person_per_night',
        tax_rate: 2.50,
        applies_to: ['room_rate']
      }
    ],
    notes: 'Single occupancy rate'
  },
  {
    rate_id: '550e8400-e29b-41d4-a716-446655440032',
    inventory_id: '550e8400-e29b-41d4-a716-446655440021',
    occupancy_type: 'double',
    number_of_guests: 2,
    rate_per_room_per_night: 120.00,
    rate_currency: 'EUR',
    is_commissionable: true,
    commission_percentage: 12,
    base_markup_percentage: 10.00,
    extra_night_markup_percentage: 15.00,
    rate_components: [],
    extra_night_before_rate: 100.00,
    extra_night_after_rate: 120.00,
    taxes: [
      {
        name: 'VAT',
        tax_type: 'percentage',
        tax_rate: 20.0,
        applies_to: ['room_rate']
      }
    ],
    notes: 'Standard twin room rate'
  }
]

async function seedDatabase() {
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

// Run the seeding function
seedDatabase()
  .then(() => {
    console.log('✅ Seeding completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  })
