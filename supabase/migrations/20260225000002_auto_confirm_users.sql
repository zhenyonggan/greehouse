
-- Update existing users to be confirmed
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email_confirmed_at IS NULL;

-- Create a trigger to automatically confirm new users (for development only)
CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
  NEW.email_confirmed_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if trigger exists before creating to avoid errors
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created_confirm') THEN
    CREATE TRIGGER on_auth_user_created_confirm
      BEFORE INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.auto_confirm_user();
  END IF;
END $$;
