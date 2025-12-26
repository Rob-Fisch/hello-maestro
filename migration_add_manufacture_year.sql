-- Migration: Add manufacture_year to gear_assets
-- This script safely adds the manufacture_year column to your existing gear_assets table.

ALTER TABLE public.gear_assets 
ADD COLUMN IF NOT EXISTS manufacture_year TEXT;

-- Update the comment for clarity
COMMENT ON COLUMN public.gear_assets.manufacture_year IS 'Approximate year the equipment was manufactured';
