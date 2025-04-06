/*
  # Fix Admin RLS Policies

  1. Changes
    - Simplify RLS policies for admin access
    - Add helper functions for role checking
    - Fix user session handling
    
  2. Security
    - Maintain strict access control
    - Ensure admins can access all necessary data
    - Prevent policy recursion
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage users" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Admins can view activity logs" ON activity_logs;

-- Create helper function for role checking
CREATE OR REPLACE FUNCTION auth.check_is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$;

-- Create helper function for user role
CREATE OR REPLACE FUNCTION auth.get_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT role
    FROM public.users
    WHERE id = auth.uid()
  );
END;
$$;

-- Users table policies
CREATE POLICY "admin_all_access"
ON users
FOR ALL
TO authenticated
USING (
  auth.check_is_admin() OR id = auth.uid()
)
WITH CHECK (
  auth.check_is_admin() OR id = auth.uid()
);

-- News table policies
CREATE POLICY "admin_news_access"
ON news
FOR ALL
TO authenticated
USING (auth.check_is_admin())
WITH CHECK (auth.check_is_admin());

-- Media table policies
CREATE POLICY "admin_media_access"
ON media
FOR ALL
TO authenticated
USING (auth.check_is_admin())
WITH CHECK (auth.check_is_admin());

-- Settings table policies
CREATE POLICY "admin_settings_access"
ON settings
FOR ALL
TO authenticated
USING (auth.check_is_admin())
WITH CHECK (auth.check_is_admin());

-- Activity logs policies
CREATE POLICY "admin_logs_access"
ON activity_logs
FOR ALL
TO authenticated
USING (auth.check_is_admin())
WITH CHECK (auth.check_is_admin());

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION auth.check_is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION auth.get_user_role TO authenticated;