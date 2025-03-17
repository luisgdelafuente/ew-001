/*
  # Update video_shares table ID type

  1. Changes
    - Change id column type from uuid to text to support numeric client numbers
    - Maintain existing data and constraints
    - Update RLS policies to work with new ID type

  2. Security
    - Maintain existing RLS policies
    - Ensure data integrity with new ID type
*/

-- Temporarily disable RLS
ALTER TABLE video_shares DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "video_shares_read_policy_v2" ON video_shares;
DROP POLICY IF EXISTS "video_shares_insert_policy_v2" ON video_shares;

-- Create new table with desired structure
CREATE TABLE IF NOT EXISTS video_shares_new (
  id text PRIMARY KEY,
  company_name text NOT NULL,
  videos jsonb NOT NULL,
  selected_videos jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days')
);

-- Copy data from old table to new table (if any exists)
INSERT INTO video_shares_new (id, company_name, videos, selected_videos, created_at, expires_at)
SELECT id::text, company_name, videos, selected_videos, created_at, expires_at
FROM video_shares;

-- Drop old table and rename new table
DROP TABLE video_shares;
ALTER TABLE video_shares_new RENAME TO video_shares;

-- Enable RLS
ALTER TABLE video_shares ENABLE ROW LEVEL SECURITY;

-- Recreate policies
CREATE POLICY "video_shares_read_policy_v2"
  ON video_shares
  FOR SELECT
  TO public
  USING (expires_at > now());

CREATE POLICY "video_shares_insert_policy_v2"
  ON video_shares
  FOR INSERT
  TO public
  WITH CHECK (true);