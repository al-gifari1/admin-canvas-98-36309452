import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Save, Eye, Settings, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface LandingPage {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
  shop_id: string;
  shops?: {
    name: string;
  };
}

interface DeveloperBuilderProps {
  pageId: string;
  onBack: () => void;
}

export function DeveloperBuilder({ pageId, onBack }: DeveloperBuilderProps) {
  const [page, setPage] = useState<LandingPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchPage() {
      const { data, error } = await supabase
        .from('landing_pages')
        .select('id, title, slug, is_published, shop_id, shops(name)')
        .eq('id', pageId)
        .single();

      if (error) {
        console.error('Error fetching page:', error);
      } else {
        setPage(data as LandingPage);
      }
      setIsLoading(false);
    }

    fetchPage();
  }, [pageId]);

  const handleSave = async () => {
    if (!page) return;
    
    setIsSaving(true);
    const { error } = await supabase
      .from('landing_pages')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', page.id);

    setIsSaving(false);

    if (error) {
      toast({
        title: 'Error saving page',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Page saved',
        description: 'Your landing page has been saved successfully.',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Pages
        </Button>
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">Page not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{page.title}</h1>
              <Badge variant={page.is_published ? 'default' : 'secondary'}>
                {page.is_published ? 'Published' : 'Draft'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {page.shops?.name ? `${page.shops.name} • ` : ''}/{page.slug}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save
          </Button>
        </div>
      </div>

      {/* Builder Canvas Placeholder */}
      <Card className="min-h-[600px]">
        <CardHeader>
          <CardTitle>Page Builder</CardTitle>
          <CardDescription>
            Drag and drop sections from the Section Library to build your landing page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex min-h-[500px] items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25">
            <div className="text-center">
              <p className="text-lg font-medium text-muted-foreground">
                Builder Coming Soon
              </p>
              <p className="text-sm text-muted-foreground">
                Drag & drop page builder will be implemented here
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}