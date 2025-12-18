-- Create helper functions with SECURITY DEFINER to bypass RLS and prevent recursion
CREATE OR REPLACE FUNCTION public.is_shop_owner(_user_id uuid, _shop_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.shops
    WHERE id = _shop_id AND owner_id = _user_id
  )
$$;

CREATE OR REPLACE FUNCTION public.is_shop_staff(_user_id uuid, _shop_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.shop_assignments
    WHERE shop_id = _shop_id AND user_id = _user_id
  )
$$;

-- Fix shops policies - replace direct queries with function calls
DROP POLICY IF EXISTS "Staff can view assigned shop" ON public.shops;
CREATE POLICY "Staff can view assigned shop" ON public.shops
FOR SELECT USING (is_shop_staff(auth.uid(), id));

-- Fix shop_assignments policies  
DROP POLICY IF EXISTS "Shop owners can view their shop assignments" ON public.shop_assignments;
CREATE POLICY "Shop owners can view their shop assignments" ON public.shop_assignments
FOR SELECT USING (is_shop_owner(auth.uid(), shop_id));

-- Fix landing_pages policies
DROP POLICY IF EXISTS "Shop owners can manage their landing pages" ON public.landing_pages;
CREATE POLICY "Shop owners can manage their landing pages" ON public.landing_pages
FOR ALL USING (shop_id IS NOT NULL AND is_shop_owner(auth.uid(), shop_id));

DROP POLICY IF EXISTS "Staff can view assigned shop landing pages" ON public.landing_pages;
CREATE POLICY "Staff can view assigned shop landing pages" ON public.landing_pages
FOR SELECT USING (shop_id IS NOT NULL AND is_shop_staff(auth.uid(), shop_id));

-- Add policy for developers to manage landing pages they created (including those without shop_id)
CREATE POLICY "Developers can manage their landing pages" ON public.landing_pages
FOR ALL USING (
  has_role(auth.uid(), 'developer') AND created_by = auth.uid()
) WITH CHECK (
  has_role(auth.uid(), 'developer') AND created_by = auth.uid()
);