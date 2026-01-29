-- Migration: Smart updated_at trigger (only update on real content changes)
-- Date: 2026-01-28
-- Purpose: Fix issue where every sync bumps updated_at even when no content changed
-- =============================================================================
-- STEP 1: Create a smarter trigger function that ignores sync metadata
-- =============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_on_content_change() RETURNS TRIGGER AS $$
DECLARE excluded_cols TEXT [] := ARRAY ['updated_at', 'last_synced_at', 'platform'];
old_record JSONB;
new_record JSONB;
filtered_old JSONB;
filtered_new JSONB;
col TEXT;
BEGIN -- Convert records to JSONB for comparison
old_record := to_jsonb(OLD);
new_record := to_jsonb(NEW);
-- Start with full records
filtered_old := old_record;
filtered_new := new_record;
-- Remove excluded columns from comparison
FOREACH col IN ARRAY excluded_cols LOOP filtered_old := filtered_old - col;
filtered_new := filtered_new - col;
END LOOP;
-- Only update timestamp if content actually changed
IF filtered_old IS DISTINCT
FROM filtered_new THEN NEW.updated_at = now();
ELSE -- Preserve the old updated_at value
NEW.updated_at = OLD.updated_at;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- =============================================================================
-- STEP 2: Replace existing triggers with the smart version
-- =============================================================================
-- People
DROP TRIGGER IF EXISTS update_people_updated_at ON public.people;
CREATE TRIGGER update_people_updated_at BEFORE
UPDATE ON public.people FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_on_content_change();
-- Events
DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
CREATE TRIGGER update_events_updated_at BEFORE
UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_on_content_change();
-- Routines
DROP TRIGGER IF EXISTS update_routines_updated_at ON public.routines;
CREATE TRIGGER update_routines_updated_at BEFORE
UPDATE ON public.routines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_on_content_change();
-- Blocks
DROP TRIGGER IF EXISTS update_blocks_updated_at ON public.blocks;
CREATE TRIGGER update_blocks_updated_at BEFORE
UPDATE ON public.blocks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_on_content_change();
-- Gear Assets
DROP TRIGGER IF EXISTS update_gear_assets_updated_at ON public.gear_assets;
CREATE TRIGGER update_gear_assets_updated_at BEFORE
UPDATE ON public.gear_assets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_on_content_change();
-- Pack Lists
DROP TRIGGER IF EXISTS update_pack_lists_updated_at ON public.pack_lists;
CREATE TRIGGER update_pack_lists_updated_at BEFORE
UPDATE ON public.pack_lists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_on_content_change();
-- Transactions
DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;
CREATE TRIGGER update_transactions_updated_at BEFORE
UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_on_content_change();
-- Categories
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at BEFORE
UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_on_content_change();
-- Songs
DROP TRIGGER IF EXISTS update_songs_updated_at ON public.songs;
CREATE TRIGGER update_songs_updated_at BEFORE
UPDATE ON public.songs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_on_content_change();
-- Set Lists
DROP TRIGGER IF EXISTS update_set_lists_updated_at ON public.set_lists;
CREATE TRIGGER update_set_lists_updated_at BEFORE
UPDATE ON public.set_lists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_on_content_change();
-- Profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE
UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_on_content_change();