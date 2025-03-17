/*
  # Add metadata fields for social sharing

  1. Changes
    - Add `share_title` column to store custom title for social sharing
    - Add `share_description` column to store custom description for social sharing
    - Both fields are nullable to maintain compatibility with existing records

  2. Security
    - Maintain existing RLS policies
*/

-- Add metadata columns
ALTER TABLE video_shares 
ADD COLUMN share_title text,
ADD COLUMN share_description text;