-- Hotel Rooms Management System for Tour Operators
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. HOTELS
CREATE TABLE hotels (
    hotel_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    phone VARCHAR(50),
    email VARCHAR(255),
    contact_person VARCHAR(255),
    star_rating INTEGER CHECK (star_rating >= 1 AND star_rating <= 5),
    room_types JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. HOTEL_CONTRACTS
CREATE TABLE hotel_contracts (
    contract_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(hotel_id) ON DELETE CASCADE,
    contract_reference_number VARCHAR(100),
    contract_start_date DATE NOT NULL,
    contract_end_date DATE NOT NULL,
    payment_terms TEXT,
    cancellation_policy TEXT,
    cutoff_date DATE,
    deposit_percentage DECIMAL(5,2),
    deposit_amount DECIMAL(10,2),
    contract_status VARCHAR(20) DEFAULT 'draft' CHECK (contract_status IN ('draft', 'active', 'expired')),
    contract_document_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT check_contract_dates CHECK (contract_end_date >= contract_start_date)
);

-- 3. TOURS
CREATE TABLE tours (
    tour_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_code VARCHAR(50) UNIQUE NOT NULL,
    tour_name VARCHAR(255) NOT NULL,
    tour_description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'planning' CHECK (status IN ('planning', 'confirmed', 'completed', 'cancelled')),
    max_participants INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT check_tour_dates CHECK (end_date >= start_date)
);

-- 4. TOUR_HOTEL_BLOCKS
CREATE TABLE tour_hotel_blocks (
    block_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID NOT NULL REFERENCES tours(tour_id) ON DELETE CASCADE,
    hotel_id UUID NOT NULL REFERENCES hotels(hotel_id) ON DELETE CASCADE,
    contract_id UUID REFERENCES hotel_contracts(contract_id) ON DELETE SET NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    number_of_nights INTEGER GENERATED ALWAYS AS (check_out_date - check_in_date) STORED,
    total_rooms_allocated INTEGER NOT NULL CHECK (total_rooms_allocated > 0),
    rooms_held_until_date DATE,
    block_status VARCHAR(20) DEFAULT 'confirmed' CHECK (block_status IN ('confirmed', 'tentative', 'released')),
    block_reference_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT check_block_dates CHECK (check_out_date > check_in_date)
);

-- 5. TOUR_ROOM_INVENTORY
CREATE TABLE tour_room_inventory (
    inventory_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    block_id UUID NOT NULL REFERENCES tour_hotel_blocks(block_id) ON DELETE CASCADE,
    room_type_id VARCHAR(50) NOT NULL,
    room_type_name VARCHAR(100) NOT NULL,
    quantity_allocated INTEGER NOT NULL CHECK (quantity_allocated >= 0),
    quantity_sold INTEGER DEFAULT 0 CHECK (quantity_sold >= 0),
    quantity_available INTEGER GENERATED ALWAYS AS (quantity_allocated - quantity_sold) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT check_quantity_sold CHECK (quantity_sold <= quantity_allocated)
);

-- 6. ROOM_RATES
CREATE TABLE room_rates (
    rate_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_id UUID NOT NULL REFERENCES tour_room_inventory(inventory_id) ON DELETE CASCADE,
    occupancy_type VARCHAR(20) NOT NULL CHECK (occupancy_type IN ('single', 'double', 'triple', 'quad')),
    number_of_guests INTEGER NOT NULL CHECK (number_of_guests > 0),
    rate_per_room_per_night DECIMAL(10,2) NOT NULL CHECK (rate_per_room_per_night >= 0),
    rate_currency VARCHAR(3) DEFAULT 'GBP',
    rate_valid_from DATE,
    rate_valid_to DATE,
    is_commissionable BOOLEAN DEFAULT false,
    commission_percentage DECIMAL(5,2),
    rate_components JSONB,
    extra_night_rates JSONB,
    taxes JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_hotels_city ON hotels(city);
CREATE INDEX idx_hotels_country ON hotels(country);
CREATE INDEX idx_contracts_hotel ON hotel_contracts(hotel_id);
CREATE INDEX idx_contracts_status ON hotel_contracts(contract_status);
CREATE INDEX idx_tours_status ON tours(status);
CREATE INDEX idx_tours_dates ON tours(start_date, end_date);
CREATE INDEX idx_blocks_tour ON tour_hotel_blocks(tour_id);
CREATE INDEX idx_blocks_hotel ON tour_hotel_blocks(hotel_id);
CREATE INDEX idx_inventory_block ON tour_room_inventory(block_id);
CREATE INDEX idx_rates_inventory ON room_rates(inventory_id);

-- JSONB indexes for faster queries
CREATE INDEX idx_hotels_room_types ON hotels USING GIN (room_types);
CREATE INDEX idx_rates_components ON room_rates USING GIN (rate_components);
CREATE INDEX idx_rates_extra_nights ON room_rates USING GIN (extra_night_rates);
CREATE INDEX idx_rates_taxes ON room_rates USING GIN (taxes);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to auto-update updated_at
CREATE TRIGGER update_hotels_updated_at BEFORE UPDATE ON hotels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON hotel_contracts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tours_updated_at BEFORE UPDATE ON tours
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blocks_updated_at BEFORE UPDATE ON tour_hotel_blocks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON tour_room_inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rates_updated_at BEFORE UPDATE ON room_rates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE hotels IS 'Stores hotel information with room types in JSONB format';
COMMENT ON TABLE hotel_contracts IS 'Contracts between tour operator and hotels';
COMMENT ON TABLE tours IS 'Tour packages offered by the operator';
COMMENT ON TABLE tour_hotel_blocks IS 'Room blocks allocated for specific tours';
COMMENT ON TABLE tour_room_inventory IS 'Breakdown of allocated rooms by type';
COMMENT ON TABLE room_rates IS 'Pricing for different occupancy types with components, extra nights, and taxes in JSONB';