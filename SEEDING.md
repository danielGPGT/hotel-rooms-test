# Database Seeding

This document explains how to seed the database with mock data for the Hotel Rooms Management System.

## Prerequisites

1. **Supabase Setup**: Make sure you have a Supabase project set up with the database schema
2. **Environment Variables**: Set up your Supabase credentials in `.env` file:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

## Running the Seeding Script

### Option 1: Using npm script (Recommended)
```bash
npm run seed
```

### Option 2: Direct Node.js execution
```bash
node src/scripts/seedDatabase.js
```

## What Gets Seeded

The seeding script will insert the following mock data:

### 🏨 Hotels (3 hotels)
- **Grand Hotel Berlin** - 5-star luxury hotel with Superior Double and Deluxe King Suite rooms
- **Hotel Paris Central** - 4-star boutique hotel with Standard Twin rooms  
- **Rome Imperial Hotel** - 4-star business hotel with Executive Double rooms

### 🚌 Tours (3 tours)
- **European Spring Discovery** (EUR-2025-SPRING-01) - 10-day tour, confirmed
- **Summer European Grand Tour** (EUR-2025-SUMMER-01) - 14-day tour, planning
- **Autumn Cultural Journey** (EUR-2025-FALL-01) - 10-day tour, confirmed

### 📋 Contracts (2 contracts)
- **GHB-2025-001** - Active contract with Grand Hotel Berlin
- **HPC-2025-002** - Active contract with Hotel Paris Central

### 🏠 Inventory (3 inventory items)
- **Berlin Stay** - 3 nights at Grand Hotel Berlin (40 allocated, 15 sold, 25 available)
- **Paris Stay** - 4 nights at Hotel Paris Central (30 allocated, 12 sold, 18 available)
- **Rome Stay** - 3 nights at Rome Imperial Hotel (25 allocated, 8 sold, 17 available)

### 💰 Rates (3 rate configurations)
- **Double Rate for Berlin** - €180/night with service fees and resort fees
- **Single Rate for Berlin** - €150/night with service fees
- **Double Rate for Paris** - €120/night with standard pricing

## Features Included

### Rate Components
- Service charges
- Resort fees
- Percentage and fixed amount options
- Taxable/non-taxable components

### Extra Night Rates
- Before tour rates
- After tour rates  
- Weekend rates

### Tax Rules
- VAT (percentage-based)
- City tax (per person per night)
- Configurable application scope

### Room Groups
- Detailed room metadata (capacity, quality, amenities)
- Room structure information
- Amenities lists
- Image galleries

## Troubleshooting

### Common Issues

1. **Environment Variables Not Set**
   ```
   Error: Invalid Supabase URL or key
   ```
   **Solution**: Check your `.env` file has the correct Supabase credentials

2. **Database Schema Missing**
   ```
   Error: relation "hotels" does not exist
   ```
   **Solution**: Make sure you've run the database schema setup first

3. **Permission Errors**
   ```
   Error: insufficient privileges
   ```
   **Solution**: Check your Supabase RLS policies allow inserts

### Verification

After seeding, you can verify the data by:

1. **Check the application**: Navigate to each section (Hotels, Tours, Contracts, Inventory, Rates)
2. **Check Supabase Dashboard**: View the data in your Supabase project dashboard
3. **Run queries**: Use the Supabase SQL editor to verify data integrity

## Data Relationships

The seeded data follows these relationships:

```
Tours (1) ←→ (Many) Inventory ←→ (Many) Rates
Hotels (1) ←→ (Many) Contracts
Hotels (1) ←→ (Many) Inventory
```

This creates a realistic dataset for testing all CRUD operations and the pricing sandbox functionality.

## Customization

To modify the seeded data:

1. Edit `src/scripts/seedDatabase.js`
2. Modify the mock data arrays
3. Run `npm run seed` again

The script uses `upsert` operations, so running it multiple times will update existing data rather than create duplicates.
