-- Drop the problematic policies that cause recursion
DROP POLICY IF EXISTS "Shop owners can view their staff profiles" ON public.profiles;
DROP POLICY IF EXISTS "Developers can view their shop owners profiles" ON public.profiles;
DROP POLICY IF EXISTS "Shop owners can view staff roles" ON public.user_roles;
DROP POLICY IF EXISTS "Developers can view shop owner roles" ON public.user_roles;

-- Create a security definer function to check if user is a shop owner of a staff member
CREATE OR REPLACE FUNCTION public.is_shop_owner_of_user(_owner_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM shops s
    JOIN shop_assignments sa ON sa.shop_id = s.id
    WHERE s.owner_id = _owner_id AND sa.user_id = _user_id
  )
$$;

-- Create a security definer function to check if developer manages a shop owner
CREATE OR REPLACE FUNCTION public.is_developer_of_shop_owner(_developer_id uuid, _shop_owner_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM developer_assignments da
    WHERE da.developer_id = _developer_id AND da.shop_owner_id = _shop_owner_id
  )
$$;

-- Recreate the policies using the security definer functions
CREATE POLICY "Shop owners can view their staff profiles" 
ON public.profiles 
FOR SELECT
USING (
  has_role(auth.uid(), 'shop_owner') AND 
  is_shop_owner_of_user(auth.uid(), profiles.user_id)
);

CREATE POLICY "Developers can view their shop owners profiles" 
ON public.profiles 
FOR SELECT
USING (
  has_role(auth.uid(), 'developer') AND 
  is_developer_of_shop_owner(auth.uid(), profiles.user_id)
);

CREATE POLICY "Shop owners can view staff roles" 
ON public.user_roles 
FOR SELECT
USING (
  has_role(auth.uid(), 'shop_owner') AND 
  role IN ('order_manager', 'employee') AND 
  is_shop_owner_of_user(auth.uid(), user_roles.user_id)
);

CREATE POLICY "Developers can view shop owner roles" 
ON public.user_roles 
FOR SELECT
USING (
  has_role(auth.uid(), 'developer') AND 
  role = 'shop_owner' AND 
  is_developer_of_shop_owner(auth.uid(), user_roles.user_id)
);