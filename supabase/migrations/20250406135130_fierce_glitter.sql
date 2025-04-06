/*
  # Remove Analytics Tables

  1. Changes
    - Drop all analytics-related tables
    - Remove associated indexes
    - Clean up any related data

  2. Security
    - Remove associated RLS policies
*/

-- Drop analytics tables
DROP TABLE IF EXISTS public.page_views;
DROP TABLE IF EXISTS public.news_views;
DROP TABLE IF EXISTS public.referrers;
DROP TABLE IF EXISTS public.device_stats;