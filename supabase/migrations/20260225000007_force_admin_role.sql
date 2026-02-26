
-- Force insert admin role for the user with email 'admin@example.com'
DO $$
DECLARE
  target_user_id UUID;
  admin_role_id UUID;
BEGIN
  -- Get user ID from auth.users
  SELECT id INTO target_user_id FROM auth.users WHERE email = 'admin@example.com';
  
  -- Get admin role ID
  SELECT id INTO admin_role_id FROM public.roles WHERE name = 'admin';
  
  IF target_user_id IS NOT NULL AND admin_role_id IS NOT NULL THEN
    -- Ensure user is in public.users
    INSERT INTO public.users (id, email, full_name, password_hash)
    VALUES (target_user_id, 'admin@example.com', 'System Admin', 'managed_by_supabase_auth')
    ON CONFLICT (id) DO NOTHING;

    -- Assign admin role
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (target_user_id, admin_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;
    
    RAISE NOTICE 'Admin role assigned successfully to user %', target_user_id;
  ELSE
    RAISE NOTICE 'User or Role not found. User ID: %, Role ID: %', target_user_id, admin_role_id;
  END IF;
END $$;
