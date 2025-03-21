/*
  # Add purchase order support to video_shares

  1. Changes
    - Add `type` column to differentiate between video proposals and purchase orders
    - Add `total_amount` column to store the order total
    - Add `discount_amount` column to store applied discounts
    - Add `base_price` column to store the original price per video

  2. Security
    - Maintain existing RLS policies
*/

-- Add new columns to video_shares table
ALTER TABLE video_shares 
ADD COLUMN type text NOT NULL DEFAULT 'proposal',
ADD COLUMN total_amount integer,
ADD COLUMN discount_amount integer,
ADD COLUMN base_price integer;

-- Add check constraint to ensure valid types
ALTER TABLE video_shares
ADD CONSTRAINT valid_share_type 
CHECK (type IN ('proposal', 'order'));