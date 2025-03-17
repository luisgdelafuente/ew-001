/*
  # Create videos table and add test data

  1. New Tables
    - `videos`
      - `id` (uuid, primary key)
      - `client` (text)
      - `activity` (text)
      - `videos` (jsonb)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policy for public read access

  3. Data
    - Add sample videos for different business types
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
CREATE POLICY "videos_read_policy"
  ON videos
  FOR SELECT
  TO public
  USING (true);

-- Insert sample data
INSERT INTO videos (client, activity, videos) VALUES
(
  'Digital Marketing Agency',
  'Full-service digital marketing and social media management',
  '[
    {
      "id": "v1",
      "title": "Social Media Success Stories",
      "description": "Case studies of successful social media campaigns we''ve managed",
      "length": 45,
      "approach": "direct",
      "date": "2025-03-16T10:00:00Z"
    },
    {
      "id": "v2",
      "title": "Top 5 Digital Marketing Trends",
      "description": "Latest trends shaping the digital marketing landscape",
      "length": 30,
      "approach": "indirect",
      "date": "2025-03-16T11:00:00Z"
    }
  ]'::jsonb
),
(
  'Fitness Studio Pro',
  'Premium fitness studio offering personalized training and group classes',
  '[
    {
      "id": "v3",
      "title": "Behind the Scenes: Personal Training",
      "description": "Experience our unique approach to personal fitness training",
      "length": 35,
      "approach": "direct",
      "date": "2025-03-16T12:00:00Z"
    },
    {
      "id": "v4",
      "title": "Quick Home Workout Tips",
      "description": "Expert fitness tips you can implement at home",
      "length": 25,
      "approach": "indirect",
      "date": "2025-03-16T13:00:00Z"
    }
  ]'::jsonb
),
(
  'Eco Solutions',
  'Sustainable product manufacturer and environmental consulting',
  '[
    {
      "id": "v5",
      "title": "Our Sustainable Manufacturing Process",
      "description": "Tour of our eco-friendly production facilities",
      "length": 50,
      "approach": "direct",
      "date": "2025-03-16T14:00:00Z"
    },
    {
      "id": "v6",
      "title": "Easy Steps to Reduce Carbon Footprint",
      "description": "Practical tips for businesses to become more sustainable",
      "length": 40,
      "approach": "indirect",
      "date": "2025-03-16T15:00:00Z"
    }
  ]'::jsonb
);