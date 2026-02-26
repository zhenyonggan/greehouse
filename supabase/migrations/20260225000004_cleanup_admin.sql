
-- Delete the manually created admin user to clean up potential issues
DELETE FROM public.user_roles 
WHERE user_id IN (SELECT id FROM public.users WHERE email = 'admin@example.com');

DELETE FROM public.users 
WHERE email = 'admin@example.com';

DELETE FROM auth.users 
WHERE email = 'admin@example.com';
