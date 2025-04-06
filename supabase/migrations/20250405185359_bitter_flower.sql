/*
  # Admin Dashboard Schema

  1. New Tables
    - `pages` - Content management for static pages
    - `categories` - Categories for news articles
    - `news` - News articles and blog posts
    - `media` - Media library for images and documents
    - `users` - Extended user information and roles
    - `settings` - Site configuration and settings
    - `page_versions` - Version history for pages
    - `activity_logs` - User activity tracking
    - `page_views` - Analytics for page views
    - `news_views` - Analytics for news article views
    - `referrers` - Analytics for traffic sources
    - `device_stats` - Analytics for device types

  2. Security
    - Enable RLS on all tables
    - Set up appropriate policies for each role
*/

-- Pages table for static content
CREATE TABLE IF NOT EXISTS pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text,
  meta_title text,
  meta_description text,
  featured_image text,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

-- Categories for news articles
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- News articles
CREATE TABLE IF NOT EXISTS news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text,
  excerpt text,
  featured_image text,
  meta_title text,
  meta_description text,
  category_id uuid REFERENCES categories(id),
  tags text[],
  status text NOT NULL DEFAULT 'draft',
  publish_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

-- Media library
CREATE TABLE IF NOT EXISTS media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  file_path text NOT NULL UNIQUE,
  mime_type text NOT NULL,
  size integer NOT NULL,
  url text NOT NULL,
  alt_text text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Extended user information with roles
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text NOT NULL UNIQUE,
  name text,
  role text NOT NULL DEFAULT 'editor',
  last_sign_in_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Site settings
CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Page version history
CREATE TABLE IF NOT EXISTS page_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid REFERENCES pages(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

-- Activity logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Analytics - Page views
CREATE TABLE IF NOT EXISTS page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  path text NOT NULL,
  count integer NOT NULL DEFAULT 1
);

-- Analytics - News article views
CREATE TABLE IF NOT EXISTS news_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  article_id uuid REFERENCES news(id) ON DELETE CASCADE,
  count integer NOT NULL DEFAULT 1
);

-- Analytics - Referrers
CREATE TABLE IF NOT EXISTS referrers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  domain text,
  count integer NOT NULL DEFAULT 1
);

-- Analytics - Device stats
CREATE TABLE IF NOT EXISTS device_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  device_type text NOT NULL,
  count integer NOT NULL DEFAULT 1
);

-- Enable Row Level Security on all tables
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrers ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_stats ENABLE ROW LEVEL SECURITY;

-- Set up RLS policies

-- Pages policies
CREATE POLICY "Public can view published pages" ON pages
  FOR SELECT USING (status = 'published');

CREATE POLICY "Authenticated users can select pages" ON pages
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Editors can insert pages" ON pages
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'editor' OR users.role = 'admin')
    )
  );

CREATE POLICY "Editors can update pages" ON pages
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'editor' OR users.role = 'admin')
    )
  );

CREATE POLICY "Editors can delete pages" ON pages
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'editor' OR users.role = 'admin')
    )
  );

-- Categories policies
CREATE POLICY "Public can view categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Editors can manage categories" ON categories
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'editor' OR users.role = 'admin')
    )
  );

-- News policies
CREATE POLICY "Public can view published news" ON news
  FOR SELECT USING (status = 'published' AND (publish_date IS NULL OR publish_date <= now()));

CREATE POLICY "Authenticated users can select news" ON news
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Editors can insert news" ON news
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'editor' OR users.role = 'admin')
    )
  );

CREATE POLICY "Editors can update news" ON news
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'editor' OR users.role = 'admin')
    )
  );

CREATE POLICY "Editors can delete news" ON news
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'editor' OR users.role = 'admin')
    )
  );

-- Media policies
CREATE POLICY "Public can view media" ON media
  FOR SELECT USING (true);

CREATE POLICY "Editors can manage media" ON media
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'editor' OR users.role = 'admin')
    )
  );

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT TO authenticated USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage users" ON users
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Settings policies
CREATE POLICY "Public can view settings" ON settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage settings" ON settings
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Page versions policies
CREATE POLICY "Authenticated users can view page versions" ON page_versions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Editors can insert page versions" ON page_versions
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (users.role = 'editor' OR users.role = 'admin')
    )
  );

-- Activity logs policies
CREATE POLICY "Admins can view activity logs" ON activity_logs
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can create activity logs" ON activity_logs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Analytics policies
CREATE POLICY "Authenticated users can view analytics" ON page_views FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view analytics" ON news_views FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view analytics" ON referrers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view analytics" ON device_stats FOR SELECT TO authenticated USING (true);

-- Insert default data

-- Default categories
INSERT INTO categories (name, slug, description) VALUES
('News', 'news', 'Company news and updates'),
('Blog', 'blog', 'Blog posts and articles'),
('Press Releases', 'press-releases', 'Official press releases');

-- Default settings
INSERT INTO settings (key, value) VALUES
('site_name', 'Epica Works'),
('site_description', 'AI-powered video content creation'),
('contact_email', 'hello@epicaworks.com');

-- Default pages (About Us, Legal)
INSERT INTO pages (title, slug, content, status) VALUES
('About Us', 'about', '<h1>About Epica Works</h1><p>Epica Works is a leading provider of AI-powered video content creation solutions. We help businesses create engaging, personalized video content that resonates with their audience.</p><p>Our team combines expertise in video production, artificial intelligence, and digital marketing to deliver exceptional results for our clients.</p>', 'published'),
('Terms and Privacy Policy', 'legal', '<h1>Terms of Service</h1><p>These Terms of Service govern your use of the Epica Works platform. By using our service, you agree to these terms.</p><h2>Privacy Policy</h2><p>At Epica Works, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information.</p>', 'published');