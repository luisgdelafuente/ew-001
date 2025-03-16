/*
  # Create videos table and add sample data

  1. New Tables
    - `videos`
      - `id` (uuid, primary key)
      - `client` (text)
      - `activity` (text)
      - `videos` (jsonb array of video objects)
      - `created_at` (timestamp)

  2. Sample Data
    - Added 3 example entries with different clients and activities
    - Each entry includes multiple video ideas
*/

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client text NOT NULL,
  activity text NOT NULL,
  videos jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public can read videos"
  ON videos
  FOR SELECT
  TO public
  USING (true);

-- Insert sample data
INSERT INTO videos (client, activity, videos, created_at) VALUES
(
  'Real Estate Agency XYZ',
  'Luxury real estate agency specializing in high-end properties and exclusive listings',
  '[
    {
      "id": "v1",
      "title": "Inside Madrid''s Most Exclusive Penthouse",
      "description": "Tour of a stunning 300m² penthouse in the heart of Salamanca district",
      "length": 45,
      "approach": "direct",
      "date": "2025-03-16T10:00:00Z"
    },
    {
      "id": "v2",
      "title": "5 Tips for Selling Your Luxury Property",
      "description": "Expert advice on preparing and marketing high-end real estate",
      "length": 30,
      "approach": "indirect",
      "date": "2025-03-16T11:00:00Z"
    }
  ]'::jsonb,
  '2025-03-16T10:00:00Z'
),
(
  'Tech Startup ABC',
  'AI-powered software development company focused on business automation solutions',
  '[
    {
      "id": "v3",
      "title": "How AI is Transforming Business Operations",
      "description": "Showcase of our latest AI automation solutions in action",
      "length": 60,
      "approach": "direct",
      "date": "2025-03-16T12:00:00Z"
    },
    {
      "id": "v4",
      "title": "Future of Work: Automation Trends 2025",
      "description": "Industry insights and predictions for business automation",
      "length": 40,
      "approach": "indirect",
      "date": "2025-03-16T13:00:00Z"
    }
  ]'::jsonb,
  '2025-03-16T12:00:00Z'
),
(
  'Wellness Center Zen',
  'Holistic wellness center offering yoga, meditation, and alternative therapies',
  '[
    {
      "id": "v5",
      "title": "Morning Yoga Flow for Beginners",
      "description": "Simple yoga routine to start your day with energy",
      "length": 25,
      "approach": "direct",
      "date": "2025-03-16T14:00:00Z"
    },
    {
      "id": "v6",
      "title": "Understanding Mindfulness Meditation",
      "description": "Expert guide to meditation basics and benefits",
      "length": 35,
      "approach": "indirect",
      "date": "2025-03-16T15:00:00Z"
    }
  ]'::jsonb,
  '2025-03-16T14:00:00Z'
);