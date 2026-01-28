-- Migration: Add updated_at columns and auto-update triggers
-- Date: 2026-01-24
-- Purpose: Track when records were last modified for sync, audit trails, and user features
-- =============================================================================
-- STEP 1: Create the trigger function (reusable for all tables)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- =============================================================================
-- STEP 2: Add updated_at column to all user-data tables
-- =============================================================================
-- People (Contacts) - Priority for user's feature idea
ALTER TABLE public.people
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
-- Events (Gigs)
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
-- Routines (Practice routines)
ALTER TABLE public.routines
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
-- Blocks (Practice blocks)
ALTER TABLE public.blocks
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
-- Gear Assets
ALTER TABLE public.gear_assets
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
-- Pack Lists
ALTER TABLE public.pack_lists
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
-- Transactions (Financial records)
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
-- Categories
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
-- Songs
ALTER TABLE public.songs
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
-- Set Lists
ALTER TABLE public.set_lists
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
-- Profiles (user settings)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
-- =============================================================================
-- STEP 3: Create triggers for auto-updating updated_at on each table
-- =============================================================================
-- People
DROP TRIGGER IF EXISTS update_people_updated_at ON public.people;
CREATE TRIGGER update_people_updated_at BEFORE
UPDATE ON public.people FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- Events
DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
CREATE TRIGGER update_events_updated_at BEFORE
UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- Routines
DROP TRIGGER IF EXISTS update_routines_updated_at ON public.routines;
CREATE TRIGGER update_routines_updated_at BEFORE
UPDATE ON public.routines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- Blocks
DROP TRIGGER IF EXISTS update_blocks_updated_at ON public.blocks;
CREATE TRIGGER update_blocks_updated_at BEFORE
UPDATE ON public.blocks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- Gear Assets
DROP TRIGGER IF EXISTS update_gear_assets_updated_at ON public.gear_assets;
CREATE TRIGGER update_gear_assets_updated_at BEFORE
UPDATE ON public.gear_assets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- Pack Lists
DROP TRIGGER IF EXISTS update_pack_lists_updated_at ON public.pack_lists;
CREATE TRIGGER update_pack_lists_updated_at BEFORE
UPDATE ON public.pack_lists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- Transactions
DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;
CREATE TRIGGER update_transactions_updated_at BEFORE
UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- Categories
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at BEFORE
UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- Songs
DROP TRIGGER IF EXISTS update_songs_updated_at ON public.songs;
CREATE TRIGGER update_songs_updated_at BEFORE
UPDATE ON public.songs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- Set Lists
DROP TRIGGER IF EXISTS update_set_lists_updated_at ON public.set_lists;
CREATE TRIGGER update_set_lists_updated_at BEFORE
UPDATE ON public.set_lists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- Profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE
UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- =============================================================================
-- STEP 4: Backfill existing rows (set updated_at = created_at where available)
-- =============================================================================
UPDATE public.people
SET updated_at = now()
WHERE updated_at IS NULL;
UPDATE public.events
SET updated_at = COALESCE(created_at, now())
WHERE updated_at IS NULL;
UPDATE public.routines
SET updated_at = COALESCE(created_at, now())
WHERE updated_at IS NULL;
UPDATE public.blocks
SET updated_at = COALESCE(created_at, now())
WHERE updated_at IS NULL;
UPDATE public.gear_assets
SET updated_at = COALESCE(created_at, now())
WHERE updated_at IS NULL;
UPDATE public.pack_lists
SET updated_at = now()
WHERE updated_at IS NULL;
UPDATE public.transactions
SET updated_at = COALESCE(created_at, now())
WHERE updated_at IS NULL;
UPDATE public.categories
SET updated_at = now()
WHERE updated_at IS NULL;
UPDATE public.songs
SET updated_at = COALESCE(created_at, now())
WHERE updated_at IS NULL;
UPDATE public.set_lists
SET updated_at = COALESCE(created_at, now())
WHERE updated_at IS NULL;
UPDATE public.profiles
SET updated_at = COALESCE(created_at, now())
WHERE updated_at IS NULL;