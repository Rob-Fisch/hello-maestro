-- Add Teacher Strategy columns to routines table
-- Removing FK constraints to avoid "relation does not exist" errors
ALTER TABLE routines 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS original_routine_id TEXT,  -- ID of the source routine
ADD COLUMN IF NOT EXISTS cloned_from_user_id UUID;  -- ID of the teacher

-- Enable RLS
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;

-- Allow public read access
DROP POLICY IF EXISTS "Public routines are viewable by everyone" ON routines;
CREATE POLICY "Public routines are viewable by everyone" 
ON routines FOR SELECT 
USING (is_public = true);

-- Add social_link to events table
ALTER TABLE events
ADD COLUMN IF NOT EXISTS social_link TEXT;
