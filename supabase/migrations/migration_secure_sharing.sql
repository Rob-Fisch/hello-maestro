-- Add expires_at column to routines table
ALTER TABLE public.routines ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Comment on column
COMMENT ON COLUMN public.routines.expires_at IS 'Timestamp when the public sharing link expires and becomes invalid.';
