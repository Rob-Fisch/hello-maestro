-- Migration: Add Venue Manager Columns to People Table

ALTER TABLE public.people ADD COLUMN IF NOT EXISTS venue_name TEXT;
ALTER TABLE public.people ADD COLUMN IF NOT EXISTS venue_type TEXT;
ALTER TABLE public.people ADD COLUMN IF NOT EXISTS venue_location TEXT;
