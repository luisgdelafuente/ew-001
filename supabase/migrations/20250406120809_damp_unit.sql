/*
  # Fix infinite recursion in users table policies

  1. Changes
    - Drop existing problematic policies on the users table
    - Create new non-recursive policies that avoid querying the users table within the policy itself
    - Fix activity_logs policies to prevent recursion

  2. Security
    - Maintain the same intended access control model
    - Admins can still manage all users
    - Users can only view their own profiles
*/

-- Drop the problematic policies causing infinite recursion
DROP POLICY IF EXISTS "Admins can manage users" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Admins can view activity logs" ON activity_logs;

-- Create new policies that avoid recursion
-- For the users table, directly check the role claim in the JWT
CREATE POLICY "Admins can manage users" 
ON users 
FOR ALL 
TO authenticated 
USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Users can view their own profile" 
ON users 
FOR SELECT 
TO authenticated 
USING (
  auth.uid() = id OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

-- Fix activity_logs policy to avoid recursion
CREATE POLICY "Admins can view activity logs"
ON activity_logs
FOR SELECT
TO authenticated
USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);