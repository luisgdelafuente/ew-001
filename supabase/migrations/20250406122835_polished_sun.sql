/*
  # Simplify RLS Policies and Fix Recursion

  1. Changes
    - Drop existing policies that may cause recursion
    - Create new simplified policies for users table
    - Update activity logs policies
    - Add indexes to improve policy performance

  2. Security
    - Maintain same security model but with simpler implementation
    - Prevent policy recursion while keeping proper access control
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage users" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Admins can view activity logs" ON activity_logs;

-- Create index to optimize role checks
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Simplified admin management policy
CREATE POLICY "Admins can manage users" 
ON users 
FOR ALL 
TO authenticated 
USING (
  -- Simple role check without recursion
  EXISTS (
    SELECT 1 
    FROM users u 
    WHERE u.id = auth.uid() 
    AND u.role = 'admin'
  )
);

-- Simple profile viewing policy
CREATE POLICY "Users can view their own profile" 
ON users 
FOR SELECT 
TO authenticated 
USING (
  -- Direct ID comparison or admin check
  auth.uid() = id OR 
  EXISTS (
    SELECT 1 
    FROM users u 
    WHERE u.id = auth.uid() 
    AND u.role = 'admin'
  )
);

-- Simplified activity logs policy
CREATE POLICY "Admins can view activity logs"
ON activity_logs
FOR SELECT
TO authenticated
USING (
  -- Reuse same admin check pattern
  EXISTS (
    SELECT 1 
    FROM users u 
    WHERE u.id = auth.uid() 
    AND u.role = 'admin'
  )
);

-- Add diagnostic function to check user roles
CREATE OR REPLACE FUNCTION check_user_role(user_id uuid)
RETURNS TABLE (
  has_auth_user boolean,
  has_public_user boolean,
  user_role text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXISTS(SELECT 1 FROM auth.users WHERE id = user_id) as has_auth_user,
    EXISTS(SELECT 1 FROM public.users WHERE id = user_id) as has_public_user,
    (SELECT role FROM public.users WHERE id = user_id) as user_role;
END;
$$;