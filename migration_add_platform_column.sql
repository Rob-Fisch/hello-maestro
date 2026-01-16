-- Migration: Add platform column to all user data tables
-- Purpose: Enable "Two Islands" sync strategy (Web vs Native)

-- Add platform column with default 'web' for existing data
ALTER TABLE events ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'web';
ALTER TABLE blocks ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'web';
ALTER TABLE routines ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'web';
ALTER TABLE categories ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'web';
ALTER TABLE people ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'web';
ALTER TABLE learning_paths ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'web';
ALTER TABLE songs ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'web';
ALTER TABLE set_lists ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'web';
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'web';
ALTER TABLE proof_of_work ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'web';

-- Add check constraint to ensure valid platform values
ALTER TABLE events ADD CONSTRAINT events_platform_check CHECK (platform IN ('web', 'native'));
ALTER TABLE blocks ADD CONSTRAINT blocks_platform_check CHECK (platform IN ('web', 'native'));
ALTER TABLE routines ADD CONSTRAINT routines_platform_check CHECK (platform IN ('web', 'native'));
ALTER TABLE categories ADD CONSTRAINT categories_platform_check CHECK (platform IN ('web', 'native'));
ALTER TABLE people ADD CONSTRAINT people_platform_check CHECK (platform IN ('web', 'native'));
ALTER TABLE learning_paths ADD CONSTRAINT learning_paths_platform_check CHECK (platform IN ('web', 'native'));
ALTER TABLE songs ADD CONSTRAINT songs_platform_check CHECK (platform IN ('web', 'native'));
ALTER TABLE set_lists ADD CONSTRAINT set_lists_platform_check CHECK (platform IN ('web', 'native'));
ALTER TABLE user_progress ADD CONSTRAINT user_progress_platform_check CHECK (platform IN ('web', 'native'));
ALTER TABLE proof_of_work ADD CONSTRAINT proof_of_work_platform_check CHECK (platform IN ('web', 'native'));

-- Create index for efficient platform filtering
CREATE INDEX IF NOT EXISTS events_platform_idx ON events(user_id, platform);
CREATE INDEX IF NOT EXISTS blocks_platform_idx ON blocks(user_id, platform);
CREATE INDEX IF NOT EXISTS routines_platform_idx ON routines(user_id, platform);
CREATE INDEX IF NOT EXISTS categories_platform_idx ON categories(user_id, platform);
CREATE INDEX IF NOT EXISTS people_platform_idx ON people(user_id, platform);
CREATE INDEX IF NOT EXISTS learning_paths_platform_idx ON learning_paths(user_id, platform);
CREATE INDEX IF NOT EXISTS songs_platform_idx ON songs(user_id, platform);
CREATE INDEX IF NOT EXISTS set_lists_platform_idx ON set_lists(user_id, platform);
CREATE INDEX IF NOT EXISTS user_progress_platform_idx ON user_progress(user_id, platform);
CREATE INDEX IF NOT EXISTS proof_of_work_platform_idx ON proof_of_work(user_id, platform);
