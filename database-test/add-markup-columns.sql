-- Add markup columns to room_rates table
-- This migration adds markup functionality for base rates and extra night rates

-- Add markup columns
ALTER TABLE room_rates 
ADD COLUMN base_markup_percentage DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN extra_night_markup_percentage DECIMAL(5,2) DEFAULT 0.00;

-- Add check constraints for markup percentages
ALTER TABLE room_rates 
ADD CONSTRAINT check_base_markup_percentage 
CHECK (base_markup_percentage >= 0 AND base_markup_percentage <= 100);

ALTER TABLE room_rates 
ADD CONSTRAINT check_extra_night_markup_percentage 
CHECK (extra_night_markup_percentage >= 0 AND extra_night_markup_percentage <= 100);

-- Add comments for documentation
COMMENT ON COLUMN room_rates.base_markup_percentage IS 'Markup percentage applied to base room rate';
COMMENT ON COLUMN room_rates.extra_night_markup_percentage IS 'Markup percentage applied to extra night rates';

-- Update existing records with default markup values (optional)
-- UPDATE room_rates SET 
--   base_markup_percentage = 10.00,
--   extra_night_markup_percentage = 15.00 
-- WHERE base_markup_percentage IS NULL;
