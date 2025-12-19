-- Create media_folders table for organizing files
CREATE TABLE public.media_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES public.media_folders(id) ON DELETE CASCADE,
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create media_files table for tracking uploaded files
CREATE TABLE public.media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  folder_id UUID REFERENCES public.media_folders(id) ON DELETE SET NULL,
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.media_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;

-- RLS policies for media_folders
CREATE POLICY "Developers can manage their folders"
ON public.media_folders FOR ALL
USING (is_developer_of_shop(auth.uid(), shop_id))
WITH CHECK (is_developer_of_shop(auth.uid(), shop_id));

CREATE POLICY "Shop owners can manage their folders"
ON public.media_folders FOR ALL
USING (is_shop_owner(auth.uid(), shop_id))
WITH CHECK (is_shop_owner(auth.uid(), shop_id));

CREATE POLICY "Super admins can view all folders"
ON public.media_folders FOR SELECT
USING (has_role(auth.uid(), 'super_admin'));

-- RLS policies for media_files
CREATE POLICY "Developers can manage their files"
ON public.media_files FOR ALL
USING (is_developer_of_shop(auth.uid(), shop_id))
WITH CHECK (is_developer_of_shop(auth.uid(), shop_id));

CREATE POLICY "Shop owners can manage their files"
ON public.media_files FOR ALL
USING (is_shop_owner(auth.uid(), shop_id))
WITH CHECK (is_shop_owner(auth.uid(), shop_id));

CREATE POLICY "Super admins can view all files"
ON public.media_files FOR SELECT
USING (has_role(auth.uid(), 'super_admin'));

-- Updated at trigger for folders
CREATE TRIGGER update_media_folders_updated_at
BEFORE UPDATE ON public.media_folders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();