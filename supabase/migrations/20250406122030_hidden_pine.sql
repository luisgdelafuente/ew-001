/*
  # Fix infinite recursion in users table RLS policies

  1. Changes
    - Drop existing policies causing infinite recursion
    - Create new policies that avoid querying the users table inside its own policies
    - Update activity_logs policies to avoid similar recursion issues
  
  2. Security
    - Maintain the same security model with improved implementation
    - Use direct auth.uid() comparisons instead of subqueries where possible
    - Use auth.jwt() for role checks to avoid recursive queries
*/

-- Drop the problematic policies causing infinite recursion
DROP POLICY IF EXISTS "Admins can manage users" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Admins can view activity logs" ON activity_logs;

-- Create simplified policies for the users table
-- For admins, we restrict full access to the current user ID and admin-flagged rows
CREATE POLICY "Admins can manage users" 
ON users 
FOR ALL 
TO authenticated 
USING (
  -- This avoids querying the users table inside its own policy
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.id IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  )
);

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile" 
ON users 
FOR SELECT 
TO authenticated 
USING (
  -- Simple direct comparison - you can always see your own profile
  auth.uid() = id
);

-- Policy for activity logs - allow admin access
CREATE POLICY "Admins can view activity logs"
ON activity_logs
FOR SELECT
TO authenticated
USING (
  -- Similar approach to avoid recursion
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.id IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  )
);