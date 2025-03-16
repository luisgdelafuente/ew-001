/*
  # Fix video shares table and policies

  1. Changes
    - Drop existing policies to avoid conflicts
    - Recreate table with same structure
    - Add new policies with unique names

  2. Security
    - Enable RLS
    - Allow public read access to non-expired shares
    - Allow public creation of new shares
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can read non-expired shares" ON video_shares;
DROP POLICY IF EXISTS "Anyone can create shares" ON video_shares;
DROP POLICY IF EXISTS "video_shares_read_policy" ON video_shares;
DROP POLICY IF EXISTS "video_shares_insert_policy" ON video_shares;

-- Create or update table
CREATE TABLE IF NOT EXISTS video_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  videos jsonb NOT NULL,
  selected_videos jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days')
);

-- Enable RLS
ALTER TABLE video_shares ENABLE ROW LEVEL SECURITY;

-- Create new policies with unique names
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