
-- Insert default Super Admin (you'll need to create this user via Supabase Auth first)
-- This is a placeholder that will be used after manual user creation
-- For now, we'll create a function to easily promote a user to super_admin

CREATE OR REPLACE FUNCTION public.make_super_admin(_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID;
BEGIN
  SELECT id INTO _user_id FROM auth.users WHERE email = _email;
  IF _user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, 'super_admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    UPDATE public.profiles SET must_change_password = false WHERE user_id = _user_id;
  END IF;
END;
$$;
