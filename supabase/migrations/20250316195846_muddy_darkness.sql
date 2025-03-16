/*
  # Add test data to video_shares table

  1. Test Data
    - Adds a sample video share entry with:
      - Company name: "Test Company"
      - Sample videos and selected videos
      - Non-expired timestamp
*/

INSERT INTO video_shares (
  id,
  company_name,
  videos,
  selected_videos,
  created_at,
  expires_at
) VALUES (
  'e52c9fdb-b6a5-4b88-9fc5-19499f2590c7',
  'Test Company',
  '[
    {
      "id": "video-1",
      "title": "How to Grow Your Business Online",
      "description": "Learn the essential strategies for expanding your business presence on the internet. This video covers key digital marketing techniques and tools.",
      "duration": 45,
      "type": "indirect"
    },
    {
      "id": "video-2", 
      "title": "Our Success Story",
      "description": "Discover how Test Company became a leader in the industry. We share our journey and key milestones.",
      "duration": 30,
      "type": "direct"
    }
  ]'::jsonb,
  '[
    {
      "id": "video-1",
      "title": "How to Grow Your Business Online",
      "description": "Learn the essential strategies for expanding your business presence on the internet. This video covers key digital marketing techniques and tools.",
      "duration": 45,
      "type": "indirect"
    }
  ]'::jsonb,
  now(),
  now() + interval '30 days'
);