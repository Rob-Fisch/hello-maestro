-- FUNCTION: get_user_storage_usage
-- Returns the total size (in bytes) of all objects owned by the calling user in the 'media' bucket.

CREATE OR REPLACE FUNCTION get_user_storage_usage()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_bytes bigint;
BEGIN
  -- We assume files are stored in paths starting with the user's UUID (e.g., 'user_id/filename.ext')
  -- This query sums the 'metadata->size' from the 'storage.objects' table for the current user.
  -- Note: We join on owner_id to be safe, though path prefix is also a good check.
  
  SELECT COALESCE(SUM((metadata->>'size')::bigint), 0)
  INTO total_bytes
  FROM storage.objects
  WHERE bucket_id = 'media'
  AND owner = auth.uid();
  
  RETURN total_bytes;
END;
$$;
