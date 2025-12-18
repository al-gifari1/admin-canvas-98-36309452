export type BlockType = 'hero' | 'product-showcase' | 'checkout' | 'testimonials' | 'features' | 'faq';

export interface BlockContent {
  hero?: {
    headline: string;
    subtext: string;
    imageUrl: string;
    ctaText: string;
    ctaUrl: string;
  };
  productShowcase?: {
    title: string;
    description: string;
    price: string;
    imageUrl: string;
    imagePosition: 'left' | 'right';
  };
  checkout?: {
    title: string;
    buttonText: string;
  };
}

export interface Block {
  id: string;
  type: BlockType;
  content: BlockContent;
}

export interface PageContent {
  blocks: Block[];
}

export const DEFAULT_BLOCK_CONTENT: Record<BlockType, BlockContent> = {
  hero: {
    hero: {
      headline: 'Your Amazing Product',
      subtext: 'Transform your life with our revolutionary solution. Limited time offer!',
      imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
      ctaText: 'Order Now',
      ctaUrl: '#checkout',
    },
  },
  'product-showcase': {
    productShowcase: {
      title: 'Premium Quality Product',
      description: 'Experience the difference with our carefully crafted solution. Made with the finest materials and backed by our satisfaction guarantee.',
      price: '৳2,999',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
      imagePosition: 'left',
    },
  },
  checkout: {
    checkout: {
      title: 'Complete Your Order',
      buttonText: 'Place Order',
    },
  },
  testimonials: {},
  features: {},
  faq: {},
};
