-- Extend products table with new columns
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS cost_price NUMERIC DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS discount_price NUMERIC;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS discount_percentage NUMERIC;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS main_image TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS long_description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS track_inventory BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS current_stock INTEGER DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 10;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_unit TEXT DEFAULT 'piece';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS owner_type TEXT DEFAULT 'developer';

-- Create unique index on SKU (allowing nulls)
CREATE UNIQUE INDEX IF NOT EXISTS products_sku_unique ON public.products (sku) WHERE sku IS NOT NULL;

-- Create stock_movements table for tracking inventory changes
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  shop_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'sale', 'adjustment', 'return')),
  quantity INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  source TEXT,
  supplier TEXT,
  invoice_no TEXT,
  cost_price NUMERIC,
  notes TEXT,
  done_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on stock_movements
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- Stock movements policies
CREATE POLICY "Developers can manage stock movements for their shops"
ON public.stock_movements FOR ALL
USING (is_developer_of_shop(auth.uid(), shop_id))
WITH CHECK (is_developer_of_shop(auth.uid(), shop_id));

CREATE POLICY "Shop owners can manage their stock movements"
ON public.stock_movements FOR ALL
USING (is_shop_owner(auth.uid(), shop_id))
WITH CHECK (is_shop_owner(auth.uid(), shop_id));

CREATE POLICY "Super admins can view all stock movements"
ON public.stock_movements FOR SELECT
USING (has_role(auth.uid(), 'super_admin'));

-- Create product_categories table
CREATE TABLE IF NOT EXISTS public.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  parent_id UUID REFERENCES public.product_categories(id),
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on product_categories
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- Product categories policies
CREATE POLICY "Developers can manage categories for their shops"
ON public.product_categories FOR ALL
USING (is_developer_of_shop(auth.uid(), shop_id))
WITH CHECK (is_developer_of_shop(auth.uid(), shop_id));

CREATE POLICY "Shop owners can manage their categories"
ON public.product_categories FOR ALL
USING (is_shop_owner(auth.uid(), shop_id))
WITH CHECK (is_shop_owner(auth.uid(), shop_id));

CREATE POLICY "Super admins can view all categories"
ON public.product_categories FOR SELECT
USING (has_role(auth.uid(), 'super_admin'));

-- Add updated_at trigger for stock_movements isn't needed (no updates expected)
-- Add updated_at trigger for product_categories
CREATE TRIGGER update_product_categories_updated_at
BEFORE UPDATE ON public.product_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();