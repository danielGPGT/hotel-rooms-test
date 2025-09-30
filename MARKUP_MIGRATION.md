# Markup Columns Migration

This document explains how to add markup functionality to the room_rates table.

## Database Migration

### Step 1: Run the Migration Script

Execute the SQL migration script to add markup columns:

```sql
-- Run this in your Supabase SQL Editor
\i database-test/add-markup-columns.sql
```

Or copy and paste the contents of `database-test/add-markup-columns.sql` into your Supabase SQL Editor.

### Step 2: Verify the Migration

Check that the columns were added successfully:

```sql
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'room_rates' 
AND column_name IN ('base_markup_percentage', 'extra_night_markup_percentage');
```

## What's Added

### New Columns

1. **`base_markup_percentage`** - Markup percentage applied to base room rate
2. **`extra_night_markup_percentage`** - Markup percentage applied to extra night rates

### Constraints

- Both columns accept values from 0.00 to 100.00
- Default value is 0.00 (no markup)
- Columns are nullable (optional)

### Updated Components

1. **TypeScript Types** - Updated `RoomRate` interface
2. **RateForm** - Added markup input fields
3. **RateView** - Shows markup percentages
4. **Seeding Script** - Includes sample markup values

## Usage

### Setting Markup Values

- **Base Rate Markup**: Applied to the main room rate per night
- **Extra Night Markup**: Applied to extra night rates (before/after tour)

### Example Values

- Base markup: 15% (applied to tour nights)
- Extra night markup: 20% (applied to extra nights)

### Pricing Calculation

The markup percentages can be used in pricing calculations:

```typescript
// Base rate with markup
const baseRateWithMarkup = baseRate * (1 + baseMarkupPercentage / 100)

// Extra night rate with markup  
const extraRateWithMarkup = extraRate * (1 + extraNightMarkupPercentage / 100)
```

## Testing

After running the migration:

1. **Reseed the database**: `npm run seed`
2. **Check the application**: Navigate to Rates section
3. **Create/edit rates**: Verify markup fields are visible
4. **View rates**: Confirm markup percentages are displayed

## Rollback (if needed)

To remove the markup columns:

```sql
ALTER TABLE room_rates 
DROP COLUMN base_markup_percentage,
DROP COLUMN extra_night_markup_percentage;
```

**Note**: This will permanently delete all markup data.
