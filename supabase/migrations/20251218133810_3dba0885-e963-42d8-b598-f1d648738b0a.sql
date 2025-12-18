
-- Add slug to shops table
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS slug TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS shops_slug_unique ON public.shops(slug) WHERE slug IS NOT NULL;

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  product_type TEXT NOT NULL DEFAULT 'physical' CHECK (product_type IN ('physical', 'digital')),
  gallery_images JSONB DEFAULT '[]'::jsonb,
  download_url TEXT,
  weight NUMERIC,
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create checkout_profiles table
CREATE TABLE public.checkout_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  enabled_fields JSONB DEFAULT '{"name": true, "phone": true, "email": false, "address": true, "city": true}'::jsonb,
  payment_methods JSONB DEFAULT '{"cod": true, "online": false}'::jsonb,
  version INTEGER DEFAULT 1,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create tracking_profiles table
CREATE TABLE public.tracking_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  facebook_pixel_id TEXT,
  tiktok_pixel_id TEXT,
  google_tag_manager_id TEXT,
  google_ads_id TEXT,
  custom_head_script TEXT,
  custom_body_script TEXT,
  version INTEGER DEFAULT 1,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create asset_versions table for full version history
CREATE TABLE public.asset_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('product', 'checkout_profile', 'tracking_profile', 'landing_page')),
  entity_id UUID NOT NULL,
  version INTEGER NOT NULL,
  data JSONB NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add foreign keys to landing_pages
ALTER TABLE public.landing_pages 
  ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS checkout_profile_id UUID REFERENCES public.checkout_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS tracking_profile_id UUID REFERENCES public.tracking_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS orders_count INTEGER DEFAULT 0;

-- Create unique constraint for landing page slug per shop
CREATE UNIQUE INDEX IF NOT EXISTS landing_pages_shop_slug_unique ON public.landing_pages(shop_id, slug);

-- Enable RLS on new tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkout_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_versions ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if developer can manage a shop (via shop owner assignment)
CREATE OR REPLACE FUNCTION public.is_developer_of_shop(_developer_id UUID, _shop_id UUID)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM shops s
    JOIN developer_assignments da ON da.shop_owner_id = s.owner_id
    WHERE s.id = _shop_id AND da.developer_id = _developer_id
  )
$$;

-- Products RLS Policies
CREATE POLICY "Developers can manage products for their shops"
ON public.products FOR ALL
USING (is_developer_of_shop(auth.uid(), shop_id))
WITH CHECK (is_developer_of_shop(auth.uid(), shop_id));

CREATE POLICY "Shop owners can view their products"
ON public.products FOR SELECT
USING (EXISTS (SELECT 1 FROM shops WHERE id = products.shop_id AND owner_id = auth.uid()));

CREATE POLICY "Super admins can view all products"
ON public.products FOR SELECT
USING (has_role(auth.uid(), 'super_admin'));

-- Checkout Profiles RLS Policies
CREATE POLICY "Developers can manage checkout profiles for their shops"
ON public.checkout_profiles FOR ALL
USING (is_developer_of_shop(auth.uid(), shop_id))
WITH CHECK (is_developer_of_shop(auth.uid(), shop_id));

CREATE POLICY "Shop owners can view their checkout profiles"
ON public.checkout_profiles FOR SELECT
USING (EXISTS (SELECT 1 FROM shops WHERE id = checkout_profiles.shop_id AND owner_id = auth.uid()));

CREATE POLICY "Super admins can view all checkout profiles"
ON public.checkout_profiles FOR SELECT
USING (has_role(auth.uid(), 'super_admin'));

-- Tracking Profiles RLS Policies
CREATE POLICY "Developers can manage tracking profiles for their shops"
ON public.tracking_profiles FOR ALL
USING (is_developer_of_shop(auth.uid(), shop_id))
WITH CHECK (is_developer_of_shop(auth.uid(), shop_id));

CREATE POLICY "Shop owners can view their tracking profiles"
ON public.tracking_profiles FOR SELECT
USING (EXISTS (SELECT 1 FROM shops WHERE id = tracking_profiles.shop_id AND owner_id = auth.uid()));

CREATE POLICY "Super admins can view all tracking profiles"
ON public.tracking_profiles FOR SELECT
USING (has_role(auth.uid(), 'super_admin'));

-- Asset Versions RLS Policies
CREATE POLICY "Developers can manage their asset versions"
ON public.asset_versions FOR ALL
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Super admins can view all asset versions"
ON public.asset_versions FOR SELECT
USING (has_role(auth.uid(), 'super_admin'));

-- Create updated_at triggers
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_checkout_profiles_updated_at
BEFORE UPDATE ON public.checkout_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tracking_profiles_updated_at
BEFORE UPDATE ON public.tracking_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
