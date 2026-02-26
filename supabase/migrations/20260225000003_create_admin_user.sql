
-- Need to install pgcrypto extension for password hashing if not already installed
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert default admin user into auth.users if not exists
DO $$
DECLARE
  new_user_id UUID := gen_random_uuid();
  admin_role_id UUID;
BEGIN
  -- Get admin role id
  SELECT id INTO admin_role_id FROM public.roles WHERE name = 'admin';

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@example.com') THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      aud,
      role
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'admin@example.com',
      crypt('password123', gen_salt('bf')), -- Supabase uses bcrypt
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"System Admin"}',
      now(),
      now(),
      'authenticated',
      'authenticated'
    );
    
    -- Ensure user is in public.users (trigger might fail if not set up correctly for manual inserts)
    INSERT INTO public.users (id, email, full_name, password_hash)
    VALUES (new_user_id, 'admin@example.com', 'System Admin', 'managed_by_supabase_auth')
    ON CONFLICT (email) DO NOTHING;

    -- Assign admin role
    INSERT INTO public.user_roles (user_id, role_id)
    SELECT id, admin_role_id FROM public.users WHERE email = 'admin@example.com'
    ON CONFLICT (user_id, role_id) DO NOTHING;
    
  ELSE
     -- If user exists, ensure they are confirmed and have correct password
     UPDATE auth.users 
     SET encrypted_password = crypt('password123', gen_salt('bf')),
         email_confirmed_at = now()
     WHERE email = 'admin@example.com';
     
     -- Also ensure they have admin role
     INSERT INTO public.user_roles (user_id, role_id)
     SELECT u.id, admin_role_id 
     FROM public.users u
     WHERE u.email = 'admin@example.com'
     ON CONFLICT (user_id, role_id) DO NOTHING;
  END IF;
END $$;
