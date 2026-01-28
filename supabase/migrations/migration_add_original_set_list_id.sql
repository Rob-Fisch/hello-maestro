-- Migration: Add original_set_list_id column to set_lists table
-- Purpose: Support importing/forking set lists from library templates
-- Run this migration in Supabase SQL Editor

ALTER TABLE set_lists ADD COLUMN IF NOT EXISTS original_set_list_id UUID;

-- Optional: Add foreign key reference to self (for tracking the source set list)
-- Note: Not enforcing FK constraint as the original may be deleted
-- ALTER TABLE set_lists ADD CONSTRAINT fk_original_set_list 
--   FOREIGN KEY (original_set_list_id) REFERENCES set_lists(id) ON DELETE SET NULL;
