
-- Create the app role enum with 5 distinct roles
CREATE TYPE public.app_role AS ENUM ('super_admin', 'developer', 'shop_owner', 'order_manager', 'employee');

-- Create profiles table for user info
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_by UUID REFERENCES auth.users(id),
  must_change_password BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create shops table for multi-tenancy
CREATE TABLE public.shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create shop_assignments table for employees and order managers
CREATE TABLE public.shop_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  assigned_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, shop_id)
);

-- Create developer_shop_owners table to track which developer created which shop owner
CREATE TABLE public.developer_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shop_owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (developer_id, shop_owner_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.developer_assignments ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user's role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Function to check if user can manage another user (hierarchy check)
CREATE OR REPLACE FUNCTION public.can_manage_user(_manager_id UUID, _target_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  manager_role app_role;
  target_role app_role;
BEGIN
  SELECT role INTO manager_role FROM public.user_roles WHERE user_id = _manager_id;
  SELECT role INTO target_role FROM public.user_roles WHERE user_id = _target_id;
  
  -- Super admin can manage everyone except other super admins
  IF manager_role = 'super_admin' AND target_role != 'super_admin' THEN
    RETURN TRUE;
  END IF;
  
  -- Developer can manage shop owners they created
  IF manager_role = 'developer' AND target_role = 'shop_owner' THEN
    RETURN EXISTS (
      SELECT 1 FROM public.developer_assignments 
      WHERE developer_id = _manager_id AND shop_owner_id = _target_id
    );
  END IF;
  
  -- Shop owner can manage their employees and order managers
  IF manager_role = 'shop_owner' AND target_role IN ('order_manager', 'employee') THEN
    RETURN EXISTS (
      SELECT 1 FROM public.shops s
      JOIN public.shop_assignments sa ON sa.shop_id = s.id
      WHERE s.owner_id = _manager_id AND sa.user_id = _target_id
    );
  END IF;
  
  RETURN FALSE;
END;
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Super admins can view all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Developers can view their shop owners profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'developer') AND
    EXISTS (
      SELECT 1 FROM public.developer_assignments da 
      WHERE da.developer_id = auth.uid() AND da.shop_owner_id = profiles.user_id
    )
  );

CREATE POLICY "Shop owners can view their staff profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'shop_owner') AND
    EXISTS (
      SELECT 1 FROM public.shops s
      JOIN public.shop_assignments sa ON sa.shop_id = s.id
      WHERE s.owner_id = auth.uid() AND sa.user_id = profiles.user_id
    )
  );

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Super admin can insert profiles" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'developer') OR public.has_role(auth.uid(), 'shop_owner'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view own role" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Super admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Developers can view shop owner roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'developer') AND
    role = 'shop_owner' AND
    EXISTS (
      SELECT 1 FROM public.developer_assignments da 
      WHERE da.developer_id = auth.uid() AND da.shop_owner_id = user_roles.user_id
    )
  );

CREATE POLICY "Shop owners can view staff roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'shop_owner') AND
    role IN ('order_manager', 'employee') AND
    EXISTS (
      SELECT 1 FROM public.shops s
      JOIN public.shop_assignments sa ON sa.shop_id = s.id
      WHERE s.owner_id = auth.uid() AND sa.user_id = user_roles.user_id
    )
  );

-- RLS Policies for shops
CREATE POLICY "Super admins can view all shops" ON public.shops
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Developers can view shops they created owners for" ON public.shops
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'developer') AND
    EXISTS (
      SELECT 1 FROM public.developer_assignments da 
      WHERE da.developer_id = auth.uid() AND da.shop_owner_id = shops.owner_id
    )
  );

CREATE POLICY "Shop owners can view own shop" ON public.shops
  FOR SELECT TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Staff can view assigned shop" ON public.shops
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.shop_assignments sa
      WHERE sa.shop_id = shops.id AND sa.user_id = auth.uid()
    )
  );

CREATE POLICY "Developers can create shops" ON public.shops
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'developer'));

CREATE POLICY "Shop owners can update own shop" ON public.shops
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid());

-- RLS Policies for shop_assignments
CREATE POLICY "Super admins can view all assignments" ON public.shop_assignments
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Shop owners can view their shop assignments" ON public.shop_assignments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.shops s
      WHERE s.id = shop_assignments.shop_id AND s.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own assignment" ON public.shop_assignments
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Shop owners can create assignments for their shops" ON public.shop_assignments
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'shop_owner') AND
    EXISTS (
      SELECT 1 FROM public.shops s
      WHERE s.id = shop_assignments.shop_id AND s.owner_id = auth.uid()
    )
  );

-- RLS Policies for developer_assignments
CREATE POLICY "Super admins can view all developer assignments" ON public.developer_assignments
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Developers can view own assignments" ON public.developer_assignments
  FOR SELECT TO authenticated
  USING (developer_id = auth.uid());

CREATE POLICY "Super admins can create developer assignments" ON public.developer_assignments
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'developer'));

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shops_updated_at
  BEFORE UPDATE ON public.shops
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
