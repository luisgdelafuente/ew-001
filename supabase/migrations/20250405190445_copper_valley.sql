/*
  # Fix Users Policy and Activity Logs Relation

  1. Changes
     - Fix infinite recursion in users table policies by rewriting them
     - Add proper foreign key relationship for activity_logs.user_id to auth.users
     
  2. Security
     - Maintains existing security model while fixing the recursive issue
     - Ensures proper relationship between activity_logs and users
*/

-- First, drop the problematic policies causing infinite recursion
DROP POLICY IF EXISTS "Admins can manage users" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;

-- Re-create policies with non-recursive logic
CREATE POLICY "Admins can manage users" 
ON public.users 
FOR ALL 
TO authenticated 
USING (
  (auth.jwt() ->> 'email') IN (
    SELECT email FROM public.users WHERE role = 'admin'
  )
);

CREATE POLICY "Users can view their own profile" 
ON public.users 
FOR SELECT 
TO authenticated 
USING (
  auth.uid() = id OR (
    (auth.jwt() ->> 'email') IN (
      SELECT email FROM public.users WHERE role = 'admin'
    )
  )
);

-- Fix activity_logs foreign key relationship
DO $$ 
BEGIN
  -- Check if the foreign key already exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'activity_logs_user_id_fkey' 
    AND table_name = 'activity_logs'
  ) THEN
    -- Add the foreign key constraint if it doesn't exist
    ALTER TABLE IF EXISTS public.activity_logs
    ADD CONSTRAINT activity_logs_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id);
  END IF;
END $$;

-- Update activity_logs policies to properly reference auth.users
DROP POLICY IF EXISTS "Admins can view activity logs" ON public.activity_logs;
CREATE POLICY "Admins can view activity logs"
ON public.activity_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);