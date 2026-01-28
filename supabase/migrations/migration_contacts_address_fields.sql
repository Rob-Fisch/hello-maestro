-- Migration: Add Address Fields to People Table
-- Purpose: Add structured address fields and map link for contacts
-- Date: 2026-01-17

-- Add address columns to people table
ALTER TABLE people 
ADD COLUMN IF NOT EXISTS address_line1 TEXT,
ADD COLUMN IF NOT EXISTS address_line2 TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state_province TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS map_link TEXT;

-- Add index on city for future "nearest musician" search feature
CREATE INDEX IF NOT EXISTS idx_people_city ON people(city);

-- Add comment for documentation
COMMENT ON COLUMN people.map_link IS 'Google Maps share link (PIN drop URL) for precise location';
