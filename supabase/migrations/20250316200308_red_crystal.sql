/*
  # Fix video shares policies

  1. Changes
    - Drop existing policies
    - Recreate policies with unique names
    - Keep table structure unchanged

  2. Security
    - Maintain same security model with RLS
    - Allow public read access to non-expired shares
    - Allow public creation of new shares
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Public can read non-expired shares" ON video_shares;
DROP POLICY IF EXISTS "Anyone can create shares" ON video_shares;

-- Create table if it doesn't exist (idempotent)
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

-- Recreate policies with unique names
CREATE POLICY "video_shares_read_policy"
  ON video_shares
  FOR SELECT
  TO public
  USING (expires_at > now());

CREATE POLICY "video_shares_insert_policy"
  ON video_shares
  FOR INSERT
  TO public
  WITH CHECK (true);