/*
  # Add activity column to video_shares table

  1. Changes
    - Add `activity` column to store the company's business activity
    - Make it nullable to maintain compatibility with existing records
    - Update policies to maintain security model

  2. Security
    - Maintain existing RLS policies
*/

-- Add activity column
ALTER TABLE video_shares 
ADD COLUMN IF NOT EXISTS activity text;