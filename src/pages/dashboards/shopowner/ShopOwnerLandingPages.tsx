import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Eye, ExternalLink } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

interface ShopOwnerLandingPagesProps {
  shop: { id: string; name: string } | null;
}

export function ShopOwnerLandingPages({ shop }: ShopOwnerLandingPagesProps) {
  const [landingPages, setLandingPages] = useState<Tables<'landing_pages'>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (shop) {
      fetchLandingPages();
    }
  }, [shop]);

  const fetchLandingPages = async () => {
    if (!shop) return;

    try {
      const { data, error } = await supabase
        .from('landing_pages')
        .select('*')
        .eq('shop_id', shop.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLandingPages(data || []);
    } catch (error) {
      console.error('Error fetching landing pages:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Landing Pages</h2>
          <p className="text-muted-foreground">View your landing pages created by your developer</p>
        </div>
      </div>

      {landingPages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Landing Pages Yet</h3>
            <p className="text-muted-foreground text-center">
              Your developer will create landing pages for your campaigns.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {landingPages.map((page) => (
            <Card key={page.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{page.title}</CardTitle>
                  <Badge variant={page.is_published ? 'default' : 'secondary'}>
                    {page.is_published ? 'Published' : 'Draft'}
                  </Badge>
                </div>
                <CardDescription>/{page.slug}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {page.views_count || 0} views
                  </div>
                  <div>
                    {page.orders_count || 0} orders
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Page
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
