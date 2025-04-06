/*
  # Create admin user and fix permissions

  1. Changes
    - Create admin user in auth.users if not exists
    - Link admin user to public.users table
    - Update permissions and policies
    
  2. Security
    - Ensure proper role assignment
    - Maintain existing security model
*/

-- Create admin user in public.users table if not exists
DO $$
DECLARE
    admin_id uuid;
BEGIN
    -- First check if admin already exists in public.users
    IF NOT EXISTS (
        SELECT 1 FROM public.users 
        WHERE email = 'admin@epicaworks.com' 
        AND role = 'admin'
    ) THEN
        -- Get or create auth.users entry
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            confirmation_token,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'admin@epicaworks.com',
            crypt('admin123', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            encode(gen_random_bytes(32), 'hex'),
            encode(gen_random_bytes(32), 'hex'),
            encode(gen_random_bytes(32), 'hex')
        )
        ON CONFLICT (email) DO NOTHING
        RETURNING id INTO admin_id;

        -- If we got an id back, create public.users entry
        IF admin_id IS NOT NULL THEN
            INSERT INTO public.users (
                id,
                email,
                name,
                role,
                created_at,
                updated_at
            ) VALUES (
                admin_id,
                'admin@epicaworks.com',
                'Admin User',
                'admin',
                NOW(),
                NOW()
            );
        END IF;
    END IF;
END $$;

-- Ensure proper indexes exist
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;