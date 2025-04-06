/*
  # Remove Analytics Tables and Functions

  1. Changes
    - Drop all analytics-related tables
    - Drop any associated functions and triggers
    - Clean up any remaining analytics data

  2. Security
    - Remove associated RLS policies
*/

-- Drop analytics tables if they exist
DROP TABLE IF EXISTS public.page_views CASCADE;
DROP TABLE IF EXISTS public.news_views CASCADE;
DROP TABLE IF EXISTS public.referrers CASCADE;
DROP TABLE IF EXISTS public.device_stats CASCADE;

-- Drop analytics policies
DROP POLICY IF EXISTS "Authenticated users can view analytics" ON page_views;
DROP POLICY IF EXISTS "Authenticated users can view analytics" ON news_views;
DROP POLICY IF EXISTS "Authenticated users can view analytics" ON referrers;
DROP POLICY IF EXISTS "Authenticated users can view analytics" ON device_stats;