-- Create landing_pages table
CREATE TABLE public.landing_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content JSONB DEFAULT '{}',
  is_published BOOLEAN DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'completed', 'cancelled')),
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audit_log table for activity tracking
CREATE TABLE public.audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create system_settings table
CREATE TABLE public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  updated_by UUID,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add status column to profiles for active/suspended
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned'));

-- Enable RLS
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Landing Pages RLS Policies
CREATE POLICY "Super admins can view all landing pages"
ON public.landing_pages FOR SELECT
USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Shop owners can manage their landing pages"
ON public.landing_pages FOR ALL
USING (EXISTS (
  SELECT 1 FROM shops s WHERE s.id = landing_pages.shop_id AND s.owner_id = auth.uid()
));

CREATE POLICY "Staff can view assigned shop landing pages"
ON public.landing_pages FOR SELECT
USING (EXISTS (
  SELECT 1 FROM shop_assignments sa WHERE sa.shop_id = landing_pages.shop_id AND sa.user_id = auth.uid()
));

-- Orders RLS Policies
CREATE POLICY "Super admins can view all orders"
ON public.orders FOR SELECT
USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Shop owners can manage their orders"
ON public.orders FOR ALL
USING (EXISTS (
  SELECT 1 FROM shops s WHERE s.id = orders.shop_id AND s.owner_id = auth.uid()
));

CREATE POLICY "Staff can view assigned shop orders"
ON public.orders FOR SELECT
USING (EXISTS (
  SELECT 1 FROM shop_assignments sa WHERE sa.shop_id = orders.shop_id AND sa.user_id = auth.uid()
));

-- Audit Log RLS Policies (Super admin only for full view)
CREATE POLICY "Super admins can view all audit logs"
ON public.audit_log FOR SELECT
USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can view their own audit logs"
ON public.audit_log FOR SELECT
USING (user_id = auth.uid());

-- System Settings RLS Policies (Super admin only)
CREATE POLICY "Super admins can manage system settings"
ON public.system_settings FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

-- Create function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event(
  _action TEXT,
  _entity_type TEXT,
  _entity_id UUID DEFAULT NULL,
  _details JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _log_id UUID;
BEGIN
  INSERT INTO public.audit_log (user_id, action, entity_type, entity_id, details)
  VALUES (auth.uid(), _action, _entity_type, _entity_id, _details)
  RETURNING id INTO _log_id;
  RETURN _log_id;
END;
$$;

-- Insert default system settings
INSERT INTO public.system_settings (key, value, description)
VALUES 
  ('unlimited_pages', '{"enabled": true}', 'Allow Developers to create unlimited pages'),
  ('maintenance_mode', '{"enabled": false}', 'System Maintenance Mode')
ON CONFLICT (key) DO NOTHING;

-- Create triggers for updated_at
CREATE TRIGGER update_landing_pages_updated_at
BEFORE UPDATE ON public.landing_pages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();