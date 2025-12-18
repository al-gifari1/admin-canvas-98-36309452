import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Block, PageContent } from '@/types/builder';
import { HeroSection } from '@/components/builder/sections/HeroSection';
import { ProductShowcaseSection } from '@/components/builder/sections/ProductShowcaseSection';
import { PublicCheckoutSection } from '@/components/public/PublicCheckoutSection';
import { Loader2 } from 'lucide-react';

interface LandingPageData {
  id: string;
  title: string;
  content: PageContent | null;
  is_published: boolean;
  checkout_config: CheckoutConfig | null;
  product_id: string | null;
  shop_id: string;
  shops: {
    id: string;
    name: string;
    slug: string;
  } | null;
  products: {
    id: string;
    name: string;
    price: number;
    description: string | null;
  } | null;
}

interface CheckoutConfig {
  delivery_fee: number;
  allowed_cities: string[];
  allow_all_locations: boolean;
  free_delivery_message: string;
  free_delivery_threshold: number | null;
}

export default function PublicLandingPage() {
  const { shopSlug, pageSlug } = useParams<{ shopSlug: string; pageSlug: string }>();
  const [pageData, setPageData] = useState<LandingPageData | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPage() {
      if (!shopSlug || !pageSlug) {
        setError('Page not found');
        setIsLoading(false);
        return;
      }

      // First, get the shop by slug
      const { data: shopData, error: shopError } = await supabase
        .from('shops')
        .select('id, name, slug')
        .eq('slug', shopSlug)
        .maybeSingle();

      if (shopError || !shopData) {
        setError('Shop not found');
        setIsLoading(false);
        return;
      }

      // Then, get the landing page by slug and shop_id
      const { data, error: fetchError } = await supabase
        .from('landing_pages')
        .select(`
          id,
          title,
          content,
          is_published,
          checkout_config,
          product_id,
          shop_id,
          products (
            id,
            name,
            price,
            description
          )
        `)
        .eq('shop_id', shopData.id)
        .eq('slug', pageSlug)
        .eq('is_published', true)
        .maybeSingle();

      if (fetchError || !data) {
        setError('Page not found');
        setIsLoading(false);
        return;
      }

      const pageDataWithShop: LandingPageData = {
        ...data,
        content: data.content as unknown as PageContent | null,
        checkout_config: data.checkout_config as unknown as CheckoutConfig | null,
        shops: shopData,
        products: data.products as LandingPageData['products'],
      };

      setPageData(pageDataWithShop);
      
      if (pageDataWithShop.content?.blocks) {
        setBlocks(pageDataWithShop.content.blocks);
      }
      
      setIsLoading(false);
    }

    fetchPage();
  }, [shopSlug, pageSlug]);

  useEffect(() => {
    if (pageData?.title) {
      document.title = pageData.title;
    }
  }, [pageData?.title]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Page Not Found</h1>
          <p className="text-muted-foreground">The requested page could not be found or is not published.</p>
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
        return (
          <PublicCheckoutSection
            key={block.id}
            block={block}
            pageData={pageData}
          />
        );
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
