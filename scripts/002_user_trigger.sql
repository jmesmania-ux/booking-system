-- Create or replace function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    'client'
  )
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to auto-create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
