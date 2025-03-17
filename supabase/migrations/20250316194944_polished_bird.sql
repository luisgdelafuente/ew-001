/*
  # Create video shares schema

  1. New Tables
    - `video_shares`
      - `id` (uuid, primary key) - Unique identifier for the share
      - `company_name` (text) - Name of the company
      - `videos` (jsonb) - Array of video objects
      - `selected_videos` (jsonb) - Array of selected video objects
      - `created_at` (timestamptz) - When the share was created
      - `expires_at` (timestamptz) - When the share expires (30 days from creation)

  2. Security
    - Enable RLS on `video_shares` table
    - Add policy for public read access to non-expired shares
*/

CREATE TABLE IF NOT EXISTS video_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  videos jsonb NOT NULL,
  selected_videos jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days')
);

ALTER TABLE video_shares ENABLE ROW LEVEL SECURITY;

-- Allow public read access to non-expired shares
CREATE POLICY "Public can read non-expired shares"
  ON video_shares
  FOR SELECT
  TO public
  USING (expires_at > now());

-- Allow anyone to insert new shares
CREATE POLICY "Anyone can create shares"
  ON video_shares
  FOR INSERT
  TO public
  WITH CHECK (true);