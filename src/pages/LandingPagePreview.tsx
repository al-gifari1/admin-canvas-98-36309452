import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Block, PageContent } from '@/types/builder';
import { HeroSection } from '@/components/builder/sections/HeroSection';
import { ProductShowcaseSection } from '@/components/builder/sections/ProductShowcaseSection';
import { CheckoutSection } from '@/components/builder/sections/CheckoutSection';
import { Loader2 } from 'lucide-react';

export default function LandingPagePreview() {
  const { pageId } = useParams<{ pageId: string }>();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [pageTitle, setPageTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPage() {
      if (!pageId) {
        setError('Page not found');
        setIsLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('landing_pages')
        .select('title, content')
        .eq('id', pageId)
        .single();

      if (fetchError) {
        setError('Page not found');
      } else if (data) {
        setPageTitle(data.title);
        const content = data.content as unknown as PageContent | null;
        if (content?.blocks) {
          setBlocks(content.blocks);
        }
      }
      setIsLoading(false);
    }

    fetchPage();
  }, [pageId]);

  useEffect(() => {
    if (pageTitle) {
      document.title = pageTitle;
    }
  }, [pageTitle]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Page Not Found</h1>
          <p className="text-muted-foreground">The requested page could not be found.</p>
        </div>
      </div>
    );
  }

  if (blocks.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Empty Page</h1>
          <p className="text-muted-foreground">This page has no content yet.</p>
        </div>
      </div>
    );
  }

  const renderBlock = (block: Block) => {
    switch (block.type) {
      case 'hero':
        return <HeroSection key={block.id} block={block} isPreview />;
      case 'product-showcase':
        return <ProductShowcaseSection key={block.id} block={block} isPreview />;
      case 'checkout':
        return <CheckoutSection key={block.id} block={block} isPreview />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {blocks.map(renderBlock)}
    </div>
  );
}
