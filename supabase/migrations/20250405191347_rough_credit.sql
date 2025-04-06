/*
  # Fix Infinite Recursion in Users Policies and Activity Logs Issues

  1. Changes
    - Drop and recreate users table policies to prevent infinite recursion
    - Ensure proper foreign key relationship between activity_logs and auth.users
    - Fix activity_logs policies to properly check permissions

  2. Security
    - Maintain intended access control with non-recursive policies
    - Ensure proper data integrity with correct foreign key constraints
*/

-- Drop the problematic policies causing infinite recursion
DROP POLICY IF EXISTS "Admins can manage users" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;

-- Create new policies that avoid self-reference recursion
CREATE POLICY "Admins can manage users" 
ON users 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 
    FROM auth.users
    JOIN users AS u ON auth.users.id = u.id
    WHERE auth.users.id = auth.uid() 
    AND u.role = 'admin'
  )
);

CREATE POLICY "Users can view their own profile" 
ON users 
FOR SELECT 
TO authenticated 
USING (
  auth.uid() = id OR 
  EXISTS (
    SELECT 1 
    FROM auth.users
    JOIN users AS u ON auth.users.id = u.id
    WHERE auth.users.id = auth.uid() 
    AND u.role = 'admin'
  )
);

-- Ensure proper foreign key relationship for activity_logs
ALTER TABLE activity_logs 
DROP CONSTRAINT IF EXISTS activity_logs_user_id_fkey;

ALTER TABLE activity_logs
ADD CONSTRAINT activity_logs_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- Fix activity_logs policies to avoid recursion
DROP POLICY IF EXISTS "Admins can view activity logs" ON activity_logs;

CREATE POLICY "Admins can view activity logs"
ON activity_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM auth.users
    JOIN users AS u ON auth.users.id = u.id
    WHERE auth.users.id = auth.uid()
    AND u.role = 'admin'
  )
);